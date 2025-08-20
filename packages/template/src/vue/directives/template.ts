/**
 * 模板指令
 *
 * 提供 v-template 指令用于动态渲染模板
 */

import type { Directive, DirectiveBinding, App } from 'vue'
import { createApp } from 'vue'
import { TemplateManager } from '../../core/manager'
import type { DeviceType } from '../../types'

export interface TemplateDirectiveValue {
  category: string
  device?: DeviceType
  template?: string
  props?: Record<string, any>
  events?: Record<string, (...args: any[]) => void>
}

// 存储每个元素的 Vue 应用实例
const elementApps = new WeakMap<HTMLElement, App>()

/**
 * 模板指令实现
 */
export const templateDirective: Directive = {
  mounted(el: HTMLElement, binding: any) {
    updateTemplate(el, binding)
  },

  updated(el: HTMLElement, binding: any) {
    if (binding.value !== binding.oldValue) {
      updateTemplate(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    // 清理 Vue 应用实例
    const app = elementApps.get(el)
    if (app) {
      app.unmount()
      elementApps.delete(el)
    }
    // 清空元素内容
    el.innerHTML = ''
  },
}

/**
 * 更新模板
 */
async function updateTemplate(el: HTMLElement, binding: DirectiveBinding<TemplateDirectiveValue | null>) {
  // 检查 binding.value 是否存在
  if (!binding.value) {
    console.warn('[v-template] directive value is required')
    return
  }

  const { category, device, template, props = {}, events = {} } = binding.value

  if (!category) {
    console.warn('[v-template] category is required')
    return
  }

  try {
    // 创建模板管理器实例
    const manager = new TemplateManager()

    // 渲染模板
    const result = await manager.render({
      category,
      device: (device as DeviceType) || 'desktop',
      template: template || 'default',
    })

    if (result && result.component) {
      // 渲染组件到元素
      renderComponentToElement(el, result.component, props, events)
    } else {
      el.innerHTML = `<div class="template-error">Failed to load template</div>`
    }
  } catch (error) {
    console.error('[v-template] Error loading template:', error)
    el.innerHTML = `<div class="template-error">Template loading error</div>`
  }
}

/**
 * 将组件渲染到元素
 */
function renderComponentToElement(
  el: HTMLElement,
  component: any,
  props: Record<string, any>,
  events: Record<string, (...args: any[]) => void> = {}
) {
  // 清理之前的应用实例
  const existingApp = elementApps.get(el)
  if (existingApp) {
    existingApp.unmount()
    elementApps.delete(el)
  }

  // 清空元素内容
  el.innerHTML = ''

  try {
    // 创建新的 Vue 应用实例
    const app = createApp(component, {
      ...props,
      // 将事件作为 props 传递
      ...Object.fromEntries(
        Object.entries(events).map(([key, handler]) => [`on${key.charAt(0).toUpperCase()}${key.slice(1)}`, handler])
      ),
    })

    // 挂载应用到元素
    app.mount(el)

    // 存储应用实例以便后续清理
    elementApps.set(el, app)
  } catch (error) {
    console.error('[v-template] Error rendering component:', error)
    el.innerHTML = `<div class="template-error">Component render error</div>`
  }
}

/**
 * 注册模板指令
 */
export function registerTemplateDirective(app: any) {
  app.directive('template', templateDirective)
}

/**
 * 指令选项
 */
export interface TemplateDirectiveOptions {
  name?: string
  defaultDevice?: string
  errorTemplate?: string
}

/**
 * 创建模板指令
 */
export function createTemplateDirective(options: TemplateDirectiveOptions = {}): Directive {
  const { name = 'template', defaultDevice = 'desktop', errorTemplate } = options

  return {
    mounted(el, binding) {
      const value = {
        device: defaultDevice,
        ...binding.value,
      }
      updateTemplate(el, { ...binding, value })
    },

    updated(el, binding) {
      if (binding.value !== binding.oldValue) {
        const value = {
          device: defaultDevice,
          ...binding.value,
        }
        updateTemplate(el, { ...binding, value })
      }
    },

    unmounted(el) {
      el.innerHTML = ''
    },
  }
}

// 默认导出
export default templateDirective
