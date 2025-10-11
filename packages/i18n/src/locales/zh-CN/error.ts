import type { ErrorTranslations } from '../types'

const error: ErrorTranslations = {
  error400: '错误的请求',
  error401: '未授权',
  error403: '禁止访问',
  error404: '页面不存在',
  error405: '方法不允许',
  error408: '请求超时',
  error409: '冲突',
  error410: '已删除',
  error422: '无法处理',
  error429: '请求过多',
  error500: '服务器内部错误',
  error502: '网关错误',
  error503: '服务不可用',
  error504: '网关超时',

  networkError: '网络错误',
  connectionLost: '连接丢失',
  connectionTimeout: '连接超时',
  serverError: '服务器错误',
  clientError: '客户端错误',

  unknownError: '未知错误',
  systemError: '系统错误',
  businessError: '业务错误',
  validationError: '验证错误',
  permissionDenied: '权限不足',
  resourceNotFound: '资源未找到',
  serviceUnavailable: '服务不可用',

  loadFailed: '加载失败',
  saveFailed: '保存失败',
  deleteFailed: '删除失败',
  updateFailed: '更新失败',
  createFailed: '创建失败',

  fileNotFound: '文件未找到',
  fileTooLarge: '文件过大',
  fileTypeNotAllowed: '文件类型不允许',
  fileUploadFailed: '文件上传失败',
  fileDownloadFailed: '文件下载失败',

  dataFormatError: '数据格式错误',
  dataParseError: '数据解析错误',
  dataValidationError: '数据验证错误',
  dataDuplicateError: '数据重复',

  retry: '重试',
  reportError: '报告错误',
  errorDetails: '错误详情',
  errorCode: '错误代码',
  errorMessage: '错误信息',
}

export default error
