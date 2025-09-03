import { Ref } from 'vue';

/**
 * 无限滚动 Hook
 *
 * @description
 * 提供无限滚动功能，支持自动加载更多数据、滚动到底部检测、
 * 加载状态管理等功能。
 */

/**
 * 无限滚动数据获取函数
 */
type InfiniteScrollFetcher<T> = (page: number, pageSize: number) => Promise<{
    data: T[];
    hasMore: boolean;
    total?: number;
}>;
/**
 * 无限滚动配置
 */
interface InfiniteScrollConfig<T> {
    /** 每页大小 */
    pageSize?: number;
    /** 触发加载的距离阈值（像素） */
    threshold?: number;
    /** 目标容器选择器或元素 */
    target?: string | HTMLElement | Ref<HTMLElement | null>;
    /** 是否立即加载第一页 */
    immediate?: boolean;
    /** 是否启用 */
    enabled?: boolean;
    /** 数据转换函数 */
    transform?: (item: T, index: number, allData: T[]) => T;
    /** 错误处理函数 */
    onError?: (error: Error) => void;
    /** 加载成功回调 */
    onLoad?: (data: T[], page: number, hasMore: boolean) => void;
    /** 到达底部回调 */
    onReachBottom?: () => void;
}
/**
 * 无限滚动状态
 */
interface InfiniteScrollState<T> {
    /** 所有数据 */
    data: T[];
    /** 当前页码 */
    page: number;
    /** 是否正在加载 */
    loading: boolean;
    /** 是否还有更多数据 */
    hasMore: boolean;
    /** 错误信息 */
    error: Error | null;
    /** 是否已完成初始加载 */
    initialized: boolean;
    /** 总数据量（如果提供） */
    total: number | null;
}
/**
 * 无限滚动操作方法
 */
interface InfiniteScrollActions {
    /** 加载下一页 */
    loadMore: () => Promise<void>;
    /** 刷新数据（重新从第一页开始） */
    refresh: () => Promise<void>;
    /** 重置状态 */
    reset: () => void;
    /** 滚动到顶部 */
    scrollToTop: () => void;
    /** 滚动到底部 */
    scrollToBottom: () => void;
    /** 滚动到指定位置 */
    scrollTo: (top: number) => void;
}
/**
 * 无限滚动 Hook
 *
 * @param fetcher - 数据获取函数
 * @param config - 配置选项
 * @returns 无限滚动状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const containerRef = ref<HTMLElement>()
 *
 *     const { state, actions } = useInfiniteScroll(
 *       async (page, pageSize) => {
 *         const response = await fetch(`/api/posts?page=${page}&size=${pageSize}`)
 *         const result = await response.json()
 *         return {
 *           data: result.data,
 *           hasMore: result.hasMore,
 *           total: result.total
 *         }
 *       },
 *       {
 *         target: containerRef,
 *         pageSize: 20,
 *         threshold: 100,
 *         immediate: true,
 *         onLoad: (data, page, hasMore) => {
 *           console.log(`加载第 ${page} 页，获得 ${data.length} 条数据`)
 *         }
 *       }
 *     )
 *
 *     return {
 *       containerRef,
 *       state,
 *       actions
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div ref="containerRef" class="infinite-scroll-container">
 *     <div v-for="item in state.data" :key="item.id" class="item">
 *       {{ item.title }}
 *     </div>
 *
 *     <div v-if="state.loading" class="loading">
 *       加载中...
 *     </div>
 *
 *     <div v-if="!state.hasMore && state.initialized" class="no-more">
 *       没有更多数据了
 *     </div>
 *
 *     <div v-if="state.error" class="error">
 *       加载失败: {{ state.error.message }}
 *       <button @click="actions.loadMore()">重试</button>
 *     </div>
 *
 *     <button @click="actions.refresh()">刷新</button>
 *     <button @click="actions.scrollToTop()">回到顶部</button>
 *   </div>
 * </template>
 *
 * <style>
 * .infinite-scroll-container {
 *   height: 400px;
 *   overflow-y: auto;
 * }
 * </style>
 * ```
 */
declare function useInfiniteScroll<T>(fetcher: InfiniteScrollFetcher<T>, config?: InfiniteScrollConfig<T>): {
    state: Ref<InfiniteScrollState<T>>;
    actions: InfiniteScrollActions;
};

export { useInfiniteScroll };
export type { InfiniteScrollActions, InfiniteScrollConfig, InfiniteScrollFetcher, InfiniteScrollState };
