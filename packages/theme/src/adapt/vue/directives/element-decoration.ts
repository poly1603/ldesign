/**
 * Vue指令：基于元素类型的装饰系统
 *
 * 使用方式：
 * <button v-element-decoration="'button'">按钮</button>
 * <div v-element-decoration="{ element: 'card', position: 'top-right' }">卡片</div>
 */

import type { Directive, DirectiveBinding } from 'vue'
import {
  getElementDecorations,
  isElementSupported,
  generateDecorationClass,
  type ElementType,
  type DecorationPosition,
} from '../../../widgets/element-decorations'

interface DecorationConfig {
  element: ElementType
  position?: DecorationPosition
  theme?: string
}

// 当前主题状态
let currentTheme = 'default'

// 存储已应用的装饰元素
const decoratedElements = new WeakMap<
  HTMLElement,
  {
    config: DecorationConfig
    decorationElements: HTMLElement[]
  }
>()

/**
 * 设置当前主题
 */
export function setCurrentTheme(theme: string) {
  currentTheme = theme
  // 重新应用所有装饰
  reapplyAllDecorations()
}

/**
 * 重新应用所有装饰
 */
function reapplyAllDecorations() {
  // 这里可以遍历所有已装饰的元素并重新应用
  // 由于WeakMap的限制，我们通过事件系统来通知更新
  window.dispatchEvent(
    new CustomEvent('theme-decoration-update', {
      detail: { theme: currentTheme },
    })
  )
}

/**
 * 应用装饰到元素
 */
function applyDecoration(el: HTMLElement, config: DecorationConfig) {
  // 清除旧装饰
  clearDecoration(el)

  const { element, position, theme = currentTheme } = config

  // 获取该元素类型的装饰配置
  const decorations = getElementDecorations(theme as any, element)

  if (decorations.length === 0) return

  const decorationElements: HTMLElement[] = []

  decorations.forEach(decoration => {
    // 如果指定了位置，只应用匹配的装饰
    if (position && decoration.position !== position) return

    // 创建装饰元素
    const decorationEl = document.createElement('div')
    decorationEl.className = `theme-decoration ${generateDecorationClass(
      element,
      decoration.position,
      theme
    )}`
    decorationEl.textContent = decoration.content

    // 应用样式
    if (decoration.style) {
      const { size, opacity, zIndex, animation } = decoration.style

      if (size) decorationEl.classList.add(`decoration-${size}`)
      if (opacity !== undefined) decorationEl.style.opacity = opacity.toString()
      if (zIndex !== undefined) decorationEl.style.zIndex = zIndex.toString()
      if (animation) decorationEl.classList.add(`animation-${animation}`)
    }

    // 设置位置样式
    decorationEl.classList.add(`position-${decoration.position}`)

    // 添加到目标元素
    el.style.position = el.style.position || 'relative'
    el.appendChild(decorationEl)

    decorationElements.push(decorationEl)
  })

  // 存储装饰信息
  decoratedElements.set(el, { config, decorationElements })
}

/**
 * 清除元素装饰
 */
function clearDecoration(el: HTMLElement) {
  const decorationInfo = decoratedElements.get(el)
  if (decorationInfo) {
    decorationInfo.decorationElements.forEach(decorationEl => {
      decorationEl.remove()
    })
    decoratedElements.delete(el)
  }
}

/**
 * 解析指令绑定值
 */
function parseBinding(binding: DirectiveBinding): DecorationConfig | null {
  const { value } = binding

  if (typeof value === 'string') {
    if (isElementSupported(value)) {
      return { element: value }
    }
    console.warn(`[element-decoration] 不支持的元素类型: ${value}`)
    return null
  }

  if (typeof value === 'object' && value !== null) {
    const { element, position, theme } = value

    if (!isElementSupported(element)) {
      console.warn(`[element-decoration] 不支持的元素类型: ${element}`)
      return null
    }

    return { element, position, theme }
  }

  console.warn('[element-decoration] 无效的绑定值:', value)
  return null
}

/**
 * Vue指令定义
 */
export const vElementDecoration: Directive<
  HTMLElement,
  string | DecorationConfig
> = {
  mounted(el, binding) {
    const config = parseBinding(binding)
    if (config) {
      applyDecoration(el, config)

      // 监听主题更新事件
      const handleThemeUpdate = (event: CustomEvent) => {
        const newConfig = { ...config, theme: event.detail.theme }
        applyDecoration(el, newConfig)
      }

      window.addEventListener(
        'theme-decoration-update',
        handleThemeUpdate as EventListener
      )

      // 存储事件监听器以便清理
      ;(el as any).__themeUpdateHandler = handleThemeUpdate
    }
  },

  updated(el, binding) {
    const config = parseBinding(binding)
    if (config) {
      applyDecoration(el, config)
    }
  },

  unmounted(el) {
    clearDecoration(el)

    // 清理事件监听器
    const handler = (el as any).__themeUpdateHandler
    if (handler) {
      window.removeEventListener('theme-decoration-update', handler)
      delete (el as any).__themeUpdateHandler
    }
  },
}

// 导出便捷函数
export { setCurrentTheme as updateTheme }
