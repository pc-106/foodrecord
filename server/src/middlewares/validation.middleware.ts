import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

type ValidationTarget = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target])
      req[target] = parsed
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '请求参数验证失败',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        })
        return
      }
      next(error)
    }
  }
}
