import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { useFood } from '../contexts/FoodContext'
import { getFavoriteFoodLogs } from '../services/db'
import type { FoodLog, MealType } from '../types'
import { FoodIcon } from '../components/common/Icons'
import { getFoodImage } from '../utils/foodImages'
import styles from './Favorites.module.css'

const catColors: Record<MealType, string> = { drink: '#6C8EEF', food: '#F59E0B', snack: '#F472B6', dessert: '#A78BFA' }
const catLabels: Record<MealType, string> = { drink: '饮品', food: '食物', snack: '小吃', dessert: '甜点' }

const Favorites = () => {
  const { user } = useAuth()
  const { deleteFoodLog, updateFoodLog } = useFood()
  const [favs, setFavs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [ctxMenu, setCtxMenu] = useState<{ x:number; y:number; log:FoodLog } | null>(null)
  const [detail, setDetail] = useState<FoodLog | null>(null)

  const load = async () => {
    if (!user?.id) return
    setLoading(true)
    const data = await getFavoriteFoodLogs(user.id)
    setFavs(data as FoodLog[])
    setLoading(false)
  }

  useEffect(() => { load() }, [user?.id])

  const handleContext = (e: React.MouseEvent, log: FoodLog) => {
    e.preventDefault(); setCtxMenu({ x:e.clientX, y:e.clientY, log })
  }

  const handleUnfav = () => {
    if (ctxMenu) {
      updateFoodLog(ctxMenu.log.id, { is_favorite: false })
      setFavs(prev => prev.filter(f => f.id !== ctxMenu.log.id))
      setCtxMenu(null)
    }
  }

  const handleDelete = () => {
    if (ctxMenu) {
      deleteFoodLog(ctxMenu.log.id)
      setFavs(prev => prev.filter(f => f.id !== ctxMenu.log.id))
      setCtxMenu(null)
    }
  }

  return (
    <div className={styles.container} onClick={() => setCtxMenu(null)}>
      <h1 className={styles.title}>收藏美食</h1>

      {loading ? (
        <div className={styles.empty}><p>加载中...</p></div>
      ) : favs.length === 0 ? (
        <div className={styles.empty}>
          <p>⭐ 暂无收藏</p>
          <p className={styles.hint}>添加食物时点击 ☆ 即可收藏</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {favs.map(log => (
            <div key={log.id} className={styles.card}
              onClick={() => setDetail(log)}
              onContextMenu={e => handleContext(e, log)}>
              {log.image_url ? (
                <img src={log.image_url} alt={log.food_name} className={styles.img} />
              ) : getFoodImage(log.food_name) ? (
                <img src={getFoodImage(log.food_name)!} alt={log.food_name} className={styles.img} />
              ) : (
                <div className={styles.placeholder} style={{ background: catColors[log.meal_type]+'12' }}>
                  <FoodIcon type={log.meal_type} size={64} />
                </div>
              )}
              <div className={styles.body}>
                <div className={styles.row}>
                  <span className={styles.tag} style={{ background:catColors[log.meal_type] }}>{catLabels[log.meal_type]}</span>
                  <span className={styles.star}>⭐</span>
                </div>
                <span className={styles.name}>{log.food_name}</span>
                <div className={styles.meta}>
                  <span>{log.calories} kcal</span>
                  <span>·</span>
                  <span>{format(new Date(log.date), 'M/d')}</span>
                </div>
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
              {detail.image_url ? (
                <img src={detail.image_url} alt={detail.food_name} className={styles.detailImg} />
              ) : getFoodImage(detail.food_name) ? (
                <img src={getFoodImage(detail.food_name)!} alt={detail.food_name} className={styles.detailImg} />
              ) : (
                <div className={styles.detailPlaceholder} style={{background:catColors[detail.meal_type]+'12'}}>
                  <FoodIcon type={detail.meal_type} size={100} />
                </div>
              )}
            </div>
            <div className={styles.detailBody}>
              <span className={styles.detailTag} style={{background:catColors[detail.meal_type]}}>{catLabels[detail.meal_type]}</span>
              <h2 className={styles.detailName}>{detail.food_name}</h2>
              <div className={styles.detailMeta}>
                <span>{detail.calories} kcal</span><span>·</span><span>{detail.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {ctxMenu && (
        <div className={styles.ctxMenu} style={{ left:ctxMenu.x, top:ctxMenu.y }}
          onClick={e => e.stopPropagation()}>
          <div className={styles.ctxItem} onClick={() => { setDetail(ctxMenu.log); setCtxMenu(null) }}>📋 查看详情</div>
          <div className={styles.ctxDivider}/>
          <div className={styles.ctxItem} onClick={handleUnfav}>☆ 取消收藏</div>
          <div className={styles.ctxDivider}/>
          <div className={styles.ctxDanger} onClick={handleDelete}>🗑️ 删除记录</div>
        </div>
      )}
    </div>
  )
}

export default Favorites
