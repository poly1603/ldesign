import { Ref } from 'vue';

/**
 * 分页数据处理 Hook
 *
 * @description
 * 提供分页数据的管理功能，支持页码控制、页面大小调整、
 * 数据加载、搜索过滤等功能。
 */

/**
 * 分页参数
 */
interface PaginationParams {
    /** 当前页码（从 1 开始） */
    page: number;
    /** 每页大小 */
    pageSize: number;
    /** 总数据量 */
    total: number;
    /** 搜索关键词 */
    search?: string;
    /** 排序字段 */
    sortBy?: string;
    /** 排序方向 */
    sortOrder?: 'asc' | 'desc';
    /** 其他过滤参数 */
    filters?: Record<string, any>;
}
/**
 * 分页响应数据
 */
interface PaginationResponse<T> {
    /** 数据列表 */
    data: T[];
    /** 总数据量 */
    total: number;
    /** 当前页码 */
    page: number;
    /** 每页大小 */
    pageSize: number;
    /** 总页数 */
    totalPages: number;
    /** 是否有下一页 */
    hasNext: boolean;
    /** 是否有上一页 */
    hasPrev: boolean;
}
/**
 * 分页数据获取函数
 */
type PaginationFetcher<T> = (params: PaginationParams) => Promise<PaginationResponse<T>>;
/**
 * 分页配置
 */
interface PaginationConfig<T> {
    /** 初始页码 */
    initialPage?: number;
    /** 初始每页大小 */
    initialPageSize?: number;
    /** 可选的每页大小 */
    pageSizeOptions?: number[];
    /** 是否立即加载 */
    immediate?: boolean;
    /** 是否在参数变化时自动重新加载 */
    autoReload?: boolean;
    /** 搜索防抖延迟（毫秒） */
    searchDebounce?: number;
    /** 数据转换函数 */
    transform?: (response: PaginationResponse<T>) => PaginationResponse<T>;
    /** 错误处理函数 */
    onError?: (error: Error) => void;
    /** 数据加载成功回调 */
    onSuccess?: (response: PaginationResponse<T>) => void;
}
/**
 * 分页状态
 */
interface PaginationState<T> {
    /** 数据列表 */
    data: T[];
    /** 当前页码 */
    page: number;
    /** 每页大小 */
    pageSize: number;
    /** 总数据量 */
    total: number;
    /** 总页数 */
    totalPages: number;
    /** 是否有下一页 */
    hasNext: boolean;
    /** 是否有上一页 */
    hasPrev: boolean;
    /** 是否正在加载 */
    loading: boolean;
    /** 错误信息 */
    error: Error | null;
    /** 搜索关键词 */
    search: string;
    /** 排序字段 */
    sortBy: string;
    /** 排序方向 */
    sortOrder: 'asc' | 'desc';
    /** 过滤参数 */
    filters: Record<string, any>;
}
/**
 * 分页操作方法
 */
interface PaginationActions {
    /** 跳转到指定页 */
    goToPage: (page: number) => Promise<void>;
    /** 下一页 */
    nextPage: () => Promise<void>;
    /** 上一页 */
    prevPage: () => Promise<void>;
    /** 第一页 */
    firstPage: () => Promise<void>;
    /** 最后一页 */
    lastPage: () => Promise<void>;
    /** 设置每页大小 */
    setPageSize: (size: number) => Promise<void>;
    /** 设置搜索关键词 */
    setSearch: (search: string) => void;
    /** 设置排序 */
    setSort: (field: string, order?: 'asc' | 'desc') => Promise<void>;
    /** 设置过滤器 */
    setFilters: (filters: Record<string, any>) => Promise<void>;
    /** 刷新当前页 */
    refresh: () => Promise<void>;
    /** 重置到第一页 */
    reset: () => Promise<void>;
}
/**
 * 分页数据处理 Hook
 *
 * @param fetcher - 数据获取函数
 * @param config - 配置选项
 * @returns 分页状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, actions } = usePagination(
 *       async (params) => {
 *         const response = await fetch('/api/users', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify(params)
 *         })
 *         return response.json()
 *       },
 *       {
 *         initialPage: 1,
 *         initialPageSize: 10,
 *         pageSizeOptions: [10, 20, 50, 100],
 *         immediate: true,
 *         searchDebounce: 300
 *       }
 *     )
 *
 *     const handleSearch = (keyword: string) => {
 *       actions.setSearch(keyword)
 *     }
 *
 *     const handleSort = (field: string) => {
 *       const order = state.sortBy === field && state.sortOrder === 'asc' ? 'desc' : 'asc'
 *       actions.setSort(field, order)
 *     }
 *
 *     return {
 *       state,
 *       actions,
 *       handleSearch,
 *       handleSort
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 搜索框 -->
 *     <input
 *       :value="state.search"
 *       @input="actions.setSearch($event.target.value)"
 *       placeholder="搜索..."
 *     />
 *
 *     <!-- 数据表格 -->
 *     <table>
 *       <thead>
 *         <tr>
 *           <th @click="actions.setSort('name')">
 *             姓名
 *             <span v-if="state.sortBy === 'name'">
 *               {{ state.sortOrder === 'asc' ? '↑' : '↓' }}
 *             </span>
 *           </th>
 *           <th @click="actions.setSort('email')">邮箱</th>
 *         </tr>
 *       </thead>
 *       <tbody>
 *         <tr v-for="user in state.data" :key="user.id">
 *           <td>{{ user.name }}</td>
 *           <td>{{ user.email }}</td>
 *         </tr>
 *       </tbody>
 *     </table>
 *
 *     <!-- 分页控件 -->
 *     <div class="pagination">
 *       <button
 *         @click="actions.firstPage()"
 *         :disabled="!state.hasPrev || state.loading"
 *       >
 *         首页
 *       </button>
 *       <button
 *         @click="actions.prevPage()"
 *         :disabled="!state.hasPrev || state.loading"
 *       >
 *         上一页
 *       </button>
 *
 *       <span>
 *         第 {{ state.page }} 页，共 {{ state.totalPages }} 页
 *       </span>
 *
 *       <button
 *         @click="actions.nextPage()"
 *         :disabled="!state.hasNext || state.loading"
 *       >
 *         下一页
 *       </button>
 *       <button
 *         @click="actions.lastPage()"
 *         :disabled="!state.hasNext || state.loading"
 *       >
 *         末页
 *       </button>
 *
 *       <select @change="actions.setPageSize(Number($event.target.value))">
 *         <option v-for="size in pageSizeOptions" :key="size" :value="size">
 *           {{ size }} 条/页
 *         </option>
 *       </select>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
declare function usePagination<T>(fetcher: PaginationFetcher<T>, config?: PaginationConfig<T>): {
    state: Ref<PaginationState<T>>;
    actions: PaginationActions;
    pageSizeOptions: number[];
};

export { usePagination };
export type { PaginationActions, PaginationConfig, PaginationFetcher, PaginationParams, PaginationResponse, PaginationState };
