import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { registerSW } from './utils/notifications'
import './index.css'

// 注册 Service Worker（推送通知）
registerSW()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
