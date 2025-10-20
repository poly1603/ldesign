/**
 * @ldesign/api - UMD 构建专用入口文件
 * 为浏览器环境和库模式提供精简的 API 界面
 * 仅导出核心功能，不包含Vue/React特定集成
 */

// 核心引擎实现
export { ApiEngineImpl } from './core/ApiEngine'

// 主要的 API 创建工厂函数
export {
 createApiEngine,
 createSingletonApiEngine,
 createSystemApiEngine,
 destroySingletonApiEngine,
} from './core/factory'

// 核心插件
export { systemApiPlugin } from './plugins/systemApi'

// 核心类型（仅类型导出）
export type {
 ApiCallOptions,
 ApiEngine,
 ApiEngineConfig,
 ApiMethodConfig,
 ApiPlugin,
 CacheConfig,
 CacheStats,
 LoginParams,
 LoginResult,
 MenuItem,
 SystemApiMethodName,
 UserInfo,
} from './types'

// 系统 API 常量
export { SYSTEM_API_METHODS } from './types'

// 类型辅助
export type { TypedApiEngine } from './types/typed'
export { withTypedApi } from './types/typed'

// 主要工具类
export { CacheManager } from './utils/CacheManager'

// 版本信息
export { version } from './version'
