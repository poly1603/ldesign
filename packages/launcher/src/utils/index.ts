/**
 * @ldesign/launcher 工具函数
 * 
 * 导出所有工具函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 导出核心工具
export * from './logger'
export * from './error-handler'
export * from './file-system'
export * from './path-utils'

// 导出所有工具函数
export * from './config'
export * from './build'
export * from './plugin'
export * from './performance'

// 选择性导出以避免命名冲突
export {
  // server utils
  isPortAvailable,
  findAvailablePort,
  getServerUrl,
  getNetworkUrls,
  waitForServer,
  getServerStatus,
  openBrowser,
  getServerSummary,
  parseHost,
  logServerInfo
} from './server'

export {
  // validation utils (避免与server模块中的isValidUrl冲突)
  isValidPort,
  isValidHost,
  isValidFilePath,
  isValidVersion,
  isValidEnvVarName,
  isValidLogLevel,
  isValidMode,
  isValidBuildTarget,
  isValidMinifyOption,
  validateObjectSchema
} from './validation'

export {
  // format utils
  formatDuration,
  formatRelativeTime,
  formatPercentage,
  formatNumber,
  formatUrl,
  formatPath,
  formatJson
} from './format'

export {
  // network utils (避免与server模块中的getNetworkInterfaces冲突)
  downloadFile,
  checkUrlAccessibility,
  parseUrl,
  buildUrl,
  isLocalAddress,
  getPreferredLocalIP,
  getLocalIPs
} from './network'

// 解决冲突的函数导出（使用别名）
export { isValidUrl as isValidUrlFromValidation } from './validation'
export { isValidUrl as isValidUrlFromServer } from './server'
export { formatFileSize as formatFileSizeFromFormat } from './format'
export { formatFileSize as formatFileSizeFromBuild } from './build'
export { getNetworkInterfaces as getNetworkInterfacesFromServer } from './server'
export { getNetworkInterfaces as getNetworkInterfacesFromNetwork } from './network'
