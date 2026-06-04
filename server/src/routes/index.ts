import { Router } from 'express'
import authRoutes from './auth.routes.js'
import foodRoutes from './food.routes.js'
import statsRoutes from './stats.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/food-logs', foodRoutes)
router.use('/foods', foodRoutes)
router.use('/stats', statsRoutes)
router.use('/users', userRoutes)

// 健康检查
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
