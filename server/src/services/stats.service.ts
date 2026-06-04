import prisma from '../config/database.js'

export class StatsService {
  async getDaily(userId: string, date: string) {
    const logs = await prisma.foodLog.findMany({
      where: { userId, date: new Date(date) },
    })

    const user = await prisma.user.findUnique({ where: { id: userId } })

    const meals = { breakfast: mkMealStats(), lunch: mkMealStats(), dinner: mkMealStats(), snack: mkMealStats() }

    for (const log of logs) {
      const m = meals[log.mealType]
      m.calories += log.calories
      m.protein += Number(log.protein)
      m.carbs += Number(log.carbs)
      m.fat += Number(log.fat)
      m.count++
    }

    const totalCal = logs.reduce((s, l) => s + l.calories, 0)

    return {
      date,
      total_calories: totalCal,
      total_protein: logs.reduce((s, l) => s + Number(l.protein), 0),
      total_carbs: logs.reduce((s, l) => s + Number(l.carbs), 0),
      total_fat: logs.reduce((s, l) => s + Number(l.fat), 0),
      meals,
      goal_percentage: user ? Math.round((totalCal / user.dailyCalorieGoal) * 100) : 0,
    }
  }

  async getWeekly(userId: string, startDate: string) {
    const start = new Date(startDate)
    const days = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push(await this.getDaily(userId, d.toISOString().split('T')[0]))
    }

    const avg = days.length > 0 ? days.reduce((s, d) => s + d.total_calories, 0) / days.length : 0

    return {
      week_start: startDate,
      week_end: days[days.length - 1]?.date || startDate,
      days,
      average_calories: Math.round(avg),
      total_days: days.length,
    }
  }

  async getMonthly(userId: string, year: number, month: number) {
    const daysInMonth = new Date(year, month, 0).getDate()
    const days = []

    for (let day = 1; day <= daysInMonth; day++) {
      const d = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push(await this.getDaily(userId, d))
    }

    const total = days.reduce((s, d) => s + d.total_calories, 0)
    const avg = days.length > 0 ? total / days.length : 0

    return {
      month: String(month).padStart(2, '0'),
      year,
      total_calories: total,
      average_calories: Math.round(avg),
      days,
    }
  }
}

function mkMealStats() {
  return { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
}

export const statsService = new StatsService()
