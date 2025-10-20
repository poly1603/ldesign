/**
 * Vue 指令
 * 提供声明式的 Store 操作
 */

import type { App, DirectiveBinding } from 'vue'
import { globalStoreManager } from './helpers'

/**
 * v-store 指令
 * 用于绑定 Store 状态到元素
 */
export const vStore = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, arg, modifiers } = binding

    if (!arg) {
      console.warn('v-store directive requires a store ID as argument')
      return
    }

    const storeId = arg
    const store = globalStoreManager.get(storeId)

    if (!store) {
      console.warn(`Store "${storeId}" not found`)
      return
    }

    // 根据修饰符决定行为
    if (modifiers.text) {
      // v-store:storeId.text="stateKey"
      const stateKey = value
      if (stateKey && (store.$state as any)[stateKey] !== undefined) {
        el.textContent = String((store.$state as any)[stateKey])

        // 监听状态变化
        const unsubscribe = store.$subscribe(() => {
          el.textContent = String((store.$state as any)[stateKey])
        })

        // 存储清理函数
        ;(el as any).__vStoreCleanup = unsubscribe
      }
    } else if (modifiers.html) {
      // v-store:storeId.html="stateKey"
      const stateKey = value
      if (stateKey && (store.$state as any)[stateKey] !== undefined) {
        el.innerHTML = String((store.$state as any)[stateKey])

        const unsubscribe = store.$subscribe(() => {
          el.innerHTML = String((store.$state as any)[stateKey])
        })

        ;(el as any).__vStoreCleanup = unsubscribe
      }
    } else if (modifiers.class) {
      // v-store:storeId.class="{ stateKey: 'className' }"
      const classMap = value
      if (typeof classMap === 'object') {
        const updateClasses = () => {
          Object.entries(classMap).forEach(([stateKey, className]) => {
            const hasClass = Boolean((store.$state as any)[stateKey])
            el.classList.toggle(className as string, hasClass)
          })
        }

        updateClasses()
        const unsubscribe = store.$subscribe(updateClasses)
        ;(el as any).__vStoreCleanup = unsubscribe
      }
    } else if (modifiers.style) {
      // v-store:storeId.style="{ stateKey: 'styleProp' }"
      const styleMap = value
      if (typeof styleMap === 'object') {
        const updateStyles = () => {
          Object.entries(styleMap).forEach(([stateKey, styleProp]) => {
            const styleValue = (store.$state as any)[stateKey]
            ;(el.style as any)[styleProp as string] = styleValue
          })
        }

        updateStyles()
        const unsubscribe = store.$subscribe(updateStyles)
        ;(el as any).__vStoreCleanup = unsubscribe
      }
    } else {
      // 默认行为：绑定整个状态对象
      ;(el as any).__storeState = store.$state

      const unsubscribe = store.$subscribe(() => {
        ;(el as any).__storeState = store.$state
      })

      ;(el as any).__vStoreCleanup = unsubscribe
    }
  },

  unmounted(el: HTMLElement) {
    // 清理订阅
    const cleanup = (el as any).__vStoreCleanup
    if (cleanup) {
      cleanup()
      delete (el as any).__vStoreCleanup
    }

    delete (el as any).__storeState
  }
}

/**
 * v-action 指令
 * 用于绑定 Store 动作到事件
 */
export const vAction = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value, arg, modifiers } = binding

    if (!arg) {
      console.warn('v-action directive requires a store ID as argument')
      return
    }

    const [storeId, actionName] = arg.split('.')
    if (!storeId || !actionName) {
      console.warn('v-action directive requires format: v-action:storeId.actionName')
      return
    }

    const store = globalStoreManager.get(storeId)
    if (!store) {
      console.warn(`Store "${storeId}" not found`)
      return
    }

    const action = (store as any)[actionName]
    if (typeof action !== 'function') {
      console.warn(`Action "${actionName}" not found in store "${storeId}"`)
      return
    }

    // 确定事件类型
    const eventType = modifiers.change
? 'change'
                    : modifiers.input
? 'input'
                    : modifiers.blur
? 'blur'
                    : modifiers.focus
? 'focus'
                    : 'click'

    // 创建事件处理器
    const handler = (event: Event) => {
      try {
        // 如果有参数，传递参数；否则传递事件对象
        if (value !== undefined) {
          action(value)
        } else if (modifiers.value && event.target) {
          // v-action:store.action.value - 传递输入值
          const target = event.target as HTMLInputElement
          action(target.value)
        } else if (modifiers.prevent) {
          // v-action:store.action.prevent - 阻止默认行为
          event.preventDefault()
          action(event)
        } else {
          action(event)
        }
      } catch (error) {
        console.error(`Error executing action "${actionName}":`, error)
      }
    }

    // 绑定事件
    el.addEventListener(eventType, handler)

    // 存储清理函数
    ;(el as any).__vActionCleanup = () => {
      el.removeEventListener(eventType, handler)
    }
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any).__vActionCleanup
    if (cleanup) {
      cleanup()
      delete (el as any).__vActionCleanup
    }
  }
}

/**
 * v-loading 指令
 * 用于显示 Store 动作的加载状态
 */
export const vLoading = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { arg } = binding

    if (!arg) {
      console.warn('v-loading directive requires a store ID as argument')
      return
    }

    const storeId = arg
    const store = globalStoreManager.get(storeId)

    if (!store) {
      console.warn(`Store "${storeId}" not found`)
      return
    }

    // 监听动作执行状态
    const unsubscribe = store.$onAction(({ after, onError }) => {
      // 动作开始时显示加载状态
      el.classList.add('loading')
      el.setAttribute('data-loading', 'true')

      // 动作完成后隐藏加载状态
      after(() => {
        el.classList.remove('loading')
        el.removeAttribute('data-loading')
      })

      // 动作出错后隐藏加载状态
      onError(() => {
        el.classList.remove('loading')
        el.removeAttribute('data-loading')
      })
    })

    ;(el as any).__vLoadingCleanup = unsubscribe
  },

  unmounted(el: HTMLElement) {
    const cleanup = (el as any).__vLoadingCleanup
    if (cleanup) {
      cleanup()
      delete (el as any).__vLoadingCleanup
    }
  }
}

/**
 * 注册所有指令的插件
 */
export function createStoreDirectivesPlugin() {
  return {
    install(app: App) {
      app.directive('store', vStore)
      app.directive('action', vAction)
      app.directive('loading', vLoading)
    }
  }
}

/**
 * 指令集合
 */
export const storeDirectives = {
  store: vStore,
  action: vAction,
  loading: vLoading,
}
