/**
 * 3D建筑效果实现
 * 基于Mapbox GL JS的3D建筑渲染
 */

import { BaseEffect } from './BaseEffect'
import type { Building3DEffectOptions, LayerOptions, DataSource } from '../types'

/**
 * 3D建筑效果类
 * 实现建筑物的3D可视化效果
 */
export class Building3DEffect extends BaseEffect {
  /** 图层ID */
  private layerId: string
  
  /** 数据源ID */
  private sourceId: string
  
  /** 效果配置 */
  private buildingOptions: Required<Building3DEffectOptions>
  
  /** 是否已添加图层 */
  private layerAdded = false

  constructor(id: string, options: Building3DEffectOptions) {
    super(id, 'buildings3d', options)
    
    this.layerId = `${id}-layer`
    this.sourceId = `${id}-source`
    
    this.buildingOptions = {
      heightProperty: 'height',
      color: '#ffffff',
      material: 'basic',
      lightIntensity: 1.0,
      shadows: true,
      ...options,
      id: options.id || id,
      visible: options.visible !== false,
      opacity: options.opacity || 1,
      zIndex: options.zIndex || 1000
    }
  }

  /**
   * 初始化3D建筑效果
   */
  protected async onInitialize(): Promise<void> {
    // 检查是否为Mapbox引擎
    if (!this.isMapboxEngine()) {
      throw new Error('3D建筑效果目前仅支持Mapbox GL JS引擎')
    }
    
    // 等待地图加载完成
    await this.mapEngine!.waitForLoad()
    
    // 添加3D建筑图层
    this.addBuildingLayer()
    
    // 设置光照
    this.setupLighting()
  }

  /**
   * 检查是否为Mapbox引擎
   */
  private isMapboxEngine(): boolean {
    const mapInstance = this.mapEngine!.getMapInstance()
    return mapInstance && typeof mapInstance.addLayer === 'function'
  }

  /**
   * 添加3D建筑图层
   */
  private addBuildingLayer(): void {
    const map = this.mapEngine!.getMapInstance()
    
    try {
      // 添加建筑数据源（使用Mapbox内置的建筑数据）
      if (!map.getSource(this.sourceId)) {
        const source: DataSource = {
          type: 'vector',
          tiles: ['https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/{z}/{x}/{y}.vector.pbf?access_token=' + 
                 (map.accessToken || '')],
          minzoom: 0,
          maxzoom: 14
        }
        
        this.mapEngine!.addSource(this.sourceId, source)
      }
      
      // 创建3D建筑图层
      const layer: LayerOptions = {
        id: this.layerId,
        type: 'fill-extrusion',
        source: this.sourceId,
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        minzoom: 15,
        paint: {
          'fill-extrusion-color': this.buildingOptions.color,
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['get', this.buildingOptions.heightProperty]
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': this.options.opacity || 0.8
        }
      }
      
      this.mapEngine!.addLayer(layer)
      this.layerAdded = true
      
      console.log(`3D建筑图层添加成功: ${this.layerId}`)
      
    } catch (error) {
      console.error('添加3D建筑图层失败:', error)
      throw error
    }
  }

  /**
   * 设置光照效果
   */
  private setupLighting(): void {
    const map = this.mapEngine!.getMapInstance()
    const { lightIntensity } = this.buildingOptions
    
    try {
      // 设置环境光
      map.setLight({
        intensity: lightIntensity,
        color: '#ffffff',
        position: [1.5, 90, 60] // [方位角, 高度角, 距离]
      })
      
      console.log('光照设置完成')
      
    } catch (error) {
      console.warn('设置光照失败:', error)
    }
  }

  /**
   * 设置建筑颜色
   */
  setBuildingColor(color: string): void {
    if (!this.layerAdded) return
    
    const map = this.mapEngine!.getMapInstance()
    this.buildingOptions.color = color
    
    try {
      map.setPaintProperty(this.layerId, 'fill-extrusion-color', color)
    } catch (error) {
      console.error('设置建筑颜色失败:', error)
    }
  }

  /**
   * 设置建筑高度属性
   */
  setHeightProperty(property: string): void {
    if (!this.layerAdded) return
    
    const map = this.mapEngine!.getMapInstance()
    this.buildingOptions.heightProperty = property
    
    try {
      const heightExpression = [
        'interpolate',
        ['linear'],
        ['zoom'],
        15, 0,
        15.05, ['get', property]
      ]
      
      map.setPaintProperty(this.layerId, 'fill-extrusion-height', heightExpression)
    } catch (error) {
      console.error('设置建筑高度属性失败:', error)
    }
  }

  /**
   * 设置光照强度
   */
  setLightIntensity(intensity: number): void {
    const map = this.mapEngine!.getMapInstance()
    this.buildingOptions.lightIntensity = intensity
    
    try {
      map.setLight({
        intensity: intensity,
        color: '#ffffff',
        position: [1.5, 90, 60]
      })
    } catch (error) {
      console.error('设置光照强度失败:', error)
    }
  }

  /**
   * 设置建筑透明度
   */
  setBuildingOpacity(opacity: number): void {
    if (!this.layerAdded) return
    
    const map = this.mapEngine!.getMapInstance()
    
    try {
      map.setPaintProperty(this.layerId, 'fill-extrusion-opacity', opacity)
    } catch (error) {
      console.error('设置建筑透明度失败:', error)
    }
  }

  /**
   * 添加自定义建筑数据
   */
  addCustomBuildings(geojsonData: any): void {
    const customSourceId = `${this.sourceId}-custom`
    const customLayerId = `${this.layerId}-custom`
    
    try {
      // 添加自定义数据源
      const source: DataSource = {
        type: 'geojson',
        data: geojsonData
      }
      
      this.mapEngine!.addSource(customSourceId, source)
      
      // 添加自定义建筑图层
      const layer: LayerOptions = {
        id: customLayerId,
        type: 'fill-extrusion',
        source: customSourceId,
        paint: {
          'fill-extrusion-color': this.buildingOptions.color,
          'fill-extrusion-height': ['get', this.buildingOptions.heightProperty],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': this.options.opacity || 0.8
        }
      }
      
      this.mapEngine!.addLayer(layer)
      
      console.log(`自定义建筑图层添加成功: ${customLayerId}`)
      
    } catch (error) {
      console.error('添加自定义建筑失败:', error)
    }
  }

  /**
   * 设置可见性
   */
  protected setVisibility(visible: boolean): void {
    super.setVisibility(visible)
    
    if (this.layerAdded) {
      try {
        this.mapEngine!.setLayerVisibility(this.layerId, visible)
      } catch (error) {
        console.error('设置图层可见性失败:', error)
      }
    }
  }

  /**
   * 透明度变化回调
   */
  protected onOpacityChange(opacity: number): void {
    this.setBuildingOpacity(opacity)
  }

  /**
   * 更新配置
   */
  protected onUpdate(newOptions: Partial<Building3DEffectOptions>): void {
    const oldOptions = { ...this.buildingOptions }
    this.buildingOptions = { ...this.buildingOptions, ...newOptions }
    
    // 更新颜色
    if (newOptions.color && newOptions.color !== oldOptions.color) {
      this.setBuildingColor(newOptions.color)
    }
    
    // 更新高度属性
    if (newOptions.heightProperty && newOptions.heightProperty !== oldOptions.heightProperty) {
      this.setHeightProperty(newOptions.heightProperty)
    }
    
    // 更新光照强度
    if (newOptions.lightIntensity !== undefined && 
        newOptions.lightIntensity !== oldOptions.lightIntensity) {
      this.setLightIntensity(newOptions.lightIntensity)
    }
  }

  /**
   * 获取建筑信息
   */
  getBuildingInfo(lngLat: [number, number]): any {
    const map = this.mapEngine!.getMapInstance()
    const point = this.mapEngine!.project(lngLat)
    
    try {
      const features = map.queryRenderedFeatures(point, {
        layers: [this.layerId]
      })
      
      return features.length > 0 ? features[0] : null
    } catch (error) {
      console.error('获取建筑信息失败:', error)
      return null
    }
  }

  /**
   * 高亮建筑
   */
  highlightBuilding(buildingId: string, color: string = '#ff0000'): void {
    const map = this.mapEngine!.getMapInstance()
    const highlightLayerId = `${this.layerId}-highlight`
    
    try {
      // 移除之前的高亮图层
      if (map.getLayer(highlightLayerId)) {
        map.removeLayer(highlightLayerId)
      }
      
      // 添加高亮图层
      const layer: LayerOptions = {
        id: highlightLayerId,
        type: 'fill-extrusion',
        source: this.sourceId,
        'source-layer': 'building',
        filter: ['==', 'id', buildingId],
        paint: {
          'fill-extrusion-color': color,
          'fill-extrusion-height': ['get', this.buildingOptions.heightProperty],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.9
        }
      }
      
      this.mapEngine!.addLayer(layer)
      
    } catch (error) {
      console.error('高亮建筑失败:', error)
    }
  }

  /**
   * 清除建筑高亮
   */
  clearHighlight(): void {
    const map = this.mapEngine!.getMapInstance()
    const highlightLayerId = `${this.layerId}-highlight`
    
    try {
      if (map.getLayer(highlightLayerId)) {
        map.removeLayer(highlightLayerId)
      }
    } catch (error) {
      console.error('清除建筑高亮失败:', error)
    }
  }

  /**
   * 销毁效果
   */
  protected onDestroy(): void {
    if (this.layerAdded) {
      try {
        // 清除高亮
        this.clearHighlight()
        
        // 移除图层
        this.mapEngine!.removeLayer(this.layerId)
        
        // 移除数据源
        this.mapEngine!.removeSource(this.sourceId)
        
        this.layerAdded = false
        
      } catch (error) {
        console.error('销毁3D建筑效果失败:', error)
      }
    }
  }
}
