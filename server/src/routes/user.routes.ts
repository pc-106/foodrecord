import { Router } from 'express'
import { userController } from '../controllers/user.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.put('/profile', (req, res, next) => userController.updateProfile(req, res, next))

export default router
