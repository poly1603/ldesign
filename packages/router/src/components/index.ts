/**
 * @ldesign/router 组件模块导出
 */

// 组件
export { default as DeviceUnsupported } from './DeviceUnsupported'
export type { DeviceUnsupportedProps } from './DeviceUnsupported'
export { ErrorBoundary, ErrorRecoveryStrategies, RouteErrorHandler, withErrorBoundary } from './ErrorBoundary'
export type { ErrorBoundaryProps, RouteErrorInfo } from './ErrorBoundary'

export { default as RouterLink } from './RouterLink'
export { default as RouterView } from './RouterView'
// 类型
export type * from './types'
