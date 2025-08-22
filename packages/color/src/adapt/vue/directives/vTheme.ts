/**
 * v-theme 指令
 * 用于动态应用主题样式到元素
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { ColorMode } from '../../../core/types'

interface ThemeDirectiveValue {
  theme?: string
  mode?: ColorMode
  colors?: Record<string, string>
  className?: string
}

/**
 * 主题指令
 *
 * 用法：
 * v-theme="'primary'"
 * v-theme="{ theme: 'primary', mode: 'dark' }"
 * v-theme="{ colors: { background: '#fff', text: '#000' } }"
 */
export const vTheme: Directive<HTMLElement, string | ThemeDirectiveValue> = {
  mounted(el, binding) {
    updateTheme(el, binding)
  },
  updated(el, binding) {
    updateTheme(el, binding)
  },
  unmounted(el) {
    // 清理主题相关的类名和样式
    el.classList.remove(
      ...Array.from(el.classList).filter(cls => cls.startsWith('l-theme-')),
    )
    el.removeAttribute('data-theme')
    el.removeAttribute('data-mode')
  },
}

function updateTheme(
  el: HTMLElement,
  binding: DirectiveBinding<string | ThemeDirectiveValue>,
) {
  const value = binding.value

  // 清理之前的主题类名
  el.classList.remove(
    ...Array.from(el.classList).filter(cls => cls.startsWith('l-theme-')),
  )

  if (typeof value === 'string') {
    // 简单字符串值，作为主题名
    el.setAttribute('data-theme', value)
    el.classList.add(`l-theme-${value}`)
  }
  else if (value && typeof value === 'object') {
    // 对象值，支持更多配置
    const { theme, mode, colors, className } = value

    if (theme) {
      el.setAttribute('data-theme', theme)
      el.classList.add(`l-theme-${theme}`)
    }

    if (mode) {
      el.setAttribute('data-mode', mode)
      el.classList.add(`l-theme-mode-${mode}`)
    }

    if (colors) {
      // 应用自定义颜色
      Object.entries(colors).forEach(([key, color]) => {
        el.style.setProperty(`--l-color-${key}`, color)
      })
    }

    if (className) {
      el.classList.add(className)
    }
  }

  // 添加基础主题类名
  if (!el.classList.contains('l-themed')) {
    el.classList.add('l-themed')
  }
}
