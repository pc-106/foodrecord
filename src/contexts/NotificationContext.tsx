import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/db'

interface Notification {
  id: number
  title: string
  body: string
  read: boolean
  created_at: string
}

interface NotificationCtx {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: number) => void
  markAllRead: () => void
  removeNotification: (id: number) => void
}

const Ctx = createContext<NotificationCtx>({ notifications: [], unreadCount: 0, markRead: () => {}, markAllRead: () => {}, removeNotification: () => {} })
export const useNotifications = () => useContext(Ctx)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase.from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    if (data) setNotifications(data as Notification[])
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  useEffect(() => {
    const t = setInterval(fetchNotifications, 15000)
    return () => clearInterval(t)
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markRead = async (id: number) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.read).map(n => n.id)
    if (!ids.length) return
    await supabase.from('notifications').update({ read: true }).in('id', ids)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <Ctx.Provider value={{ notifications, unreadCount, markRead, markAllRead, removeNotification }}>
      {children}
    </Ctx.Provider>
  )
}
