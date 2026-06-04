import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase, getUserById, updateUser } from '../services/db'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, nickname: string) => Promise<void>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error(); return c }

function simpleHash(s: string): string {
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return String(Math.abs(h)).padStart(10, '0')
}

function mapUser(u: any): User {
  return {
    id: u.id, email: u.email, nickname: u.nickname,
    avatar_url: u.avatar_url || null, bio: u.bio || null,
    daily_calorie_goal: u.daily_calorie_goal || 2000,
    daily_protein_goal: u.daily_protein_goal || 150,
    daily_carbs_goal: u.daily_carbs_goal || 250,
    daily_fat_goal: u.daily_fat_goal || 65,
    dietary_preferences: u.dietary_preferences || [],
    allergies: u.allergies || [],
    created_at: u.created_at || '', updated_at: u.updated_at || '',
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 快速加载：先读缓存，后同步数据库
  useEffect(() => {
    const cache = localStorage.getItem('foodsnap_user_cache')
    const id = localStorage.getItem('foodsnap_user_id')
    if (cache && id) {
      setUser(mapUser(JSON.parse(cache)))
      setIsLoading(false) // 立即显示界面
    }
    // 后台同步数据库最新数据
    if (id) {
      getUserById(id).then(u => {
        if (u) {
          const userData = mapUser(u)
          setUser(userData)
          localStorage.setItem('foodsnap_user_cache', JSON.stringify(userData))
        }
      }).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true); setError(null)
    try {
      const { data } = await supabase.from('users').select('*').eq('email', email).single()
      if (!data) { setError('账户不存在'); setIsLoading(false); return }
      if (data.password_hash !== simpleHash(password)) { setError('密码错误'); setIsLoading(false); return }
      const userData = mapUser(data)
      setUser(userData)
      localStorage.setItem('foodsnap_user_id', userData.id)
      localStorage.setItem('foodsnap_user_cache', JSON.stringify(userData))
    } catch (e: any) {
      setError('登录失败: ' + e.message)
    }
    setIsLoading(false)
  }

  const register = async (email: string, password: string, nickname: string) => {
    setIsLoading(true); setError(null)
    try {
      const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
      if (existing) { setError('该邮箱已注册'); setIsLoading(false); return }
      const id = 'u_' + Date.now().toString(36)
      const now = new Date().toISOString()
      const { error: insertErr } = await supabase.from('users').insert({
        id, email, nickname, bio: null, avatar_url: null,
        daily_calorie_goal: 2000, daily_protein_goal: 150,
        daily_carbs_goal: 250, daily_fat_goal: 65,
        dietary_preferences: [], allergies: [],
        password_hash: simpleHash(password),
        created_at: now, updated_at: now,
      })
      if (insertErr) { setError('注册失败: ' + insertErr.message); setIsLoading(false); return }
      const userData = mapUser({ id, email, nickname, bio: null, avatar_url: null, daily_calorie_goal: 2000, daily_protein_goal: 150, daily_carbs_goal: 250, daily_fat_goal: 65 })
      setUser(userData)
      localStorage.setItem('foodsnap_user_id', id)
      localStorage.setItem('foodsnap_user_cache', JSON.stringify(userData))
    } catch (e: any) {
      setError('注册失败: ' + e.message)
    }
    setIsLoading(false)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('foodsnap_user_id')
    localStorage.removeItem('foodsnap_user_cache')
    localStorage.removeItem('foodsnap_theme')
    sessionStorage.removeItem('foodsnap_pending_image')
  }

  const updateProfile = (data: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...data, updated_at: new Date().toISOString() }
    setUser(updated)
    localStorage.setItem('foodsnap_user_cache', JSON.stringify(updated))
    updateUser(user.id, data).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
