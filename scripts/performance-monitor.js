#!/usr/bin/env node

/**
 * Turborepo 性能监控脚本
 * 
 * 功能：
 * - 监控构建性能
 * - 生成性能报告
 * - 分析缓存效率
 * - 检测性能回归
 */

import { execSync } from 'child_process'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'

const PERFORMANCE_LOG = 'performance-history.json'

class PerformanceMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      buildTimes: {},
      cacheStats: {},
      totalTime: 0,
      packages: []
    }
  }

  /**
   * 运行性能测试
   */
  async runPerformanceTest() {
    console.log('🚀 开始性能监控...')
    
    // 清理缓存进行首次构建测试
    console.log('📊 测试首次构建性能（无缓存）...')
    const firstBuildTime = await this.measureBuildTime(true)
    
    // 测试缓存构建性能
    console.log('⚡ 测试缓存构建性能...')
    const cachedBuildTime = await this.measureBuildTime(false)
    
    // 计算性能指标
    this.results.buildTimes = {
      firstBuild: firstBuildTime,
      cachedBuild: cachedBuildTime,
      improvement: ((firstBuildTime - cachedBuildTime) / firstBuildTime * 100).toFixed(2)
    }
    
    // 分析包构建时间
    await this.analyzePackagePerformance()
    
    // 生成报告
    this.generateReport()
    
    // 保存历史数据
    this.saveHistory()
    
    console.log('✅ 性能监控完成！')
  }

  /**
   * 测量构建时间
   */
  async measureBuildTime(clearCache = false) {
    if (clearCache) {
      try {
        execSync('pnpm turbo prune', { stdio: 'pipe' })
      } catch (error) {
        console.warn('清理缓存失败:', error.message)
      }
    }

    const startTime = Date.now()
    
    try {
      const output = execSync('pnpm turbo run build --summarize', { 
        encoding: 'utf8',
        stdio: 'pipe'
      })
      
      const endTime = Date.now()
      const buildTime = (endTime - startTime) / 1000
      
      // 解析缓存统计
      this.parseCacheStats(output)
      
      return buildTime
    } catch (error) {
      console.error('构建失败:', error.message)
      return -1
    }
  }

  /**
   * 解析缓存统计信息
   */
  parseCacheStats(output) {
    const lines = output.split('\n')
    let cacheHits = 0
    let totalTasks = 0
    
    lines.forEach(line => {
      if (line.includes('cached')) {
        const match = line.match(/(\d+)\s+cached,\s+(\d+)\s+total/)
        if (match) {
          cacheHits = parseInt(match[1])
          totalTasks = parseInt(match[2])
        }
      }
    })
    
    this.results.cacheStats = {
      hits: cacheHits,
      total: totalTasks,
      hitRate: totalTasks > 0 ? ((cacheHits / totalTasks) * 100).toFixed(2) : 0
    }
  }

  /**
   * 分析包构建性能
   */
  async analyzePackagePerformance() {
    const packages = [
      '@ldesign/builder',
      '@ldesign/color', 
      '@ldesign/shared',
      '@ldesign/component',
      '@ldesign/form'
    ]
    
    for (const pkg of packages) {
      try {
        const startTime = Date.now()
        execSync(`pnpm turbo run build --filter="${pkg}"`, { stdio: 'pipe' })
        const endTime = Date.now()
        
        this.results.packages.push({
          name: pkg,
          buildTime: (endTime - startTime) / 1000
        })
      } catch (error) {
        this.results.packages.push({
          name: pkg,
          buildTime: -1,
          error: error.message
        })
      }
    }
  }

  /**
   * 生成性能报告
   */
  generateReport() {
    const report = `
# Turborepo 性能报告

## 📊 构建性能

- **首次构建**: ${this.results.buildTimes.firstBuild}s
- **缓存构建**: ${this.results.buildTimes.cachedBuild}s  
- **性能提升**: ${this.results.buildTimes.improvement}%

## ⚡ 缓存效率

- **缓存命中**: ${this.results.cacheStats.hits}/${this.results.cacheStats.total}
- **命中率**: ${this.results.cacheStats.hitRate}%

## 📦 包构建时间

${this.results.packages.map(pkg => 
  `- **${pkg.name}**: ${pkg.buildTime > 0 ? pkg.buildTime + 's' : '构建失败'}`
).join('\n')}

## 📈 性能建议

${this.generateRecommendations()}

---
*报告生成时间: ${this.results.timestamp}*
`

    writeFileSync('performance-report.md', report)
    console.log('📄 性能报告已生成: performance-report.md')
  }

  /**
   * 生成性能建议
   */
  generateRecommendations() {
    const recommendations = []
    
    if (this.results.cacheStats.hitRate < 80) {
      recommendations.push('- 🔧 缓存命中率较低，检查 turbo.json 中的 inputs 配置')
    }
    
    if (this.results.buildTimes.improvement < 50) {
      recommendations.push('- ⚡ 缓存效果不明显，考虑优化任务依赖关系')
    }
    
    const slowPackages = this.results.packages.filter(pkg => pkg.buildTime > 30)
    if (slowPackages.length > 0) {
      recommendations.push(`- 🐌 以下包构建较慢，建议优化: ${slowPackages.map(p => p.name).join(', ')}`)
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- ✅ 性能表现良好，无需特别优化')
    }
    
    return recommendations.join('\n')
  }

  /**
   * 保存历史数据
   */
  saveHistory() {
    let history = []
    
    if (existsSync(PERFORMANCE_LOG)) {
      try {
        history = JSON.parse(readFileSync(PERFORMANCE_LOG, 'utf8'))
      } catch (error) {
        console.warn('读取历史数据失败:', error.message)
      }
    }
    
    history.push(this.results)
    
    // 只保留最近 50 次记录
    if (history.length > 50) {
      history = history.slice(-50)
    }
    
    writeFileSync(PERFORMANCE_LOG, JSON.stringify(history, null, 2))
    console.log('💾 性能数据已保存到历史记录')
  }
}

// 运行性能监控
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor()
  monitor.runPerformanceTest().catch(console.error)
}
