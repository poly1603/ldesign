/**
 * 性能回归测试
 * 比较当前版本与基准版本的性能差异
 */

import fs from 'node:fs'
import path from 'node:path'
import { PerformanceBenchmark } from './performance-benchmark.js'

// 性能阈值配置
const PERFORMANCE_THRESHOLDS = {
  routeMatching: {
    maxAvgTime: 0.1, // 最大平均时间 (ms)
    minOpsPerSecond: 10000, // 最小操作数/秒
  },
  navigation: {
    maxAvgTime: 5.0, // 最大平均导航时间 (ms)
    minOpsPerSecond: 200, // 最小操作数/秒
  },
  massRoutes: {
    maxCreateTime: 100, // 最大创建时间 (ms)
    maxResolveTime: 1.0, // 最大解析时间 (ms)
  },
  memoryUsage: {
    maxMemoryPerRouter: 0.1, // 最大内存/路由器 (MB)
  },
}

class PerformanceRegression {
  constructor() {
    this.baselineFile = path.join(process.cwd(), 'performance-baseline.json')
    this.currentResults = null
    this.baselineResults = null
  }

  // 加载基准性能数据
  loadBaseline() {
    try {
      if (fs.existsSync(this.baselineFile)) {
        const data = fs.readFileSync(this.baselineFile, 'utf8')
        this.baselineResults = JSON.parse(data)
        console.log('📊 已加载基准性能数据')
        return true
      }
      else {
        console.log('⚠️  未找到基准性能数据，将创建新的基准')
        return false
      }
    }
    catch (error) {
      console.error('❌ 加载基准数据失败:', error.message)
      return false
    }
  }

  // 保存基准性能数据
  saveBaseline(results) {
    try {
      const baselineData = {
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        results,
      }

      fs.writeFileSync(this.baselineFile, JSON.stringify(baselineData, null, 2))
      console.log('💾 基准性能数据已保存')
    }
    catch (error) {
      console.error('❌ 保存基准数据失败:', error.message)
    }
  }

  // 运行当前性能测试
  async runCurrentBenchmark() {
    console.log('🔄 运行当前版本性能测试...')

    const benchmark = new PerformanceBenchmark()

    await benchmark.testRouteMatching()
    await benchmark.testNavigation()
    await benchmark.testMassRoutes()
    benchmark.testMemoryUsage()

    this.currentResults = benchmark.results
    return this.currentResults
  }

  // 比较性能结果
  compareResults() {
    if (!this.baselineResults || !this.currentResults) {
      throw new Error('缺少比较数据')
    }

    const comparison = {
      routeMatching: this.compareRouteMatching(),
      navigation: this.compareNavigation(),
      massRoutes: this.compareMassRoutes(),
      memoryUsage: this.compareMemoryUsage(),
    }

    return comparison
  }

  // 比较路由匹配性能
  compareRouteMatching() {
    const baseline = this.baselineResults.results.routeMatching
    const current = this.currentResults.routeMatching

    if (!baseline || !current)
      return null

    const comparison = []

    for (let i = 0; i < Math.min(baseline.length, current.length); i++) {
      const baselineItem = baseline[i]
      const currentItem = current[i]

      if (baselineItem.route === currentItem.route) {
        const avgTimeDiff
          = ((Number.parseFloat(currentItem.avgTime)
            - Number.parseFloat(baselineItem.avgTime))
          / Number.parseFloat(baselineItem.avgTime))
        * 100
        const opsPerSecondDiff
          = ((currentItem.opsPerSecond - baselineItem.opsPerSecond)
            / baselineItem.opsPerSecond)
          * 100

        comparison.push({
          route: currentItem.route,
          baseline: {
            avgTime: baselineItem.avgTime,
            opsPerSecond: baselineItem.opsPerSecond,
          },
          current: {
            avgTime: currentItem.avgTime,
            opsPerSecond: currentItem.opsPerSecond,
          },
          diff: {
            avgTime: avgTimeDiff.toFixed(2),
            opsPerSecond: opsPerSecondDiff.toFixed(2),
          },
          status: this.getPerformanceStatus(avgTimeDiff, -5, 5), // 负数表示改善
        })
      }
    }

    return comparison
  }

  // 比较导航性能
  compareNavigation() {
    const baseline = this.baselineResults.results.navigation
    const current = this.currentResults.navigation

    if (!baseline || !current)
      return null

    const comparison = []

    for (let i = 0; i < Math.min(baseline.length, current.length); i++) {
      const baselineItem = baseline[i]
      const currentItem = current[i]

      if (baselineItem.route === currentItem.route) {
        const avgTimeDiff
          = ((Number.parseFloat(currentItem.avgTime)
            - Number.parseFloat(baselineItem.avgTime))
          / Number.parseFloat(baselineItem.avgTime))
        * 100

        comparison.push({
          route: currentItem.route,
          baseline: {
            avgTime: baselineItem.avgTime,
            opsPerSecond: baselineItem.opsPerSecond,
          },
          current: {
            avgTime: currentItem.avgTime,
            opsPerSecond: currentItem.opsPerSecond,
          },
          diff: {
            avgTime: avgTimeDiff.toFixed(2),
          },
          status: this.getPerformanceStatus(avgTimeDiff, -10, 10),
        })
      }
    }

    return comparison
  }

  // 比较大量路由性能
  compareMassRoutes() {
    const baseline = this.baselineResults.results.massRoutes
    const current = this.currentResults.massRoutes

    if (!baseline || !current)
      return null

    const createTimeDiff
      = ((Number.parseFloat(current.createTime)
        - Number.parseFloat(baseline.createTime))
      / Number.parseFloat(baseline.createTime))
    * 100

    return {
      createTime: {
        baseline: baseline.createTime,
        current: current.createTime,
        diff: createTimeDiff.toFixed(2),
        status: this.getPerformanceStatus(createTimeDiff, -10, 10),
      },
    }
  }

  // 比较内存使用
  compareMemoryUsage() {
    const baseline = this.baselineResults.results.memoryUsage
    const current = this.currentResults.memoryUsage

    if (!baseline || !current)
      return null

    const memoryDiff
      = ((Number.parseFloat(current.avgMemoryPerRouter)
        - Number.parseFloat(baseline.avgMemoryPerRouter))
      / Number.parseFloat(baseline.avgMemoryPerRouter))
    * 100

    return {
      avgMemoryPerRouter: {
        baseline: baseline.avgMemoryPerRouter,
        current: current.avgMemoryPerRouter,
        diff: memoryDiff.toFixed(2),
        status: this.getPerformanceStatus(memoryDiff, -5, 5),
      },
    }
  }

  // 获取性能状态
  getPerformanceStatus(diff, goodThreshold, badThreshold) {
    if (diff <= goodThreshold)
      return 'improved'
    if (diff >= badThreshold)
      return 'degraded'
    return 'stable'
  }

  // 检查性能阈值
  checkThresholds() {
    const violations = []

    // 检查路由匹配阈值
    if (this.currentResults.routeMatching) {
      this.currentResults.routeMatching.forEach((result) => {
        if (
          Number.parseFloat(result.avgTime)
          > PERFORMANCE_THRESHOLDS.routeMatching.maxAvgTime
        ) {
          violations.push(
            `路由匹配 ${result.route}: 平均时间 ${result.avgTime}ms 超过阈值 ${PERFORMANCE_THRESHOLDS.routeMatching.maxAvgTime}ms`,
          )
        }
        if (
          result.opsPerSecond
          < PERFORMANCE_THRESHOLDS.routeMatching.minOpsPerSecond
        ) {
          violations.push(
            `路由匹配 ${result.route}: 操作数 ${result.opsPerSecond} ops/s 低于阈值 ${PERFORMANCE_THRESHOLDS.routeMatching.minOpsPerSecond} ops/s`,
          )
        }
      })
    }

    // 检查导航阈值
    if (this.currentResults.navigation) {
      this.currentResults.navigation.forEach((result) => {
        if (
          Number.parseFloat(result.avgTime)
          > PERFORMANCE_THRESHOLDS.navigation.maxAvgTime
        ) {
          violations.push(
            `路由导航 ${result.route}: 平均时间 ${result.avgTime}ms 超过阈值 ${PERFORMANCE_THRESHOLDS.navigation.maxAvgTime}ms`,
          )
        }
      })
    }

    // 检查大量路由阈值
    if (this.currentResults.massRoutes) {
      if (
        Number.parseFloat(this.currentResults.massRoutes.createTime)
        > PERFORMANCE_THRESHOLDS.massRoutes.maxCreateTime
      ) {
        violations.push(
          `大量路由创建时间 ${this.currentResults.massRoutes.createTime}ms 超过阈值 ${PERFORMANCE_THRESHOLDS.massRoutes.maxCreateTime}ms`,
        )
      }
    }

    // 检查内存使用阈值
    if (this.currentResults.memoryUsage) {
      if (
        Number.parseFloat(this.currentResults.memoryUsage.avgMemoryPerRouter)
        > PERFORMANCE_THRESHOLDS.memoryUsage.maxMemoryPerRouter
      ) {
        violations.push(
          `平均内存使用 ${this.currentResults.memoryUsage.avgMemoryPerRouter}MB 超过阈值 ${PERFORMANCE_THRESHOLDS.memoryUsage.maxMemoryPerRouter}MB`,
        )
      }
    }

    return violations
  }

  // 生成回归测试报告
  generateReport(comparison, violations) {
    console.log('\n📊 性能回归测试报告')
    console.log('='.repeat(60))

    if (comparison.routeMatching) {
      console.log('\n🔍 路由匹配性能对比:')
      comparison.routeMatching.forEach((item) => {
        const statusIcon
          = item.status === 'improved'
            ? '✅'
            : item.status === 'degraded'
              ? '❌'
              : '➖'
        console.log(
          `  ${statusIcon} ${item.route.padEnd(30)} ${item.diff.avgTime}% (${
            item.current.avgTime
          }ms)`,
        )
      })
    }

    if (comparison.navigation) {
      console.log('\n🧭 路由导航性能对比:')
      comparison.navigation.forEach((item) => {
        const statusIcon
          = item.status === 'improved'
            ? '✅'
            : item.status === 'degraded'
              ? '❌'
              : '➖'
        console.log(
          `  ${statusIcon} ${item.route.padEnd(20)} ${item.diff.avgTime}% (${
            item.current.avgTime
          }ms)`,
        )
      })
    }

    if (comparison.massRoutes) {
      console.log('\n📊 大量路由性能对比:')
      const statusIcon
        = comparison.massRoutes.createTime.status === 'improved'
          ? '✅'
          : comparison.massRoutes.createTime.status === 'degraded'
            ? '❌'
            : '➖'
      console.log(
        `  ${statusIcon} 创建时间: ${comparison.massRoutes.createTime.diff}% (${comparison.massRoutes.createTime.current}ms)`,
      )
    }

    if (comparison.memoryUsage) {
      console.log('\n💾 内存使用对比:')
      const statusIcon
        = comparison.memoryUsage.avgMemoryPerRouter.status === 'improved'
          ? '✅'
          : comparison.memoryUsage.avgMemoryPerRouter.status === 'degraded'
            ? '❌'
            : '➖'
      console.log(
        `  ${statusIcon} 平均内存/路由器: ${comparison.memoryUsage.avgMemoryPerRouter.diff}% (${comparison.memoryUsage.avgMemoryPerRouter.current}MB)`,
      )
    }

    // 显示阈值违规
    if (violations.length > 0) {
      console.log('\n⚠️  性能阈值违规:')
      violations.forEach((violation) => {
        console.log(`  ❌ ${violation}`)
      })
    }
    else {
      console.log('\n✅ 所有性能指标均在阈值范围内')
    }

    console.log(`\n${'='.repeat(60)}`)
  }
}

// 运行回归测试
async function runRegressionTest(createBaseline = false) {
  console.log('🔄 开始性能回归测试...\n')

  const regression = new PerformanceRegression()

  try {
    // 运行当前性能测试
    await regression.runCurrentBenchmark()

    if (createBaseline) {
      // 创建新的基准
      regression.saveBaseline(regression.currentResults)
      console.log('✅ 新的性能基准已创建')
      return
    }

    // 加载基准数据
    const hasBaseline = regression.loadBaseline()

    if (!hasBaseline) {
      // 如果没有基准，创建一个
      regression.saveBaseline(regression.currentResults)
      console.log('✅ 首次运行，已创建性能基准')
      return
    }

    // 比较结果
    const comparison = regression.compareResults()
    const violations = regression.checkThresholds()

    // 生成报告
    regression.generateReport(comparison, violations)

    // 如果有性能违规，退出并返回错误码
    if (violations.length > 0) {
      console.log('\n❌ 性能回归测试失败')
      process.exit(1)
    }
    else {
      console.log('\n✅ 性能回归测试通过')
    }
  }
  catch (error) {
    console.error('❌ 性能回归测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const createBaseline = process.argv.includes('--create-baseline')
  runRegressionTest(createBaseline)
}

export { PerformanceRegression, runRegressionTest }
