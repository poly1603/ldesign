import React, { useState, useCallback } from 'react'
import { LDesignMapComponent } from '@ldesign/map/react'
import type { MarkerOptions } from '@ldesign/map'

/**
 * React示例应用
 * 展示LDesign地图插件在React中的完整功能
 */
function App() {
  // 地图配置
  const mapOptions = {
    center: [116.404, 39.915] as [number, number],
    zoom: 10,
    accessToken: 'pk.eyJ1IjoibGRlc2lnbiIsImEiOiJjbHpxeXl6ZXkwMGNzMmxzNjBxdGNxbzJxIn0.demo-token', // 请替换为真实的token
    style: 'streets',
    showNavigation: true,
    showScale: true,
    showFullscreen: true
  }

  // 状态管理
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [center, setCenter] = useState<[number, number]>([116.404, 39.915])
  const [zoom, setZoom] = useState(10)
  const [markers, setMarkers] = useState<MarkerOptions[]>([])

  // 事件处理器
  const handleMapLoad = useCallback(() => {
    setIsInitialized(true)
    setIsLoading(false)
    console.log('地图加载完成')
  }, [])

  const handleMapClick = useCallback((event: { lngLat: [number, number]; point: [number, number] }) => {
    console.log('地图点击:', event.lngLat)
    
    // 在点击位置添加标记点
    addMarkerAt(event.lngLat, `点击位置 (${event.lngLat[0].toFixed(4)}, ${event.lngLat[1].toFixed(4)})`)
  }, [])

  const handleMapUpdate = useCallback((state: { center: [number, number]; zoom: number; bearing: number; pitch: number }) => {
    setCenter(state.center)
    setZoom(state.zoom)
  }, [])

  const handleMapError = useCallback((err: Error) => {
    setError(err)
    setIsLoading(false)
    console.error('地图错误:', err)
  }, [])

  // 控制方法
  const flyToBeijing = useCallback(() => {
    setCenter([116.404, 39.915])
    setZoom(12)
  }, [])

  const flyToShanghai = useCallback(() => {
    setCenter([121.473, 31.230])
    setZoom(12)
  }, [])

  const addRandomMarker = useCallback(() => {
    const randomLng = 116.404 + (Math.random() - 0.5) * 0.2
    const randomLat = 39.915 + (Math.random() - 0.5) * 0.2
    addMarkerAt([randomLng, randomLat], `随机标记点 ${markers.length + 1}`)
  }, [markers.length])

  const addBeijingMarker = useCallback(() => {
    addMarkerAt([116.404, 39.915], '北京市中心', '这里是北京市中心，中国的首都。')
  }, [])

  const addMarkerAt = useCallback((lngLat: [number, number], title: string, description?: string) => {
    const marker: MarkerOptions = {
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lngLat,
      popup: {
        content: description ? `<h4>${title}</h4><p>${description}</p>` : title
      }
    }
    setMarkers(prev => [...prev, marker])
  }, [])

  const clearAllMarkers = useCallback(() => {
    setMarkers([])
  }, [])

  // 功能演示方法
  const showRouting = useCallback(() => {
    console.log('路径规划演示 - 功能开发中')
    // TODO: 实现路径规划演示
  }, [])

  const showHeatmap = useCallback(() => {
    console.log('热力图演示 - 功能开发中')
    // TODO: 实现热力图演示
  }, [])

  const showGeofence = useCallback(() => {
    console.log('地理围栏演示 - 功能开发中')
    // TODO: 实现地理围栏演示
  }, [])

  return (
    <div id="app">
      {/* 头部 */}
      <header className="header">
        <h1>LDesign Map React 示例</h1>
        <p>展示LDesign地图插件在React中的完整功能</p>
      </header>

      {/* 主体内容 */}
      <main className="main">
        {/* 侧边栏控制面板 */}
        <aside className="sidebar">
          {/* 地图状态 */}
          <div className="control-group">
            <h3>地图状态</h3>
            <div className="info-panel">
              <div className="info-item">
                <span>状态:</span>
                <span>{isInitialized ? '已加载' : isLoading ? '加载中' : '未加载'}</span>
              </div>
              <div className="info-item">
                <span>中心点:</span>
                <span>{center[0].toFixed(4)}, {center[1].toFixed(4)}</span>
              </div>
              <div className="info-item">
                <span>缩放级别:</span>
                <span>{zoom.toFixed(1)}</span>
              </div>
              <div className="info-item">
                <span>标记点数量:</span>
                <span>{markers.length}</span>
              </div>
            </div>
          </div>

          {/* 地图控制 */}
          <div className="control-group">
            <h3>地图控制</h3>
            <div className="control-item">
              <label>缩放级别</label>
              <input 
                type="range" 
                min="0" 
                max="20" 
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                disabled={!isInitialized}
              />
            </div>
            <div className="control-item">
              <button onClick={flyToBeijing} disabled={!isInitialized}>
                飞行到北京
              </button>
            </div>
            <div className="control-item">
              <button onClick={flyToShanghai} disabled={!isInitialized}>
                飞行到上海
              </button>
            </div>
          </div>

          {/* 标记点管理 */}
          <div className="control-group">
            <h3>标记点管理</h3>
            <div className="control-item">
              <button onClick={addRandomMarker} disabled={!isInitialized}>
                添加随机标记点
              </button>
            </div>
            <div className="control-item">
              <button onClick={addBeijingMarker} disabled={!isInitialized}>
                添加北京标记点
              </button>
            </div>
            <div className="control-item">
              <button onClick={clearAllMarkers} disabled={!isInitialized || markers.length === 0}>
                清除所有标记点
              </button>
            </div>
          </div>

          {/* 功能演示 */}
          <div className="control-group">
            <h3>功能演示</h3>
            <div className="control-item">
              <button onClick={showRouting} disabled={!isInitialized}>
                路径规划演示
              </button>
            </div>
            <div className="control-item">
              <button onClick={showHeatmap} disabled={!isInitialized}>
                热力图演示
              </button>
            </div>
            <div className="control-item">
              <button onClick={showGeofence} disabled={!isInitialized}>
                地理围栏演示
              </button>
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="control-group">
              <h3>错误信息</h3>
              <div className="info-panel" style={{ background: '#fee', color: '#c33' }}>
                {error.message}
              </div>
            </div>
          )}
        </aside>

        {/* 地图容器 */}
        <div className="map-container">
          <LDesignMapComponent
            options={mapOptions}
            markers={markers}
            showDefaultControls={true}
            showMapInfo={true}
            height="100%"
            onLoad={handleMapLoad}
            onClick={handleMapClick}
            onUpdate={handleMapUpdate}
            onError={handleMapError}
          />
        </div>
      </main>
    </div>
  )
}

export default App
