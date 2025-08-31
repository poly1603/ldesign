/**
 * 本地存储 Hook
 * 
 * @description
 * 提供响应式的本地存储功能，支持类型安全和自动序列化/反序列化。
 * 当存储值发生变化时，组件会自动重新渲染。
 */

import { ref, watch, type Ref } from 'vue'

/**
 * 本地存储序列化器接口
 */
export interface StorageSerializer<T> {
  read: (value: string) => T
  write: (value: T) => string
}

/**
 * 默认序列化器
 */
const defaultSerializer: StorageSerializer<any> = {
  read: (value: string) => {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  },
  write: (value: any) => {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  },
}

/**
 * 字符串序列化器
 */
export const stringSerializer: StorageSerializer<string> = {
  read: (value: string) => value,
  write: (value: string) => value,
}

/**
 * 数字序列化器
 */
export const numberSerializer: StorageSerializer<number> = {
  read: (value: string) => Number(value),
  write: (value: number) => String(value),
}

/**
 * 布尔值序列化器
 */
export const booleanSerializer: StorageSerializer<boolean> = {
  read: (value: string) => value === 'true',
  write: (value: boolean) => String(value),
}

/**
 * 本地存储 Hook 选项
 */
export interface UseLocalStorageOptions<T> {
  /** 序列化器 */
  serializer?: StorageSerializer<T>
  /** 是否在页面加载时立即同步 */
  syncAcrossTabs?: boolean
  /** 错误处理函数 */
  onError?: (error: Error) => void
}

/**
 * 本地存储 Hook
 * 
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @param options - 选项
 * @returns 响应式存储值和相关方法
 * 
 * @example
 * ```typescript
 * // 基础用法
 * const [count, setCount] = useLocalStorage('count', 0)
 * 
 * // 字符串类型
 * const [name, setName] = useLocalStorage('name', '', {
 *   serializer: stringSerializer
 * })
 * 
 * // 对象类型
 * interface User {
 *   id: number
 *   name: string
 * }
 * const [user, setUser] = useLocalStorage<User>('user', {
 *   id: 0,
 *   name: ''
 * })
 * 
 * // 在组件中使用
 * export default defineComponent({
 *   setup() {
 *     const [theme, setTheme] = useLocalStorage('theme', 'light')
 *     
 *     const toggleTheme = () => {
 *       setTheme(theme.value === 'light' ? 'dark' : 'light')
 *     }
 *     
 *     return {
 *       theme,
 *       toggleTheme
 *     }
 *   }
 * })
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions<T> = {}
): [Ref<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = defaultSerializer,
    syncAcrossTabs = true,
    onError = (error) => console.error('useLocalStorage error:', error),
  } = options

  // 读取初始值
  const read = (): T => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.read(item)
    } catch (error) {
      onError(error as Error)
      return defaultValue
    }
  }

  // 创建响应式引用
  const storedValue = ref<T>(read())

  // 用于防止 remove 操作时触发 watch
  let isRemoving = false

  // 写入值
  const write = (value: T): void => {
    try {
      localStorage.setItem(key, serializer.write(value))
    } catch (error) {
      onError(error as Error)
    }
  }

  // 删除值
  const remove = (): void => {
    try {
      localStorage.removeItem(key)
      // 设置标志，防止 watch 触发写入
      isRemoving = true
      storedValue.value = defaultValue
      // 在下一个 tick 中重置标志
      import('vue').then(({ nextTick }) => {
        nextTick(() => {
          isRemoving = false
        })
      }).catch(() => {
        isRemoving = false
      })
    } catch (error) {
      onError(error as Error)
      isRemoving = false
    }
  }

  // 设置值的函数
  const setValue = (value: T | ((prev: T) => T)): void => {
    try {
      const newValue = typeof value === 'function'
        ? (value as (prev: T) => T)(storedValue.value)
        : value

      // 只设置值，让 watch 处理写入
      storedValue.value = newValue
    } catch (error) {
      onError(error as Error)
    }
  }

  // 监听值的变化，同步到 localStorage
  // 但不在 remove 操作时触发
  watch(
    storedValue,
    (newValue) => {
      if (!isRemoving) {
        write(newValue)
      }
    },
    { deep: true }
  )

  // 跨标签页同步
  if (syncAcrossTabs && typeof window !== 'undefined') {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          storedValue.value = serializer.read(e.newValue)
        } catch (error) {
          onError(error as Error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // 清理函数会在组件卸载时自动调用
    if (typeof window !== 'undefined') {
      const cleanup = () => {
        window.removeEventListener('storage', handleStorageChange)
      }

      // 在 Vue 3 中，可以使用 onUnmounted 来清理
      if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
        import('vue').then(({ onUnmounted }) => {
          onUnmounted(cleanup)
        })
      }
    }
  }

  return [storedValue as Ref<T>, setValue, remove]
}

/**
 * 会话存储 Hook
 * 
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @param options - 选项
 * @returns 响应式存储值和相关方法
 * 
 * @example
 * ```typescript
 * const [sessionData, setSessionData] = useSessionStorage('sessionData', {})
 * ```
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: Omit<UseLocalStorageOptions<T>, 'syncAcrossTabs'> = {}
): [Ref<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serializer = defaultSerializer,
    onError = (error) => console.error('useSessionStorage error:', error),
  } = options

  // 读取初始值
  const read = (): T => {
    try {
      const item = sessionStorage.getItem(key)
      if (item === null) {
        return defaultValue
      }
      return serializer.read(item)
    } catch (error) {
      onError(error as Error)
      return defaultValue
    }
  }

  // 写入值
  const write = (value: T): void => {
    try {
      sessionStorage.setItem(key, serializer.write(value))
    } catch (error) {
      onError(error as Error)
    }
  }

  // 删除值
  const remove = (): void => {
    try {
      sessionStorage.removeItem(key)
      storedValue.value = defaultValue
    } catch (error) {
      onError(error as Error)
    }
  }

  // 创建响应式引用
  const storedValue = ref<T>(read())

  // 设置值的函数
  const setValue = (value: T | ((prev: T) => T)): void => {
    try {
      const newValue = typeof value === 'function'
        ? (value as (prev: T) => T)(storedValue.value)
        : value

      storedValue.value = newValue
      write(newValue)
    } catch (error) {
      onError(error as Error)
    }
  }

  // 监听值的变化，同步到 sessionStorage
  watch(
    storedValue,
    (newValue) => {
      write(newValue)
    },
    { deep: true }
  )

  return [storedValue as Ref<T>, setValue, remove]
}
