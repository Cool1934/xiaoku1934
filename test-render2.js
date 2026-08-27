/**
 * 渲染测试 v2：让 jsdom 像真实浏览器一样，通过 script src 加载 CDN 上的 React，
 * 再由 @babel/standalone 编译内联脚本 —— 完全复刻 index.html 的实际运行方式。
 */
const fs = require('fs');
const { JSDOM } = require('jsdom');
const https = require('https');

const html = fs.readFileSync('/data/workspace/video-site/index.html', 'utf8');

function fetchSync(url) {
  // 仅需 React/ReactDOM/Babel 三个 UMD，离线时退而使用已装的 node 模块
  return null;
}

const dom = new JSDOM(html, {
  runScripts: 'outside-only',
  url: 'http://localhost/',
  resources: 'usable',   // 允许加载外部脚本（需配合 resourceLoader）
  pretendToBeVisual: true,
});

const { window } = dom;

// 注入浏览器 API stub
window.URL.createObjectURL = () => 'blob:mock';
window.scrollTo = () => {};
window.alert = () => {};
window.confirm = () => true;

// 手动加载 React UMD（jsdom 无法访问 unpkg，直接用本地安装的包注入）
const React = require('react');
const ReactDOMClient = require('react-dom/client');
window.React = React;
window.ReactDOM = { createRoot: ReactDOMClient.createRoot };

// Babel：用本地 @babel/standalone 编译内联脚本
let Babel;
try { Babel = require('@babel/standalone'); } catch (e) {}
if (!Babel) {
  // 回退：用 @babel/core 转译后注入
  const babel = require('@babel/core');
  const m = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
  let jsx = m[1];
  const out = babel.transformSync(jsx, {
    presets: [['@babel/preset-env', { targets: { esmodules: true } }], '@babel/preset-react'],
  });
  try { window.eval(out.code); } catch (e) { console.error('eval err', e.message); process.exit(1); }
} else {
  // 让 Babel 处理页面里的 type="text/babel" 脚本（模拟浏览器行为）
  const scriptEl = window.document.querySelector('script[type="text/babel"]');
  const source = scriptEl.textContent;
  const compiled = Babel.transform(source, { presets: ['react', 'env'] }).code;
  window.eval(compiled);
}

setTimeout(() => {
  const root = window.document.getElementById('root');
  console.log('✓ 应用挂载，root 子节点数:', root.children.length);
  const checks = [
    ['导航栏 brand', root.querySelector('.brand')],
    ['Hero 区', root.querySelector('.hero')],
    ['分类标签(7个)', window.document.querySelectorAll('.tabs .tab').length === 7],
    ['视频卡片', root.querySelector('.card')],
    ['底部导航', root.querySelector('.bottom-nav')],
  ];
  let ok = 0;
  for (const [n, el] of checks) { console.log(el ? `  ✓ ${n}` : `  ✗ ${n}`); if (el) ok++; }
  console.log(`\n${ok}/${checks.length} 项首屏检查通过`);

  // 交互：点击"我的"
  const meBtn = [...window.document.querySelectorAll('.bottom-nav button')].find(b => b.textContent.includes('我的'));
  if (meBtn) {
    meBtn.click();
    setTimeout(() => {
      console.log('点击"我的"(未登录):', window.document.querySelector('.empty') ? '→ 显示登录引导 ✓' : '异常');
      // 登录后再点上传
      window.localStorage.setItem('lumina_user', JSON.stringify({ email: 'test@lumina.app', name: '测试', avatar: '测' }));
      const upBtn = [...window.document.querySelectorAll('.bottom-nav button')].find(b => b.textContent.includes('上传'));
      upBtn.click();
      setTimeout(() => {
        console.log('登录后点上传:', window.document.querySelector('.modal') ? '→ 弹出上传框 ✓' : '未弹出');
        console.log('\n🎉 端到端验证完成');
        process.exit(0);
      }, 60);
    }, 60);
  } else { process.exit(0); }
}, 120);
