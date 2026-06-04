import { Request, Response, NextFunction } from 'express'
import { userService } from '../services/user.service.js'
import { updateProfileSchema } from '../utils/validators.js'

export class UserController {
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateProfileSchema.parse(req.body)
      const user = await userService.updateProfile(req.user!.userId, input)
      res.json({ success: true, data: user })
    } catch (error) {
      next(error)
    }
  }
}

export const userController = new UserController()
