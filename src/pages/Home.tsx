import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useFood } from '../contexts/FoodContext'
import type { FoodLog, MealType } from '../types'
import styles from './Home.module.css'

const catColors: Record<MealType, string> = { drink: '#6C8EEF', food: '#F59E0B', snack: '#F472B6', dessert: '#A78BFA' }
const catLabels: Record<MealType, string> = { drink: '饮品', food: '食物', snack: '小吃', dessert: '甜点' }

interface StickerData { date: string; logs: FoodLog[]; count: number }

const Home = () => {
  const navigate = useNavigate()
  const { fetchLogsByMonth } = useFood()
  const [current, setCurrent] = useState(new Date())
  const [stickers, setStickers] = useState<Map<string, FoodLog[]>>(new Map())
  const [filter, setFilter] = useState<MealType | 'all'>('all')
  const [hovered, setHovered] = useState<StickerData | null>(null)
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 })

  useEffect(() => { load() }, [current])

  const load = async () => {
    const y = current.getFullYear(); const m = current.getMonth() + 1
    setStickers(await fetchLogsByMonth(y, m))
  }

  const monthStart = startOfMonth(current)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(endOfMonth(current), { weekStartsOn: 0 })

  const rows: Date[][] = []; let day = calStart
  while (day <= calEnd) {
    const week: Date[] = []
    for (let i = 0; i < 7; i++) { week.push(day); day = addDays(day, 1) }
    rows.push(week)
  }

  const getDayStickers = (d: Date): FoodLog[] => {
    const key = format(d, 'yyyy-MM-dd')
    const logs = stickers.get(key) || []
    return filter === 'all' ? logs : logs.filter(l => l.meal_type === filter)
  }

  const today = new Date()
  const monthStats = { total: 0, days: 0 }
  stickers.forEach((logs) => { monthStats.total += logs.length; if (logs.length > 0) monthStats.days++ })

  const handleCellClick = (d: Date) => {
    navigate(`/date/${format(d, 'yyyy-MM-dd')}`)
  }

  const handleStickerHover = (e: React.MouseEvent, d: Date, logs: FoodLog[]) => {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).closest('[data-cell]')?.getBoundingClientRect()
    if (rect) {
      setHoverPos({ x: rect.left + rect.width / 2, y: rect.top - 8 })
    }
    setHovered({ date: format(d, 'yyyy-MM-dd'), logs, count: logs.length })
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {format(current, 'yyyy年 M月')}
            <span className={styles.yearBadge}>{format(current, 'yyyy')}</span>
          </h1>
          <p className={styles.monthStats}>
            本月 {monthStats.total} 份美食 · 打卡 {monthStats.days} 天
          </p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.filterGroup}>
            {(['all', 'food', 'drink', 'snack', 'dessert'] as const).map(f => (
              <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}>
                {f === 'all' ? '全部' : catLabels[f]}
              </button>
            ))}
          </div>
          <div className={styles.navBtns}>
            <button className={styles.navBtn} onClick={() => setCurrent(subMonths(current, 1))}>‹</button>
            <button className={styles.todayBtn} onClick={() => setCurrent(new Date())}>今天</button>
            <button className={styles.navBtn} onClick={() => setCurrent(addMonths(current, 1))}>›</button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className={styles.weekHeader}>
        {['日', '一', '二', '三', '四', '五', '六'].map(w => (
          <div key={w} className={styles.weekDay}>{w}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={styles.calGrid}>
        {rows.map((week, wi) => (
          <div key={wi} className={styles.calRow}>
            {week.map(d => {
              const dayStickers = getDayStickers(d)
              const inMonth = isSameMonth(d, current)
              const isToday = isSameDay(d, today)
              const displayStickers = dayStickers.slice(0, 3)
              const extra = Math.max(0, dayStickers.length - 3)

              return (
                <div
                  key={d.toISOString()}
                  data-cell
                  className={`${styles.cell} ${!inMonth ? styles.otherMonth : ''} ${isToday ? styles.today : ''}`}
                  onClick={() => handleCellClick(d)}
                  onMouseEnter={e => dayStickers.length > 0 && handleStickerHover(e, d, dayStickers)}
                  onMouseLeave={() => setHovered(null)}
                  onTouchStart={() => { if (dayStickers.length > 0) { setHovered({ date: format(d, 'yyyy-MM-dd'), logs: dayStickers, count: dayStickers.length }) } }}
                  onTouchEnd={() => setTimeout(() => setHovered(null), 1500)}
                >
                  <span className={styles.cellNum}>{format(d, 'd')}</span>
                  {dayStickers.length > 0 && (
                    <div className={styles.stickers}>
                      {displayStickers.map((s, i) => (
                        <div key={s.id} className={styles.sticker} style={{
                          background: catColors[s.meal_type] + '20',
                          borderLeft: `3px solid ${catColors[s.meal_type]}`,
                          zIndex: displayStickers.length - i,
                        }}>
                          <span className={styles.stickerName} style={{ color: catColors[s.meal_type] }}>
                            {s.food_name.length > 4 ? s.food_name.slice(0, 4) + '…' : s.food_name}
                          </span>
                        </div>
                      ))}
                      {extra > 0 && (
                        <span className={styles.extraBadge}>+{extra}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Hover preview popup */}
      {hovered && (
        <div
          className={styles.hoverPopup}
          style={{ left: hoverPos.x, top: hoverPos.y }}
          onMouseEnter={() => setHovered(hovered)}
          onMouseLeave={() => setHovered(null)}
        >
          <div className={styles.popupHeader}>
            <span>{hovered.date}</span>
            <span className={styles.popupCount}>{hovered.count} 份美食</span>
          </div>
          <div className={styles.popupList}>
            {hovered.logs.map(l => (
              <div key={l.id} className={styles.popupItem}>
                <span className={styles.popupName}>{l.food_name}</span>
                <span className={styles.popupCal}>{l.calories} kcal</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
