import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { FoodProvider } from './contexts/FoodContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Welcome from './pages/Welcome'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import DateDetail from './pages/DateDetail'
import Camera from './pages/Camera'
import Profile from './pages/Profile'
import Account from './pages/Account'
import Gallery from './pages/Gallery'
import Favorites from './pages/Favorites'
import Report from './pages/Report'
import Settings from './pages/Settings'
import Layout from './components/layout/Layout'

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-secondary)' }}>加载中...</div>
  if (!isAuthenticated) return <Navigate to="/welcome" replace />
  return <Outlet />
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationProvider>
        <FoodProvider>
          <BrowserRouter>
            <Routes>
              {/* 未登录可访问 */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* 需登录才可访问 */}
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/date/:date" element={<DateDetail />} />
                  <Route path="/camera" element={<Camera />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/account" element={<Account />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FoodProvider>
        </NotificationProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
