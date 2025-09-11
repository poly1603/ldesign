/**
 * 3D地图模块
 * 提供3D地图渲染、建筑物显示、高度数据等3D功能
 */

import type {
  IFeatureModule,
  IMapEngine,
  LngLat,
  LayerOptions
} from '../../types'

/**
 * 3D地图配置选项
 */
export interface ThreeDOptions {
  /** 是否启用3D建筑物 */
  enableBuildings?: boolean
  /** 是否启用地形 */
  enableTerrain?: boolean
  /** 地形数据源 */
  terrainSource?: string
  /** 建筑物高度倍数 */
  buildingHeightMultiplier?: number
  /** 3D视角配置 */
  camera?: {
    pitch?: number
    bearing?: number
    altitude?: number
  }
  /** 光照配置 */
  lighting?: {
    ambient?: number
    directional?: number
    position?: [number, number, number]
  }
}

/**
 * 3D建筑物配置
 */
export interface BuildingOptions {
  /** 建筑物ID */
  id?: string
  /** 建筑物名称 */
  name?: string
  /** 建筑物位置 */
  coordinates: LngLat[]
  /** 建筑物高度 */
  height: number
  /** 建筑物颜色 */
  color?: string
  /** 建筑物材质 */
  material?: {
    type: 'basic' | 'phong' | 'lambert'
    properties?: Record<string, any>
  }
}

/**
 * 3D地图模块实现
 * 
 * @example
 * ```typescript
 * const threeDModule = new ThreeDModule()
 * await threeDModule.initialize(mapEngine)
 * 
 * // 启用3D建筑物
 * threeDModule.enableBuildings()
 * 
 * // 添加自定义建筑物
 * threeDModule.addBuilding({
 *   name: '自定义建筑',
 *   coordinates: [[116.404, 39.915], [116.405, 39.915], [116.405, 39.916], [116.404, 39.916]],
 *   height: 100,
 *   color: '#722ED1'
 * })
 * 
 * // 设置3D视角
 * threeDModule.setCamera({
 *   pitch: 60,
 *   bearing: 45,
 *   altitude: 1000
 * })
 * ```
 */
export class ThreeDModule implements IFeatureModule {
  readonly name = 'threeD'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private options: ThreeDOptions = {}
  private customBuildings = new Map<string, BuildingOptions>()
  private buildingsEnabled = false
  private terrainEnabled = false

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine, options: ThreeDOptions = {}): Promise<void> {
    this.mapEngine = mapEngine
    this.options = {
      enableBuildings: true,
      enableTerrain: false,
      buildingHeightMultiplier: 1,
      camera: {
        pitch: 45,
        bearing: 0,
        altitude: 1000
      },
      lighting: {
        ambient: 0.4,
        directional: 0.8,
        position: [1, 1, 1]
      },
      ...options
    }

    // 初始化3D功能
    if (this.options.enableBuildings) {
      await this.enableBuildings()
    }

    if (this.options.enableTerrain && this.options.terrainSource) {
      await this.enableTerrain(this.options.terrainSource)
    }

    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    if (this.mapEngine && this.initialized) {
      this.disableBuildings()
      this.disableTerrain()
      this.clearCustomBuildings()
    }

    this.customBuildings.clear()
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
   * 启用3D建筑物
   */
  async enableBuildings(): Promise<void> {
    if (!this.mapEngine || this.buildingsEnabled) return

    try {
      // 添加3D建筑物图层
      this.mapEngine.addLayer({
        id: 'ldesign-3d-buildings',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        minzoom: 15,
        paint: {
          'fill-extrusion-color': [
            'case',
            ['has', 'color'],
            ['get', 'color'],
            'var(--ldesign-gray-color-3)'
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['*', ['get', 'height'], this.options.buildingHeightMultiplier || 1]
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.8
        }
      })

      this.buildingsEnabled = true
    } catch (error) {
      console.error('Failed to enable 3D buildings:', error)
    }
  }

  /**
   * 禁用3D建筑物
   */
  disableBuildings(): void {
    if (!this.mapEngine || !this.buildingsEnabled) return

    try {
      this.mapEngine.removeLayer('ldesign-3d-buildings')
      this.buildingsEnabled = false
    } catch (error) {
      console.error('Failed to disable 3D buildings:', error)
    }
  }

  /**
   * 启用地形
   */
  async enableTerrain(terrainSource: string): Promise<void> {
    if (!this.mapEngine || this.terrainEnabled) return

    try {
      // 添加地形数据源
      this.mapEngine.addSource('ldesign-terrain', {
        type: 'raster-dem',
        url: terrainSource,
        tileSize: 512,
        maxzoom: 14
      })

      // 设置地形
      const mapInstance = this.mapEngine.getMapInstance()
      if (mapInstance && mapInstance.setTerrain) {
        mapInstance.setTerrain({
          source: 'ldesign-terrain',
          exaggeration: 1.5
        })
      }

      this.terrainEnabled = true
    } catch (error) {
      console.error('Failed to enable terrain:', error)
    }
  }

  /**
   * 禁用地形
   */
  disableTerrain(): void {
    if (!this.mapEngine || !this.terrainEnabled) return

    try {
      const mapInstance = this.mapEngine.getMapInstance()
      if (mapInstance && mapInstance.setTerrain) {
        mapInstance.setTerrain(null)
      }

      this.mapEngine.removeSource('ldesign-terrain')
      this.terrainEnabled = false
    } catch (error) {
      console.error('Failed to disable terrain:', error)
    }
  }

  /**
   * 添加自定义建筑物
   */
  addBuilding(building: BuildingOptions): string {
    if (!this.mapEngine) {
      throw new Error('3D module not initialized')
    }

    const buildingId = building.id || this.generateBuildingId()
    const buildingWithId = { ...building, id: buildingId }

    // 创建建筑物GeoJSON
    const feature = {
      type: 'Feature' as const,
      properties: {
        id: buildingId,
        name: building.name || '',
        height: building.height,
        color: building.color || 'var(--ldesign-brand-color)',
        material: building.material || { type: 'basic' }
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [building.coordinates]
      }
    }

    // 添加到数据源
    const sourceId = `building-source-${buildingId}`
    this.mapEngine.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [feature]
      }
    })

    // 添加3D建筑物图层
    this.mapEngine.addLayer({
      id: `building-layer-${buildingId}`,
      type: 'fill-extrusion',
      source: sourceId,
      paint: {
        'fill-extrusion-color': ['get', 'color'],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': 0.8
      }
    })

    this.customBuildings.set(buildingId, buildingWithId)
    return buildingId
  }

  /**
   * 移除自定义建筑物
   */
  removeBuilding(buildingId: string): void {
    if (!this.mapEngine || !this.customBuildings.has(buildingId)) return

    try {
      this.mapEngine.removeLayer(`building-layer-${buildingId}`)
      this.mapEngine.removeSource(`building-source-${buildingId}`)
      this.customBuildings.delete(buildingId)
    } catch (error) {
      console.error(`Failed to remove building ${buildingId}:`, error)
    }
  }

  /**
   * 清除所有自定义建筑物
   */
  clearCustomBuildings(): void {
    this.customBuildings.forEach((_, buildingId) => {
      this.removeBuilding(buildingId)
    })
  }

  /**
   * 设置3D相机视角
   */
  setCamera(camera: ThreeDOptions['camera']): void {
    if (!this.mapEngine) return

    const mapInstance = this.mapEngine.getMapInstance()
    if (!mapInstance) return

    const options: any = {}

    if (camera?.pitch !== undefined) {
      options.pitch = camera.pitch
    }

    if (camera?.bearing !== undefined) {
      options.bearing = camera.bearing
    }

    if (camera?.altitude !== undefined) {
      // 根据高度计算缩放级别
      const zoom = Math.log2(591657527.591555 / camera.altitude)
      options.zoom = Math.max(0, Math.min(24, zoom))
    }

    mapInstance.easeTo(options)
  }

  /**
   * 获取当前3D状态
   */
  getThreeDState(): {
    buildingsEnabled: boolean
    terrainEnabled: boolean
    customBuildingsCount: number
    camera: {
      pitch: number
      bearing: number
      zoom: number
    }
  } {
    const mapInstance = this.mapEngine?.getMapInstance()
    
    return {
      buildingsEnabled: this.buildingsEnabled,
      terrainEnabled: this.terrainEnabled,
      customBuildingsCount: this.customBuildings.size,
      camera: {
        pitch: mapInstance?.getPitch() || 0,
        bearing: mapInstance?.getBearing() || 0,
        zoom: mapInstance?.getZoom() || 0
      }
    }
  }

  /**
   * 生成建筑物ID
   */
  private generateBuildingId(): string {
    return `building-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
