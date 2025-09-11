/**
 * LDesign地图React组件
 * 提供开箱即用的地图组件，支持完整的React生态集成
 */

import React, { useRef, useEffect, useCallback } from 'react'
import { useLDesignMap } from '../hooks/useLDesignMap'
import type { ReactMapProps } from '../types'
import './LDesignMapComponent.less'

/**
 * LDesign地图组件
 * 
 * @example
 * ```tsx
 * import React from 'react'
 * import { LDesignMapComponent } from '@ldesign/map/react'
 * 
 * function App() {
 *   const handleLoad = () => {
 *     console.log('地图加载完成')
 *   }
 * 
 *   const handleClick = (event) => {
 *     console.log('地图点击', event.lngLat)
 *   }
 * 
 *   return (
 *     <LDesignMapComponent
 *       options={{
 *         center: [116.404, 39.915],
 *         zoom: 10,
 *         accessToken: 'your-mapbox-token'
 *       }}
 *       markers={[
 *         {
 *           lngLat: [116.404, 39.915],
 *           popup: { content: '北京' }
 *         }
 *       ]}
 *       onLoad={handleLoad}
 *       onClick={handleClick}
 *       showDefaultControls
 *       showMapInfo
 *       height="500px"
 *     />
 *   )
 * }
 * ```
 */
export const LDesignMapComponent: React.FC<ReactMapProps> = ({
  options,
  markers = [],
  showDefaultControls = true,
  showMapInfo = false,
  height = '400px',
  width = '100%',
  className = '',
  style = {},
  onLoad,
  onClick,
  onMove,
  onZoom,
  onMarkerClick,
  onError,
  onUpdate,
  loadingContent,
  errorContent,
  controlsContent,
  infoContent
}) => {
  // 地图容器引用
  const mapContainer = useRef<HTMLDivElement>(null)

  // 使用地图Hook
  const mapInstance = useLDesignMap(mapContainer, options)

  const {
    map,
    isInitialized,
    isLoading,
    error,
    center,
    zoom,
    bearing,
    pitch,
    markers: currentMarkers,
    addMarker,
    removeMarker,
    clearMarkers
  } = mapInstance

  // 事件处理
  useEffect(() => {
    if (!map) return

    const handleMapLoad = () => onLoad?.()
    const handleMapClick = (event: any) => onClick?.(event)
    const handleMapMove = () => {
      onMove?.()
      onUpdate?.({ center, zoom, bearing, pitch })
    }
    const handleMapZoom = () => {
      onZoom?.()
      onUpdate?.({ center, zoom, bearing, pitch })
    }
    const handleMapError = (err: Error) => onError?.(err)

    // 注册事件监听器
    map.on('load', handleMapLoad)
    map.on('click', handleMapClick)
    map.on('move', handleMapMove)
    map.on('zoom', handleMapZoom)
    map.on('error', handleMapError)

    return () => {
      // 清理事件监听器
      map.off('load', handleMapLoad)
      map.off('click', handleMapClick)
      map.off('move', handleMapMove)
      map.off('zoom', handleMapZoom)
      map.off('error', handleMapError)
    }
  }, [map, onLoad, onClick, onMove, onZoom, onError, onUpdate, center, zoom, bearing, pitch])

  // 标记点同步
  useEffect(() => {
    if (!isInitialized) return

    // 清除现有标记点
    clearMarkers()

    // 添加新标记点
    markers.forEach(marker => {
      const id = addMarker(marker)
      
      // 如果有标记点点击事件，添加监听器
      if (onMarkerClick && map) {
        // 这里需要根据实际的标记点实现来添加点击事件
        // 暂时使用简化的实现
      }
    })
  }, [markers, isInitialized, addMarker, clearMarkers, onMarkerClick, map])

  // 控件方法
  const zoomIn = useCallback(() => {
    mapInstance.setZoom(zoom + 1)
  }, [mapInstance, zoom])

  const zoomOut = useCallback(() => {
    mapInstance.setZoom(zoom - 1)
  }, [mapInstance, zoom])

  const retry = useCallback(async () => {
    try {
      await mapInstance.initialize()
    } catch (err) {
      console.error('重试失败:', err)
    }
  }, [mapInstance])

  // 容器样式
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style
  }

  // 渲染加载状态
  const renderLoading = () => {
    if (loadingContent) {
      return loadingContent
    }

    return (
      <div className="ldesign-map-loading-overlay">
        <div className="ldesign-map-spinner" />
        <span className="ldesign-map-loading-text">地图加载中...</span>
      </div>
    )
  }

  // 渲染错误状态
  const renderError = () => {
    if (errorContent) {
      return errorContent(error!, retry)
    }

    return (
      <div className="ldesign-map-error-overlay">
        <div className="ldesign-map-error-content">
          <h3>地图加载失败</h3>
          <p>{error?.message}</p>
          <button onClick={retry} className="ldesign-map-retry-btn">
            重试
          </button>
        </div>
      </div>
    )
  }

  // 渲染控件
  const renderControls = () => {
    if (controlsContent) {
      return controlsContent(mapInstance)
    }

    if (!showDefaultControls) return null

    return (
      <div className="ldesign-map-default-controls">
        <button onClick={zoomIn} className="ldesign-map-control-btn">
          +
        </button>
        <button onClick={zoomOut} className="ldesign-map-control-btn">
          -
        </button>
      </div>
    )
  }

  // 渲染地图信息
  const renderInfo = () => {
    if (infoContent) {
      return infoContent({ center, zoom, bearing, pitch })
    }

    if (!showMapInfo) return null

    return (
      <div className="ldesign-map-info-content">
        <span>缩放: {zoom.toFixed(1)}</span>
        <span>中心: {center[0].toFixed(4)}, {center[1].toFixed(4)}</span>
      </div>
    )
  }

  return (
    <div
      className={`ldesign-map-container ${className} ${
        isLoading ? 'ldesign-map-loading' : ''
      } ${error ? 'ldesign-map-error' : ''}`}
      style={containerStyle}
    >
      {/* 地图容器 */}
      <div ref={mapContainer} className="ldesign-map-content" />

      {/* 加载状态 */}
      {isLoading && renderLoading()}

      {/* 错误状态 */}
      {error && renderError()}

      {/* 控件 */}
      {isInitialized && (
        <div className="ldesign-map-controls">
          {renderControls()}
        </div>
      )}

      {/* 地图信息 */}
      {isInitialized && showMapInfo && (
        <div className="ldesign-map-info">
          {renderInfo()}
        </div>
      )}
    </div>
  )
}

export default LDesignMapComponent
