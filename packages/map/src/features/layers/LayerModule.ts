/**
 * 图层管理模块
 * 实现地图图层的添加、删除、切换、样式配置等功能
 */

import type { ILayerModule, IMapEngine, LayerOptions, LayerStyle, LayerData } from '../../types'

/**
 * 图层管理模块实现
 * 
 * @example
 * ```typescript
 * const layerModule = new LayerModule(mapEngine)
 * 
 * // 添加矢量图层
 * const layerId = layerModule.addLayer({
 *   id: 'buildings',
 *   type: 'fill',
 *   source: {
 *     type: 'geojson',
 *     data: buildingsData
 *   },
 *   paint: {
 *     'fill-color': '#722ED1',
 *     'fill-opacity': 0.6
 *   }
 * })
 * 
 * // 切换图层可见性
 * layerModule.toggleLayer(layerId)
 * 
 * // 更新图层样式
 * layerModule.updateLayerStyle(layerId, {
 *   'fill-color': '#ff0000'
 * })
 * ```
 */
export class LayerModule implements ILayerModule {
  private mapEngine: IMapEngine
  private layers = new Map<string, LayerOptions>()
  private layerVisibility = new Map<string, boolean>()

  constructor(mapEngine: IMapEngine) {
    this.mapEngine = mapEngine
  }

  /**
   * 添加图层
   */
  async addLayer(options: LayerOptions): Promise<string> {
    try {
      const layerId = options.id || this.generateLayerId()
      const layerOptions = { ...options, id: layerId }

      // 添加数据源（如果需要）
      if (layerOptions.source && typeof layerOptions.source === 'object') {
        const sourceId = `${layerId}-source`
        await this.mapEngine.addSource(sourceId, layerOptions.source)
        layerOptions.source = sourceId
      }

      // 添加图层到地图
      await this.mapEngine.addLayer(layerOptions)

      // 保存图层信息
      this.layers.set(layerId, layerOptions)
      this.layerVisibility.set(layerId, true)

      return layerId
    } catch (error) {
      throw new Error(`Failed to add layer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 移除图层
   */
  async removeLayer(layerId: string): Promise<void> {
    try {
      if (!this.layers.has(layerId)) {
        throw new Error(`Layer ${layerId} not found`)
      }

      // 从地图移除图层
      await this.mapEngine.removeLayer(layerId)

      // 移除相关数据源
      const sourceId = `${layerId}-source`
      if (this.mapEngine.hasSource && this.mapEngine.hasSource(sourceId)) {
        await this.mapEngine.removeSource(sourceId)
      }

      // 清理本地状态
      this.layers.delete(layerId)
      this.layerVisibility.delete(layerId)
    } catch (error) {
      throw new Error(`Failed to remove layer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 切换图层可见性
   */
  async toggleLayer(layerId: string): Promise<boolean> {
    const currentVisibility = this.layerVisibility.get(layerId) ?? true
    const newVisibility = !currentVisibility
    
    await this.setLayerVisibility(layerId, newVisibility)
    return newVisibility
  }

  /**
   * 设置图层可见性
   */
  async setLayerVisibility(layerId: string, visible: boolean): Promise<void> {
    try {
      if (!this.layers.has(layerId)) {
        throw new Error(`Layer ${layerId} not found`)
      }

      await this.mapEngine.setLayerVisibility(layerId, visible)
      this.layerVisibility.set(layerId, visible)
    } catch (error) {
      throw new Error(`Failed to set layer visibility: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新图层样式
   */
  async updateLayerStyle(layerId: string, style: LayerStyle): Promise<void> {
    try {
      if (!this.layers.has(layerId)) {
        throw new Error(`Layer ${layerId} not found`)
      }

      await this.mapEngine.updateLayerStyle(layerId, style)

      // 更新本地存储的图层配置
      const layer = this.layers.get(layerId)!
      layer.paint = { ...layer.paint, ...style }
      this.layers.set(layerId, layer)
    } catch (error) {
      throw new Error(`Failed to update layer style: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 更新图层数据
   */
  async updateLayerData(layerId: string, data: LayerData): Promise<void> {
    try {
      if (!this.layers.has(layerId)) {
        throw new Error(`Layer ${layerId} not found`)
      }

      const sourceId = `${layerId}-source`
      await this.mapEngine.updateSource(sourceId, data)
    } catch (error) {
      throw new Error(`Failed to update layer data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 设置图层顺序
   */
  async setLayerOrder(layerId: string, beforeLayerId?: string): Promise<void> {
    try {
      if (!this.layers.has(layerId)) {
        throw new Error(`Layer ${layerId} not found`)
      }

      await this.mapEngine.moveLayer(layerId, beforeLayerId)
    } catch (error) {
      throw new Error(`Failed to set layer order: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 获取图层信息
   */
  getLayer(layerId: string): LayerOptions | null {
    return this.layers.get(layerId) || null
  }

  /**
   * 获取所有图层
   */
  getAllLayers(): LayerOptions[] {
    return Array.from(this.layers.values())
  }

  /**
   * 获取图层可见性
   */
  getLayerVisibility(layerId: string): boolean {
    return this.layerVisibility.get(layerId) ?? true
  }

  /**
   * 检查图层是否存在
   */
  hasLayer(layerId: string): boolean {
    return this.layers.has(layerId)
  }

  /**
   * 清除所有图层
   */
  async clearAllLayers(): Promise<void> {
    const layerIds = Array.from(this.layers.keys())
    
    for (const layerId of layerIds) {
      await this.removeLayer(layerId)
    }
  }

  /**
   * 批量添加图层
   */
  async addLayers(layersOptions: LayerOptions[]): Promise<string[]> {
    const layerIds: string[] = []
    
    for (const options of layersOptions) {
      try {
        const layerId = await this.addLayer(options)
        layerIds.push(layerId)
      } catch (error) {
        console.error(`Failed to add layer ${options.id}:`, error)
      }
    }
    
    return layerIds
  }

  /**
   * 批量移除图层
   */
  async removeLayers(layerIds: string[]): Promise<void> {
    for (const layerId of layerIds) {
      try {
        await this.removeLayer(layerId)
      } catch (error) {
        console.error(`Failed to remove layer ${layerId}:`, error)
      }
    }
  }

  /**
   * 获取图层统计信息
   */
  getLayerStats(): {
    total: number
    visible: number
    hidden: number
    types: Record<string, number>
  } {
    const stats = {
      total: this.layers.size,
      visible: 0,
      hidden: 0,
      types: {} as Record<string, number>
    }

    for (const [layerId, layer] of this.layers) {
      // 统计可见性
      if (this.layerVisibility.get(layerId)) {
        stats.visible++
      } else {
        stats.hidden++
      }

      // 统计类型
      const type = layer.type || 'unknown'
      stats.types[type] = (stats.types[type] || 0) + 1
    }

    return stats
  }

  /**
   * 生成唯一的图层ID
   */
  private generateLayerId(): string {
    return `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁模块
   */
  async destroy(): Promise<void> {
    await this.clearAllLayers()
    this.layers.clear()
    this.layerVisibility.clear()
  }
}
