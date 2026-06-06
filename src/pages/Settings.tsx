import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { subscribeToPush, unsubscribeFromPush, isPushSupported } from '../utils/notifications'
import styles from './Settings.module.css'

const Settings = () => {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const [notifs, setNotifs] = useState({ dailyReminder: true, weeklyReport: true })
  const [pushEnabled, setPushEnabled] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (isPushSupported() && Notification.permission === 'granted') {
      setPushEnabled(true)
    }
  }, [])

  const handlePushToggle = async () => {
    if (!user) return
    if (pushEnabled) {
      await unsubscribeFromPush()
      setPushEnabled(false)
      setMsg('已关闭推送通知'); setTimeout(() => setMsg(''), 2000)
    } else {
      await subscribeToPush(user.id)
      setPushEnabled(true)
      setMsg('已开启推送通知'); setTimeout(() => setMsg(''), 2000)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>系统设置</h1>
      {msg && <div className={styles.toast}>{msg}</div>}

      <div className={styles.panels}>
        {/* 外观 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>外观</h3>
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>主题模式</span>
                <span className={styles.settingHint}>{theme==='light'?'浅色模式':'深色模式'}</span>
              </div>
              <button className={styles.toggleBtn} onClick={toggle}>
                {theme==='light'?'🌙 切换深色':'☀️ 切换浅色'}
              </button>
            </div>
          </div>
        </div>

        {/* 通知 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>通知</h3>
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>打卡提醒</span>
                <span className={styles.settingHint}>每日定时提醒记录饮食</span>
              </div>
              <button
                className={`${styles.switch} ${notifs.dailyReminder ? styles.switchOn : ''}`}
                onClick={() => setNotifs(p => ({ ...p, dailyReminder: !p.dailyReminder }))}
              ><div /></button>
            </div>
            <div className={styles.divider} />
            <div className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>周报推送</span>
                <span className={styles.settingHint}>每周一推送食记统计</span>
              </div>
              <button
                className={`${styles.switch} ${notifs.weeklyReport ? styles.switchOn : ''}`}
                onClick={() => setNotifs(p => ({ ...p, weeklyReport: !p.weeklyReport }))}
              ><div /></button>
            </div>
            <div className={styles.divider} />
            <div className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>浏览器推送通知</span>
                <span className={styles.settingHint}>{pushEnabled ? '已开启每日打卡提醒' : '开启后定时提醒记录饮食'}</span>
              </div>
              <button
                className={`${styles.switch} ${pushEnabled ? styles.switchOn : ''}`}
                onClick={handlePushToggle}
              ><div /></button>
            </div>
          </div>
        </div>

        {/* 关于 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>关于</h3>
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <span className={styles.settingLabel}>版本</span>
              <span className={styles.settingHint}>v1.0.0</span>
            </div>
            <div className={styles.divider} />
            <button className={styles.settingRow}>
              <span className={styles.settingLabel}>隐私协议</span>
              <span className={styles.arrow}>→</span>
            </button>
            <div className={styles.divider} />
            <button className={styles.settingRow}>
              <span className={styles.settingLabel}>用户反馈</span>
              <span className={styles.arrow}>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
