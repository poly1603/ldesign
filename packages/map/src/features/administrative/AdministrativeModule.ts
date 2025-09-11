/**
 * 行政区划模块
 * 提供省市区县边界显示、行政区域高亮等功能
 */

import type {
  IFeatureModule,
  IMapEngine,
  LngLat
} from '../../types'

/**
 * 行政区划级别
 */
export type AdministrativeLevel = 'country' | 'province' | 'city' | 'district' | 'county'

/**
 * 行政区划配置选项
 */
export interface AdministrativeOptions {
  /** 行政区划ID */
  id?: string
  /** 行政区划名称 */
  name: string
  /** 行政区划代码 */
  code?: string
  /** 行政区划级别 */
  level: AdministrativeLevel
  /** 边界数据 */
  boundaries?: GeoJSON.Feature | GeoJSON.FeatureCollection
  /** 样式配置 */
  style?: {
    fillColor?: string
    fillOpacity?: number
    strokeColor?: string
    strokeWidth?: number
    strokeOpacity?: number
  }
  /** 标签配置 */
  label?: {
    show?: boolean
    text?: string
    fontSize?: number
    color?: string
    position?: 'center' | 'top' | 'bottom' | 'left' | 'right'
  }
  /** 是否可见 */
  visible?: boolean
  /** 是否高亮 */
  highlighted?: boolean
  /** 自定义数据 */
  data?: Record<string, any>
}

/**
 * 行政区划事件
 */
export interface AdministrativeEvent {
  type: 'click' | 'hover' | 'select' | 'deselect'
  administrative: AdministrativeOptions
  lngLat: LngLat
  timestamp: number
}

/**
 * 行政区划模块实现
 * 
 * @example
 * ```typescript
 * const adminModule = new AdministrativeModule()
 * await adminModule.initialize(mapEngine)
 * 
 * // 添加省级边界
 * adminModule.addAdministrative({
 *   name: '北京市',
 *   code: '110000',
 *   level: 'province',
 *   style: {
 *     fillColor: 'var(--ldesign-brand-color)',
 *     fillOpacity: 0.3,
 *     strokeColor: 'var(--ldesign-brand-color)',
 *     strokeWidth: 2
 *   }
 * })
 * 
 * // 监听点击事件
 * adminModule.onAdministrativeEvent((event) => {
 *   if (event.type === 'click') {
 *     console.log('点击了行政区:', event.administrative.name)
 *   }
 * })
 * ```
 */
export class AdministrativeModule implements IFeatureModule {
  readonly name = 'administrative'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private administratives = new Map<string, AdministrativeOptions>()
  private eventCallbacks: Array<(event: AdministrativeEvent) => void> = []
  private sourceId = 'ldesign-administrative-source'
  private layerId = 'ldesign-administrative-layer'
  private strokeLayerId = 'ldesign-administrative-stroke-layer'
  private labelLayerId = 'ldesign-administrative-label-layer'
  private selectedAdministrative: string | null = null

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine): Promise<void> {
    this.mapEngine = mapEngine

    // 添加行政区划数据源
    this.mapEngine.addSource(this.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // 添加填充图层
    this.mapEngine.addLayer({
      id: this.layerId,
      type: 'fill',
      source: this.sourceId,
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'highlighted'], false],
          ['get', 'highlightColor'],
          ['get', 'fillColor']
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'highlighted'], false],
          0.6,
          ['get', 'fillOpacity']
        ]
      }
    })

    // 添加边框图层
    this.mapEngine.addLayer({
      id: this.strokeLayerId,
      type: 'line',
      source: this.sourceId,
      paint: {
        'line-color': ['get', 'strokeColor'],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'highlighted'], false],
          ['*', ['get', 'strokeWidth'], 1.5],
          ['get', 'strokeWidth']
        ],
        'line-opacity': ['get', 'strokeOpacity']
      }
    })

    // 添加标签图层
    this.mapEngine.addLayer({
      id: this.labelLayerId,
      type: 'symbol',
      source: this.sourceId,
      filter: ['==', ['get', 'showLabel'], true],
      layout: {
        'text-field': ['get', 'labelText'],
        'text-font': ['Open Sans Regular'],
        'text-size': ['get', 'labelFontSize'],
        'text-anchor': ['get', 'labelPosition']
      },
      paint: {
        'text-color': ['get', 'labelColor'],
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    })

    // 添加事件监听
    this.setupEventListeners()

    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    if (this.mapEngine && this.initialized) {
      // 移除事件监听
      this.removeEventListeners()

      // 移除图层和数据源
      this.mapEngine.removeLayer(this.labelLayerId)
      this.mapEngine.removeLayer(this.strokeLayerId)
      this.mapEngine.removeLayer(this.layerId)
      this.mapEngine.removeSource(this.sourceId)
    }

    this.administratives.clear()
    this.eventCallbacks = []
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
   * 添加行政区划
   */
  addAdministrative(administrative: AdministrativeOptions): string {
    if (!this.mapEngine) {
      throw new Error('Administrative module not initialized')
    }

    const id = administrative.id || this.generateAdministrativeId()
    const adminWithId = {
      ...administrative,
      id,
      style: {
        fillColor: 'var(--ldesign-brand-color-2)',
        fillOpacity: 0.3,
        strokeColor: 'var(--ldesign-brand-color)',
        strokeWidth: 2,
        strokeOpacity: 0.8,
        ...administrative.style
      },
      label: {
        show: true,
        text: administrative.name,
        fontSize: 14,
        color: 'var(--ldesign-text-color-primary)',
        position: 'center' as const,
        ...administrative.label
      },
      visible: administrative.visible !== false,
      highlighted: administrative.highlighted || false
    }

    this.administratives.set(id, adminWithId)
    this.updateAdministrativeLayer()

    return id
  }

  /**
   * 移除行政区划
   */
  removeAdministrative(id: string): void {
    if (this.administratives.has(id)) {
      this.administratives.delete(id)
      this.updateAdministrativeLayer()
    }
  }

  /**
   * 更新行政区划
   */
  updateAdministrative(id: string, updates: Partial<AdministrativeOptions>): void {
    const administrative = this.administratives.get(id)
    if (!administrative) return

    const updated = {
      ...administrative,
      ...updates,
      style: { ...administrative.style, ...updates.style },
      label: { ...administrative.label, ...updates.label }
    }

    this.administratives.set(id, updated)
    this.updateAdministrativeLayer()
  }

  /**
   * 获取行政区划
   */
  getAdministrative(id: string): AdministrativeOptions | undefined {
    return this.administratives.get(id)
  }

  /**
   * 获取所有行政区划
   */
  getAllAdministratives(): AdministrativeOptions[] {
    return Array.from(this.administratives.values())
  }

  /**
   * 按级别获取行政区划
   */
  getAdministrativesByLevel(level: AdministrativeLevel): AdministrativeOptions[] {
    return Array.from(this.administratives.values()).filter(
      admin => admin.level === level
    )
  }

  /**
   * 设置行政区划可见性
   */
  setAdministrativeVisibility(id: string, visible: boolean): void {
    this.updateAdministrative(id, { visible })
  }

  /**
   * 高亮行政区划
   */
  highlightAdministrative(id: string, highlight: boolean = true): void {
    if (!this.mapEngine) return

    const administrative = this.administratives.get(id)
    if (!administrative) return

    // 更新特征状态
    this.mapEngine.setFeatureState(
      { source: this.sourceId, id },
      { highlighted: highlight }
    )

    // 更新本地状态
    this.updateAdministrative(id, { highlighted: highlight })
  }

  /**
   * 选择行政区划
   */
  selectAdministrative(id: string): void {
    // 取消之前的选择
    if (this.selectedAdministrative) {
      this.highlightAdministrative(this.selectedAdministrative, false)
    }

    // 选择新的行政区划
    this.selectedAdministrative = id
    this.highlightAdministrative(id, true)

    // 触发选择事件
    const administrative = this.administratives.get(id)
    if (administrative) {
      this.triggerEvent({
        type: 'select',
        administrative,
        lngLat: [0, 0], // 简化实现
        timestamp: Date.now()
      })
    }
  }

  /**
   * 取消选择
   */
  deselectAdministrative(): void {
    if (this.selectedAdministrative) {
      const administrative = this.administratives.get(this.selectedAdministrative)
      this.highlightAdministrative(this.selectedAdministrative, false)
      
      if (administrative) {
        this.triggerEvent({
          type: 'deselect',
          administrative,
          lngLat: [0, 0], // 简化实现
          timestamp: Date.now()
        })
      }
      
      this.selectedAdministrative = null
    }
  }

  /**
   * 监听行政区划事件
   */
  onAdministrativeEvent(callback: (event: AdministrativeEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(callback: (event: AdministrativeEvent) => void): void {
    const index = this.eventCallbacks.indexOf(callback)
    if (index > -1) {
      this.eventCallbacks.splice(index, 1)
    }
  }

  /**
   * 清除所有行政区划
   */
  clearAdministratives(): void {
    this.administratives.clear()
    this.selectedAdministrative = null
    this.updateAdministrativeLayer()
  }

  /**
   * 获取行政区划统计信息
   */
  getAdministrativeStats(): {
    total: number
    byLevel: Record<AdministrativeLevel, number>
    visible: number
    highlighted: number
    selected: string | null
  } {
    const administratives = Array.from(this.administratives.values())
    const byLevel = administratives.reduce((acc, admin) => {
      acc[admin.level] = (acc[admin.level] || 0) + 1
      return acc
    }, {} as Record<AdministrativeLevel, number>)

    return {
      total: administratives.length,
      byLevel,
      visible: administratives.filter(admin => admin.visible !== false).length,
      highlighted: administratives.filter(admin => admin.highlighted).length,
      selected: this.selectedAdministrative
    }
  }

  /**
   * 更新行政区划图层
   */
  private updateAdministrativeLayer(): void {
    if (!this.mapEngine) return

    const features = Array.from(this.administratives.values())
      .filter(admin => admin.visible !== false && admin.boundaries)
      .map(admin => {
        const feature = admin.boundaries as GeoJSON.Feature
        return {
          ...feature,
          id: admin.id,
          properties: {
            ...feature.properties,
            id: admin.id,
            name: admin.name,
            code: admin.code,
            level: admin.level,
            fillColor: admin.style?.fillColor || 'var(--ldesign-brand-color-2)',
            fillOpacity: admin.style?.fillOpacity || 0.3,
            strokeColor: admin.style?.strokeColor || 'var(--ldesign-brand-color)',
            strokeWidth: admin.style?.strokeWidth || 2,
            strokeOpacity: admin.style?.strokeOpacity || 0.8,
            highlightColor: admin.style?.fillColor || 'var(--ldesign-brand-color)',
            showLabel: admin.label?.show || false,
            labelText: admin.label?.text || admin.name,
            labelFontSize: admin.label?.fontSize || 14,
            labelColor: admin.label?.color || 'var(--ldesign-text-color-primary)',
            labelPosition: admin.label?.position || 'center',
            ...admin.data
          }
        }
      })

    this.mapEngine.addSource(this.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })
  }

  /**
   * 设置事件监听
   */
  private setupEventListeners(): void {
    if (!this.mapEngine) return

    // 点击事件
    this.mapEngine.on('click', this.layerId, (e: any) => {
      const feature = e.features[0]
      if (feature) {
        const administrative = this.administratives.get(feature.id)
        if (administrative) {
          this.triggerEvent({
            type: 'click',
            administrative,
            lngLat: [e.lngLat.lng, e.lngLat.lat],
            timestamp: Date.now()
          })
        }
      }
    })

    // 悬停事件
    this.mapEngine.on('mouseenter', this.layerId, (e: any) => {
      const feature = e.features[0]
      if (feature) {
        const administrative = this.administratives.get(feature.id)
        if (administrative) {
          this.triggerEvent({
            type: 'hover',
            administrative,
            lngLat: [e.lngLat.lng, e.lngLat.lat],
            timestamp: Date.now()
          })
        }
      }
    })

    // 鼠标样式
    this.mapEngine.on('mouseenter', this.layerId, () => {
      if (this.mapEngine) {
        const container = this.mapEngine.getContainer()
        container.style.cursor = 'pointer'
      }
    })

    this.mapEngine.on('mouseleave', this.layerId, () => {
      if (this.mapEngine) {
        const container = this.mapEngine.getContainer()
        container.style.cursor = ''
      }
    })
  }

  /**
   * 移除事件监听
   */
  private removeEventListeners(): void {
    if (!this.mapEngine) return

    this.mapEngine.off('click', this.layerId)
    this.mapEngine.off('mouseenter', this.layerId)
    this.mapEngine.off('mouseleave', this.layerId)
  }

  /**
   * 触发事件
   */
  private triggerEvent(event: AdministrativeEvent): void {
    this.eventCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in administrative event callback:', error)
      }
    })
  }

  /**
   * 生成行政区划ID
   */
  private generateAdministrativeId(): string {
    return `administrative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
