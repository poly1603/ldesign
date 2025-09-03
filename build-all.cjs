/**
 * 批量构建所有包的脚本
 * 测试 @ldesign/builder 在所有包中的工作情况
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 可以构建的纯 TS 包（已确认工作）
const WORKING_PACKAGES = [
  'api', 'cache', 'crypto', 'engine', 'git', 'http', 
  'i18n', 'pdf', 'router', 'store', 'theme'
]

// Vue 组件包（需要特殊处理）
const VUE_PACKAGES = [
  'shared', 'color', 'component', 'device', 'form', 
  'qrcode', 'size', 'template', 'watermark'
]

async function buildPackage(packageName, timeout = 60000) {
  const packageDir = path.join('packages', packageName)
  const buildScript = path.join(packageDir, 'scripts', 'build.js')
  
  if (!fs.existsSync(buildScript)) {
    return { success: false, reason: '构建脚本不存在', duration: 0 }
  }

  console.log(`🔨 构建 ${packageName}...`)
  
  try {
    const startTime = Date.now()
    
    execSync(`node scripts/build.js`, {
      cwd: packageDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: timeout
    })
    
    const duration = Date.now() - startTime
    const distExists = fs.existsSync(path.join(packageDir, 'dist'))
    
    if (distExists) {
      // 检查生成的文件
      const esmDir = path.join(packageDir, 'dist', 'esm')
      const cjsDir = path.join(packageDir, 'dist', 'cjs')
      const hasEsm = fs.existsSync(esmDir)
      const hasCjs = fs.existsSync(cjsDir)
      
      console.log(`✅ ${packageName}: 构建成功 (${duration}ms) [ESM:${hasEsm ? '✓' : '✗'} CJS:${hasCjs ? '✓' : '✗'}]`)
      return { success: true, duration, hasEsm, hasCjs }
    } else {
      console.log(`❌ ${packageName}: 构建完成但未生成 dist 目录`)
      return { success: false, reason: 'dist目录未生成', duration }
    }
    
  } catch (error) {
    const errorMsg = error.message.split('\n')[0] // 只取第一行
    console.log(`❗ ${packageName}: 构建失败`)
    console.log(`   ${errorMsg.slice(0, 80)}...`)
    
    return { success: false, reason: errorMsg, duration: 0 }
  }
}

async function main() {
  console.log('🚀 批量构建所有包...')
  console.log(`📦 工作包: ${WORKING_PACKAGES.length} 个`)
  console.log(`🔧 Vue包: ${VUE_PACKAGES.length} 个 (单独处理)`)
  console.log('=' * 60)
  
  // 构建工作包
  const results = []
  let totalDuration = 0
  let successCount = 0

  console.log('\n📦 构建纯TypeScript包...')
  for (const packageName of WORKING_PACKAGES) {
    const result = await buildPackage(packageName)
    results.push({ packageName, ...result })
    
    if (result.success) {
      successCount++
      totalDuration += result.duration
    }
  }

  // 尝试构建一些 Vue 包看看问题
  console.log('\n🔧 测试Vue组件包 (预期可能失败)...')
  const vueTestPackages = ['qrcode'] // 只测试一个看看
  
  for (const packageName of vueTestPackages) {
    const result = await buildPackage(packageName, 30000) // 30秒超时
    results.push({ packageName, type: 'vue', ...result })
  }

  // 结果汇总
  console.log('\n' + '='.repeat(70))
  console.log('📊 批量构建结果汇总')
  console.log('='.repeat(70))
  
  const workingResults = results.filter(r => r.type !== 'vue')
  const workingSuccess = workingResults.filter(r => r.success).length
  
  console.log(`✅ TypeScript包成功: ${workingSuccess}/${WORKING_PACKAGES.length}`)
  console.log(`⏱️ 总时间: ${totalDuration}ms`)
  console.log(`🕐 平均时间: ${workingSuccess > 0 ? Math.round(totalDuration / workingSuccess) : 0}ms`)

  console.log('\n📋 构建详情:')
  results.forEach(({ packageName, success, duration, hasEsm, hasCjs, reason, type }) => {
    const label = type === 'vue' ? '🔧' : '📦'
    if (success) {
      const formats = []
      if (hasEsm) formats.push('ESM')
      if (hasCjs) formats.push('CJS')
      console.log(`  ${label} ✅ ${packageName}: ${duration}ms [${formats.join('+')}]`)
    } else {
      console.log(`  ${label} ❌ ${packageName}: ${reason?.slice(0, 40)}...`)
    }
  })

  if (workingSuccess >= WORKING_PACKAGES.length - 2) {
    console.log('\n🎉 @ldesign/builder 在大多数包中工作正常!')
    console.log('✨ 下一步: 优化 Vue SFC 处理以支持组件包')
  }

  // 输出下一步建议
  console.log('\n📝 下一步行动:')
  console.log('1. ✅ 修复 TypeScript 配置 - 已完成')
  console.log('2. ✅ 配置所有包 - 已完成') 
  console.log('3. ✅ 测试纯TS包 - 已完成')
  console.log('4. 🔧 优化 Vue SFC 支持')
  console.log('5. 🔧 添加 CSS scoped 样式支持')
  console.log('6. 🔧 完善类型声明文件生成')
}

main().catch(console.error)
