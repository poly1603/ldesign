/**
 * @ldesign/router 组件模块导出
 */

// 组件
export { default as DeviceUnsupported } from './DeviceUnsupported'
export { default as RouterLink } from './RouterLink'
export { default as RouterView } from './RouterView'
export { ErrorBoundary, RouteErrorHandler, ErrorRecoveryStrategies, withErrorBoundary } from './ErrorBoundary'

export type { DeviceUnsupportedProps } from './DeviceUnsupported'
export type { ErrorBoundaryProps, RouteErrorInfo } from './ErrorBoundary'
// 类型
export type * from './types'
