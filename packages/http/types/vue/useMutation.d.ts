import { UseMutationOptions, UseMutationReturn } from '../types/vue.js';
import { HttpClient, RequestConfig, ResponseData } from '../types/index.js';

/**
 * useMutation Hook
 * 用于处理变更操作（POST、PUT、DELETE 等）
 */
declare function useMutation<T = any, V = any>(client: HttpClient, mutationFn: (variables: V, config?: RequestConfig) => Promise<ResponseData<T>>, options?: UseMutationOptions<T, V>): UseMutationReturn<T, V>;
/**
 * 简化的变更 Hook，用于特定的 HTTP 方法
 */
declare function usePost<T = any, D = any>(client: HttpClient, url: string, options?: UseMutationOptions<T, D>): UseMutationReturn<T, D>;
declare function usePut<T = any, D = any>(client: HttpClient, url: string, options?: UseMutationOptions<T, D>): UseMutationReturn<T, D>;
declare function usePatch<T = any, D = any>(client: HttpClient, url: string, options?: UseMutationOptions<T, D>): UseMutationReturn<T, D>;
declare function useDelete<T = any>(client: HttpClient, url: string, options?: UseMutationOptions<T, void>): UseMutationReturn<T, void>;

export { useDelete, useMutation, usePatch, usePost, usePut };
