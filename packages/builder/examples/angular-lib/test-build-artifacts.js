/**
 * Angular Library 构建产物验证脚本
 */

const fs = require('fs')

console.log('🧪 开始验证 Angular Library 构建产物...\n')

function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`)
  return exists
}

function checkFileContent(filePath, patterns, description) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const results = patterns.map(pattern => {
      const match = typeof pattern === 'string' ? content.includes(pattern) : pattern.test(content)
      return { pattern: pattern.toString(), match }
    })
    const allMatch = results.every(r => r.match)
    console.log(`${allMatch ? '✅' : '❌'} ${description}`)
    if (!allMatch) {
      results.forEach(r => { if (!r.match) console.log(`  ❌ 未找到: ${r.pattern}`) })
    }
    return allMatch
  } catch (e) {
    console.log(`❌ ${description}: 读取失败 - ${e.message}`)
    return false
  }
}

async function main() {
  let allPassed = true

  console.log('📁 检查构建产物文件...')
  const files = [
    ['es/public-api.js', 'ESM 主文件'],
    ['cjs/public-api.cjs', 'CommonJS 主文件'],
    ['dist/index.umd.js', 'UMD 主文件']
  ]
  files.forEach(([f, d]) => { if (!checkFileExists(f, d)) allPassed = false })

  // 类型定义（允许在 src 下）
  const esDts = fs.existsSync('es/public-api.d.ts') ? 'es/public-api.d.ts' : (fs.existsSync('es/src/public-api.d.ts') ? 'es/src/public-api.d.ts' : null)
  const cjsDts = fs.existsSync('cjs/public-api.d.ts') ? 'cjs/public-api.d.ts' : (fs.existsSync('cjs/src/public-api.d.ts') ? 'cjs/src/public-api.d.ts' : null)
  if (!esDts) { console.log('❌ ESM 类型定义不存在: es/public-api.d.ts 或 es/src/public-api.d.ts'); allPassed = false } else { console.log(`✅ ESM 类型定义: ${esDts}`) }
  if (!cjsDts) { console.log('❌ CJS 类型定义不存在: cjs/public-api.d.ts 或 cjs/src/public-api.d.ts'); allPassed = false } else { console.log(`✅ CJS 类型定义: ${cjsDts}`) }

  console.log('\n📝 检查文件内容...')
  if (fs.existsSync('es/public-api.js')) {
    if (!checkFileContent('es/public-api.js', ['export', 'HelloComponent'], 'ESM 导出内容')) allPassed = false
  }
  if (fs.existsSync('cjs/public-api.cjs')) {
    if (!checkFileContent('cjs/public-api.cjs', [
      'Object.defineProperty(exports',
      'HelloComponent'
    ], 'CommonJS 导出内容')) allPassed = false
  }

  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('🎉 Angular Library 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
  } else {
    console.log('❌ Angular Library 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(e => { console.error('❌ 验证过程出错:', e); process.exit(1) })

