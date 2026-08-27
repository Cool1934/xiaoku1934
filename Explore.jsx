import { useMemo, useState } from 'react'
import { useVideos } from '../context/VideoContext.jsx'
import VideoCard from '../components/VideoCard.jsx'

export default function Explore() {
  const { videos } = useVideos()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('latest')

  const results = useMemo(() => {
    let list = videos.filter((v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.author.toLowerCase().includes(query.toLowerCase()) ||
      v.category.toLowerCase().includes(query.toLowerCase())
    )
    list = [...list]
    if (sort === 'latest') list.sort((a, b) => b.uploadedAt - a.uploadedAt)
    if (sort === 'popular') list.sort((a, b) => b.views - a.views)
    if (sort === 'liked') list.sort((a, b) => b.likes - a.likes)
    return list
  }, [videos, query, sort])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">发现</h1>
        <p className="text-zinc-500 text-sm">搜索你感兴趣的视频内容</p>
      </div>

      {/* 搜索栏 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索标题、作者、分类..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-500 focus:outline-none text-sm cursor-pointer"
        >
          <option value="latest">最新发布</option>
          <option value="popular">最多观看</option>
          <option value="liked">最多点赞</option>
        </select>
      </div>

      <p className="text-xs text-zinc-500">共找到 {results.length} 个结果</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {results.map((v) => <VideoCard key={v.id} video={v} />)}
      </div>

      {results.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <div className="text-5xl mb-3">🔍</div>
          <p>没有找到匹配的视频</p>
        </div>
      )}
    </div>
  )
}
