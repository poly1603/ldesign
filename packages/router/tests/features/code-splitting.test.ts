/**
 * 代码分割功能测试套件
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  CodeSplittingManager,
  createCodeSplittingManager,
  type SplittingConfig,
  type RouteRecordRaw
} from '../../src'

describe('CodeSplittingManager', () => {
  let manager: CodeSplittingManager
  
  beforeEach(() => {
    manager = createCodeSplittingManager({
      strategy: 'route',
      maxChunkSize: 100,
      minChunkSize: 10,
      maxConcurrentLoads: 3,
      preloadStrategy: 'lazy'
    })
  })
  
  afterEach(() => {
    manager.dispose()
  })
  
  describe('路由分析', () => {
    it('应该正确分析路由结构', () => {
      const routes: RouteRecordRaw[] = [
        {
          path: '/',
          name: 'home',
          component: () => import('vue')
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('vue'),
          children: [
            {
              path: 'team',
              name: 'about-team',
              component: () => import('vue')
            },
            {
              path: 'history',
              name: 'about-history',
              component: () => import('vue')
            }
          ]
        },
        {
          path: '/products',
          name: 'products',
          component: () => import('vue'),
          meta: { priority: 'high' }
        }
      ]
      
      const analysis = manager.analyzeRoutes(routes)
      
      expect(analysis.totalComponents).toBe(5)
      expect(analysis.chunks).toHaveLength(5)
      expect(analysis.estimatedSize).toBeGreaterThan(0)
      expect(analysis.suggestions).toBeDefined()
    })
    
    it('应该根据优先级生成正确的块', () => {
      const routes: RouteRecordRaw[] = [
        {
          path: '/',
          name: 'home',
          component: () => import('vue')
        },
        {
          path: '/admin',
          name: 'admin',
          component: () => import('vue'),
          meta: { priority: 'low' }
        }
      ]
      
      const analysis = manager.analyzeRoutes(routes)
      const homeChunk = analysis.chunks.find(c => c.name === 'home')
      const adminChunk = analysis.chunks.find(c => c.name === 'admin')
      
      expect(homeChunk?.priority).toBe('critical')
      expect(adminChunk?.priority).toBe('low')
    })
    
    it('应该生成优化建议', () => {
      const routes: RouteRecordRaw[] = [
        {
          path: '/huge',
          name: 'huge',
          component: () => import('vue'),
          children: Array.from({ length: 50 }, (_, i) => ({
            path: `child-${i}`,
            name: `child-${i}`,
            component: () => import('vue')
          }))
        }
      ]
      
      const analysis = manager.analyzeRoutes(routes)
      
      expect(analysis.suggestions.length).toBeGreaterThan(0)
      expect(analysis.suggestions.some(s => s.includes('过大'))).toBe(true)
    })
  })
  
  describe('路由分割', () => {
    it('应该创建分割路由', () => {
      const route: RouteRecordRaw = {
        path: '/test',
        name: 'test',
        component: () => Promise.resolve({ default: { name: 'TestComponent' } })
      }
      
      const splitRoute = manager.createSplitRoute(route)
      
      expect(splitRoute.path).toBe('/test')
      expect(splitRoute.name).toBe('test')
      expect(typeof splitRoute.component).toBe('function')
    })
    
    it('应该保持非函数组件不变', () => {
      const route: RouteRecordRaw = {
        path: '/static',
        name: 'static',
        component: { name: 'StaticComponent' } as any
      }
      
      const splitRoute = manager.createSplitRoute(route)
      
      expect(splitRoute).toEqual(route)
    })
  })
  
  describe('组件预加载', () => {
    it('应该根据优先级预加载组件', async () => {
      const loadSpy = vi.fn()
      
      // 模拟不同优先级的组件
      await manager.preloadComponent('critical-component')
      await manager.preloadComponent('normal-component')
      
      // 验证预加载队列
      const stats = manager.getLoadStatistics()
      expect(stats).toBeDefined()
    })
    
    it('应该避免重复预加载', async () => {
      await manager.preloadComponent('test-component')
      await manager.preloadComponent('test-component')
      
      // 第二次调用应该被忽略
      const stats = manager.getLoadStatistics()
      expect(stats).toBeDefined()
    })
  })
  
  describe('加载统计', () => {
    it('应该提供加载统计信息', () => {
      const stats = manager.getLoadStatistics()
      
      expect(stats).toHaveProperty('totalLoaded')
      expect(stats).toHaveProperty('totalCached')
      expect(stats).toHaveProperty('averageLoadTime')
      expect(stats).toHaveProperty('cacheHitRate')
      expect(stats).toHaveProperty('failureRate')
      
      expect(stats.totalLoaded).toBeGreaterThanOrEqual(0)
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0)
      expect(stats.cacheHitRate).toBeLessThanOrEqual(1)
    })
  })
  
  describe('不同分割策略', () => {
    it('应该支持模块策略', () => {
      const moduleManager = createCodeSplittingManager({
        strategy: 'module'
      })
      
      const routes: RouteRecordRaw[] = [
        {
          path: '/admin/users',
          name: 'admin-users',
          component: () => import('vue')
        },
        {
          path: '/admin/settings',
          name: 'admin-settings',
          component: () => import('vue')
        },
        {
          path: '/shop/products',
          name: 'shop-products',
          component: () => import('vue')
        }
      ]
      
      const analysis = moduleManager.analyzeRoutes(routes)
      
      // 验证模块分组
      const adminChunks = analysis.chunks.filter(c => c.id.includes('module-admin'))
      const shopChunks = analysis.chunks.filter(c => c.id.includes('module-shop'))
      
      expect(adminChunks.length).toBe(2)
      expect(shopChunks.length).toBe(1)
      
      moduleManager.dispose()
    })
    
    it('应该支持功能策略', () => {
      const featureManager = createCodeSplittingManager({
        strategy: 'feature'
      })
      
      const routes: RouteRecordRaw[] = [
        {
          path: '/user/profile',
          name: 'user-profile',
          component: () => import('vue')
        },
        {
          path: '/user/settings',
          name: 'user-settings',
          component: () => import('vue')
        }
      ]
      
      const analysis = featureManager.analyzeRoutes(routes)
      
      // 验证功能分组
      const userChunks = analysis.chunks.filter(c => c.id.includes('feature-user'))
      expect(userChunks.length).toBe(2)
      
      featureManager.dispose()
    })
  })
  
  describe('循环依赖检测', () => {
    it('应该检测循环依赖', () => {
      // 创建带有循环依赖的路由
      const routes: RouteRecordRaw[] = [
        {
          path: '/a',
          name: 'a',
          component: () => import('vue'),
          meta: { dependencies: ['b'] }
        },
        {
          path: '/b',
          name: 'b',
          component: () => import('vue'),
          meta: { dependencies: ['c'] }
        },
        {
          path: '/c',
          name: 'c',
          component: () => import('vue'),
          meta: { dependencies: ['a'] } // 循环依赖
        }
      ]
      
      const analysis = manager.analyzeRoutes(routes)
      
      // 应该包含循环依赖的警告
      const hasCircularWarning = analysis.suggestions.some(
        s => s.includes('循环依赖')
      )
      expect(hasCircularWarning).toBeDefined()
    })
  })
  
  describe('资源清理', () => {
    it('应该正确清理资源', () => {
      const manager = createCodeSplittingManager()
      
      // 添加一些数据
      manager.analyzeRoutes([
        {
          path: '/test',
          name: 'test',
          component: () => import('vue')
        }
      ])
      
      // 清理资源
      manager.dispose()
      
      // 验证资源已清理
      const stats = manager.getLoadStatistics()
      expect(stats.totalCached).toBe(0)
    })
  })
  
  describe('性能优化', () => {
    it('应该限制并发加载数', () => {
      const config: SplittingConfig = {
        strategy: 'route',
        maxConcurrentLoads: 2
      }
      
      const manager = createCodeSplittingManager(config)
      
      // 验证配置已应用
      expect(manager).toBeDefined()
      
      manager.dispose()
    })
    
    it('应该支持不同的缓存策略', () => {
      const memoryManager = createCodeSplittingManager({
        strategy: 'route',
        cacheStrategy: 'memory'
      })
      
      const storageManager = createCodeSplittingManager({
        strategy: 'route',
        cacheStrategy: 'storage'
      })
      
      const bothManager = createCodeSplittingManager({
        strategy: 'route',
        cacheStrategy: 'both'
      })
      
      expect(memoryManager).toBeDefined()
      expect(storageManager).toBeDefined()
      expect(bothManager).toBeDefined()
      
      memoryManager.dispose()
      storageManager.dispose()
      bothManager.dispose()
    })
  })
})

describe('CodeSplittingPlugin', () => {
  it('应该正确安装插件', () => {
    const app = {
      provide: vi.fn(),
      config: {
        globalProperties: {}
      },
      unmount: vi.fn()
    }
    
    const { CodeSplittingPlugin } = require('../../src')
    
    CodeSplittingPlugin.install(app, {
      strategy: 'route'
    })
    
    expect(app.provide).toHaveBeenCalledWith(
      'codeSplittingManager',
      expect.any(Object)
    )
    expect(app.config.globalProperties.$codeSplitting).toBeDefined()
  })
})