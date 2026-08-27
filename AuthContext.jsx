import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

// 简易邮箱校验
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // 启动时读取本地会话
  useEffect(() => {
    const saved = localStorage.getItem('lumina_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch (e) { localStorage.removeItem('lumina_user') }
    }
    setLoading(false)
  }, [])

  const persist = (u) => {
    if (u) localStorage.setItem('lumina_user', JSON.stringify(u))
    else localStorage.removeItem('lumina_user')
    setUser(u)
  }

  // 登录或注册（邮箱 + 密码，自动识别）
  const signInWithEmail = useCallback(async (email, password) => {
    if (!isValidEmail(email)) throw new Error('请输入有效的邮箱地址')
    if (!password || password.length < 6) throw new Error('密码至少 6 位')
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 700))
    // 从本地"数据库"读取已有账号
    const db = JSON.parse(localStorage.getItem('lumina_accounts') || '{}')
    let account = db[email]
    if (account) {
      if (account.password !== password) throw new Error('密码错误，请重试')
    } else {
      account = { email, password, createdAt: Date.now() }
      db[email] = account
      localStorage.setItem('lumina_accounts', JSON.stringify(db))
    }
    persist({ email, name: email.split('@')[0], avatar: avatarFor(email) })
    return true
  }, [])

  const logout = useCallback(() => persist(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}

// 基于邮箱生成稳定的渐变头像
function avatarFor(email) {
  const colors = ['#8b5cf6', '#3b82f6', '#ec4899', '#10b981', '#f59e0b']
  let hash = 0
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) >>> 0
  const c1 = colors[hash % colors.length]
  const c2 = colors[(hash >> 4) % colors.length]
  return { c1, c2, initial: email[0].toUpperCase() }
}
