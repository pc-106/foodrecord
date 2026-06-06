import app from './app.js'
import { config } from './config/index.js'
import { scheduleReminder, scheduleWeeklyReport, startScheduler } from './services/scheduler.service.js'

app.listen(config.port, () => {
  console.log(`\n  🍽️  FoodSnap API Server`)
  console.log(`  ──────────────────────────────`)
  console.log(`  Mode:      ${config.nodeEnv}`)
  console.log(`  Port:      ${config.port}`)
  console.log(`  URL:       http://localhost:${config.port}`)
  console.log(`  Health:    http://localhost:${config.port}/api/health`)
  console.log(`  Admin:     http://localhost:${config.port}/admin`)
  console.log(`  ──────────────────────────────\n`)

  // 启动定时任务
  startScheduler()
  console.log(`  ⏰ 每日打卡提醒: 每天 20:00`)
  console.log(`  📊 周报推送:     每周一 10:00`)
  console.log(`  ──────────────────────────────\n`)
})
