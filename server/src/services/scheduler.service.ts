import webpush from 'web-push'
import { supabase } from '../config/database.js'
import { getAllSubscriptions } from './notification.service.js'

webpush.setVapidDetails(
  'mailto:admin@foodrecord.app',
  process.env.VITE_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

async function sendToAll(title: string, body: string) {
  const subs = getAllSubscriptions()
  if (subs.length === 0) return
  const payload = JSON.stringify({ title, body })
  for (const { sub } of subs) {
    try { await webpush.sendNotification(sub, payload) } catch {}
  }
  // 存入 Supabase
  await supabase.from('notifications').insert({ title, body, read: false })
}

function getNextTime(hour: number, minute: number): Date {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target
}

function getNextMonday10am(): Date {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0)
  // 找到下个周一
  const dayOfWeek = target.getDay()
  const daysUntilMonday = dayOfWeek === 1 ? (target <= now ? 7 : 0) : (8 - dayOfWeek) % 7 || 7
  target.setDate(target.getDate() + daysUntilMonday)
  if (target <= now) target.setDate(target.getDate() + 7)
  return target
}

let dailyTimer: NodeJS.Timeout | null = null
let weeklyTimer: NodeJS.Timeout | null = null

function scheduleDaily() {
  const target = getNextTime(20, 0) // 每天 20:00
  const ms = target.getTime() - Date.now()
  dailyTimer = setTimeout(() => {
    sendToAll('🍽️ 打卡提醒', '今天的美食记录了吗？别忘了打卡哦～')
    scheduleDaily() // 递归，明天同一时间再触发
  }, ms)
  console.log(`  ⏰ 下次打卡提醒: ${target.toLocaleString('zh-CN')}`)
}

function scheduleWeekly() {
  const target = getNextMonday10am()
  const ms = target.getTime() - Date.now()
  weeklyTimer = setTimeout(() => {
    sendToAll('📊 周报已生成', '新的一周开始了，上周的食记统计已更新，点击查看 →')
    scheduleWeekly()
  }, ms)
  console.log(`  📊 下次周报推送: ${target.toLocaleString('zh-CN')}`)
}

export function startScheduler() {
  scheduleDaily()
  scheduleWeekly()
}

export function stopScheduler() {
  if (dailyTimer) clearTimeout(dailyTimer)
  if (weeklyTimer) clearTimeout(weeklyTimer)
}
