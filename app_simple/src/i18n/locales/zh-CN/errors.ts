/**
 * 错误相关语言项
 */

export default {
  // HTTP 错误
  http: {
    400: '请求错误',
    401: '未授权',
    403: '禁止访问',
    404: '页面不存在',
    405: '方法不允许',
    408: '请求超时',
    429: '请求过于频繁',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  },
  
  // 页面错误
  page: {
    notFound: {
      title: '页面未找到',
      subtitle: '抱歉，您访问的页面不存在',
      button: '返回首页'
    },
    forbidden: {
      title: '无权访问',
      subtitle: '您没有权限访问此页面',
      button: '返回'
    },
    serverError: {
      title: '服务器错误',
      subtitle: '抱歉，服务器出现了问题',
      button: '刷新页面'
    },
    maintenance: {
      title: '系统维护中',
      subtitle: '系统正在维护，请稍后访问',
      button: '了解更多'
    }
  },
  
  // 网络错误
  network: {
    offline: '网络连接已断开',
    online: '网络已恢复',
    slow: '网络连接缓慢',
    timeout: '请求超时，请检查网络连接',
    error: '网络错误，请稍后重试'
  },
  
  // 通用错误消息
  generic: {
    title: '出错了',
    subtitle: '抱歉，发生了一些错误',
    retry: '重试',
    report: '报告问题',
    back: '返回',
    home: '返回首页'
  }
}