import { useNavigate } from 'react-router-dom'
import styles from './Welcome.module.css'

const Welcome = () => {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🍽️</div>
        <h1 className={styles.title}>食记簿</h1>
        <p className={styles.sub}>记录每日美食，看见生活的滋味</p>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={() => navigate('/register')}>
            开始使用
          </button>
          <button className={styles.btnOutline} onClick={() => navigate('/login')}>
            我已有账号
          </button>
        </div>
      </div>
    </div>
  )
}

export default Welcome
