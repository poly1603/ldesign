/**
 * 样式加载助手 - 自动加载组件样式
 */

/**
 * 已加载的样式集合
 */
const loadedStyles = new Set<string>()

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
 * 清除已加载的样式
 */
export function clearLoadedStyles(): void {
  loadedStyles.forEach(id => {
    const element = document.getElementById(id)
    if (element) {
      element.remove()
    }
  })
  loadedStyles.clear()
}