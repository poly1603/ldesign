#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 分析内存管理相关代码
function analyzeMemoryManagement() {
  log('🧠 内存管理优化分析', 'cyan')
  log('=' .repeat(50), 'cyan')

  const memoryFiles = [
    'src/utils/memory-manager.ts',
    'src/vue/composables/usePerformance.ts',
    'src/utils/performance-analyzer.ts',
    'src/core/engine.ts'
  ]

  const analysis = {
    totalLines: 0,
    memoryLeakRisks: [],
    optimizationOpportunities: [],
    bestPractices: [],
    issues: []
  }

  memoryFiles.forEach(file => {
    const filePath = join(rootDir, file)
    if (!existsSync(filePath)) {
      analysis.issues.push(`文件不存在: ${file}`)
      return
    }

    const content = readFileSync(filePath, 'utf8')
    const lines = content.split('\n')
    analysis.totalLines += lines.length

    // 分析潜在的内存泄漏风险
    analyzeMemoryLeakRisks(content, file, analysis)
    
    // 分析优化机会
    analyzeOptimizationOpportunities(content, file, analysis)
    
    // 检查最佳实践
    checkBestPractices(content, file, analysis)
  })

  return analysis
}

// 分析内存泄漏风险
function analyzeMemoryLeakRisks(content, file, analysis) {
  const risks = []

  // 检查未清理的定时器
  if (content.includes('setTimeout') || content.includes('setInterval')) {
    if (!content.includes('clearTimeout') && !content.includes('clearInterval')) {
      risks.push(`${file}: 可能存在未清理的定时器`)
    }
  }

  // 检查事件监听器
  if (content.includes('addEventListener')) {
    if (!content.includes('removeEventListener')) {
      risks.push(`${file}: 可能存在未移除的事件监听器`)
    }
  }

  // 检查循环引用
  if (content.includes('this.') && content.includes('callback')) {
    risks.push(`${file}: 可能存在循环引用风险`)
  }

  // 检查大对象缓存
  if (content.includes('Map') || content.includes('Set')) {
    if (!content.includes('clear()') && !content.includes('delete(')) {
      risks.push(`${file}: 可能存在未清理的缓存对象`)
    }
  }

  analysis.memoryLeakRisks.push(...risks)
}

// 分析优化机会
function analyzeOptimizationOpportunities(content, file, analysis) {
  const opportunities = []

  // 检查是否使用了WeakMap/WeakSet
  if ((content.includes('Map') || content.includes('Set')) && 
      !content.includes('WeakMap') && !content.includes('WeakSet')) {
    opportunities.push(`${file}: 考虑使用WeakMap/WeakSet减少内存占用`)
  }

  // 检查是否有对象池
  if (content.includes('new ') && !content.includes('ObjectPool')) {
    opportunities.push(`${file}: 考虑使用对象池减少GC压力`)
  }

  // 检查是否有批处理
  if (content.includes('forEach') || content.includes('map')) {
    if (!content.includes('batch') && !content.includes('chunk')) {
      opportunities.push(`${file}: 考虑使用批处理优化大量数据操作`)
    }
  }

  // 检查是否有内存监控
  if (content.includes('class ') && !content.includes('MemoryLeakDetector')) {
    opportunities.push(`${file}: 考虑添加内存监控`)
  }

  analysis.optimizationOpportunities.push(...opportunities)
}

// 检查最佳实践
function checkBestPractices(content, file, analysis) {
  const practices = []

  // 检查是否有清理方法
  if (content.includes('class ') && content.includes('constructor')) {
    if (content.includes('cleanup') || content.includes('destroy') || content.includes('dispose')) {
      practices.push(`${file}: ✅ 实现了资源清理方法`)
    } else {
      analysis.issues.push(`${file}: ❌ 缺少资源清理方法`)
    }
  }

  // 检查是否使用了try-catch
  if (content.includes('callback') || content.includes('async')) {
    if (content.includes('try') && content.includes('catch')) {
      practices.push(`${file}: ✅ 使用了错误处理`)
    } else {
      analysis.issues.push(`${file}: ❌ 缺少错误处理`)
    }
  }

  // 检查是否有内存限制
  if (content.includes('Array') || content.includes('Map') || content.includes('Set')) {
    if (content.includes('maxSize') || content.includes('limit') || content.includes('max')) {
      practices.push(`${file}: ✅ 设置了内存限制`)
    } else {
      analysis.issues.push(`${file}: ⚠️  建议设置内存限制`)
    }
  }

  analysis.bestPractices.push(...practices)
}

// 生成内存优化建议
function generateOptimizationRecommendations(analysis) {
  log('\n💡 内存优化建议:', 'magenta')
  
  const recommendations = []

  // 基于分析结果生成建议
  if (analysis.memoryLeakRisks.length > 0) {
    recommendations.push({
      category: '内存泄漏风险',
      priority: 'high',
      items: analysis.memoryLeakRisks
    })
  }

  if (analysis.optimizationOpportunities.length > 0) {
    recommendations.push({
      category: '优化机会',
      priority: 'medium',
      items: analysis.optimizationOpportunities
    })
  }

  if (analysis.issues.length > 0) {
    recommendations.push({
      category: '需要改进',
      priority: 'low',
      items: analysis.issues
    })
  }

  // 通用建议
  recommendations.push({
    category: '通用优化建议',
    priority: 'medium',
    items: [
      '使用WeakMap/WeakSet存储临时引用',
      '实现对象池减少GC压力',
      '添加内存使用监控和告警',
      '定期执行内存清理',
      '使用批处理优化大量数据操作',
      '避免在热路径中创建大对象',
      '使用requestIdleCallback执行非关键清理任务'
    ]
  })

  return recommendations
}

// 主分析函数
function runMemoryOptimizationAnalysis() {
  try {
    const analysis = analyzeMemoryManagement()
    
    log(`\n📊 分析结果:`, 'yellow')
    log(`  总代码行数: ${analysis.totalLines}`)
    log(`  内存泄漏风险: ${analysis.memoryLeakRisks.length} 个`)
    log(`  优化机会: ${analysis.optimizationOpportunities.length} 个`)
    log(`  最佳实践: ${analysis.bestPractices.length} 个`)
    log(`  需要改进: ${analysis.issues.length} 个`)

    // 显示详细信息
    if (analysis.memoryLeakRisks.length > 0) {
      log('\n⚠️  内存泄漏风险:', 'red')
      analysis.memoryLeakRisks.forEach(risk => log(`  - ${risk}`, 'yellow'))
    }

    if (analysis.optimizationOpportunities.length > 0) {
      log('\n🚀 优化机会:', 'blue')
      analysis.optimizationOpportunities.forEach(opp => log(`  - ${opp}`, 'cyan'))
    }

    if (analysis.bestPractices.length > 0) {
      log('\n✅ 最佳实践:', 'green')
      analysis.bestPractices.forEach(practice => log(`  - ${practice}`, 'green'))
    }

    if (analysis.issues.length > 0) {
      log('\n❌ 需要改进:', 'red')
      analysis.issues.forEach(issue => log(`  - ${issue}`, 'yellow'))
    }

    // 生成优化建议
    const recommendations = generateOptimizationRecommendations(analysis)
    
    recommendations.forEach(rec => {
      const color = rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue'
      log(`\n${rec.category} (${rec.priority}):`, color)
      rec.items.forEach(item => log(`  - ${item}`, 'cyan'))
    })

    // 保存报告
    const report = {
      timestamp: new Date().toISOString(),
      analysis,
      recommendations
    }

    const reportPath = join(rootDir, 'memory-optimization-report.json')
    writeFileSync(reportPath, JSON.stringify(report, null, 2))
    log(`\n📊 优化报告已保存到: ${reportPath}`, 'green')

    log('\n✅ 内存优化分析完成!', 'green')
    
  } catch (error) {
    log(`\n❌ 分析失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 执行分析
runMemoryOptimizationAnalysis()
