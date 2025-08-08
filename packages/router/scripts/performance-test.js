#!/usr/bin/env node

/**
 * LDesign Router 性能测试脚本
 *
 * 测试路由匹配性能、内存使用情况和导航速度
 */

import { performance } from 'node:perf_hooks'
import { createRouterMatcher } from '../es/index.js'

// Mock window for Node.js environment
global.window = {
  location: {
    pathname: '/',
    search: '',
    hash: '',
  },
  history: {
    pushState: () => {},
    replaceState: () => {},
    go: () => {},
  },
}

// 颜色输出工具
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

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 生成测试路由
function generateRoutes(count) {
  const routes = []

  // 静态路由
  for (let i = 0; i < count / 2; i++) {
    routes.push({
      path: `/static/${i}`,
      name: `Static${i}`,
      component: () => Promise.resolve({ template: `<div>Static ${i}</div>` }),
    })
  }

  // 动态路由
  for (let i = 0; i < count / 2; i++) {
    routes.push({
      path: `/dynamic/:id${i}`,
      name: `Dynamic${i}`,
      component: () => Promise.resolve({ template: `<div>Dynamic ${i}</div>` }),
    })
  }

  // 嵌套路由
  routes.push({
    path: '/nested',
    name: 'Nested',
    component: () => Promise.resolve({ template: '<div>Nested</div>' }),
    children: Array.from({ length: 50 }, (_, i) => ({
      path: `child${i}`,
      name: `NestedChild${i}`,
      component: () => Promise.resolve({ template: `<div>Child ${i}</div>` }),
    })),
  })

  return routes
}

// 路由匹配性能测试
async function testRouteMatching(matcher, routes) {
  colorLog('cyan', '\n🔍 路由匹配性能测试')
  console.log('='.repeat(50))

  const testPaths = [
    '/static/100',
    '/static/500',
    '/dynamic/123',
    '/dynamic/abc',
    '/nested/child25',
    '/non-existent',
  ]

  const results = []

  for (const path of testPaths) {
    const iterations = 10000
    const start = performance.now()

    for (let i = 0; i < iterations; i++) {
      try {
        matcher.resolve({ path }, { path: '/' })
      } catch (error) {
        // 忽略不存在的路由错误
      }
    }

    const end = performance.now()
    const totalTime = end - start
    const avgTime = totalTime / iterations

    results.push({
      path,
      totalTime: totalTime.toFixed(2),
      avgTime: (avgTime * 1000).toFixed(3), // 转换为微秒
      opsPerSecond: Math.round(iterations / (totalTime / 1000)),
    })
  }

  // 输出结果
  console.log('\n路径\t\t\t总时间(ms)\t平均时间(μs)\t操作/秒')
  console.log('-'.repeat(70))

  results.forEach(result => {
    const pathDisplay = result.path.padEnd(20)
    const totalDisplay = result.totalTime.padStart(10)
    const avgDisplay = result.avgTime.padStart(12)
    const opsDisplay = result.opsPerSecond.toLocaleString().padStart(10)

    console.log(`${pathDisplay}\t${totalDisplay}\t${avgDisplay}\t${opsDisplay}`)
  })

  const avgOps = Math.round(
    results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
  )
  colorLog('green', `\n✅ 平均性能: ${avgOps.toLocaleString()} 操作/秒`)

  return results
}

// 主测试函数
async function runPerformanceTests() {
  colorLog('bright', '🚀 LDesign Router 性能测试')
  colorLog('bright', '='.repeat(50))

  const routeCount = 1000
  colorLog('yellow', `\n📊 生成 ${routeCount} 个测试路由...`)

  const routes = generateRoutes(routeCount)

  colorLog('yellow', '🔧 创建路由匹配器实例...')
  const matcher = createRouterMatcher(routes, {})

  // 运行测试
  const matchingResults = await testRouteMatching(matcher, routes)

  // 生成总结报告
  colorLog('bright', '\n📋 性能测试总结')
  console.log('='.repeat(50))

  const avgMatchingOps = Math.round(
    matchingResults.reduce((sum, r) => sum + r.opsPerSecond, 0) /
      matchingResults.length
  )

  console.log(`📈 路由匹配性能: ${avgMatchingOps.toLocaleString()} 操作/秒`)

  // 性能评级
  let grade = 'A+'
  if (avgMatchingOps < 100000) grade = 'A'
  if (avgMatchingOps < 50000) grade = 'B'
  if (avgMatchingOps < 10000) grade = 'C'

  colorLog('green', `\n🏆 总体性能评级: ${grade}`)

  if (grade === 'A+' || grade === 'A') {
    colorLog('green', '✅ 性能优秀！路由匹配器运行高效。')
  } else if (grade === 'B') {
    colorLog('yellow', '⚠️  性能良好，但有优化空间。')
  } else {
    colorLog('red', '❌ 性能需要改进。')
  }
}

// 运行测试
runPerformanceTests().catch(error => {
  colorLog('red', `❌ 测试失败: ${error.message}`)
  process.exit(1)
})
