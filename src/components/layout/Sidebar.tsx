import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useRef, useCallback } from 'react'
import styles from './Sidebar.module.css'

const menuItems = [
  { path: '/', label: '月历打卡', icon: '📅' },
  { path: '/gallery', label: '美食图库', icon: '🖼️' },
  { path: '/favorites', label: '收藏美食', icon: '⭐' },
  { path: '/report', label: '食记报表', icon: '📊' },
]

const Sidebar = ({ open, onClose }: { open?: boolean; onClose?: () => void }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const go = (path: string) => { navigate(path); onClose?.() }
  const userCardRef = useRef<HTMLDivElement>(null)
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!userCardRef.current) return
    const r = userCardRef.current.getBoundingClientRect()
    setGlare({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      o: 0.15,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setGlare({ x: 50, y: 50, o: 0 })
  }, [])

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>
      {/* 用户卡片 */}
      <div
        ref={userCardRef}
        className={styles.userCard}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          ['--glare-x' as string]: `${glare.x}%`,
          ['--glare-y' as string]: `${glare.y}%`,
          ['--glare-o' as string]: `${glare.o}`,
        }}
      >
        <div className={styles.glare} />
        <div className={styles.userAvatar}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className={styles.avatarImg} />
          ) : (
            user?.nickname?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{user?.nickname || '用户'}</div>
          <div className={styles.userBio}>{user?.bio || '不爱喝饮料 记录美食'}</div>
        </div>
      </div>

      {/* 菜单 */}
      <nav className={styles.menu}>
        {menuItems.map(item => (
          <button
            key={item.path}
            className={`${styles.menuItem} ${location.pathname === item.path ? styles.menuActive : ''}`}
            onClick={() => go(item.path)}
          >
            <span className={styles.menuIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.sidebarDivider} />

      {/* 快捷操作 */}
      <button
        className={`${styles.menuItem} ${location.pathname === '/profile' ? styles.menuActive : ''}`}
        onClick={() => go('/profile')}
      >
        <span className={styles.menuIcon}>👤</span>
        <span>个人主页</span>
      </button>
      <button
        className={`${styles.menuItem} ${location.pathname === '/settings' ? styles.menuActive : ''}`}
        onClick={() => go('/settings')}
      >
        <span className={styles.menuIcon}>⚙️</span>
        <span>系统设置</span>
      </button>

      {/* 发布按钮 */}
      <button
        className={styles.postButton}
        onClick={() => {
          const today = new Date().toISOString().split('T')[0]
          go(`/date/${today}`)
        }}
      >
        <span>📸</span> 发布美食
      </button>
    </aside>
  )
}

export default Sidebar
