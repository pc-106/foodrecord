import express from 'express'
import cors from 'cors'
import { config } from './config/index.js'
import routes from './routes/index.js'
import { errorMiddleware } from './middlewares/error.middleware.js'

const app = express()

// 基础中间件
app.use(cors({ origin: config.cors.origin, credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 请求日志 (开发环境)
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
  })
}

// API 路由
app.use('/api', routes)

// 全局错误处理
app.use(errorMiddleware)

export default app
