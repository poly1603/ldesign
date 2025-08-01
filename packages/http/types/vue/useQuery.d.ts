import { MaybeRef } from 'vue';
import { UseQueryOptions, UseQueryReturn } from '@/types/vue';
import { HttpClient, RequestConfig } from '@/types';

/**
 * useQuery Hook
 * 用于处理带缓存的查询请求
 */
declare function useQuery<T = any>(client: HttpClient, queryKey: MaybeRef<string | (() => string)>, config: MaybeRef<RequestConfig>, options?: UseQueryOptions<T>): UseQueryReturn<T>;

export { useQuery };
