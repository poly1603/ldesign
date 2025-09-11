/**
 * 地图插件集成测试
 * 测试各个模块之间的协作和整体功能
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LDesignMap } from '../../core/LDesignMap'
import type { MapOptions } from '../../types'

// Mock Mapbox GL JS
vi.mock('mapbox-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
      setCenter: vi.fn(),
      getCenter: vi.fn(() => ({ lng: 116.404, lat: 39.915 })),
      setZoom: vi.fn(),
      getZoom: vi.fn(() => 10),
      setBearing: vi.fn(),
      getBearing: vi.fn(() => 0),
      setPitch: vi.fn(),
      getPitch: vi.fn(() => 0),
      flyTo: vi.fn(),
      getBounds: vi.fn(() => ({
        getWest: () => 116.0,
        getSouth: () => 39.5,
        getEast: () => 117.0,
        getNorth: () => 40.5
      })),
      fitBounds: vi.fn(),
      addSource: vi.fn(),
      removeSource: vi.fn(),
      getSource: vi.fn(),
      addLayer: vi.fn(),
      removeLayer: vi.fn(),
      getLayer: vi.fn(),
      setPaintProperty: vi.fn(),
      setLayoutProperty: vi.fn(),
      setFilter: vi.fn(),
      unproject: vi.fn((point) => ({ lng: point[0], lat: point[1] })),
      project: vi.fn((lngLat) => ({ x: lngLat[0], y: lngLat[1] })),
      resize: vi.fn(),
      getContainer: vi.fn(() => document.createElement('div')),
      fire: vi.fn(),
      addControl: vi.fn(),
      setFeatureState: vi.fn(),
      getFeatureState: vi.fn()
    })),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      getElement: vi.fn(() => document.createElement('div'))
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      setHTML: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis()
    })),
    LngLatBounds: vi.fn().mockImplementation((sw, ne) => ({
      getWest: () => sw[0],
      getSouth: () => sw[1],
      getEast: () => ne[0],
      getNorth: () => ne[1]
    })),
    NavigationControl: vi.fn(),
    ScaleControl: vi.fn(),
    FullscreenControl: vi.fn(),
    accessToken: 'test-token'
  }
}))

// Mock fetch for API calls
global.fetch = vi.fn()

describe('地图插件集成测试', () => {
  let map: LDesignMap
  let container: HTMLElement
  let mapOptions: MapOptions

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'integration-test-map'
    document.body.appendChild(container)

    // 基础配置
    mapOptions = {
      container: '#integration-test-map',
      center: [116.404, 39.915],
      zoom: 10,
      accessToken: 'test-token'
    }

    // 重置 fetch mock
    vi.mocked(fetch).mockClear()
  })

  afterEach(() => {
    // 清理
    if (map && map.isInitialized()) {
      map.destroy()
    }
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('地图初始化和模块加载', () => {
    it('应该能够初始化地图并加载所有功能模块', async () => {
      map = new LDesignMap(mapOptions)
      
      // Mock 初始化
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      
      await map.initialize()
      
      expect(map.isInitialized()).toBe(true)
      
      // 验证功能模块可访问
      expect(map.routing).toBeDefined()
      expect(map.geofence).toBeDefined()
      expect(map.heatmap).toBeDefined()
      expect(map.search).toBeDefined()
      expect(map.measurement).toBeDefined()
      expect(map.layers).toBeDefined()
    })

    it('应该能够在销毁时正确清理所有模块', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      
      await map.initialize()
      
      // 添加一些数据
      map.addMarker({
        lngLat: [116.404, 39.915],
        popup: { content: '测试标记' }
      })
      
      // 销毁地图
      map.destroy()
      
      expect(map.isInitialized()).toBe(false)
    })
  })

  describe('标记点和图层集成', () => {
    beforeEach(async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()
    })

    it('应该能够添加标记点并管理图层', async () => {
      // 添加标记点
      const markerId = map.addMarker({
        lngLat: [116.404, 39.915],
        popup: { content: '测试标记' }
      })
      
      expect(markerId).toBeDefined()
      
      // 添加图层
      const layerId = map.layers.addLayer({
        id: 'test-layer',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        },
        paint: {
          'circle-radius': 6,
          'circle-color': '#722ED1'
        }
      })
      
      expect(layerId).toBe('test-layer')
      
      // 验证图层可见性控制
      map.layers.setLayerVisibility('test-layer', false)
      map.layers.setLayerVisibility('test-layer', true)
    })
  })

  describe('路径规划和地理围栏集成', () => {
    beforeEach(async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()
    })

    it('应该能够计算路径并设置地理围栏', async () => {
      // Mock 路径规划 API 响应
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          routes: [{
            geometry: 'mock-geometry',
            distance: 1000,
            duration: 300,
            legs: []
          }]
        })
      } as Response)

      // 添加路径
      const routeId = await map.routing.addRoute({
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      })
      
      expect(routeId).toBeDefined()
      
      // 添加地理围栏
      const geofenceId = map.geofence.addGeofence({
        name: '测试围栏',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.403, 39.914],
            [116.408, 39.914],
            [116.408, 39.919],
            [116.403, 39.919],
            [116.403, 39.914]
          ]]
        }
      })
      
      expect(geofenceId).toBeDefined()
      
      // 验证围栏事件监听
      let eventTriggered = false
      map.geofence.onGeofenceEvent((event) => {
        eventTriggered = true
      })
      
      // 模拟点位进入围栏
      map.geofence.checkGeofenceEvents(
        [116.405, 39.916],
        [116.400, 39.910]
      )
    })
  })

  describe('搜索和热力图集成', () => {
    beforeEach(async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()
    })

    it('应该能够搜索地点并显示热力图', async () => {
      // Mock 搜索 API 响应
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          features: [{
            place_name: '北京市',
            center: [116.404, 39.915],
            geometry: {
              type: 'Point',
              coordinates: [116.404, 39.915]
            },
            properties: {}
          }]
        })
      } as Response)

      // 搜索地点
      const searchResults = await map.search.search({
        query: '北京市',
        limit: 5
      })
      
      expect(searchResults).toHaveLength(1)
      expect(searchResults[0].place_name).toBe('北京市')
      
      // 添加热力图
      const heatmapId = map.heatmap.addHeatmap({
        data: [
          { lng: 116.404, lat: 39.915, weight: 1 },
          { lng: 116.405, lat: 39.916, weight: 2 },
          { lng: 116.406, lat: 39.917, weight: 3 }
        ],
        style: {
          intensity: 1,
          radius: 20,
          gradient: {
            0: 'blue',
            0.5: 'green',
            1: 'red'
          }
        }
      })
      
      expect(heatmapId).toBeDefined()
      
      // 验证热力图可见性控制
      map.heatmap.setHeatmapVisibility(heatmapId, false)
      map.heatmap.setHeatmapVisibility(heatmapId, true)
    })
  })

  describe('测量工具集成', () => {
    beforeEach(async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()
    })

    it('应该能够进行距离和面积测量', async () => {
      // 开始距离测量
      map.measurement.startMeasurement('distance')
      
      // 模拟添加测量点
      map.measurement.addMeasurementPoint([116.404, 39.915])
      map.measurement.addMeasurementPoint([116.407, 39.918])
      
      // 完成测量
      const result = map.measurement.finishMeasurement()
      
      expect(result).toBeDefined()
      expect(result.type).toBe('distance')
      expect(result.value).toBeGreaterThan(0)
      
      // 开始面积测量
      map.measurement.startMeasurement('area')
      
      // 添加多个点形成多边形
      map.measurement.addMeasurementPoint([116.404, 39.915])
      map.measurement.addMeasurementPoint([116.407, 39.915])
      map.measurement.addMeasurementPoint([116.407, 39.918])
      map.measurement.addMeasurementPoint([116.404, 39.918])
      
      // 完成面积测量
      const areaResult = map.measurement.finishMeasurement()
      
      expect(areaResult).toBeDefined()
      expect(areaResult.type).toBe('area')
      expect(areaResult.value).toBeGreaterThan(0)
    })
  })

  describe('错误处理和恢复', () => {
    it('应该能够处理初始化失败', async () => {
      map = new LDesignMap(mapOptions)
      
      // Mock 初始化失败
      vi.spyOn(map as any, 'initializeEngine').mockRejectedValue(new Error('初始化失败'))
      
      await expect(map.initialize()).rejects.toThrow('初始化失败')
      expect(map.isInitialized()).toBe(false)
    })

    it('应该能够处理API调用失败', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()

      // Mock API 失败
      vi.mocked(fetch).mockRejectedValue(new Error('网络错误'))

      // 搜索应该抛出错误
      await expect(map.search.search({
        query: '测试',
        limit: 5
      })).rejects.toThrow('网络错误')

      // 路径规划应该抛出错误
      await expect(map.routing.addRoute({
        waypoints: [
          [116.404, 39.915],
          [116.407, 39.918]
        ],
        profile: 'driving'
      })).rejects.toThrow('网络错误')
    })
  })

  describe('性能和内存管理', () => {
    it('应该能够处理大量数据', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()

      // 添加大量标记点
      const markerIds: string[] = []
      for (let i = 0; i < 100; i++) {
        const markerId = map.addMarker({
          lngLat: [116.404 + i * 0.001, 39.915 + i * 0.001],
          popup: { content: `标记 ${i}` }
        })
        markerIds.push(markerId)
      }
      
      expect(markerIds).toHaveLength(100)
      
      // 清除所有标记点
      map.clearMarkers()
      
      // 验证清理完成
      const remainingMarkers = map.getAllMarkers()
      expect(remainingMarkers).toHaveLength(0)
    })

    it('应该能够正确管理模块生命周期', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)
      await map.initialize()

      // 验证所有模块都已初始化
      expect(map.routing.isInitialized()).toBe(true)
      expect(map.geofence.isInitialized()).toBe(true)
      expect(map.heatmap.isInitialized()).toBe(true)
      expect(map.search.isInitialized()).toBe(true)
      expect(map.measurement.isInitialized()).toBe(true)
      expect(map.layers.isInitialized()).toBe(true)

      // 销毁地图
      map.destroy()

      // 验证所有模块都已销毁
      expect(map.routing.isInitialized()).toBe(false)
      expect(map.geofence.isInitialized()).toBe(false)
      expect(map.heatmap.isInitialized()).toBe(false)
      expect(map.search.isInitialized()).toBe(false)
      expect(map.measurement.isInitialized()).toBe(false)
      expect(map.layers.isInitialized()).toBe(false)
    })
  })
})
