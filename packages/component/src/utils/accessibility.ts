/**
 * 无障碍访问支持工具
 * 
 * 提供 ARIA 属性管理、屏幕阅读器支持和无障碍访问功能
 */

import { ref, onMounted, onUnmounted, type Ref } from 'vue'

/**
 * ARIA 角色类型
 */
export type AriaRole =
  | 'button' | 'checkbox' | 'radio' | 'textbox' | 'combobox' | 'listbox' | 'option'
  | 'menu' | 'menuitem' | 'menubar' | 'tab' | 'tabpanel' | 'tablist'
  | 'dialog' | 'alertdialog' | 'alert' | 'status' | 'progressbar'
  | 'slider' | 'spinbutton' | 'switch' | 'tree' | 'treeitem'
  | 'grid' | 'gridcell' | 'row' | 'columnheader' | 'rowheader'
  | 'banner' | 'main' | 'navigation' | 'complementary' | 'contentinfo'
  | 'region' | 'article' | 'section' | 'search' | 'form'

/**
 * ARIA 状态类型
 */
export interface AriaStates {
  /** 是否展开 */
  expanded?: boolean
  /** 是否选中 */
  selected?: boolean
  /** 是否选中（复选框） */
  checked?: boolean | 'mixed'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否按下 */
  pressed?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 是否无效 */
  invalid?: boolean
  /** 当前值 */
  current?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  /** 是否有弹出层 */
  haspopup?: boolean | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog'
}

/**
 * ARIA 属性类型
 */
export interface AriaProperties {
  /** 标签 */
  label?: string
  /** 标签引用 */
  labelledby?: string
  /** 描述引用 */
  describedby?: string
  /** 详细描述引用 */
  details?: string
  /** 控制的元素 */
  controls?: string
  /** 拥有的元素 */
  owns?: string
  /** 活动后代 */
  activedescendant?: string
  /** 最小值 */
  valuemin?: number
  /** 最大值 */
  valuemax?: number
  /** 当前值 */
  valuenow?: number
  /** 值文本 */
  valuetext?: string
  /** 方向 */
  orientation?: 'horizontal' | 'vertical'
  /** 自动完成 */
  autocomplete?: 'none' | 'inline' | 'list' | 'both'
  /** 键盘快捷键 */
  keyshortcuts?: string
  /** 实时区域 */
  live?: 'off' | 'polite' | 'assertive'
  /** 原子性 */
  atomic?: boolean
  /** 相关性 */
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  /** 忙碌状态 */
  busy?: boolean
  /** 拖放效果 */
  dropeffect?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup'
  /** 可抓取 */
  grabbed?: boolean
  /** 层级 */
  level?: number
  /** 位置 */
  posinset?: number
  /** 集合大小 */
  setsize?: number
}

/**
 * 完整的 ARIA 属性
 */
export interface AriaAttributes extends AriaStates, AriaProperties {
  role?: AriaRole
}

/**
 * 无障碍访问配置
 */
export interface AccessibilityOptions {
  /** 是否启用无障碍访问 */
  enabled?: boolean
  /** 是否启用键盘导航 */
  keyboardNavigation?: boolean
  /** 是否启用屏幕阅读器支持 */
  screenReader?: boolean
  /** 是否启用高对比度模式 */
  highContrast?: boolean
  /** 是否启用减少动画 */
  reducedMotion?: boolean
  /** 自定义 ARIA 属性 */
  aria?: AriaAttributes
}

/**
 * 屏幕阅读器公告类型
 */
export type AnnouncementPriority = 'polite' | 'assertive'

/**
 * ARIA 属性管理器
 */
export class AriaManager {
  private element: HTMLElement | null = null
  private attributes = new Map<string, string | boolean | number>()

  /**
   * 绑定到元素
   */
  bind(element: HTMLElement): void {
    this.element = element
    this.applyAttributes()
  }

  /**
   * 设置 ARIA 属性
   */
  set(key: keyof AriaAttributes, value: string | boolean | number | undefined): void {
    if (value === undefined) {
      this.attributes.delete(key)
    } else {
      this.attributes.set(key, value)
    }
    this.applyAttributes()
  }

  /**
   * 批量设置 ARIA 属性
   */
  setMultiple(attributes: Partial<AriaAttributes>): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined) {
        this.attributes.delete(key)
      } else {
        this.attributes.set(key, value)
      }
    })
    this.applyAttributes()
  }

  /**
   * 获取 ARIA 属性
   */
  get(key: keyof AriaAttributes): string | boolean | number | undefined {
    return this.attributes.get(key)
  }

  /**
   * 移除 ARIA 属性
   */
  remove(key: keyof AriaAttributes): void {
    this.attributes.delete(key)
    this.applyAttributes()
  }

  /**
   * 清除所有 ARIA 属性
   */
  clear(): void {
    this.attributes.clear()
    this.applyAttributes()
  }

  /**
   * 应用属性到元素
   */
  private applyAttributes(): void {
    if (!this.element) return

    // 移除所有现有的 ARIA 属性
    Array.from(this.element.attributes).forEach(attr => {
      if (attr.name.startsWith('aria-') || attr.name === 'role') {
        this.element!.removeAttribute(attr.name)
      }
    })

    // 应用新的属性
    this.attributes.forEach((value, key) => {
      const attrName = key === 'role' ? 'role' : `aria-${this.camelToKebab(key)}`
      this.element!.setAttribute(attrName, String(value))
    })
  }

  /**
   * 驼峰转短横线
   */
  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  }
}

/**
 * 屏幕阅读器公告管理器
 */
export class ScreenReaderAnnouncer {
  private politeRegion: HTMLElement | null = null
  private assertiveRegion: HTMLElement | null = null

  constructor() {
    this.createLiveRegions()
  }

  /**
   * 创建实时区域
   */
  private createLiveRegions(): void {
    // 创建 polite 实时区域
    this.politeRegion = document.createElement('div')
    this.politeRegion.setAttribute('aria-live', 'polite')
    this.politeRegion.setAttribute('aria-atomic', 'true')
    this.politeRegion.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    `
    document.body.appendChild(this.politeRegion)

    // 创建 assertive 实时区域
    this.assertiveRegion = document.createElement('div')
    this.assertiveRegion.setAttribute('aria-live', 'assertive')
    this.assertiveRegion.setAttribute('aria-atomic', 'true')
    this.assertiveRegion.style.cssText = `
      position: absolute !important;
      left: -10000px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
    `
    document.body.appendChild(this.assertiveRegion)
  }

  /**
   * 发布公告
   */
  announce(message: string, priority: AnnouncementPriority = 'polite'): void {
    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion
    if (!region) return

    // 清空内容，然后设置新内容
    region.textContent = ''
    setTimeout(() => {
      region.textContent = message
    }, 100)
  }

  /**
   * 销毁实时区域
   */
  destroy(): void {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion)
      this.politeRegion = null
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion)
      this.assertiveRegion = null
    }
  }
}

/**
 * 全局屏幕阅读器公告器实例
 */
let globalAnnouncer: ScreenReaderAnnouncer | null = null

/**
 * 获取全局公告器
 */
function getGlobalAnnouncer(): ScreenReaderAnnouncer {
  if (!globalAnnouncer) {
    globalAnnouncer = new ScreenReaderAnnouncer()
  }
  return globalAnnouncer
}

/**
 * 无障碍访问 Composable
 */
export function useAccessibility(
  element: Ref<HTMLElement | null>,
  options: AccessibilityOptions = {}
) {
  const ariaManager = new AriaManager()
  const isActive = ref(false)

  // 检测用户偏好
  const prefersReducedMotion = ref(false)
  const prefersHighContrast = ref(false)

  onMounted(() => {
    if (element.value && options.enabled !== false) {
      ariaManager.bind(element.value)
      isActive.value = true

      // 应用初始 ARIA 属性
      if (options.aria) {
        ariaManager.setMultiple(options.aria)
      }

      // 检测用户偏好
      updateUserPreferences()
    }
  })

  onUnmounted(() => {
    isActive.value = false
  })

  /**
   * 更新用户偏好
   */
  const updateUserPreferences = () => {
    // 检测减少动画偏好
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = reducedMotionQuery.matches

    // 检测高对比度偏好
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    prefersHighContrast.value = highContrastQuery.matches

    // 监听偏好变化
    reducedMotionQuery.addEventListener('change', (e) => {
      prefersReducedMotion.value = e.matches
    })

    highContrastQuery.addEventListener('change', (e) => {
      prefersHighContrast.value = e.matches
    })
  }

  /**
   * 发布屏幕阅读器公告
   */
  const announce = (message: string, priority: AnnouncementPriority = 'polite') => {
    if (options.screenReader !== false) {
      getGlobalAnnouncer().announce(message, priority)
    }
  }

  return {
    isActive,
    prefersReducedMotion,
    prefersHighContrast,

    // ARIA 管理
    setAria: ariaManager.set.bind(ariaManager),
    setMultipleAria: ariaManager.setMultiple.bind(ariaManager),
    getAria: ariaManager.get.bind(ariaManager),
    removeAria: ariaManager.remove.bind(ariaManager),
    clearAria: ariaManager.clear.bind(ariaManager),

    // 屏幕阅读器
    announce
  }
}

/**
 * 检查元素是否对屏幕阅读器可见
 */
export function isAccessible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)

  // 检查是否隐藏
  if (style.display === 'none' ||
    style.visibility === 'hidden' ||
    element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
    return false
  }

  // 检查是否在视口外
  const rect = element.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) {
    return false
  }

  return true
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix = 'ldesign'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 全局公告函数
 */
export function announce(message: string, priority: AnnouncementPriority = 'polite'): void {
  getGlobalAnnouncer().announce(message, priority)
}

/**
 * 检测是否启用了减少动画
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 检测是否启用了高对比度
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}
