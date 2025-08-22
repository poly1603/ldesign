/**
 * @ldesign/theme - Vue 装饰挂件指令
 *
 * 提供 v-widget-decoration 指令，用于在元素上附加装饰挂件
 */

import type { Directive, DirectiveBinding } from 'vue'
import type {
  DecorationWidget,
  DecorationAttachment,
} from '../../../core/types'

/**
 * 挂件元素映射
 */
const widgetMap = new Map<HTMLElement, HTMLElement[]>()

/**
 * 当前主题的挂件注册表
 */
let currentWidgets: Map<string, DecorationWidget> = new Map()

/**
 * 注册挂件到当前主题
 */
export function registerWidgets(widgets: DecorationWidget[]) {
  currentWidgets.clear()
  widgets.forEach(widget => {
    currentWidgets.set(widget.id, widget)
  })

  // 更新所有已附加的挂件
  updateAllWidgets()
}

/**
 * 更新所有已附加的挂件
 */
function updateAllWidgets() {
  for (const [element, widgetElements] of widgetMap.entries()) {
    // 移除旧挂件
    widgetElements.forEach(widgetEl => {
      if (widgetEl.parentNode) {
        widgetEl.parentNode.removeChild(widgetEl)
      }
    })

    // 重新附加挂件
    const binding = (element as any).__widgetBinding
    if (binding) {
      attachWidget(element, binding)
    }
  }
}

/**
 * 创建挂件元素
 */
function createWidgetElement(
  widget: DecorationWidget,
  attachment: DecorationAttachment
): HTMLElement {
  const container = document.createElement('div')
  container.className = `ldesign-widget ldesign-widget-${widget.id}`
  container.innerHTML = widget.content

  // 设置基础样式
  Object.assign(container.style, {
    position: 'absolute',
    pointerEvents: widget.interactive ? 'auto' : 'none',
    zIndex: (attachment.zIndex || 100).toString(),
    opacity: (attachment.opacity || 1).toString(),
    transform: `scale(${attachment.scale || 1})`,
    transition: 'all 0.3s ease',
  })

  // 设置位置
  setWidgetPosition(container, widget, attachment)

  // 添加动画
  if (widget.animation) {
    addWidgetAnimation(container, widget.animation)
  }

  return container
}

/**
 * 设置挂件位置
 */
function setWidgetPosition(
  element: HTMLElement,
  widget: DecorationWidget,
  attachment: DecorationAttachment
) {
  const position = attachment.position || 'top-right'
  const offset = attachment.offset || { x: 0, y: 0 }

  // 根据挂件类别和位置设置样式
  switch (widget.category) {
    case 'corner':
      switch (position) {
        case 'top-left':
          Object.assign(element.style, {
            top: `${offset.y}px`,
            left: `${offset.x}px`,
          })
          break
        case 'top-right':
          Object.assign(element.style, {
            top: `${offset.y}px`,
            right: `${-offset.x}px`,
          })
          break
        case 'bottom-left':
          Object.assign(element.style, {
            bottom: `${-offset.y}px`,
            left: `${offset.x}px`,
          })
          break
        case 'bottom-right':
          Object.assign(element.style, {
            bottom: `${-offset.y}px`,
            right: `${-offset.x}px`,
          })
          break
      }
      break

    case 'edge':
      switch (position) {
        case 'top-left':
        case 'top-right':
          Object.assign(element.style, {
            top: `${-12 + offset.y}px`,
            left: '50%',
            transform: `translateX(-50%) scale(${attachment.scale || 1})`,
          })
          break
        default:
          Object.assign(element.style, {
            top: '50%',
            right: `${-12 + offset.x}px`,
            transform: `translateY(-50%) scale(${attachment.scale || 1})`,
          })
      }
      break

    case 'overlay':
      Object.assign(element.style, {
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${attachment.scale || 1})`,
      })
      break

    case 'background':
      Object.assign(element.style, {
        top: `${20 + offset.y}%`,
        left: `${20 + offset.x}%`,
        opacity: '0.3',
      })
      break
  }
}

/**
 * 添加挂件动画
 */
function addWidgetAnimation(element: HTMLElement, animation: any) {
  const keyframeName = `ldesign-${animation.name}`

  // 检查是否已经添加了动画样式
  if (!document.querySelector(`style[data-animation="${keyframeName}"]`)) {
    const style = document.createElement('style')
    style.setAttribute('data-animation', keyframeName)

    // 根据动画名称生成关键帧
    let keyframes = ''
    switch (animation.name) {
      case 'lantern-swing':
        keyframes = `
          @keyframes ${keyframeName} {
            0% { transform: rotate(-5deg) scale(${
              element.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1
            }); }
            100% { transform: rotate(5deg) scale(${
              element.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1
            }); }
          }
        `
        break
      case 'snowflake-fall':
        keyframes = `
          @keyframes ${keyframeName} {
            0% { transform: translateY(-10px) rotate(0deg) scale(${
              element.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1
            }); }
            100% { transform: translateY(10px) rotate(360deg) scale(${
              element.style.transform.match(/scale\(([\d.]+)\)/)?.[1] || 1
            }); }
          }
        `
        break
      case 'firework-burst':
        keyframes = `
          @keyframes ${keyframeName} {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `
        break
      case 'bell-swing':
        keyframes = `
          @keyframes ${keyframeName} {
            0% { transform: rotate(-10deg); }
            100% { transform: rotate(10deg); }
          }
        `
        break
      default:
        keyframes = `
          @keyframes ${keyframeName} {
            0% { opacity: 0.6; }
            100% { opacity: 1; }
          }
        `
    }

    style.textContent = keyframes
    document.head.appendChild(style)
  }

  // 应用动画
  element.style.animation = `${keyframeName} ${animation.duration}ms ${
    animation.timing
  } ${animation.iteration} ${animation.direction || ''}`
  if (animation.delay) {
    element.style.animationDelay = `${animation.delay}ms`
  }
}

/**
 * 附加挂件到元素
 */
function attachWidget(element: HTMLElement, binding: any) {
  // 保存绑定信息
  ;(element as any).__widgetBinding = binding

  // 确保元素有相对定位
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative'
  }

  const widgetElements: HTMLElement[] = []

  if (typeof binding.value === 'string') {
    // 简单用法：v-widget-decoration="'red-lantern'"
    const widget = currentWidgets.get(binding.value)
    if (widget) {
      const attachment: DecorationAttachment = {
        widget: binding.value,
        position: 'top-right',
      }
      const widgetEl = createWidgetElement(widget, attachment)
      element.appendChild(widgetEl)
      widgetElements.push(widgetEl)
    }
  } else if (Array.isArray(binding.value)) {
    // 数组用法：v-widget-decoration="['red-lantern', 'fu-character']"
    binding.value.forEach((widgetId: string) => {
      const widget = currentWidgets.get(widgetId)
      if (widget) {
        const attachment: DecorationAttachment = {
          widget: widgetId,
          position: 'top-right',
        }
        const widgetEl = createWidgetElement(widget, attachment)
        element.appendChild(widgetEl)
        widgetElements.push(widgetEl)
      }
    })
  } else if (binding.value && typeof binding.value === 'object') {
    // 对象用法：v-widget-decoration="{ widget: 'red-lantern', position: 'top-left' }"
    const widget = currentWidgets.get(binding.value.widget)
    if (widget) {
      const widgetEl = createWidgetElement(widget, binding.value)
      element.appendChild(widgetEl)
      widgetElements.push(widgetEl)
    }
  }

  // 保存挂件元素引用
  widgetMap.set(element, widgetElements)
}

/**
 * 移除挂件
 */
function detachWidget(element: HTMLElement) {
  const widgetElements = widgetMap.get(element)
  if (widgetElements) {
    widgetElements.forEach(widgetEl => {
      if (widgetEl.parentNode) {
        widgetEl.parentNode.removeChild(widgetEl)
      }
    })
    widgetMap.delete(element)
  }
  delete (element as any).__widgetBinding
}

/**
 * Vue 装饰挂件指令
 */
export const vWidgetDecoration: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    attachWidget(el, binding)
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    if (binding.value !== binding.oldValue) {
      detachWidget(el)
      attachWidget(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    detachWidget(el)
  },
}

/**
 * 清理所有挂件
 */
export function cleanupAllWidgets() {
  for (const [element] of widgetMap.entries()) {
    detachWidget(element)
  }

  // 清理动画样式
  document
    .querySelectorAll('style[data-animation^="ldesign-"]')
    .forEach(style => {
      style.remove()
    })
}
