/**
 * 地图管理器
 * 负责地图实例的创建、配置和管理
 */

/**
 * 模拟地图实例类
 * 用于演示地图功能，不依赖真实的地图库
 */
class MockMapInstance {
  constructor(container, config) {
    this.container = container
    this.config = { ...config }
    this.initialized = false
    this.destroyed = false
    this.eventListeners = new Map()
  }

  /**
   * 初始化地图
   */
  async initialize() {
    if (this.initialized) return

    // 创建地图显示元素
    this.createMapDisplay()

    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    this.initialized = true
    this.emit('loadend')
  }

  /**
   * 创建地图显示
   */
  createMapDisplay() {
    this.container.innerHTML = `
      <div style="
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #e8f5e8 25%, transparent 25%),
                    linear-gradient(-45deg, #e8f5e8 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #e8f5e8 75%),
                    linear-gradient(-45deg, transparent 75%, #e8f5e8 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: #666;
        border: 2px solid #ddd;
        border-radius: 8px;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        ">
          <div style="font-size: 48px; margin-bottom: 10px;">🗺️</div>
          <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">模拟地图</div>
          <div style="font-size: 12px; color: #999;">
            中心点: ${this.config.center[0].toFixed(4)}, ${this.config.center[1].toFixed(4)}
          </div>
          <div style="font-size: 12px; color: #999;">
            缩放级别: ${this.config.zoom}
          </div>
          <div style="font-size: 12px; color: #999;">
            主题: ${this.config.theme}
          </div>
        </div>
      </div>
    `
  }

  /**
   * 更新地图配置
   */
  updateConfig(newConfig) {
    Object.assign(this.config, newConfig)
    if (this.initialized) {
      this.createMapDisplay()
    }
  }

  /**
   * 设置中心点
   */
  setCenter(center) {
    this.config.center = center
    this.updateConfig({ center })
  }

  /**
   * 设置缩放级别
   */
  setZoom(zoom) {
    this.config.zoom = zoom
    this.updateConfig({ zoom })
  }

  /**
   * 设置主题
   */
  setTheme(theme) {
    this.config.theme = theme
    this.updateConfig({ theme })
  }

  /**
   * 设置控件可见性
   */
  setControlsVisible(visible) {
    this.config.showControls = visible
    console.log(`地图控件${visible ? '显示' : '隐藏'}`)
  }

  /**
   * 设置交互启用状态
   */
  setInteractionEnabled(enabled) {
    this.config.enableInteraction = enabled
    console.log(`地图交互${enabled ? '启用' : '禁用'}`)
  }

  /**
   * 检查是否就绪
   */
  isReady() {
    return this.initialized
  }

  /**
   * 添加事件监听器
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.destroyed) return

    this.container.innerHTML = ''
    this.eventListeners.clear()
    this.destroyed = true
    this.initialized = false
  }
}

/**
 * 地图实例缓存
 */
let mapInstanceCache = new Map()

/**
 * 初始化地图
 * @param {HTMLElement} container - 地图容器元素
 * @param {Object} config - 地图配置
 * @returns {Promise<Object>} 地图实例
 */
export async function initializeMap(container, config) {
  try {
    console.log('🗺️ 开始初始化地图...', { config })

    // 验证容器元素
    if (!container) {
      throw new Error('地图容器元素不能为空')
    }

    // 验证配置
    if (!config || !config.center || !Array.isArray(config.center)) {
      throw new Error('地图配置无效：缺少中心点坐标')
    }

    // 清理容器
    container.innerHTML = ''
    container.style.width = '100%'
    container.style.height = '100%'

    console.log('📋 地图配置:', config)

    // 创建模拟地图实例
    const mapInstance = new MockMapInstance(container, config)

    // 初始化地图
    await mapInstance.initialize()

    // 缓存地图实例
    const instanceId = generateInstanceId()
    mapInstanceCache.set(instanceId, mapInstance)

    console.log('✅ 地图初始化成功', { instanceId })

    // 返回包装后的地图实例
    return {
      id: instanceId,
      instance: mapInstance,
      container: container,
      config: { ...config }
    }

  } catch (error) {
    console.error('❌ 地图初始化失败:', error)
    throw error
  }
}

/**
 * 更新地图配置
 * @param {Object} mapWrapper - 地图包装对象
 * @param {Object} newConfig - 新配置
 */
export function updateMapConfig(mapWrapper, newConfig) {
  try {
    if (!mapWrapper || !mapWrapper.instance) {
      throw new Error('无效的地图实例')
    }

    const mapInstance = mapWrapper.instance
    const currentConfig = mapWrapper.config

    console.log('🔄 更新地图配置...', { newConfig })

    // 更新中心点
    if (newConfig.center && Array.isArray(newConfig.center)) {
      mapInstance.setCenter(newConfig.center)
      currentConfig.center = [...newConfig.center]
    }

    // 更新缩放级别
    if (typeof newConfig.zoom === 'number') {
      mapInstance.setZoom(newConfig.zoom)
      currentConfig.zoom = newConfig.zoom
    }

    // 更新主题
    if (newConfig.theme && newConfig.theme !== currentConfig.theme) {
      mapInstance.setTheme(newConfig.theme)
      currentConfig.theme = newConfig.theme
    }

    // 更新控件显示
    if (typeof newConfig.showControls === 'boolean') {
      mapInstance.setControlsVisible(newConfig.showControls)
      currentConfig.showControls = newConfig.showControls
    }

    // 更新交互功能
    if (typeof newConfig.enableInteraction === 'boolean') {
      mapInstance.setInteractionEnabled(newConfig.enableInteraction)
      currentConfig.enableInteraction = newConfig.enableInteraction
    }

    console.log('✅ 地图配置更新成功')

  } catch (error) {
    console.error('❌ 地图配置更新失败:', error)
    throw error
  }
}

/**
 * 销毁地图实例
 * @param {Object} mapWrapper - 地图包装对象
 */
export function destroyMap(mapWrapper) {
  try {
    if (!mapWrapper || !mapWrapper.id) {
      return
    }

    console.log('🗑️ 销毁地图实例...', { id: mapWrapper.id })

    // 从缓存中移除
    mapInstanceCache.delete(mapWrapper.id)

    // 销毁地图实例
    if (mapWrapper.instance && typeof mapWrapper.instance.destroy === 'function') {
      mapWrapper.instance.destroy()
    }

    // 清理容器
    if (mapWrapper.container) {
      mapWrapper.container.innerHTML = ''
    }

    console.log('✅ 地图实例已销毁')

  } catch (error) {
    console.error('❌ 地图销毁失败:', error)
  }
}

/**
 * 获取地图实例
 * @param {string} instanceId - 实例ID
 * @returns {Object|null} 地图实例
 */
export function getMapInstance(instanceId) {
  return mapInstanceCache.get(instanceId) || null
}

/**
 * 获取所有地图实例
 * @returns {Map} 地图实例缓存
 */
export function getAllMapInstances() {
  return new Map(mapInstanceCache)
}

/**
 * 清理所有地图实例
 */
export function clearAllMapInstances() {
  console.log('🧹 清理所有地图实例...')
  
  mapInstanceCache.forEach((instance, id) => {
    try {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy()
      }
    } catch (error) {
      console.error(`清理地图实例 ${id} 失败:`, error)
    }
  })
  
  mapInstanceCache.clear()
  console.log('✅ 所有地图实例已清理')
}

/**
 * 生成实例ID
 * @returns {string} 唯一实例ID
 */
function generateInstanceId() {
  return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证地图配置
 * @param {Object} config - 地图配置
 * @returns {boolean} 配置是否有效
 */
export function validateMapConfig(config) {
  if (!config || typeof config !== 'object') {
    return false
  }

  // 验证中心点
  if (!config.center || !Array.isArray(config.center) || config.center.length !== 2) {
    return false
  }

  const [lng, lat] = config.center
  if (typeof lng !== 'number' || typeof lat !== 'number') {
    return false
  }

  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return false
  }

  // 验证缩放级别
  if (config.zoom !== undefined) {
    if (typeof config.zoom !== 'number' || config.zoom < 1 || config.zoom > 20) {
      return false
    }
  }

  // 验证主题
  if (config.theme !== undefined) {
    const validThemes = ['default', 'dark', 'light']
    if (!validThemes.includes(config.theme)) {
      return false
    }
  }

  return true
}

/**
 * 获取默认地图配置
 * @returns {Object} 默认配置
 */
export function getDefaultMapConfig() {
  return {
    center: [116.3974, 39.9093], // 北京天安门
    zoom: 10,
    theme: 'default',
    showControls: true,
    enableInteraction: true
  }
}

// 页面卸载时清理所有地图实例
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    clearAllMapInstances()
  })
}
