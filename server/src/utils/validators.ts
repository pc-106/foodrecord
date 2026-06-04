import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6个字符').max(100),
  nickname: z.string().min(1, '昵称不能为空').max(50).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(1, '请输入密码'),
})

export const foodLogSchema = z.object({
  food_name: z.string().min(1),
  meal_type: z.enum(['drink', 'food', 'snack', 'dessert']),
  servings: z.number().positive().default(1),
  serving_unit: z.string().default('份'),
  calories: z.number().int().positive(),
  protein: z.number().default(0),
  carbs: z.number().default(0),
  fat: z.number().default(0),
  image_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  logged_at: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD'),
})

export const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(50).optional(),
  daily_calorie_goal: z.number().int().positive().optional(),
  daily_protein_goal: z.number().int().positive().optional(),
  daily_carbs_goal: z.number().int().positive().optional(),
  daily_fat_goal: z.number().int().positive().optional(),
  dietary_preferences: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
})

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type FoodLogInput = z.infer<typeof foodLogSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
