/**
 * 数据预取模块
 * @module data-fetching
 */

// 导出管理器
export {
  DataFetchingManager,
  DATA_FETCHING_KEY,
  DataFetchingPlugin,
  createDataFetchingManager
} from './DataFetchingManager'

// 导出类型
export type {
  DataFetchConfig,
  DataFetchState,
  DataFetchOptions,
  DataFetchFunction
} from './DataFetchingManager'

// 导出组合式API
export {
  useDataFetching,
  useMultipleDataFetching,
  useLazyDataFetching,
  usePaginatedDataFetching,
  useInfiniteDataFetching
} from './useDataFetching'

// 导出组合式API类型
export type {
  UseDataFetchingOptions,
  UseDataFetchingReturn,
  UsePaginatedDataFetchingOptions,
  UseInfiniteDataFetchingOptions
} from './useDataFetching'

// 导出类型
export type {
  DataFetchingManager as DataFetchingManagerType
} from './DataFetchingManager'