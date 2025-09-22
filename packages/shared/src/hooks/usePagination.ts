/**
 * 分页数据处理 Hook
 * 
 * @description
 * 提供分页数据的管理功能，支持页码控制、页面大小调整、
 * 数据加载、搜索过滤等功能。
 */

import { ref, computed, watch, unref, type Ref, type ComputedRef } from 'vue'
import { useAsyncData } from './useAsyncData'

/**
 * 分页参数
 */
export interface PaginationParams {
  /** 当前页码（从 1 开始） */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总数据量 */
  total: number
  /** 搜索关键词 */
  search?: string
  /** 排序字段 */
  sortBy?: string
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
  /** 其他过滤参数 */
  filters?: Record<string, any>
}

/**
 * 分页响应数据
 */
export interface PaginationResponse<T> {
  /** 数据列表 */
  data: T[]
  /** 总数据量 */
  total: number
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrev: boolean
}

/**
 * 分页数据获取函数
 */
export type PaginationFetcher<T> = (params: PaginationParams) => Promise<PaginationResponse<T>>

/**
 * 分页配置
 */
export interface PaginationConfig<T> {
  /** 初始页码 */
  initialPage?: number
  /** 初始每页大小 */
  initialPageSize?: number
  /** 可选的每页大小 */
  pageSizeOptions?: number[]
  /** 是否立即加载 */
  immediate?: boolean
  /** 是否在参数变化时自动重新加载 */
  autoReload?: boolean
  /** 搜索防抖延迟（毫秒） */
  searchDebounce?: number
  /** 数据转换函数 */
  transform?: (response: PaginationResponse<T>) => PaginationResponse<T>
  /** 错误处理函数 */
  onError?: (error: Error) => void
  /** 数据加载成功回调 */
  onSuccess?: (response: PaginationResponse<T>) => void
}

/**
 * 分页状态
 */
export interface PaginationState<T> {
  /** 数据列表 */
  data: T[]
  /** 当前页码 */
  page: number
  /** 每页大小 */
  pageSize: number
  /** 总数据量 */
  total: number
  /** 总页数 */
  totalPages: number
  /** 是否有下一页 */
  hasNext: boolean
  /** 是否有上一页 */
  hasPrev: boolean
  /** 是否正在加载 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 搜索关键词 */
  search: string
  /** 排序字段 */
  sortBy: string
  /** 排序方向 */
  sortOrder: 'asc' | 'desc'
  /** 过滤参数 */
  filters: Record<string, any>
}

/**
 * 分页操作方法
 */
export interface PaginationActions<T = any> {
  /** 跳转到指定页 */
  goToPage: (page: number) => Promise<void>
  /** 下一页 */
  nextPage: () => Promise<void>
  /** 上一页 */
  prevPage: () => Promise<void>
  /** 第一页 */
  firstPage: () => Promise<void>
  /** 最后一页 */
  lastPage: () => Promise<void>
  /** 设置每页大小 */
  setPageSize: (size: number) => Promise<void>
  /** 设置搜索关键词 */
  setSearch: (search: string) => void
  /** 设置排序 */
  setSort: (field: string, order?: 'asc' | 'desc') => Promise<void>
  /** 设置过滤器 */
  setFilters: (filters: Record<string, any>) => Promise<void>
  /** 刷新当前页 */
  refresh: () => Promise<PaginationResponse<T> | null>
  /** 重置到第一页 */
  reset: () => Promise<void>
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
export function usePagination<T>(
  fetcher: PaginationFetcher<T>,
  config: PaginationConfig<T> = {}
) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [10, 20, 50, 100],
    immediate = false,
    autoReload = true,
    searchDebounce = 300,
    transform,
    onError,
    onSuccess,
  } = config

  // 分页参数
  const page = ref(initialPage)
  const pageSize = ref(initialPageSize)
  const search = ref('')
  const sortBy = ref('')
  const sortOrder = ref<'asc' | 'desc'>('asc')
  const filters = ref<Record<string, any>>({})

  // 响应数据
  const data = ref<T[]>([])
  const total = ref(0)

  // 搜索防抖定时器
  let searchTimer: NodeJS.Timeout | null = null

  // 使用 useAsyncData 管理数据获取
  const { state: asyncState, execute, refresh } = useAsyncData(
    async () => {
      const params: PaginationParams = {
        page: page.value,
        pageSize: pageSize.value,
        total: total.value,
        search: search.value,
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
        filters: filters.value,
      }

      const response = await fetcher(params)
      
      // 数据转换
      const finalResponse = transform ? transform(response) : response
      
      // 更新本地状态
      data.value = finalResponse.data
      total.value = finalResponse.total
      
      // 执行成功回调
      onSuccess?.(finalResponse)
      
      return finalResponse
    },
    {
      immediate,
      onError,
    }
  )

  // 计算属性
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrev = computed(() => page.value > 1)

  /**
   * 跳转到指定页
   */
  const goToPage = async (targetPage: number): Promise<void> => {
    if (targetPage < 1 || targetPage > totalPages.value || targetPage === page.value) {
      return
    }
    
    page.value = targetPage
    await execute()
  }

  /**
   * 下一页
   */
  const nextPage = async (): Promise<void> => {
    if (hasNext.value) {
      await goToPage(page.value + 1)
    }
  }

  /**
   * 上一页
   */
  const prevPage = async (): Promise<void> => {
    if (hasPrev.value) {
      await goToPage(page.value - 1)
    }
  }

  /**
   * 第一页
   */
  const firstPage = async (): Promise<void> => {
    await goToPage(1)
  }

  /**
   * 最后一页
   */
  const lastPage = async (): Promise<void> => {
    await goToPage(totalPages.value)
  }

  /**
   * 设置每页大小
   */
  const setPageSize = async (size: number): Promise<void> => {
    if (size === pageSize.value) return
    
    pageSize.value = size
    page.value = 1 // 重置到第一页
    await execute()
  }

  /**
   * 设置搜索关键词
   */
  const setSearch = (keyword: string): void => {
    search.value = keyword
    
    // 清除之前的定时器
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
    
    // 设置防抖
    if (autoReload) {
      searchTimer = setTimeout(async () => {
        page.value = 1 // 重置到第一页
        await execute()
      }, searchDebounce)
    }
  }

  /**
   * 设置排序
   */
  const setSort = async (field: string, order: 'asc' | 'desc' = 'asc'): Promise<void> => {
    // 如果是同一个字段，切换排序方向
    if (sortBy.value === field) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortBy.value = field
      sortOrder.value = order
    }
    
    page.value = 1 // 重置到第一页
    await execute()
  }

  /**
   * 设置过滤器
   */
  const setFilters = async (newFilters: Record<string, any>): Promise<void> => {
    filters.value = { ...newFilters }
    page.value = 1 // 重置到第一页
    await execute()
  }

  /**
   * 重置到第一页
   */
  const reset = async (): Promise<void> => {
    page.value = initialPage
    pageSize.value = initialPageSize
    search.value = ''
    sortBy.value = ''
    sortOrder.value = 'asc'
    filters.value = {}
    await execute()
  }

  // 计算状态
  const state = computed<PaginationState<T>>(() => ({
    data: data.value as T[],
    page: page.value,
    pageSize: pageSize.value,
    total: total.value,
    totalPages: totalPages.value,
    hasNext: hasNext.value,
    hasPrev: hasPrev.value,
    loading: asyncState.value.loading,
    error: asyncState.value.error,
    search: search.value,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
    filters: filters.value,
  }))

  const actions: PaginationActions = {
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    setPageSize,
    setSearch,
    setSort,
    setFilters,
    refresh,
    reset,
  }

  return {
    state: state as Ref<PaginationState<T>>,
    actions,
    pageSizeOptions,
  }
}
