/**
 * HTTP 请求封装 Hook
 *
 * @description
 * 提供基于 fetch API 的 HTTP 请求功能，支持请求拦截、响应拦截、
 * 错误处理、重试机制、缓存等功能。
 */
import { type Ref } from 'vue';
/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
/**
 * 请求配置
 */
export interface FetchConfig extends Omit<RequestInit, 'method' | 'body'> {
    /** HTTP 方法 */
    method?: HttpMethod;
    /** 请求体 */
    body?: any;
    /** 查询参数 */
    params?: Record<string, any>;
    /** 超时时间（毫秒） */
    timeout?: number;
    /** 重试次数 */
    retry?: number;
    /** 重试延迟（毫秒） */
    retryDelay?: number;
    /** 是否自动解析 JSON */
    parseJson?: boolean;
    /** 基础 URL */
    baseURL?: string;
    /** 请求拦截器 */
    beforeRequest?: (config: FetchConfig) => FetchConfig | Promise<FetchConfig>;
    /** 响应拦截器 */
    afterResponse?: (response: Response) => Response | Promise<Response>;
    /** 错误处理器 */
    onError?: (error: Error) => void;
}
/**
 * 请求状态
 */
export interface FetchState<T = any> {
    /** 响应数据 */
    data: T | null;
    /** 是否正在加载 */
    loading: boolean;
    /** 错误信息 */
    error: Error | null;
    /** 响应对象 */
    response: Response | null;
    /** 是否已完成 */
    finished: boolean;
    /** 是否被取消 */
    aborted: boolean;
}
/**
 * 请求操作方法
 */
export interface FetchActions {
    /** 执行请求 */
    execute: () => Promise<void>;
    /** 取消请求 */
    abort: () => void;
    /** 重新请求 */
    refresh: () => Promise<void>;
}
/**
 * HTTP 请求 Hook
 *
 * @param url - 请求 URL
 * @param config - 请求配置
 * @returns 请求状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     // 基础用法
 *     const { state, execute } = useFetch('/api/users')
 *
 *     // 带参数的 GET 请求
 *     const { state: userState } = useFetch('/api/user', {
 *       params: { id: 123 },
 *       immediate: true
 *     })
 *
 *     // POST 请求
 *     const { state: createState, execute: createUser } = useFetch('/api/users', {
 *       method: 'POST',
 *       body: { name: 'John', email: 'john@example.com' }
 *     })
 *
 *     // 带重试的请求
 *     const { state: retryState } = useFetch('/api/data', {
 *       retry: 3,
 *       retryDelay: 1000,
 *       onError: (error) => {
 *         console.error('请求失败:', error)
 *       }
 *     })
 *
 *     return {
 *       state,
 *       execute,
 *       userState,
 *       createUser,
 *       retryState
 *     }
 *   }
 * })
 * ```
 */
export declare function useFetch<T = any>(url: string, config?: FetchConfig & {
    immediate?: boolean;
}): {
    state: Ref<FetchState<T>>;
    execute: () => Promise<void>;
    abort: () => void;
    refresh: () => Promise<void>;
};
/**
 * GET 请求
 */
export declare const useGet: <T = any>(url: string, config?: Omit<FetchConfig, "method"> & {
    immediate?: boolean;
}) => {
    state: Ref<FetchState<T>, FetchState<T>>;
    execute: () => Promise<void>;
    abort: () => void;
    refresh: () => Promise<void>;
};
/**
 * POST 请求
 */
export declare const usePost: <T = any>(url: string, config?: Omit<FetchConfig, "method"> & {
    immediate?: boolean;
}) => {
    state: Ref<FetchState<T>, FetchState<T>>;
    execute: () => Promise<void>;
    abort: () => void;
    refresh: () => Promise<void>;
};
/**
 * PUT 请求
 */
export declare const usePut: <T = any>(url: string, config?: Omit<FetchConfig, "method"> & {
    immediate?: boolean;
}) => {
    state: Ref<FetchState<T>, FetchState<T>>;
    execute: () => Promise<void>;
    abort: () => void;
    refresh: () => Promise<void>;
};
/**
 * DELETE 请求
 */
export declare const useDelete: <T = any>(url: string, config?: Omit<FetchConfig, "method"> & {
    immediate?: boolean;
}) => {
    state: Ref<FetchState<T>, FetchState<T>>;
    execute: () => Promise<void>;
    abort: () => void;
    refresh: () => Promise<void>;
};
//# sourceMappingURL=useFetch.d.ts.map