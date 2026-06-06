// Web Push 通知服务 — 订阅数据持久化到文件
import fs from 'fs'
import path from 'path'

interface PushSubscription {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

const DB_PATH = path.resolve('../subscriptions.json')
const subscriptions: Map<string, { sub: PushSubscription; userId: string }> = new Map()

// 启动时从文件加载
try {
  if (fs.existsSync(DB_PATH)) {
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
    for (const item of data) {
      subscriptions.set(item.sub.endpoint, item)
    }
    console.log(`📋 已加载 ${subscriptions.size} 个订阅`)
  }
} catch {}

function save() {
  fs.writeFileSync(DB_PATH, JSON.stringify(Array.from(subscriptions.values()), null, 2))
}

export function addSubscription(userId: string, sub: PushSubscription) {
  subscriptions.set(sub.endpoint, { sub, userId })
  save()
}

export function removeSubscription(endpoint: string) {
  subscriptions.delete(endpoint)
  save()
}

export function getAllSubscriptions() {
  return Array.from(subscriptions.values())
}

export function getUserSubscriptions(userId: string) {
  return Array.from(subscriptions.values()).filter(s => s.userId === userId)
}

const reminders = new Map<string, NodeJS.Timeout>()

export function scheduleReminder(userId: string, time: string, callback: () => void) {
  if (reminders.has(userId)) clearTimeout(reminders.get(userId)!)
  const [hours, minutes] = time.split(':').map(Number)
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const ms = target.getTime() - now.getTime()
  const timer = setTimeout(() => { callback(); scheduleReminder(userId, time, callback) }, ms)
  reminders.set(userId, timer)
}

export function cancelReminder(userId: string) {
  if (reminders.has(userId)) { clearTimeout(reminders.get(userId)!); reminders.delete(userId) }
}
