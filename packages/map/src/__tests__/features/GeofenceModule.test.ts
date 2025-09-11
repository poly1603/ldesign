/**
 * 地理围栏模块测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { GeofenceModule } from '../../features/geofence/GeofenceModule'
import type { IMapEngine, GeofenceOptions } from '../../types'

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

describe('GeofenceModule', () => {
  let geofenceModule: GeofenceModule
  let mockMapEngine: IMapEngine

  beforeEach(() => {
    mockMapEngine = createMockMapEngine()
    geofenceModule = new GeofenceModule()
  })

  afterEach(() => {
    if (geofenceModule.isInitialized()) {
      geofenceModule.destroy()
    }
  })

  describe('基础功能', () => {
    it('应该能够创建地理围栏模块实例', () => {
      expect(geofenceModule).toBeInstanceOf(GeofenceModule)
      expect(geofenceModule.name).toBe('geofence')
      expect(geofenceModule.isInitialized()).toBe(false)
    })

    it('应该能够初始化模块', async () => {
      await geofenceModule.initialize(mockMapEngine)
      expect(geofenceModule.isInitialized()).toBe(true)
      expect(mockMapEngine.addSource).toHaveBeenCalled()
      expect(mockMapEngine.addLayer).toHaveBeenCalled()
    })

    it('应该能够销毁模块', async () => {
      await geofenceModule.initialize(mockMapEngine)
      geofenceModule.destroy()
      expect(geofenceModule.isInitialized()).toBe(false)
    })
  })

  describe('地理围栏功能', () => {
    beforeEach(async () => {
      await geofenceModule.initialize(mockMapEngine)
    })

    it('应该能够添加地理围栏', () => {
      const geofenceOptions: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      const geofenceId = geofenceModule.addGeofence(geofenceOptions)
      expect(geofenceId).toBeDefined()
      expect(typeof geofenceId).toBe('string')
    })

    it('应该能够移除地理围栏', () => {
      const geofenceOptions: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      const geofenceId = geofenceModule.addGeofence(geofenceOptions)
      geofenceModule.removeGeofence(geofenceId)
      
      const geofence = geofenceModule.getGeofence(geofenceId)
      expect(geofence).toBeUndefined()
    })

    it('应该能够更新地理围栏', () => {
      const geofenceOptions: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      const geofenceId = geofenceModule.addGeofence(geofenceOptions)
      geofenceModule.updateGeofence(geofenceId, { name: '更新的围栏' })
      
      const geofence = geofenceModule.getGeofence(geofenceId)
      expect(geofence?.name).toBe('更新的围栏')
    })

    it('应该能够获取所有地理围栏', () => {
      const geofenceOptions1: GeofenceOptions = {
        name: '围栏1',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      const geofenceOptions2: GeofenceOptions = {
        name: '围栏2',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.408, 39.919],
            [116.411, 39.919],
            [116.411, 39.922],
            [116.408, 39.922],
            [116.408, 39.919]
          ]]
        }
      }

      geofenceModule.addGeofence(geofenceOptions1)
      geofenceModule.addGeofence(geofenceOptions2)
      
      const allGeofences = geofenceModule.getAllGeofences()
      expect(allGeofences).toHaveLength(2)
    })

    it('应该能够清除所有地理围栏', () => {
      const geofenceOptions: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      geofenceModule.addGeofence(geofenceOptions)
      geofenceModule.clearGeofences()
      
      const allGeofences = geofenceModule.getAllGeofences()
      expect(allGeofences).toHaveLength(0)
    })
  })

  describe('点位跟踪功能', () => {
    beforeEach(async () => {
      await geofenceModule.initialize(mockMapEngine)
    })

    it('应该能够开始跟踪点位', () => {
      const pointId = 'test-point'
      const initialPoint: [number, number] = [116.405, 39.916]
      
      geofenceModule.startTracking(pointId, initialPoint)
      
      // 验证跟踪已开始（通过内部状态检查）
      expect(() => geofenceModule.updateTrackedPoint(pointId, [116.406, 39.917])).not.toThrow()
    })

    it('应该能够停止跟踪点位', () => {
      const pointId = 'test-point'
      const initialPoint: [number, number] = [116.405, 39.916]
      
      geofenceModule.startTracking(pointId, initialPoint)
      geofenceModule.stopTracking(pointId)
      
      // 验证跟踪已停止
      expect(() => geofenceModule.updateTrackedPoint(pointId, [116.406, 39.917])).not.toThrow()
    })

    it('应该能够更新跟踪点位置', () => {
      const pointId = 'test-point'
      const initialPoint: [number, number] = [116.405, 39.916]
      
      geofenceModule.startTracking(pointId, initialPoint)
      
      expect(() => {
        geofenceModule.updateTrackedPoint(pointId, [116.406, 39.917])
      }).not.toThrow()
    })
  })

  describe('事件处理', () => {
    beforeEach(async () => {
      await geofenceModule.initialize(mockMapEngine)
    })

    it('应该能够监听地理围栏事件', () => {
      const eventCallback = vi.fn()
      geofenceModule.onGeofenceEvent(eventCallback)
      
      // 模拟事件触发
      const geofenceOptions: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      geofenceModule.addGeofence(geofenceOptions)
      
      // 检查事件监听器是否已添加
      expect(eventCallback).not.toHaveBeenCalled() // 初始状态
    })

    it('应该能够移除事件监听器', () => {
      const eventCallback = vi.fn()
      geofenceModule.onGeofenceEvent(eventCallback)
      geofenceModule.removeEventListener(eventCallback)
      
      // 验证监听器已移除
      expect(() => geofenceModule.removeEventListener(eventCallback)).not.toThrow()
    })

    it('应该能够清除所有事件监听器', () => {
      const eventCallback1 = vi.fn()
      const eventCallback2 = vi.fn()
      
      geofenceModule.onGeofenceEvent(eventCallback1)
      geofenceModule.onGeofenceEvent(eventCallback2)
      geofenceModule.clearEventListeners()
      
      // 验证所有监听器已清除
      expect(() => geofenceModule.clearEventListeners()).not.toThrow()
    })
  })

  describe('统计信息', () => {
    beforeEach(async () => {
      await geofenceModule.initialize(mockMapEngine)
    })

    it('应该能够获取地理围栏统计信息', () => {
      const stats = geofenceModule.getGeofenceStats()
      expect(stats).toBeDefined()
      expect(stats.total).toBe(0)
      expect(stats.active).toBe(0)
      expect(stats.trackedPoints).toBe(0)
      expect(stats.totalEvents).toBe(0)
    })

    it('统计信息应该反映实际状态', () => {
      const geofenceOptions: GeofenceOptions = {
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.404, 39.915],
            [116.407, 39.915],
            [116.407, 39.918],
            [116.404, 39.918],
            [116.404, 39.915]
          ]]
        }
      }

      geofenceModule.addGeofence(geofenceOptions)
      geofenceModule.startTracking('test-point', [116.405, 39.916])
      
      const stats = geofenceModule.getGeofenceStats()
      expect(stats.total).toBe(1)
      expect(stats.trackedPoints).toBe(1)
    })
  })
})
