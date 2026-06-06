// 开发者推送工具 — 命令行发送通知给所有用户
// 用法: cd server && npx tsx src/send-notification.ts "记得打卡哦 🍽️"

import webpush from 'web-push'
import { config } from './config/index.js'

const PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY || ''
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''

webpush.setVapidDetails(
  'mailto:admin@foodrecord.app',
  PUBLIC_KEY,
  PRIVATE_KEY
)

// 获取订阅列表（从后端内存）
// 实际项目中应该存数据库
const subscriptions = (globalThis as any).__pushSubscriptions || []

const title = process.argv[2] || '食记簿'
const body = process.argv[3] || '记得记录今天的美食哦 🍽️'

async function send() {
  if (subscriptions.length === 0) {
    console.log('⚠️  暂无订阅用户')
    return
  }

  console.log(`📤 发送推送给 ${subscriptions.length} 个用户...`)

  const payload = JSON.stringify({ title, body })
  const results = await Promise.allSettled(
    subscriptions.map((sub: any) =>
      webpush.sendNotification(sub, payload).catch(() => null)
    )
  )

  const success = results.filter(r => r.status === 'fulfilled').length
  console.log(`✅ 成功: ${success} | ❌ 失败: ${results.length - success}`)
}

send()
