import prisma from '../config/database.js'
import { AppError, NotFoundError } from '../middlewares/error.middleware.js'
import type { FoodLogInput } from '../utils/validators.js'

export class FoodService {
  async getByDate(userId: string, date: string) {
    return prisma.foodLog.findMany({
      where: { userId, date: new Date(date) },
      orderBy: { loggedAt: 'asc' },
    })
  }

  async getByMonth(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0)

    const logs = await prisma.foodLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    })

    const grouped = new Map<string, typeof logs>()
    for (const log of logs) {
      const key = log.date.toISOString().split('T')[0]
      const group = grouped.get(key) || []
      group.push(log)
      grouped.set(key, group)
    }

    return grouped
  }

  async create(userId: string, input: FoodLogInput) {
    return prisma.foodLog.create({
      data: {
        userId,
        foodName: input.food_name,
        mealType: input.meal_type,
        servings: input.servings,
        servingUnit: input.serving_unit,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        imageUrl: input.image_url || null,
        notes: input.notes || null,
        date: new Date(input.date),
        loggedAt: input.logged_at ? new Date(input.logged_at) : new Date(),
      },
    })
  }

  async update(userId: string, logId: string, data: Partial<FoodLogInput>) {
    const log = await prisma.foodLog.findFirst({
      where: { id: logId, userId },
    })
    if (!log) throw new NotFoundError('饮食记录')

    return prisma.foodLog.update({
      where: { id: logId },
      data: {
        ...(data.food_name !== undefined && { foodName: data.food_name }),
        ...(data.meal_type !== undefined && { mealType: data.meal_type }),
        ...(data.servings !== undefined && { servings: data.servings }),
        ...(data.calories !== undefined && { calories: data.calories }),
        ...(data.protein !== undefined && { protein: data.protein }),
        ...(data.carbs !== undefined && { carbs: data.carbs }),
        ...(data.fat !== undefined && { fat: data.fat }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    })
  }

  async delete(userId: string, logId: string) {
    const log = await prisma.foodLog.findFirst({
      where: { id: logId, userId },
    })
    if (!log) throw new NotFoundError('饮食记录')

    await prisma.foodLog.delete({ where: { id: logId } })
  }

  async searchFoods(query: string, page: number, limit: number) {
    if (!query.trim()) {
      return prisma.food.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { name: 'asc' },
      })
    }

    return prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { nameEn: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      skip: (page - 1) * limit,
    })
  }

  async getPopularFoods(limit = 10) {
    return prisma.food.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const foodService = new FoodService()
