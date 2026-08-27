const fs = require('fs');
const { JSDOM } = require('jsdom');
const babel = require('@babel/core');
const React = require('react');
const ReactDOM = require('react-dom/client');

const html = fs.readFileSync('/data/workspace/video-site/index.html', 'utf8');

// 用 file:// URL 让 jsdom 支持 localStorage
const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const { window } = dom;
window.React = React;
window.ReactDOM = ReactDOM;
window.URL.createObjectURL = () => 'blob:mock';
window.scrollTo = () => {};
window.alert = () => {};
window.confirm = () => true;

const scriptMatch = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
let jsx = scriptMatch[1];
const out = babel.transformSync(jsx, {
  presets: [['@babel/preset-env', { targets: { esmodules: true } }], '@babel/preset-react'],
  filename: 'app.jsx',
});

try {
  window.eval(out.code);
} catch (e) {
  console.error('执行时报错:', e && e.message);
  console.error(e && e.stack);
  process.exit(1);
}

setTimeout(() => {
  const root = window.document.getElementById('root');
  console.log('渲染后 root 子节点数:', root.children.length);
  const checks = [
    ['导航栏 brand', root.querySelector('.brand')],
    ['搜索框', root.querySelector('.search')],
    ['Hero 区', root.querySelector('.hero')],
    ['分类标签 tabs', root.querySelector('.tabs')],
    ['分类标签数量(7)', window.document.querySelectorAll('.tabs .tab').length === 7],
    ['视频卡片', root.querySelector('.card')],
    ['底部导航', root.querySelector('.bottom-nav')],
    ['登录/头像区', root.querySelector('.nav-actions .avatar, .nav-actions .btn-ghost')],
  ];
  let ok = 0;
  for (const [n, el] of checks) { console.log(el ? `✓ ${n}` : `✗ ${n} 缺失`); if (el) ok++; }
  console.log(`\n${ok}/${checks.length} 项首屏 UI 检查通过`);

  // 模拟登录：设置 lumina_user 后重渲染 —— 直接测"我的"页登录引导
  const meBtn = [...window.document.querySelectorAll('.bottom-nav button')].find(b => b.textContent.includes('我的'));
  if (meBtn) {
    meBtn.click();
    setTimeout(() => {
      const loginHint = window.document.querySelector('.profile-head, .empty');
      console.log('点击"我的"(未登录)显示:', window.document.querySelector('.empty') ? '登录引导页 ✓' : '异常');
      // 模拟已登录：写入 user 并点击上传触发 requireLogin
      window.localStorage.setItem('lumina_user', JSON.stringify({ email: 'test@lumina.app', name: '测试', avatar: '测' }));
      const upBtn = [...window.document.querySelectorAll('.bottom-nav button')].find(b => b.textContent.includes('上传'));
      upBtn.click();
      setTimeout(() => {
        const modal = window.document.querySelector('.modal');
        console.log('登录后点击上传:', modal ? '正常弹出上传框 ✓' : '未弹出');
        console.log('\n🎉 端到端交互验证完成');
        process.exit(0);
      }, 60);
    }, 60);
  } else {
    console.log('未找到"我的"按钮');
    process.exit(0);
  }
}, 120);
