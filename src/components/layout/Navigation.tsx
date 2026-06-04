import { NavLink, useNavigate } from 'react-router-dom'
import { IconHome, IconChart, IconPlus, IconCompass, IconUser } from '../common/Icons'
import styles from './Navigation.module.css'

const Navigation = () => {
  const navigate = useNavigate()

  const handleAddClick = () => {
    const today = new Date().toISOString().split('T')[0]
    navigate(`/date/${today}`)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navItem} ${isActive ? styles.active : ''}`

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        {/* 首页 */}
        <NavLink to="/" className={navLinkClass}>
          <div className={styles.iconWrapper}>
            <IconHome size={22} />
          </div>
          <span className={styles.label}>首页</span>
        </NavLink>

        {/* 统计 */}
        <NavLink to="/stats" className={navLinkClass}>
          <div className={styles.iconWrapper}>
            <IconChart size={22} />
          </div>
          <span className={styles.label}>统计</span>
        </NavLink>

        {/* 中心添加按钮 */}
        <button
          className={styles.addButton}
          onClick={handleAddClick}
          aria-label="添加饮食"
        >
          <div className={styles.addButtonInner}>
            <IconPlus size={26} />
          </div>
        </button>

        {/* 推荐 */}
        <NavLink to="/recommendations" className={navLinkClass}>
          <div className={styles.iconWrapper}>
            <IconCompass size={22} />
          </div>
          <span className={styles.label}>推荐</span>
        </NavLink>

        {/* 我的 */}
        <NavLink to="/profile" className={navLinkClass}>
          <div className={styles.iconWrapper}>
            <IconUser size={22} />
          </div>
          <span className={styles.label}>我的</span>
        </NavLink>
      </div>
    </nav>
  )
}

export default Navigation
