import { useEffect, useState } from 'react'
import { useFood } from '../../contexts/FoodContext'
import { useAuth } from '../../contexts/AuthContext'
import styles from './RightPanel.module.css'

const quotes = [
  '今天也要好好吃饭 🍽️',
  '美食是生活里的光 ✨',
  '每一餐都值得记录 📝',
  '好好吃饭，认真生活 🌿',
  '舌尖上的小确幸 💫',
]

const RightPanel = () => {
  const { user } = useAuth()
  const { fetchLogsByMonth } = useFood()
  const [stats, setStats] = useState({ total: 0, shops: 0, days: 0 })
  const [favFoods, setFavFoods] = useState<{ name: string; count: number; meal: string }[]>([])
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)])
  const [weekCals, setWeekCals] = useState<number[]>([0,0,0,0,0,0,0])
  const [catCounts, setCatCounts] = useState<{ key: string; label: string; count: number; color: string }[]>([])

  // 计算本周每天日期
  const today = new Date()
  const weekDay = today.getDay()
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - weekDay + i)
    return d.toISOString().split('T')[0]
  })

  // 加载本周热量数据
  useEffect(() => {
    const loadWeek = async () => {
      const now = new Date()
      const logs = await fetchLogsByMonth(now.getFullYear(), now.getMonth() + 1)
      const cals = weekDates.map(date => {
        const items = logs.get(date) || []
        return items.reduce((s: number, l: any) => s + l.calories, 0)
      })
      setWeekCals(cals)
    }
    loadWeek()
  }, [])

  useEffect(() => {
    const load = async () => {
      const now = new Date()
      const logs = await fetchLogsByMonth(now.getFullYear(), now.getMonth() + 1)
      let total = 0
      const shops = new Set<string>()
      const days = new Set<string>()
      const foodMap = new Map<string, { count: number; meal: string }>()
      logs.forEach((items, date) => {
        total += items.length; days.add(date)
        items.forEach(item => {
          shops.add(item.food_name)
          const f = foodMap.get(item.food_name) || { count: 0, meal: item.meal_type }
          f.count++; foodMap.set(item.food_name, f)
          foodMap.set(item.food_name, f)
        })
      })
      setStats({ total, shops: shops.size, days: days.size })
      // 计算分类占比
      const catMap: Record<string, number> = { drink: 0, food: 0, snack: 0, dessert: 0 }
      logs.forEach(items => items.forEach(item => { catMap[item.meal_type] = (catMap[item.meal_type] || 0) + 1 }))
      setCatCounts([
        { key:'food', label:'食物', count:catMap.food, color:'#F59E0B' },
        { key:'drink', label:'饮品', count:catMap.drink, color:'#6C8EEF' },
        { key:'snack', label:'小吃', count:catMap.snack, color:'#F472B6' },
        { key:'dessert', label:'甜点', count:catMap.dessert, color:'#A78BFA' },
      ].filter(c => c.count > 0).sort((a,b) => b.count - a.count))
      const sorted = Array.from(foodMap.entries()).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count)
      setFavFoods(sorted.slice(0, 4))
    }
    load()
  }, [])

  const goal = user?.daily_calorie_goal || 2000

  return (
    <aside className={styles.panel}>
      {/* 每日寄语 */}
      <div className={styles.quoteCard}>
        <p>{quote}</p>
      </div>

      {/* 月度统计 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>本月食记</h3>
        <div className={styles.statRow}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{stats.total}</span>
            <span className={styles.statLbl}>份美食</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{stats.days}</span>
            <span className={styles.statLbl}>打卡天</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{stats.shops}</span>
            <span className={styles.statLbl}>种类</span>
          </div>
        </div>
      </div>

      {/* 本周进度 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>本周目标</h3>
        <div className={styles.weekProgress}>
          <div className={styles.weekProgressTop}>
            <span>打卡进度</span>
            <span className={styles.weekProgressVal}>{weekCals.filter(c => c > 0).length}/7天</span>
          </div>
          <div className={styles.weekProgressBar}>
            <div className={styles.weekProgressFill} style={{width:`${(weekCals.filter(c => c > 0).length/7)*100}%`}}/>
          </div>
        </div>
        <div className={styles.goalRow}>
          <span className={styles.goalLabel}>日热量目标</span>
          <span className={styles.goalVal}>{goal} kcal</span>
        </div>
        <div className={styles.weekDots}>
          {['日','一','二','三','四','五','六'].map((d, i) => (
            <div key={i}
              className={`${styles.dot} ${i <= weekDay && weekCals[i] > 0 ? styles.dotDone : ''} ${i === weekDay ? styles.dotToday : ''}`}
              title={`${weekDates[i]}: ${weekCals[i]} / ${goal} kcal`}
            >
              <span>{d}</span>
              <span className={styles.dotCal}>
                {weekCals[i] > 0 ? weekCals[i] : ''}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 热门美食 */}
      {favFoods.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>本月最爱</h3>
          <div className={styles.favList}>
            {favFoods.map((f, i) => (
              <div key={i} className={styles.favItem}>
                <span className={styles.favDot} />
                <span className={styles.favName}>{f.name}</span>
                <span className={styles.favCount}>{f.count}次</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分类占比 */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>美食分类</h3>
        {catCounts.length > 0 ? (
          <>
            <div className={styles.donutWrap}>
              <svg viewBox="0 0 100 100" className={styles.donut}>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-subtle)" strokeWidth="12" />
                {(() => {
                  const total = catCounts.reduce((s, c) => s + c.count, 0) || 1
                  const circ = 2 * Math.PI * 40
                  let accumulated = 0
                  return catCounts.map((c, i) => {
                    const pct = c.count / total
                    const dash = pct * circ
                    const rotation = (accumulated / circ) * 360 - 90
                    accumulated += dash
                    return <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={c.color} strokeWidth="12"
                      strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="butt"
                      transform={`rotate(${rotation} 50 50)`}
                    />
                  })
                })()}
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.donutNum}>{stats.total}</span>
                <span className={styles.donutLbl}>总计</span>
              </div>
            </div>
            <div className={styles.legend}>
              {catCounts.map(c => {
                const total = catCounts.reduce((s, x) => s + x.count, 0) || 1
                const pct = Math.round((c.count / total) * 100)
                return (
                  <span key={c.key} title={`${c.label}: ${c.count}份 (${pct}%)`}>
                    <i style={{background:c.color}} /> {c.label} {pct}%
                  </span>
                )
              })}
            </div>
          </>
        ) : (
          <p className={styles.noData}>暂无数据</p>
        )}
      </div>
    </aside>
  )
}

export default RightPanel
