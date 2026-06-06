import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import webpush from 'web-push'
import { supabase } from '../config/database.js'
import { processImage } from '../services/image.service.js'
import { analyzeNutrition } from '../services/nutrition.service.js'
import { addSubscription, removeSubscription, getAllSubscriptions } from '../services/notification.service.js'

webpush.setVapidDetails(
  'mailto:admin@foodrecord.app',
  process.env.VITE_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

const router = Router()
const upload = multer({ dest: path.resolve('../temp_uploads'), limits: { fileSize: 10 * 1024 * 1024 } })

// ─── 健康检查 ───
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 图片上传处理 ───
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请上传图片' })
    const url = await processImage(req.file.path, req.file.originalname)
    res.json({ url, success: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─── AI 营养分析 ───
router.post('/nutrition/analyze', async (req, res) => {
  const { foodName, mealType, servings, calories } = req.body
  if (!foodName) return res.status(400).json({ error: '请输入食物名称' })
  const result = await analyzeNutrition({ foodName, mealType: mealType || 'food', servings: servings || 1, calories: calories || 0 })
  res.json(result)
})

// ─── 食物搜索 ───
router.get('/foods/search', async (req, res) => {
  const q = (req.query.q as string || '').trim()
  if (!q) return res.json([])
  const { data } = await supabase.from('food_logs')
    .select('id, food_name, meal_type, calories, date, image_url')
    .ilike('food_name', `%${q}%`)
    .order('date', { ascending: false })
    .limit(20)
  res.json(data || [])
})

// ─── 推送通知 ───
router.post('/notifications/subscribe', (req, res) => {
  const { userId, subscription } = req.body
  if (!userId || !subscription) return res.status(400).json({ error: '缺少参数' })
  addSubscription(userId, subscription)
  console.log(`🔔 新订阅: ${userId} (当前共 ${getAllSubscriptions().length} 人)`)
  res.json({ success: true })
})

router.post('/notifications/unsubscribe', (req, res) => {
  const { endpoint } = req.body
  removeSubscription(endpoint)
  res.json({ success: true })
})

// ─── 查看订阅列表 ───
router.get('/notifications/subscribers', (_req, res) => {
  const subs = getAllSubscriptions()
  res.json({ count: subs.length, subscribers: subs.map(s => ({ userId: s.userId })) })
})

// ─── 开发者广播通知 ───
router.post('/notifications/broadcast', async (req, res) => {
  const { title, body } = req.body
  const subs = getAllSubscriptions()
  const payload = JSON.stringify({ title: title || '食记簿', body: body || '记得记录今天的美食' })
  let sent = 0
  for (const { sub } of subs) {
    try { await webpush.sendNotification(sub, payload); sent++ } catch {}
  }
  // 保存到 Supabase
  await supabase.from('notifications').insert({
    title: title || '食记簿',
    body: body || '记得记录今天的美食',
    read: false,
  })
  res.json({ sent, total: subs.length })
})

export default router
