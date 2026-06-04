import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getSettings, saveSettings } from '../services/db'
import { useAuth } from './AuthContext'

type Theme = 'light' | 'dark'

interface ThemeCtx { theme: Theme; toggle: () => void }

const ThemeContext = createContext<ThemeCtx>({ theme: 'light', toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [theme, setTheme] = useState<Theme>(() =>
    (localStorage.getItem('foodsnap_theme') as Theme) || 'light'
  )

  // Load theme on mount (localStorage first, then DB)
  useEffect(() => {
    const local = localStorage.getItem('foodsnap_theme') as Theme | null
    if (local) { setTheme(local); return }

    if (user?.id) {
      getSettings(user.id).then(s => {
        if (s?.theme) setTheme(s.theme)
      }).catch(() => {})
    }
  }, [user?.id])

  // Apply theme to DOM + persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('foodsnap_theme', theme)
    if (user?.id) {
      getSettings(user.id).then(s => {
        saveSettings({ ...s, user_id: user.id, theme, notifications: s?.notifications || { dailyReminder: true, weeklyReport: true, recommendations: false, systemNotice: true } })
      }).catch(() => {})
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => setTheme(t => t === 'light' ? 'dark' : 'light') }}>
      {children}
    </ThemeContext.Provider>
  )
}
