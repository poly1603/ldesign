import type { Pinia, Store } from 'pinia'
import type { App, PropType } from 'vue'
import type {
  StoreProviderContext,
  StoreProviderOptions,
  StoreRegistration,
} from '../types'
import { createPinia } from 'pinia'
import {
  defineComponent,
  h,
  inject,
  onUnmounted,
  provide,
  reactive,
  ref,
} from 'vue'
import { STORE_PROVIDER_KEY } from '../types/provider'

/**
 * Store Provider 组件
 * 提供 Store 的依赖注入功能
 */
export const StoreProvider = defineComponent({
  name: 'StoreProvider',
  props: {
    /** Pinia 实例 */
    pinia: {
      type: Object as PropType<Pinia>,
      default: undefined,
    },
    /** 预定义的 Store */
    stores: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },
    /** 是否全局注册 */
    global: {
      type: Boolean,
      default: false,
    },
    /** 是否启用开发工具 */
    devtools: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    // 创建或使用传入的 Pinia 实例
    const pinia = props.pinia || createPinia()

    // Store 注册信息
    const stores = reactive(new Map<string, StoreRegistration>())

    // Store 实例缓存
    const instances = reactive(new Map<string, Store>())

    // 清理函数列表
    const cleanupFunctions = ref<(() => void)[]>([])

    // 注册预定义的 Store
    Object.entries(props.stores).forEach(([id, storeFactory]) => {
      stores.set(id, {
        id,
        factory: storeFactory,
        singleton: true,
        lazy: false,
      })
    })

    // Provider 上下文
    const context: StoreProviderContext = {
      pinia,
      stores,
      instances,

      register(id: string, registration: StoreRegistration) {
        stores.set(id, registration)

        // 如果不是懒加载，立即创建实例
        if (!registration.lazy) {
          this.createStore(id)
        }
      },

      getStore<T extends Store = Store>(id: string): T | undefined {
        // 先从缓存中获取
        if (instances.has(id)) {
          return instances.get(id) as T
        }

        // 如果没有缓存，尝试创建
        return this.createStore<T>(id)
      },

      createStore<T extends Store = Store>(id: string): T | undefined {
        const registration = stores.get(id)
        if (!registration) {
          console.warn(`Store "${id}" is not registered`)
          return undefined
        }

        try {
          // 创建 Store 实例
          const store = registration.factory() as T

          // 如果是单例，缓存实例
          if (registration.singleton) {
            instances.set(id, store)
          }

          return store
        }
        catch (error) {
          console.error(`Failed to create store "${id}":`, error)
          return undefined
        }
      },

      destroyStore(id: string) {
        instances.delete(id)
      },

      cleanup() {
        // 清理所有 Store 实例
        instances.clear()

        // 执行所有清理函数
        cleanupFunctions.value.forEach(cleanup => cleanup())
        cleanupFunctions.value = []
      },
    }

    // 提供上下文
    provide(STORE_PROVIDER_KEY, context)

    // 组件卸载时清理
    onUnmounted(() => {
      context.cleanup()
    })

    return () => {
      return h('div', { class: 'store-provider' }, slots.default?.())
    }
  },
})

/**
 * 使用 Store Provider 的 Hook
 */
export function useStoreProvider(): StoreProviderContext {
  const context = inject(STORE_PROVIDER_KEY)

  if (!context) {
    throw new Error('useStoreProvider must be used within a StoreProvider')
  }

  return context
}

/**
 * 注册 Store 的 Hook
 */
export function useStoreRegistration() {
  const context = useStoreProvider()

  return {
    register: context.register.bind(context),
    getStore: context.getStore.bind(context),
    createStore: context.createStore.bind(context),
    destroyStore: context.destroyStore.bind(context),
  }
}

/**
 * Store Provider 插件
 */
export function createStoreProviderPlugin(options: StoreProviderOptions = {}) {
  return {
    install(app: App) {
      // 创建全局 Pinia 实例
      const pinia = options.pinia || createPinia()

      // 安装 Pinia
      app.use(pinia)

      // 创建全局 Provider 上下文
      const stores = reactive(new Map<string, StoreRegistration>())
      const instances = reactive(new Map<string, Store>())

      const globalContext: StoreProviderContext = {
        pinia,
        stores,
        instances,

        register(id: string, registration: StoreRegistration) {
          stores.set(id, registration)
          if (!registration.lazy) {
            this.createStore(id)
          }
        },

        getStore<T extends Store = Store>(id: string): T | undefined {
          if (instances.has(id)) {
            return instances.get(id) as T
          }
          return this.createStore<T>(id)
        },

        createStore<T extends Store = Store>(id: string): T | undefined {
          const registration = stores.get(id)
          if (!registration) {
            console.warn(`Store "${id}" is not registered`)
            return undefined
          }

          try {
            const store = registration.factory() as T
            if (registration.singleton) {
              instances.set(id, store)
            }
            return store
          }
          catch (error) {
            console.error(`Failed to create store "${id}":`, error)
            return undefined
          }
        },

        destroyStore(id: string) {
          instances.delete(id)
        },

        cleanup() {
          instances.clear()
        },
      }

      // 注册预定义的 Store
      if (options.stores) {
        Object.entries(options.stores).forEach(([id, storeFactory]) => {
          globalContext.register(id, {
            id,
            factory: storeFactory,
            singleton: true,
            lazy: false,
          })
        })
      }

      // 提供全局上下文
      app.provide(STORE_PROVIDER_KEY, globalContext)

      // 添加全局属性
      app.config.globalProperties.$stores = globalContext
    },
  }
}
