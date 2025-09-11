/**
 * 热力图模块
 * 提供热力图数据可视化功能
 */

import type {
  IHeatmapModule,
  IMapEngine,
  HeatmapOptions
} from '../../types'

/**
 * 热力图模块实现
 */
export class HeatmapModule implements IHeatmapModule {
  readonly name = 'heatmap'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private heatmaps = new Map<string, HeatmapOptions>()
  private heatmapLayers = new Map<string, { sourceId: string; layerId: string; pointLayerId?: string }>()
  private animationFrameId: number | null = null
  private isAnimating = false

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine): Promise<void> {
    this.mapEngine = mapEngine
    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    if (this.mapEngine && this.initialized) {
      // 停止动画
      this.stopAnimation()

      // 移除所有热力图
      this.heatmaps.forEach((_, id) => {
        this.removeHeatmap(id)
      })
    }

    this.heatmaps.clear()
    this.heatmapLayers.clear()
    this.mapEngine = null
    this.initialized = false
  }

  /**
   * 是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 添加热力图
   */
  addHeatmap(heatmap: HeatmapOptions): void {
    if (!this.initialized || !this.mapEngine) {
      throw new Error('Heatmap module not initialized')
    }

    const id = heatmap.id || this.generateId('heatmap')
    const finalHeatmap: HeatmapOptions = {
      id,
      radius: 20,
      blur: 15,
      opacity: 0.6,
      visible: true,
      gradient: {
        0.0: 'rgba(0, 0, 255, 0)',
        0.1: 'royalblue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red'
      },
      ...heatmap
    }

    // 创建GeoJSON数据
    const features = finalHeatmap.data.map(point => ({
      type: 'Feature' as const,
      properties: {
        weight: point.weight || point.value || 1
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [point.lng, point.lat]
      }
    }))

    const sourceId = `heatmap-source-${id}`
    const layerId = `heatmap-layer-${id}`

    // 添加数据源
    this.mapEngine.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })

    // 添加热力图图层
    this.mapEngine.addLayer({
      id: layerId,
      type: 'heatmap',
      source: sourceId,
      paint: {
        // 热力图权重
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'weight'],
          0, 0,
          6, 1
        ],
        // 热力图强度
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3
        ],
        // 热力图颜色渐变
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          ...this.gradientToExpression(finalHeatmap.gradient!)
        ],
        // 热力图半径
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, finalHeatmap.radius! / 4,
          9, finalHeatmap.radius!
        ],
        // 热力图透明度
        'heatmap-opacity': finalHeatmap.opacity!
      }
    })

    // 添加点图层（高缩放级别时显示）
    this.mapEngine.addLayer({
      id: `${layerId}-point`,
      type: 'circle',
      source: sourceId,
      minzoom: 14,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, ['interpolate', ['linear'], ['get', 'weight'], 1, 1, 6, 4],
          16, ['interpolate', ['linear'], ['get', 'weight'], 1, 5, 6, 50]
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'weight'],
          1, 'rgba(33,102,172,0)',
          2, 'rgb(103,169,207)',
          3, 'rgb(209,229,240)',
          4, 'rgb(253,219,199)',
          5, 'rgb(239,138,98)',
          6, 'rgb(178,24,43)'
        ],
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 0,
          8, 1
        ]
      }
    })

    // 设置可见性
    if (!finalHeatmap.visible) {
      this.setHeatmapVisibility(id, false)
    }

    this.heatmaps.set(id, finalHeatmap)
  }

  /**
   * 移除热力图
   */
  removeHeatmap(id: string): void {
    if (!this.mapEngine) return

    const sourceId = `heatmap-source-${id}`
    const layerId = `heatmap-layer-${id}`

    // 移除图层
    this.mapEngine.removeLayer(`${layerId}-point`)
    this.mapEngine.removeLayer(layerId)

    // 移除数据源
    this.mapEngine.removeSource(sourceId)

    this.heatmaps.delete(id)
  }

  /**
   * 更新热力图数据
   */
  updateHeatmapData(id: string, data: HeatmapOptions['data']): void {
    const heatmap = this.heatmaps.get(id)
    if (!heatmap || !this.mapEngine) return

    // 更新数据
    heatmap.data = data

    // 重新创建GeoJSON数据
    const features = data.map(point => ({
      type: 'Feature' as const,
      properties: {
        weight: point.weight || point.value || 1
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [point.lng, point.lat]
      }
    }))

    const sourceId = `heatmap-source-${id}`

    // 更新数据源
    this.mapEngine.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })
  }

  /**
   * 设置热力图可见性
   */
  setHeatmapVisibility(id: string, visible: boolean): void {
    if (!this.mapEngine) return

    const layerId = `heatmap-layer-${id}`

    this.mapEngine.toggleLayer(layerId, visible)
    this.mapEngine.toggleLayer(`${layerId}-point`, visible)

    const heatmap = this.heatmaps.get(id)
    if (heatmap) {
      heatmap.visible = visible
    }
  }

  /**
   * 获取热力图
   */
  getHeatmap(id: string): HeatmapOptions | undefined {
    return this.heatmaps.get(id)
  }

  /**
   * 获取所有热力图
   */
  getAllHeatmaps(): HeatmapOptions[] {
    return Array.from(this.heatmaps.values())
  }

  /**
   * 更新热力图样式
   */
  updateHeatmapStyle(id: string, style: Partial<HeatmapOptions['style']>): void {
    const heatmap = this.heatmaps.get(id)
    if (!heatmap || !this.mapEngine) return

    // 更新样式配置
    heatmap.style = { ...heatmap.style, ...style }

    const layerId = `heatmap-layer-${id}`

    // 更新热力图图层样式
    if (style.intensity !== undefined) {
      this.mapEngine.updateLayerStyle(layerId, {
        'heatmap-intensity': style.intensity
      })
    }

    if (style.radius !== undefined) {
      this.mapEngine.updateLayerStyle(layerId, {
        'heatmap-radius': style.radius
      })
    }

    if (style.weight !== undefined) {
      this.mapEngine.updateLayerStyle(layerId, {
        'heatmap-weight': style.weight
      })
    }

    if (style.opacity !== undefined) {
      this.mapEngine.updateLayerStyle(layerId, {
        'heatmap-opacity': style.opacity
      })
    }

    if (style.gradient) {
      this.mapEngine.updateLayerStyle(layerId, {
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          ...this.gradientToExpression(style.gradient)
        ]
      })
    }
  }

  /**
   * 开始热力图动画
   */
  startAnimation(id: string, options: {
    duration?: number
    property?: 'intensity' | 'radius' | 'opacity'
    from?: number
    to?: number
    loop?: boolean
  } = {}): void {
    if (this.isAnimating) {
      this.stopAnimation()
    }

    const {
      duration = 2000,
      property = 'intensity',
      from = 0.5,
      to = 2.0,
      loop = true
    } = options

    this.isAnimating = true
    const startTime = Date.now()

    const animate = () => {
      if (!this.isAnimating) return

      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      const easedProgress = easeInOut(progress)

      // 计算当前值
      const currentValue = from + (to - from) * easedProgress

      // 更新样式
      this.updateHeatmapStyle(id, { [property]: currentValue })

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate)
      } else if (loop) {
        // 重新开始动画
        this.startAnimation(id, { ...options, from: to, to: from })
      } else {
        this.isAnimating = false
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  /**
   * 停止热力图动画
   */
  stopAnimation(): void {
    this.isAnimating = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * 创建聚类热力图
   */
  createClusteredHeatmap(id: string, options: HeatmapOptions & {
    clusterRadius?: number
    clusterMaxZoom?: number
  }): string {
    const {
      clusterRadius = 50,
      clusterMaxZoom = 14,
      ...heatmapOptions
    } = options

    // 创建聚类数据源
    const sourceId = `heatmap-source-${id}`

    if (!this.mapEngine) {
      throw new Error('Heatmap module not initialized')
    }

    this.mapEngine.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: heatmapOptions.data.map(point => ({
          type: 'Feature',
          properties: {
            weight: point.weight || point.value || 1
          },
          geometry: {
            type: 'Point',
            coordinates: [point.lng, point.lat]
          }
        }))
      },
      cluster: true,
      clusterMaxZoom: clusterMaxZoom,
      clusterRadius: clusterRadius
    })

    // 添加聚类热力图图层
    const layerId = `heatmap-layer-${id}`
    this.mapEngine.addLayer({
      id: layerId,
      type: 'heatmap',
      source: sourceId,
      maxzoom: 15,
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'point_count'],
          1, 1,
          100, 2
        ],
        'heatmap-intensity': heatmapOptions.style?.intensity || 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          ...this.gradientToExpression(heatmapOptions.style?.gradient || {
            0: 'rgba(33,102,172,0)',
            0.2: 'rgb(103,169,207)',
            0.4: 'rgb(209,229,240)',
            0.6: 'rgb(253,219,199)',
            0.8: 'rgb(239,138,98)',
            1: 'rgb(178,24,43)'
          })
        ],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 2,
          9, 20
        ],
        'heatmap-opacity': heatmapOptions.style?.opacity || 0.8
      }
    })

    // 保存热力图配置
    this.heatmaps.set(id, { ...heatmapOptions, id })
    this.heatmapLayers.set(id, { sourceId, layerId })

    return id
  }

  /**
   * 获取热力图统计信息
   */
  getHeatmapStats(): {
    total: number
    visible: number
    totalDataPoints: number
    animating: number
  } {
    const heatmaps = Array.from(this.heatmaps.values())

    return {
      total: heatmaps.length,
      visible: heatmaps.filter(h => h.visible !== false).length,
      totalDataPoints: heatmaps.reduce((sum, h) => sum + h.data.length, 0),
      animating: this.isAnimating ? 1 : 0
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 将渐变对象转换为Mapbox表达式
   */
  private gradientToExpression(gradient: Record<number, string>): any[] {
    const expression: any[] = []

    Object.entries(gradient)
      .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
      .forEach(([stop, color]) => {
        expression.push(parseFloat(stop), color)
      })

    return expression
  }
}
