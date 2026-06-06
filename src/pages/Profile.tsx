import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Profile.module.css'

const Profile = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

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

      <button className={styles.logoutBtn} onClick={logout}>退出登录</button>
    </div>
  )
}

export default Profile
