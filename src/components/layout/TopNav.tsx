import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../services/db'
import { FoodIcon } from '../common/Icons'
import { getFoodImage } from '../../utils/foodImages'
import styles from './TopNav.module.css'

interface SearchResult {
  id: string; food_name: string; date: string; meal_type: string
  image_url: string | null; calories: number
}

const catIcons: Record<string, string> = { drink: '🥤', food: '🍚', snack: '🍟', dessert: '🍰' }

const TopNav = ({ onMenuClick }: { onMenuClick?: () => void }) => {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [detail, setDetail] = useState<SearchResult | null>(null)
  const [mobileSearch, setMobileSearch] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!headerRef.current) return
    const r = headerRef.current.getBoundingClientRect()
    setGlare({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      o: 0.12,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setGlare({ x: 50, y: 50, o: 0 })
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.trim().length < 1) { setResults([]); setShowResults(false); return }
    if (!user?.id) return
    const { data } = await supabase.from('food_logs')
      .select('id, food_name, date, meal_type, image_url, calories')
      .eq('user_id', user.id)
      .ilike('food_name', `%${q.trim()}%`)
      .order('date', { ascending: false })
      .limit(8)
    setResults((data || []) as SearchResult[])
    setShowResults(true)
  }

  const handleResultClick = (result: SearchResult) => {
    setDetail(result)
    setShowResults(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/gallery?q=${encodeURIComponent(query.trim())}`)
      setShowResults(false)
    }
  }

  return (
    <header
      ref={headerRef}
      className={styles.topnav}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ['--glare-x' as string]: `${glare.x}%`,
        ['--glare-y' as string]: `${glare.y}%`,
        ['--glare-o' as string]: `${glare.o}`,
      }}
    >
      <div className={styles.glare} />
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="菜单">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <button className={styles.logo} onClick={() => navigate('/')}>
          <span className={styles.logoIcon}>🍽️</span>
          <span className={styles.logoText}>食记簿</span>
        </button>
      </div>

      <div className={`${styles.center} ${mobileSearch ? styles.mobileSearchOpen : ''}`} ref={searchRef}>
        <div className={styles.searchBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input placeholder="搜索美食..." className={styles.searchInput}
            value={query} onChange={e => handleSearch(e.target.value)}
            onKeyDown={handleKeyDown} onFocus={() => results.length > 0 && setShowResults(true)} />
        </div>
        {showResults && results.length > 0 && (
          <div className={styles.results}>
            <div className={styles.resultsHeader}>搜索结果为</div>
            <div className={styles.resultsGrid}>
              {results.map(r => (
                <button key={r.id} className={styles.resultCard} onClick={() => handleResultClick(r)}>
                  <div className={styles.resultThumb}>
                    {r.image_url ? <img src={r.image_url} alt="" /> : getFoodImage(r.food_name) ? <img src={getFoodImage(r.food_name)!} alt="" /> : <FoodIcon type={r.meal_type} size={56} />}
                  </div>
                  <div className={styles.resultBody}>
                    <span className={styles.resultName}>{r.food_name}</span>
                    <span className={styles.resultMeta}>{r.calories} kcal · {r.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
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
                <div className={styles.detailPlaceholder}>
                  <FoodIcon type={detail.meal_type} size={120} />
                </div>
              )}
            </div>
            <div className={styles.detailBody}>
              <span className={styles.detailTag}>{catIcons[detail.meal_type]} {detail.meal_type}</span>
              <h2>{detail.food_name}</h2>
              <p>{detail.calories} kcal</p>
              <p className={styles.detailDate}>{detail.date}</p>
              <button className={styles.detailBtn} onClick={() => { navigate(`/date/${detail.date}`); setDetail(null) }}>
                查看当日记录 →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.right}>
        <button className={styles.mobileSearchBtn} onClick={() => setMobileSearch(v => !v)} aria-label="搜索">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button className={styles.iconBtn} onClick={toggle} title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}>
          {theme === 'light' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
          )}
        </button>

        <button className={styles.iconBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.5 0"/></svg>
        </button>
      </div>
    </header>
  )
}

export default TopNav
