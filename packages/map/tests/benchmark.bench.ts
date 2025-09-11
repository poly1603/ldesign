/**
 * 性能基准测试
 * 使用 Vitest 的 benchmark 功能测试关键操作的性能
 */

import { bench, describe } from 'vitest'
import { LDesignMap } from '../src/core/LDesignMap'
import type { MapOptions } from '../src/types'

// Mock Mapbox GL JS for benchmarks
const mockMapboxMap = {
  on: () => {},
  off: () => {},
  remove: () => {},
  setCenter: () => {},
  getCenter: () => ({ lng: 116.404, lat: 39.915 }),
  setZoom: () => {},
  getZoom: () => 10,
  setBearing: () => {},
  getBearing: () => 0,
  setPitch: () => {},
  getPitch: () => 0,
  flyTo: () => {},
  getBounds: () => ({
    getWest: () => 116.0,
    getSouth: () => 39.5,
    getEast: () => 117.0,
    getNorth: () => 40.5
  }),
  fitBounds: () => {},
  addSource: () => {},
  removeSource: () => {},
  getSource: () => null,
  addLayer: () => {},
  removeLayer: () => {},
  getLayer: () => null,
  setPaintProperty: () => {},
  setLayoutProperty: () => {},
  setFilter: () => {},
  unproject: (point: any) => ({ lng: point[0], lat: point[1] }),
  project: (lngLat: any) => ({ x: lngLat[0], y: lngLat[1] }),
  resize: () => {},
  getContainer: () => document.createElement('div'),
  fire: () => {},
  addControl: () => {},
  setFeatureState: () => {},
  getFeatureState: () => ({})
}

const mockMarker = {
  setLngLat: function() { return this },
  addTo: function() { return this },
  remove: function() { return this },
  setPopup: function() { return this },
  getElement: () => document.createElement('div')
}

// 设置全局 mock
;(global as any).mapboxgl = {
  Map: function() { return mockMapboxMap },
  Marker: function() { return mockMarker },
  Popup: function() {
    return {
      setLngLat: function() { return this },
      setHTML: function() { return this },
      addTo: function() { return this },
      remove: function() { return this }
    }
  },
  LngLatBounds: function(sw: any, ne: any) {
    return {
      getWest: () => sw[0],
      getSouth: () => sw[1],
      getEast: () => ne[0],
      getNorth: () => ne[1]
    }
  },
  NavigationControl: function() {},
  ScaleControl: function() {},
  FullscreenControl: function() {},
  accessToken: 'test-token'
}

describe('地图插件性能基准测试', () => {
  let map: LDesignMap
  let container: HTMLElement

  // 设置测试环境
  const setupMap = async () => {
    container = document.createElement('div')
    container.id = 'benchmark-map'
    document.body.appendChild(container)

    const mapOptions: MapOptions = {
      container: '#benchmark-map',
      center: [116.404, 39.915],
      zoom: 10,
      accessToken: 'test-token'
    }

    map = new LDesignMap(mapOptions)
    
    // Mock 初始化以避免异步操作
    ;(map as any).initializeEngine = async () => {
      ;(map as any).engine = mockMapboxMap
      ;(map as any).initialized = true
    }
    
    await map.initialize()
    return map
  }

  const cleanupMap = () => {
    if (map && map.isInitialized()) {
      map.destroy()
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }

  describe('标记点操作基准测试', () => {
    bench('添加单个标记点', async () => {
      const testMap = await setupMap()
      
      testMap.addMarker({
        lngLat: [116.404, 39.915],
        popup: { content: '测试标记' }
      })
      
      cleanupMap()
    }, { iterations: 1000 })

    bench('批量添加100个标记点', async () => {
      const testMap = await setupMap()
      
      for (let i = 0; i < 100; i++) {
        testMap.addMarker({
          lngLat: [116.404 + i * 0.001, 39.915 + i * 0.001],
          popup: { content: `标记 ${i}` }
        })
      }
      
      cleanupMap()
    }, { iterations: 100 })

    bench('清除所有标记点', async () => {
      const testMap = await setupMap()
      
      // 先添加100个标记点
      for (let i = 0; i < 100; i++) {
        testMap.addMarker({
          lngLat: [116.404 + i * 0.001, 39.915 + i * 0.001]
        })
      }
      
      // 测试清除操作
      testMap.clearMarkers()
      
      cleanupMap()
    }, { iterations: 100 })
  })

  describe('地图视图操作基准测试', () => {
    bench('设置地图中心点', async () => {
      const testMap = await setupMap()
      
      testMap.setCenter([121.473, 31.230])
      
      cleanupMap()
    }, { iterations: 1000 })

    bench('设置地图缩放级别', async () => {
      const testMap = await setupMap()
      
      testMap.setZoom(12)
      
      cleanupMap()
    }, { iterations: 1000 })

    bench('地图飞行动画', async () => {
      const testMap = await setupMap()
      
      testMap.flyTo({
        center: [113.264, 23.129],
        zoom: 11,
        duration: 0 // 无动画以测试性能
      })
      
      cleanupMap()
    }, { iterations: 500 })
  })

  describe('功能模块基准测试', () => {
    bench('添加热力图数据', async () => {
      const testMap = await setupMap()
      
      const heatmapData = []
      for (let i = 0; i < 100; i++) {
        heatmapData.push({
          lng: 116.404 + (Math.random() - 0.5) * 0.01,
          lat: 39.915 + (Math.random() - 0.5) * 0.01,
          weight: Math.random()
        })
      }

      testMap.heatmap.addHeatmap({
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
      
      cleanupMap()
    }, { iterations: 100 })

    bench('地理围栏检测', async () => {
      const testMap = await setupMap()
      
      // 创建地理围栏
      testMap.geofence.addGeofence({
        name: '基准测试围栏',
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

      // 测试点位检测
      const testPoint = [116.405, 39.916] as [number, number]
      testMap.geofence.checkGeofenceEvents(testPoint, testPoint)
      
      cleanupMap()
    }, { iterations: 1000 })

    bench('距离测量计算', async () => {
      const testMap = await setupMap()
      
      testMap.measurement.startMeasurement('distance')
      testMap.measurement.addMeasurementPoint([116.404, 39.915])
      testMap.measurement.addMeasurementPoint([116.407, 39.918])
      testMap.measurement.finishMeasurement()
      
      cleanupMap()
    }, { iterations: 500 })
  })

  describe('数据处理基准测试', () => {
    bench('GeoJSON 数据解析', async () => {
      const testMap = await setupMap()
      
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: Array.from({ length: 100 }, (_, i) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [116.404 + i * 0.001, 39.915 + i * 0.001]
          },
          properties: {
            id: i,
            name: `点位 ${i}`
          }
        }))
      }

      // 模拟数据处理
      testMap.layers.addLayer({
        id: 'benchmark-layer',
        type: 'circle',
        source: {
          type: 'geojson',
          data: geojsonData
        },
        paint: {
          'circle-radius': 6,
          'circle-color': '#722ED1'
        }
      })
      
      cleanupMap()
    }, { iterations: 100 })

    bench('坐标转换计算', async () => {
      const testMap = await setupMap()
      
      // 执行多次坐标转换
      for (let i = 0; i < 100; i++) {
        const lngLat = [116.404 + i * 0.001, 39.915 + i * 0.001] as [number, number]
        const point = testMap.project(lngLat)
        testMap.unproject(point)
      }
      
      cleanupMap()
    }, { iterations: 100 })
  })
})
