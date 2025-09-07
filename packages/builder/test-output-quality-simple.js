/**
 * 简化的输出质量验证测试
 */

import fs from 'fs'
import path from 'path'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function validateOutputQuality() {
  console.log('🔍 开始输出质量验证...')
  
  const outputDir = 'dist'
  const checks = []
  
  // 1. 文件完整性检查
  console.log('\n📁 检查文件完整性...')
  const requiredFiles = ['index.js', 'index.cjs', 'index.js.map', 'index.cjs.map']
  const fileCheck = { name: '文件完整性', passed: true, details: [], errors: [], score: 100 }
  
  for (const file of requiredFiles) {
    const filePath = path.join(outputDir, file)
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath)
      fileCheck.details.push(`✅ ${file} 存在 (${formatBytes(stats.size)})`)
      
      if (stats.size === 0) {
        fileCheck.errors.push(`❌ ${file} 文件为空`)
        fileCheck.passed = false
        fileCheck.score -= 20
      }
    } else {
      fileCheck.errors.push(`❌ ${file} 缺失`)
      fileCheck.passed = false
      fileCheck.score -= 25
    }
  }
  checks.push(fileCheck)
  
  // 2. 功能完整性检查
  console.log('\n🔧 检查功能完整性...')
  const funcCheck = { name: '功能完整性', passed: true, details: [], errors: [], score: 100 }
  
  // 检查 ESM
  const esmPath = path.join(outputDir, 'index.js')
  if (fs.existsSync(esmPath)) {
    const esmContent = fs.readFileSync(esmPath, 'utf-8')
    
    if (esmContent.includes('export')) {
      funcCheck.details.push('✅ ESM 包含导出语句')
    } else {
      funcCheck.errors.push('❌ ESM 缺少导出语句')
      funcCheck.passed = false
      funcCheck.score -= 30
    }
    
    if (esmContent.startsWith('/*!')) {
      funcCheck.details.push('✅ ESM 包含 Banner')
    } else {
      funcCheck.errors.push('❌ ESM 缺少 Banner')
      funcCheck.score -= 10
    }
  }
  
  // 检查 CJS
  const cjsPath = path.join(outputDir, 'index.cjs')
  if (fs.existsSync(cjsPath)) {
    const cjsContent = fs.readFileSync(cjsPath, 'utf-8')
    
    if (cjsContent.includes('exports') || cjsContent.includes('module.exports')) {
      funcCheck.details.push('✅ CJS 包含导出语句')
    } else {
      funcCheck.errors.push('❌ CJS 缺少导出语句')
      funcCheck.passed = false
      funcCheck.score -= 30
    }
    
    if (cjsContent.startsWith('/*!')) {
      funcCheck.details.push('✅ CJS 包含 Banner')
    } else {
      funcCheck.errors.push('❌ CJS 缺少 Banner')
      funcCheck.score -= 10
    }
  }
  checks.push(funcCheck)
  
  // 3. Source Map 检查
  console.log('\n🗺️ 检查 Source Map...')
  const mapCheck = { name: 'Source Map', passed: true, details: [], errors: [], score: 100 }
  
  const mapFiles = ['index.js.map', 'index.cjs.map']
  for (const mapFile of mapFiles) {
    const mapPath = path.join(outputDir, mapFile)
    
    if (fs.existsSync(mapPath)) {
      try {
        const mapContent = fs.readFileSync(mapPath, 'utf-8')
        const sourceMap = JSON.parse(mapContent)
        
        if (sourceMap.version && sourceMap.sources && sourceMap.mappings) {
          mapCheck.details.push(`✅ ${mapFile} 结构正确`)
        } else {
          mapCheck.errors.push(`❌ ${mapFile} 结构不完整`)
          mapCheck.passed = false
          mapCheck.score -= 25
        }
        
        if (sourceMap.sources && sourceMap.sources.length > 0) {
          mapCheck.details.push(`✅ ${mapFile} 包含 ${sourceMap.sources.length} 个源文件引用`)
        }
        
      } catch (error) {
        mapCheck.errors.push(`❌ ${mapFile} 解析失败: ${error.message}`)
        mapCheck.passed = false
        mapCheck.score -= 30
      }
    } else {
      mapCheck.errors.push(`❌ ${mapFile} 不存在`)
      mapCheck.passed = false
      mapCheck.score -= 25
    }
  }
  checks.push(mapCheck)
  
  // 4. 性能检查
  console.log('\n⚡ 检查性能...')
  const perfCheck = { name: '性能', passed: true, details: [], errors: [], score: 100 }
  
  const jsFiles = ['index.js', 'index.cjs']
  const sizeThresholds = {
    small: 100 * 1024,    // 100KB
    medium: 500 * 1024,   // 500KB
    large: 1024 * 1024    // 1MB
  }
  
  for (const jsFile of jsFiles) {
    const jsPath = path.join(outputDir, jsFile)
    
    if (fs.existsSync(jsPath)) {
      const stats = fs.statSync(jsPath)
      const size = stats.size
      
      if (size < sizeThresholds.small) {
        perfCheck.details.push(`✅ ${jsFile} 大小优秀 (${formatBytes(size)})`)
      } else if (size < sizeThresholds.medium) {
        perfCheck.details.push(`✅ ${jsFile} 大小良好 (${formatBytes(size)})`)
        perfCheck.score -= 5
      } else if (size < sizeThresholds.large) {
        perfCheck.details.push(`⚠️ ${jsFile} 大小较大 (${formatBytes(size)})`)
        perfCheck.score -= 15
      } else {
        perfCheck.errors.push(`❌ ${jsFile} 大小过大 (${formatBytes(size)})`)
        perfCheck.passed = false
        perfCheck.score -= 30
      }
    }
  }
  checks.push(perfCheck)
  
  // 5. 兼容性检查
  console.log('\n🔄 检查兼容性...')
  const compatCheck = { name: '兼容性', passed: true, details: [], errors: [], score: 100 }
  
  try {
    // 检查 CJS 模块加载
    const { createRequire } = await import('module')
    const require = createRequire(import.meta.url)
    
    const cjsPath = path.join(outputDir, 'index.cjs')
    if (fs.existsSync(cjsPath)) {
      try {
        delete require.cache[path.resolve(cjsPath)]
        const cjsModule = require(path.resolve(cjsPath))
        
        if (cjsModule && typeof cjsModule === 'object') {
          compatCheck.details.push('✅ CJS 模块可以在 Node.js 中正常加载')
        } else {
          compatCheck.errors.push('❌ CJS 模块加载后结构异常')
          compatCheck.score -= 20
        }
      } catch (error) {
        compatCheck.errors.push(`❌ CJS 模块加载失败: ${error.message}`)
        compatCheck.passed = false
        compatCheck.score -= 30
      }
    }
    
    // 检查 ESM 模块导入
    const esmPath = path.join(outputDir, 'index.js')
    if (fs.existsSync(esmPath)) {
      try {
        const esmModule = await import(`file://${path.resolve(esmPath)}`)
        
        if (esmModule && typeof esmModule === 'object') {
          compatCheck.details.push('✅ ESM 模块可以正常导入')
        } else {
          compatCheck.errors.push('❌ ESM 模块导入后结构异常')
          compatCheck.score -= 20
        }
      } catch (error) {
        compatCheck.errors.push(`❌ ESM 模块导入失败: ${error.message}`)
        compatCheck.passed = false
        compatCheck.score -= 30
      }
    }
  } catch (error) {
    compatCheck.errors.push(`❌ 兼容性检查失败: ${error.message}`)
    compatCheck.passed = false
    compatCheck.score -= 50
  }
  checks.push(compatCheck)
  
  // 计算总体评分
  const totalScore = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length)
  const passedChecks = checks.filter(c => c.passed).length
  const failedChecks = checks.length - passedChecks
  
  // 输出结果
  console.log('\n📊 质量验证结果:')
  console.log('=' .repeat(50))
  console.log(`总体评分: ${totalScore}/100`)
  console.log(`通过检查: ${passedChecks}/${checks.length}`)
  console.log(`失败检查: ${failedChecks}/${checks.length}`)
  
  console.log('\n📋 检查详情:')
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌'
    console.log(`\n${status} ${check.name} (${check.score}/100)`)
    
    if (check.details.length > 0) {
      check.details.forEach(detail => console.log(`  ${detail}`))
    }
    
    if (check.errors.length > 0) {
      check.errors.forEach(error => console.log(`  ${error}`))
    }
  })
  
  // 生成建议
  const recommendations = []
  if (failedChecks > 0) {
    recommendations.push(`有 ${failedChecks} 项检查未通过，建议优先解决这些问题`)
  }
  
  const fileCheckFailed = checks.find(c => c.name === '文件完整性' && !c.passed)
  if (fileCheckFailed) {
    recommendations.push('建议检查构建配置，确保生成所有必需的文件')
  }
  
  const perfCheckLow = checks.find(c => c.name === '性能' && c.score < 80)
  if (perfCheckLow) {
    recommendations.push('建议启用代码压缩来减小包体积')
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 优化建议:')
    recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`)
    })
  }
  
  // 生成报告文件
  const reportLines = [
    '# 输出质量验证报告',
    '',
    `**总体评分**: ${totalScore}/100`,
    `**通过检查**: ${passedChecks}/${checks.length}`,
    `**失败检查**: ${failedChecks}/${checks.length}`,
    '',
    '## 检查详情',
    ''
  ]
  
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌'
    reportLines.push(`### ${status} ${check.name} (${check.score}/100)`)
    reportLines.push('')
    
    if (check.details.length > 0) {
      reportLines.push('**详情**:')
      check.details.forEach(detail => reportLines.push(`- ${detail}`))
      reportLines.push('')
    }
    
    if (check.errors.length > 0) {
      reportLines.push('**错误**:')
      check.errors.forEach(error => reportLines.push(`- ${error}`))
      reportLines.push('')
    }
  })
  
  if (recommendations.length > 0) {
    reportLines.push('## 优化建议')
    reportLines.push('')
    recommendations.forEach((rec, index) => {
      reportLines.push(`${index + 1}. ${rec}`)
    })
    reportLines.push('')
  }
  
  reportLines.push('---')
  reportLines.push(`*报告生成时间: ${new Date().toISOString()}*`)
  
  fs.writeFileSync('output-quality-report.md', reportLines.join('\n'))
  console.log('\n📄 详细报告已保存到: output-quality-report.md')
  
  return { totalScore, passedChecks, failedChecks, checks }
}

validateOutputQuality().catch(console.error)
