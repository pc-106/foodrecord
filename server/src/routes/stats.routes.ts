import { Router } from 'express'
import { statsController } from '../controllers/stats.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/daily', (req, res, next) => statsController.getDaily(req, res, next))
router.get('/weekly', (req, res, next) => statsController.getWeekly(req, res, next))
router.get('/monthly', (req, res, next) => statsController.getMonthly(req, res, next))

export default router
