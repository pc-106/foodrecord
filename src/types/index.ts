export interface User {
  id: string
  email: string
  nickname: string
  avatar_url: string | null
  bio: string | null
  daily_calorie_goal: number
  daily_protein_goal: number
  daily_carbs_goal: number
  daily_fat_goal: number
  dietary_preferences: string[]
  allergies: string[]
  created_at: string
  updated_at: string
}

export type MealType = 'drink' | 'food' | 'snack' | 'dessert'

export interface FoodLog {
  id: string
  user_id: string
  food_name: string
  meal_type: MealType
  servings: number
  serving_unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  image_url: string | null
  notes: string | null
  is_favorite: boolean
  logged_at: string
  date: string
  created_at: string
  updated_at: string
}

export interface Food {
  id: string
  name: string
  name_en: string
  category: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  serving_sizes: {
    name: string
    grams: number
  }[]
  image_url: string | null
  created_at: string
}

export interface FoodImage {
  id: string
  user_id: string
  food_log_id: string | null
  image_url: string
  processed_image_url: string | null
  created_at: string
}

export interface DailyStats {
  date: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  meals: {
    breakfast: MealStats
    lunch: MealStats
    dinner: MealStats
    snack: MealStats
  }
  goal_percentage: number
}

export interface MealStats {
  calories: number
  protein: number
  carbs: number
  fat: number
  count: number
}

export interface WeeklyStats {
  week_start: string
  week_end: string
  days: DailyStats[]
  average_calories: number
  total_days: number
}

export interface MonthlyStats {
  month: string
  year: number
  total_calories: number
  average_calories: number
  days: DailyStats[]
}
