/**
 * 头部组件
 * 应用头部导航和操作按钮
 */

/**
 * 头部组件类
 */
class Header {
  constructor(appState) {
    this.appState = appState
    this.container = null
  }

  /**
   * 挂载组件
   * @param {HTMLElement} container - 容器元素
   */
  mount(container) {
    if (!container) {
      throw new Error('Header 组件需要一个容器元素')
    }

    this.container = container
    this.render()
    this.setupEventListeners()
  }

  /**
   * 渲染组件
   */
  render() {
    this.container.innerHTML = `
      <div class="header-content">
        <div class="header-title">
          <h1>🗺️ LDesign Map Vite + JS 示例</h1>
          <p>基于 Vite + JavaScript 的地图组件演示</p>
        </div>
        
        <div class="header-actions">
          <button 
            id="fullscreen-btn" 
            class="btn btn-outline"
            title="切换全屏"
          >
            ⛶
          </button>
          
          <button 
            id="help-btn" 
            class="btn btn-outline"
            title="帮助信息"
          >
            ❓
          </button>
        </div>
      </div>
    `
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    // 全屏按钮
    const fullscreenBtn = this.container.querySelector('#fullscreen-btn')
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen()
      })
    }

    // 帮助按钮
    const helpBtn = this.container.querySelector('#help-btn')
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.toggleHelp()
      })
    }

    // 监听状态变更
    window.addEventListener('app-state-change', (event) => {
      this.updateUI(event.detail.state)
    })
  }

  /**
   * 切换全屏模式
   */
  toggleFullscreen() {
    const newFullscreenState = !this.appState.isFullscreen
    this.appState.updateState({ isFullscreen: newFullscreenState })
    this.appState.showStatus(
      newFullscreenState ? '已进入全屏模式' : '已退出全屏模式',
      'info'
    )
  }

  /**
   * 切换帮助弹窗
   */
  toggleHelp() {
    const newHelpState = !this.appState.showHelp
    this.appState.updateState({ showHelp: newHelpState })
  }

  /**
   * 更新 UI
   * @param {Object} state - 应用状态
   */
  updateUI(state) {
    const fullscreenBtn = this.container.querySelector('#fullscreen-btn')
    if (fullscreenBtn) {
      fullscreenBtn.textContent = state.isFullscreen ? '🔲' : '⛶'
      fullscreenBtn.title = state.isFullscreen ? '退出全屏' : '进入全屏'
    }
  }

  /**
   * 销毁组件
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = ''
      this.container = null
    }
  }
}

/**
 * 创建头部组件实例
 * @param {Object} appState - 应用状态
 * @returns {Header} 头部组件实例
 */
export function createHeader(appState) {
  return new Header(appState)
}
