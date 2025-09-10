/**
 * @file v-widget-container 指令
 * @description 将元素转换为挂件容器的指令
 */

import type { Directive } from 'vue'
import type { WidgetContainerDirectiveBinding } from '../types'
import type { WidgetConfig } from '../../core/types'

/**
 * 挂件容器指令
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <div v-widget-container="{ enabled: true }">
 *     内容
 *   </div>
 *   
 *   <!-- 带挂件配置 -->
 *   <div v-widget-container="{
 *     enabled: true,
 *     widgets: [
 *       {
 *         id: 'custom-widget',
 *         type: 'floating',
 *         content: '<div>🎉</div>',
 *         position: { type: 'fixed', position: { x: '50%', y: '50%' } }
 *       }
 *     ],
 *     maxWidgets: 10
 *   }">
 *     内容
 *   </div>
 * </template>
 * ```
 */
export const vWidgetContainer: Directive<HTMLElement, WidgetContainerDirectiveBinding> = {
  mounted(el, binding) {
    const { enabled = true, widgets = [], maxWidgets = 20 } = binding.value || {}
    
    if (!enabled) return
    
    // 设置容器样式
    el.classList.add('ldesign-widget-container')
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    
    // 存储配置
    ;(el as any)._widgetContainer = {
      enabled,
      widgets: [...widgets],
      maxWidgets,
      renderedWidgets: new Map()
    }
    
    // 渲染挂件
    renderWidgets(el)
  },
  
  updated(el, binding) {
    const { enabled = true, widgets = [], maxWidgets = 20 } = binding.value || {}
    const containerData = (el as any)._widgetContainer
    
    if (!containerData) return
    
    // 更新配置
    containerData.enabled = enabled
    containerData.maxWidgets = maxWidgets
    
    // 如果禁用，清理所有挂件
    if (!enabled) {
      clearWidgets(el)
      return
    }
    
    // 更新挂件列表
    const oldWidgets = containerData.widgets
    const newWidgets = [...widgets]
    
    // 找出需要移除的挂件
    const toRemove = oldWidgets.filter((oldWidget: WidgetConfig) => 
      !newWidgets.find(newWidget => newWidget.id === oldWidget.id)
    )
    
    // 找出需要添加的挂件
    const toAdd = newWidgets.filter(newWidget => 
      !oldWidgets.find((oldWidget: WidgetConfig) => oldWidget.id === newWidget.id)
    )
    
    // 找出需要更新的挂件
    const toUpdate = newWidgets.filter(newWidget => {
      const oldWidget = oldWidgets.find((old: WidgetConfig) => old.id === newWidget.id)
      return oldWidget && JSON.stringify(oldWidget) !== JSON.stringify(newWidget)
    })
    
    // 执行更新
    toRemove.forEach((widget: WidgetConfig) => removeWidget(el, widget.id))
    toAdd.forEach((widget: WidgetConfig) => addWidget(el, widget))
    toUpdate.forEach((widget: WidgetConfig) => updateWidget(el, widget))
    
    // 更新挂件列表
    containerData.widgets = newWidgets
  },
  
  unmounted(el) {
    clearWidgets(el)
    delete (el as any)._widgetContainer
  }
}

/**
 * 渲染所有挂件
 */
function renderWidgets(el: HTMLElement) {
  const containerData = (el as any)._widgetContainer
  if (!containerData || !containerData.enabled) return
  
  const { widgets, maxWidgets } = containerData
  const widgetsToRender = widgets.slice(0, maxWidgets)
  
  widgetsToRender.forEach((widget: WidgetConfig) => {
    addWidget(el, widget)
  })
}

/**
 * 添加挂件
 */
function addWidget(el: HTMLElement, widget: WidgetConfig) {
  const containerData = (el as any)._widgetContainer
  if (!containerData) return
  
  // 检查是否已存在
  if (containerData.renderedWidgets.has(widget.id)) {
    updateWidget(el, widget)
    return
  }
  
  // 创建挂件元素
  const widgetEl = document.createElement('div')
  widgetEl.className = `ldesign-widget ldesign-widget-${widget.type}`
  widgetEl.setAttribute('data-widget-id', widget.id)
  widgetEl.innerHTML = widget.content
  
  // 设置样式
  applyWidgetStyles(widgetEl, widget)
  
  // 添加到容器
  el.appendChild(widgetEl)
  
  // 记录已渲染的挂件
  containerData.renderedWidgets.set(widget.id, widgetEl)
  
  // 添加交互事件
  if (widget.interactive) {
    widgetEl.style.cursor = 'pointer'
    widgetEl.addEventListener('click', () => {
      widgetEl.style.transform = 'scale(1.1)'
      setTimeout(() => {
        widgetEl.style.transform = ''
      }, 200)
    })
  }
}

/**
 * 更新挂件
 */
function updateWidget(el: HTMLElement, widget: WidgetConfig) {
  const containerData = (el as any)._widgetContainer
  if (!containerData) return
  
  const widgetEl = containerData.renderedWidgets.get(widget.id)
  if (!widgetEl) {
    addWidget(el, widget)
    return
  }
  
  // 更新内容
  widgetEl.innerHTML = widget.content
  
  // 更新样式
  applyWidgetStyles(widgetEl, widget)
}

/**
 * 移除挂件
 */
function removeWidget(el: HTMLElement, widgetId: string) {
  const containerData = (el as any)._widgetContainer
  if (!containerData) return
  
  const widgetEl = containerData.renderedWidgets.get(widgetId)
  if (widgetEl) {
    widgetEl.remove()
    containerData.renderedWidgets.delete(widgetId)
  }
}

/**
 * 清理所有挂件
 */
function clearWidgets(el: HTMLElement) {
  const containerData = (el as any)._widgetContainer
  if (!containerData) return
  
  containerData.renderedWidgets.forEach((widgetEl: HTMLElement) => {
    widgetEl.remove()
  })
  containerData.renderedWidgets.clear()
}

/**
 * 应用挂件样式
 */
function applyWidgetStyles(widgetEl: HTMLElement, widget: WidgetConfig) {
  // 基础样式
  widgetEl.style.position = 'absolute'
  widgetEl.style.pointerEvents = 'auto'
  widgetEl.style.transition = 'all 0.3s ease'
  
  // 位置样式
  if (widget.position) {
    const { position, anchor } = widget.position
    
    if (typeof position.x === 'string') {
      widgetEl.style.left = position.x
    } else {
      widgetEl.style.left = `${position.x}px`
    }
    
    if (typeof position.y === 'string') {
      widgetEl.style.top = position.y
    } else {
      widgetEl.style.top = `${position.y}px`
    }
    
    // 处理锚点
    if (anchor) {
      const [vAlign, hAlign] = anchor.split('-')
      let transform = ''
      
      if (vAlign === 'center') {
        transform += 'translateY(-50%)'
      } else if (vAlign === 'bottom') {
        widgetEl.style.bottom = widgetEl.style.top
        widgetEl.style.top = 'auto'
      }
      
      if (hAlign === 'center') {
        transform += transform ? ' translateX(-50%)' : 'translateX(-50%)'
      } else if (hAlign === 'right') {
        widgetEl.style.right = widgetEl.style.left
        widgetEl.style.left = 'auto'
      }
      
      if (transform) {
        widgetEl.style.transform = transform
      }
    }
  }
  
  // 自定义样式
  if (widget.style) {
    Object.assign(widgetEl.style, widget.style)
  }
  
  // 可见性
  if (widget.visible === false) {
    widgetEl.style.display = 'none'
  } else {
    widgetEl.style.display = ''
  }
}
