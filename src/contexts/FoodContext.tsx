import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { addFoodLog as dbAdd, getFoodLogsByDate, getFoodLogsByMonth, updateFoodLog as dbUpdate, deleteFoodLog as dbDelete } from '../services/db'
import type { DBFoodLog } from '../services/db'
import type { FoodLog, Food } from '../types'

interface FoodContextType {
  logs: FoodLog[]
  isLoading: boolean
  error: string | null
  fetchLogsByDate: (date: string) => Promise<void>
  fetchLogsByMonth: (year: number, month: number) => Promise<Map<string, FoodLog[]>>
  addFoodLog: (data: Omit<FoodLog, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateFoodLog: (id: string, data: Partial<FoodLog>) => void
  deleteFoodLog: (id: string) => void
  searchFoods: (query: string) => Promise<Food[]>
  getPopularFoods: () => Promise<Food[]>
}

const FoodContext = createContext<FoodContextType | undefined>(undefined)
export const useFood = () => { const c = useContext(FoodContext); if (!c) throw new Error(); return c }

const mockFoods: Food[] = [
  { id: '1', name: '拿铁咖啡', name_en: 'Latte', category: '饮品', calories_per_100g: 56, protein_per_100g: 2.8, carbs_per_100g: 5.4, fat_per_100g: 2.5, serving_sizes: [{ name: '中杯', grams: 350 }], image_url: null, created_at: '' },
  { id: '2', name: '白米饭', name_en: 'Rice', category: '食物', calories_per_100g: 116, protein_per_100g: 2.6, carbs_per_100g: 25.6, fat_per_100g: 0.3, serving_sizes: [{ name: '碗', grams: 200 }], image_url: null, created_at: '' },
  { id: '3', name: '薯条', name_en: 'Fries', category: '小吃', calories_per_100g: 312, protein_per_100g: 3.4, carbs_per_100g: 41, fat_per_100g: 15, serving_sizes: [{ name: '中份', grams: 120 }], image_url: null, created_at: '' },
  { id: '4', name: '巧克力蛋糕', name_en: 'Chocolate Cake', category: '甜点', calories_per_100g: 370, protein_per_100g: 5, carbs_per_100g: 42, fat_per_100g: 20, serving_sizes: [{ name: '块', grams: 100 }], image_url: null, created_at: '' },
  { id: '5', name: '可乐', name_en: 'Cola', category: '饮品', calories_per_100g: 42, protein_per_100g: 0, carbs_per_100g: 10.6, fat_per_100g: 0, serving_sizes: [{ name: '罐', grams: 330 }], image_url: null, created_at: '' },
  { id: '6', name: '鸡胸肉', name_en: 'Chicken Breast', category: '食物', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, serving_sizes: [{ name: '份', grams: 150 }], image_url: null, created_at: '' },
  { id: '7', name: '薯片', name_en: 'Chips', category: '小吃', calories_per_100g: 536, protein_per_100g: 7, carbs_per_100g: 49, fat_per_100g: 35, serving_sizes: [{ name: '包', grams: 50 }], image_url: null, created_at: '' },
  { id: '8', name: '冰淇淋', name_en: 'Ice Cream', category: '甜点', calories_per_100g: 207, protein_per_100g: 3.5, carbs_per_100g: 24, fat_per_100g: 11, serving_sizes: [{ name: '球', grams: 80 }], image_url: null, created_at: '' },
  { id: '9', name: '橙汁', name_en: 'Orange Juice', category: '饮品', calories_per_100g: 45, protein_per_100g: 0.7, carbs_per_100g: 10, fat_per_100g: 0.2, serving_sizes: [{ name: '杯', grams: 250 }], image_url: null, created_at: '' },
  { id: '10', name: '三明治', name_en: 'Sandwich', category: '食物', calories_per_100g: 250, protein_per_100g: 12, carbs_per_100g: 30, fat_per_100g: 9, serving_sizes: [{ name: '个', grams: 180 }], image_url: null, created_at: '' },
  { id: '11', name: '蛋挞', name_en: 'Egg Tart', category: '甜点', calories_per_100g: 296, protein_per_100g: 5.2, carbs_per_100g: 32, fat_per_100g: 16, serving_sizes: [{ name: '个', grams: 60 }], image_url: null, created_at: '' },
  { id: '12', name: '坚果', name_en: 'Nuts', category: '小吃', calories_per_100g: 607, protein_per_100g: 20, carbs_per_100g: 16, fat_per_100g: 54, serving_sizes: [{ name: '把', grams: 30 }], image_url: null, created_at: '' },
]

function toFoodLog(db: DBFoodLog): FoodLog {
  return {
    id: db.id, user_id: db.user_id ?? '', food_name: db.food_name,
    meal_type: db.meal_type as any, servings: db.servings, serving_unit: db.serving_unit,
    calories: db.calories, protein: db.protein, carbs: db.carbs, fat: db.fat,
    image_url: db.image_url, notes: db.notes, is_favorite: db.is_favorite,
    logged_at: db.logged_at, date: db.date,
    created_at: db.created_at, updated_at: db.updated_at,
  }
}

const monthCache = new Map<string, Map<string, FoodLog[]>>()

const FoodProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const uid = user?.id || 'anonymous'
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error] = useState<string | null>(null)
  const prevUid = React.useRef(uid)

  // 用户切换时清除缓存和状态，防止数据混淆
  if (prevUid.current !== uid) {
    monthCache.clear()
    setLogs([])
    prevUid.current = uid
  }

  const fetchLogsByDate = async (date: string) => {
    setIsLoading(true)
    try {
      const result = await getFoodLogsByDate(uid, date)
      setLogs(result.map(toFoodLog))
    } catch {}
    setIsLoading(false)
  }

  const fetchLogsByMonth = async (year: number, month: number): Promise<Map<string, FoodLog[]>> => {
    const key = `${uid}_${year}_${String(month).padStart(2,'0')}`
    const cached = monthCache.get(key)
    if (cached) return cached

    try {
      const result = await getFoodLogsByMonth(uid, year, month)
      const map = new Map<string, FoodLog[]>()
      result.forEach((v, k) => map.set(k, v.map(toFoodLog)))
      monthCache.set(key, map)
      return map
    } catch { return new Map() }
  }

  const updateMonthCache = (date: string, log: FoodLog) => {
    const [y, m] = date.split('-')
    const key = `${uid}_${y}_${m}`
    const cached = monthCache.get(key)
    if (cached) {
      const arr = cached.get(date) || []
      arr.push(log)
      cached.set(date, arr)
    }
  }

  const addFoodLog = async (data: Omit<FoodLog, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true)
    try {
      const now = new Date().toISOString()
      const dbLog: DBFoodLog = {
        id: Date.now().toString(),
        user_id: uid,
        food_name: data.food_name,
        meal_type: data.meal_type,
        servings: data.servings,
        serving_unit: data.serving_unit,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        image_url: data.image_url,
        notes: data.notes,
        is_favorite: data.is_favorite ?? false,
        logged_at: data.logged_at,
        date: data.date,
        created_at: now,
        updated_at: now,
      }
      await dbAdd(dbLog)
      const nl = toFoodLog(dbLog)
      setLogs(prev => [...prev, nl])
      updateMonthCache(data.date, nl)
    } catch {}
    setIsLoading(false)
  }

  const updateFoodLog = (id: string, data: Partial<FoodLog>) => {
    dbUpdate(id, data)
    setLogs(prev => prev.map(l => l.id === id ? { ...l, ...data, updated_at: new Date().toISOString() } : l))
  }

  const deleteFoodLog = (id: string) => {
    dbDelete(id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const searchFoods = async (q: string): Promise<Food[]> => {
    await new Promise(r => setTimeout(r, 50))
    if (!q.trim()) return mockFoods.slice(0, 6)
    return mockFoods.filter(f => f.name.includes(q) || f.name_en.toLowerCase().includes(q.toLowerCase()) || f.category.includes(q))
  }

  const getPopularFoods = async () => { await new Promise(r => setTimeout(r, 50)); return mockFoods }

  return (
    <FoodContext.Provider value={{ logs, isLoading, error, fetchLogsByDate, fetchLogsByMonth, addFoodLog, updateFoodLog, deleteFoodLog, searchFoods, getPopularFoods }}>
      {children}
    </FoodContext.Provider>
  )
}

export const FoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => <FoodProviderInner>{children}</FoodProviderInner>
