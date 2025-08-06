import type { Directive, DirectiveBinding } from 'vue'
import type { DeviceType, TemplateDirectiveBinding } from '../../types'
import { createTemplateManager } from '../composables/useTemplate'

/**
 * 指令绑定的元素数据
 */
interface TemplateDirectiveElement extends HTMLElement {
  __templateDirective?: {
    manager: ReturnType<typeof createTemplateManager>
    currentTemplate?: string
    cleanup?: () => void
  }
}

/**
 * 解析指令绑定值
 */
function parseBinding(binding: DirectiveBinding): TemplateDirectiveBinding | null {
  const { value } = binding

  if (!value)
    return null

  // 支持字符串格式: "category:device:template"
  if (typeof value === 'string') {
    const parts = value.split(':')
    if (parts.length >= 2) {
      return {
        category: parts[0],
        device: parts[1] as DeviceType,
        template: parts[2] || parts[1],
        props: {},
      }
    }
    return null
  }

  // 支持对象格式
  if (typeof value === 'object') {
    const { category, device, template, props = {} } = value
    if (category && template) {
      return { category, device, template, props }
    }
  }

  return null
}

/**
 * 渲染模板到元素
 */
async function renderTemplate(
  el: TemplateDirectiveElement,
  binding: TemplateDirectiveBinding,
): Promise<void> {
  const data = el.__templateDirective
  if (!data)
    return

  try {
    // 显示加载状态
    el.innerHTML = '<div class="template-directive-loading">加载中...</div>'
    el.classList.add('template-directive-loading-state')

    // 渲染模板
    const component = await data.manager.render({
      category: binding.category,
      device: binding.device,
      template: binding.template,
      props: binding.props,
    })

    // 创建 Vue 应用实例来渲染组件
    const { createApp } = await import('vue')
    const app = createApp(component, binding.props)

    // 清空元素内容
    el.innerHTML = ''
    el.classList.remove('template-directive-loading-state', 'template-directive-error-state')
    el.classList.add('template-directive-loaded-state')

    // 挂载组件
    app.mount(el)

    // 保存清理函数
    data.cleanup = () => {
      app.unmount()
    }

    data.currentTemplate = `${binding.category}:${binding.device}:${binding.template}`
  }
  catch (error) {
    console.error('Template directive render error:', error)

    // 显示错误状态
    el.innerHTML = `
      <div class="template-directive-error">
        <div class="template-directive-error__message">模板加载失败</div>
        <div class="template-directive-error__detail">${(error as Error).message}</div>
      </div>
    `
    el.classList.remove('template-directive-loading-state', 'template-directive-loaded-state')
    el.classList.add('template-directive-error-state')
  }
}

/**
 * 模板指令实现
 */
export const templateDirective: Directive<TemplateDirectiveElement, unknown> = {
  /**
   * 指令挂载时
   */
  mounted(el, binding) {
    const parsedBinding = parseBinding(binding)
    if (!parsedBinding) {
      console.warn('Invalid template directive binding:', binding.value)
      return
    }

    // 初始化指令数据
    el.__templateDirective = {
      manager: createTemplateManager(),
      currentTemplate: undefined,
      cleanup: undefined,
    }

    // 添加基础样式类
    el.classList.add('template-directive')

    // 渲染模板
    renderTemplate(el, parsedBinding)
  },

  /**
   * 指令更新时
   */
  updated(el, binding) {
    const parsedBinding = parseBinding(binding)
    if (!parsedBinding) {
      console.warn('Invalid template directive binding:', binding.value)
      return
    }

    const data = el.__templateDirective
    if (!data)
      return

    const newTemplate = `${parsedBinding.category}:${parsedBinding.device}:${parsedBinding.template}`

    // 如果模板没有变化，只更新属性
    if (data.currentTemplate === newTemplate) {
      // TODO: 更新组件属性
      return
    }

    // 清理旧组件
    if (data.cleanup) {
      data.cleanup()
      data.cleanup = undefined
    }

    // 渲染新模板
    renderTemplate(el, parsedBinding)
  },

  /**
   * 指令卸载时
   */
  unmounted(el) {
    const data = el.__templateDirective
    if (!data)
      return

    // 清理组件
    if (data.cleanup) {
      data.cleanup()
    }

    // 销毁管理器
    data.manager.destroy()

    // 清理数据
    delete el.__templateDirective

    // 移除样式类
    el.classList.remove(
      'template-directive',
      'template-directive-loading-state',
      'template-directive-loaded-state',
      'template-directive-error-state',
    )
  },
}

/**
 * 注册模板指令
 */
export function registerTemplateDirective(app: unknown): void {
  app.directive('template', templateDirective)
}

export default templateDirective
