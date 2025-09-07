/**
 * 比较 Rollup 和 Rolldown 构建结果的脚本
 */

import fs from 'fs'
import path from 'path'

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getFileStats(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return {
      exists: true,
      size: stats.size,
      formattedSize: formatBytes(stats.size)
    }
  } catch (error) {
    return {
      exists: false,
      size: 0,
      formattedSize: 'N/A'
    }
  }
}

async function compareBuildOutputs() {
  console.log('🔍 比较 Rollup 和 Rolldown 构建结果\n')

  // 先运行 Rollup 构建
  console.log('📦 运行 Rollup 构建...')
  const { execSync } = await import('child_process')
  
  try {
    execSync('pnpm run clean:rollup', { stdio: 'inherit' })
    execSync('pnpm exec rollup -c rollup.simple.config.js', { stdio: 'inherit' })
    
    // 备份 Rollup 输出
    if (fs.existsSync('dist-rollup')) {
      fs.rmSync('dist-rollup', { recursive: true })
    }
    fs.renameSync('dist', 'dist-rollup')
    
    console.log('✅ Rollup 构建完成\n')
  } catch (error) {
    console.error('❌ Rollup 构建失败:', error.message)
    return
  }

  // 运行 Rolldown 构建
  console.log('📦 运行 Rolldown 构建...')
  
  try {
    execSync('pnpm run clean:rolldown', { stdio: 'inherit' })
    execSync('pnpm exec rolldown -c rolldown.simple.config.js', { stdio: 'inherit' })
    
    // 备份 Rolldown 输出
    if (fs.existsSync('dist-rolldown')) {
      fs.rmSync('dist-rolldown', { recursive: true })
    }
    fs.renameSync('dist', 'dist-rolldown')
    
    console.log('✅ Rolldown 构建完成\n')
  } catch (error) {
    console.error('❌ Rolldown 构建失败:', error.message)
    return
  }

  // 比较文件
  const files = ['index.js', 'index.cjs', 'index.js.map', 'index.cjs.map']
  
  console.log('📊 构建结果对比:\n')
  console.log('| 文件 | Rollup | Rolldown | 差异 |')
  console.log('|------|--------|----------|------|')
  
  for (const file of files) {
    const rollupFile = path.join('dist-rollup', file)
    const rolldownFile = path.join('dist-rolldown', file)
    
    const rollupStats = getFileStats(rollupFile)
    const rolldownStats = getFileStats(rolldownFile)
    
    let diff = 'N/A'
    if (rollupStats.exists && rolldownStats.exists) {
      const diffBytes = rolldownStats.size - rollupStats.size
      const diffPercent = ((diffBytes / rollupStats.size) * 100).toFixed(1)
      diff = `${diffBytes > 0 ? '+' : ''}${formatBytes(Math.abs(diffBytes))} (${diffPercent}%)`
    }
    
    console.log(`| ${file} | ${rollupStats.formattedSize} | ${rolldownStats.formattedSize} | ${diff} |`)
  }

  console.log('\n📈 总结:')
  
  // 计算总大小
  let rollupTotal = 0
  let rolldownTotal = 0
  
  for (const file of files.filter(f => !f.endsWith('.map'))) {
    const rollupFile = path.join('dist-rollup', file)
    const rolldownFile = path.join('dist-rolldown', file)
    
    const rollupStats = getFileStats(rollupFile)
    const rolldownStats = getFileStats(rolldownFile)
    
    if (rollupStats.exists) rollupTotal += rollupStats.size
    if (rolldownStats.exists) rolldownTotal += rolldownStats.size
  }
  
  const totalDiff = rolldownTotal - rollupTotal
  const totalDiffPercent = ((totalDiff / rollupTotal) * 100).toFixed(1)
  
  console.log(`- Rollup 总大小: ${formatBytes(rollupTotal)}`)
  console.log(`- Rolldown 总大小: ${formatBytes(rolldownTotal)}`)
  console.log(`- 差异: ${totalDiff > 0 ? '+' : ''}${formatBytes(Math.abs(totalDiff))} (${totalDiffPercent}%)`)
  
  if (Math.abs(totalDiff) < 1024) {
    console.log('✅ 两种打包工具的输出大小基本一致')
  } else if (rolldownTotal < rollupTotal) {
    console.log('🎉 Rolldown 输出更小')
  } else {
    console.log('📝 Rollup 输出更小')
  }
  
  console.log('\n📁 输出目录:')
  console.log('- Rollup: dist-rollup/')
  console.log('- Rolldown: dist-rolldown/')
}

compareBuildOutputs().catch(console.error)
