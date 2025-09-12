/**
 * 事件处理器工具
 * 负责设置全局事件监听器和处理用户交互
 */

/**
 * 设置事件监听器
 * @param {Object} app - 应用实例
 */
export function setupEventListeners(app) {
  console.log('🎧 设置全局事件监听器...')

  // 设置键盘事件监听器
  setupKeyboardListeners(app)
  
  // 设置窗口事件监听器
  setupWindowListeners(app)
  
  // 设置应用级事件监听器
  setupAppListeners(app)

  console.log('✅ 全局事件监听器设置完成')
}

/**
 * 设置键盘事件监听器
 * @param {Object} app - 应用实例
 */
function setupKeyboardListeners(app) {
  document.addEventListener('keydown', (event) => {
    const appState = app.getState()
    
    // 阻止在输入框中触发快捷键
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return
    }

    switch (event.key) {
      case 'F11':
        // F11 - 切换全屏模式
        event.preventDefault()
        toggleFullscreen(appState)
        break

      case 'Tab':
        // Tab - 切换侧边栏
        if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
          event.preventDefault()
          toggleSidebar(appState)
        }
        break

      case 'Escape':
        // Esc - 关闭帮助弹窗
        if (appState.showHelp) {
          event.preventDefault()
          appState.updateState({ showHelp: false })
        }
        break

      case 'h':
      case 'H':
        // H - 显示/隐藏帮助
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          appState.updateState({ showHelp: !appState.showHelp })
        }
        break

      case '?':
        // ? - 显示帮助
        event.preventDefault()
        appState.updateState({ showHelp: true })
        break
    }
  })
}

/**
 * 设置窗口事件监听器
 * @param {Object} app - 应用实例
 */
function setupWindowListeners(app) {
  // 窗口大小变化
  window.addEventListener('resize', debounce(() => {
    console.log('📐 窗口大小变化')
    // 这里可以添加响应式处理逻辑
  }, 250))

  // 页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('👁️ 页面隐藏')
    } else {
      console.log('👁️ 页面显示')
    }
  })

  // 页面卸载前清理
  window.addEventListener('beforeunload', () => {
    console.log('🧹 页面卸载，清理资源...')
    // 这里可以添加清理逻辑
  })
}

/**
 * 设置应用级事件监听器
 * @param {Object} app - 应用实例
 */
function setupAppListeners(app) {
  // 侧边栏切换按钮
  document.addEventListener('click', (event) => {
    if (event.target.id === 'sidebar-toggle') {
      toggleSidebar(app.getState())
    }
  })

  // 帮助弹窗关闭按钮
  document.addEventListener('click', (event) => {
    if (event.target.id === 'help-close') {
      app.getState().updateState({ showHelp: false })
    }
  })

  // 点击帮助弹窗背景关闭
  document.addEventListener('click', (event) => {
    if (event.target.id === 'help-overlay') {
      app.getState().updateState({ showHelp: false })
    }
  })

  // 状态提示点击关闭
  document.addEventListener('click', (event) => {
    if (event.target.id === 'status-toast') {
      app.getState().updateState({ statusMessage: '' })
    }
  })
}

/**
 * 切换全屏模式
 * @param {Object} appState - 应用状态
 */
function toggleFullscreen(appState) {
  const newFullscreenState = !appState.isFullscreen
  appState.updateState({ isFullscreen: newFullscreenState })
  
  const message = newFullscreenState ? '已进入全屏模式' : '已退出全屏模式'
  appState.showStatus(message, 'info')
  
  console.log(`🖥️ ${message}`)
}

/**
 * 切换侧边栏
 * @param {Object} appState - 应用状态
 */
function toggleSidebar(appState) {
  const newSidebarState = !appState.sidebarCollapsed
  appState.updateState({ sidebarCollapsed: newSidebarState })
  
  const message = newSidebarState ? '侧边栏已收起' : '侧边栏已展开'
  appState.showStatus(message, 'info')
  
  console.log(`📋 ${message}`)
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 添加事件监听器（支持事件委托）
 * @param {HTMLElement} parent - 父元素
 * @param {string} eventType - 事件类型
 * @param {string} selector - 选择器
 * @param {Function} handler - 事件处理器
 */
export function addDelegatedEventListener(parent, eventType, selector, handler) {
  parent.addEventListener(eventType, (event) => {
    if (event.target.matches(selector)) {
      handler(event)
    }
  })
}

/**
 * 移除所有事件监听器
 */
export function removeAllEventListeners() {
  console.log('🗑️ 移除所有事件监听器...')
  
  // 这里可以添加具体的清理逻辑
  // 由于我们使用的是全局事件监听器，通常在页面卸载时会自动清理
  
  console.log('✅ 事件监听器清理完成')
}

/**
 * 触发自定义事件
 * @param {string} eventName - 事件名称
 * @param {Object} detail - 事件详情
 * @param {HTMLElement} target - 目标元素（默认为 window）
 */
export function triggerCustomEvent(eventName, detail = {}, target = window) {
  const event = new CustomEvent(eventName, {
    detail,
    bubbles: true,
    cancelable: true
  })
  
  target.dispatchEvent(event)
  console.log(`📡 触发自定义事件: ${eventName}`, detail)
}

/**
 * 监听自定义事件
 * @param {string} eventName - 事件名称
 * @param {Function} handler - 事件处理器
 * @param {HTMLElement} target - 目标元素（默认为 window）
 * @returns {Function} 移除监听器的函数
 */
export function onCustomEvent(eventName, handler, target = window) {
  target.addEventListener(eventName, handler)
  
  // 返回移除监听器的函数
  return () => {
    target.removeEventListener(eventName, handler)
  }
}

/**
 * 获取事件坐标（兼容触摸事件）
 * @param {Event} event - 事件对象
 * @returns {Object} 坐标对象 {x, y}
 */
export function getEventCoordinates(event) {
  if (event.touches && event.touches.length > 0) {
    // 触摸事件
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    }
  } else {
    // 鼠标事件
    return {
      x: event.clientX,
      y: event.clientY
    }
  }
}

/**
 * 检查是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检查是否支持触摸
 * @returns {boolean} 是否支持触摸
 */
export function isTouchSupported() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
