import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useVideos, formatCount } from '../context/VideoContext.jsx'
import VideoCard, { Avatar } from '../components/VideoCard.jsx'

export default function Profile() {
  const { user, logout } = useAuth()
  const { videos } = useVideos()
  if (!user) return <Navigate to="/login?redirect=/profile" replace />

  const myVideos = videos.filter((v) => v.author === user.name)

  return (
    <div className="space-y-8 animate-fade-up">
      {/* 用户信息头部 */}
      <section className="relative overflow-hidden rounded-3xl glass border border-white/5 p-6 md:p-10">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <Avatar avatar={user.avatar} name={user.name} size="lg" />
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
            <p className="text-zinc-400 text-sm">{user.email}</p>
            <div className="flex gap-5 mt-4 justify-center sm:justify-start">
              <Stat num={myVideos.length} label="作品" />
              <Stat num={formatCount(myVideos.reduce((s, v) => s + v.views, 0))} label="总播放" />
              <Stat num={formatCount(myVideos.reduce((s, v) => s + v.likes, 0))} label="总获赞" />
            </div>
          </div>
          <button onClick={logout} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-sm font-medium border border-white/10 transition">
            退出登录
          </button>
        </div>
      </section>

      {/* 我的视频 */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">我的作品</h2>
          <Link to="/upload" className="text-sm text-brand-400 hover:underline">上传新视频 →</Link>
        </div>
        {myVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {myVideos.map((v) => <VideoCard key={v.id} video={v} />)}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-2xl border border-white/5">
            <div className="text-5xl mb-3">🎬</div>
            <p className="text-zinc-400 mb-4">你还没有上传过视频</p>
            <Link to="/upload" className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 font-semibold text-sm">上传第一个视频</Link>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ num, label }) {
  return (
    <div>
      <p className="font-bold text-lg">{num}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  )
}
