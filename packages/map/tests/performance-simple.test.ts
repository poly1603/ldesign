/**
 * 简化的性能测试
 * 专注于核心算法和数据处理的性能测试
 */

import { describe, it, expect } from 'vitest'
import { distance } from '@turf/turf'

describe('地图插件性能优化测试', () => {
  describe('算法性能测试', () => {
    it('应该能够快速计算大量点之间的距离', () => {
      const points = []
      
      // 生成1000个随机点
      for (let i = 0; i < 1000; i++) {
        points.push([
          116.404 + (Math.random() - 0.5) * 0.1,
          39.915 + (Math.random() - 0.5) * 0.1
        ])
      }

      const startTime = performance.now()
      
      // 计算所有点到中心点的距离
      const centerPoint = [116.404, 39.915]
      const distances = points.map(point => 
        distance(centerPoint, point, { units: 'meters' })
      )
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`计算1000个点的距离耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在50ms内完成
      expect(duration).toBeLessThan(50)
      expect(distances).toHaveLength(1000)
      expect(distances.every(d => d >= 0)).toBe(true)
    })

    it('应该能够快速处理GeoJSON数据', () => {
      // 生成大量GeoJSON数据
      const features = []
      for (let i = 0; i < 5000; i++) {
        features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              116.404 + (Math.random() - 0.5) * 0.1,
              39.915 + (Math.random() - 0.5) * 0.1
            ]
          },
          properties: {
            id: i,
            name: `点位 ${i}`,
            value: Math.random() * 100
          }
        })
      }

      const geojson = {
        type: 'FeatureCollection',
        features
      }

      const startTime = performance.now()
      
      // 模拟数据处理：过滤、排序、聚合
      const filteredFeatures = geojson.features.filter(
        feature => feature.properties.value > 50
      )
      
      const sortedFeatures = filteredFeatures.sort(
        (a, b) => b.properties.value - a.properties.value
      )
      
      const aggregatedData = sortedFeatures.reduce((acc, feature) => {
        acc.totalValue += feature.properties.value
        acc.count += 1
        return acc
      }, { totalValue: 0, count: 0 })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`处理5000个GeoJSON特征耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在100ms内完成
      expect(duration).toBeLessThan(100)
      expect(aggregatedData.count).toBeGreaterThan(0)
      expect(aggregatedData.totalValue).toBeGreaterThan(0)
    })

    it('应该能够快速进行点在多边形内的检测', () => {
      // 定义一个复杂多边形
      const polygon = [
        [116.404, 39.915],
        [116.407, 39.915],
        [116.408, 39.917],
        [116.407, 39.919],
        [116.405, 39.920],
        [116.403, 39.918],
        [116.402, 39.916],
        [116.404, 39.915]
      ]

      // 生成大量测试点
      const testPoints = []
      for (let i = 0; i < 10000; i++) {
        testPoints.push([
          116.404 + (Math.random() - 0.5) * 0.02,
          39.915 + (Math.random() - 0.5) * 0.02
        ])
      }

      const startTime = performance.now()
      
      // 使用射线算法检测点是否在多边形内
      const pointsInPolygon = testPoints.filter(point => {
        return isPointInPolygon(point, polygon)
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`检测10000个点是否在多边形内耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在200ms内完成
      expect(duration).toBeLessThan(200)
      expect(pointsInPolygon.length).toBeGreaterThan(0)
    })

    it('应该能够快速进行坐标转换计算', () => {
      const coordinates = []
      
      // 生成大量坐标点
      for (let i = 0; i < 50000; i++) {
        coordinates.push([
          116.404 + (Math.random() - 0.5) * 1,
          39.915 + (Math.random() - 0.5) * 1
        ])
      }

      const startTime = performance.now()
      
      // 模拟坐标转换（经纬度到墨卡托投影）
      const projectedCoordinates = coordinates.map(([lng, lat]) => {
        const x = lng * 20037508.34 / 180
        const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180)
        return [x, y * 20037508.34 / 180]
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`转换50000个坐标点耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在100ms内完成
      expect(duration).toBeLessThan(100)
      expect(projectedCoordinates).toHaveLength(50000)
    })
  })

  describe('数据结构性能测试', () => {
    it('应该能够快速进行数组操作', () => {
      const largeArray = Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        value: Math.random() * 1000,
        category: `category-${i % 10}`
      }))

      const startTime = performance.now()
      
      // 执行各种数组操作
      const filtered = largeArray.filter(item => item.value > 500)
      const mapped = filtered.map(item => ({ ...item, doubled: item.value * 2 }))
      const grouped = mapped.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      }, {} as Record<string, any[]>)
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`处理100000个数组元素耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在200ms内完成
      expect(duration).toBeLessThan(200)
      expect(Object.keys(grouped).length).toBeGreaterThan(0)
    })

    it('应该能够快速进行Map和Set操作', () => {
      const dataMap = new Map()
      const dataSet = new Set()

      const startTime = performance.now()
      
      // 大量插入操作
      for (let i = 0; i < 100000; i++) {
        dataMap.set(`key-${i}`, { id: i, value: Math.random() })
        dataSet.add(`item-${i}`)
      }
      
      // 大量查询操作
      let foundCount = 0
      for (let i = 0; i < 10000; i++) {
        const key = `key-${Math.floor(Math.random() * 100000)}`
        if (dataMap.has(key)) {
          foundCount++
        }
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`Map/Set操作耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在100ms内完成
      expect(duration).toBeLessThan(100)
      expect(dataMap.size).toBe(100000)
      expect(dataSet.size).toBe(100000)
      expect(foundCount).toBeGreaterThan(0)
    })
  })

  describe('内存使用优化测试', () => {
    it('应该能够有效管理大量对象的内存', () => {
      const objects = []
      
      // 创建大量对象
      for (let i = 0; i < 50000; i++) {
        objects.push({
          id: i,
          coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90],
          properties: {
            name: `Object ${i}`,
            value: Math.random() * 1000,
            timestamp: Date.now()
          }
        })
      }

      // 模拟对象池管理
      const objectPool = {
        pool: [] as any[],
        get() {
          return this.pool.pop() || {}
        },
        release(obj: any) {
          // 清理对象属性
          Object.keys(obj).forEach(key => delete obj[key])
          this.pool.push(obj)
        }
      }

      const startTime = performance.now()
      
      // 使用对象池进行对象复用
      const reusedObjects = []
      for (let i = 0; i < 10000; i++) {
        const obj = objectPool.get()
        obj.id = i
        obj.value = Math.random()
        reusedObjects.push(obj)
      }
      
      // 释放对象回池
      reusedObjects.forEach(obj => objectPool.release(obj))
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      console.log(`对象池操作耗时: ${duration.toFixed(2)}ms`)
      
      // 验证性能要求：应该在50ms内完成
      expect(duration).toBeLessThan(50)
      expect(objectPool.pool.length).toBeGreaterThan(0)
    })
  })
})

/**
 * 射线算法检测点是否在多边形内
 */
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }

  return inside
}
