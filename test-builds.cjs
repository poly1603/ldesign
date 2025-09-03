/**
 * 测试所有包的构建，跳过有Vue组件问题的包
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// 测试这些可能工作的包（主要是纯TS库）
const PACKAGES_TO_TEST = [
  'api', 'cache', 'crypto', 'engine', 'git', 'http', 
  'i18n', 'pdf', 'qrcode', 'router', 'store', 'theme', 'watermark'
]

// 这些包暂时跳过（包含Vue组件）
const SKIP_PACKAGES = [
  'shared', 'color', 'component', 'device', 'form', 'size', 'template'
]

async function testPackageBuild(packageName) {
  const packageDir = path.join('packages', packageName)
  const buildScript = path.join(packageDir, 'scripts', 'build.js')
  
  if (!fs.existsSync(buildScript)) {
    console.log(`⚠️ ${packageName}: 构建脚本不存在`)
    return { success: false, reason: '构建脚本不存在' }
  }

  console.log(`🔨 测试 ${packageName} 包构建...`)
  
  try {
    const startTime = Date.now()
    
    // 执行构建
    execSync(`node scripts/build.js`, {
      cwd: packageDir,
      stdio: 'pipe',
      timeout: 60000 // 60秒超时
    })
    
    const duration = Date.now() - startTime
    console.log(`✅ ${packageName}: 构建成功 (${duration}ms)`)
    
    return { success: true, duration }
    
  } catch (error) {
    console.log(`❌ ${packageName}: 构建失败`)
    console.log(`   错误: ${error.message.slice(0, 100)}...`)
    
    return { success: false, reason: error.message }
  }
}

async function main() {
  console.log('🚀 开始批量测试包构建...')
  console.log(`📦 测试包数量: ${PACKAGES_TO_TEST.length}`)
  console.log(`⏭️ 跳过包数量: ${SKIP_PACKAGES.length} (Vue组件问题)`)
  console.log('=' * 60)
  
  const results = []
  let successCount = 0
  let totalDuration = 0

  for (const packageName of PACKAGES_TO_TEST) {
    const result = await testPackageBuild(packageName)
    results.push({ packageName, ...result })
    
    if (result.success) {
      successCount++
      totalDuration += result.duration || 0
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 构建测试结果汇总')
  console.log('='.repeat(60))
  console.log(`✅ 成功: ${successCount}/${PACKAGES_TO_TEST.length} 个包`)
  console.log(`❌ 失败: ${PACKAGES_TO_TEST.length - successCount}/${PACKAGES_TO_TEST.length} 个包`)
  console.log(`⏱️ 总时间: ${totalDuration}ms`)
  console.log(`🕐 平均时间: ${Math.round(totalDuration / successCount)}ms per package`)

  console.log('\n📋 详细结果:')
  results.forEach(({ packageName, success, duration, reason }) => {
    if (success) {
      console.log(`  ✅ ${packageName}: ${duration}ms`)
    } else {
      console.log(`  ❌ ${packageName}: ${reason?.slice(0, 50)}...`)
    }
  })

  if (successCount > 0) {
    console.log(`\n🎉 ${successCount} 个包使用 @ldesign/builder 构建成功！`)
  }
  
  if (SKIP_PACKAGES.length > 0) {
    console.log(`\n⚠️ 跳过的包 (需要Vue插件优化): ${SKIP_PACKAGES.join(', ')}`)
  }
}

main().catch(console.error)
