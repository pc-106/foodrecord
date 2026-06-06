import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useFood } from '../contexts/FoodContext'
import { FoodIcon } from '../components/common/Icons'
import { getFoodImage } from '../utils/foodImages'
import { useAuth } from '../contexts/AuthContext'
import { compressImage, isImageFile, ACCEPTED_IMAGE_TYPES } from '../utils/imageUtils'
import type { FoodLog, MealType, Food } from '../types'
import styles from './DateDetail.module.css'

const catDefs: { key:MealType; label:string; icon:string; color:string }[] = [
  { key:'drink', label:'饮品', icon:'🥤', color:'#6C8EEF' },
  { key:'food', label:'食物', icon:'🍚', color:'#F59E0B' },
  { key:'snack', label:'小吃', icon:'🍟', color:'#F472B6' },
  { key:'dessert', label:'甜点', icon:'🍰', color:'#A78BFA' },
]

const DateDetail = () => {
  const { date } = useParams<{ date: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { logs, fetchLogsByDate, addFoodLog, deleteFoodLog, searchFoods, getPopularFoods, isLoading } = useFood()

  const [showAdd, setShowAdd] = useState(false)
  const [mealType, setMealType] = useState<MealType>('food')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [food, setFood] = useState<Food | null>(null)
  const [servings, setServings] = useState(1)
  const [image, setImage] = useState<string | null>(null)
  const [favorite, setFavorite] = useState(false)
  const [detail, setDetail] = useState<FoodLog | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [editCals, setEditCals] = useState('')
  const [nutrition, setNutrition] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analyzeNutrition = async () => {
    const name = food?.name || query.trim()
    if (!name) return
    setAnalyzing(true)
    const cals = editCals ? parseInt(editCals) : food ? Math.round((food.calories_per_100g/100)*food.serving_sizes[0].grams*servings) : 0
    try {
      const res = await fetch('/api/nutrition/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ foodName:name, mealType, servings, calories:cals }) })
      setNutrition(await res.json())
    } catch {}
    setAnalyzing(false)
  }

  useEffect(() => { if(date) fetchLogsByDate(date) }, [date])

  const filterByCat = (foods: Food[], mt: MealType) => {
    const catLabel = catDefs.find(c => c.key === mt)?.label || ''
    return foods.filter(f => f.category === catLabel)
  }

  const openAdd = async (mt: MealType) => {
    setMealType(mt); setFood(null); setQuery(''); setServings(1); setImage(null); setFavorite(false); setEditCals('')
    const all = await getPopularFoods()
    setResults(filterByCat(all, mt)); setShowAdd(true)
  }

  const search = async (q: string) => {
    setQuery(q)
    const all = await searchFoods(q)
    setResults(filterByCat(all, mealType))
  }

  const switchCat = async (mt: MealType) => {
    setMealType(mt)
    const all = query ? await searchFoods(query) : await getPopularFoods()
    setResults(filterByCat(all, mt))
  }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f||!isImageFile(f)) return
    const c = await compressImage(f, { maxWidth:1200, maxHeight:1200, quality:0.8 })
    const r = new FileReader(); r.onload = () => setImage(r.result as string); r.readAsDataURL(c)
  }

  const handleAdd = async () => {
    if (!date) return
    const name = food?.name || query.trim()
    if (!name) return
    const cals = editCals ? parseInt(editCals) : food ? Math.round((food.calories_per_100g/100)*food.serving_sizes[0].grams*servings) : 0
    await addFoodLog({
      user_id: user?.id||'1', food_name: name, meal_type: mealType, servings, serving_unit: food?.serving_sizes[0]?.name||'份',
      calories: cals, protein:0, carbs:0, fat:0,
      image_url: image, notes:null, is_favorite: favorite,
      logged_at: new Date().toISOString(), date,
    })
    setShowAdd(false)
  }

  const getLogs = (mt: MealType) => logs.filter(l => l.meal_type===mt)
  const getCals = (mt: MealType) => getLogs(mt).reduce((s,l)=>s+l.calories,0)
  const totalCals = logs.reduce((s,l)=>s+l.calories,0)

  const goal = user?.daily_calorie_goal || 2000
  const calPct = Math.min(100,(totalCals/goal)*100)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.top}>
        <button className={styles.back} onClick={() => navigate('/')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <h1 className={styles.title}>{date ? format(new Date(date), 'M月d日 EEEE', { locale: zhCN }) : ''}</h1>
          <p className={styles.sub}>{totalCals} / {goal} kcal · {logs.length} 份记录</p>
        </div>
      </div>

      {/* Nutrition Ring + Macros */}
      <div className={styles.summary}>
        <div className={styles.ringWrap}>
          <svg viewBox="0 0 120 120" className={styles.ringSvg}>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border-subtle)" strokeWidth="10"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-primary)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${Math.min(calPct*3.27,327)} 327`} transform="rotate(-90 60 60)"
              style={{transition:'stroke-dasharray 0.6s ease'}}/>
          </svg>
          <div className={styles.ringCenter}>
            <span className={styles.ringNum}>{totalCals}</span>
            <span className={styles.ringUnit}>kcal</span>
          </div>
        </div>
        <div className={styles.calProgress}>
          <div className={styles.calProgressTop}>
            <span>热量进度</span>
            <span className={styles.calProgressVal}>{totalCals}<span className={styles.calProgressGoal}> / {goal} kcal</span></span>
          </div>
          <div className={styles.calProgressBar}>
            <div className={styles.calProgressFill} style={{width:`${Math.min(100,calPct)}%`,background:calPct>100?'var(--error)':'var(--color-primary)'}}/>
          </div>
        </div>
      </div>

      {/* Meal Sections */}
      <div className={styles.meals}>
        {catDefs.map(cat => {
          const items = getLogs(cat.key)
          return (
            <div key={cat.key} className={styles.mealCard}>
              <div className={styles.mealTop}>
                <span className={styles.mealLabel} style={{color:cat.color}}>{cat.icon} {cat.label}</span>
                <span className={styles.mealCals}>{getCals(cat.key)} kcal</span>
              </div>
              {items.length===0 ? (
                <p className={styles.empty}>暂无记录</p>
              ) : (
                <div className={styles.items}>
                  {items.map(l => (
                    <div key={l.id} className={styles.item} onClick={() => setDetail(l)}>
                      {(l.image_url || getFoodImage(l.food_name)) && <img src={l.image_url || getFoodImage(l.food_name)!} alt="" className={styles.thumb}/>}
                      <span className={styles.itemName}>{l.food_name}</span>
                      {l.is_favorite && <span className={styles.favStar}>⭐</span>}
                      <span className={styles.itemCal}>{l.calories} kcal</span>
                      <button className={styles.itemDel} onClick={e => { e.stopPropagation(); deleteFoodLog(l.id) }}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <button className={styles.addBtn} onClick={()=>openAdd(cat.key)}>+ 添加{cat.label}</button>
            </div>
          )
        })}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className={styles.overlay} onClick={() => setDetail(null)}>
          <div className={styles.detailModal} onClick={e => e.stopPropagation()}>
            <button className={styles.detailClose} onClick={() => setDetail(null)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {detail.image_url ? (
              <img src={detail.image_url} alt={detail.food_name} className={styles.detailImg} />
            ) : getFoodImage(detail.food_name) ? (
              <img src={getFoodImage(detail.food_name)!} alt={detail.food_name} className={styles.detailImg} />
            ) : (
              <div className={styles.detailPlaceholder} style={{background:(catDefs.find(c=>c.key===detail.meal_type)?.color||'#6C8EEF')+'12'}}>
                <FoodIcon type={detail.meal_type} size={100} />
              </div>
            )}
            <div className={styles.detailBody}>
              <span className={styles.detailTag} style={{background:catDefs.find(c=>c.key===detail.meal_type)?.color}}>{catDefs.find(c=>c.key===detail.meal_type)?.label}</span>
              <h2 className={styles.detailName}>{detail.food_name}</h2>
              <div className={styles.detailMeta}>
                <span>{detail.calories} kcal</span><span>·</span><span>{detail.servings} {detail.serving_unit}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div className={styles.overlay} onClick={()=>setShowAdd(false)}>
          <div className={styles.modal} onClick={e=>e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>添加{catDefs.find(c=>c.key===mealType)?.label}</h2>
              <button onClick={()=>setShowAdd(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Category picker */}
            <div className={styles.cats}>
              {catDefs.map(c => (
                <button key={c.key} className={`${styles.catBtn} ${mealType===c.key?styles.catOn:''}`}
                  onClick={()=>switchCat(c.key)} style={{borderColor:mealType===c.key?c.color:'transparent'}}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Search or custom name */}
            <input className={styles.input} placeholder="搜索或输入食物名称" value={query} onChange={e=>search(e.target.value)} autoFocus/>
            {!food && (
              <div className={styles.results}>
                {results.slice(0,5).map(f => (
                  <button key={f.id} className={styles.resultItem} onClick={()=>{setFood(f);setQuery(f.name);setEditCals('');setResults([])}}>
                    <span className={styles.resultName}>{f.name}</span>
                    <span className={styles.resultMeta}>{f.category} · {f.calories_per_100g} kcal/100g</span>
                  </button>
                ))}
                {query.trim() && (
                  <button className={styles.customItem} onClick={()=>{setFood(null);setResults([])}}>
                    <span className={styles.resultName}>✏️ 自定义「{query.trim()}」</span>
                    <span className={styles.resultMeta}>手动输入热量</span>
                  </button>
                )}
              </div>
            )}

            {/* AI Nutrition — always visible when food name entered */}
            {(food || query.trim()) && (
              <>
                <button className={styles.analyzeBtn} onClick={analyzeNutrition} disabled={analyzing}>
                  {analyzing ? '⏳ 分析中...' : nutrition ? '🔄 重新分析' : '🤖 AI 营养分析'}
                </button>
                {nutrition && (
                  <div className={styles.nutritionCard}>
                    <div className={styles.nutritionScore}>
                      <span className={nutrition.score >= 60 ? styles.scoreGood : nutrition.score >= 40 ? styles.scoreMid : styles.scoreBad}>
                        {nutrition.score}分
                      </span>
                      <span>{nutrition.level}</span>
                    </div>
                    <div className={styles.nutritionText}>{nutrition.analysis}</div>
                    {nutrition.suggestions?.length > 0 && (
                      <div className={styles.nutritionTips}>
                        {nutrition.suggestions.map((s: string, i: number) => <span key={i}>💡 {s}</span>)}
                      </div>
                    )}
                    {nutrition.warnings?.length > 0 && (
                      <div className={styles.nutritionWarn}>
                        {nutrition.warnings.map((w: string, i: number) => <span key={i}>⚠️ {w}</span>)}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Servings */}
            <div className={styles.row}>
              <span className={styles.rowLabel}>份量</span>
              <div className={styles.stepper}>
                <button onClick={()=>setServings(Math.max(0.5,servings-0.5))}>−</button>
                <span className={styles.stepVal}>{servings}</span>
                <button onClick={()=>setServings(servings+0.5)}>+</button>
              </div>
            </div>

            {/* Calories */}
            <div className={styles.row}>
              <span className={styles.rowLabel}>热量</span>
              <input className={styles.calInput} type="number" placeholder="kcal"
                value={editCals || (food ? String(Math.round((food.calories_per_100g/100)*food.serving_sizes[0].grams*servings)) : '')}
                onChange={e=>setEditCals(e.target.value)}/>
            </div>

            {/* Image */}
            <div className={styles.row}>
              <span className={styles.rowLabel}>照片</span>
              <div className={styles.imgRow}>
                <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES} onChange={handleImage} hidden/>
                {image ? (
                  <div className={styles.imgPreview}>
                    <img src={image} alt=""/>
                    <button className={styles.imgRemove} onClick={()=>setImage(null)}>×</button>
                  </div>
                ) : (
                  <button className={styles.imgBtn} onClick={()=>fileRef.current?.click()}>📷 选择照片</button>
                )}
              </div>
            </div>

            {/* Favorite */}
            <button className={`${styles.favBtn} ${favorite?styles.favOn:''}`} onClick={()=>setFavorite(!favorite)}>
              {favorite ? '⭐' : '☆'} {favorite?'已收藏':'收藏'}
            </button>
            <div className={styles.modalActions}>
              <button className={styles.cancel} onClick={()=>setShowAdd(false)}>取消</button>
              <button className={styles.confirm} onClick={handleAdd} disabled={isLoading}>{isLoading?'...':'添加'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DateDetail
