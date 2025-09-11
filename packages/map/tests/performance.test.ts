/**
 * 性能测试
 * 测试地图插件在大数据量和复杂场景下的性能表现
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LDesignMap } from '../src/core/LDesignMap'
import type { MapOptions, MarkerOptions } from '../src/types'

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

describe('地图插件性能测试', () => {
  let map: LDesignMap
  let container: HTMLElement
  let mapOptions: MapOptions

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'performance-test-map'
    document.body.appendChild(container)

    // 基础配置
    mapOptions = {
      container: '#performance-test-map',
      center: [116.404, 39.915],
      zoom: 10,
      accessToken: 'test-token'
    }
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

  describe('大量标记点性能测试', () => {
    it('应该能够快速添加1000个标记点', async () => {
      map = new LDesignMap(mapOptions)

      // Mock 快速初始化
      vi.spyOn(map['engine'], 'initialize').mockResolvedValue(undefined)
      vi.spyOn(map as any, 'loadModules').mockResolvedValue(undefined)
      await map.initialize()

      const startTime = performance.now()

      // 添加1000个标记点
      const markerIds: string[] = []
      for (let i = 0; i < 1000; i++) {
        const markerId = map.addMarker({
          lngLat: [
            116.404 + (Math.random() - 0.5) * 0.1,
            39.915 + (Math.random() - 0.5) * 0.1
          ],
          popup: { content: `标记点 ${i}` }
        })
        markerIds.push(markerId)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`添加1000个标记点耗时: ${duration.toFixed(2)}ms`)

      // 验证性能要求：应该在500ms内完成
      expect(duration).toBeLessThan(500)
      expect(markerIds).toHaveLength(1000)
    })

    it('应该能够快速清除大量标记点', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map['engine'], 'initialize').mockResolvedValue(undefined)
      vi.spyOn(map as any, 'loadModules').mockResolvedValue(undefined)
      await map.initialize()

      // 先添加1000个标记点
      for (let i = 0; i < 1000; i++) {
        map.addMarker({
          lngLat: [
            116.404 + (Math.random() - 0.5) * 0.1,
            39.915 + (Math.random() - 0.5) * 0.1
          ]
        })
      }

      const startTime = performance.now()

      // 清除所有标记点
      map.clearMarkers()

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`清除1000个标记点耗时: ${duration.toFixed(2)}ms`)

      // 验证性能要求：应该在100ms内完成
      expect(duration).toBeLessThan(100)
      expect(map.getAllMarkers()).toHaveLength(0)
    })
  })

  describe('地图操作性能测试', () => {
    it('应该能够快速执行地图视图变换', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map['engine'], 'initialize').mockResolvedValue(undefined)
      vi.spyOn(map as any, 'loadModules').mockResolvedValue(undefined)
      await map.initialize()

      const operations = [
        () => map.setCenter([121.473, 31.230]),
        () => map.setZoom(12),
        () => map.setBearing(45),
        () => map.setPitch(30),
        () => map.flyTo({
          center: [113.264, 23.129],
          zoom: 11,
          duration: 0 // 无动画以测试性能
        })
      ]

      const startTime = performance.now()

      // 执行100次操作
      for (let i = 0; i < 100; i++) {
        const operation = operations[i % operations.length]
        operation()
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`执行100次地图操作耗时: ${duration.toFixed(2)}ms`)

      // 验证性能要求：应该在50ms内完成
      expect(duration).toBeLessThan(50)
    })
  })

  describe('功能模块性能测试', () => {
    it('应该能够快速处理大量热力图数据', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map['engine'], 'initialize').mockResolvedValue(undefined)
      vi.spyOn(map as any, 'loadModules').mockResolvedValue(undefined)
      await map.initialize()

      // 生成大量热力图数据
      const heatmapData = []
      for (let i = 0; i < 5000; i++) {
        heatmapData.push({
          lng: 116.404 + (Math.random() - 0.5) * 0.1,
          lat: 39.915 + (Math.random() - 0.5) * 0.1,
          weight: Math.random()
        })
      }

      const startTime = performance.now()

      // 添加热力图
      const heatmapId = map.heatmap.addHeatmap({
        data: heatmapData,
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

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`处理5000个热力图数据点耗时: ${duration.toFixed(2)}ms`)

      // 验证性能要求：应该在200ms内完成
      expect(duration).toBeLessThan(200)
      expect(heatmapId).toBeDefined()
    })

    it('应该能够快速处理地理围栏检测', async () => {
      map = new LDesignMap(mapOptions)
      vi.spyOn(map['engine'], 'initialize').mockResolvedValue(undefined)
      vi.spyOn(map as any, 'loadModules').mockResolvedValue(undefined)
      await map.initialize()

      // 创建地理围栏
      const geofenceId = map.geofence.addGeofence({
        name: '性能测试围栏',
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
      })

      const startTime = performance.now()

      // 执行1000次围栏检测
      for (let i = 0; i < 1000; i++) {
        const testPoint = [
          116.404 + (Math.random() - 0.5) * 0.01,
          39.915 + (Math.random() - 0.5) * 0.01
        ] as [number, number]

        map.geofence.checkGeofenceEvents(testPoint, testPoint)
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      console.log(`执行1000次围栏检测耗时: ${duration.toFixed(2)}ms`)

      // 验证性能要求：应该在100ms内完成
      expect(duration).toBeLessThan(100)
      expect(geofenceId).toBeDefined()
    })
  })

  describe('内存使用测试', () => {
    it('应该正确管理内存，避免内存泄漏', async () => {
      // 记录初始内存使用
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0

      // 创建和销毁多个地图实例
      for (let i = 0; i < 10; i++) {
        const testMap = new LDesignMap({
          container: container,
          center: [116.404, 39.915],
          zoom: 10,
          accessToken: 'test-token'
        })

        vi.spyOn(testMap['engine'], 'initialize').mockResolvedValue(undefined)
        vi.spyOn(testMap as any, 'loadModules').mockResolvedValue(undefined)
        await testMap.initialize()

        // 添加一些数据
        for (let j = 0; j < 100; j++) {
          testMap.addMarker({
            lngLat: [116.404 + j * 0.001, 39.915 + j * 0.001]
          })
        }

        // 销毁地图
        testMap.destroy()
      }

      // 强制垃圾回收（如果可用）
      if (global.gc) {
        global.gc()
      }

      // 检查内存使用
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
      const memoryIncrease = finalMemory - initialMemory

      console.log(`内存增长: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)

      // 验证内存增长不超过10MB（考虑到测试环境的开销）
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })
})
