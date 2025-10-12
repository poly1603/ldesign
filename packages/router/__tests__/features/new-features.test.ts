/**
 * @ldesign/router 新功能测试套件
 * 
 * 测试版本控制、性能分析、调试器等新功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from '../../src'
import { 
  setupRouteVersionControl,
  setupPerformanceAnalyzer,
  setupRouteDebugger,
  getMemoryManager,
  CachePriority
} from '../../src'
import type { Router } from '../../src/types'

describe('New Features Test Suite', () => {
  let router: Router
  
  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: 'home', component: {} },
        { path: '/about', name: 'about', component: {} },
        { path: '/users/:id', name: 'user', component: {} },
        { 
          path: '/admin', 
          name: 'admin', 
          component: {},
          children: [
            { path: 'dashboard', name: 'admin-dashboard', component: {} },
            { path: 'settings', name: 'admin-settings', component: {} },
          ]
        },
      ],
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Route Version Control', () => {
    it('should create and restore route versions', async () => {
      const versionControl = setupRouteVersionControl(router)
      
      // 创建初始版本
      const v1 = await versionControl.createVersion('v1.0.0', 'Initial version')
      expect(v1.name).toBe('v1.0.0')
      expect(v1.routes).toHaveLength(4)

      // 添加新路由
      router.addRoute({
        path: '/new-route',
        name: 'new-route',
        component: {},
      })

      // 创建新版本
      const v2 = await versionControl.createVersion('v2.0.0', 'Added new route')
      expect(v2.routes).toHaveLength(5)

      // 恢复到 v1
      const restored = await versionControl.restoreVersion(v1.id)
      expect(restored).toBe(true)
      
      // 验证路由已恢复
      const routes = router.getRoutes()
      expect(routes).toHaveLength(4)
      expect(routes.find(r => r.name === 'new-route')).toBeUndefined()
    })

    it('should compare versions and show differences', async () => {
      const versionControl = setupRouteVersionControl(router)
      
      const v1 = await versionControl.createVersion('v1.0.0')
      
      router.addRoute({
        path: '/products',
        name: 'products',
        component: {},
      })
      
      const v2 = await versionControl.createVersion('v2.0.0')
      
      const diff = versionControl.compareVersions(v1.id, v2.id)
      expect(diff).not.toBeNull()
      expect(diff!.added).toHaveLength(1)
      expect(diff!.added[0].path).toBe('/products')
      expect(diff!.removed).toHaveLength(0)
      expect(diff!.totalChanges).toBe(1)
    })

    it('should support version branching', async () => {
      const versionControl = setupRouteVersionControl(router)
      
      const main = await versionControl.createVersion('main')
      const branch = await versionControl.createBranch(main.id, 'feature-branch')
      
      expect(branch).not.toBeNull()
      expect(branch!.name).toBe('feature-branch')
      expect(branch!.description).toContain('Branch from main')
    })
  })

  describe('Performance Analyzer', () => {
    it('should track navigation performance', async () => {
      const analyzer = setupPerformanceAnalyzer(router, {
        sampleRate: 1,
        autoAnalyze: false,
      })

      // 模拟导航
      await router.push('/about')
      await router.push('/users/123')
      
      // 生成报告
      const report = analyzer.generateReport()
      
      expect(report.totalNavigations).toBeGreaterThan(0)
      expect(report.averageNavigationTime).toBeGreaterThanOrEqual(0)
      expect(report.performanceTrend).toBe('stable')
    })

    it('should provide optimization suggestions', async () => {
      const analyzer = setupPerformanceAnalyzer(router, {
        thresholds: {
          good: 100,
          acceptable: 200,
          poor: 500,
        },
      })

      // 模拟慢导航
      const slowRoute = '/admin/dashboard'
      
      // 手动记录慢导航（模拟）
      analyzer['metrics'].set(slowRoute, [
        {
          path: slowRoute,
          startTime: 0,
          endTime: 600,
          duration: 600,
          score: 30,
        },
      ])
      
      const report = analyzer.generateReport()
      const suggestions = report.suggestions
      
      expect(suggestions.length).toBeGreaterThan(0)
      expect(suggestions[0].type).toBeTruthy()
      expect(suggestions[0].priority).toBeTruthy()
    })

    it('should calculate performance percentiles', () => {
      const analyzer = setupPerformanceAnalyzer(router)
      
      // 添加测试数据
      const testMetrics = Array.from({ length: 100 }, (_, i) => ({
        path: '/',
        startTime: i * 100,
        endTime: i * 100 + 50 + i,
        duration: 50 + i,
        score: 80,
      }))
      
      analyzer['metrics'].set('/', testMetrics)
      
      const report = analyzer.generateReport()
      
      expect(report.detailedMetrics.p50).toBeGreaterThan(0)
      expect(report.detailedMetrics.p75).toBeGreaterThan(report.detailedMetrics.p50)
      expect(report.detailedMetrics.p90).toBeGreaterThan(report.detailedMetrics.p75)
      expect(report.detailedMetrics.p95).toBeGreaterThan(report.detailedMetrics.p90)
      expect(report.detailedMetrics.p99).toBeGreaterThan(report.detailedMetrics.p95)
    })
  })

  describe('Route Debugger', () => {
    it('should track navigation events', async () => {
      const debugger = setupRouteDebugger(router, {
        console: false,
      })

      await router.push('/about')
      
      const events = debugger.getEvents()
      expect(events.length).toBeGreaterThan(0)
      
      const navEvent = events.find(e => e.type === 'navigation')
      expect(navEvent).toBeDefined()
      expect(navEvent!.route?.to).toBe('/about')
    })

    it('should support breakpoints', () => {
      const debugger = setupRouteDebugger(router)
      
      const callback = vi.fn()
      
      const breakpointId = debugger.addBreakpoint({
        type: 'route',
        routePattern: '/users/.*',
        callback,
      })
      
      expect(breakpointId).toBeTruthy()
      
      const breakpoints = debugger.getBreakpoints()
      expect(breakpoints).toHaveLength(1)
      expect(breakpoints[0].routePattern).toBe('/users/.*')
    })

    it('should trace navigation steps', async () => {
      const debugger = setupRouteDebugger(router, {
        trackComponents: true,
        trackGuards: true,
      })

      await router.push('/admin/settings')
      
      const traces = debugger.getTraces()
      expect(traces.length).toBeGreaterThan(0)
      
      const trace = traces[0]
      expect(trace.chain).toBeDefined()
      expect(trace.chain.length).toBeGreaterThan(0)
      expect(trace.chain[0].type).toBe('start')
    })

    it('should export and import debug data', () => {
      const debugger = setupRouteDebugger(router)
      
      // 添加一些测试数据
      debugger.addBreakpoint({
        type: 'error',
        enabled: true,
      })
      
      // 导出数据
      const exportedData = debugger.exportData()
      expect(exportedData).toBeTruthy()
      
      // 清除并导入
      debugger.clear()
      expect(debugger.getBreakpoints()).toHaveLength(0)
      
      const imported = debugger.importData(exportedData)
      expect(imported).toBe(true)
      expect(debugger.getBreakpoints()).toHaveLength(1)
    })
  })

  describe('Unified Memory Manager', () => {
    it('should manage tiered cache', () => {
      const memory = getMemoryManager()
      
      // 设置不同优先级的缓存
      memory.set('hot-data', { value: 'hot' }, { priority: CachePriority.HOT })
      memory.set('warm-data', { value: 'warm' }, { priority: CachePriority.WARM })
      memory.set('cold-data', { value: 'cold' }, { priority: CachePriority.COLD })
      
      // 获取缓存
      expect(memory.get('hot-data')).toEqual({ value: 'hot' })
      expect(memory.get('warm-data')).toEqual({ value: 'warm' })
      expect(memory.get('cold-data')).toEqual({ value: 'cold' })
      
      // 获取缓存信息
      const info = memory.getCacheInfo()
      expect(info.cache.totalSize).toBe(3)
    })

    it('should support weak references', () => {
      const memory = getMemoryManager()
      
      const obj = { data: 'test' }
      memory.createWeakRef('weak-obj', obj)
      
      const retrieved = memory.getWeakRef('weak-obj')
      expect(retrieved).toBe(obj)
      
      const stats = memory.getStats()
      expect(stats.weakRefCount).toBeGreaterThan(0)
    })

    it('should automatically optimize memory', () => {
      const memory = getMemoryManager({
        tieredCache: {
          l1Capacity: 2,
          l2Capacity: 2,
          l3Capacity: 2,
        },
      })
      
      // 填充缓存
      for (let i = 0; i < 10; i++) {
        memory.set(`item-${i}`, { value: i })
      }
      
      // 触发优化
      memory.optimize()
      
      const info = memory.getCacheInfo()
      expect(info.cache.totalSize).toBeLessThanOrEqual(6) // 总容量限制
    })

    it('should track memory statistics', () => {
      const memory = getMemoryManager()
      
      memory.set('test', { data: 'large' })
      
      const stats = memory.getStats()
      expect(stats.cacheMemory).toBeGreaterThan(0)
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0)
      expect(stats.evictionCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Integration Tests', () => {
    it('should work together seamlessly', async () => {
      // 设置所有功能
      const versionControl = setupRouteVersionControl(router)
      const analyzer = setupPerformanceAnalyzer(router)
      const debugger = setupRouteDebugger(router)
      const memory = getMemoryManager()
      
      // 创建版本
      await versionControl.createVersion('initial')
      
      // 导航并跟踪
      await router.push('/about')
      await router.push('/users/123')
      
      // 缓存路由数据
      memory.set('route:/about', { preloaded: true })
      
      // 检查各功能状态
      expect(versionControl.getVersionHistory()).toHaveLength(1)
      expect(analyzer.generateReport().totalNavigations).toBeGreaterThan(0)
      expect(debugger.getEvents().length).toBeGreaterThan(0)
      expect(memory.get('route:/about')).toEqual({ preloaded: true })
    })

    it('should handle errors gracefully', async () => {
      const debugger = setupRouteDebugger(router, {
        console: false,
      })
      
      // 模拟错误
      const error = new Error('Navigation failed')
      router.onError(error)
      
      const events = debugger.getEvents()
      const errorEvent = events.find(e => e.level === 'error')
      
      expect(errorEvent).toBeDefined()
      expect(errorEvent!.message).toContain('Router error')
      expect(debugger.state.lastError).toBe(error)
    })
  })
})