/**
 * 原生JavaScript示例
 * 展示LDesign地图插件在原生JavaScript中的完整功能
 */

import { VanillaMapWrapper } from '@ldesign/map/vanilla'
import type { MarkerOptions } from '@ldesign/map'

// 应用状态
interface AppState {
  isInitialized: boolean
  isLoading: boolean
  error: Error | null
  center: [number, number]
  zoom: number
  markers: MarkerOptions[]
}

class MapApp {
  private mapWrapper: VanillaMapWrapper | null = null
  private state: AppState = {
    isInitialized: false,
    isLoading: false,
    error: null,
    center: [116.404, 39.915],
    zoom: 10,
    markers: []
  }

  // DOM元素引用
  private elements = {
    statusText: document.getElementById('status-text')!,
    centerText: document.getElementById('center-text')!,
    zoomText: document.getElementById('zoom-text')!,
    markerCount: document.getElementById('marker-count')!,
    zoomSlider: document.getElementById('zoom-slider') as HTMLInputElement,
    flyToBeijing: document.getElementById('fly-to-beijing') as HTMLButtonElement,
    flyToShanghai: document.getElementById('fly-to-shanghai') as HTMLButtonElement,
    addRandomMarker: document.getElementById('add-random-marker') as HTMLButtonElement,
    addBeijingMarker: document.getElementById('add-beijing-marker') as HTMLButtonElement,
    clearMarkers: document.getElementById('clear-markers') as HTMLButtonElement,
    showRouting: document.getElementById('show-routing') as HTMLButtonElement,
    showHeatmap: document.getElementById('show-heatmap') as HTMLButtonElement,
    showGeofence: document.getElementById('show-geofence') as HTMLButtonElement,
    errorGroup: document.getElementById('error-group')!,
    errorText: document.getElementById('error-text')!
  }

  constructor() {
    this.initializeMap()
    this.setupEventListeners()
    this.updateUI()
  }

  /**
   * 初始化地图
   */
  private initializeMap(): void {
    try {
      this.mapWrapper = new VanillaMapWrapper('#map', {
        center: [116.404, 39.915],
        zoom: 10,
        accessToken: 'pk.eyJ1IjoibGRlc2lnbiIsImEiOiJjbHpxeXl6ZXkwMGNzMmxzNjBxdGNxbzJxIn0.demo-token', // 请替换为真实的token
        style: 'streets',
        showNavigation: true,
        showScale: true,
        showFullscreen: true,
        autoInit: true,
        showLoading: true,
        showError: true
      })

      // 设置地图事件监听器
      this.setupMapEventListeners()
    } catch (error) {
      this.handleError(error instanceof Error ? error : new Error('Failed to initialize map'))
    }
  }

  /**
   * 设置地图事件监听器
   */
  private setupMapEventListeners(): void {
    if (!this.mapWrapper) return

    this.mapWrapper.on('load', () => {
      this.state.isInitialized = true
      this.state.isLoading = false
      this.state.error = null
      this.updateUI()
      console.log('地图加载完成')
    })

    this.mapWrapper.on('click', (event: any) => {
      console.log('地图点击:', event.lngLat)
      this.addMarkerAt(event.lngLat, `点击位置 (${event.lngLat[0].toFixed(4)}, ${event.lngLat[1].toFixed(4)})`)
    })

    this.mapWrapper.on('move', () => {
      this.updateMapState()
    })

    this.mapWrapper.on('zoom', () => {
      this.updateMapState()
    })

    this.mapWrapper.on('error', (error: Error) => {
      this.handleError(error)
    })
  }

  /**
   * 设置UI事件监听器
   */
  private setupEventListeners(): void {
    // 缩放滑块
    this.elements.zoomSlider.addEventListener('input', (e) => {
      const zoom = Number((e.target as HTMLInputElement).value)
      if (this.mapWrapper?.map) {
        this.mapWrapper.map.setZoom(zoom)
      }
    })

    // 飞行到北京
    this.elements.flyToBeijing.addEventListener('click', () => {
      this.flyTo([116.404, 39.915], 12)
    })

    // 飞行到上海
    this.elements.flyToShanghai.addEventListener('click', () => {
      this.flyTo([121.473, 31.230], 12)
    })

    // 添加随机标记点
    this.elements.addRandomMarker.addEventListener('click', () => {
      this.addRandomMarker()
    })

    // 添加北京标记点
    this.elements.addBeijingMarker.addEventListener('click', () => {
      this.addBeijingMarker()
    })

    // 清除所有标记点
    this.elements.clearMarkers.addEventListener('click', () => {
      this.clearAllMarkers()
    })

    // 功能演示按钮
    this.elements.showRouting.addEventListener('click', () => {
      console.log('路径规划演示 - 功能开发中')
    })

    this.elements.showHeatmap.addEventListener('click', () => {
      console.log('热力图演示 - 功能开发中')
    })

    this.elements.showGeofence.addEventListener('click', () => {
      console.log('地理围栏演示 - 功能开发中')
    })
  }

  /**
   * 更新地图状态
   */
  private updateMapState(): void {
    if (!this.mapWrapper?.map) return

    this.state.center = this.mapWrapper.map.getCenter()
    this.state.zoom = this.mapWrapper.map.getZoom()
    this.updateUI()
  }

  /**
   * 飞行到指定位置
   */
  private async flyTo(center: [number, number], zoom: number): Promise<void> {
    if (!this.mapWrapper?.map) return

    try {
      await this.mapWrapper.map.flyTo({ center, zoom, duration: 1000 })
      this.state.center = center
      this.state.zoom = zoom
      this.updateUI()
    } catch (error) {
      console.error('飞行失败:', error)
    }
  }

  /**
   * 添加随机标记点
   */
  private addRandomMarker(): void {
    const randomLng = 116.404 + (Math.random() - 0.5) * 0.2
    const randomLat = 39.915 + (Math.random() - 0.5) * 0.2
    this.addMarkerAt([randomLng, randomLat], `随机标记点 ${this.state.markers.length + 1}`)
  }

  /**
   * 添加北京标记点
   */
  private addBeijingMarker(): void {
    this.addMarkerAt([116.404, 39.915], '北京市中心', '这里是北京市中心，中国的首都。')
  }

  /**
   * 在指定位置添加标记点
   */
  private addMarkerAt(lngLat: [number, number], title: string, description?: string): void {
    if (!this.mapWrapper?.map) return

    const marker: MarkerOptions = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lngLat,
      popup: {
        content: description ? `<h4>${title}</h4><p>${description}</p>` : title
      }
    }

    try {
      this.mapWrapper.map.addMarker(marker)
      this.state.markers.push(marker)
      this.updateUI()
    } catch (error) {
      console.error('添加标记点失败:', error)
    }
  }

  /**
   * 清除所有标记点
   */
  private clearAllMarkers(): void {
    if (!this.mapWrapper?.map) return

    this.state.markers.forEach(marker => {
      if (marker.id) {
        this.mapWrapper!.map!.removeMarker(marker.id)
      }
    })

    this.state.markers = []
    this.updateUI()
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.state.error = error
    this.state.isLoading = false
    this.updateUI()
    console.error('地图错误:', error)
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    // 更新状态文本
    this.elements.statusText.textContent = this.state.isInitialized 
      ? '已加载' 
      : this.state.isLoading 
        ? '加载中' 
        : '未加载'

    this.elements.centerText.textContent = `${this.state.center[0].toFixed(4)}, ${this.state.center[1].toFixed(4)}`
    this.elements.zoomText.textContent = this.state.zoom.toFixed(1)
    this.elements.markerCount.textContent = this.state.markers.length.toString()

    // 更新缩放滑块
    this.elements.zoomSlider.value = this.state.zoom.toString()

    // 更新按钮状态
    const isEnabled = this.state.isInitialized && !this.state.isLoading
    this.elements.zoomSlider.disabled = !isEnabled
    this.elements.flyToBeijing.disabled = !isEnabled
    this.elements.flyToShanghai.disabled = !isEnabled
    this.elements.addRandomMarker.disabled = !isEnabled
    this.elements.addBeijingMarker.disabled = !isEnabled
    this.elements.clearMarkers.disabled = !isEnabled || this.state.markers.length === 0
    this.elements.showRouting.disabled = !isEnabled
    this.elements.showHeatmap.disabled = !isEnabled
    this.elements.showGeofence.disabled = !isEnabled

    // 更新错误信息
    if (this.state.error) {
      this.elements.errorGroup.style.display = 'block'
      this.elements.errorText.textContent = this.state.error.message
    } else {
      this.elements.errorGroup.style.display = 'none'
    }
  }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  new MapApp()
})
