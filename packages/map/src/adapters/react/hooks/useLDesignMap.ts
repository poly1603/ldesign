/**
 * React 地图Hook
 * 提供React的地图状态管理和操作方法
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { LDesignMap } from '../../../core/LDesignMap'
import type { ReactMapOptions, ReactMapInstance } from '../types'
import type { MapOptions, MarkerOptions, LngLat } from '../../../types'

/**
 * 使用LDesign地图的React Hook
 * 
 * @param container 地图容器的引用
 * @param options 地图配置选项
 * @returns 地图实例和相关状态
 * 
 * @example
 * ```tsx
 * import React, { useRef } from 'react'
 * import { useLDesignMap } from '@ldesign/map/react'
 * 
 * function MapComponent() {
 *   const mapContainer = useRef<HTMLDivElement>(null)
 *   
 *   const {
 *     map,
 *     isInitialized,
 *     isLoading,
 *     error,
 *     addMarker,
 *     flyTo
 *   } = useLDesignMap(mapContainer, {
 *     center: [116.404, 39.915],
 *     zoom: 10,
 *     accessToken: 'your-mapbox-token'
 *   })
 * 
 *   const handleAddMarker = () => {
 *     addMarker({
 *       lngLat: [116.404, 39.915],
 *       popup: { content: '标记点' }
 *     })
 *   }
 * 
 *   return (
 *     <div>
 *       <div ref={mapContainer} style={{ width: '100%', height: '400px' }} />
 *       <button onClick={handleAddMarker} disabled={!isInitialized}>
 *         添加标记点
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useLDesignMap(
  container: React.RefObject<HTMLElement>,
  options: ReactMapOptions
): ReactMapInstance {
  // 状态管理
  const [map, setMap] = useState<LDesignMap | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // 地图状态
  const [center, setCenter] = useState<LngLat>(options.center || [116.404, 39.915])
  const [zoom, setZoom] = useState(options.zoom || 10)
  const [bearing, setBearing] = useState(options.bearing || 0)
  const [pitch, setPitch] = useState(options.pitch || 0)
  
  // 标记点管理
  const [markers, setMarkers] = useState<MarkerOptions[]>([])
  const markerIds = useRef(new Map<string, MarkerOptions>())

  /**
   * 初始化地图
   */
  const initialize = useCallback(async (): Promise<void> => {
    if (isInitialized || isLoading || !container.current) return

    try {
      setIsLoading(true)
      setError(null)

      // 创建地图配置
      const mapOptions: MapOptions = {
        ...options,
        container: container.current
      }

      // 创建地图实例
      const mapInstance = new LDesignMap(mapOptions)
      await mapInstance.initialize()

      // 设置事件监听器
      setupEventListeners(mapInstance)

      setMap(mapInstance)
      setIsInitialized(true)
      
      // 同步初始状态
      syncMapState(mapInstance)
    } catch (err) {
      const mapError = err instanceof Error ? err : new Error('Failed to initialize map')
      setError(mapError)
      throw mapError
    } finally {
      setIsLoading(false)
    }
  }, [container, options, isInitialized, isLoading])

  /**
   * 销毁地图
   */
  const destroy = useCallback((): void => {
    if (map) {
      map.destroy()
      setMap(null)
    }
    setIsInitialized(false)
    setMarkers([])
    markerIds.current.clear()
  }, [map])

  /**
   * 飞行到指定位置
   */
  const flyTo = useCallback(async (flyOptions: {
    center?: LngLat
    zoom?: number
    bearing?: number
    pitch?: number
    duration?: number
  }): Promise<void> => {
    if (!map) throw new Error('Map not initialized')
    
    await map.flyTo({
      center: flyOptions.center || center,
      zoom: flyOptions.zoom || zoom,
      bearing: flyOptions.bearing || bearing,
      pitch: flyOptions.pitch || pitch,
      duration: flyOptions.duration || 1000
    })
  }, [map, center, zoom, bearing, pitch])

  /**
   * 添加标记点
   */
  const addMarker = useCallback((marker: MarkerOptions): string => {
    if (!map) throw new Error('Map not initialized')
    
    const id = map.addMarker(marker)
    const markerWithId = { ...marker, id }
    
    setMarkers(prev => [...prev, markerWithId])
    markerIds.current.set(id, markerWithId)
    
    return id
  }, [map])

  /**
   * 移除标记点
   */
  const removeMarker = useCallback((id: string): void => {
    if (!map) return
    
    map.removeMarker(id)
    setMarkers(prev => prev.filter(m => m.id !== id))
    markerIds.current.delete(id)
  }, [map])

  /**
   * 清除所有标记点
   */
  const clearMarkers = useCallback((): void => {
    if (!map) return
    
    markers.forEach(marker => {
      if (marker.id) {
        map.removeMarker(marker.id)
      }
    })
    
    setMarkers([])
    markerIds.current.clear()
  }, [map, markers])

  /**
   * 设置地图状态的方法
   */
  const setCenterState = useCallback((newCenter: LngLat): void => {
    if (map) {
      map.setCenter(newCenter)
      setCenter(newCenter)
    }
  }, [map])

  const setZoomState = useCallback((newZoom: number): void => {
    if (map) {
      map.setZoom(newZoom)
      setZoom(newZoom)
    }
  }, [map])

  const setBearingState = useCallback((newBearing: number): void => {
    if (map) {
      map.setBearing(newBearing)
      setBearing(newBearing)
    }
  }, [map])

  const setPitchState = useCallback((newPitch: number): void => {
    if (map) {
      map.setPitch(newPitch)
      setPitch(newPitch)
    }
  }, [map])

  /**
   * 设置事件监听器
   */
  const setupEventListeners = useCallback((mapInstance: LDesignMap): void => {
    // 地图移动事件
    mapInstance.on('move', () => {
      syncMapState(mapInstance)
    })

    // 地图缩放事件
    mapInstance.on('zoom', () => {
      syncMapState(mapInstance)
    })
  }, [])

  /**
   * 同步地图状态
   */
  const syncMapState = useCallback((mapInstance: LDesignMap): void => {
    setCenter(mapInstance.getCenter())
    setZoom(mapInstance.getZoom())
    setBearing(mapInstance.getBearing())
    setPitch(mapInstance.getPitch())
  }, [])

  // 自动初始化
  useEffect(() => {
    if (options.autoInit !== false && container.current && !isInitialized && !isLoading) {
      initialize().catch(console.error)
    }
  }, [container, options.autoInit, isInitialized, isLoading, initialize])

  // 清理
  useEffect(() => {
    return () => {
      destroy()
    }
  }, [destroy])

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
    clearMarkers,
    setCenter: setCenterState,
    setZoom: setZoomState,
    setBearing: setBearingState,
    setPitch: setPitchState
  }
}
