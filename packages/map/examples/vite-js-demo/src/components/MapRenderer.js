/**
 * 地图渲染器组件
 * 右侧地图渲染器，负责显示实际的地图内容
 */

// 导入地图管理器 - 使用 alias
import { initializeMap, updateMapConfig } from 'src/map/mapManager.js'

/**
 * 地图渲染器组件类
 */
class MapRenderer {
  constructor(appState) {
    this.appState = appState
    this.container = null
    this.mapInstance = null
    this.mapState = {
      initialized: false,
      loading: false,
      error: null
    }
  }

  /**
   * 挂载组件
   * @param {HTMLElement} container - 容器元素
   */
  mount(container) {
    if (!container) {
      throw new Error('MapRenderer 组件需要一个容器元素')
    }

    this.container = container
    this.render()
    this.setupEventListeners()
  }

  /**
   * 渲染组件
   */
  render() {
    const config = this.appState.appliedConfig || this.appState.mapConfig || {
      center: [116.3974, 39.9093],
      zoom: 10,
      theme: 'default'
    }
    
    this.container.innerHTML = `
      <div class="map-renderer">
        <!-- 地图头部信息 -->
        <div class="map-header">
          <div class="map-title">
            <h2>🗺️ 地图渲染器</h2>
            <div class="map-status">
              <span class="status-indicator ${this.getStatusClass()}"></span>
              <span class="status-text">${this.getStatusText()}</span>
            </div>
          </div>
          
          <!-- 地图信息显示 -->
          <div class="map-info">
            <div class="info-item">
              <span class="info-label">中心点:</span>
              <span class="info-value">${this.formatCoordinate(config.center)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">缩放:</span>
              <span class="info-value">${config.zoom}</span>
            </div>
            <div class="info-item">
              <span class="info-label">主题:</span>
              <span class="info-value">${this.getThemeName(config.theme)}</span>
            </div>
          </div>
        </div>

        <!-- 地图容器 -->
        <div class="map-container-wrapper">
          <div class="map-container ${this.getMapContainerClass()}">
            ${this.renderMapContent()}
          </div>

          <!-- 地图控制按钮 -->
          ${this.mapState.initialized && !this.mapState.error ? `
            <div class="map-controls">
              <button class="control-btn" id="center-btn" title="回到中心点">🎯</button>
              <button class="control-btn" id="zoom-in-btn" title="放大">➕</button>
              <button class="control-btn" id="zoom-out-btn" title="缩小">➖</button>
              <button class="control-btn" id="refresh-btn" title="刷新地图">🔄</button>
            </div>
          ` : ''}
        </div>
      </div>
    `
  }

  /**
   * 渲染地图内容
   * @returns {string} 地图内容 HTML
   */
  renderMapContent() {
    // 总是包含地图画布元素
    let content = '<div id="map-canvas" class="map-canvas"></div>'

    if (this.mapState.loading) {
      content += `
        <div class="map-overlay loading-overlay">
          <div class="loading-spinner"></div>
          <div class="loading-text">正在初始化地图...</div>
        </div>
      `
    } else if (this.mapState.error) {
      content += `
        <div class="map-overlay error-overlay">
          <div class="error-icon">⚠️</div>
          <div class="error-title">地图加载失败</div>
          <div class="error-message">${this.mapState.error}</div>
          <button class="btn btn-primary" id="retry-btn">重试</button>
        </div>
      `
    } else if (!this.mapState.initialized) {
      content += `
        <div class="map-overlay placeholder-overlay">
          <div class="placeholder-icon">🗺️</div>
          <div class="placeholder-title">地图渲染器</div>
          <div class="placeholder-description">
            点击"初始化地图"按钮开始使用地图功能
          </div>
          <button class="btn btn-primary" id="init-btn">初始化地图</button>
        </div>
      `
    }

    return content
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 初始化按钮
    const initBtn = this.container.querySelector('#init-btn')
    if (initBtn) {
      initBtn.addEventListener('click', () => this.initializeMap())
    }

    // 重试按钮
    const retryBtn = this.container.querySelector('#retry-btn')
    if (retryBtn) {
      retryBtn.addEventListener('click', () => this.retryInitialization())
    }

    // 地图控制按钮
    this.setupMapControlListeners()

    // 监听状态变更
    window.addEventListener('app-state-change', (event) => {
      this.updateUI(event.detail.state)
    })
  }

  /**
   * 设置地图控制按钮监听器
   */
  setupMapControlListeners() {
    const centerBtn = this.container.querySelector('#center-btn')
    const zoomInBtn = this.container.querySelector('#zoom-in-btn')
    const zoomOutBtn = this.container.querySelector('#zoom-out-btn')
    const refreshBtn = this.container.querySelector('#refresh-btn')

    if (centerBtn) {
      centerBtn.addEventListener('click', () => this.centerMap())
    }
    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => this.zoomIn())
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => this.zoomOut())
    }
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshMap())
    }
  }

  /**
   * 初始化地图
   */
  async initializeMap() {
    try {
      this.mapState.loading = true
      this.mapState.error = null
      this.render()
      this.setupEventListeners()

      // 等待 DOM 更新
      await new Promise(resolve => setTimeout(resolve, 100))

      const mapCanvas = this.container.querySelector('#map-canvas')
      if (!mapCanvas) {
        throw new Error('找不到地图画布元素')
      }

      // 获取地图配置
      const mapConfig = this.appState.appliedConfig || this.appState.mapConfig || {
        center: [116.3974, 39.9093],
        zoom: 10,
        theme: 'default',
        showControls: true,
        enableInteraction: true
      }

      console.log('🗺️ 使用地图配置:', mapConfig)

      // 初始化地图实例
      this.mapInstance = await initializeMap(mapCanvas, mapConfig)

      this.mapState.initialized = true
      this.mapState.loading = false
      
      this.appState.showStatus('地图初始化成功！', 'success')
      console.log('🗺️ 地图初始化成功')

      // 重新渲染以显示地图控制按钮
      this.render()
      this.setupEventListeners()

    } catch (error) {
      this.mapState.error = error.message || '未知错误'
      this.mapState.loading = false
      
      this.appState.showStatus(`地图错误: ${this.mapState.error}`, 'error')
      console.error('❌ 地图初始化失败:', error)

      this.render()
      this.setupEventListeners()
    }
  }

  /**
   * 重试初始化
   */
  retryInitialization() {
    this.mapState.error = null
    this.initializeMap()
  }

  /**
   * 回到中心点
   */
  centerMap() {
    if (this.mapInstance) {
      try {
        updateMapConfig(this.mapInstance, { center: this.appState.appliedConfig.center })
        console.log('🎯 回到中心点')
      } catch (error) {
        console.error('回到中心点失败:', error)
      }
    }
  }

  /**
   * 放大地图
   */
  zoomIn() {
    if (this.mapInstance) {
      try {
        const currentZoom = this.appState.appliedConfig.zoom
        const newZoom = Math.min(currentZoom + 1, 20)
        updateMapConfig(this.mapInstance, { zoom: newZoom })
        console.log('➕ 地图放大')
      } catch (error) {
        console.error('地图放大失败:', error)
      }
    }
  }

  /**
   * 缩小地图
   */
  zoomOut() {
    if (this.mapInstance) {
      try {
        const currentZoom = this.appState.appliedConfig.zoom
        const newZoom = Math.max(currentZoom - 1, 1)
        updateMapConfig(this.mapInstance, { zoom: newZoom })
        console.log('➖ 地图缩小')
      } catch (error) {
        console.error('地图缩小失败:', error)
      }
    }
  }

  /**
   * 刷新地图
   */
  refreshMap() {
    if (this.mapInstance) {
      try {
        // 重新应用当前配置
        updateMapConfig(this.mapInstance, this.appState.appliedConfig)
        console.log('🔄 地图已刷新')
      } catch (error) {
        console.error('地图刷新失败:', error)
      }
    }
  }

  /**
   * 获取状态类名
   * @returns {string} 状态类名
   */
  getStatusClass() {
    if (this.mapState.loading) return 'status-loading'
    if (this.mapState.error) return 'status-error'
    if (this.mapState.initialized) return 'status-ready'
    return ''
  }

  /**
   * 获取状态文本
   * @returns {string} 状态文本
   */
  getStatusText() {
    if (this.mapState.loading) return '加载中...'
    if (this.mapState.error) return '加载失败'
    if (this.mapState.initialized) return '就绪'
    return '未初始化'
  }

  /**
   * 获取地图容器类名
   * @returns {string} 容器类名
   */
  getMapContainerClass() {
    const classes = []
    if (this.mapState.loading) classes.push('map-loading')
    if (this.mapState.error) classes.push('map-error')
    if (this.mapState.initialized) classes.push('map-initialized')
    return classes.join(' ')
  }

  /**
   * 格式化坐标显示
   * @param {Array} coordinate - 坐标数组
   * @returns {string} 格式化后的坐标字符串
   */
  formatCoordinate(coordinate) {
    return `${coordinate[0].toFixed(4)}, ${coordinate[1].toFixed(4)}`
  }

  /**
   * 获取主题名称
   * @param {string} theme - 主题键
   * @returns {string} 主题名称
   */
  getThemeName(theme) {
    const themeNames = {
      default: '默认',
      dark: '深色',
      light: '浅色'
    }
    return themeNames[theme] || theme
  }

  /**
   * 更新 UI
   * @param {Object} state - 应用状态
   */
  updateUI(state) {
    // 获取配置
    const config = state.appliedConfig || state.mapConfig || {
      center: [116.3974, 39.9093],
      zoom: 10,
      theme: 'default'
    }

    // 如果应用配置发生变化且地图已初始化，更新地图
    if (this.mapInstance && this.mapState.initialized) {
      try {
        updateMapConfig(this.mapInstance, config)
      } catch (error) {
        console.error('更新地图配置失败:', error)
      }
    }

    // 重新渲染头部信息
    this.updateMapInfo(config)
  }

  /**
   * 更新地图信息显示
   * @param {Object} config - 地图配置
   */
  updateMapInfo(config) {
    const infoItems = this.container.querySelectorAll('.info-value')
    if (infoItems.length >= 3) {
      infoItems[0].textContent = this.formatCoordinate(config.center)
      infoItems[1].textContent = config.zoom
      infoItems[2].textContent = this.getThemeName(config.theme)
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.mapInstance) {
      // 这里应该调用地图实例的销毁方法
      this.mapInstance = null
    }
    
    if (this.container) {
      this.container.innerHTML = ''
      this.container = null
    }
  }
}

/**
 * 创建地图渲染器组件实例
 * @param {Object} appState - 应用状态
 * @returns {MapRenderer} 地图渲染器组件实例
 */
export function createMapRenderer(appState) {
  return new MapRenderer(appState)
}
