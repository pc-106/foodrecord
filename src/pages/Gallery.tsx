import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useFood } from '../contexts/FoodContext'
import type { FoodLog, MealType } from '../types'
import { FoodIcon } from '../components/common/Icons'
import { getFoodImage } from '../utils/foodImages'
import styles from './Gallery.module.css'

const catColors: Record<MealType, string> = { drink: '#6C8EEF', food: '#F59E0B', snack: '#F472B6', dessert: '#A78BFA' }
const catLabels: Record<MealType, string> = { drink: '饮品', food: '食物', snack: '小吃', dessert: '甜点' }

interface GalleryItem { date: string; log: FoodLog }

const Gallery = () => {
  const { fetchLogsByMonth, deleteFoodLog, updateFoodLog } = useFood()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''
  const [items, setItems] = useState<GalleryItem[]>([])
  const [filter, setFilter] = useState<MealType | 'all'>('all')
  const [ctxMenu, setCtxMenu] = useState<{ x:number; y:number; log:FoodLog } | null>(null)
  const [detail, setDetail] = useState<{ date:string; log:FoodLog } | null>(null)

  const load = async () => {
    const now = new Date()
    const logs = await fetchLogsByMonth(now.getFullYear(), now.getMonth() + 1)
    const all: GalleryItem[] = []
    logs.forEach((dayLogs, date) => {
      dayLogs.forEach(log => all.push({ date, log }))
    })
    setItems(all.sort((a, b) => b.date.localeCompare(a.date)))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    let result = filter === 'all' ? items : items.filter(i => i.log.meal_type === filter)
    if (searchQuery) {
      result = result.filter(i => i.log.food_name.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return result
  }, [items, filter, searchQuery])

  const grouped = new Map<string, GalleryItem[]>()
  filtered.forEach(item => {
    const g = grouped.get(item.date) || []; g.push(item); grouped.set(item.date, g)
  })

  const handleContext = (e: React.MouseEvent, log: FoodLog) => {
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY, log })
  }

  const handleDelete = () => {
    if (ctxMenu) {
      deleteFoodLog(ctxMenu.log.id)
      setItems(prev => prev.filter(i => i.log.id !== ctxMenu.log.id))
      setCtxMenu(null)
    }
  }

  // Close menu on any click
  const closeMenu = () => setCtxMenu(null)

  const toggleFav = (e: React.MouseEvent, log: FoodLog) => {
    e.stopPropagation()
    updateFoodLog(log.id, { is_favorite: !log.is_favorite })
    setItems(prev => prev.map(i => i.log.id === log.id
      ? { ...i, log: { ...i.log, is_favorite: !log.is_favorite } }
      : i
    ))
  }

  return (
    <div className={styles.container} onClick={closeMenu}>
      <div className={styles.header}>
        <h1 className={styles.title}>{searchQuery ? `搜索"${searchQuery}"` : '美食图库'}</h1>
        <div className={styles.filterRow}>
          {(['all', 'food', 'drink', 'snack', 'dessert'] as const).map(f => (
            <button key={f} className={`${styles.fBtn} ${filter===f?styles.fActive:''}`}
              onClick={e => { e.stopPropagation(); setFilter(f) }}>{f==='all'?'全部':catLabels[f]}</button>
          ))}
        </div>
      </div>

      {filtered.length===0 ? (
        <div className={styles.empty}>
          <p>{searchQuery ? `未找到"${searchQuery}"相关美食` : '本月暂无美食记录'}</p>
          <p className={styles.emptyHint}>{searchQuery ? '试试其他关键词' : '快去打卡记录你的美食吧'}</p>
        </div>
      ) : (
        <div className={styles.masonry}>
          {Array.from(grouped.entries()).map(([date, dayItems]) => (
            <div key={date} className={styles.dayGroup}>
              <div className={styles.dayLabel}>
                {format(new Date(date), 'M月d日 EEEE', { locale: zhCN })}
                <span className={styles.dayCount}>{dayItems.length} 份</span>
              </div>
              <div className={styles.cardGrid}>
                {dayItems.map(({ log }) => (
                  <div key={log.id} className={styles.foodCard}
                    onClick={() => setDetail({ date, log })}
                    onContextMenu={e => handleContext(e, log)}>
                    {log.image_url ? (
                      <img src={log.image_url} alt={log.food_name} className={styles.cardImg} />
                    ) : getFoodImage(log.food_name) ? (
                      <img src={getFoodImage(log.food_name)!} alt={log.food_name} className={styles.cardImg} />
                    ) : (
                      <div className={styles.cardPlaceholder} style={{ background: catColors[log.meal_type]+'12' }}>
                        <FoodIcon type={log.meal_type} size={64} />
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      <div className={styles.cardTop}>
                        <span className={styles.cardTag} style={{ background: catColors[log.meal_type] }}>{catLabels[log.meal_type]}</span>
                        <button className={`${styles.favBtn} ${log.is_favorite ? styles.favActive : ''}`}
                          onClick={e => toggleFav(e, log)}>
                          {log.is_favorite ? '⭐' : '☆'}
                        </button>
                      </div>
                      <span className={styles.cardName}>{log.food_name}</span>
                      <span className={styles.cardCal}>{log.calories} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)}>
          <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
            <button className={styles.detailClose} onClick={() => setDetail(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className={styles.detailImgWrap}>
              {detail.log.image_url ? (
                <img src={detail.log.image_url} alt={detail.log.food_name} className={styles.detailImg} />
              ) : getFoodImage(detail.log.food_name) ? (
                <img src={getFoodImage(detail.log.food_name)!} alt={detail.log.food_name} className={styles.detailImg} />
              ) : (
                <div className={styles.detailPlaceholder} style={{background:catColors[detail.log.meal_type]+'12'}}>
                  <FoodIcon type={detail.log.meal_type} size={100} />
                </div>
              )}
            </div>
            <div className={styles.detailBody}>
              <span className={styles.detailTag} style={{background:catColors[detail.log.meal_type]}}>{catLabels[detail.log.meal_type]}</span>
              <h2 className={styles.detailName}>{detail.log.food_name}</h2>
              <div className={styles.detailMeta}>
                <span>{detail.log.calories} kcal</span>
                <span>·</span>
                <span>{detail.log.servings} {detail.log.serving_unit}</span>
              </div>
              <div className={styles.detailInfo}>
                <div className={styles.detailRow}><span>蛋白质</span><span>{detail.log.protein}g</span></div>
                <div className={styles.detailRow}><span>碳水</span><span>{detail.log.carbs}g</span></div>
                <div className={styles.detailRow}><span>脂肪</span><span>{detail.log.fat}g</span></div>
                <div className={styles.detailRow}><span>日期</span><span>{detail.date}</span></div>
              </div>
              <div className={styles.detailActions}>
                <button className={styles.detailDel} onClick={() => { deleteFoodLog(detail.log.id); setItems(prev => prev.filter(i => i.log.id !== detail.log.id)); setDetail(null) }}>🗑️ 删除</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {ctxMenu && (
        <div className={styles.ctxMenu} style={{ left:ctxMenu.x, top:ctxMenu.y }}
          onClick={e => e.stopPropagation()}>
          <div className={styles.ctxItem} onClick={() => { setDetail({ date: ctxMenu.log.date, log: ctxMenu.log }); setCtxMenu(null) }}>📋 查看详情</div>
          <div className={styles.ctxDivider}/>
          <div className={styles.ctxDanger} onClick={handleDelete}>🗑️ 删除记录</div>
        </div>
      )}
    </div>
  )
}

export default Gallery
