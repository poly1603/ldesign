/**
 * 统一错误码系统
 * 提供标准化的错误代码、消息和处理建议
 */

/**
 * 错误码枚举
 */
export enum ApiErrorCode {
 // 网络错误 (1xxx)
 NETWORK_ERROR = 'ERR_NETWORK',
 NETWORK_TIMEOUT = 'ERR_NETWORK_TIMEOUT',
 NETWORK_OFFLINE = 'ERR_NETWORK_OFFLINE',
 NETWORK_CONNECTION_REFUSED = 'ERR_NETWORK_CONNECTION_REFUSED',

 // HTTP状态码错误 (2xxx)
 HTTP_BAD_REQUEST = 'ERR_HTTP_400',
 HTTP_UNAUTHORIZED = 'ERR_HTTP_401',
 HTTP_FORBIDDEN = 'ERR_HTTP_403',
 HTTP_NOT_FOUND = 'ERR_HTTP_404',
 HTTP_METHOD_NOT_ALLOWED = 'ERR_HTTP_405',
 HTTP_TIMEOUT = 'ERR_HTTP_408',
 HTTP_CONFLICT = 'ERR_HTTP_409',
 HTTP_RATE_LIMIT = 'ERR_HTTP_429',
 HTTP_SERVER_ERROR = 'ERR_HTTP_500',
 HTTP_BAD_GATEWAY = 'ERR_HTTP_502',
 HTTP_SERVICE_UNAVAILABLE = 'ERR_HTTP_503',
 HTTP_GATEWAY_TIMEOUT = 'ERR_HTTP_504',

 // 业务错误 (3xxx)
 BUSINESS_ERROR = 'ERR_BUSINESS',
 VALIDATION_ERROR = 'ERR_VALIDATION',
 DATA_NOT_FOUND = 'ERR_DATA_NOT_FOUND',
 DUPLICATE_DATA = 'ERR_DUPLICATE_DATA',
 INVALID_PARAMS = 'ERR_INVALID_PARAMS',

 // 认证/授权错误 (4xxx)
 AUTH_TOKEN_EXPIRED = 'ERR_TOKEN_EXPIRED',
 AUTH_TOKEN_INVALID = 'ERR_TOKEN_INVALID',
 AUTH_REFRESH_FAILED = 'ERR_AUTH_REFRESH_FAILED',
 AUTH_NO_PERMISSION = 'ERR_NO_PERMISSION',

 // 配置错误 (5xxx)
 CONFIG_INVALID = 'ERR_CONFIG_INVALID',
 METHOD_NOT_FOUND = 'ERR_METHOD_NOT_FOUND',
 PLUGIN_NOT_FOUND = 'ERR_PLUGIN_NOT_FOUND',

 // 缓存错误 (6xxx)
 CACHE_ERROR = 'ERR_CACHE',
 CACHE_WRITE_FAILED = 'ERR_CACHE_WRITE_FAILED',
 CACHE_READ_FAILED = 'ERR_CACHE_READ_FAILED',

 // 限流错误 (7xxx)
 RATE_LIMIT_EXCEEDED = 'ERR_RATE_LIMIT_EXCEEDED',
 QUEUE_OVERFLOW = 'ERR_QUEUE_OVERFLOW',
 CIRCUIT_BREAKER_OPEN = 'ERR_CIRCUIT_BREAKER_OPEN',

 // 其他错误 (9xxx)
 UNKNOWN_ERROR = 'ERR_UNKNOWN',
 REQUEST_CANCELLED = 'ERR_REQUEST_CANCELLED',
 RESPONSE_PARSE_ERROR = 'ERR_RESPONSE_PARSE',
}

/**
 * 错误信息映射
 */
export const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
 // 网络错误
 [ApiErrorCode.NETWORK_ERROR]: '网络连接失败',
 [ApiErrorCode.NETWORK_TIMEOUT]: '网络请求超时',
 [ApiErrorCode.NETWORK_OFFLINE]: '网络连接已断开',
 [ApiErrorCode.NETWORK_CONNECTION_REFUSED]: '服务器拒绝连接',

 // HTTP状态码错误
 [ApiErrorCode.HTTP_BAD_REQUEST]: '请求参数错误',
 [ApiErrorCode.HTTP_UNAUTHORIZED]: '未授权，请先登录',
 [ApiErrorCode.HTTP_FORBIDDEN]: '没有权限访问该资源',
 [ApiErrorCode.HTTP_NOT_FOUND]: '请求的资源不存在',
 [ApiErrorCode.HTTP_METHOD_NOT_ALLOWED]: '不支持的请求方法',
 [ApiErrorCode.HTTP_TIMEOUT]: '请求超时',
 [ApiErrorCode.HTTP_CONFLICT]: '资源冲突',
 [ApiErrorCode.HTTP_RATE_LIMIT]: '请求过于频繁，请稍后再试',
 [ApiErrorCode.HTTP_SERVER_ERROR]: '服务器内部错误',
 [ApiErrorCode.HTTP_BAD_GATEWAY]: '网关错误',
 [ApiErrorCode.HTTP_SERVICE_UNAVAILABLE]: '服务暂时不可用',
 [ApiErrorCode.HTTP_GATEWAY_TIMEOUT]: '网关超时',

 // 业务错误
 [ApiErrorCode.BUSINESS_ERROR]: '业务处理失败',
 [ApiErrorCode.VALIDATION_ERROR]: '数据验证失败',
 [ApiErrorCode.DATA_NOT_FOUND]: '数据不存在',
 [ApiErrorCode.DUPLICATE_DATA]: '数据已存在',
 [ApiErrorCode.INVALID_PARAMS]: '参数格式错误',

 // 认证/授权错误
 [ApiErrorCode.AUTH_TOKEN_EXPIRED]: '登录已过期，请重新登录',
 [ApiErrorCode.AUTH_TOKEN_INVALID]: '登录凭证无效',
 [ApiErrorCode.AUTH_REFRESH_FAILED]: '刷新登录凭证失败',
 [ApiErrorCode.AUTH_NO_PERMISSION]: '没有操作权限',

 // 配置错误
 [ApiErrorCode.CONFIG_INVALID]: '配置无效',
 [ApiErrorCode.METHOD_NOT_FOUND]: 'API方法未找到',
 [ApiErrorCode.PLUGIN_NOT_FOUND]: '插件未找到',

 // 缓存错误
 [ApiErrorCode.CACHE_ERROR]: '缓存操作失败',
 [ApiErrorCode.CACHE_WRITE_FAILED]: '写入缓存失败',
 [ApiErrorCode.CACHE_READ_FAILED]: '读取缓存失败',

 // 限流错误
 [ApiErrorCode.RATE_LIMIT_EXCEEDED]: '请求频率超限',
 [ApiErrorCode.QUEUE_OVERFLOW]: '请求队列已满',
 [ApiErrorCode.CIRCUIT_BREAKER_OPEN]: '服务熔断中，请稍后再试',

 // 其他错误
 [ApiErrorCode.UNKNOWN_ERROR]: '未知错误',
 [ApiErrorCode.REQUEST_CANCELLED]: '请求已取消',
 [ApiErrorCode.RESPONSE_PARSE_ERROR]: '响应数据解析失败',
}

/**
 * 错误处理建议
 */
export const ERROR_SUGGESTIONS: Record<ApiErrorCode, string[]> = {
 // 网络错误
 [ApiErrorCode.NETWORK_ERROR]: [
  '请检查网络连接是否正常',
  '尝试刷新页面重试',
  '如果问题持续，请联系技术支持',
 ],
 [ApiErrorCode.NETWORK_TIMEOUT]: [
  '网络较慢，建议稍后重试',
  '检查网络连接质量',
  '考虑增加请求超时时间',
 ],
 [ApiErrorCode.NETWORK_OFFLINE]: [
  '请检查网络连接',
  '连接Wi-Fi或移动网络后重试',
 ],
 [ApiErrorCode.NETWORK_CONNECTION_REFUSED]: [
  '服务器可能正在维护',
  '请稍后重试',
  '联系管理员确认服务器状态',
 ],

 // HTTP状态码错误
 [ApiErrorCode.HTTP_BAD_REQUEST]: [
  '检查请求参数是否正确',
  '查看API文档了解正确的参数格式',
 ],
 [ApiErrorCode.HTTP_UNAUTHORIZED]: [
  '请先登录系统',
  '如已登录，请刷新页面重试',
  '清除浏览器缓存后重新登录',
 ],
 [ApiErrorCode.HTTP_FORBIDDEN]: [
  '当前账号没有访问权限',
  '联系管理员申请权限',
 ],
 [ApiErrorCode.HTTP_NOT_FOUND]: [
  '请求的资源不存在或已被删除',
  '检查URL是否正确',
  '联系技术支持确认资源状态',
 ],
 [ApiErrorCode.HTTP_METHOD_NOT_ALLOWED]: [
  '使用了不支持的请求方法',
  '检查API文档了解正确的请求方法',
 ],
 [ApiErrorCode.HTTP_TIMEOUT]: [
  '请求处理时间过长',
  '稍后重试',
  '考虑优化请求参数',
 ],
 [ApiErrorCode.HTTP_CONFLICT]: [
  '资源状态冲突',
  '刷新数据后重试',
 ],
 [ApiErrorCode.HTTP_RATE_LIMIT]: [
  '请求过于频繁',
  '等待一段时间后重试',
  '优化请求频率',
 ],
 [ApiErrorCode.HTTP_SERVER_ERROR]: [
  '服务器处理出错',
  '稍后重试',
  '如果问题持续，请联系技术支持',
 ],
 [ApiErrorCode.HTTP_BAD_GATEWAY]: [
  '网关服务异常',
  '稍后重试',
 ],
 [ApiErrorCode.HTTP_SERVICE_UNAVAILABLE]: [
  '服务暂时不可用',
  '可能正在维护，请稍后重试',
 ],
 [ApiErrorCode.HTTP_GATEWAY_TIMEOUT]: [
  '网关超时',
  '稍后重试',
 ],

 // 业务错误
 [ApiErrorCode.BUSINESS_ERROR]: [
  '业务处理失败',
  '检查输入数据是否符合业务规则',
 ],
 [ApiErrorCode.VALIDATION_ERROR]: [
  '数据验证不通过',
  '检查输入格式是否正确',
 ],
 [ApiErrorCode.DATA_NOT_FOUND]: [
  '数据不存在或已被删除',
  '刷新页面查看最新数据',
 ],
 [ApiErrorCode.DUPLICATE_DATA]: [
  '数据已存在',
  '检查是否重复提交',
 ],
 [ApiErrorCode.INVALID_PARAMS]: [
  '参数格式错误',
  '检查输入值的类型和格式',
 ],

 // 认证/授权错误
 [ApiErrorCode.AUTH_TOKEN_EXPIRED]: [
  '登录已过期',
  '请重新登录',
 ],
 [ApiErrorCode.AUTH_TOKEN_INVALID]: [
  '登录凭证无效',
  '请重新登录',
  '清除浏览器缓存后重试',
 ],
 [ApiErrorCode.AUTH_REFRESH_FAILED]: [
  '刷新登录状态失败',
  '请重新登录',
 ],
 [ApiErrorCode.AUTH_NO_PERMISSION]: [
  '当前账号没有操作权限',
  '联系管理员申请权限',
 ],

 // 配置错误
 [ApiErrorCode.CONFIG_INVALID]: [
  '配置参数无效',
  '检查配置文件',
 ],
 [ApiErrorCode.METHOD_NOT_FOUND]: [
  'API方法未注册',
  '检查方法名是否正确',
  '确认插件是否已加载',
 ],
 [ApiErrorCode.PLUGIN_NOT_FOUND]: [
  '插件未找到',
  '确认插件是否已安装',
 ],

 // 缓存错误
 [ApiErrorCode.CACHE_ERROR]: [
  '缓存操作失败',
  '清除缓存后重试',
 ],
 [ApiErrorCode.CACHE_WRITE_FAILED]: [
  '写入缓存失败',
  '检查存储空间是否充足',
 ],
 [ApiErrorCode.CACHE_READ_FAILED]: [
  '读取缓存失败',
  '清除缓存后重试',
 ],

 // 限流错误
 [ApiErrorCode.RATE_LIMIT_EXCEEDED]: [
  '请求频率过高',
  '等待片刻后重试',
 ],
 [ApiErrorCode.QUEUE_OVERFLOW]: [
  '请求队列已满',
  '稍后重试',
 ],
 [ApiErrorCode.CIRCUIT_BREAKER_OPEN]: [
  '服务熔断保护中',
  '请等待服务恢复',
 ],

 // 其他错误
 [ApiErrorCode.UNKNOWN_ERROR]: [
  '发生未知错误',
  '请联系技术支持',
 ],
 [ApiErrorCode.REQUEST_CANCELLED]: [
  '请求已取消',
 ],
 [ApiErrorCode.RESPONSE_PARSE_ERROR]: [
  '响应数据格式错误',
  '联系技术支持',
 ],
}

/**
 * 根据HTTP状态码获取错误码
 */
export function getErrorCodeByHttpStatus(status: number): ApiErrorCode {
 const statusCodeMap: Record<number, ApiErrorCode> = {
  400: ApiErrorCode.HTTP_BAD_REQUEST,
  401: ApiErrorCode.HTTP_UNAUTHORIZED,
  403: ApiErrorCode.HTTP_FORBIDDEN,
  404: ApiErrorCode.HTTP_NOT_FOUND,
  405: ApiErrorCode.HTTP_METHOD_NOT_ALLOWED,
  408: ApiErrorCode.HTTP_TIMEOUT,
  409: ApiErrorCode.HTTP_CONFLICT,
  429: ApiErrorCode.HTTP_RATE_LIMIT,
  500: ApiErrorCode.HTTP_SERVER_ERROR,
  502: ApiErrorCode.HTTP_BAD_GATEWAY,
  503: ApiErrorCode.HTTP_SERVICE_UNAVAILABLE,
  504: ApiErrorCode.HTTP_GATEWAY_TIMEOUT,
 }

 return statusCodeMap[status] || ApiErrorCode.HTTP_SERVER_ERROR
}

/**
 * 判断错误是否可重试
 */
export function isRetryableError(code: ApiErrorCode): boolean {
 const retryableErrors = [
  ApiErrorCode.NETWORK_ERROR,
  ApiErrorCode.NETWORK_TIMEOUT,
  ApiErrorCode.HTTP_TIMEOUT,
  ApiErrorCode.HTTP_RATE_LIMIT,
  ApiErrorCode.HTTP_SERVER_ERROR,
  ApiErrorCode.HTTP_BAD_GATEWAY,
  ApiErrorCode.HTTP_SERVICE_UNAVAILABLE,
  ApiErrorCode.HTTP_GATEWAY_TIMEOUT,
 ]

 return retryableErrors.includes(code)
}

/**
 * 判断错误是否需要重新登录
 */
export function isAuthError(code: ApiErrorCode): boolean {
 const authErrors = [
  ApiErrorCode.HTTP_UNAUTHORIZED,
  ApiErrorCode.AUTH_TOKEN_EXPIRED,
  ApiErrorCode.AUTH_TOKEN_INVALID,
  ApiErrorCode.AUTH_REFRESH_FAILED,
 ]

 return authErrors.includes(code)
}

/**
 * 获取错误的严重程度
 */
export function getErrorSeverity(code: ApiErrorCode): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
 // 关键错误
 const criticalErrors = [
  ApiErrorCode.HTTP_SERVER_ERROR,
  ApiErrorCode.AUTH_REFRESH_FAILED,
 ]
 if (criticalErrors.includes(code)) {
  return 'CRITICAL'
 }

 // 高严重性错误
 const highErrors = [
  ApiErrorCode.NETWORK_ERROR,
  ApiErrorCode.HTTP_UNAUTHORIZED,
  ApiErrorCode.HTTP_FORBIDDEN,
  ApiErrorCode.AUTH_TOKEN_EXPIRED,
  ApiErrorCode.AUTH_TOKEN_INVALID,
 ]
 if (highErrors.includes(code)) {
  return 'HIGH'
 }

 // 中等严重性错误
 const mediumErrors = [
  ApiErrorCode.HTTP_BAD_REQUEST,
  ApiErrorCode.HTTP_NOT_FOUND,
  ApiErrorCode.HTTP_RATE_LIMIT,
  ApiErrorCode.BUSINESS_ERROR,
  ApiErrorCode.VALIDATION_ERROR,
 ]
 if (mediumErrors.includes(code)) {
  return 'MEDIUM'
 }

 // 低严重性错误
 return 'LOW'
}
