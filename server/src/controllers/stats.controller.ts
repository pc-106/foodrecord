import { Request, Response, NextFunction } from 'express'
import { statsService } from '../services/stats.service.js'

export class StatsController {
  async getDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query
      if (!date || typeof date !== 'string') {
        return res.status(400).json({
          success: false,
          error: { message: '缺少 date 参数' },
        })
      }
      const stats = await statsService.getDaily(req.user!.userId, date)
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }

  async getWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate } = req.query
      if (!startDate || typeof startDate !== 'string') {
        return res.status(400).json({
          success: false,
          error: { message: '缺少 startDate 参数' },
        })
      }
      const stats = await statsService.getWeekly(req.user!.userId, startDate)
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }

  async getMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string)
      const month = parseInt(req.query.month as string)
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({
          success: false,
          error: { message: '请提供 year 和 month 参数' },
        })
      }
      const stats = await statsService.getMonthly(req.user!.userId, year, month)
      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }
}

export const statsController = new StatsController()
