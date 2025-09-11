/**
 * 路径规划模块测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { RoutingModule } from '../../features/routing/RoutingModule'
import type { IMapEngine, RoutingOptions } from '../../types'

// Mock map engine
const createMockMapEngine = (): IMapEngine => ({
  addSource: vi.fn(),
  removeSource: vi.fn(),
  addLayer: vi.fn(),
  removeLayer: vi.fn(),
  updateLayerStyle: vi.fn(),
  setLayerVisibility: vi.fn(),
  toggleLayer: vi.fn(),
  moveLayer: vi.fn(),
  hasSource: vi.fn().mockReturnValue(false),
  updateSource: vi.fn(),
  addMarker: vi.fn(),
  removeMarker: vi.fn(),
  updateMarker: vi.fn(),
  clearMarkers: vi.fn(),
  setCenter: vi.fn(),
  getCenter: vi.fn().mockReturnValue([116.404, 39.915]),
  setZoom: vi.fn(),
  getZoom: vi.fn().mockReturnValue(10),
  setBearing: vi.fn(),
  getBearing: vi.fn().mockReturnValue(0),
  setPitch: vi.fn(),
  getPitch: vi.fn().mockReturnValue(0),
  flyTo: vi.fn(),
  fitBounds: vi.fn(),
  getBounds: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  resize: vi.fn(),
  getContainer: vi.fn().mockReturnValue(document.createElement('div')),
  getMapInstance: vi.fn(),
  project: vi.fn(),
  unproject: vi.fn(),
  setFeatureState: vi.fn(),
  getFeatureState: vi.fn()
})

describe('RoutingModule', () => {
  let routingModule: RoutingModule
  let mockMapEngine: IMapEngine

  beforeEach(() => {
    mockMapEngine = createMockMapEngine()
    routingModule = new RoutingModule()
  })

  afterEach(() => {
    if (routingModule.isInitialized()) {
      routingModule.destroy()
    }
  })

  describe('基础功能', () => {
    it('应该能够创建路径规划模块实例', () => {
      expect(routingModule).toBeInstanceOf(RoutingModule)
      expect(routingModule.name).toBe('routing')
      expect(routingModule.isInitialized()).toBe(false)
    })

    it('应该能够初始化模块', async () => {
      await routingModule.initialize(mockMapEngine)
      expect(routingModule.isInitialized()).toBe(true)
      expect(mockMapEngine.addSource).toHaveBeenCalled()
      expect(mockMapEngine.addLayer).toHaveBeenCalled()
    })

    it('应该能够销毁模块', async () => {
      await routingModule.initialize(mockMapEngine)
      routingModule.destroy()
      expect(routingModule.isInitialized()).toBe(false)
    })
  })

  describe('路径规划功能', () => {
    beforeEach(async () => {
      await routingModule.initialize(mockMapEngine)
    })

    it('应该能够计算路径', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      // Mock fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: []
          }]
        })
      })

      const result = await routingModule.calculateRoute(routingOptions)
      expect(result).toBeDefined()
      expect(result.distance).toBe(1000)
      expect(result.duration).toBe(300)
    })

    it('应该能够添加路径到地图', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      // Mock successful route calculation
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: []
          }]
        })
      })

      const routeId = await routingModule.addRoute(routingOptions)
      expect(routeId).toBeDefined()
      expect(typeof routeId).toBe('string')
    })

    it('应该能够移除路径', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: []
          }]
        })
      })

      const routeId = await routingModule.addRoute(routingOptions)
      routingModule.removeRoute(routeId)
      
      expect(mockMapEngine.removeLayer).toHaveBeenCalled()
      expect(mockMapEngine.removeSource).toHaveBeenCalled()
    })

    it('应该能够清除所有路径', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: []
          }]
        })
      })

      await routingModule.addRoute(routingOptions)
      await routingModule.addRoute(routingOptions)
      
      routingModule.clearRoutes()
      expect(mockMapEngine.removeLayer).toHaveBeenCalled()
      expect(mockMapEngine.removeSource).toHaveBeenCalled()
    })

    it('应该能够获取路径统计信息', async () => {
      const stats = routingModule.getRoutingStats()
      expect(stats).toBeDefined()
      expect(stats.totalRoutes).toBe(0)
      expect(stats.totalDistance).toBe(0)
      expect(stats.totalDuration).toBe(0)
    })
  })

  describe('导航功能', () => {
    beforeEach(async () => {
      await routingModule.initialize(mockMapEngine)
    })

    it('应该能够开始导航', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: [{
              steps: [{
                instruction: 'Head north',
                distance: 500,
                duration: 150
              }]
            }]
          }]
        })
      })

      const routeId = await routingModule.addRoute(routingOptions)
      routingModule.startNavigation(routeId)
      
      const navState = routingModule.getNavigationState()
      expect(navState.isNavigating).toBe(true)
      expect(navState.activeRouteId).toBe(routeId)
    })

    it('应该能够停止导航', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: [{
              steps: [{
                instruction: 'Head north',
                distance: 500,
                duration: 150
              }]
            }]
          }]
        })
      })

      const routeId = await routingModule.addRoute(routingOptions)
      routingModule.startNavigation(routeId)
      routingModule.stopNavigation()
      
      const navState = routingModule.getNavigationState()
      expect(navState.isNavigating).toBe(false)
      expect(navState.activeRouteId).toBeNull()
    })
  })

  describe('错误处理', () => {
    beforeEach(async () => {
      await routingModule.initialize(mockMapEngine)
    })

    it('应该处理API错误', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(routingModule.calculateRoute(routingOptions)).rejects.toThrow()
    })

    it('应该处理网络错误', async () => {
      const routingOptions: RoutingOptions = {
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      }

      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(routingModule.calculateRoute(routingOptions)).rejects.toThrow('Network error')
    })
  })
})
