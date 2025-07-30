import { MaybeRef } from 'vue';
import { UseRequestOptions, UseRequestReturn } from '../types/vue.js';
import { HttpClient, RequestConfig, ResponseData } from '../types/index.js';

/**
 * useRequest Hook
 * 用于处理 HTTP 请求的 Vue 3 Composition API Hook
 */
declare function useRequest<T = any>(client: HttpClient, config: MaybeRef<RequestConfig>, options?: UseRequestOptions<T>): UseRequestReturn<T>;
/**
 * 简化的 useRequest Hook，用于单次请求
 */
declare function useAsyncRequest<T = any>(client: HttpClient, requestFn: () => Promise<ResponseData<T>>, options?: Omit<UseRequestOptions<T>, 'immediate'>): UseRequestReturn<T>;

export { useAsyncRequest, useRequest };
