import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext.jsx'

const VideoContext = createContext(null)

const seedVideos = () => {
  const demo = [
    {
      id: 'v1', title: '在冰岛追逐极光 · 4K 航拍', author: '旅行者阿哲', avatar: '🎬',
      thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
      src: 'https://cdn.coverr.co/videos/coverr-aurora-borealis-2673/1080p.mp4',
      duration: '3:42', views: 128400, likes: 9200, category: '旅行',
      uploadedAt: Date.now() - 86400000 * 2,
      description: '记录下冰岛最震撼的极光之夜，每一帧都是壁纸。',
    },
    {
      id: 'v2', title: '10 分钟学会 React 核心原理', author: '代码教室', avatar: '💻',
      thumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      src: 'https://cdn.coverr.co/videos/coverr-typing-on-a-laptop-2621/1080p.mp4',
      duration: '10:15', views: 56200, likes: 4300, category: '科技',
      uploadedAt: Date.now() - 86400000 * 5,
      description: '从组件到 Fiber，帮你建立完整的 React 心智模型。',
    },
    {
      id: 'v3', title: '凌晨四点的城市延时摄影', author: '光影志', avatar: '🌃',
      thumb: 'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=800&q=80',
      src: 'https://cdn.coverr.co/videos/coverr-city-traffic-at-night-2615/1080p.mp4',
      duration: '2:08', views: 89300, likes: 7100, category: '摄影',
      uploadedAt: Date.now() - 86400000 * 1,
      description: '当整座城市还在沉睡，光已经开始流动。',
    },
    {
      id: 'v4', title: '手冲咖啡完整指南 · 从入门到精通', author: '慢生活', avatar: '☕',
      thumb: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
      src: 'https://cdn.coverr.co/videos/coverr-pouring-coffee-1571/1080p.mp4',
      duration: '8:30', views: 34100, likes: 2800, category: '生活',
      uploadedAt: Date.now() - 86400000 * 7,
      description: '水温、研磨度、注水手法，一次讲清楚。',
    },
    {
      id: 'v5', title: '深海鲸鱼的歌声 · 沉浸式体验', author: '海洋频道', avatar: '🐋',
      thumb: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80',
      src: 'https://cdn.coverr.co/videos/coverr-underwater-2605/1080p.mp4',
      duration: '5:55', views: 210500, likes: 18400, category: '自然',
      uploadedAt: Date.now() - 86400000 * 3,
      description: '戴上耳机，潜入 2000 米深的海底世界。',
    },
    {
      id: 'v6', title: '极简主义 · 我的 30 天断舍离', author: '简单生活', avatar: '🍃',
      thumb: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
      src: 'https://cdn.coverr.co/videos/coverr-a-woman-working-on-her-laptop-2628/1080p.mp4',
      duration: '6:12', views: 19800, likes: 1600, category: '生活',
      uploadedAt: Date.now() - 86400000 * 4,
      description: '丢掉 80% 的物品后，我反而拥有了更多。',
    },
  ]
  return demo
}

export function VideoProvider({ children }) {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem('lumina_videos')
    if (saved) {
      try { setVideos(JSON.parse(saved)) } catch (e) { setVideos(seedVideos()) }
    } else {
      setVideos(seedVideos())
    }
  }, [])

  useEffect(() => {
    if (videos.length) localStorage.setItem('lumina_videos', JSON.stringify(videos))
  }, [videos])

  const uploadVideo = useCallback(({ title, description, category, file }) => {
    if (!user) throw new Error('请先登录后再上传')
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const newVideo = {
          id: 'v' + Date.now(),
          title: title || file.name.replace(/\.[^/.]+$/, ''),
          description: description || '暂无简介',
          category: category || '其他',
          author: user.name,
          avatar: user.avatar?.initial || '🎥',
          thumb: URL.createObjectURL(file), // 用本地文件做封面
          src: reader.result,                // DataURL 本地预览播放
          duration: '0:00',
          views: 0, likes: 0,
          uploadedAt: Date.now(),
        }
        setVideos((prev) => [newVideo, ...prev])
        resolve(newVideo)
      }
      reader.readAsDataURL(file)
    })
  }, [user])

  const toggleLike = useCallback((id) => {
    setVideos((prev) => prev.map((v) => v.id === id ? { ...v, likes: v.likes + (v.liked ? -1 : 1), liked: !v.liked } : v))
  }, [])

  const incrementViews = useCallback((id) => {
    setVideos((prev) => prev.map((v) => v.id === id ? { ...v, views: v.views + 1 } : v))
  }, [])

  return (
    <VideoContext.Provider value={{ videos, uploadVideo, toggleLike, incrementViews }}>
      {children}
    </VideoContext.Provider>
  )
}

export function useVideos() {
  const ctx = useContext(VideoContext)
  if (!ctx) throw new Error('useVideos 必须在 VideoProvider 内使用')
  return ctx
}

export function formatCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  if (n >= 1000) return (n / 1000).toFixed(1) + '千'
  return String(n)
}

export function timeAgo(ts) {
  const diff = Date.now() - ts
  const d = Math.floor(diff / 86400000)
  if (d >= 1) return d + '天前'
  const h = Math.floor(diff / 3600000)
  if (h >= 1) return h + '小时前'
  return '刚刚'
}
