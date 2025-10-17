/**
 * @ldesign/shared - 共享工具库
 *
 * 提供通用的工具函数、类型定义、Vue 组合式函数和 UI 组件
 */

// 导出 Vue 组合式函数
// 导出类型
export * from './types'

// 导出工具函数
export * from './utils'

// 导出测试工具
export * from './test-utils'

// 导出错误处理
export * from './error-handler'

// 导出原有的包管理
export * from './package'

// 导出工具函数（排除与hooks冲突的函数）
export * from './utils/array'
export * from './utils/batchUpdate'
export * from './utils/browser'
export * from './utils/cache'
export * from './utils/date'
export * from './utils/dom'
export * from './utils/easing'
export * from './utils/eventBus'
export * from './utils/file'
export * from './utils/format'
export * from './utils/general'
export * from './utils/http'
export * from './utils/observe'
export * from './utils/performance'
export * from './utils/renderNode'
export * from './utils/setStyle'
export * from './utils/string'
export * from './utils/tree'
export * from './utils/validate'
export * from './utils/withInstall'

// 导出基本类型定义
export type {
  // 通用类型
  PlainObject,
  OptionData,
  TreeOptionData,
  SizeEnum,
  ShapeEnum,
  HorizontalAlignEnum,
  VerticalAlignEnum,
  LayoutEnum,
  ClassName,
  CSSSelector,
  KeysType,
  TreeKeysType,
  HTMLElementAttributes,

  // 实用类型
  DeepPartial,
  DeepRequired,
  DeepReadonly,
  Nullable,
  Optional,
  Maybe,
  AnyFunction,
  AsyncFunction,
  Constructor,
  AbstractConstructor,
  ValueOrFunction,
  ValueOrPromise,
  ArrayOrSingle,

  // Web开发类型
  ApiResponse,
  SearchParams,
  UploadFile,
  FormField,
  MenuItem,
  RouteMeta,
  UserInfo,
  ThemeConfig,
  DeviceInfo,
  NotificationConfig
} from './types'

// 导出 UI 组件
// TEMPORARY: Components disabled during build fix
// export * from './components'
