import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useState } from 'react'

const navItems = [
  { to: '/', label: '首页', icon: '🏠', exact: true },
  { to: '/explore', label: '发现', icon: '🔍' },
  { to: '/upload', label: '上传', icon: '➕', highlight: true },
  { to: '/profile', label: '我的', icon: '👤' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleUpload = (e) => {
    if (!user) { e.preventDefault(); navigate('/login?redirect=/upload') }
  }

  return (
    <div className="min-h-full flex flex-col md:flex-row bg-black text-white">
      {/* 桌面端侧边栏 */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col px-4 py-6 border-r border-white/5 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-lg">▶</div>
          <span className="text-xl font-extrabold text-gradient tracking-tight">Lumina</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) =>
            item.highlight ? (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={handleUpload}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition
                  ${isActive ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-gradient-to-r from-brand-500 to-blue-500 text-white hover:opacity-90'}`
                }
              >
                <span>{item.icon}</span><span>{item.label}</span>
              </NavLink>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition
                  ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`
                }
              >
                <span>{item.icon}</span><span>{item.label}</span>
              </NavLink>
            )
          )}
        </nav>
        <div className="mt-auto glass rounded-2xl p-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            ✨ 一个为你精心设计的视频社区<br />记录每一刻精彩
          </p>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* 移动端顶部栏 */}
        <header className="md:hidden sticky top-0 z-40 glass border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-sm">▶</div>
            <span className="text-lg font-extrabold text-gradient">Lumina</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/explore" className="p-2 text-zinc-300">🔍</Link>
            {user ? (
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center text-xs font-bold">
                {user.avatar?.initial || 'U'}
              </button>
            ) : (
              <Link to="/login" className="text-sm px-3 py-1.5 rounded-lg bg-white text-black font-semibold">登录</Link>
            )}
          </div>
          {menuOpen && user && (
            <div className="absolute top-full right-4 mt-2 w-48 glass rounded-xl p-2 z-50 animate-fade-up">
              <div className="px-3 py-2 text-sm text-zinc-300 border-b border-white/5">{user.email}</div>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm hover:bg-white/5 rounded-lg">我的主页</Link>
              <button onClick={() => { logout(); setMenuOpen(false); navigate('/') }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg">退出登录</button>
            </div>
          )}
        </header>

        <div className="flex-1 px-4 md:px-8 py-4 md:py-6 pb-20 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </div>

        {/* 移动端底部导航 */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/5 px-2 py-2 flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              onClick={item.highlight ? handleUpload : undefined}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px]
                ${isActive ? 'text-brand-400' : 'text-zinc-500'}`
              }
            >
              <span className="text-xl">{item.icon}</span><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  )
}
