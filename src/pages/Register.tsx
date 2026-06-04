import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Register.module.css'

const Register = () => {
  const navigate = useNavigate()
  const { register, isLoading, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !nickname) return
    await register(email, password, nickname)
    if (localStorage.getItem('foodsnap_user_id')) navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🍽️</div>
        <h1 className={styles.title}>创建账号</h1>
        <p className={styles.sub}>开始记录你的美食之旅</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {authError && <div className={styles.error}>{authError}</div>}

          <div className={styles.field}>
            <label className={styles.label}>昵称</label>
            <input className={styles.input} type="text" placeholder="你的昵称"
              value={nickname} onChange={e => setNickname(e.target.value)} autoFocus />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>邮箱</label>
            <input className={styles.input} type="email" placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>密码</label>
            <input className={styles.input} type="password" placeholder="至少6位密码"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button className={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <p className={styles.footer}>
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
