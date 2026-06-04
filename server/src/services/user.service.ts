import prisma from '../config/database.js'
import { NotFoundError } from '../middlewares/error.middleware.js'
import type { UpdateProfileInput } from '../utils/validators.js'

export class UserService {
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundError('用户')

    const data: Record<string, unknown> = {}
    if (input.nickname !== undefined) data.nickname = input.nickname
    if (input.daily_calorie_goal !== undefined) data.dailyCalorieGoal = input.daily_calorie_goal
    if (input.daily_protein_goal !== undefined) data.dailyProteinGoal = input.daily_protein_goal
    if (input.daily_carbs_goal !== undefined) data.dailyCarbsGoal = input.daily_carbs_goal
    if (input.daily_fat_goal !== undefined) data.dailyFatGoal = input.daily_fat_goal
    if (input.dietary_preferences !== undefined) data.dietaryPreferences = input.dietary_preferences
    if (input.allergies !== undefined) data.allergies = input.allergies

    return prisma.user.update({
      where: { id: userId },
      data,
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
      },
    })
  }
}

export const userService = new UserService()
