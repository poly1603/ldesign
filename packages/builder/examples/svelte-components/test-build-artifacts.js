/**
 * Svelte Components 构建产物验证脚本（最小）
 */

const fs = require('fs')

console.log('🧪 开始验证 Svelte Components 构建产物...\n')

function check(file, desc) {
  const ok = fs.existsSync(file)
  console.log(`${ok ? '✅' : '❌'} ${desc}: ${file}`)
  return ok
}

let all = true
all &= check('es/index.js', 'ESM 主文件')
all &= check('cjs/index.cjs', 'CJS 主文件')
all &= check('dist/index.umd.js', 'UMD 主文件')

console.log('\n📝 检查 ESM 导出内容...')
if (fs.existsSync('es/index.js')) {
  const txt = fs.readFileSync('es/index.js', 'utf-8')
  const ok = txt.includes('export') && txt.includes('Hello')
  console.log(`${ok ? '✅' : '❌'} ESM 导出 Hello`)
  all &= ok
}

console.log('\n' + '='.repeat(60))
if (all) {
  console.log('🎉 Svelte Components 构建产物验证通过！')
} else {
  console.log('❌ Svelte Components 构建产物验证失败！')
  process.exit(1)
}

