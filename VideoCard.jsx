import { Link } from 'react-router-dom'
import { formatCount, timeAgo } from '../context/VideoContext.jsx'

export default function VideoCard({ video, size = 'normal' }) {
  const compact = size === 'compact'
  return (
    <Link
      to={`/watch/${video.id}`}
      className="group block card-hover animate-fade-up"
    >
      {/* 缩略图 */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5">
        <img
          src={video.thumb}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22450%22%3E%3Crect width=%22800%22 height=%22450%22 fill=%22%23222%22/%3E%3Ctext x=%22400%22 y=%22230%22 fill=%22%23888%22 font-size=%2240%22 text-anchor=%22middle%22%3E🎬%3C/text%3E%3C/svg%3E' }}
        />
        {/* 时长标签 */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[11px] font-medium backdrop-blur">
          {video.duration}
        </span>
        {/* 分类标签 */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-brand-500/90 text-[11px] font-medium backdrop-blur">
          {video.category}
        </span>
        {/* 播放按钮（hover 显示） */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative w-14 h-14 rounded-full bg-white/90 text-black flex items-center justify-center text-xl pulse-ring">
            ▶
          </div>
        </div>
      </div>

      {/* 信息 */}
      <div className={`flex gap-3 mt-3 ${compact ? '' : ''}`}>
        <Avatar avatar={video.avatar} name={video.author} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm md:text-[15px] leading-snug line-clamp-2 group-hover:text-brand-400 transition-colors">
            {video.title}
          </h3>
          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="truncate">{video.author}</span>
            <span>·</span>
            <span>{formatCount(video.views)} 次观看</span>
            <span>·</span>
            <span>{timeAgo(video.uploadedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function Avatar({ avatar, name, size = 'md' }) {
  const dim = size === 'lg' ? 'w-12 h-12 text-lg' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  if (avatar && avatar.c1) {
    return (
      <div
        className={`shrink-0 ${dim} rounded-full flex items-center justify-center font-bold text-white`}
        style={{ background: `linear-gradient(135deg, ${avatar.c1}, ${avatar.c2})` }}
      >
        {avatar.initial}
      </div>
    )
  }
  return (
    <div className={`shrink-0 ${dim} rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300`}>
      {(name || '?')[0].toUpperCase()}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div>
      <div className="aspect-video rounded-2xl skeleton" />
      <div className="flex gap-3 mt-3">
        <div className="w-9 h-9 rounded-full skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-4 rounded skeleton w-3/4" />
          <div className="h-3 rounded skeleton w-1/2" />
        </div>
      </div>
    </div>
  )
}
