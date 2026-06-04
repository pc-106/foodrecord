import prisma from '../config/database.js'
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js'
import { signToken } from '../utils/jwt.util.js'
import { AppError } from '../middlewares/error.middleware.js'
import type { RegisterInput, LoginInput } from '../utils/validators.js'

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    })
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', '该邮箱已被注册')
    }

    const passwordHash = await hashPassword(input.password)

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        nickname: input.nickname || input.email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbsGoal: true,
        dailyFatGoal: true,
        dietaryPreferences: true,
        allergies: true,
        createdAt: true,
      },
    })

    const token = signToken({ userId: user.id, email: user.email })

    return { user, token }
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '邮箱或密码错误')
    }

    const valid = await comparePassword(input.password, user.passwordHash)
    if (!valid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', '邮箱或密码错误')
    }

    const token = signToken({ userId: user.id, email: user.email })

    const { passwordHash, ...safeUser } = user
    return { user: safeUser, token }
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        dailyCalorieGoal: true,
        dailyProteinGoal: true,
        dailyCarbsGoal: true,
        dailyFatGoal: true,
        dietaryPreferences: true,
        allergies: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', '用户不存在')
    }
    return user
  }
}

export const authService = new AuthService()
