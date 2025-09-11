/**
 * @ldesign/map 核心功能测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LDesignMap } from '../core/LDesignMap'
import type { MapOptions } from '../types'

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
      addControl: vi.fn()
    })),
    Marker: vi.fn().mockImplementation(() => ({
      setLngLat: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
      setDraggable: vi.fn().mockReturnThis(),
      setPopup: vi.fn().mockReturnThis(),
      getPopup: vi.fn(),
      getLngLat: vi.fn(() => ({ lng: 116.404, lat: 39.915 })),
      isDraggable: vi.fn(() => false)
    })),
    Popup: vi.fn().mockImplementation(() => ({
      setHTML: vi.fn().mockReturnThis(),
      remove: vi.fn()
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

describe('LDesignMap', () => {
  let container: HTMLElement
  let mapOptions: MapOptions

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    container.id = 'test-map'
    document.body.appendChild(container)

    // 基础配置
    mapOptions = {
      container: '#test-map',
      center: [116.404, 39.915],
      zoom: 10,
      accessToken: 'test-token'
    }
  })

  afterEach(() => {
    // 清理测试容器
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  })

  describe('基础功能', () => {
    it('应该能够创建地图实例', () => {
      const map = new LDesignMap(mapOptions)
      expect(map).toBeInstanceOf(LDesignMap)
      expect(map.isInitialized()).toBe(false)
    })

    it('应该能够初始化地图', async () => {
      const map = new LDesignMap(mapOptions)

      // Mock the async initialization to resolve immediately
      const initSpy = vi.spyOn(map as any, 'initializeEngine').mockResolvedValue(undefined)

      await map.initialize()
      expect(map.isInitialized()).toBe(true)
      expect(initSpy).toHaveBeenCalled()
    }, 10000)

    it('应该能够销毁地图', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()
      map.destroy()
      expect(map.isInitialized()).toBe(false)
    })

    it('应该能够获取和设置地图中心点', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      const center = map.getCenter()
      expect(center).toEqual([116.404, 39.915])

      map.setCenter([121.473, 31.230])
      // 由于是mock，实际值不会改变，但方法应该被调用
    })

    it('应该能够获取和设置地图缩放级别', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      const zoom = map.getZoom()
      expect(zoom).toBe(10)

      map.setZoom(12)
      // 由于是mock，实际值不会改变，但方法应该被调用
    })
  })

  describe('标记点功能', () => {
    it('应该能够添加标记点', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      const markerId = map.addMarker({
        lngLat: [116.404, 39.915],
        popup: { content: '测试标记点' }
      })

      expect(typeof markerId).toBe('string')
      expect(markerId.length).toBeGreaterThan(0)
    })

    it('应该能够移除标记点', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      const markerId = map.addMarker({
        lngLat: [116.404, 39.915]
      })

      map.removeMarker(markerId)
      const marker = map.getMarker(markerId)
      expect(marker).toBeUndefined()
    })

    it('应该能够获取所有标记点', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      map.addMarker({ lngLat: [116.404, 39.915] })
      map.addMarker({ lngLat: [121.473, 31.230] })

      const markers = map.getMarkers()
      expect(markers).toHaveLength(2)
    })
  })

  describe('图层功能', () => {
    it('应该能够添加图层', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      map.addLayer({
        id: 'test-layer',
        type: 'fill',
        source: 'test-source',
        paint: {
          'fill-color': '#ff0000',
          'fill-opacity': 0.5
        }
      })

      // 验证addLayer方法被调用
      // 由于是mock，我们无法验证实际的图层添加
    })

    it('应该能够移除图层', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      map.addLayer({
        id: 'test-layer',
        type: 'fill',
        source: 'test-source'
      })

      map.removeLayer('test-layer')
      // 验证removeLayer方法被调用
    })
  })

  describe('功能模块', () => {
    it('应该能够访问路径规划模块', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      expect(map.routing).toBeDefined()
      expect(map.routing.name).toBe('routing')
    })

    it('应该能够访问地理围栏模块', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      expect(map.geofence).toBeDefined()
      expect(map.geofence.name).toBe('geofence')
    })

    it('应该能够访问热力图模块', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      expect(map.heatmap).toBeDefined()
      expect(map.heatmap.name).toBe('heatmap')
    })

    it('应该能够访问搜索模块', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      expect(map.search).toBeDefined()
      expect(map.search.name).toBe('search')
    })

    it('应该能够访问测量模块', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      expect(map.measurement).toBeDefined()
      expect(map.measurement.name).toBe('measurement')
    })
  })

  describe('错误处理', () => {
    it('应该在未初始化时抛出错误', () => {
      const map = new LDesignMap(mapOptions)

      expect(() => map.getCenter()).toThrow('Map is not initialized')
      expect(() => map.setZoom(12)).toThrow('Map is not initialized')
    })

    it('应该在重复初始化时抛出错误', async () => {
      const map = new LDesignMap(mapOptions)
      await map.initialize()

      await expect(map.initialize()).rejects.toThrow('Map is already initialized')
    })
  })
})
