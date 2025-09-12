<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <h1>LDesign Map 高级演示</h1>
        <p>专业地图功能展示 - 配置面板 + 实时地图演示</p>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <div class="demo-container">
        <!-- 左侧配置面板 -->
        <div class="config-panel">
          <!-- 地图服务配置 -->
          <div class="config-section">
            <h3>🗺️ 地图服务</h3>

            <!-- 服务类别选择 -->
            <div class="service-categories">
              <button
                v-for="category in Object.values(MapServiceCategory)"
                :key="category"
                class="btn category-btn"
                :class="{ active: selectedCategory === category }"
                @click="selectedCategory = category"
              >
                {{ getCategoryName(category) }}
              </button>
            </div>

            <!-- 地图服务列表 -->
            <div class="service-list">
              <div
                v-for="service in getFilteredServices()"
                :key="service.id"
                class="service-item"
                :class="{
                  active: currentService?.id === service.id,
                  'requires-key': service.requiresApiKey && !apiKeys[service.id]
                }"
                @click="selectMapService(service)"
              >
                <div class="service-info">
                  <div class="service-name">{{ service.name }}</div>
                  <div class="service-description">{{ service.description }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 地图控制 -->
          <div class="config-section">
            <h3>🎮 地图控制</h3>
            <div class="control-group">
              <button
                class="btn primary"
                @click="initializeMap"
                :disabled="mapInitialized"
              >
                {{ mapInitialized ? '✅ 地图已初始化' : '🚀 初始化地图' }}
              </button>
            </div>
          </div>

          <!-- 高级功能 -->
          <div class="config-section">
            <h3>⚡ 高级功能</h3>

            <!-- 标记管理 -->
            <div class="feature-group">
              <h4>📍 标记管理</h4>
              <div class="control-group">
                <button class="btn" @click="addRandomMarker" :disabled="!mapInitialized">
                  添加随机标记
                </button>
                <button class="btn" @click="clearMarkers" :disabled="!mapInitialized">
                  清除标记
                </button>
              </div>
            </div>

            <!-- 路径动画 -->
            <div class="feature-group">
              <h4>🛣️ 路径动画</h4>
              <div class="control-group">
                <button class="btn" @click="showRouteAnimation" :disabled="!mapInitialized">
                  显示路径动画
                </button>
                <button class="btn" @click="clearRoute" :disabled="!mapInitialized">
                  清除路径
                </button>
              </div>
            </div>

            <!-- 范围展示 -->
            <div class="feature-group">
              <h4>📐 范围展示</h4>
              <div class="control-group">
                <button class="btn" @click="showBounds" :disabled="!mapInitialized">
                  显示边界范围
                </button>
                <button class="btn" @click="fitToBounds" :disabled="!mapInitialized">
                  适应范围
                </button>
              </div>
            </div>

            <!-- GeoJSON -->
            <div class="feature-group">
              <h4>🌍 GeoJSON</h4>
              <div class="control-group">
                <button class="btn" @click="loadGeoJSON" :disabled="!mapInitialized">
                  加载 GeoJSON
                </button>
                <button class="btn" @click="clearGeoJSON" :disabled="!mapInitialized">
                  清除 GeoJSON
                </button>
              </div>
            </div>

            <!-- 主题切换 -->
            <div class="feature-group">
              <h4>🎨 主题切换</h4>
              <div class="control-group">
                <button class="btn" @click="setTheme('default')" :disabled="!mapInitialized">
                  默认主题
                </button>
                <button class="btn" @click="setTheme('dark')" :disabled="!mapInitialized">
                  深色主题
                </button>
              </div>
            </div>

          <!-- 测量工具 -->
          <div class="feature-group">
            <h4>📏 测量工具</h4>
            <div class="control-group">
              <button class="btn" @click="startDistanceMeasure" :disabled="!mapInitialized">
                测量距离
              </button>
              <button class="btn" @click="startAreaMeasure" :disabled="!mapInitialized">
                测量面积
              </button>
              <button class="btn" @click="clearMeasurements" :disabled="!mapInitialized">
                清除测量
              </button>
            </div>
          </div>

          <!-- 地图工具 -->
          <div class="feature-group">
            <h4>🛠️ 地图工具</h4>
            <div class="control-group">
              <button class="btn" @click="exportMapImage" :disabled="!mapInitialized">
                导出图片
              </button>
              <button class="btn" @click="printMap" :disabled="!mapInitialized">
                打印地图
              </button>
              <button class="btn" @click="shareLocation" :disabled="!mapInitialized">
                分享位置
              </button>
            </div>
          </div>
          </div>

          <!-- 地图状态 -->
          <div class="config-section">
            <h3>📊 地图状态</h3>
            <div class="status-grid">
              <div class="status-item">
                <label>初始化:</label>
                <span :class="['status-value', mapInitialized ? 'success' : 'pending']">
                  {{ mapInitialized ? '已初始化' : '未初始化' }}
                </span>
              </div>
              <div class="status-item">
                <label>图层数:</label>
                <span class="status-value">{{ layerCount }}</span>
              </div>
              <div class="status-item">
                <label>标记数:</label>
                <span class="status-value">{{ markerCount }}</span>
              </div>
              <div class="status-item">
                <label>当前主题:</label>
                <span class="status-value">{{ currentTheme }}</span>
              </div>
            </div>
          </div>

          <!-- 操作日志 -->
          <div class="config-section">
            <h3>📝 操作日志</h3>
            <div class="log-container">
              <div
                v-for="log in logs.slice(-10)"
                :key="log.time + log.message"
                class="log-entry"
                :class="log.type"
              >
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧地图展示 -->
        <div class="map-display">
          <div class="map-header">
            <h3>🗺️ 地图展示区域</h3>
            <div class="map-info">
              <span v-if="currentService">当前服务: {{ currentService.name }}</span>
              <span v-else>请选择地图服务</span>
            </div>
          </div>

          <div
            ref="mapContainer"
            class="map-container"
            :class="{ 'map-initialized': mapInitialized }"
          >
            <div v-if="!mapInitialized" class="map-placeholder">
              <div class="placeholder-content">
                <h4>🗺️ 地图容器</h4>
                <p>正在自动初始化地图...</p>
                <small>支持多种地图服务和高级功能</small>
              </div>
            </div>

            <!-- 地图加载指示器 -->
            <div v-if="mapInitialized && isLoading" class="map-loading">
              <div class="loading-spinner"></div>
              <p>地图加载中...</p>
            </div>

            <!-- 地图控件 -->
            <div v-if="mapInitialized" class="map-controls">
              <div class="map-control-group">
                <button class="map-control-btn" @click="zoomIn" title="放大">
                  <span>+</span>
                </button>
                <button class="map-control-btn" @click="zoomOut" title="缩小">
                  <span>-</span>
                </button>
                <button class="map-control-btn" @click="resetView" title="重置视图">
                  <span>⌂</span>
                </button>
                <button class="map-control-btn" @click="toggleFullscreen" title="全屏">
                  <span>⛶</span>
                </button>
              </div>
            </div>

            <!-- 地图信息面板 -->
            <div v-if="mapInitialized" class="map-info-panel">
              <div class="info-item">
                <span>缩放: {{ currentZoom }}</span>
              </div>
              <div class="info-item">
                <span>中心: {{ currentCenter[0].toFixed(3) }}, {{ currentCenter[1].toFixed(3) }}</span>
              </div>
              <div class="info-item">
                <span>鼠标: {{ mousePosition[0].toFixed(3) }}, {{ mousePosition[1].toFixed(3) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import {
  LDesignMap,
  LayerType,
  MAP_SERVICES,
  MapServiceCategory,
  MapServiceProvider,
  getAllServices,
  getServicesByCategory,
  getServiceById,
  createLayerConfigWithApiKey
} from '@ldesign/map'
import type { MapServiceInfo } from '@ldesign/map'

// 响应式数据
const mapContainer = ref<HTMLElement>()
const mapInitialized = ref(false)
const layerCount = ref(0)
const markerCount = ref(0)
const currentTheme = ref('default')
const isLoading = ref(false)
const currentZoom = ref(10)
const currentCenter = ref([116.404, 39.915])
const mousePosition = ref([0, 0])
const isFullscreen = ref(false)
const isMeasuring = ref(false)
const measurementType = ref<'distance' | 'area' | null>(null)

// 地图实例
let map: LDesignMap | null = null

// 地图服务相关状态
const availableServices = ref<MapServiceInfo[]>(getAllServices())
const currentService = ref<MapServiceInfo | null>(null)
const selectedCategory = ref<MapServiceCategory>(MapServiceCategory.STREET)
const apiKeys = ref<Record<string, string>>({})
const showApiKeyDialog = ref(false)
const pendingService = ref<MapServiceInfo | null>(null)

// 日志系统
interface LogEntry {
  time: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning'
}

const logs = ref<LogEntry[]>([])

// 高级功能状态
const routeAnimationActive = ref(false)
const geoJsonLoaded = ref(false)
const boundsVisible = ref(false)
const markers = ref<any[]>([])

// 示例数据
const sampleGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: '北京市',
        population: 21540000
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.20, 39.78],
          [116.58, 39.78],
          [116.58, 40.18],
          [116.20, 40.18],
          [116.20, 39.78]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        name: '上海市',
        population: 24280000
      },
      geometry: {
        type: 'Point',
        coordinates: [121.4737, 31.2304]
      }
    }
  ]
}

const sampleRoute = [
  [116.404, 39.915], // 北京
  [116.407, 39.918],
  [116.410, 39.920],
  [116.415, 39.925],
  [116.420, 39.930],
  [116.425, 39.935],
  [116.430, 39.940]
]

// 添加日志
const addLog = (message: string, type: LogEntry['type'] = 'info') => {
  const time = new Date().toLocaleTimeString()
  logs.value.push({ time, message, type })
  
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value.shift()
  }
  
  console.log(`[${type.toUpperCase()}] ${message}`)
}

// 更新状态
const updateStatus = () => {
  if (map) {
    try {
      layerCount.value = map.getLayerManager().getAllLayers().length
      markerCount.value = map.getMarkerManager().getAllMarkers().length
      currentTheme.value = map.getStyleManager().getCurrentTheme()
    } catch (error) {
      console.warn('更新状态时出错:', error)
    }
  }
}

// 地图操作方法（真实实现）
const initializeMap = async () => {
  if (mapInitialized.value) {
    return
  }

  addLog('开始初始化真实地图...', 'info')

  try {
    // 等待 DOM 完全渲染
    await nextTick()

    // 检查容器元素是否存在
    if (!mapContainer.value) {
      addLog('地图容器元素不存在', 'error')
      return
    }

    addLog(`容器元素类型: ${mapContainer.value.constructor.name}`, 'info')
    addLog(`容器元素尺寸: ${mapContainer.value.offsetWidth}x${mapContainer.value.offsetHeight}`, 'info')
    addLog(`容器元素详细信息: nodeType=${mapContainer.value.nodeType}, tagName=${mapContainer.value.tagName}`, 'info')

    // 详细检查容器元素
    console.log('Vue 组件中的容器元素详细信息:', {
      element: mapContainer.value,
      nodeType: mapContainer.value.nodeType,
      tagName: mapContainer.value.tagName,
      isElement: mapContainer.value instanceof HTMLElement,
      isNode: mapContainer.value instanceof Node,
      constructor: mapContainer.value.constructor.name
    })

    // 确保容器元素有尺寸
    if (!mapContainer.value.offsetWidth || !mapContainer.value.offsetHeight) {
      addLog('地图容器尺寸无效，设置默认尺寸', 'warning')
      mapContainer.value.style.width = '100%'
      mapContainer.value.style.height = '500px'
      mapContainer.value.style.minHeight = '500px'

      // 强制重新计算尺寸
      await new Promise(resolve => setTimeout(resolve, 100))
      addLog(`设置后容器尺寸: ${mapContainer.value.offsetWidth}x${mapContainer.value.offsetHeight}`, 'info')
    }

    // 创建真实的 LDesignMap 实例
    addLog('创建 LDesignMap 实例...', 'info')
    isLoading.value = true

    map = new LDesignMap({
      container: mapContainer.value,
      center: [116.404, 39.915], // 北京坐标
      zoom: 10,
      theme: 'default'
    })

    // 设置地图事件监听
    setupMapEventListeners()

    // 等待地图初始化完成
    await new Promise(resolve => setTimeout(resolve, 1000))
    isLoading.value = false

    // 自动选择默认地图服务
    const defaultService = getServiceById('osm-standard')
    if (defaultService) {
      currentService.value = defaultService
      await switchToMapService(defaultService)
    }

    mapInitialized.value = true

    // 强制更新地图尺寸
    setTimeout(() => {
      if (map && map.getOLMap) {
        try {
          map.getOLMap().updateSize()
          addLog('地图尺寸已更新', 'info')
        } catch (error) {
          console.warn('更新地图尺寸失败:', error)
        }
      }
    }, 100)

    updateStatus()
    addLog('真实地图初始化成功！', 'success')
  } catch (error) {
    addLog(`地图初始化失败: ${error}`, 'error')
    console.error('地图初始化错误:', error)
    isLoading.value = false
  }
}

// 设置地图事件监听
const setupMapEventListeners = () => {
  if (!map) return

  try {
    const olMap = map.getOLMap()
    if (!olMap) return

    // 监听地图移动事件
    olMap.on('moveend', () => {
      const view = olMap.getView()
      currentZoom.value = Math.round(view.getZoom() || 10)
      const center = view.getCenter()
      if (center) {
        currentCenter.value = [center[0], center[1]]
      }
    })

    // 监听鼠标移动事件
    olMap.on('pointermove', (event) => {
      const coordinate = event.coordinate
      if (coordinate) {
        mousePosition.value = [coordinate[0], coordinate[1]]
      }
    })

    // 监听地图点击事件
    olMap.on('click', (event) => {
      const coordinate = event.coordinate
      if (coordinate) {
        addLog(`地图点击: ${coordinate[0].toFixed(3)}, ${coordinate[1].toFixed(3)}`, 'info')
      }
    })

    addLog('地图事件监听已设置', 'info')
  } catch (error) {
    console.warn('设置地图事件监听失败:', error)
  }
}

// 地图控制功能
const zoomIn = () => {
  if (!map) return
  try {
    const olMap = map.getOLMap()
    const view = olMap.getView()
    const currentZoom = view.getZoom()
    view.setZoom((currentZoom || 10) + 1)
    addLog('地图放大', 'info')
  } catch (error) {
    addLog(`放大失败: ${error}`, 'error')
  }
}

const zoomOut = () => {
  if (!map) return
  try {
    const olMap = map.getOLMap()
    const view = olMap.getView()
    const currentZoom = view.getZoom()
    view.setZoom((currentZoom || 10) - 1)
    addLog('地图缩小', 'info')
  } catch (error) {
    addLog(`缩小失败: ${error}`, 'error')
  }
}

const resetView = () => {
  if (!map) return
  try {
    const olMap = map.getOLMap()
    const view = olMap.getView()
    view.setCenter([116.404, 39.915])
    view.setZoom(10)
    addLog('视图已重置', 'info')
  } catch (error) {
    addLog(`重置视图失败: ${error}`, 'error')
  }
}

const toggleFullscreen = () => {
  if (!mapContainer.value) return

  try {
    if (!isFullscreen.value) {
      if (mapContainer.value.requestFullscreen) {
        mapContainer.value.requestFullscreen()
        isFullscreen.value = true
        addLog('进入全屏模式', 'info')
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        isFullscreen.value = false
        addLog('退出全屏模式', 'info')
      }
    }
  } catch (error) {
    addLog(`全屏切换失败: ${error}`, 'error')
  }
}

// 地图服务相关方法
const getCategoryName = (category: MapServiceCategory): string => {
  const names = {
    [MapServiceCategory.STREET]: '街道地图',
    [MapServiceCategory.SATELLITE]: '卫星地图',
    [MapServiceCategory.TERRAIN]: '地形地图',
    [MapServiceCategory.HYBRID]: '混合地图',
    [MapServiceCategory.CHINA]: '中国地图'
  }
  return names[category] || category
}

const getProviderName = (provider: MapServiceProvider): string => {
  const names = {
    [MapServiceProvider.OSM]: 'OpenStreetMap',
    [MapServiceProvider.GOOGLE]: 'Google Maps',
    [MapServiceProvider.BING]: 'Bing Maps',
    [MapServiceProvider.TIANDITU]: '天地图',
    [MapServiceProvider.AMAP]: '高德地图',
    [MapServiceProvider.BAIDU]: '百度地图',
    [MapServiceProvider.CARTODB]: 'CartoDB',
    [MapServiceProvider.STAMEN]: 'Stamen'
  }
  return names[provider] || provider
}

const getFilteredServices = (): MapServiceInfo[] => {
  return getServicesByCategory(selectedCategory.value)
}

const selectMapService = async (service: MapServiceInfo) => {
  if (!mapInitialized.value) {
    addLog('请先初始化地图', 'error')
    return
  }

  if (service.requiresApiKey && !apiKeys.value[service.id]) {
    // 需要 API Key 但没有提供
    pendingService.value = service
    showApiKeyDialog.value = true
    return
  }

  await switchToMapService(service)
}

const switchToMapService = async (service: MapServiceInfo) => {
  if (!map) {
    addLog('地图未初始化', 'error')
    return
  }

  addLog(`切换到 ${service.name}...`, 'info')

  try {
    // 清除现有图层
    map.getLayerManager().clearLayers()

    // 创建图层配置
    let layerConfig = service.layerConfig
    if (service.requiresApiKey && apiKeys.value[service.id]) {
      layerConfig = createLayerConfigWithApiKey(service.id, apiKeys.value[service.id])
      if (!layerConfig) {
        throw new Error('无法创建图层配置')
      }
    }

    // 添加新图层
    await map.getLayerManager().addLayer(layerConfig)

    currentService.value = service
    updateStatus()
    addLog(`成功切换到 ${service.name}`, 'success')
  } catch (error) {
    addLog(`切换地图服务失败: ${error}`, 'error')
    console.error('切换地图服务错误:', error)
  }
}

const addOSMLayer = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }
  
  addLog('添加 OSM 图层...', 'info')
  
  try {
    // 使用真实的图层管理器添加 OSM 图层
    await map.getLayerManager().addLayer({
      id: 'osm',
      name: 'OpenStreetMap',
      type: LayerType.OSM,
      visible: true
    })
    
    updateStatus()
    addLog('OSM 图层添加成功', 'success')
  } catch (error) {
    addLog(`添加图层失败: ${error}`, 'error')
    console.error('添加图层错误:', error)
  }
}

const addMarker = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }
  
  addLog('添加标记点...', 'info')
  
  try {
    // 使用真实的标记管理器添加标记
    map.getMarkerManager().addMarker({
      id: `marker-${Date.now()}`,
      coordinate: [116.404, 39.915],
      title: '北京',
      description: '中华人民共和国首都',
      popup: {
        content: '<h3>北京</h3><p>中华人民共和国首都</p>'
      }
    })
    
    updateStatus()
    addLog('标记点添加成功', 'success')
  } catch (error) {
    addLog(`添加标记失败: ${error}`, 'error')
    console.error('添加标记错误:', error)
  }
}

const addControls = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }
  
  addLog('添加地图控件...', 'info')
  
  try {
    // 使用真实的控件管理器添加控件
    map.getControlManager().addDefaultControls()
    
    addLog('地图控件添加成功', 'success')
  } catch (error) {
    addLog(`添加控件失败: ${error}`, 'error')
    console.error('添加控件错误:', error)
  }
}

// 高级功能方法
const addRandomMarker = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('添加随机标记...', 'info')

  try {
    // 生成随机坐标
    const centerLon = 116.404
    const centerLat = 39.915
    const radius = 0.05

    const randomLon = centerLon + (Math.random() - 0.5) * radius * 2
    const randomLat = centerLat + (Math.random() - 0.5) * radius * 2

    const markerId = `random-marker-${Date.now()}`

    // 使用标记管理器添加标记
    map.getMarkerManager().addMarker({
      id: markerId,
      coordinate: [randomLon, randomLat],
      title: `随机标记 ${markers.value.length + 1}`,
      description: `坐标: ${randomLon.toFixed(4)}, ${randomLat.toFixed(4)}`
    })

    markers.value.push({ id: markerId })

    updateStatus()
    addLog(`随机标记添加成功，ID: ${markerId}`, 'success')
  } catch (error) {
    addLog(`添加随机标记失败: ${error}`, 'error')
    console.error('添加随机标记错误:', error)
  }
}

const clearMarkers = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('清除所有标记...', 'info')

  try {
    map.getMarkerManager().clearMarkers()
    markers.value = []

    updateStatus()
    addLog('所有标记已清除', 'success')
  } catch (error) {
    addLog(`清除标记失败: ${error}`, 'error')
    console.error('清除标记错误:', error)
  }
}

const showRouteAnimation = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  if (routeAnimationActive.value) {
    addLog('路径动画已在运行中', 'warning')
    return
  }

  addLog('开始路径动画演示...', 'info')
  routeAnimationActive.value = true

  try {
    // 清除之前的路径
    try {
      map.getLayerManager().removeLayer('route-animation')
    } catch (e) {
      // 忽略删除不存在图层的错误
    }

    // 创建动画路径数据
    const animatedCoordinates: number[][] = []

    // 逐步添加路径点，创建动画效果
    for (let i = 0; i < sampleRoute.length; i++) {
      animatedCoordinates.push(sampleRoute[i])

      // 使用便捷方法添加当前路径段
      map.addRoute({
        id: 'route-animation',
        name: '路径动画',
        coordinates: [...animatedCoordinates],
        style: {
          stroke: {
            color: '#722ED1',
            width: 4
          }
        }
      })

      // 添加路径点标记
      if (i > 0) {
        const pointId = `route-point-${i}`
        map.getMarkerManager().addMarker({
          id: pointId,
          coordinate: sampleRoute[i],
          title: `路径点 ${i}`,
          description: `坐标: ${sampleRoute[i][0].toFixed(3)}, ${sampleRoute[i][1].toFixed(3)}`
        })
      }

      await new Promise(resolve => setTimeout(resolve, 800))
      addLog(`显示路径段 ${i + 1}/${sampleRoute.length}`, 'info')
    }

    // 自动调整视图到路径范围
    setTimeout(() => {
      if (map) {
        const bounds = [
          Math.min(...sampleRoute.map(p => p[0])) - 0.01,
          Math.min(...sampleRoute.map(p => p[1])) - 0.01,
          Math.max(...sampleRoute.map(p => p[0])) + 0.01,
          Math.max(...sampleRoute.map(p => p[1])) + 0.01
        ]
        map.fitToBounds(bounds)
        addLog('视图已调整到路径范围', 'info')
      }
    }, 500)

    addLog('路径动画演示完成', 'success')
  } catch (error) {
    addLog(`路径动画失败: ${error}`, 'error')
    console.error('路径动画错误:', error)
  } finally {
    routeAnimationActive.value = false
  }
}

const clearRoute = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('清除路径...', 'info')

  try {
    // 移除路径图层
    try {
      map.getLayerManager().removeLayer('route-animation')
    } catch (e) {
      // 忽略删除不存在图层的错误
    }

    // 清除路径点标记
    for (let i = 1; i < sampleRoute.length; i++) {
      try {
        map.getMarkerManager().removeMarker(`route-point-${i}`)
      } catch (e) {
        // 忽略删除不存在标记的错误
      }
    }

    routeAnimationActive.value = false
    updateStatus()

    addLog('路径和标记已清除', 'success')
  } catch (error) {
    addLog(`清除路径失败: ${error}`, 'error')
    console.error('清除路径错误:', error)
  }
}

const showBounds = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('显示边界范围...', 'info')

  try {
    // 定义北京市边界范围
    const bounds = [116.20, 39.78, 116.58, 40.18] // [minX, minY, maxX, maxY]

    // 使用便捷方法显示边界
    map.showBounds({
      id: 'bounds-display',
      name: '边界范围',
      bounds: bounds,
      style: {
        stroke: {
          color: '#ff4d4f',
          width: 2,
          lineDash: [5, 5]
        },
        fill: {
          color: 'rgba(255, 77, 79, 0.1)'
        }
      }
    })

    boundsVisible.value = true
    addLog(`边界范围已显示: ${bounds.join(', ')}`, 'success')
  } catch (error) {
    addLog(`显示边界失败: ${error}`, 'error')
    console.error('显示边界错误:', error)
  }
}

const fitToBounds = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('适应到边界范围...', 'info')

  try {
    // 适应到北京市范围
    const bounds = [116.20, 39.78, 116.58, 40.18]

    // 使用便捷方法适应范围
    map.fitToBounds(bounds, {
      padding: [20, 20, 20, 20],
      duration: 1000
    })

    addLog(`地图已适应到范围: ${bounds.join(', ')}`, 'success')
  } catch (error) {
    addLog(`适应范围失败: ${error}`, 'error')
    console.error('适应范围错误:', error)
  }
}

const setTheme = async (theme: string) => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }
  
  addLog(`切换到 ${theme} 主题...`, 'info')
  
  try {
    // 使用真实的样式管理器切换主题
    map.getStyleManager().setTheme(theme)
    
    updateStatus()
    addLog(`主题切换到 ${theme} 成功`, 'success')
  } catch (error) {
    addLog(`主题切换失败: ${error}`, 'error')
    console.error('主题切换错误:', error)
  }
}

const loadGeoJSON = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  if (geoJsonLoaded.value) {
    addLog('GeoJSON 已加载', 'warning')
    return
  }

  addLog('加载 GeoJSON 数据...', 'info')

  try {
    // 使用便捷方法加载 GeoJSON
    map.loadGeoJSON({
      id: 'geojson-layer',
      name: 'GeoJSON 数据',
      data: sampleGeoJSON,
      style: {
        stroke: {
          color: '#52c41a',
          width: 2
        },
        fill: {
          color: 'rgba(82, 196, 26, 0.2)'
        },
        circle: {
          radius: 8,
          fill: {
            color: '#52c41a'
          },
          stroke: {
            color: '#ffffff',
            width: 2
          }
        }
      }
    })

    geoJsonLoaded.value = true

    // 添加 GeoJSON 要素的标记
    sampleGeoJSON.features.forEach((feature, index) => {
      if (feature.geometry.type === 'Point') {
        const coords = feature.geometry.coordinates
        map?.getMarkerManager().addMarker({
          id: `geojson-marker-${index}`,
          coordinate: coords,
          title: feature.properties.name,
          description: `人口: ${feature.properties.population?.toLocaleString()}`,
          popup: {
            content: `<h3>${feature.properties.name}</h3><p>人口: ${feature.properties.population?.toLocaleString()}</p>`
          }
        })
      }
    })

    updateStatus()
    addLog(`GeoJSON 数据加载成功，包含 ${sampleGeoJSON.features.length} 个要素`, 'success')
  } catch (error) {
    addLog(`加载 GeoJSON 失败: ${error}`, 'error')
    console.error('加载 GeoJSON 错误:', error)
  }
}

const clearGeoJSON = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  if (!geoJsonLoaded.value) {
    addLog('没有 GeoJSON 数据需要清除', 'warning')
    return
  }

  addLog('清除 GeoJSON 数据...', 'info')

  try {
    // 移除 GeoJSON 图层
    map.getLayerManager().removeLayer('geojson-layer')

    // 移除相关标记
    sampleGeoJSON.features.forEach((feature, index) => {
      if (feature.geometry.type === 'Point') {
        map?.getMarkerManager().removeMarker(`geojson-marker-${index}`)
      }
    })

    geoJsonLoaded.value = false
    updateStatus()
    addLog('GeoJSON 数据已清除', 'success')
  } catch (error) {
    addLog(`清除 GeoJSON 失败: ${error}`, 'error')
    console.error('清除 GeoJSON 错误:', error)
  }
}

const clearMap = async () => {
  if (!map) {
    addLog('地图未初始化', 'error')
    return
  }
  
  addLog('清空地图...', 'info')
  
  try {
    // 使用真实的管理器清空地图
    map.getLayerManager().clearLayers()
    map.getMarkerManager().clearMarkers()
    
    updateStatus()
    addLog('地图清空完成', 'success')
  } catch (error) {
    addLog(`清空地图失败: ${error}`, 'error')
    console.error('清空地图错误:', error)
  }
}

// 组件挂载时的初始化
onMounted(async () => {
  addLog('Vue 真实地图演示页面加载完成', 'info')
  addLog('当前版本: 1.0.0 (真实地图版)', 'info')
  addLog('基于 Vue 3 + OpenLayers + LDesignMap', 'info')

  // 等待 DOM 渲染完成后自动初始化地图
  await nextTick()
  setTimeout(() => {
    addLog('自动初始化地图...', 'info')
    initializeMap()
  }, 500)
})

// 组件卸载时清理
onUnmounted(() => {
  if (map) {
    try {
      map.destroy()
      addLog('地图实例已销毁', 'info')
    } catch (error) {
      console.error('销毁地图时出错:', error)
    }
  }
})

// 测量工具功能
const startDistanceMeasure = () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('开始距离测量...', 'info')
  isMeasuring.value = true
  measurementType.value = 'distance'

  try {
    addLog('点击地图上的两点来测量距离', 'info')
    addLog('测量功能已激活，请在地图上操作', 'success')
  } catch (error) {
    addLog(`启动距离测量失败: ${error}`, 'error')
    isMeasuring.value = false
    measurementType.value = null
  }
}

const startAreaMeasure = () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('开始面积测量...', 'info')
  isMeasuring.value = true
  measurementType.value = 'area'

  try {
    addLog('点击地图绘制多边形来测量面积', 'info')
    addLog('测量功能已激活，请在地图上操作', 'success')
  } catch (error) {
    addLog(`启动面积测量失败: ${error}`, 'error')
    isMeasuring.value = false
    measurementType.value = null
  }
}

const clearMeasurements = () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('清除测量结果...', 'info')

  try {
    try {
      map.getLayerManager().removeLayer('measurement-layer')
    } catch (e) {
      // 忽略删除不存在图层的错误
    }

    isMeasuring.value = false
    measurementType.value = null
    addLog('测量结果已清除', 'success')
  } catch (error) {
    addLog(`清除测量失败: ${error}`, 'error')
  }
}

// 地图工具功能
const exportMapImage = async () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('导出地图图片...', 'info')

  try {
    const olMap = map.getOLMap()
    if (!olMap) {
      throw new Error('无法获取地图实例')
    }

    olMap.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas')
      const size = olMap.getSize()
      if (!size) return

      mapCanvas.width = size[0]
      mapCanvas.height = size[1]
      const mapContext = mapCanvas.getContext('2d')
      if (!mapContext) return

      const canvases = olMap.getViewport().querySelectorAll('canvas')
      canvases.forEach((canvas) => {
        if (canvas.width > 0) {
          const opacity = canvas.parentElement?.style.opacity || '1'
          mapContext.globalAlpha = parseFloat(opacity)
          mapContext.drawImage(canvas, 0, 0)
        }
      })

      mapCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `map-export-${new Date().getTime()}.png`
          link.click()
          URL.revokeObjectURL(url)
          addLog('地图图片导出成功', 'success')
        }
      })
    })

    olMap.renderSync()
  } catch (error) {
    addLog(`导出图片失败: ${error}`, 'error')
  }
}

const printMap = () => {
  addLog('打印功能已激活', 'info')
  window.print()
}

const shareLocation = () => {
  if (!map) {
    addLog('请先初始化地图', 'error')
    return
  }

  addLog('生成位置分享链接...', 'info')

  try {
    const center = currentCenter.value
    const zoom = currentZoom.value

    const shareUrl = `${window.location.origin}${window.location.pathname}?center=${center[0].toFixed(6)},${center[1].toFixed(6)}&zoom=${zoom}`

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        addLog('位置链接已复制到剪贴板', 'success')
      }).catch(() => {
        fallbackCopyToClipboard(shareUrl)
      })
    } else {
      fallbackCopyToClipboard(shareUrl)
    }
  } catch (error) {
    addLog(`分享位置失败: ${error}`, 'error')
  }
}

const fallbackCopyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea')
  textArea.value = text
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
    addLog('位置链接已复制到剪贴板', 'success')
  } catch (err) {
    addLog('复制失败，请手动复制链接', 'warning')
    console.log('分享链接:', text)
  }

  document.body.removeChild(textArea)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: grid;
  grid-template-row: auto 1fr;
  height: 100vh;
  overflow: hidden;
}

.header {
  background: linear-gradient(135deg, #722ED1, #9254DE);
  color: white;
  text-align: center;
  display: flex;
  flex-direction:row;
}

.header .container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex: 1;
  gap: 10px;
  padding: 24px 16px;
}

.header h1 {
  font-size: 22px;
  margin: 0;
  font-weight: 600;
}

.header p {
  opacity: 0.9;
  font-size: 14px;
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.main {
  padding: 16px;
  overflow: hidden;
}

.demo-container {
  display: flex;
  gap: 20px;
  width: 100%;
  height: 100%;
  margin: 0 auto;
}

/* 左侧配置面板 */
.config-panel {
  width: 400px;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
  padding: 0;
}

.config-section {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.config-section:last-child {
  border-bottom: none;
}

.config-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-group {
  margin-bottom: 20px;
}

.feature-group:last-child {
  margin-bottom: 0;
}

.feature-group h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 右侧地图展示 */
.map-display {
  flex: 1;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-header {
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.map-info {
  font-size: 14px;
  color: #666;
}

.map-container {
  flex: 1;
  position: relative;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d9d9d9;
  margin: 0;
  transition: all 0.3s ease;
  min-height: 500px;
  width: 100%;
}

.map-container.map-initialized {
  border: none;
  background: transparent;
  display: block;
  min-height: 500px;
  width: 100%;
  position: relative;
}

/* 地图加载指示器 */
.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #722ED1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 地图控件 */
.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.map-control-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.map-control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #ffffff;
  color: #333;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-control-btn:hover {
  background: #722ED1;
  color: white;
}

.map-control-btn:active {
  transform: scale(0.95);
}

/* 地图信息面板 */
.map-info-panel {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;
  z-index: 1000;
}

.info-item {
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item span {
  color: #666;
  font-family: monospace;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.placeholder-content h4 {
  font-size: 24px;
  margin-bottom: 12px;
  color: #722ED1;
}

.placeholder-content p {
  font-size: 16px;
  margin-bottom: 8px;
}

.placeholder-content small {
  font-size: 14px;
  opacity: 0.7;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #ffffff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  outline: none;
}

.btn:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f5f5f5;
}

.btn:disabled:hover {
  border-color: #d9d9d9;
  color: #333;
}

.btn.primary {
  background: #722ED1;
  border-color: #722ED1;
  color: white;
}

.btn.primary:hover {
  background: #5e2aa7;
  border-color: #5e2aa7;
  color: white;
}

.btn.primary:disabled {
  background: #d8c8ee;
  border-color: #d8c8ee;
  color: white;
}

/* 服务类别按钮 */
.service-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.category-btn {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 20px;
}

.category-btn.active {
  background: #722ED1;
  border-color: #722ED1;
  color: white;
}

/* 服务列表 */
.service-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.service-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.service-item:hover {
  border-color: #722ED1;
  background: #f9f0ff;
}

.service-item.active {
  border-color: #722ED1;
  background: #f1ecf9;
}

.service-item.requires-key {
  border-color: #faad14;
  background: #fffbe6;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.service-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.service-description {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.status-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 13px;
}

.status-item label {
  font-weight: 500;
  color: #666;
}

.status-value {
  display: flex;
  align-items: center;
  font-weight: 600;
}

.status-value.success {
  color: #52c41a;
}

.status-value.pending {
  color: #faad14;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  background: #1f1f1f;
  border-radius: 6px;
  padding: 12px;
  font-size: 12px;
}

.log-entry {
  display: flex;
  margin-bottom: 8px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
}

.log-entry:last-child {
  margin-bottom: 0;
}

.log-time {
  color: #666;
  margin-right: 12px;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.log-entry.info .log-message {
  color: #1890ff;
}

.log-entry.success .log-message {
  color: #52c41a;
}

.log-entry.error .log-message {
  color: #ff4d4f;
}

.log-entry.warning .log-message {
  color: #faad14;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .demo-container {
    flex-direction: column;
    height: auto;
  }

  .config-panel {
    width: 100%;
    max-height: 400px;
  }

  .map-display {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 20px 0;
  }

  .header h1 {
    font-size: 24px;
  }

  .header p {
    font-size: 16px;
  }

  .main {
    padding: 15px;
  }

  .demo-container {
    gap: 15px;
  }

  .config-panel {
    max-height: 300px;
  }

  .config-section {
    padding: 15px;
  }

  .control-group {
    gap: 6px;
  }

  .btn {
    padding: 6px 12px;
    font-size: 13px;
  }

  .map-display {
    height: 400px;
  }

  .log-container {
    max-height: 150px;
  }
}

/* 地图服务选择器样式 */
.service-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 20px;
  background: #f0f0f0;
  border: 1px solid #d9d9d9;
  color: #666;
  transition: all 0.3s ease;
}

.category-btn:hover {
  background: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.category-btn.active {
  background: #722ED1;
  border-color: #722ED1;
  color: white;
}

.service-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.service-item {
  padding: 16px;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
}

.service-item:hover {
  border-color: #722ED1;
  background: #f9f0ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(114, 46, 209, 0.15);
}

.service-item.active {
  border-color: #722ED1;
  background: #f0e6ff;
  box-shadow: 0 2px 8px rgba(114, 46, 209, 0.2);
}

.service-item.requires-key {
  border-color: #faad14;
  background: #fffbe6;
}

.service-item.requires-key:hover {
  border-color: #fa8c16;
  background: #fff7e6;
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.service-name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.service-description {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.service-provider {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.api-key-required {
  font-size: 12px;
  color: #fa8c16;
  font-weight: 500;
}

.service-limitations {
  font-size: 12px;
  color: #ff4d4f;
  line-height: 1.3;
}

@media (max-width: 768px) {
  .service-list {
    grid-template-columns: 1fr;
  }

  .service-categories {
    justify-content: center;
  }

  .category-btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>
