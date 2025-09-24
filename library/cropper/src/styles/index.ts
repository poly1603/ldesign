/**
 * 样式管理模块
 * 提供样式注入、主题切换等功能
 */

// 样式文件内容 - 使用字符串导入避免构建时的问题
const cropperCSS = `
/* Cropper 基础样式 */
.ldesign-cropper {
  position: relative;
  display: inline-block;
  overflow: hidden;
  user-select: none;
  touch-action: none;
}

.ldesign-cropper-canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.ldesign-cropper-crop-box {
  position: absolute;
  border: 2px solid #007bff;
  cursor: move;
}

.ldesign-cropper-handle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #007bff;
  border: 1px solid #fff;
}
`

const themesCSS = `
/* 主题样式 */
.ldesign-cropper.theme-light {
  --cropper-bg: #ffffff;
  --cropper-border: #e0e0e0;
  --cropper-text: #333333;
}

.ldesign-cropper.theme-dark {
  --cropper-bg: #1a1a1a;
  --cropper-border: #404040;
  --cropper-text: #ffffff;
}
`

/**
 * 样式管理器
 */
export class StyleManager {
  private static instance: StyleManager
  private injectedStyles: Set<string> = new Set()
  private styleElements: Map<string, HTMLStyleElement> = new Map()

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): StyleManager {
    if (!StyleManager.instance) {
      StyleManager.instance = new StyleManager()
    }
    return StyleManager.instance
  }

  /**
   * 注入样式到页面
   */
  injectStyles(id: string, css: string): void {
    if (this.injectedStyles.has(id)) {
      return
    }

    const styleElement = document.createElement('style')
    styleElement.id = `cropper-styles-${id}`
    styleElement.textContent = css
    document.head.appendChild(styleElement)

    this.injectedStyles.add(id)
    this.styleElements.set(id, styleElement)
  }

  /**
   * 移除样式
   */
  removeStyles(id: string): void {
    const styleElement = this.styleElements.get(id)
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement)
      this.injectedStyles.delete(id)
      this.styleElements.delete(id)
    }
  }

  /**
   * 初始化默认样式
   */
  initDefaultStyles(): void {
    this.injectStyles('cropper', cropperCSS)
    this.injectStyles('themes', themesCSS)
  }

  /**
   * 清理所有样式
   */
  cleanup(): void {
    for (const id of this.injectedStyles) {
      this.removeStyles(id)
    }
  }

  /**
   * 检查样式是否已注入
   */
  isStyleInjected(id: string): boolean {
    return this.injectedStyles.has(id)
  }
}

/**
 * 主题管理器
 */
export class ThemeManager {
  private static instance: ThemeManager
  private currentTheme: string = 'default'
  private containers: Set<HTMLElement> = new Set()

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager()
    }
    return ThemeManager.instance
  }

  /**
   * 注册容器
   */
  registerContainer(container: HTMLElement): void {
    this.containers.add(container)
    this.applyTheme(container, this.currentTheme)
  }

  /**
   * 注销容器
   */
  unregisterContainer(container: HTMLElement): void {
    this.containers.delete(container)
  }

  /**
   * 设置主题
   */
  setTheme(theme: string): void {
    this.currentTheme = theme
    for (const container of this.containers) {
      this.applyTheme(container, theme)
    }
  }

  /**
   * 获取当前主题
   */
  getCurrentTheme(): string {
    return this.currentTheme
  }

  /**
   * 应用主题到容器
   */
  private applyTheme(container: HTMLElement, theme: string): void {
    // 移除所有主题类
    const themeClasses = [
      'theme-default',
      'theme-dark',
      'theme-light',
      'theme-blue',
      'theme-green',
      'theme-purple',
      'theme-red',
      'theme-orange',
      'theme-high-contrast'
    ]
    
    container.classList.remove(...themeClasses)
    
    // 添加新主题类
    if (theme && theme !== 'default') {
      container.classList.add(`theme-${theme}`)
    } else {
      container.classList.add('theme-default')
    }
  }

  /**
   * 检测系统主题偏好
   */
  detectSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {}
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    
    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }
}

/**
 * CSS 工具函数
 */
export const cssUtils = {
  /**
   * 添加CSS类
   */
  addClass(element: HTMLElement, className: string): void {
    element.classList.add(className)
  },

  /**
   * 移除CSS类
   */
  removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className)
  },

  /**
   * 切换CSS类
   */
  toggleClass(element: HTMLElement, className: string): void {
    element.classList.toggle(className)
  },

  /**
   * 检查是否包含CSS类
   */
  hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className)
  },

  /**
   * 设置CSS样式
   */
  setStyle(element: HTMLElement, property: string, value: string): void {
    element.style.setProperty(property, value)
  },

  /**
   * 获取CSS样式
   */
  getStyle(element: HTMLElement, property: string): string {
    return getComputedStyle(element).getPropertyValue(property)
  },

  /**
   * 设置CSS变量
   */
  setCSSVariable(element: HTMLElement, name: string, value: string): void {
    element.style.setProperty(`--${name}`, value)
  },

  /**
   * 获取CSS变量
   */
  getCSSVariable(element: HTMLElement, name: string): string {
    return getComputedStyle(element).getPropertyValue(`--${name}`)
  },

  /**
   * 创建CSS规则
   */
  createCSSRule(selector: string, rules: Record<string, string>): string {
    const ruleStrings = Object.entries(rules).map(([property, value]) => {
      const kebabProperty = property.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
      return `  ${kebabProperty}: ${value};`
    })
    
    return `${selector} {\n${ruleStrings.join('\n')}\n}`
  },

  /**
   * 动态插入CSS规则
   */
  insertCSSRule(selector: string, rules: Record<string, string>): void {
    const css = this.createCSSRule(selector, rules)
    const styleElement = document.createElement('style')
    styleElement.textContent = css
    document.head.appendChild(styleElement)
  }
}

/**
 * 动画工具函数
 */
export const animationUtils = {
  /**
   * 淡入动画
   */
  fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.opacity = '0'
      element.style.transition = `opacity ${duration}ms ease`
      
      requestAnimationFrame(() => {
        element.style.opacity = '1'
        setTimeout(resolve, duration)
      })
    })
  },

  /**
   * 淡出动画
   */
  fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.transition = `opacity ${duration}ms ease`
      element.style.opacity = '0'
      setTimeout(resolve, duration)
    })
  },

  /**
   * 滑入动画
   */
  slideIn(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up', duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      const transforms = {
        up: 'translateY(20px)',
        down: 'translateY(-20px)',
        left: 'translateX(20px)',
        right: 'translateX(-20px)'
      }

      element.style.transform = transforms[direction]
      element.style.opacity = '0'
      element.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`
      
      requestAnimationFrame(() => {
        element.style.transform = 'translate(0)'
        element.style.opacity = '1'
        setTimeout(resolve, duration)
      })
    })
  },

  /**
   * 缩放动画
   */
  scale(element: HTMLElement, from: number = 0.8, to: number = 1, duration: number = 300): Promise<void> {
    return new Promise(resolve => {
      element.style.transform = `scale(${from})`
      element.style.transition = `transform ${duration}ms ease`
      
      requestAnimationFrame(() => {
        element.style.transform = `scale(${to})`
        setTimeout(resolve, duration)
      })
    })
  }
}

// 导出样式内容
export { cropperCSS, themesCSS }

// 默认导出
export default {
  StyleManager,
  ThemeManager,
  cssUtils,
  animationUtils,
  cropperCSS,
  themesCSS
}