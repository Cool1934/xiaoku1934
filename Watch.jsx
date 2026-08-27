import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useVideos, formatCount } from '../context/VideoContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { Avatar } from '../components/VideoCard.jsx'
import { useToast } from '../components/Toaster.jsx'

export default function Watch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { videos, toggleLike, incrementViews } = useVideos()
  const { user } = useAuth()
  const { toast } = useToast()

  const video = videos.find((v) => v.id === id)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')

  // 播放器状态
  const playerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [seeking, setSeeking] = useState(false)

  // 记录观看
  useEffect(() => { if (video) incrementViews(video.id) }, [video, incrementViews])

  // 加载评论
  useEffect(() => {
    if (!video) return
    const key = `lumina_comments_${video.id}`
    const saved = localStorage.getItem(key)
    setComments(saved ? JSON.parse(saved) : [
      { id: 1, author: '小透明', avatar: { c1: '#3b82f6', c2: '#8b5cf6', initial: '小' }, text: '画质太棒了，感谢分享！', time: Date.now() - 3600000 },
      { id: 2, author: '路人甲', avatar: { c1: '#ec4899', c2: '#f59e0b', initial: '路' }, text: '学到了很多，已三连~', time: Date.now() - 7200000 },
    ])
  }, [video])

  useEffect(() => { if (video) localStorage.setItem(`lumina_comments_${video.id}`, JSON.stringify(comments)) }, [video, comments])

  const togglePlay = useCallback(() => {
    const p = playerRef.current
    if (!p) return
    if (p.paused) { p.play(); setPlaying(true) } else { p.pause(); setPlaying(false) }
  }, [])

  const onSeek = (e) => {
    const p = playerRef.current
    if (!p) return
    const t = Number(e.target.value)
    p.currentTime = t
    setProgress(t)
  }

  const onVolume = (e) => {
    const p = playerRef.current
    if (!p) return
    const v = Number(e.target.value)
    p.volume = v
    setVolume(v)
    setMuted(v === 0)
  }

  const toggleMute = () => {
    const p = playerRef.current
    if (!p) return
    p.muted = !muted
    setMuted(!muted)
  }

  const changeSpeed = () => {
    const p = playerRef.current
    if (!p) return
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
    const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length]
    p.playbackRate = next
    setSpeed(next)
  }

  const toggleFullscreen = () => {
    const wrap = document.getElementById('player-wrap')
    if (!document.fullscreenElement) wrap?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60), ss = Math.floor(s % 60)
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  const addComment = (e) => {
    e.preventDefault()
    if (!user) { toast('请先登录后再评论', 'error'); navigate('/login'); return }
    if (!newComment.trim()) return
    setComments((prev) => [...prev, {
      id: Date.now(), author: user.name, avatar: user.avatar, text: newComment.trim(), time: Date.now(),
    }])
    setNewComment('')
  }

  if (!video) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-3">😢</p>
        <p className="text-zinc-400 mb-4">视频不存在或已被删除</p>
        <Link to="/" className="text-brand-400 hover:underline">返回首页</Link>
      </div>
    )
  }

  const recommended = videos.filter((v) => v.id !== video.id).slice(0, 8)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      {/* 主播放区 */}
      <div className="space-y-5 min-w-0">
        {/* 播放器 */}
        <div
          id="player-wrap"
          className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/5 group"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => showControls && setShowControls(true)}
          onClick={togglePlay}
        >
          <video
            ref={playerRef}
            src={video.src}
            poster={video.thumb}
            className="w-full h-full object-contain"
            onTimeUpdate={(e) => !seeking && setProgress(e.target.currentTime)}
            onLoadedMetadata={(e) => setDuration(e.target.duration)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            playsInline
          />

          {/* 播放按钮遮罩 */}
          {!playing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 rounded-full bg-white/90 text-black flex items-center justify-center text-3xl shadow-2xl">▶</div>
            </div>
          )}

          {/* 底部控制条 */}
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 md:p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
            {/* 进度条 */}
            <input
              type="range"
              min={0} max={duration || 0} step={0.1}
              value={progress}
              onChange={onSeek}
              onMouseDown={() => setSeeking(true)}
              onMouseUp={() => setSeeking(false)}
              className="thumb w-full cursor-pointer"
              style={{ background: `linear-gradient(to right, #8b5cf6 ${duration ? (progress / duration) * 100 : 0}%, rgba(255,255,255,.25) 0)` }}
            />
            <div className="flex items-center gap-2 md:gap-3 mt-2 text-white text-sm">
              <button onClick={togglePlay} className="p-1.5 hover:bg-white/10 rounded-lg w-9 h-9 flex items-center justify-center">
                {playing ? '⏸️' : '▶️'}
              </button>
              <button onClick={toggleMute} className="p-1.5 hover:bg-white/10 rounded-lg w-9 h-9 flex items-center justify-center hidden sm:flex">
                {muted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                onChange={onVolume}
                className="thumb w-20 hidden sm:block cursor-pointer"
              />
              <span className="text-xs text-zinc-300 tabular-nums ml-1">
                {formatTime(progress)} / {formatTime(duration)}
              </span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={changeSpeed} className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-lg">{speed}x</button>
                <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/10 rounded-lg w-9 h-9 flex items-center justify-center">⛶</button>
              </div>
            </div>
          </div>
        </div>

        {/* 标题与操作 */}
        <div className="space-y-4">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <Avatar avatar={video.avatar} name={video.author} size="lg" />
              <div>
                <p className="font-semibold text-sm">{video.author}</p>
                <p className="text-xs text-zinc-500">{formatCount(video.views)} 次观看</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (!user) { toast('请先登录后再点赞', 'error'); navigate('/login') } else { toggleLike(video.id); toast(video.liked ? '已取消点赞' : '点赞成功！', 'success') } }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${video.liked ? 'bg-brand-500 text-white' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <span>{video.liked ? '❤️' : '🤍'}</span>{formatCount(video.likes)}
              </button>
              <button onClick={() => navigator.share?.({ title: video.title, url: window.location.href }).catch(() => { navigator.clipboard.writeText(window.location.href); toast('链接已复制', 'success') })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10">
                🔗 分享
              </button>
            </div>
          </div>
          <div className="glass rounded-2xl p-4 text-sm text-zinc-300 leading-relaxed">{video.description}</div>
        </div>

        {/* 评论区 */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg">评论 <span className="text-zinc-500 text-sm font-normal">{comments.length}</span></h2>
          <form onSubmit={addComment} className="flex gap-3">
            <Avatar avatar={user?.avatar} name={user?.name || '?'} size="md" />
            <div className="flex-1 flex gap-2">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={user ? '写下你的评论...' : '登录后参与评论'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
              />
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 font-semibold text-sm">发送</button>
            </div>
          </form>
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3 animate-fade-up">
                <Avatar avatar={c.avatar} name={c.author} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{c.author}</span>
                    <span className="text-xs text-zinc-500">{timeAgo(c.time)}</span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-0.5">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 推荐列表 */}
      <aside className="space-y-4">
        <h2 className="font-bold text-lg hidden lg:block">推荐视频</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {recommended.map((v) => (
            <Link key={v.id} to={`/watch/${v.id}`} className="flex gap-3 group card-hover">
              <div className="relative w-40 sm:w-32 lg:w-40 shrink-0 aspect-video rounded-xl overflow-hidden bg-zinc-900">
                <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px]">{v.duration}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">{v.title}</h3>
                <p className="text-xs text-zinc-500 mt-1 truncate">{v.author}</p>
                <p className="text-xs text-zinc-500">{formatCount(v.views)} 次观看</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  )
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return m + '分钟前'
  const h = Math.floor(m / 60)
  if (h < 24) return h + '小时前'
  return Math.floor(h / 24) + '天前'
}
