import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Profile.module.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [notifs, setNotifs] = useState({
    dailyReminder: true, weeklyReport: true, recommendations: false, systemNotice: true,
  })

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>个人主页</h1>

      {/* 用户信息卡 */}
      <div className={styles.userCard}>
        <div className={styles.avatar}>
          {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : (user?.nickname?.charAt(0) || 'U')}
        </div>
        <div className={styles.userMeta}>
          <h2>{user?.nickname || '用户'}</h2>
          <p>{user?.email}</p>
          <p className={styles.bio}>{user?.bio || '不爱喝饮料 记录美食'}</p>
        </div>
        <button className={styles.editBtn} onClick={() => navigate('/account')}>编辑资料</button>
      </div>

      {/* 消息通知 */}
      <div className={styles.notifyCard}>
        <h3>消息通知</h3>
        {[
          { label: '每日打卡提醒', key: 'dailyReminder' as const },
          { label: '周报推送', key: 'weeklyReport' as const },
          { label: '美食推荐', key: 'recommendations' as const },
          { label: '系统通知', key: 'systemNotice' as const },
        ].map((n, i) => (
          <div key={i} className={styles.notifyItem}>
            <span>{n.label}</span>
            <button
              className={`${styles.toggle} ${notifs[n.key] ? styles.toggleOn : ''}`}
              onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
            ><div /></button>
          </div>
        ))}
      </div>

      <button className={styles.logoutBtn} onClick={logout}>退出登录</button>
    </div>
  )
}

export default Profile
