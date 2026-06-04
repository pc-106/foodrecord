import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../services/db'
import { useAuth } from '../contexts/AuthContext'
import styles from './Settings.module.css'

const Settings = () => {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const [notifs, setNotifs] = useState({ dailyReminder: true, weeklyReport: true })
  const [msg, setMsg] = useState('')

  const handleExport = async () => {
    if (!user) return
    const { data } = await supabase.from('food_logs').select('*').eq('user_id', user.id).order('date')
    if (!data?.length) { setMsg('暂无数据可导出'); setTimeout(() => setMsg(''), 2000); return }
    const rows = [['日期','名称','品类','热量','蛋白质','碳水','脂肪']]
    data.forEach((r: any) => rows.push([r.date, r.food_name, r.meal_type, String(r.calories), String(r.protein), String(r.carbs), String(r.fat)]))
    const BOM = String.fromCharCode(0xFEFF)
    const csv = BOM + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}))
    a.download = '食记簿_全部数据.csv'; a.click()
    setMsg('导出成功'); setTimeout(() => setMsg(''), 2000)
  }

  const handleClear = async () => {
    if (!user || !confirm('确定删除所有饮食记录？此操作不可撤销。')) return
    await supabase.from('food_logs').delete().eq('user_id', user.id)
    setMsg('已清空全部数据'); setTimeout(() => setMsg(''), 2000)
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
          </div>
        </div>

        {/* 数据管理 */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>数据管理</h3>
          <div className={styles.card}>
            <button className={styles.settingRow} onClick={handleExport}>
              <div>
                <span className={styles.settingLabel}>导出全部数据</span>
                <span className={styles.settingHint}>下载所有饮食记录为 CSV 文件</span>
              </div>
              <span className={styles.arrow}>→</span>
            </button>
            <div className={styles.divider} />
            <button className={styles.settingRow}>
              <div>
                <span className={styles.settingLabel}>导入数据</span>
                <span className={styles.settingHint}>从 CSV 文件导入历史记录</span>
              </div>
              <span className={styles.arrow}>→</span>
            </button>
            <div className={styles.divider} />
            <button className={styles.settingRow} onClick={handleClear}>
              <div>
                <span className={styles.settingLabel} style={{color:'var(--error)'}}>清除全部数据</span>
                <span className={styles.settingHint}>删除所有饮食记录</span>
              </div>
              <span className={styles.arrow} style={{color:'var(--error)'}}>→</span>
            </button>
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
