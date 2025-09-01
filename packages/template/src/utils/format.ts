/**
 * 格式化工具函数
 */

/**
 * 格式化工具类
 */
export const formatUtils = {
  /**
   * 格式化文件大小
   */
  formatFileSize(bytes: number, decimals: number = 1): string {
    if (bytes < 0)
      return '0 B'
    if (bytes === 0)
      return '0 B'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const size = Number.parseFloat((bytes / k ** i).toFixed(dm))

    // 如果是整数，不显示小数点
    const formattedSize = size % 1 === 0 ? size.toString() : size.toFixed(dm)

    return `${formattedSize} ${sizes[i]}`
  },

  /**
   * 格式化时间差（多久之前）
   */
  formatTimeAgo(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 10000)
      return '刚刚' // 10秒内

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (years > 0)
      return `${years}年前`
    if (months > 0)
      return `${months}个月前`
    if (weeks > 0)
      return `${weeks}周前`
    if (days > 0)
      return `${days}天前`
    if (hours > 0)
      return `${hours}小时前`
    if (minutes > 0)
      return `${minutes}分钟前`
    return `${seconds}秒前`
  },

  /**
   * 格式化模板名称
   */
  formatTemplateName(name: string): string {
    if (!name || !name.trim())
      return ''

    // 移除特殊字符，只保留字母、数字、连字符、下划线和点
    let cleaned = name.replace(/[^\w\-.]/g, ' ')

    // 处理驼峰命名
    cleaned = cleaned.replace(/([a-z])([A-Z])/g, '$1 $2')

    // 将连字符、下划线、点替换为空格
    cleaned = cleaned.replace(/[-_.]/g, ' ')

    // 移除多余的空格并分割单词
    const words = cleaned.split(/\s+/).filter(word => word.length > 0)

    // 首字母大写
    return words.map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    ).join(' ')
  },

  /**
   * 格式化错误信息
   */
  formatError(error: any, includeStack: boolean = false): string {
    if (!error)
      return 'Unknown error'

    if (typeof error === 'string') {
      return error
    }

    if (error instanceof Error) {
      let message = `${error.name}: ${error.message}`
      if (includeStack && error.stack) {
        message += `\nStack trace:\n${error.stack}`
      }
      return message
    }

    if (typeof error === 'object') {
      if (error.message) {
        let message = error.message
        if (error.code) {
          message += ` (Code: ${error.code})`
        }
        return message
      }

      try {
        return JSON.stringify(error)
      }
      catch {
        return 'Unknown error'
      }
    }

    return 'Unknown error'
  },

  /**
   * 格式化持续时间
   */
  formatDuration(milliseconds: number): string {
    if (milliseconds < 0)
      return '0ms'
    if (milliseconds < 1000)
      return `${milliseconds}ms`

    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      const remainingMinutes = minutes % 60
      if (remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`
      }
      return `${hours}h`
    }

    if (minutes > 0) {
      const remainingSeconds = seconds % 60
      if (remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`
      }
      return `${minutes}m`
    }

    if (seconds >= 1) {
      const remainingMs = milliseconds % 1000
      if (remainingMs > 0) {
        return `${seconds}.${Math.floor(remainingMs / 100)}s`
      }
      return `${seconds}s`
    }

    return `${milliseconds}ms`
  },

  /**
   * 格式化百分比
   */
  formatPercentage(value: number, decimals: number = 0): string {
    const percentage = value * 100
    return `${percentage.toFixed(decimals)}%`
  },

  /**
   * 格式化数字（添加千分位分隔符）
   */
  formatNumber(value: number, decimals?: number): string {
    const options: Intl.NumberFormatOptions = {
      useGrouping: true,
    }

    if (typeof decimals === 'number') {
      options.minimumFractionDigits = decimals
      options.maximumFractionDigits = decimals
    }

    return new Intl.NumberFormat('zh-CN', options).format(value)
  },

  /**
   * 格式化货币
   */
  formatCurrency(value: number, currency: string = 'CNY'): string {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(value)
  },

  /**
   * 格式化日期
   */
  formatDate(date: Date | number | string, format: string = 'YYYY-MM-DD'): string {
    const d = new Date(date)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
  },

  /**
   * 格式化时间
   */
  formatTime(date: Date | number | string, use12Hour: boolean = false): string {
    const d = new Date(date)

    let hours = d.getHours()
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    if (use12Hour) {
      const ampm = hours >= 12 ? 'PM' : 'AM'
      hours = hours % 12
      if (hours === 0)
        hours = 12
      return `${hours}:${minutes}:${seconds} ${ampm}`
    }

    return `${String(hours).padStart(2, '0')}:${minutes}:${seconds}`
  },
}
