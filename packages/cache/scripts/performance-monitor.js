#!/usr/bin/env node

/**
 * 性能监控脚本
 * 监控构建性能和运行时性能
 */

import { performance } from 'perf_hooks'
import fs from 'fs'

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTime = performance.now()
  }

  mark(name) {
    this.metrics.set(name, performance.now())
  }

  measure(name, startMark) {
    const start = this.metrics.get(startMark) || this.startTime
    const duration = performance.now() - start
    console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`)
    return duration
  }

  report() {
    const totalTime = performance.now() - this.startTime
    console.log(`\n📈 总执行时间: ${totalTime.toFixed(2)}ms`)
    
    // 生成性能报告
    const report = {
      timestamp: new Date().toISOString(),
      totalTime: totalTime,
      metrics: Object.fromEntries(this.metrics)
    }
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2))
    console.log('📄 性能报告已保存到 performance-report.json')
  }
}

export default PerformanceMonitor
