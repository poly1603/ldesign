/**
 * 样式加载助手 - 自动加载组件样式
 */

/**
 * 已加载的样式集合 - 使用WeakMap避免内存泄漏
 */
const loadedStyles = new Set<string>()
const styleElements = new WeakMap<object, HTMLLinkElement>() // 使用WeakMap存储样式元素引用
const styleKeyMap = new Map<string, object>() // 映射字符串key到对象key
const MAX_STYLES = 100 // 限制最大样式数量
let cleanupTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 加载组件样式
 */
export function loadComponentStyle(
  category: string,
  device: string,
  name: string,
  componentPath?: string
): void {
  // 只在浏览器环境中加载样式
  if (typeof document === 'undefined') {
    return
  }

  const styleId = `template-style-${category}-${device}-${name}`

  // 检查样式是否已经加载
  if (loadedStyles.has(styleId) || document.getElementById(styleId)) {
    return
  }

  // 如果提供了组件路径，尝试加载对应的样式
  if (componentPath && componentPath.endsWith('.vue.js')) {
    const stylePath = componentPath.replace('.vue.js', '.vue.css')
    
    try {
      // 创建 link 元素
      const link = document.createElement('link')
      link.id = styleId
      link.rel = 'stylesheet'
      
      // 构建样式文件的URL
      // 处理相对路径
      if (stylePath.startsWith('../')) {
        // 从 import.meta.url 构建完整URL
        const baseUrl = new URL(import.meta.url)
        const styleUrl = new URL(stylePath, baseUrl)
        link.href = styleUrl.href
      } else {
        link.href = stylePath
      }
      
      // 添加到文档
      document.head.appendChild(link)
      loadedStyles.add(styleId)
      
      // 存储元素引用以便清理
      const keyObj = { id: styleId }
      styleKeyMap.set(styleId, keyObj)
      styleElements.set(keyObj, link)
      
      // 限制样式数量，移除最旧的
      if (loadedStyles.size > MAX_STYLES) {
        const firstStyle = loadedStyles.values().next().value
        if (firstStyle) {
          removeStyle(firstStyle)
        }
      }
      
      // 定期清理未使用样式
      scheduleCleanup()
      
      
    } catch (error) {
      console.warn(`[StyleLoader] 无法加载样式: ${stylePath}`, error)
    }
  }
}

/**
 * 批量加载样式
 */
export function loadStyles(paths: string[]): void {
  if (typeof document === 'undefined') {
    return
  }

  paths.forEach(path => {
    const id = `style-${path.replace(/[^a-z0-9]/gi, '-')}`
    
    if (loadedStyles.has(id) || document.getElementById(id)) {
      return
    }

    try {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      link.href = path
      document.head.appendChild(link)
      loadedStyles.add(id)
    } catch (error) {
      console.warn(`[StyleLoader] 无法加载样式: ${path}`, error)
    }
  })
}

/**
 * 加载全局样式
 */
export function loadGlobalStyles(): void {
  // 尝试加载主样式文件
  loadStyles([
    '@ldesign/template/index.css',
    '@ldesign/template/es/index.css',
  ])
}

/**
 * 移除单个样式
 */
export function removeStyle(id: string): void {
  const keyObj = styleKeyMap.get(id)
  const element = document.getElementById(id) || (keyObj && styleElements.get(keyObj))
  if (element) {
    element.remove()
  }
  loadedStyles.delete(id)
  if (keyObj) {
    styleElements.delete(keyObj)
    styleKeyMap.delete(id)
  }
}

/**
 * 清除已加载的样式
 */
export function clearLoadedStyles(): void {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
    cleanupTimer = null
  }
  
  loadedStyles.forEach(id => {
    removeStyle(id)
  })
  loadedStyles.clear()
  styleKeyMap.clear()
  // WeakMap会自动垃圾回收
}

/**
 * 定期清理调度器
 */
function scheduleCleanup(): void {
  if (cleanupTimer) return
  
  cleanupTimer = setTimeout(() => {
    cleanupUnusedStyles()
    cleanupTimer = null
  }, 30000) // 30秒后执行清理
}

/**
 * 清除未使用的样式
 */
export function cleanupUnusedStyles(): void {
  const usedStyles = new Set<string>()
  
  // 检查DOM中实际使用的模板
  document.querySelectorAll('[data-template-style]').forEach(el => {
    const styleId = el.getAttribute('data-template-style')
    if (styleId) usedStyles.add(styleId)
  })
  
  // 移除未使用的样式
  loadedStyles.forEach(id => {
    if (!usedStyles.has(id)) {
      removeStyle(id)
    }
  })
}
