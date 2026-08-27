import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../components/Toaster.jsx'

export default function Login() {
  const { signInWithEmail } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const redirect = params.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
      toast('登录成功，欢迎回来！', 'success')
      navigate(redirect, { replace: true })
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => { setEmail('demo@lumina.app'); setPassword('123456') }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-fade-up">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 glass rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
        {/* 左侧品牌区 */}
        <div className="hidden md:flex relative flex-col justify-between p-10 bg-gradient-to-br from-brand-700/40 via-blue-900/30 to-emerald-900/20">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand-500/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center">▶</div>
              <span className="text-2xl font-extrabold text-gradient">Lumina</span>
            </Link>
          </div>
          <div className="relative space-y-4">
            <h2 className="text-3xl font-bold leading-tight">开启你的<br /><span className="text-gradient">视频创作之旅</span></h2>
            <p className="text-zinc-400 text-sm leading-relaxed">使用邮箱即可快速登录或注册，无需繁琐验证，立即开始上传与分享。</p>
            <ul className="space-y-2 text-sm text-zinc-300">
              <li className="flex items-center gap-2">✨ <span>上传属于你的精彩视频</span></li>
              <li className="flex items-center gap-2">💬 <span>与创作者互动交流</span></li>
              <li className="flex items-center gap-2">🎨 <span>沉浸式优雅观看体验</span></li>
            </ul>
          </div>
          <div className="relative text-xs text-zinc-500">© {new Date().getFullYear()} Lumina Video</div>
        </div>

        {/* 右侧表单 */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 flex items-center justify-center">▶</div>
            <span className="text-xl font-extrabold text-gradient">Lumina</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">邮箱登录 / 注册</h1>
          <p className="text-zinc-500 text-sm mb-6">输入邮箱和密码，首次登录将自动创建账号</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">电子邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">密码</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 font-bold text-white shadow-lg shadow-brand-500/30 hover:opacity-90 disabled:opacity-60 transition"
            >
              {loading ? '处理中...' : '🚀 继续'}
            </button>
          </form>

          <button onClick={fillDemo} className="mt-4 text-xs text-zinc-500 hover:text-brand-400 transition self-center">
            填入演示账号（一键体验）
          </button>

          <p className="mt-6 text-center text-xs text-zinc-600">
            登录即表示同意我们的 <a href="#" className="hover:text-brand-400">服务条款</a> 与 <a href="#" className="hover:text-brand-400">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  )
}
