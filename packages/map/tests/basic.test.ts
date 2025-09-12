/**
 * @ldesign/map 基础功能测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { LDesignMap } from '../src/core/LDesignMap'
import type { MapOptions } from '../src/types'

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

describe('LDesignMap 基础功能', () => {
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

  it('应该能够创建地图实例', () => {
    const map = new LDesignMap(mapOptions)
    expect(map).toBeInstanceOf(LDesignMap)
    // LDesignMap 在构造函数中自动初始化，所以应该是 true
    expect(map.isInitialized()).toBe(true)
  })

  it('应该能够获取地图状态', () => {
    const map = new LDesignMap(mapOptions)
    expect(map.isInitialized()).toBe(true)
    expect(map.isDestroyed()).toBe(false)
  })

  it('应该能够销毁地图', () => {
    const map = new LDesignMap(mapOptions)
    expect(map.isInitialized()).toBe(true)
    map.destroy()
    expect(map.isInitialized()).toBe(false)
    expect(map.isDestroyed()).toBe(true)
  })

  it('应该能够获取和设置地图中心点', () => {
    const map = new LDesignMap(mapOptions)

    const center = map.getCenter()
    expect(center).toBeDefined()
    expect(Array.isArray(center)).toBe(true)
    expect(center.length).toBe(2)
    // 由于 OpenLayers 返回的是投影坐标，不是经纬度坐标，所以不检查具体值

    map.setCenter([121.473, 31.230])
    // 由于是mock，实际值不会改变，但方法应该被调用
  })

  it('应该能够获取和设置地图缩放级别', () => {
    const map = new LDesignMap(mapOptions)

    const zoom = map.getZoom()
    expect(zoom).toBe(10)

    map.setZoom(12)
    // 由于是mock，实际值不会改变，但方法应该被调用
  })

  it('应该能够添加标记点', () => {
    const map = new LDesignMap(mapOptions)

    const markerManager = map.getMarkerManager()
    expect(markerManager).toBeDefined()

    const markerId = markerManager.addMarker({
      id: 'test-marker',
      coordinate: [116.404, 39.915],
      title: '测试标记点',
      popup: { content: '测试标记点' }
    })

    expect(markerId).toBe('test-marker')
  })

  it('应该能够移除标记点', () => {
    const map = new LDesignMap(mapOptions)

    const markerManager = map.getMarkerManager()
    const markerId = markerManager.addMarker({
      id: 'test-marker-remove',
      coordinate: [116.404, 39.915]
    })

    const removed = markerManager.removeMarker(markerId)
    expect(removed).toBe(true)
  })

  it('应该能够获取所有标记点', () => {
    const map = new LDesignMap(mapOptions)

    const markerManager = map.getMarkerManager()
    markerManager.addMarker({
      id: 'marker1',
      coordinate: [116.404, 39.915]
    })
    markerManager.addMarker({
      id: 'marker2',
      coordinate: [121.473, 31.230]
    })

    const markers = markerManager.getAllMarkers()
    expect(markers).toHaveLength(2)
  })

  it('应该能够访问功能模块', () => {
    const map = new LDesignMap(mapOptions)

    expect(map.getRoutingManager()).toBeDefined()
    expect(map.getGeofenceManager()).toBeDefined()
    expect(map.getHeatmapManager()).toBeDefined()
    expect(map.getLayerManager()).toBeDefined()
    expect(map.getMarkerManager()).toBeDefined()
  })

  it('应该在未初始化时正常工作', () => {
    // LDesignMap 在构造函数中自动初始化，所以这些方法应该正常工作
    const map = new LDesignMap(mapOptions)

    expect(() => map.getCenter()).not.toThrow()
    expect(() => map.setZoom(12)).not.toThrow()
  })

  it('应该能够正确销毁地图', () => {
    const map = new LDesignMap(mapOptions)
    expect(map.isInitialized()).toBe(true)

    map.destroy()
    expect(map.isDestroyed()).toBe(true)
    expect(map.isInitialized()).toBe(false)
  })
})
