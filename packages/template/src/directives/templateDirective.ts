/**
 * Vue Directive for Template Rendering
 * 
 * Provides v-template directive as an alternative way to use templates
 * 
 * Usage:
 * ```vue
 * <div v-template="{ category: 'login', device: 'desktop', name: 'default' }"></div>
 * <div v-template:login.desktop.default></div>
 * <div v-template:login="{ device: 'mobile', name: 'card' }"></div>
 * ```
 */

import type { App, Component, DirectiveBinding, VNode } from 'vue'
import type { DeviceType, TemplateLoadOptions } from '../types'
import { createApp, defineComponent, h, onUnmounted, ref, watchEffect } from 'vue'
import { getManager } from '../core/manager'

interface TemplateDirectiveOptions {
  category: string
  device?: DeviceType | string
  name?: string
  props?: Record<string, any>
  slots?: Record<string, any>
  loading?: Component | string
  error?: Component | ((error: Error) => Component | string)
  transition?: boolean | string
  onLoad?: (component: Component) => void
  onError?: (error: Error) => void
}

interface TemplateDirectiveInstance {
  app: App | null
  component: Component | null
  cleanup: () => void
  abortController?: AbortController
}

// 使用 Map 而不是 WeakMap，以支持 forEach 遍历清理
// 在 beforeunload 时会清理所有实例，所以不会造成内存泄漏
const instances = new Map<Element, TemplateDirectiveInstance>()

/**
 * Parse directive arguments and modifiers
 */
function parseBinding(binding: DirectiveBinding): TemplateDirectiveOptions {
  const options: TemplateDirectiveOptions = {} as any

  // Parse argument (e.g., v-template:login)
  if (binding.arg) {
    options.category = binding.arg
  }

  // Parse modifiers (e.g., v-template:login.desktop.default)
  const modifiers = Object.keys(binding.modifiers)
  if (modifiers.length > 0) {
    if (modifiers[0]) options.device = modifiers[0] as DeviceType
    if (modifiers[1]) options.name = modifiers[1]
  }

  // Parse value (overrides arg and modifiers)
  if (typeof binding.value === 'object' && binding.value !== null) {
    Object.assign(options, binding.value)
  } else if (typeof binding.value === 'string') {
    // Support string shorthand: "category/device/name"
    const parts = binding.value.split('/')
    if (parts[0]) options.category = parts[0]
    if (parts[1]) options.device = parts[1] as DeviceType
    if (parts[2]) options.name = parts[2]
  }

  // Set defaults
  if (!options.device) options.device = detectDevice()
  if (!options.name) options.name = 'default'

  return options
}

/**
 * Detect current device type
 */
function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Create loading component
 */
function createLoadingComponent(loading?: Component | string) {
  if (loading) {
    return typeof loading === 'string'
      ? defineComponent({
        render() {
          return h('div', { class: 'v-template-loading' }, loading)
        }
      })
      : loading
  }

  return defineComponent({
    render() {
      return h('div', { class: 'v-template-loading' }, [
        h('span', { class: 'v-template-spinner' }, '加载中...')
      ])
    }
  })
}

/**
 * Create error component
 */
function createErrorComponent(error: Error, errorHandler?: Component | ((error: Error) => Component | string)) {
  if (errorHandler) {
    if (typeof errorHandler === 'function') {
      const result = errorHandler(error)
      return typeof result === 'string'
        ? defineComponent({
          render() {
            return h('div', { class: 'v-template-error' }, result)
          }
        })
        : result
    }
    return errorHandler
  }

  return defineComponent({
    render() {
      return h('div', { class: 'v-template-error' }, [
        h('p', `加载模板失败: ${error.message}`),
        h('button', {
          class: 'v-template-retry',
          onClick: () => window.location.reload()
        }, '重试')
      ])
    }
  })
}

/**
 * Mount template component to element
 */
async function mountTemplate(el: Element, options: TemplateDirectiveOptions) {
  const manager = getManager()

  // Clean up previous instance
  unmountTemplate(el)

  // Create abort controller for async operations
  const abortController = new AbortController()

  // Create container
  const container = document.createElement('div')
  container.className = 'v-template-container'

  // Create reactive state
  const isLoading = ref(true)
  const loadError = ref<Error | null>(null)
  const templateComponent = ref<Component | null>(null)

  // Create wrapper component
  const WrapperComponent = defineComponent({
    setup() {
      let stopWatcher: (() => void) | null = null

      // Load template
      stopWatcher = watchEffect(async (onInvalidate) => {
        // Clean up on invalidation
        onInvalidate(() => {
          // Cancel any pending operations
          if (abortController) {
            abortController.abort()
          }
        })
        try {
          // Check if aborted
          if (abortController?.signal.aborted) return

          isLoading.value = true
          loadError.value = null

          const component = await manager.loadTemplate(
            options.category,
            options.device as string,
            options.name!,
            {
              onLoad: options.onLoad,
              onError: options.onError
            } as TemplateLoadOptions
          )

          // Check again after async operation
          if (abortController?.signal.aborted) return

          templateComponent.value = component
          isLoading.value = false
        } catch (error) {
          loadError.value = error as Error
          isLoading.value = false
          options.onError?.(error as Error)
        }
      })

      // Clean up on unmount
      onUnmounted(() => {
        if (stopWatcher) {
          stopWatcher()
          stopWatcher = null
        }
        if (abortController) {
          abortController.abort()
        }
      })

      return () => {
        // Show loading
        if (isLoading.value) {
          const LoadingComp = createLoadingComponent(options.loading)
          return h(LoadingComp)
        }

        // Show error
        if (loadError.value) {
          const ErrorComp = createErrorComponent(loadError.value, options.error)
          return h(ErrorComp)
        }

        // Show template
        if (templateComponent.value) {
          const content = h(templateComponent.value, options.props, options.slots)

          // Add transition if requested
          if (options.transition) {
            const transitionName = typeof options.transition === 'string'
              ? options.transition
              : 'v-template-fade'

            return h('transition', { name: transitionName }, () => content)
          }

          return content
        }

        return null
      }
    }
  })

  // Create and mount app
  const app = createApp(WrapperComponent)

  // Clear element content and append container
  el.innerHTML = ''
  el.appendChild(container)

  // Mount app
  app.mount(container)

  // Store instance
  instances.set(el, {
    app,
    component: WrapperComponent,
    abortController,
    cleanup: () => {
      if (abortController) {
        abortController.abort()
      }
      app.unmount()
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
    }
  })
}

/**
 * Unmount template from element
 */
function unmountTemplate(el: Element) {
  const instance = instances.get(el)
  if (instance) {
    instance.cleanup()
    instances.delete(el)
  }
}

/**
 * Template directive definition
 */
export const vTemplate = {
mounted(el: Element, binding: DirectiveBinding, _vnode: VNode) {
    const options = parseBinding(binding)

    if (!options.category) {
      console.error('[v-template] Category is required')
      return
    }

    mountTemplate(el, options)
  },

  updated(el: Element, binding: DirectiveBinding) {
    const oldOptions = parseBinding(binding.oldValue ?
      { ...binding, value: binding.oldValue } : binding)
    const newOptions = parseBinding(binding)

    // Check if options changed
    if (
      oldOptions.category !== newOptions.category ||
      oldOptions.device !== newOptions.device ||
      oldOptions.name !== newOptions.name ||
      JSON.stringify(oldOptions.props) !== JSON.stringify(newOptions.props)
    ) {
      mountTemplate(el, newOptions)
    }
  },

  unmounted(el: Element) {
    unmountTemplate(el)
  }
}

// Track installed styles to avoid duplicates
let stylesInstalled = false

/**
 * Install directive plugin
 */
export function installTemplateDirective(app: App) {
  app.directive('template', vTemplate)

  // Add global styles for directive (prevent duplicates)
  if (typeof document !== 'undefined' && !stylesInstalled && !document.getElementById('v-template-styles')) {
    stylesInstalled = true
    const style = document.createElement('style')
    style.id = 'v-template-styles'
    style.textContent = `
      .v-template-container {
        width: 100%;
        height: 100%;
      }
      
      .v-template-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        color: #666;
      }
      
      .v-template-spinner {
        display: inline-block;
        animation: v-template-spin 1s linear infinite;
      }
      
      @keyframes v-template-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .v-template-error {
        padding: 20px;
        text-align: center;
        color: #f56c6c;
      }
      
      .v-template-retry {
        margin-top: 10px;
        padding: 8px 16px;
        background: #409eff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      
      .v-template-retry:hover {
        background: #66b1ff;
      }
      
      /* Transition effects */
      .v-template-fade-enter-active,
      .v-template-fade-leave-active {
        transition: opacity 0.3s ease;
      }
      
      .v-template-fade-enter-from,
      .v-template-fade-leave-to {
        opacity: 0;
      }
      
      .v-template-slide-enter-active,
      .v-template-slide-leave-active {
        transition: transform 0.3s ease;
      }
      
      .v-template-slide-enter-from {
        transform: translateX(-100%);
      }
      
      .v-template-slide-leave-to {
        transform: translateX(100%);
      }
    `
    document.head.appendChild(style)

    // Clean up on unload
    window.addEventListener('beforeunload', () => {
      // Clean up all instances
      instances.forEach((instance, el) => {
        unmountTemplate(el)
      })
    }, { once: true })
  }
}

/**
 * Export for manual use
 */
export default vTemplate
