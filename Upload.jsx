import { useState, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useVideos } from '../context/VideoContext.jsx'
import { useToast } from '../components/Toaster.jsx'

export default function Upload() {
  const { isLoggedIn, user } = useAuth()
  const { uploadVideo } = useVideos()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('生活')
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  if (!isLoggedIn) return <Navigate to="/login?redirect=/upload" replace />

  const handleFile = (f) => {
    if (!f) return
    if (!f.type.startsWith('video/')) { toast('请选择视频文件', 'error'); return }
    if (f.size > 500 * 1024 * 1024) { toast('视频不能超过 500MB', 'error'); return }
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''))
  }

  const onDrop = (e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast('请先选择视频文件', 'error'); return }
    if (!title.trim()) { toast('请填写标题', 'error'); return }

    setUploading(true)
    setProgress(0)
    // 模拟分块上传进度
    const timer = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 15, 95)), 200)

    try {
      const video = await uploadVideo({ title, description, category, file })
      clearInterval(timer)
      setProgress(100)
      toast('上传成功！', 'success')
      setTimeout(() => navigate(`/watch/${video.id}`), 600)
    } catch (err) {
      clearInterval(timer)
      toast(err.message, 'error')
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">上传视频</h1>
        <p className="text-zinc-500 text-sm">欢迎你，<span className="text-brand-400 font-medium">{user.name}</span> 👋 分享你的精彩创作</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 拖拽上传区 */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[220px]
            ${dragOver ? 'border-brand-500 bg-brand-500/10' : file ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-white/15 hover:border-brand-500/60 hover:bg-white/5'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {file ? (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl mb-3">✅</div>
              <p className="font-semibold text-emerald-400">{file.name}</p>
              <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · 点击更换</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center text-3xl mb-3">⬆️</div>
              <p className="font-semibold">拖拽视频到此处，或<span className="text-brand-400">点击选择文件</span></p>
              <p className="text-xs text-zinc-500 mt-1">支持 MP4 / WebM / MOV，最大 500MB</p>
            </>
          )}
        </div>

        {/* 进度条 */}
        {uploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>上传中...</span><span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* 表单 */}
        <div className="space-y-4 glass rounded-2xl p-5 md:p-6">
          <Field label="标题" required>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给你的视频起个吸引人的标题"
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-brand-500 focus:outline-none text-sm"
              maxLength={80}
            />
          </Field>
          <Field label="简介">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述一下你的视频内容..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-brand-500 focus:outline-none text-sm resize-none"
              maxLength={300}
            />
          </Field>
          <Field label="分类">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-brand-500 focus:outline-none text-sm cursor-pointer"
            >
              {['生活', '旅行', '科技', '摄影', '自然', '教育', '娱乐', '其他'].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-500 to-blue-500 font-bold text-white shadow-lg shadow-brand-500/30 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {uploading ? '上传中...' : '🚀 发布视频'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
        {label} {required && <span className="text-brand-500">*</span>}
      </label>
      {children}
    </div>
  )
}
