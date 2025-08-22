/**
 * 路由性能基准测试
 * 测试路由匹配、导航、组件加载等性能指标
 */

import fs from 'node:fs'
import path from 'node:path'
import { performance } from 'node:perf_hooks'
import { createMemoryHistory, createRouter } from '../es/index.js'

// 性能测试配置
const BENCHMARK_CONFIG = {
  // 路由匹配测试
  routeMatching: {
    iterations: 10000,
    routes: [
      '/',
      '/about',
      '/user/123',
      '/user/456/profile',
      '/posts/789/comments/101',
      '/admin/dashboard',
      '/api/v1/users/123',
      '/complex/nested/route/with/many/segments',
    ],
  },

  // 路由导航测试
  navigation: {
    iterations: 1000,
    routes: ['/', '/about', '/user/123', '/posts/456', '/admin', '/profile'],
  },

  // 大量路由测试
  massRoutes: {
    routeCount: 1000,
    testIterations: 100,
  },
}

// 创建测试路由配置
function createTestRoutes(count = 100) {
  const routes = [
    {
      path: '/',
      name: 'home',
      component: () => Promise.resolve({ default: {} }),
    },
    {
      path: '/about',
      name: 'about',
      component: () => Promise.resolve({ default: {} }),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => Promise.resolve({ default: {} }),
    },
  ]

  // 添加动态路由
  for (let i = 0; i < count; i++) {
    routes.push({
      path: `/user/${i}`,
      name: `user-${i}`,
      component: () => Promise.resolve({ default: {} }),
    })

    routes.push({
      path: `/post/${i}/:slug`,
      name: `post-${i}`,
      component: () => Promise.resolve({ default: {} }),
    })

    routes.push({
      path: `/category/${i}/subcategory/:id`,
      name: `category-${i}`,
      component: () => Promise.resolve({ default: {} }),
    })
  }

  return routes
}

// 性能测试工具类
class PerformanceBenchmark {
  constructor() {
    this.results = {}
  }

  // 测试路由匹配性能
  async testRouteMatching() {
    console.log('🔍 测试路由匹配性能...')

    const routes = createTestRoutes(100)
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    const { iterations, routes: testRoutes } = BENCHMARK_CONFIG.routeMatching
    const results = []

    for (const route of testRoutes) {
      const startTime = performance.now()

      for (let i = 0; i < iterations; i++) {
        try {
          router.resolve(route)
        }
        catch (error) {
          // 忽略解析错误，专注于性能
        }
      }

      const endTime = performance.now()
      const totalTime = endTime - startTime
      const avgTime = totalTime / iterations

      results.push({
        route,
        totalTime: totalTime.toFixed(2),
        avgTime: avgTime.toFixed(4),
        opsPerSecond: Math.round(1000 / avgTime),
      })
    }

    this.results.routeMatching = results
    return results
  }

  // 测试路由导航性能
  async testNavigation() {
    console.log('🧭 测试路由导航性能...')

    const routes = createTestRoutes(50)
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })

    const { iterations, routes: testRoutes } = BENCHMARK_CONFIG.navigation
    const results = []

    for (const route of testRoutes) {
      const times = []

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now()

        try {
          await router.push(route)
        }
        catch (error) {
          // 忽略导航错误
        }

        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      const minTime = Math.min(...times)
      const maxTime = Math.max(...times)

      results.push({
        route,
        avgTime: avgTime.toFixed(4),
        minTime: minTime.toFixed(4),
        maxTime: maxTime.toFixed(4),
        opsPerSecond: Math.round(1000 / avgTime),
      })
    }

    this.results.navigation = results
    return results
  }

  // 测试大量路由性能
  async testMassRoutes() {
    console.log('📊 测试大量路由性能...')

    const { routeCount, testIterations } = BENCHMARK_CONFIG.massRoutes
    const routes = createTestRoutes(routeCount)

    // 测试路由器创建时间
    const createStartTime = performance.now()
    const router = createRouter({
      history: createMemoryHistory(),
      routes,
    })
    const createEndTime = performance.now()
    const createTime = createEndTime - createStartTime

    // 测试随机路由解析
    const testRoutes = [
      '/',
      '/about',
      `/user/${Math.floor(Math.random() * routeCount)}`,
      `/post/${Math.floor(Math.random() * routeCount)}/test-slug`,
      `/category/${Math.floor(Math.random() * routeCount)}/subcategory/123`,
    ]

    const resolveResults = []
    for (const route of testRoutes) {
      const times = []

      for (let i = 0; i < testIterations; i++) {
        const startTime = performance.now()
        try {
          router.resolve(route)
        }
        catch (error) {
          // 忽略解析错误
        }
        const endTime = performance.now()
        times.push(endTime - startTime)
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      resolveResults.push({
        route,
        avgTime: avgTime.toFixed(4),
        opsPerSecond: Math.round(1000 / avgTime),
      })
    }

    const result = {
      routeCount,
      createTime: createTime.toFixed(2),
      resolveResults,
    }

    this.results.massRoutes = result
    return result
  }

  // 测试内存使用情况
  testMemoryUsage() {
    console.log('💾 测试内存使用情况...')

    const initialMemory = process.memoryUsage()

    // 创建大量路由器实例
    const routers = []
    for (let i = 0; i < 100; i++) {
      const routes = createTestRoutes(10)
      const router = createRouter({
        history: createMemoryHistory(),
        routes,
      })
      routers.push(router)
    }

    const finalMemory = process.memoryUsage()

    const memoryDiff = {
      heapUsed: (
        (finalMemory.heapUsed - initialMemory.heapUsed)
        / 1024
        / 1024
      ).toFixed(2),
      heapTotal: (
        (finalMemory.heapTotal - initialMemory.heapTotal)
        / 1024
        / 1024
      ).toFixed(2),
      external: (
        (finalMemory.external - initialMemory.external)
        / 1024
        / 1024
      ).toFixed(2),
    }

    this.results.memoryUsage = {
      routersCreated: routers.length,
      memoryDiff,
      avgMemoryPerRouter: (memoryDiff.heapUsed / routers.length).toFixed(4),
    }

    return this.results.memoryUsage
  }

  // 生成性能报告
  generateReport() {
    console.log('\n📋 性能基准测试报告')
    console.log('='.repeat(50))

    // 路由匹配报告
    if (this.results.routeMatching) {
      console.log('\n🔍 路由匹配性能:')
      this.results.routeMatching.forEach((result) => {
        console.log(
          `  ${result.route.padEnd(30)} ${result.avgTime}ms (${
            result.opsPerSecond
          } ops/s)`,
        )
      })
    }

    // 路由导航报告
    if (this.results.navigation) {
      console.log('\n🧭 路由导航性能:')
      this.results.navigation.forEach((result) => {
        console.log(
          `  ${result.route.padEnd(20)} 平均: ${result.avgTime}ms, 最小: ${
            result.minTime
          }ms, 最大: ${result.maxTime}ms`,
        )
      })
    }

    // 大量路由报告
    if (this.results.massRoutes) {
      console.log('\n📊 大量路由性能:')
      console.log(`  路由数量: ${this.results.massRoutes.routeCount}`)
      console.log(`  创建时间: ${this.results.massRoutes.createTime}ms`)
      console.log('  解析性能:')
      this.results.massRoutes.resolveResults.forEach((result) => {
        console.log(
          `    ${result.route.padEnd(30)} ${result.avgTime}ms (${
            result.opsPerSecond
          } ops/s)`,
        )
      })
    }

    // 内存使用报告
    if (this.results.memoryUsage) {
      console.log('\n💾 内存使用情况:')
      console.log(
        `  创建路由器数量: ${this.results.memoryUsage.routersCreated}`,
      )
      console.log(
        `  堆内存增加: ${this.results.memoryUsage.memoryDiff.heapUsed}MB`,
      )
      console.log(
        `  平均每个路由器: ${this.results.memoryUsage.avgMemoryPerRouter}MB`,
      )
    }

    console.log('\n✅ 性能测试完成!')
  }

  // 保存结果到文件
  saveResults(filename = 'performance-results.json') {
    const resultsWithTimestamp = {
      timestamp: new Date().toISOString(),
      config: BENCHMARK_CONFIG,
      results: this.results,
    }

    const filePath = path.join(process.cwd(), filename)
    fs.writeFileSync(filePath, JSON.stringify(resultsWithTimestamp, null, 2))
    console.log(`\n💾 结果已保存到: ${filePath}`)
  }
}

// 运行性能测试
async function runBenchmark() {
  console.log('🚀 开始路由性能基准测试...\n')

  const benchmark = new PerformanceBenchmark()

  try {
    await benchmark.testRouteMatching()
    await benchmark.testNavigation()
    await benchmark.testMassRoutes()
    benchmark.testMemoryUsage()

    benchmark.generateReport()
    benchmark.saveResults()
  }
  catch (error) {
    console.error('❌ 性能测试失败:', error)
    process.exit(1)
  }
}

// 如果直接运行此脚本
console.log('Script URL:', import.meta.url)
console.log('Process argv[1]:', process.argv[1])
console.log('Comparison:', import.meta.url === `file://${process.argv[1]}`)

// 直接运行基准测试
console.log('Starting benchmark...')
runBenchmark().catch(console.error)

export { PerformanceBenchmark, runBenchmark }
