import { Ref, inject, InjectionKey } from 'vue';
import { UseRequestReturn, UseQueryReturn, UseMutationReturn } from '../types/vue.js';
import { HttpClient, RequestConfig, ResponseData, HttpError } from '../types/index.js';
import './plugin.js';

/**
 * HTTP 客户端注入键
 */
declare const HTTP_CLIENT_KEY: InjectionKey<HttpClient>;
/**
 * 全局配置注入键
 */
declare const HTTP_CONFIG_KEY: InjectionKey<Ref<RequestConfig>>;
/**
 * 提供 HTTP 客户端
 */
declare function provideHttpClient(client: HttpClient, globalConfig?: RequestConfig): void;
/**
 * 注入 HTTP 客户端
 */
declare function injectHttpClient(): HttpClient;
/**
 * 注入全局配置
 */
declare function injectHttpConfig(): Ref<RequestConfig>;
/**
 * 主要的 HTTP Hook
 * 自动注入客户端和全局配置
 */
declare function useHttp(): {
    client: HttpClient;
    globalConfig: Ref<RequestConfig>;
    request: <T = any>(config: RequestConfig) => Promise<ResponseData<T>>;
    get: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>;
    post: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<ResponseData<T>>;
    put: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<ResponseData<T>>;
    delete: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>;
    patch: <T = any>(url: string, data?: any, config?: RequestConfig) => Promise<ResponseData<T>>;
    head: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>;
    options: <T = any>(url: string, config?: RequestConfig) => Promise<ResponseData<T>>;
    useRequest: <T = any>(config: RequestConfig, options?: any) => UseRequestReturn<T>;
    useQuery: <T = any>(queryKey: any, config: RequestConfig, options?: any) => UseQueryReturn<T>;
    useMutation: <T = any, V = any>(mutationFn: any, options?: any) => UseMutationReturn<T, V>;
    usePost: <T = any, D = any>(url: string, options?: any) => UseMutationReturn<T, D>;
    usePut: <T = any, D = any>(url: string, options?: any) => UseMutationReturn<T, D>;
    usePatch: <T = any, D = any>(url: string, options?: any) => UseMutationReturn<T, D>;
    useDelete: <T = any>(url: string, options?: any) => UseMutationReturn<T, void>;
    cancelAll: (reason?: string) => void;
    clearCache: () => Promise<void>;
    getActiveRequestCount: () => number;
    getConcurrencyStatus: () => {
        activeCount: number;
        queuedCount: number;
        maxConcurrent: number;
        maxQueueSize: number;
    };
};
/**
 * 创建资源 Hook
 * 用于 RESTful API 操作
 */
declare function useResource<T = any>(baseUrl: string): {
    useList: (params?: Record<string, any>, options?: any) => UseQueryReturn<any>;
    useDetail: (id: string | number, options?: any) => UseQueryReturn<any>;
    useCreate: (options?: any) => UseMutationReturn<any, any>;
    useUpdate: (options?: any) => UseMutationReturn<any, any>;
    usePatch: (options?: any) => UseMutationReturn<any, any>;
    useDelete: (options?: any) => UseMutationReturn<any, any>;
    list: (params?: Record<string, any>) => Promise<ResponseData<T[]>>;
    detail: (id: string | number) => Promise<ResponseData<T>>;
    create: (data: T) => Promise<ResponseData<T>>;
    update: (id: string | number, data: Partial<T>) => Promise<ResponseData<T>>;
    patch: (id: string | number, data: Partial<T>) => Promise<ResponseData<T>>;
    remove: (id: string | number) => Promise<ResponseData<any>>;
};
/**
 * 分页查询 Hook
 */
declare function usePagination<T = any>(baseUrl: string, initialPage?: number, initialPageSize?: number): {
    isStale: Ref<boolean>;
    isFetching: Ref<boolean>;
    dataUpdatedAt: Ref<number>;
    failureCount: Ref<number>;
    invalidate: () => void;
    execute: (config?: RequestConfig) => Promise<ResponseData<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
    }>>;
    refresh: () => Promise<ResponseData<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
    }>>;
    cancel: () => void;
    reset: () => void;
    canCancel: inject<boolean>;
    data: Ref<T_1 | null>;
    loading: Ref<boolean>;
    error: Ref<HttpError | null>;
    finished: Ref<boolean>;
    page: any;
    pageSize: any;
    total: any;
    totalPages: any;
    hasNextPage: any;
    hasPrevPage: any;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (targetPage: number) => void;
    setPageSize: (newPageSize: number) => void;
};

export { HTTP_CLIENT_KEY, HTTP_CONFIG_KEY, injectHttpClient, injectHttpConfig, provideHttpClient, useHttp, usePagination, useResource };
