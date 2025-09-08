/**
 * Mixed Library 构建产物验证脚本
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 开始验证 Mixed Library 构建产物...\n')

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

function testCommonJSImport() {
  try {
    console.log('\n📦 测试 CommonJS 导入...')
    const modulePath = path.resolve('./cjs/index.cjs')
    delete require.cache[modulePath]

    const lib = require('./cjs/index.cjs')
    const exportsToCheck = ['version', 'libraryInfo']
    let ok = true
    exportsToCheck.forEach(name => {
      const exists = typeof lib[name] !== 'undefined'
      console.log(`${exists ? '✅' : '❌'} 导出 ${name}`)
      if (!exists) ok = false
    })

    // 默认导出以及 utils/components 容器对象
    const hasDefault = typeof lib.default === 'object'
    const hasUtils = lib.default && typeof lib.default.utils === 'object'
    const hasComponents = lib.default && typeof lib.default.components === 'object'
    console.log(`${hasDefault ? '✅' : '❌'} 默认导出对象`)
    console.log(`${hasUtils ? '✅' : '❌'} default.utils 对象`)
    console.log(`${hasComponents ? '✅' : '❌'} default.components 对象`)

    // 测试部分工具函数（不涉及 DOM）
    if (hasUtils) {
      const strCap = lib.default.utils.string.capitalize('hello')
      console.log(`✅ utils.string.capitalize('hello') => ${strCap}`)
      const fmtNum = lib.default.utils.number.format(1234.567, { precision: 1 })
      console.log(`✅ utils.number.format(1234.567) => ${fmtNum}`)
    }

    return ok && hasDefault && hasUtils && hasComponents
  } catch (error) {
    console.log(`❌ CommonJS 导入失败: ${error.message}`)
    return false
  }
}

async function main() {
  let allPassed = true

  console.log('📁 检查构建产物文件...')
  const files = [
    ['es/index.js', 'ESM 主文件'],
    ['cjs/index.cjs', 'CommonJS 主文件'],
    ['dist/index.umd.js', 'UMD 主文件'],
    ['es/index.css', '样式文件 (ESM)']
  ]
  files.forEach(([f, d]) => { if (!checkFileExists(f, d)) allPassed = false })

  // 类型定义（允许在 src 下）
  const esDts = fs.existsSync('es/index.d.ts') ? 'es/index.d.ts' : (fs.existsSync('es/src/index.d.ts') ? 'es/src/index.d.ts' : null)
  const cjsDts = fs.existsSync('cjs/index.d.ts') ? 'cjs/index.d.ts' : (fs.existsSync('cjs/src/index.d.ts') ? 'cjs/src/index.d.ts' : null)
  if (!esDts) { console.log('❌ ESM 类型定义不存在: es/index.d.ts 或 es/src/index.d.ts'); allPassed = false } else { console.log(`✅ ESM 类型定义: ${esDts}`) }
  if (!cjsDts) { console.log('❌ CJS 类型定义不存在: cjs/index.d.ts 或 cjs/src/index.d.ts'); allPassed = false } else { console.log(`✅ CJS 类型定义: ${cjsDts}`) }

  console.log('\n📝 检查文件内容...')
  if (fs.existsSync('es/index.js')) {
    if (!checkFileContent('es/index.js', ['export', 'version', 'libraryInfo'], 'ESM 导出内容')) allPassed = false
  }
  if (fs.existsSync('cjs/index.cjs')) {
    if (!checkFileContent('cjs/index.cjs', ['exports.', 'version', 'libraryInfo'], 'CommonJS 导出内容')) allPassed = false
  }

  console.log('\n🧪 功能性导入测试...')
  if (!testCommonJSImport()) allPassed = false

  console.log('\n' + '='.repeat(60))
  if (allPassed) {
    console.log('🎉 Mixed Library 构建产物验证通过！')
    console.log('✅ 文件完整性检查通过')
    console.log('✅ 内容格式检查通过')
    console.log('✅ 功能测试通过')
  } else {
    console.log('❌ Mixed Library 构建产物验证失败！')
    process.exit(1)
  }
}

main().catch(e => { console.error('❌ 验证过程出错:', e); process.exit(1) })

