const fs = require('fs');
const babel = require('@babel/core');

const html = fs.readFileSync('/data/workspace/video-site/index.html', 'utf8');
const m = html.match(/<script type="text\/babel"[^>]*>([\s\S]*?)<\/script>/);
let jsx = m[1];

try {
  const out = babel.transformSync(jsx, {
    presets: [['@babel/preset-env', { targets: { esmodules: true } }], '@babel/preset-react'],
    filename: 'app.jsx',
  });
  console.log('✓ JSX 转译为有效 JS，无语法错误');
  console.log('  转译后字节数:', out.code.length);
} catch (e) {
  console.error('✗ 转译失败:');
  console.error('  行号:', e.loc ? `${e.loc.line}:${e.loc.column}` : '未知');
  console.error('  信息:', e.message);
  process.exit(1);
}
