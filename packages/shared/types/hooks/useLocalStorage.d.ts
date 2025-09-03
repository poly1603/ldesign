import { Ref } from 'vue';

/**
 * 本地存储 Hook
 *
 * @description
 * 提供响应式的本地存储功能，支持类型安全和自动序列化/反序列化。
 * 当存储值发生变化时，组件会自动重新渲染。
 */

/**
 * 本地存储序列化器接口
 */
interface StorageSerializer<T> {
    read: (value: string) => T;
    write: (value: T) => string;
}
/**
 * 字符串序列化器
 */
declare const stringSerializer: StorageSerializer<string>;
/**
 * 数字序列化器
 */
declare const numberSerializer: StorageSerializer<number>;
/**
 * 布尔值序列化器
 */
declare const booleanSerializer: StorageSerializer<boolean>;
/**
 * 本地存储 Hook 选项
 */
interface UseLocalStorageOptions<T> {
    /** 序列化器 */
    serializer?: StorageSerializer<T>;
    /** 是否在页面加载时立即同步 */
    syncAcrossTabs?: boolean;
    /** 错误处理函数 */
    onError?: (error: Error) => void;
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
declare function useLocalStorage<T>(key: string, defaultValue: T, options?: UseLocalStorageOptions<T>): [Ref<T>, (value: T | ((prev: T) => T)) => void, () => void];
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
declare function useSessionStorage<T>(key: string, defaultValue: T, options?: Omit<UseLocalStorageOptions<T>, 'syncAcrossTabs'>): [Ref<T>, (value: T | ((prev: T) => T)) => void, () => void];

export { booleanSerializer, numberSerializer, stringSerializer, useLocalStorage, useSessionStorage };
export type { StorageSerializer, UseLocalStorageOptions };
