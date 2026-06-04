import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || ''
)

export { supabase }

/* ============ User CRUD ============ */
export interface DBUser {
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
  password_hash: string
  created_at: string
  updated_at: string
}

export async function createUser(user: DBUser) {
  const { error } = await supabase.from('users').insert(user)
  if (error) throw error
}

export async function getUserById(id: string): Promise<DBUser | null> {
  const { data } = await supabase.from('users').select('*').eq('id', id).single()
  return data
}

export async function updateUser(id: string, updates: Partial<DBUser>) {
  const { error } = await supabase.from('users').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function deleteAccount(userId: string) {
  // 顺序删除：food_logs → settings → users
  await supabase.from('food_logs').delete().eq('user_id', userId)
  await supabase.from('settings').delete().eq('user_id', userId)
  const { error } = await supabase.from('users').delete().eq('id', userId)
  if (error) throw error
}

/* ============ FoodLog CRUD ============ */
export interface DBFoodLog {
  id: string
  user_id: string
  food_name: string
  meal_type: string
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

export async function addFoodLog(log: DBFoodLog) {
  const { error } = await supabase.from('food_logs').insert(log)
  if (error) throw error
}

export async function getFoodLogsByDate(userId: string, date: string) {
  const { data } = await supabase.from('food_logs').select('*').eq('user_id', userId).eq('date', date).order('created_at', { ascending: false })
  return (data || []) as DBFoodLog[]
}

export async function getFoodLogsByMonth(userId: string, year: number, month: number) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const { data } = await supabase.from('food_logs').select('*').eq('user_id', userId).gte('date', prefix + '-01').lte('date', prefix + '-31').order('date', { ascending: false })
  const map = new Map<string, DBFoodLog[]>()
  ;(data || []).forEach((log: DBFoodLog) => {
    const arr = map.get(log.date) || []; arr.push(log); map.set(log.date, arr)
  })
  return map
}

export async function updateFoodLog(id: string, updates: Partial<DBFoodLog>) {
  const { error } = await supabase.from('food_logs').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function getFavoriteFoodLogs(userId: string, limit = 50) {
  const { data } = await supabase.from('food_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('date', { ascending: false })
    .limit(limit)
  return (data || []) as DBFoodLog[]
}

export async function deleteFoodLog(id: string) {
  const { error } = await supabase.from('food_logs').delete().eq('id', id)
  if (error) throw error
}

/* ============ Settings CRUD ============ */
export async function getSettings(userId: string) {
  const { data } = await supabase.from('settings').select('*').eq('user_id', userId).single()
  return data
}

export async function saveSettings(s: { user_id: string; theme?: string; notifications?: any }) {
  const { error } = await supabase.from('settings').upsert(s)
  if (error) throw error
}
