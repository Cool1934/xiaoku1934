import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { PlayIcon, SearchIcon, UploadIcon, UserIcon, HomeIcon, LikeIcon, ShareIcon, LogoIcon } from './Icons.jsx'

/* ---------------- storage helpers ---------------- */
const STORE_KEY = 'lumina_data_v1'
const getStore = () => {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {} } catch { return {} }
}
const setStore = (d) => localStorage.setItem(STORE_KEY, JSON.stringify(d))

// 默认演示数据
const seed = () => ({
  users: {
    'demo@lumina.app': { name: '演示用户', avatar: '演' }
  },
  videos: [
    { id: 'demo1', title: '欢迎来到 Lumina · 产品介绍', author: 'Lumina官方', authorEmail: 'demo@lumina.app', duration: '0:42', views: 12890, likes: 842, uploadedAt: Date.now() - 86400000 * 2, description: '这是一个演示视频。\n\n上传你自己的视频，和大家一起分享精彩内容吧！', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
    { id: 'demo2', title: '美丽的自然风光 · 4K航拍合集', author: '自然频道', authorEmail: 'nature@lumina.app', duration: '1:15', views: 5420, likes: 321, uploadedAt: Date.now() - 86400000 * 5, description: '来自世界各地的壮丽风景。', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    { id: 'demo3', title: '如何打造一个好看的视频网站', author: '设计小栈', authorEmail: 'design@lumina.app', duration: '3:08', views: 921, likes: 88, uploadedAt: Date.now() - 3600000 * 6, description: 'UI/UX 设计思路分享。', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  ]
})

const initStore = () => { if (!getStore().videos) { setStore(seed()) } }

/* ---------------- utils ---------------- */
const fmtViews = (n) => n >= 10000 ? (n/10000).toFixed(1)+'万' : n.toString()
const fmtTime = (ts) => {
  const diff = Date.now() - ts
  const d = Math.floor(diff/86400000); if (d>=1) return d+'天前'
  const h = Math.floor(diff/3600000); if (h>=1) return h+'小时前'
  const m = Math.floor(diff/60000); return m>=1 ? m+'分钟前' : '刚刚'
}
const initials = (name='') => name.trim().charAt(0).toUpperCase() || '?'

/* ---------------- components ---------------- */
function Navbar({ user, onLogin, onUpload, onHome, query, setQuery }) {
  return (
    <nav className="navbar">
      <a className="brand" onClick={onHome} style={{cursor:'pointer'}}>
        <span className="logo"><LogoIcon /></span>
        <span>Lumina</span>
      </a>
      <div className="search">
        <SearchIcon style={{width:18,height:18}} />
        <input placeholder="搜索视频…" value={query} onChange={e=>setQuery(e.target.value)} />
      </div>
      <div className="nav-actions">
        <button className="btn btn-primary btn-sm" onClick={onUpload}>
          <UploadIcon style={{width:16,height:16}}/> <span className="hide-sm">上传</span>
        </button>
        {user ? (
          <div className="avatar" title={user.email} style={{cursor:'pointer'}} onClick={onHome}>{initials(user.name)}</div>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onLogin}>登录</button>
        )}
      </div>
    </nav>
  )
}

function VideoCard({ video, onClick }) {
  return (
    <div className="card" onClick={()=>onClick(video)}>
      <div className="thumb">
        <video src={video.src} muted preload="metadata" playsInline />
        <span className="duration">{video.duration}</span>
        <div className="play"><span><PlayIcon /></span></div>
      </div>
      <div className="card-body">
        <div className="card-title">{video.title}</div>
        <div className="card-meta">
          <span className="avatar" style={{width:22,height:22,fontSize:10}}>{initials(video.author)}</span>
          <span>{video.author}</span>
          <span className="dot" />
          <span>{fmtViews(video.views)} 次观看</span>
        </div>
      </div>
    </div>
  )
}

function SideItem({ video, onClick }) {
  return (
    <div className="side-item" onClick={()=>onClick(video)}>
      <div className="thumb"><video src={video.src} muted preload="metadata" playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
      <div className="info">
        <h4>{video.title}</h4>
        <p>{video.author}</p>
        <p>{fmtViews(video.views)} 次观看 · {fmtTime(video.uploadedAt)}</p>
      </div>
    </div>
  )
}

/* ---------------- modals ---------------- */
function LoginModal({ open, onClose, onLogin }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('email') // email | code
  const [err, setErr] = useState('')

  useEffect(()=>{ if(!open){ setStep('email'); setErr(''); setCode('') } }, [open])

  if (!open) return null
  const submitEmail = (e) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr('请输入有效的电子邮箱地址'); return }
    setErr('')
    // 模拟发送验证码
    const c = Math.floor(100000+Math.random()*900000).toString()
    alert(`[演示] 验证码已发送至 ${email}：${c}\n（实际部署时通过邮件发送）`)
    setStep('code')
  }
  const submitCode = (e) => {
    e.preventDefault()
    if (code.length < 4) { setErr('请输入验证码'); return }
    const store = getStore()
    let user = store.users[email]
    if (!user) { user = { name: name || email.split('@')[0], avatar: initials(name || email) }; store.users[email] = user; setStore(store) }
    onLogin({ email, name: user.name, avatar: user.avatar })
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-wrap" onClick={e=>e.stopPropagation()}>
        <div className="modal">
          <button className="modal-close" onClick={onClose}>✕</button>
          <h2>{step==='email' ? '登录 Lumina' : '输入验证码'}</h2>
          <p className="subtitle">{step==='email' ? '使用电子邮箱登录或注册，无需密码' : `验证码已发送至 ${email}`}</p>
          {step==='email' ? (
            <form onSubmit={submitEmail}>
              <div className="field"><label>电子邮箱</label>
                <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} autoFocus required />
              </div>
              <div className="field"><label>昵称（可选）</label>
                <input placeholder="留空将自动生成" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary">发送验证码</button>
              <p className="hint">点击发送即表示同意服务条款</p>
            </form>
          ) : (
            <form onSubmit={submitCode}>
              <div className="field"><label>6 位验证码</label>
                <input inputMode="numeric" maxLength="6" placeholder="123456" value={code} onChange={e=>setCode(e.target.value.replace(/\D/,'') )} autoFocus required />
              </div>
              {err && <p className="error">{err}</p>}
              <button type="submit" className="btn btn-primary">验证并登录</button>
              <button type="button" className="btn btn-ghost" style={{width:'100%',justifyContent:'center',marginTop:10}} onClick={()=>setStep('email')}>← 返回修改邮箱</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function UploadModal({ open, onClose, user, onUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [progress, setProgress] = useState(0)
  const [drag, setDrag] = useState(false)
  const [err, setErr] = useState('')

  useEffect(()=>{ if(!open){ reset() } }, [open])
  const reset = () => { setFile(null); setTitle(''); setDesc(''); setProgress(0); setErr('') }

  if (!open) return null
  const pick = (f) => {
    if (!f) return
    if (!f.type.startsWith('video/')) { setErr('请选择视频文件'); return }
    setErr(''); setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""))
  }
  const submit = (e) => {
    e.preventDefault()
    if (!file) { setErr('请先选择视频文件'); return }
    if (!title.trim()) { setErr('请输入视频标题'); return }
    // 模拟分片上传进度
    let p = 0; setProgress(1)
    const timer = setInterval(()=>{
      p += Math.random()*15 + 5
      if (p>=100) { clearInterval(timer); setProgress(100)
        const url = URL.createObjectURL(file)
        const v = { id: 'v'+Date.now(), title: title.trim(), author: user.name, authorEmail: user.email, duration: '0:00', views: 0, likes: 0, uploadedAt: Date.now(), description: desc || '暂无描述', src: url }
        const store = getStore(); store.videos.unshift(v); setStore(store)
        setTimeout(()=>{ onUploaded(v); onClose() }, 400)
      } else setProgress(p)
    }, 180)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-wrap" onClick={e=>e.stopPropagation()}>
        <div className="modal" style={{maxWidth:480}}>
          <button className="modal-close" onClick={onClose}>✕</button>
          <h2>上传视频</h2>
          <p className="subtitle">已登录为 <b>{user.email}</b></p>
          <form onSubmit={submit}>
            <label className={`drop ${drag?'dragover':''}`}
              onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
              onDrop={e=>{e.preventDefault();setDrag(false);pick(e.dataTransfer.files[0])}}>
              <input type="file" accept="video/*" hidden onChange={e=>pick(e.target.files[0])} />
              <div className="icon"><UploadIcon /></div>
              {file ? <><strong>{file.name}</strong><p style={{fontSize:12,marginTop:6}}>{(file.size/1024/1024).toFixed(1)} MB · 点击或拖拽替换</p></> : <><strong>点击或拖拽视频到此处</strong><p style={{fontSize:12,marginTop:6}}>支持 MP4 / WebM / MOV</p></>}
              {progress>0 && progress<100 && <div className="progress"><div style={{width:progress+'%'}}/></div>}
            </label>
            <div className="field" style={{marginTop:16}}><label>标题</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="给视频起个吸引人的标题" required />
            </div>
            <div className="field"><label>简介（可选）</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="描述一下你的视频内容…" />
            </div>
            {err && <p className="error">{err}</p>}
            <button type="submit" className="btn btn-primary" disabled={progress>0&&progress<100}>
              {progress>0&&progress<100 ? `上传中 ${Math.round(progress)}%` : '发布视频'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ---------------- pages ---------------- */
function HomePage({ videos, onPlay }) {
  return (
    <>
      <h2 className="section-title">推荐视频</h2>
      {videos.length===0 ? (
        <div className="empty"><div className="big">🎬</div><h3>还没有视频</h3><p>成为第一个上传的人吧！</p></div>
      ) : (
        <div className="grid">
          {videos.map(v => <VideoCard key={v.id} video={v} onClick={onPlay}/>)}
        </div>
      )}
    </>
  )
}

function PlayerPage({ video, allVideos, onPlay, onBack, onLike, liked }) {
  const [count, setCount] = useState(video.likes)
  const me = localStorage.getItem('lumina_user')
  const handleLike = () => { if(!me){alert('请先登录');return} onLike(video.id); setCount(c=>c+ (liked?-1:1)) }
  return (
    <div className="player-page">
      <div>
        <div className="player-wrap">
          <video src={video.src} controls autoPlay playsInline />
        </div>
        <div className="video-info">
          <h1>{video.title}</h1>
          <div className="sub">
            <span className="avatar">{initials(video.author)}</span>
            <b>{video.author}</b>
            <span>· {fmtViews(video.views)} 次观看 · {fmtTime(video.uploadedAt)}</span>
          </div>
          <div className="actions">
            <button className={`action-btn ${liked?'active':''}`} onClick={handleLike}><LikeIcon/> {count}</button>
            <button className="action-btn" onClick={()=>{navigator.clipboard?.writeText(location.href);alert('链接已复制')} }><ShareIcon/> 分享</button>
          </div>
          <div className="description">{video.description}</div>
        </div>
      </div>
      <div>
        <h3 className="side-title">相关推荐</h3>
        <div className="side-list">
          {allVideos.filter(v=>v.id!==video.id).slice(0,6).map(v=><SideItem key={v.id} video={v} onClick={onPlay}/>)}
        </div>
      </div>
    </div>
  )
}

/* ---------------- app ---------------- */
export default function App() {
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem('lumina_user')) } catch { return null } })
  const [videos, setVideos] = useState(() => { initStore(); return getStore().videos || [] })
  const [current, setCurrent] = useState(null) // 正在播放
  const [query, setQuery] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [tab, setTab] = useState('home') // mobile bottom nav

  const refresh = () => setVideos(getStore().videos || [])
  const showToast = (m) => { setToast(m); setTimeout(()=>setToast(''), 2200) }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return videos
    return videos.filter(v => v.title.toLowerCase().includes(q) || v.author.toLowerCase().includes(q))
  }, [videos, query])

  const requireLogin = (action) => {
    if (!user) { setLoginOpen(true); showToast('请先登录'); return false }
    return true
  }
  const handleUploadClick = () => { if (requireLogin()) setUploadOpen(true) }
  const onLogin = (u) => { localStorage.setItem('lumina_user', JSON.stringify(u)); setUser(u); showToast(`欢迎，${u.name}`) }

  const likedSet = () => new Set(JSON.parse(localStorage.getItem('lumina_likes')||'[]'))
  const onLike = (id) => {
    const s = likedSet(); let changed=true
    if (s.has(id)) s.delete(id); else s.add(id)
    localStorage.setItem('lumina_likes', JSON.stringify([...s]))
    const store = getStore(); const v = store.videos.find(x=>x.id===id); if(v) v.likes += s.has(id)?1:-1; setStore(store); refresh()
  }
  const isLiked = (id) => likedSet().has(id)

  const onUploaded = (v) => { refresh(); setCurrent(v); showToast('发布成功！') }

  // 增加观看次数（播放时）
  const handlePlay = (v) => {
    const store = getStore(); const x = store.videos.find(vv=>vv.id===v.id); if(x){x.views++}; setStore(store); refresh()
    setCurrent(v); window.scrollTo(0,0)
  }

  return (
    <div className="app">
      <Navbar user={user} onLogin={()=>setLoginOpen(true)} onUpload={handleUploadClick} onHome={()=>setCurrent(null)} query={query} setQuery={setQuery}/>
      <main className="main">
        {current
          ? <PlayerPage video={current} allVideos={videos} onPlay={handlePlay} onBack={()=>setCurrent(null)} onLike={onLike} liked={isLiked(current.id)}/>
          : <HomePage videos={filtered} onPlay={handlePlay}/>}
      </main>

      {/* mobile bottom nav */}
      <nav className="bottom-nav">
        <button className={tab==='home'?'active':''} onClick={()=>{setCurrent(null);setTab('home')}}><HomeIcon/>首页</button>
        <button className={tab==='upload'?'active':''} onClick={()=>{handleUploadClick();setTab('upload')}}><UploadIcon/>上传</button>
        <button className={tab==='me'?'active':''} onClick={()=>{if(requireLogin())setTab('me');else setLoginOpen(true)}}><UserIcon/>我的</button>
      </nav>

      <LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} onLogin={onLogin}/>
      <UploadModal open={uploadOpen} onClose={()=>setUploadOpen(false)} user={user} onUploaded={onUploaded}/>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
