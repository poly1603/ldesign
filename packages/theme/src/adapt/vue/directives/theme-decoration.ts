/**
 * @ldesign/theme - v-theme-decoration 指令
 *
 * 为元素添加主题装饰效果
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { DecorationConfig, VThemeDecorationBinding } from '../types'
import { DecorationFactory } from '../../../decorations/factory'

/**
 * 装饰元素映射
 */
const decorationMap = new WeakMap<HTMLElement, any>()

/**
 * v-theme-decoration 指令实现
 */
export const vThemeDecoration: Directive<HTMLElement, VThemeDecorationBinding>
  = {
    mounted(
      el: HTMLElement,
      binding: DirectiveBinding<VThemeDecorationBinding>,
    ) {
      createDecoration(el, binding)
    },

    updated(
      el: HTMLElement,
      binding: DirectiveBinding<VThemeDecorationBinding>,
    ) {
      updateDecoration(el, binding)
    },

    unmounted(el: HTMLElement) {
      removeDecoration(el)
    },
  }

/**
 * 创建装饰元素
 */
function createDecoration(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeDecorationBinding>,
) {
  const {
    decoration,
    visible = true,
    interactive = false,
    container,
  } = binding.value

  if (!decoration || !visible) {
    return
  }

  try {
    let decorationConfig: DecorationConfig

    if (typeof decoration === 'string') {
      // 字符串类型，创建默认配置
      decorationConfig = {
        id: `directive-decoration-${Math.random().toString(36).substr(2, 9)}`,
        name: `指令装饰-${decoration}`,
        type: 'icon',
        src: decoration,
        position: {
          type: 'absolute',
          position: { x: '0px', y: '0px' },
          anchor: 'top-left',
        },
        style: {
          size: { width: '20px', height: '20px' },
          opacity: 1,
          zIndex: 1000,
        },
        interactive,
        responsive: true,
      }
    }
    else {
      // 对象类型，使用提供的配置
      decorationConfig = decoration
    }

    // 确定容器
    const targetContainer = container
      ? typeof container === 'string'
        ? document.querySelector(container)
        : container
      : el.parentElement || document.body

    if (!targetContainer) {
      console.warn('[v-theme-decoration] Container not found')
      return
    }

    // 创建装饰实例
    const decorationInstance = DecorationFactory.create(
      decorationConfig,
      targetContainer as HTMLElement,
    )

    // 显示装饰
    decorationInstance.show()

    // 存储装饰实例
    decorationMap.set(el, decorationInstance)

    // 添加修饰符处理
    handleModifiers(el, binding, decorationInstance)
  }
  catch (error) {
    console.error('[v-theme-decoration] Failed to create decoration:', error)
  }
}

/**
 * 更新装饰元素
 */
function updateDecoration(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeDecorationBinding>,
) {
  const decorationInstance = decorationMap.get(el)
  const { visible = true } = binding.value

  if (!decorationInstance) {
    // 如果没有装饰实例，创建新的
    createDecoration(el, binding)
    return
  }

  if (!visible) {
    // 隐藏装饰
    decorationInstance.hide()
  }
  else {
    // 显示装饰
    decorationInstance.show()

    // 更新配置
    const { decoration } = binding.value
    if (typeof decoration === 'object') {
      decorationInstance.updateConfig(decoration)
    }
  }

  // 更新修饰符处理
  handleModifiers(el, binding, decorationInstance)
}

/**
 * 移除装饰元素
 */
function removeDecoration(el: HTMLElement) {
  const decorationInstance = decorationMap.get(el)

  if (decorationInstance) {
    decorationInstance.destroy()
    decorationMap.delete(el)
  }
}

/**
 * 处理指令修饰符
 */
function handleModifiers(
  el: HTMLElement,
  binding: DirectiveBinding<VThemeDecorationBinding>,
  decorationInstance: any,
) {
  const { modifiers } = binding

  // .hover 修饰符 - 悬停时显示
  if (modifiers.hover) {
    el.addEventListener('mouseenter', () => {
      decorationInstance.show()
    })

    el.addEventListener('mouseleave', () => {
      decorationInstance.hide()
    })

    // 初始隐藏
    decorationInstance.hide()
  }

  // .click 修饰符 - 点击时切换
  if (modifiers.click) {
    el.addEventListener('click', () => {
      if (decorationInstance.isShown()) {
        decorationInstance.hide()
      }
      else {
        decorationInstance.show()
      }
    })
  }

  // .once 修饰符 - 只显示一次
  if (modifiers.once) {
    const showOnce = () => {
      decorationInstance.show()
      el.removeEventListener('mouseenter', showOnce)
      el.removeEventListener('click', showOnce)
    }

    if (modifiers.hover) {
      el.addEventListener('mouseenter', showOnce)
    }
    else if (modifiers.click) {
      el.addEventListener('click', showOnce)
    }
    else {
      // 立即显示一次
      decorationInstance.show()
    }
  }

  // .delay 修饰符 - 延迟显示
  if (modifiers.delay) {
    const delay = Number.parseInt(binding.arg || '1000', 10)

    setTimeout(() => {
      decorationInstance.show()
    }, delay)
  }
}

/**
 * 获取元素的装饰实例
 */
export function getElementDecoration(el: HTMLElement) {
  return decorationMap.get(el)
}

/**
 * 检查元素是否有装饰
 */
export function hasElementDecoration(el: HTMLElement): boolean {
  return decorationMap.has(el)
}

/**
 * 清除所有装饰
 */
export function clearAllDecorations() {
  for (const [el, decoration] of decorationMap.entries()) {
    decoration.destroy()
    decorationMap.delete(el)
  }
}

export default vThemeDecoration
