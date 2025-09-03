/**
 * 异步数据管理 Hook
 *
 * @description
 * 提供异步数据的获取、缓存、刷新、错误处理等功能。
 * 支持依赖追踪、自动重新获取、数据转换等高级特性。
 */
import { type Ref } from 'vue';
/**
 * 异步数据获取函数
 */
export type AsyncDataFetcher<T, P extends any[] = any[]> = (...params: P) => Promise<T>;
/**
 * 异步数据配置
 */
export interface AsyncDataConfig<T, P extends any[] = any[]> {
    /** 默认数据 */
    defaultValue?: T;
    /** 是否立即执行 */
    immediate?: boolean;
    /** 依赖项（当依赖变化时重新获取数据） */
    dependencies?: Ref<any>[];
    /** 数据转换函数 */
    transform?: (data: T) => T;
    /** 错误处理函数 */
    onError?: (error: Error) => void;
    /** 成功回调 */
    onSuccess?: (data: T) => void;
    /** 重试次数 */
    retry?: number;
    /** 重试延迟（毫秒） */
    retryDelay?: number;
    /** 缓存时间（毫秒），0 表示不缓存 */
    cacheTime?: number;
    /** 缓存键 */
    cacheKey?: string;
    /** 是否在组件卸载时取消请求 */
    cancelOnUnmount?: boolean;
    /** 防抖延迟（毫秒） */
    debounce?: number;
}
/**
 * 异步数据状态
 */
export interface AsyncDataState<T> {
    /** 数据 */
    data: T | null;
    /** 是否正在加载 */
    loading: boolean;
    /** 错误信息 */
    error: Error | null;
    /** 是否已完成 */
    finished: boolean;
    /** 是否被取消 */
    aborted: boolean;
    /** 最后更新时间 */
    lastUpdated: Date | null;
    /** 是否来自缓存 */
    fromCache: boolean;
}
/**
 * 异步数据管理 Hook
 *
 * @param fetcher - 数据获取函数
 * @param config - 配置选项
 * @returns 异步数据状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const userId = ref(1)
 *
 *     // 基础用法
 *     const { state, execute, refresh } = useAsyncData(
 *       async () => {
 *         const response = await fetch(`/api/users/${userId.value}`)
 *         return response.json()
 *       },
 *       {
 *         immediate: true,
 *         dependencies: [userId],
 *         cacheTime: 5 * 60 * 1000, // 5分钟缓存
 *         cacheKey: () => `user-${userId.value}`
 *       }
 *     )
 *
 *     // 带参数的数据获取
 *     const { state: searchState, execute: search } = useAsyncData(
 *       async (query: string, page: number) => {
 *         const response = await fetch(`/api/search?q=${query}&page=${page}`)
 *         return response.json()
 *       },
 *       {
 *         defaultValue: { results: [], total: 0 },
 *         transform: (data) => ({
 *           ...data,
 *           results: data.results.map(item => ({ ...item, processed: true }))
 *         })
 *       }
 *     )
 *
 *     const handleSearch = (query: string) => {
 *       search(query, 1)
 *     }
 *
 *     return {
 *       state,
 *       refresh,
 *       searchState,
 *       handleSearch
 *     }
 *   }
 * })
 * ```
 */
export declare function useAsyncData<T, P extends any[] = any[]>(fetcher: AsyncDataFetcher<T, P>, config?: AsyncDataConfig<T, P>): {
    state: Ref<AsyncDataState<T>>;
    execute: (...params: P) => Promise<T | null>;
    refresh: (...params: P) => Promise<T | null>;
    abort: () => void;
    clear: () => void;
    setData: (newData: T) => void;
};
/**
 * 清除所有缓存
 */
export declare const clearAllCache: () => void;
/**
 * 清除指定缓存
 */
export declare const clearCache: (key: string) => void;
/**
 * 获取缓存信息
 */
export declare const getCacheInfo: () => {
    size: number;
    keys: string[];
};
//# sourceMappingURL=useAsyncData.d.ts.map