import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, deleteAccount, updateUser } from '../services/db'
import { IconChevronLeft } from '../components/common/Icons'
import styles from './Account.module.css'

function simpleHash(s: string): string {
  let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0 }
  return String(Math.abs(h)).padStart(10, '0')
}

const Account = () => {
  const navigate = useNavigate()
  const { user, updateProfile, logout } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [nickname, setNickname] = useState(user?.nickname || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState<string | null>(user?.avatar_url || null)
  const [saved, setSaved] = useState(false)

  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [cfmPwd, setCfmPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')

  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setNickname(user.nickname || '')
      setBio(user?.bio || '')
      setAvatar(user.avatar_url || null)
    }
  }, [user])

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { const r = new FileReader(); r.onload = () => setAvatar(r.result as string); r.readAsDataURL(f) }
  }

  const handleSave = () => {
    updateProfile({ nickname, bio: bio as any, avatar_url: avatar } as any)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  const handlePassword = async () => {
    if (!curPwd) { setPwdMsg('请输入当前密码'); return }
    if (newPwd.length < 6) { setPwdMsg('新密码至少6位'); return }
    if (newPwd !== cfmPwd) { setPwdMsg('两次密码不一致'); return }
    try {
      const { data } = await supabase.from('users').select('password_hash').eq('id', user!.id).single()
      if (!data || data.password_hash !== simpleHash(curPwd)) {
        setPwdMsg('当前密码错误'); return
      }
      await updateUser(user!.id, { password_hash: simpleHash(newPwd) })
      setPwdMsg('密码修改成功 ✓')
      setCurPwd(''); setNewPwd(''); setCfmPwd('')
    } catch {
      setPwdMsg('修改失败，请重试')
    }
    setTimeout(() => setPwdMsg(''), 2000)
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await deleteAccount(user!.id)
      logout()
      navigate('/welcome', { replace: true })
    } catch (e) {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/profile')}>
          <IconChevronLeft size={24} />
        </button>
        <h1 className={styles.title}>编辑资料</h1>
        <div className={styles.spacer} />
      </div>

      {/* 个人资料 */}
      <div className={styles.card}>
        <h3>个人资料</h3>
        <div className={styles.field}>
          <label>头像</label>
          <div className={styles.avatarRow}>
            <div className={styles.avatar}>
              {avatar ? <img src={avatar} alt="" /> : (user?.nickname?.charAt(0) || 'U')}
            </div>
            <button type="button" className={styles.uploadBtn} onClick={() => fileRef.current?.click()}>更换头像</button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
          </div>
        </div>
        <div className={styles.field}>
          <label>昵称</label>
          <input className={styles.input} name="nickname" autoComplete="nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>个性签名</label>
          <input type="text" style={{display:'none'}} autoComplete="email" tabIndex={-1} />
          <input type="password" style={{display:'none'}} autoComplete="current-password" tabIndex={-1} />
          <input className={styles.input} name="bio" autoComplete="new-password" value={bio} onChange={e => setBio(e.target.value)} placeholder="写一句签名..." />
        </div>
        <div className={styles.field}>
          <label>邮箱</label>
          <input className={styles.input} name="email" autoComplete="email" value={user?.email || ''} disabled />
        </div>
        <button className={styles.saveBtn} onClick={handleSave}>{saved ? '已保存 ✓' : '保存资料'}</button>
      </div>

      {/* 修改密码 */}
      <div className={styles.card}>
        <h3>修改密码</h3>
        <div className={styles.field}>
          <label>当前密码</label>
          <input className={styles.input} type="password" name="current-password" autoComplete="current-password" value={curPwd} onChange={e => setCurPwd(e.target.value)} placeholder="输入当前密码" />
        </div>
        <div className={styles.field}>
          <label>新密码</label>
          <input className={styles.input} type="password" name="new-password" autoComplete="new-password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="输入新密码" />
        </div>
        <div className={styles.field}>
          <label>确认新密码</label>
          <input className={styles.input} type="password" name="confirm-password" autoComplete="new-password" value={cfmPwd} onChange={e => setCfmPwd(e.target.value)} placeholder="再次输入新密码" />
        </div>
        {pwdMsg && <p className={pwdMsg.includes('成功') ? styles.success : styles.error}>{pwdMsg}</p>}
        <button className={styles.saveBtn} onClick={handlePassword}>修改密码</button>
      </div>

      {/* 危险操作 */}
      <div className={styles.card}>
        <h3 style={{ color: 'var(--error)' }}>危险操作</h3>
        <button className={styles.dangerBtn} onClick={() => setShowDelete(true)}>删除账户及全部数据</button>
      </div>

      <button className={styles.logoutBtn} onClick={logout}>退出登录</button>

      {/* 删除确认弹窗 */}
      {showDelete && (
        <div className={styles.overlay} onClick={e => { e.stopPropagation(); setShowDelete(false) }}>
          <div className={styles.dialog} onClick={e => e.stopPropagation()}>
            <h3>⚠️ 删除账户</h3>
            <p className={styles.dialogP}>此操作不可撤销，将永久删除你的账户及所有饮食记录。</p>
            <div className={styles.dialogActions}>
              <button className={styles.dialogCancel} onClick={() => setShowDelete(false)}>取消</button>
              <button className={styles.dialogConfirm} onClick={handleDelete} disabled={deleting}>
                {deleting ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Account
