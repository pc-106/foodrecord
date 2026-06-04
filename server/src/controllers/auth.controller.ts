import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/auth.service.js'
import { registerSchema, loginSchema } from '../utils/validators.js'

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body)
      const result = await authService.register(input)
      res.status(201).json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body)
      const result = await authService.login(input)
      res.json({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId)
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }
}

export const authController = new AuthController()
