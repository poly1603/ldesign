/**
 * Vue 模板指令
 * 提供声明式的模板渲染指令
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { DeviceType, TemplateManagerConfig } from '../../types'
import { createApp, h } from 'vue'
import { TemplateManager } from '../../core/manager'

/**
 * 指令绑定值接口
 */
interface TemplateDirectiveValue {
  template: string
  deviceType?: DeviceType
  props?: Record<string, any>
  config?: TemplateManagerConfig
  onLoaded?: (component: any) => void
  onError?: (error: Error) => void
}

/**
 * 元素数据接口
 */
interface ElementData {
  manager: TemplateManager
  app: any
  cleanup: () => void
}

// 存储每个元素的数据
const elementDataMap = new WeakMap<Element, ElementData>()

/**
 * 创建模板管理器
 */
function createManager(config?: TemplateManagerConfig): TemplateManager {
  return new TemplateManager(config)
}

/**
 * 渲染模板到元素
 */
async function renderTemplate(
  el: Element,
  value: TemplateDirectiveValue,
): Promise<void> {
  try {
    // 获取或创建管理器
    let elementData = elementDataMap.get(el)
    if (!elementData) {
      const manager = createManager(value.config)
      const app = createApp({})

      elementData = {
        manager,
        app,
        cleanup: () => {
          app.unmount()
          manager.dispose()
        },
      }

      elementDataMap.set(el, elementData)
    }

    const { manager } = elementData

    // 确保管理器已初始化
    if (!manager.getStatus().initialized) {
      await manager.initialize()
    }

    // 渲染模板
    const result = await manager.render(value.template, value.deviceType, value.props)

    if (result.success && result.component) {
      // 创建组件实例
      const componentVNode = h(result.component, value.props || {})

      // 清空元素内容
      el.innerHTML = ''

      // 挂载组件
      const app = createApp(componentVNode)
      app.mount(el)

      // 更新应用实例
      elementData.app = app

      // 调用成功回调
      if (value.onLoaded) {
        value.onLoaded(result.component)
      }
    }
    else {
      throw result.error || new Error('Failed to render template')
    }
  }
  catch (error) {
    // 显示错误信息
    el.innerHTML = `
      <div class="template-directive-error">
        <p>模板渲染失败: ${value.template}</p>
        <p class="error-detail">${(error as Error).message}</p>
      </div>
    `

    // 调用错误回调
    if (value.onError) {
      value.onError(error as Error)
    }
  }
}

/**
 * 清理元素
 */
function cleanupElement(el: Element): void {
  const elementData = elementDataMap.get(el)
  if (elementData) {
    elementData.cleanup()
    elementDataMap.delete(el)
  }
}

/**
 * v-template 指令
 *
 * 用法:
 * <div v-template="{ template: 'login', deviceType: 'mobile' }"></div>
 * <div v-template="'login'"></div>
 */
export const vTemplate: Directive<Element, string | TemplateDirectiveValue> = {
  async mounted(el: Element, binding: DirectiveBinding<string | TemplateDirectiveValue>) {
    const value = typeof binding.value === 'string'
      ? { template: binding.value }
      : binding.value

    if (!value || !value.template) {
      console.warn('v-template directive requires a template name')
      return
    }

    await renderTemplate(el, value)
  },

  async updated(el: Element, binding: DirectiveBinding<string | TemplateDirectiveValue>) {
    const value = typeof binding.value === 'string'
      ? { template: binding.value }
      : binding.value

    if (!value || !value.template) {
      console.warn('v-template directive requires a template name')
      return
    }

    // 检查值是否发生变化
    const oldValue = typeof binding.oldValue === 'string'
      ? { template: binding.oldValue }
      : binding.oldValue

    if (JSON.stringify(value) !== JSON.stringify(oldValue)) {
      await renderTemplate(el, value)
    }
  },

  unmounted(el: Element) {
    cleanupElement(el)
  },
}

/**
 * v-template-preload 指令
 * 预加载指定的模板
 *
 * 用法:
 * <div v-template-preload="'login'"></div>
 * <div v-template-preload="{ template: 'login', deviceType: 'mobile' }"></div>
 */
export const vTemplatePreload: Directive<Element, string | TemplateDirectiveValue> = {
  async mounted(el: Element, binding: DirectiveBinding<string | TemplateDirectiveValue>) {
    const value = typeof binding.value === 'string'
      ? { template: binding.value }
      : binding.value

    if (!value || !value.template) {
      console.warn('v-template-preload directive requires a template name')
      return
    }

    try {
      const manager = createManager(value.config)
      await manager.initialize()
      await manager.preloadTemplate(value.template, value.deviceType)
    }
    catch (error) {
      console.warn('Failed to preload template:', value.template, error)
    }
  },
}

/**
 * v-template-lazy 指令
 * 懒加载模板，当元素进入视口时才加载
 *
 * 用法:
 * <div v-template-lazy="{ template: 'login', deviceType: 'mobile' }"></div>
 */
export const vTemplateLazy: Directive<Element, string | TemplateDirectiveValue> = {
  mounted(el: Element, binding: DirectiveBinding<string | TemplateDirectiveValue>) {
    const value = typeof binding.value === 'string'
      ? { template: binding.value }
      : binding.value

    if (!value || !value.template) {
      console.warn('v-template-lazy directive requires a template name')
      return
    }

    // 创建 Intersection Observer
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          // 元素进入视口，开始加载模板
          await renderTemplate(el, value)

          // 停止观察
          observer.disconnect()
        }
      },
      {
        threshold: 0.1, // 当10%的元素可见时触发
        rootMargin: '50px', // 提前50px开始加载
      },
    )

    observer.observe(el)

    // 存储 observer 以便清理
    ;(el as any).__templateObserver = observer
  },

  unmounted(el: Element) {
    const observer = (el as any).__templateObserver
    if (observer) {
      observer.disconnect()
      delete (el as any).__templateObserver
    }

    cleanupElement(el)
  },
}

/**
 * v-template-cache 指令
 * 控制模板缓存行为
 *
 * 用法:
 * <div v-template-cache:clear="'login'"></div>
 * <div v-template-cache:preload="['login', 'dashboard']"></div>
 */
export const vTemplateCache: Directive<Element, any> = {
  async mounted(el: Element, binding: DirectiveBinding<any>) {
    const { arg, value } = binding

    if (!arg || !value) {
      console.warn('v-template-cache directive requires an argument and value')
      return
    }

    const manager = createManager()
    await manager.initialize()

    switch (arg) {
      case 'clear':
        if (typeof value === 'string') {
          manager.clearCache(value)
        }
        else if (Array.isArray(value)) {
          value.forEach(template => manager.clearCache(template))
        }
        break

      case 'preload':
        if (typeof value === 'string') {
          await manager.preloadTemplate(value)
        }
        else if (Array.isArray(value)) {
          await manager.preloadTemplates(value)
        }
        break

      default:
        console.warn(`Unknown v-template-cache argument: ${arg}`)
    }
  },
}

/**
 * 指令集合
 */
export const templateDirectives = {
  'template': vTemplate,
  'template-preload': vTemplatePreload,
  'template-lazy': vTemplateLazy,
  'template-cache': vTemplateCache,
}

/**
 * 安装所有指令的函数
 */
export function installTemplateDirectives(app: any): void {
  Object.entries(templateDirectives).forEach(([name, directive]) => {
    app.directive(name, directive)
  })
}

// 默认导出
export default {
  install: installTemplateDirectives,
}
