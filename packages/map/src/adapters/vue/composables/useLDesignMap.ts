/**
 * Vue 3 地图组合式API
 * 提供响应式的地图状态管理和操作方法
 */

import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { LDesignMap } from '../../../core/LDesignMap'
import type { VueMapOptions, VueMapInstance, VueMapEvents } from '../types'
import type { MapOptions, MarkerOptions, LngLat } from '../../../types'

/**
 * 使用LDesign地图的组合式API
 * 
 * @param container 地图容器的引用或选择器
 * @param options 地图配置选项
 * @param events 事件处理器
 * @returns 地图实例和相关状态
 * 
 * @example
 * ```vue
 * <template>
 *   <div ref="mapContainer" class="map-container"></div>
 *   <button @click="addRandomMarker">添加标记点</button>
 * </template>
 * 
 * <script setup>
 * import { ref } from 'vue'
 * import { useLDesignMap } from '@ldesign/map/vue'
 * 
 * const mapContainer = ref()
 * 
 * const { map, isInitialized, addMarker, flyTo } = useLDesignMap(
 *   mapContainer,
 *   {
 *     center: [116.404, 39.915],
 *     zoom: 10,
 *     accessToken: 'your-mapbox-token'
 *   },
 *   {
 *     onLoad: () => console.log('地图加载完成'),
 *     onClick: (event) => console.log('地图点击', event.lngLat)
 *   }
 * )
 * 
 * const addRandomMarker = () => {
 *   addMarker({
 *     lngLat: [116.404 + Math.random() * 0.1, 39.915 + Math.random() * 0.1],
 *     popup: { content: '随机标记点' }
 *   })
 * }
 * </script>
 * ```
 */
export function useLDesignMap(
  container: Ref<HTMLElement | null> | string,
  options: VueMapOptions,
  events?: VueMapEvents
): VueMapInstance {
  // 响应式状态
  const map = ref<LDesignMap | null>(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // 地图状态
  const center = ref<LngLat>(options.center || [116.404, 39.915])
  const zoom = ref(options.zoom || 10)
  const bearing = ref(options.bearing || 0)
  const pitch = ref(options.pitch || 0)
  
  // 标记点管理
  const markers = ref<MarkerOptions[]>([])
  const markerIds = new Map<string, MarkerOptions>()

  /**
   * 初始化地图
   */
  const initialize = async (): Promise<void> => {
    if (isInitialized.value || isLoading.value) return

    try {
      isLoading.value = true
      error.value = null

      // 获取容器元素
      const containerElement = typeof container === 'string' 
        ? document.querySelector(container) as HTMLElement
        : container.value

      if (!containerElement) {
        throw new Error('Map container not found')
      }

      // 创建地图配置
      const mapOptions: MapOptions = {
        ...options,
        container: containerElement
      }

      // 创建地图实例
      map.value = new LDesignMap(mapOptions)
      await map.value.initialize()

      // 设置事件监听器
      setupEventListeners()

      // 同步初始状态
      syncMapState()

      isInitialized.value = true
      events?.onLoad?.()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Failed to initialize map')
      events?.onError?.(error.value)
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 销毁地图
   */
  const destroy = (): void => {
    if (map.value) {
      map.value.destroy()
      map.value = null
    }
    isInitialized.value = false
    markers.value = []
    markerIds.clear()
  }

  /**
   * 飞行到指定位置
   */
  const flyTo = async (flyOptions: {
    center?: LngLat
    zoom?: number
    bearing?: number
    pitch?: number
    duration?: number
  }): Promise<void> => {
    if (!map.value) throw new Error('Map not initialized')
    
    await map.value.flyTo({
      center: flyOptions.center || center.value,
      zoom: flyOptions.zoom || zoom.value,
      bearing: flyOptions.bearing || bearing.value,
      pitch: flyOptions.pitch || pitch.value,
      duration: flyOptions.duration || 1000
    })
  }

  /**
   * 添加标记点
   */
  const addMarker = (marker: MarkerOptions): string => {
    if (!map.value) throw new Error('Map not initialized')
    
    const id = map.value.addMarker(marker)
    const markerWithId = { ...marker, id }
    
    markers.value.push(markerWithId)
    markerIds.set(id, markerWithId)
    
    return id
  }

  /**
   * 移除标记点
   */
  const removeMarker = (id: string): void => {
    if (!map.value) return
    
    map.value.removeMarker(id)
    markers.value = markers.value.filter(m => m.id !== id)
    markerIds.delete(id)
  }

  /**
   * 清除所有标记点
   */
  const clearMarkers = (): void => {
    if (!map.value) return
    
    markers.value.forEach(marker => {
      if (marker.id) {
        map.value!.removeMarker(marker.id)
      }
    })
    
    markers.value = []
    markerIds.clear()
  }

  /**
   * 设置事件监听器
   */
  const setupEventListeners = (): void => {
    if (!map.value) return

    // 地图点击事件
    map.value.on('click', (event: any) => {
      events?.onClick?.(event)
    })

    // 地图移动事件
    map.value.on('move', () => {
      syncMapState()
      events?.onMove?.()
    })

    // 地图缩放事件
    map.value.on('zoom', () => {
      syncMapState()
      events?.onZoom?.()
    })
  }

  /**
   * 同步地图状态
   */
  const syncMapState = (): void => {
    if (!map.value) return

    center.value = map.value.getCenter()
    zoom.value = map.value.getZoom()
    bearing.value = map.value.getBearing()
    pitch.value = map.value.getPitch()
  }

  // 监听响应式状态变化
  watch(center, (newCenter) => {
    if (map.value && options.reactive !== false) {
      map.value.setCenter(newCenter)
    }
  }, { deep: true })

  watch(zoom, (newZoom) => {
    if (map.value && options.reactive !== false) {
      map.value.setZoom(newZoom)
    }
  })

  watch(bearing, (newBearing) => {
    if (map.value && options.reactive !== false) {
      map.value.setBearing(newBearing)
    }
  })

  watch(pitch, (newPitch) => {
    if (map.value && options.reactive !== false) {
      map.value.setPitch(newPitch)
    }
  })

  // 自动初始化
  if (options.autoInit !== false) {
    onMounted(async () => {
      await nextTick()
      await initialize()
    })
  }

  // 自动清理
  onUnmounted(() => {
    destroy()
  })

  return {
    map,
    isInitialized,
    isLoading,
    error,
    center,
    zoom,
    bearing,
    pitch,
    markers,
    initialize,
    destroy,
    flyTo,
    addMarker,
    removeMarker,
    clearMarkers
  }
}
