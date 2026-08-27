# Lumina 视频社区 · 部署与扩展指南

一个纯前端、零依赖的视频社区（邮箱登录 · 上传 · 播放 · 评论 · 订阅 · 稍后观看）。

## 一、本地运行（最快）

本项目为单文件静态应用，**双击 `index.html` 即可在浏览器打开**。

若用 VS Code，推荐装 Live Server 插件后右键 "Open with Live Server"，避免 `localStorage` 在某些协议下的限制。

```bash
# 或任意静态服务器
npx serve .
# 访问 http://localhost:3000
```

## 二、一键部署到 Vercel（推荐）

1. 注册 [vercel.com](https://vercel.com)，用 GitHub 账号授权。
2. 将本项目推送到一个 GitHub 仓库。
3. 在 Vercel 点击 **Import Project** → 选该仓库 → **Deploy**。
4. 无需任何配置，约 30 秒部署完成，获得 `https://xxx.vercel.app` 公网地址。

> 后续 `git push` 自动触发重新部署。

## 三、部署到 Netlify

1. 注册 [netlify.com](https://app.netlify.com)。
2. **Sites** → **Add new site** → **Import from Git** → 选 GitHub 仓库。
3. Build command 留空，Publish directory 填 `.`（当前目录）。
4. 点击 Deploy。

或直接在 Netlify 拖拽整个文件夹到 "Manual deploy" 区域，零配置上线。

## 四、功能说明

| 功能 | 说明 |
|------|------|
| ✉️ 邮箱登录 | 输入邮箱 → 验证码（演示模式直接弹窗显示），注册即登录 |
| ⬆️ 上传视频 | **必须登录**，支持拖拽，本地 `URL.createObjectURL` 预览 |
| ▶️ 在线播放 | 原生 video 控件 + 相关推荐 |
| 💬 评论 | 登录后可评论、点赞，按时间排序 |
| 🔔 订阅 | 订阅作者频道，"我的"页聚合订阅更新 |
| ⏰ 稍后观看 | 收藏视频到个人列表 |
| 🏷️ 分类 | 科技/设计/自然/游戏/音乐/生活 过滤 |
| 📱 响应式 | 手机单列 + 底部导航，电脑多列 + 侧栏 |

## 五、接入真实后端（生产化）

当前数据存于浏览器 `localStorage`，适合演示。上线生产建议替换：

- **认证**：接入 NextAuth / Auth.js，用邮件 Magic Link 或 SMTP 验证码。
- **视频存储**：上传到 AWS S3 / 阿里云 OSS / Cloudinary，通过预签名 URL 直传。
- **转码**：FFmpeg → HLS (m3u8) 自适应码率。
- **数据库**：PostgreSQL / Supabase 存视频元数据、评论、订阅关系。
- **搜索**：接入 MeiliSearch 或 Algolia。

## 六、目录结构

```
video-site/
├── index.html      # 整个应用（HTML + CSS + React JSX 内联）
├── README.md       # 快速开始
├── DEPLOY.md       # 本文件
└── .gitignore
```

> 提示：因采用 React + Babel 内联编译，无需 `npm install` 即可运行；如需拆分成组件工程，可将 JSX 迁移到 Vite + React 项目。
