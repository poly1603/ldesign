/**
 * 主应用模块
 * 负责创建和管理应用实例
 */

// 导入组件模块 - 使用 alias
import { createConfigPanel } from 'src/components/ConfigPanel.js'
import { createMapRenderer } from 'src/components/MapRenderer.js'
import { createHeader } from 'src/components/Header.js'

/**
 * 应用状态管理
 */
class AppState {
  constructor() {
    this.isFullscreen = false
    this.sidebarCollapsed = false
    this.showHelp = false
    this.mapConfig = {
      center: [116.3974, 39.9093], // 北京天安门
      zoom: 10,
      theme: 'default',
      showControls: true,
      enableInteraction: true
    }
    this.appliedConfig = { ...this.mapConfig }
    this.statusMessage = ''
    this.statusType = 'info'
  }

  /**
   * 更新状态
   * @param {Object} newState - 新状态
   */
  updateState(newState) {
    Object.assign(this, newState)
    this.notifyStateChange()
  }

  /**
   * 通知状态变更
   */
  notifyStateChange() {
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('app-state-change', {
      detail: { state: this }
    }))
  }

  /**
   * 显示状态消息
   * @param {string} message - 消息内容
   * @param {string} type - 消息类型
   */
  showStatus(message, type = 'info') {
    this.statusMessage = message
    this.statusType = type
    this.notifyStateChange()
    
    // 3秒后自动隐藏
    setTimeout(() => {
      this.statusMessage = ''
      this.notifyStateChange()
    }, 3000)
  }
}

/**
 * 应用类
 */
class App {
  constructor() {
    this.state = new AppState()
    this.components = {}
    this.container = null
  }

  /**
   * 渲染应用
   */
  render() {
    const appElement = document.getElementById('app')
    if (!appElement) {
      throw new Error('找不到应用容器元素 #app')
    }

    // 创建应用结构
    appElement.innerHTML = `
      <div class="app">
        <!-- 应用头部 -->
        <header id="app-header" class="app-header"></header>
        
        <!-- 主要内容区域 -->
        <main class="app-main">
          <div id="main-container" class="main-container">
            <!-- 左侧配置面板 -->
            <aside id="config-sidebar" class="config-sidebar">
              <div class="sidebar-header">
                <button id="sidebar-toggle" class="sidebar-toggle" title="切换侧边栏">
                  ◀️
                </button>
              </div>
              <div id="sidebar-content" class="sidebar-content"></div>
            </aside>

            <!-- 右侧地图渲染区域 -->
            <section id="map-section" class="map-section"></section>
          </div>
        </main>

        <!-- 状态提示 -->
        <div id="status-toast" class="status-toast" style="display: none;"></div>
        
        <!-- 帮助弹窗 -->
        <div id="help-overlay" class="help-overlay" style="display: none;">
          <div class="help-modal">
            <div class="help-header">
              <h3>📖 使用帮助</h3>
              <button id="help-close" class="close-btn">✕</button>
            </div>
            <div class="help-content">
              <div class="help-section">
                <h4>🎛️ 配置面板</h4>
                <ul>
                  <li>选择预设位置或自定义地图中心点</li>
                  <li>调整缩放级别（1-20）</li>
                  <li>切换地图主题（默认/深色/浅色）</li>
                  <li>控制地图控件和交互功能</li>
                </ul>
              </div>
              <div class="help-section">
                <h4>🗺️ 地图操作</h4>
                <ul>
                  <li>点击"初始化地图"开始使用</li>
                  <li>使用控制按钮进行地图操作</li>
                  <li>实时查看地图状态信息</li>
                  <li>支持鼠标拖拽和滚轮缩放</li>
                </ul>
              </div>
              <div class="help-section">
                <h4>⌨️ 快捷键</h4>
                <ul>
                  <li><kbd>F11</kbd> - 切换全屏模式</li>
                  <li><kbd>Tab</kbd> - 切换侧边栏</li>
                  <li><kbd>Esc</kbd> - 关闭帮助</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    this.container = appElement.querySelector('.app')
    
    // 初始化组件
    this.initializeComponents()
    
    // 监听状态变更
    this.setupStateListeners()
    
    // 显示欢迎消息
    this.state.showStatus('欢迎使用 LDesign Map Vite + JS 示例！', 'info')
  }

  /**
   * 初始化组件
   */
  initializeComponents() {
    // 创建头部组件
    this.components.header = createHeader(this.state)
    this.components.header.mount(document.getElementById('app-header'))

    // 创建配置面板组件
    this.components.configPanel = createConfigPanel(this.state)
    this.components.configPanel.mount(document.getElementById('sidebar-content'))

    // 创建地图渲染器组件
    this.components.mapRenderer = createMapRenderer(this.state)
    this.components.mapRenderer.mount(document.getElementById('map-section'))
  }

  /**
   * 设置状态监听器
   */
  setupStateListeners() {
    window.addEventListener('app-state-change', (event) => {
      this.updateUI(event.detail.state)
    })
  }

  /**
   * 更新 UI
   * @param {AppState} state - 应用状态
   */
  updateUI(state) {
    // 更新主容器类名
    const mainContainer = document.getElementById('main-container')
    if (mainContainer) {
      mainContainer.className = `main-container ${state.isFullscreen ? 'fullscreen' : ''}`
    }

    // 更新侧边栏状态
    const configSidebar = document.getElementById('config-sidebar')
    const sidebarContent = document.getElementById('sidebar-content')
    const sidebarToggle = document.getElementById('sidebar-toggle')
    
    if (configSidebar && sidebarContent && sidebarToggle) {
      configSidebar.className = `config-sidebar ${state.sidebarCollapsed ? 'collapsed' : ''}`
      sidebarContent.style.display = state.sidebarCollapsed ? 'none' : 'block'
      sidebarToggle.textContent = state.sidebarCollapsed ? '▶️' : '◀️'
      sidebarToggle.title = state.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'
    }

    // 更新状态提示
    const statusToast = document.getElementById('status-toast')
    if (statusToast) {
      if (state.statusMessage) {
        statusToast.textContent = state.statusMessage
        statusToast.className = `status-toast ${state.statusType}`
        statusToast.style.display = 'block'
      } else {
        statusToast.style.display = 'none'
      }
    }

    // 更新帮助弹窗
    const helpOverlay = document.getElementById('help-overlay')
    if (helpOverlay) {
      helpOverlay.style.display = state.showHelp ? 'flex' : 'none'
    }
  }

  /**
   * 获取应用状态
   * @returns {AppState} 应用状态
   */
  getState() {
    return this.state
  }

  /**
   * 获取组件实例
   * @param {string} name - 组件名称
   * @returns {Object} 组件实例
   */
  getComponent(name) {
    return this.components[name]
  }
}

/**
 * 创建应用实例
 * @returns {App} 应用实例
 */
export function createApp() {
  return new App()
}
