import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import RightPanel from './RightPanel'
import styles from './Layout.module.css'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <TopNav onMenuClick={() => setSidebarOpen(v => !v)} />
      <div className={styles.body}>
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
        <main className={styles.main}>
          <Outlet />
        </main>
        <RightPanel />
      </div>
      <footer className={styles.footer}>
        <span>食记簿 © 2026</span>
        <span>·</span>
        <a href="#">隐私协议</a>
        <span>·</span>
        <a href="#">反馈</a>
      </footer>
    </div>
  )
}

export default Layout
