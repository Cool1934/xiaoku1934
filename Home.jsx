import { useMemo, useState } from 'react'
import { useVideos } from '../context/VideoContext.jsx'
import VideoCard, { SkeletonCard } from '../components/VideoCard.jsx'
import { Link } from 'react-router-dom'

export default function Home() {
  const { videos } = useVideos()
  const [activeCat, setActiveCat] = useState('全部')
  const [loading, setLoading] = useState(false)

  const categories = useMemo(() => ['全部', ...new Set(videos.map((v) => v.category))], [videos])
  const filtered = useMemo(() => activeCat === '全部' ? videos : videos.filter((v) => v.category === activeCat), [videos, activeCat])

  return (
    <div className="space-y-8">
      {/* Hero 区 */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700/40 via-blue-900/30 to-emerald-900/20 border border-white/5 p-6 md:p-12">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-brand-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="relative max-w-2xl space-y-4 animate-fade-up">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-brand-300 backdrop-blur">✨ 全新上线</span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            发现值得 <span className="text-gradient">沉浸</span> 的视频
          </h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-lg">
            一个简洁、优雅的视频社区。上传你的创作，探索来自世界各地的高质量内容。
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/upload" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform">
              ➕ 开始上传
            </Link>
            <a href="#feed" className="px-6 py-3 rounded-xl glass font-semibold hover:bg-white/10 transition-colors">
              浏览视频
            </a>
          </div>
        </div>
      </section>

      {/* 分类筛选 */}
      <section id="feed" className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">推荐视频</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCat(cat); setLoading(true); setTimeout(() => setLoading(false), 300) }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition
                  ${activeCat === cat ? 'bg-brand-500 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 响应式网格：手机1列、平板2列、桌面3-4列 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((v) => <VideoCard key={v.id} video={v} />)
          }
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <div className="text-5xl mb-3">🎥</div>
            <p>该分类下还没有视频，快来上传第一个吧！</p>
          </div>
        )}
      </section>
    </div>
  )
}
