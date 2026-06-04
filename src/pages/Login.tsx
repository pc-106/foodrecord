import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Login.module.css'

const Login = () => {
  const navigate = useNavigate()
  const { login, isLoading, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    await login(email, password)
    if (localStorage.getItem('foodsnap_user_id')) navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>🍽️</div>
        <h1 className={styles.title}>欢迎回来</h1>
        <p className={styles.sub}>登录你的食记簿账号</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {authError && <div className={styles.error}>{authError}</div>}

          <div className={styles.field}>
            <label className={styles.label}>邮箱</label>
            <input className={styles.input} type="email" placeholder="name@example.com"
              value={email} onChange={e => setEmail(e.target.value)} autoFocus />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>密码</label>
            <input className={styles.input} type="password" placeholder="输入密码"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button className={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className={styles.footer}>
          还没有账号？<Link to="/register">立即注册</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
