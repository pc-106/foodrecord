import { Request, Response, NextFunction } from 'express'
import { foodService } from '../services/food.service.js'
import { foodLogSchema, paginationSchema } from '../utils/validators.js'

export class FoodController {
  async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const { date } = req.query
      if (!date || typeof date !== 'string') {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '缺少日期参数' },
        })
      }
      const logs = await foodService.getByDate(req.user!.userId, date)
      res.json({ success: true, data: logs })
    } catch (error) {
      next(error)
    }
  }

  async getByMonth(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string)
      const month = parseInt(req.query.month as string)
      if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: '请提供 year 和 month 参数' },
        })
      }
      const logs = await foodService.getByMonth(req.user!.userId, year, month)
      const obj: Record<string, unknown> = {}
      logs.forEach((v, k) => { obj[k] = v })
      res.json({ success: true, data: obj })
    } catch (error) {
      next(error)
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = foodLogSchema.parse(req.body)
      const log = await foodService.create(req.user!.userId, input)
      res.status(201).json({ success: true, data: log })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await foodService.update(req.user!.userId, req.params.id, req.body)
      res.json({ success: true, data: log })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await foodService.delete(req.user!.userId, req.params.id)
      res.json({ success: true, data: null })
    } catch (error) {
      next(error)
    }
  }

  async searchFoods(req: Request, res: Response, next: NextFunction) {
    try {
      const { q = '' } = req.query
      const { page, limit } = paginationSchema.parse(req.query)
      const foods = await foodService.searchFoods(q as string, page, limit)
      res.json({ success: true, data: foods })
    } catch (error) {
      next(error)
    }
  }

  async getPopular(req: Request, res: Response, next: NextFunction) {
    try {
      const foods = await foodService.getPopularFoods()
      res.json({ success: true, data: foods })
    } catch (error) {
      next(error)
    }
  }
}

export const foodController = new FoodController()
