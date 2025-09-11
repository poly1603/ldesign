/**
 * 测量模块
 * 提供距离和面积测量功能
 */

import type {
  IMeasurementModule,
  IMapEngine,
  MeasurementOptions,
  MeasurementResult,
  LngLat
} from '../../types'

/**
 * 测量模块实现
 */
export class MeasurementModule implements IMeasurementModule {
  readonly name = 'measurement'

  private mapEngine: IMapEngine | null = null
  private initialized = false
  private measuring = false
  private measurementType: 'distance' | 'area' | null = null
  private measurementPoints: LngLat[] = []
  private measurements: MeasurementResult[] = []
  private sourceId = 'ldesign-measurement-source'
  private layerId = 'ldesign-measurement-layer'
  private pointLayerId = 'ldesign-measurement-points'
  private labelLayerId = 'ldesign-measurement-labels'
  private currentMeasurement: MeasurementResult | null = null
  private clickHandler: ((e: any) => void) | null = null
  private mouseMoveHandler: ((e: any) => void) | null = null

  /**
   * 初始化模块
   */
  async initialize(mapEngine: IMapEngine): Promise<void> {
    this.mapEngine = mapEngine

    // 添加测量数据源
    this.mapEngine.addSource(this.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // 添加测量线图层
    this.mapEngine.addLayer({
      id: `${this.layerId}-line`,
      type: 'line',
      source: this.sourceId,
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-color': 'var(--ldesign-brand-color)',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    })

    // 添加测量面图层
    this.mapEngine.addLayer({
      id: `${this.layerId}-fill`,
      type: 'fill',
      source: this.sourceId,
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': 'var(--ldesign-brand-color)',
        'fill-opacity': 0.2
      }
    })

    // 添加测量点图层
    this.mapEngine.addLayer({
      id: `${this.layerId}-point`,
      type: 'circle',
      source: this.sourceId,
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 5,
        'circle-color': 'var(--ldesign-brand-color)',
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2
      }
    })

    // 绑定点击事件
    this.bindEvents()

    this.initialized = true
  }

  /**
   * 销毁模块
   */
  destroy(): void {
    if (this.mapEngine && this.initialized) {
      this.clearMeasurements()
      this.mapEngine.removeLayer(`${this.layerId}-point`)
      this.mapEngine.removeLayer(`${this.layerId}-fill`)
      this.mapEngine.removeLayer(`${this.layerId}-line`)
      this.mapEngine.removeSource(this.sourceId)
    }

    this.measurements = []
    this.measurementPoints = []
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
   * 开始测距
   */
  startDistanceMeasurement(): void {
    if (!this.initialized) {
      throw new Error('Measurement module not initialized')
    }

    this.measuring = true
    this.measurementType = 'distance'
    this.measurementPoints = []
    this.updateCursor('crosshair')
  }

  /**
   * 开始测面积
   */
  startAreaMeasurement(): void {
    if (!this.initialized) {
      throw new Error('Measurement module not initialized')
    }

    this.measuring = true
    this.measurementType = 'area'
    this.measurementPoints = []
    this.updateCursor('crosshair')
  }

  /**
   * 结束测量
   */
  finishMeasurement(): MeasurementResult | null {
    if (!this.measuring || this.measurementPoints.length < 2) {
      return null
    }

    let result: MeasurementResult | null = null

    if (this.measurementType === 'distance') {
      result = this.calculateDistance()
    } else if (this.measurementType === 'area' && this.measurementPoints.length >= 3) {
      result = this.calculateArea()
    }

    if (result) {
      this.measurements.push(result)
      this.updateMeasurementLayer()
    }

    this.measuring = false
    this.measurementType = null
    this.measurementPoints = []
    this.updateCursor('default')

    return result
  }

  /**
   * 取消测量
   */
  cancelMeasurement(): void {
    this.measuring = false
    this.measurementType = null
    this.measurementPoints = []
    this.updateCursor('default')
    this.updateMeasurementLayer()
  }

  /**
   * 清除所有测量
   */
  clearMeasurements(): void {
    this.measurements = []
    this.measurementPoints = []
    this.measuring = false
    this.measurementType = null
    this.updateCursor('default')
    this.updateMeasurementLayer()
  }

  /**
   * 获取测量结果
   */
  getMeasurements(): MeasurementResult[] {
    return [...this.measurements]
  }

  /**
   * 是否正在测量
   */
  isMeasuring(): boolean {
    return this.measuring
  }

  /**
   * 绑定地图事件
   */
  private bindEvents(): void {
    if (!this.mapEngine) return

    this.mapEngine.on('click', (e: any) => {
      if (this.measuring) {
        this.addMeasurementPoint([e.lngLat.lng, e.lngLat.lat])
      }
    })

    this.mapEngine.on('dblclick', () => {
      if (this.measuring) {
        this.finishMeasurement()
      }
    })
  }

  /**
   * 添加测量点
   */
  private addMeasurementPoint(point: LngLat): void {
    this.measurementPoints.push(point)
    this.updateMeasurementLayer()
  }

  /**
   * 计算距离
   */
  private calculateDistance(): MeasurementResult {
    let totalDistance = 0

    for (let i = 1; i < this.measurementPoints.length; i++) {
      const distance = this.haversineDistance(
        this.measurementPoints[i - 1],
        this.measurementPoints[i]
      )
      totalDistance += distance
    }

    const geometry: GeoJSON.LineString = {
      type: 'LineString',
      coordinates: this.measurementPoints
    }

    return {
      type: 'distance',
      value: totalDistance,
      unit: 'meters',
      displayText: this.formatDistance(totalDistance),
      geometry
    }
  }

  /**
   * 计算面积
   */
  private calculateArea(): MeasurementResult {
    // 闭合多边形
    const coordinates = [...this.measurementPoints, this.measurementPoints[0]]

    const area = this.polygonArea(coordinates)

    const geometry: GeoJSON.Polygon = {
      type: 'Polygon',
      coordinates: [coordinates]
    }

    return {
      type: 'area',
      value: area,
      unit: 'square-meters',
      displayText: this.formatArea(area),
      geometry
    }
  }

  /**
   * 使用Haversine公式计算两点间距离
   */
  private haversineDistance(point1: LngLat, point2: LngLat): number {
    const R = 6371000 // 地球半径（米）
    const lat1 = point1[1] * Math.PI / 180
    const lat2 = point2[1] * Math.PI / 180
    const deltaLat = (point2[1] - point1[1]) * Math.PI / 180
    const deltaLng = (point2[0] - point1[0]) * Math.PI / 180

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  /**
   * 计算多边形面积（球面几何）
   */
  private polygonArea(coordinates: LngLat[]): number {
    const R = 6371000 // 地球半径（米）
    let area = 0

    if (coordinates.length < 3) return 0

    for (let i = 0; i < coordinates.length - 1; i++) {
      const p1 = coordinates[i]
      const p2 = coordinates[i + 1]

      area += (p2[0] - p1[0]) * Math.PI / 180 *
        (2 + Math.sin(p1[1] * Math.PI / 180) + Math.sin(p2[1] * Math.PI / 180))
    }

    area = Math.abs(area * R * R / 2)
    return area
  }

  /**
   * 格式化距离显示
   */
  private formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters.toFixed(2)} 米`
    } else {
      return `${(meters / 1000).toFixed(2)} 公里`
    }
  }

  /**
   * 格式化面积显示
   */
  private formatArea(squareMeters: number): string {
    if (squareMeters < 10000) {
      return `${squareMeters.toFixed(2)} 平方米`
    } else {
      return `${(squareMeters / 10000).toFixed(2)} 公顷`
    }
  }

  /**
   * 更新测量图层
   */
  private updateMeasurementLayer(): void {
    if (!this.mapEngine) return

    const features: GeoJSON.Feature[] = []

    // 添加已完成的测量
    this.measurements.forEach(measurement => {
      features.push({
        type: 'Feature',
        properties: {
          type: measurement.type,
          value: measurement.value,
          unit: measurement.unit,
          displayText: measurement.displayText
        },
        geometry: measurement.geometry
      })
    })

    // 添加当前测量中的点和线
    if (this.measuring && this.measurementPoints.length > 0) {
      // 添加点
      this.measurementPoints.forEach(point => {
        features.push({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: point
          }
        })
      })

      // 添加线或面
      if (this.measurementPoints.length > 1) {
        if (this.measurementType === 'distance') {
          features.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: this.measurementPoints
            }
          })
        } else if (this.measurementType === 'area' && this.measurementPoints.length >= 3) {
          features.push({
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[...this.measurementPoints, this.measurementPoints[0]]]
            }
          })
        }
      }
    }

    this.mapEngine.addSource(this.sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    })
  }

  /**
   * 更新鼠标样式
   */
  private updateCursor(cursor: string): void {
    if (this.mapEngine) {
      const container = this.mapEngine.getContainer()
      container.style.cursor = cursor
    }
  }

  /**
   * 计算多边形面积（使用鞋带公式）
   */
  private calculatePolygonArea(coordinates: LngLat[]): number {
    if (coordinates.length < 3) return 0

    // 转换为平面坐标进行计算
    let area = 0
    const n = coordinates.length

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      const xi = coordinates[i][0]
      const yi = coordinates[i][1]
      const xj = coordinates[j][0]
      const yj = coordinates[j][1]

      area += xi * yj - xj * yi
    }

    area = Math.abs(area) / 2

    // 转换为平方米（近似计算）
    const avgLat = coordinates.reduce((sum, coord) => sum + coord[1], 0) / n
    const latFactor = 111320 // 1度纬度的米数
    const lngFactor = 111320 * Math.cos(avgLat * Math.PI / 180) // 1度经度的米数

    return area * latFactor * lngFactor
  }



  /**
   * 获取测量统计信息
   */
  getMeasurementStats(): {
    totalMeasurements: number
    distanceMeasurements: number
    areaMeasurements: number
    totalDistance: number
    totalArea: number
    isCurrentlyMeasuring: boolean
  } {
    const distanceMeasurements = this.measurements.filter(m => m.type === 'distance')
    const areaMeasurements = this.measurements.filter(m => m.type === 'area')

    return {
      totalMeasurements: this.measurements.length,
      distanceMeasurements: distanceMeasurements.length,
      areaMeasurements: areaMeasurements.length,
      totalDistance: distanceMeasurements.reduce((sum, m) => sum + m.value, 0),
      totalArea: areaMeasurements.reduce((sum, m) => sum + m.value, 0),
      isCurrentlyMeasuring: this.measuring
    }
  }

  /**
   * 导出测量结果
   */
  exportMeasurements(): {
    measurements: MeasurementResult[]
    summary: ReturnType<typeof this.getMeasurementStats>
    exportTime: string
  } {
    return {
      measurements: [...this.measurements],
      summary: this.getMeasurementStats(),
      exportTime: new Date().toISOString()
    }
  }

  /**
   * 导入测量结果
   */
  importMeasurements(data: { measurements: MeasurementResult[] }): void {
    this.measurements = [...data.measurements]
    this.updateMeasurementLayer()
  }

  /**
   * 获取当前测量状态
   */
  getCurrentMeasurementState(): {
    isActive: boolean
    type: 'distance' | 'area' | null
    pointCount: number
    currentValue: number
    formattedValue: string
  } {
    const currentValue = this.currentMeasurement?.value || 0
    const formattedValue = this.measurementType === 'distance'
      ? this.formatDistance(currentValue)
      : this.formatArea(currentValue)

    return {
      isActive: this.measuring,
      type: this.measurementType,
      pointCount: this.measurementPoints.length,
      currentValue,
      formattedValue
    }
  }
}
