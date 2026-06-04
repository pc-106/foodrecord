import app from './app.js'
import { config } from './config/index.js'

app.listen(config.port, () => {
  console.log(`\n  🍽️  FoodSnap API Server`)
  console.log(`  ──────────────────────────────`)
  console.log(`  Mode:      ${config.nodeEnv}`)
  console.log(`  Port:      ${config.port}`)
  console.log(`  URL:       http://localhost:${config.port}`)
  console.log(`  Health:    http://localhost:${config.port}/api/health`)
  console.log(`  ──────────────────────────────\n`)
})
