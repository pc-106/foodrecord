import { useState, useEffect, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, subMonths, isWithinInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useFood } from '../contexts/FoodContext'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import type { FoodLog, MealType } from '../types'
import styles from './Report.module.css'

type Period = 'week' | 'month' | 'year'

const catLabels: Record<MealType, string> = { drink:'饮品', food:'食物', snack:'小吃', dessert:'甜点' }
const catColors: Record<MealType, string> = { drink:'#6C8EEF', food:'#F59E0B', snack:'#F472B6', dessert:'#A78BFA' }
const donutColors = ['#FF9F69','#6C8EEF','#F59E0B','#F472B6','#A78BFA','#8CB896','#FF7B42','#FFB888','#6CB8EE','#D4A0F0']

const tooltipStyle = { background:'var(--bg-card)', border:'1px solid var(--border-card)', borderRadius:8, fontSize:13, color:'var(--text-primary)' }

const Report = () => {
  const { fetchLogsByMonth } = useFood()
  const [period, setPeriod] = useState<Period>('month')
  const [refDate] = useState(new Date())
  const [allLogs, setAllLogs] = useState<Map<string, FoodLog[]>>(new Map())
  const [catFilter, setCatFilter] = useState<MealType | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'date' | 'name' | 'cals'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [showExport, setShowExport] = useState(false)

  // Load ~3 months of data for context
  useEffect(() => {
    (async () => {
      const m = new Map<string, FoodLog[]>()
      // 加载当前月 + 上2个月 = 3个月（缓存让后续加载秒开）
      for (let i = 0; i < 3; i++) {
        const d = subMonths(new Date(), i)
        const data = await fetchLogsByMonth(d.getFullYear(), d.getMonth() + 1)
        data.forEach((v, k) => m.set(k, v))
      }
      setAllLogs(m)
    })()
  }, [])

  // Compute period range
  const range = useMemo(() => {
    switch (period) {
      case 'week': return { start: startOfWeek(refDate, { weekStartsOn: 1 }), end: endOfWeek(refDate, { weekStartsOn: 1 }) }
      case 'month': return { start: startOfMonth(refDate), end: endOfMonth(refDate) }
      case 'year': return { start: startOfYear(refDate), end: endOfYear(refDate) }
    }
  }, [period, refDate])

  // Filter logs in range
  const filteredLogs = useMemo(() => {
    const result: { date: string; log: FoodLog }[] = []
    allLogs.forEach((logs, date) => {
      const d = new Date(date)
      if (isWithinInterval(d, { start: range.start, end: range.end })) {
        logs.forEach(log => {
          if (catFilter === 'all' || log.meal_type === catFilter) {
            result.push({ date, log })
          }
        })
      }
    })
    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [allLogs, range, catFilter])

  // Summary stats
  const stats = useMemo(() => {
    const shops = new Set<string>()
    filteredLogs.forEach(({ log }) => shops.add(log.food_name))
    const totalCals = filteredLogs.reduce((s, f) => s + f.log.calories, 0)
    const periodDays = eachDayOfInterval(range).length
    return {
      total: filteredLogs.length,
      shops: shops.size,
      avgDaily: periodDays > 0 ? (filteredLogs.length / periodDays).toFixed(1) : '0',
      newShops: shops.size,
      totalCals,
    }
  }, [filteredLogs])

  // Trend data
  const trendData = useMemo(() => {
    if (period === 'week') {
      return eachDayOfInterval(range).map(d => {
        const key = format(d, 'yyyy-MM-dd')
        const items = filteredLogs.filter(f => f.date === key)
        return { label: format(d, 'EEE', { locale: zhCN }), count: items.length, cals: items.reduce((s, f) => s + f.log.calories, 0) }
      })
    }
    if (period === 'month') {
      return eachDayOfInterval(range).map(d => {
        const key = format(d, 'yyyy-MM-dd')
        const items = filteredLogs.filter(f => f.date === key)
        return { label: format(d, 'd'), count: items.length, cals: items.reduce((s, f) => s + f.log.calories, 0) }
      })
    }
    return eachMonthOfInterval(range).map(d => {
      const items = filteredLogs.filter(f => f.date.startsWith(format(d, 'yyyy-MM')))
      return { label: format(d, 'M月'), count: items.length, cals: items.reduce((s, f) => s + f.log.calories, 0) }
    })
  }, [filteredLogs, period, range])

  // Shop breakdown
  const shopData = useMemo(() => {
    const map = new Map<string, number>()
    filteredLogs.forEach(({ log }) => map.set(log.food_name, (map.get(log.food_name) || 0) + 1))
    return Array.from(map.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  }, [filteredLogs])

  // Category breakdown
  const catData = useMemo(() => {
    const map = new Map<MealType, number>()
    filteredLogs.forEach(({ log }) => map.set(log.meal_type, (map.get(log.meal_type) || 0) + 1))
    return Array.from(map.entries()).map(([type, count]) => ({ type, count, label: catLabels[type], color: catColors[type] }))
  }, [filteredLogs])

  // Detail table
  const tableData = useMemo(() => {
    let data = [...filteredLogs]
    if (search) data = data.filter(f => f.log.food_name.includes(search) || f.date.includes(search))
    data.sort((a, b) => {
      let cmp = 0
      if (sortField === 'date') cmp = a.date.localeCompare(b.date)
      else if (sortField === 'name') cmp = a.log.food_name.localeCompare(b.log.food_name)
      else cmp = a.log.calories - b.log.calories
      return sortDir === 'desc' ? -cmp : cmp
    })
    return data
  }, [filteredLogs, search, sortField, sortDir])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const periodLabel = period==='week'?'本周':period==='month'?'本月':'本年'
  const filename = `食记报表_${periodLabel}_${format(range.start,'yyyy-MM-dd')}_${format(range.end,'yyyy-MM-dd')}`

  const getRows = () => {
    const rows = [['日期','美食名称','品类','热量(kcal)']]
    tableData.forEach(f => rows.push([f.date, f.log.food_name, catLabels[f.log.meal_type], String(f.log.calories)]))
    return rows
  }

  const exportCSV = () => {
    const BOM = String.fromCharCode(0xFEFF)
    const csv = BOM + getRows().map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${filename}.csv`; a.click(); setShowExport(false)
  }

  const exportExcel = () => {
    const rows = getRows()
    const html = `<table>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`
    const BOM = String.fromCharCode(0xFEFF)
    const blob = new Blob([`${BOM}<html><meta charset="utf-8"><body>${html}</body></html>`], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${filename}.xls`; a.click(); setShowExport(false)
  }

  const exportPDF = () => {
    const orig = document.title
    document.title = filename
    const style = document.createElement('style')
    style.textContent = `body{font-family:sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;text-align:left}`
    document.head.appendChild(style)
    window.print()
    setTimeout(() => { document.head.removeChild(style); document.title = orig }, 100)
    setShowExport(false)
  }

  const exportWord = () => {
    const rows = getRows()
    const html = `<html><meta charset="utf-8"><body><h2>${filename}</h2><table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table></body></html>`
    const blob = new Blob([html], { type: 'application/msword' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `${filename}.doc`; a.click(); setShowExport(false)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>食记报表</h1>
        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            {([['week','本周'],['month','本月'],['year','本年']] as const).map(([k, label]) => (
              <button key={k} className={`${styles.tab} ${period===k?styles.tabActive:''}`} onClick={()=>setPeriod(k)}>{label}</button>
            ))}
          </div>
          <div className={styles.exportWrap}>
            <button className={styles.exportBtn} onClick={() => setShowExport(!showExport)}>
              导出{periodLabel}食记报告 ▾
            </button>
            {showExport && (
              <div className={styles.exportMenu}>
                <button onClick={exportCSV}>📄 CSV 文件</button>
                <button onClick={exportExcel}>📊 Excel 文件</button>
                <button onClick={exportPDF}>🖨️ PDF 打印</button>
                <button onClick={exportWord}>📝 Word 文件</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryRow}>
        {[
          { v: stats.total, l: '打卡总份数' },
          { v: stats.shops, l: '饮食种类' },
          { v: stats.avgDaily, l: '平均日打卡' },
          { v: stats.totalCals.toLocaleString(), l: '总热量 kcal' },
        ].map((s, i) => (
          <div key={i} className={styles.sumCard}>
            <span className={styles.sumVal}>{s.v}</span>
            <span className={styles.sumLbl}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* Category filter tags */}
      <div className={styles.filterTags}>
        {(['all','food','drink','snack','dessert'] as const).map(f => (
          <button key={f} className={`${styles.fTag} ${catFilter===f?styles.fTagActive:''}`} onClick={()=>setCatFilter(f)}>
            {f==='all'?'全部':catLabels[f]}
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className={styles.chartRow}>
        {/* Trend Line */}
        <div className={styles.chartCard}>
          <h3>打卡趋势</h3>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="label" tick={{fontSize:11,fill:'var(--text-tertiary)'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11,fill:'var(--text-tertiary)'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2.5} dot={{r:3,fill:'var(--color-primary)'}} activeDot={{r:5}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shop Donut */}
        <div className={styles.chartCard}>
          <h3>饮食名称</h3>
          <div className={styles.chartWrap}>
            {shopData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={shopData.slice(0,8)} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="count" nameKey="name" paddingAngle={2}>
                    {shopData.slice(0,8).map((_, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className={styles.noData}>暂无数据</p>}
          </div>
        </div>
      </div>

      {/* Category Bar */}
      <div className={styles.chartCard}>
        <h3>品类分布</h3>
        <div className={styles.chartWrap}>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={catData} layout="vertical">
                <XAxis type="number" tick={{fontSize:11,fill:'var(--text-tertiary)'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="label" tick={{fontSize:12,fill:'var(--text-secondary)'}} axisLine={false} tickLine={false} width={50} />
                <Tooltip contentStyle={tooltipStyle} cursor={{fill:'var(--bg-hover)'}} />
                <Bar dataKey="count" radius={[0,6,6,0]} label={{position:'right',fill:'var(--text-secondary)',fontSize:12}}>
                  {catData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className={styles.noData}>暂无数据</p>}
        </div>
      </div>

      {/* Detail Table */}
      <div className={styles.chartCard}>
        <div className={styles.tableHeader}>
          <h3>明细数据</h3>
          <input className={styles.searchInput} placeholder="搜索..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th onClick={()=>handleSort('date')} className={styles.sortable}>日期 {sortField==='date'?(sortDir==='asc'?'↑':'↓'):''}</th>
                <th onClick={()=>handleSort('name')} className={styles.sortable}>美食 {sortField==='name'?(sortDir==='asc'?'↑':'↓'):''}</th>
                <th>品类</th>
                <th onClick={()=>handleSort('cals')} className={styles.sortable}>热量 {sortField==='cals'?(sortDir==='asc'?'↑':'↓'):''}</th>
              </tr>
            </thead>
            <tbody>
              {tableData.slice(0, 50).map((f, i) => (
                <tr key={i}>
                  <td className={styles.tdDate}>{f.date}</td>
                  <td>{f.log.food_name}</td>
                  <td><span className={styles.catBadge} style={{background:catColors[f.log.meal_type]+'20',color:catColors[f.log.meal_type]}}>{catLabels[f.log.meal_type]}</span></td>
                  <td className={styles.tdCal}>{f.log.calories} kcal</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tableData.length === 0 && <p className={styles.noData}>暂无匹配记录</p>}
        </div>
      </div>
    </div>
  )
}

export default Report
