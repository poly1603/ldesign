/**
 * 模板无障碍支持系统
 * 
 * 提供键盘导航、屏幕阅读器支持、焦点管理等功能
 */

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * 无障碍配置
 */
export interface A11yConfig {
  // ARIA 标签
  ariaLabels?: Record<string, string>
  ariaDescriptions?: Record<string, string>
  
  // 键盘导航
  keyboardNavigation?: boolean
  trapFocus?: boolean
  escapeDeactivates?: boolean
  
  // 屏幕阅读器
  screenReaderMode?: boolean
  announceChanges?: boolean
  liveRegion?: 'polite' | 'assertive' | 'off'
  
  // 视觉辅助
  highContrast?: boolean
  focusIndicator?: boolean
  reducedMotion?: boolean
  
  // 语义化
  headingLevel?: number
  landmark?: 'main' | 'navigation' | 'complementary' | 'contentinfo'
  
  // 快捷键
  shortcuts?: Record<string, () => void>
}

/**
 * 焦点管理器
 */
class FocusManager {
  private focusableElements: HTMLElement[] = []
  private currentIndex = -1
  private container: HTMLElement | null = null
  private originalFocus: HTMLElement | null = null
  
  /**
   * 初始化
   */
  init(container: HTMLElement) {
    this.container = container
    this.originalFocus = document.activeElement as HTMLElement
    this.updateFocusableElements()
  }
  
  /**
   * 更新可聚焦元素列表
   */
  updateFocusableElements() {
    if (!this.container) return
    
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(', ')
    
    this.focusableElements = Array.from(
      this.container.querySelectorAll(selector)
    ) as HTMLElement[]
  }
  
  /**
   * 聚焦第一个元素
   */
  focusFirst() {
    if (this.focusableElements.length > 0) {
      this.currentIndex = 0
      this.focusableElements[0].focus()
    }
  }
  
  /**
   * 聚焦最后一个元素
   */
  focusLast() {
    if (this.focusableElements.length > 0) {
      this.currentIndex = this.focusableElements.length - 1
      this.focusableElements[this.currentIndex].focus()
    }
  }
  
  /**
   * 聚焦下一个元素
   */
  focusNext() {
    if (this.focusableElements.length === 0) return
    
    this.currentIndex = (this.currentIndex + 1) % this.focusableElements.length
    this.focusableElements[this.currentIndex].focus()
  }
  
  /**
   * 聚焦上一个元素
   */
  focusPrevious() {
    if (this.focusableElements.length === 0) return
    
    this.currentIndex = this.currentIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentIndex - 1
    
    this.focusableElements[this.currentIndex].focus()
  }
  
  /**
   * 捕获焦点
   */
  trapFocus() {
    if (!this.container) return
    
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      const isShift = e.shiftKey
      const activeElement = document.activeElement
      
      if (!this.container?.contains(activeElement as Node)) {
        e.preventDefault()
        if (isShift) {
          this.focusLast()
        } else {
          this.focusFirst()
        }
        return
      }
      
      const currentIndex = this.focusableElements.indexOf(activeElement as HTMLElement)
      
      if (isShift && currentIndex === 0) {
        e.preventDefault()
        this.focusLast()
      } else if (!isShift && currentIndex === this.focusableElements.length - 1) {
        e.preventDefault()
        this.focusFirst()
      }
    }
    
    document.addEventListener('keydown', handleKeydown)
    
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }
  
  /**
   * 恢复原始焦点
   */
  restoreFocus() {
    if (this.originalFocus && this.originalFocus.focus) {
      this.originalFocus.focus()
    }
  }
  
  /**
   * 清理
   */
  cleanup() {
    this.restoreFocus()
    this.focusableElements = []
    this.currentIndex = -1
    this.container = null
    this.originalFocus = null
  }
}

/**
 * 屏幕阅读器公告
 */
class ScreenReaderAnnouncer {
  private liveRegion: HTMLElement | null = null
  private announceTimer: ReturnType<typeof setTimeout> | null = null
  
  /**
   * 初始化
   */
  init(mode: 'polite' | 'assertive' | 'off' = 'polite') {
    if (mode === 'off') return
    
    this.liveRegion = document.createElement('div')
    this.liveRegion.setAttribute('aria-live', mode)
    this.liveRegion.setAttribute('aria-atomic', 'true')
    this.liveRegion.style.position = 'absolute'
    this.liveRegion.style.left = '-10000px'
    this.liveRegion.style.width = '1px'
    this.liveRegion.style.height = '1px'
    this.liveRegion.style.overflow = 'hidden'
    
    document.body.appendChild(this.liveRegion)
  }
  
  /**
   * 发布公告
   */
  announce(message: string, delay: number = 100) {
    if (!this.liveRegion) return
    
    // 清理之前的定时器
    if (this.announceTimer) {
      clearTimeout(this.announceTimer)
      this.announceTimer = null
    }
    
    // 清空当前内容，确保变化能被检测到
    this.liveRegion.textContent = ''
    
    // 延迟后设置新内容，确保屏幕阅读器能够检测到变化
    this.announceTimer = setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message
      }
      this.announceTimer = null
    }, delay)
  }
  
  /**
   * 清理
   */
  cleanup() {
    if (this.announceTimer) {
      clearTimeout(this.announceTimer)
      this.announceTimer = null
    }
    if (this.liveRegion && this.liveRegion.parentNode) {
      this.liveRegion.parentNode.removeChild(this.liveRegion)
    }
    this.liveRegion = null
  }
}

/**
 * 使用模板无障碍支持
 */
export function useTemplateA11y(config: A11yConfig = {}) {
  const focusManager = new FocusManager()
  const announcer = new ScreenReaderAnnouncer()
  
  const containerRef = ref<HTMLElement | null>(null)
  const isHighContrast = ref(config.highContrast || false)
  const isReducedMotion = ref(config.reducedMotion || false)
  const isScreenReaderMode = ref(config.screenReaderMode || false)
  
  let cleanupFunctions: (() => void)[] = []
  
  /**
   * 设置容器
   */
  const setContainer = (element: HTMLElement) => {
    containerRef.value = element
    
    if (config.keyboardNavigation) {
      focusManager.init(element)
      
      if (config.trapFocus) {
        const cleanup = focusManager.trapFocus()
        if (cleanup) cleanupFunctions.push(cleanup)
      }
    }
    
    // 设置 ARIA 属性
    if (config.ariaLabels) {
      Object.entries(config.ariaLabels).forEach(([key, value]) => {
        const el = element.querySelector(`[data-a11y="${key}"]`)
        if (el) el.setAttribute('aria-label', value)
      })
    }
    
    if (config.ariaDescriptions) {
      Object.entries(config.ariaDescriptions).forEach(([key, value]) => {
        const el = element.querySelector(`[data-a11y="${key}"]`)
        if (el) el.setAttribute('aria-describedby', value)
      })
    }
    
    // 设置语义化属性
    if (config.landmark) {
      element.setAttribute('role', config.landmark)
    }
    
    if (config.headingLevel) {
      const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6')
      headings.forEach(heading => {
        heading.setAttribute('aria-level', String(config.headingLevel))
      })
    }
  }
  
  /**
   * 注册快捷键
   */
  const registerShortcuts = () => {
    if (!config.shortcuts) return
    
    const handleKeydown = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.altKey && 'alt',
        e.shiftKey && 'shift',
        e.metaKey && 'meta',
        e.key.toLowerCase()
      ].filter(Boolean).join('+')
      
      const handler = config.shortcuts![key]
      if (handler) {
        e.preventDefault()
        handler()
      }
    }
    
    document.addEventListener('keydown', handleKeydown)
    cleanupFunctions.push(() => {
      document.removeEventListener('keydown', handleKeydown)
    })
  }
  
  /**
   * 检测用户偏好
   */
  const detectUserPreferences = () => {
    // 检测高对比度
    if (window.matchMedia) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
      isHighContrast.value = highContrastQuery.matches
      
      const handleHighContrastChange = (e: MediaQueryListEvent) => {
        isHighContrast.value = e.matches
      }
      
      highContrastQuery.addEventListener('change', handleHighContrastChange)
      cleanupFunctions.push(() => {
        highContrastQuery.removeEventListener('change', handleHighContrastChange)
      })
      
      // 检测减少动画
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      isReducedMotion.value = reducedMotionQuery.matches
      
      const handleReducedMotionChange = (e: MediaQueryListEvent) => {
        isReducedMotion.value = e.matches
      }
      
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange)
      cleanupFunctions.push(() => {
        reducedMotionQuery.removeEventListener('change', handleReducedMotionChange)
      })
    }
  }
  
  /**
   * 公告消息
   */
  const announce = (message: string) => {
    if (config.announceChanges) {
      announcer.announce(message)
    }
  }
  
  /**
   * 聚焦管理
   */
  const focus = {
    first: () => focusManager.focusFirst(),
    last: () => focusManager.focusLast(),
    next: () => focusManager.focusNext(),
    previous: () => focusManager.focusPrevious(),
    restore: () => focusManager.restoreFocus(),
    update: () => focusManager.updateFocusableElements()
  }
  
  /**
   * 应用无障碍样式
   */
  const applyA11yStyles = () => {
    if (!containerRef.value) return
    
    const element = containerRef.value
    
    // 高对比度
    if (isHighContrast.value) {
      element.classList.add('high-contrast')
    } else {
      element.classList.remove('high-contrast')
    }
    
    // 减少动画
    if (isReducedMotion.value) {
      element.classList.add('reduced-motion')
    } else {
      element.classList.remove('reduced-motion')
    }
    
    // 焦点指示器
    if (config.focusIndicator) {
      element.classList.add('focus-visible')
    }
    
    // 屏幕阅读器模式
    if (isScreenReaderMode.value) {
      element.classList.add('screen-reader-mode')
    } else {
      element.classList.remove('screen-reader-mode')
    }
  }
  
  // 监听配置变化
  watch([isHighContrast, isReducedMotion, isScreenReaderMode], () => {
    applyA11yStyles()
  })
  
  // 初始化
  onMounted(() => {
    if (config.announceChanges) {
      announcer.init(config.liveRegion || 'polite')
    }
    
    detectUserPreferences()
    registerShortcuts()
    
    nextTick(() => {
      applyA11yStyles()
    })
  })
  
  // 清理
  onUnmounted(() => {
    focusManager.cleanup()
    announcer.cleanup()
    cleanupFunctions.forEach(fn => fn())
    cleanupFunctions = []
  })
  
  return {
    setContainer,
    announce,
    focus,
    isHighContrast: computed(() => isHighContrast.value),
    isReducedMotion: computed(() => isReducedMotion.value),
    isScreenReaderMode: computed(() => isScreenReaderMode.value),
    toggleHighContrast: () => { isHighContrast.value = !isHighContrast.value },
    toggleReducedMotion: () => { isReducedMotion.value = !isReducedMotion.value },
    toggleScreenReaderMode: () => { isScreenReaderMode.value = !isScreenReaderMode.value }
  }
}

/**
 * 创建无障碍样式
 */
export function createA11yStyles(): string {
  return `
    /* 高对比度模式 */
    .high-contrast {
      filter: contrast(1.5);
    }
    
    .high-contrast * {
      border-width: 2px !important;
    }
    
    .high-contrast button,
    .high-contrast a,
    .high-contrast input,
    .high-contrast select,
    .high-contrast textarea {
      outline: 2px solid currentColor !important;
      outline-offset: 2px !important;
    }
    
    /* 减少动画模式 */
    .reduced-motion *,
    .reduced-motion *::before,
    .reduced-motion *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    /* 焦点指示器 */
    .focus-visible :focus {
      outline: 3px solid #4A90E2 !important;
      outline-offset: 2px !important;
    }
    
    .focus-visible :focus:not(:focus-visible) {
      outline: none !important;
    }
    
    /* 屏幕阅读器模式 */
    .screen-reader-mode .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    
    .screen-reader-mode .sr-only-focusable:focus {
      position: static;
      width: auto;
      height: auto;
      padding: inherit;
      margin: inherit;
      overflow: visible;
      clip: auto;
      white-space: normal;
    }
    
    /* 跳转链接 */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px;
      text-decoration: none;
      z-index: 100;
    }
    
    .skip-link:focus {
      top: 0;
    }
  `
}