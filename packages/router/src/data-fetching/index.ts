/**
 * 数据预取模块
 * @module data-fetching
 */

// 导出管理器
export {
  createDataFetchingManager,
  DATA_FETCHING_KEY,
  DataFetchingManager,
  DataFetchingPlugin
} from './DataFetchingManager'

// 导出类型
export type {
  DataFetchConfig,
  DataFetchFunction,
  DataFetchOptions,
  DataFetchState
} from './DataFetchingManager'

// 导出类型
export type {
  DataFetchingManager as DataFetchingManagerType
} from './DataFetchingManager'

// 导出组合式API
export {
  useDataFetching,
  useInfiniteDataFetching,
  useLazyDataFetching,
  useMultipleDataFetching,
  usePaginatedDataFetching
} from './useDataFetching'

// 导出组合式API类型
export type {
  UseDataFetchingOptions,
  UseDataFetchingReturn,
  UseInfiniteDataFetchingOptions,
  UsePaginatedDataFetchingOptions
} from './useDataFetching'