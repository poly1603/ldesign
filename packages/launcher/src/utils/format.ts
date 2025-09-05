/**
 * 格式化工具函数
 * 
 * 提供各种数据格式化功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

/**
 * 格式化文件大小
 * 
 * @param bytes - 字节数
 * @param decimals - 小数位数
 * @returns 格式化后的大小
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 格式化时间持续
 * 
 * @param ms - 毫秒数
 * @returns 格式化后的时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * 格式化相对时间
 * 
 * @param timestamp - 时间戳
 * @returns 相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 1000) {
    return '刚刚'
  }

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return `${seconds}秒前`
  }
}

/**
 * 格式化百分比
 * 
 * @param value - 数值（0-1）
 * @param decimals - 小数位数
 * @returns 百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return (value * 100).toFixed(decimals) + '%'
}

/**
 * 格式化数字
 * 
 * @param num - 数字
 * @param options - 格式化选项
 * @returns 格式化后的数字
 */
export function formatNumber(num: number, options: {
  decimals?: number
  separator?: string
  prefix?: string
  suffix?: string
} = {}): string {
  const {
    decimals = 0,
    separator = ',',
    prefix = '',
    suffix = ''
  } = options

  const formatted = num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, separator)
  return prefix + formatted + suffix
}

/**
 * 格式化 URL
 * 
 * @param url - URL 字符串
 * @param options - 格式化选项
 * @returns 格式化后的 URL
 */
export function formatUrl(url: string, options: {
  removeProtocol?: boolean
  removeWww?: boolean
  removeTrailingSlash?: boolean
} = {}): string {
  let formatted = url

  if (options.removeProtocol) {
    formatted = formatted.replace(/^https?:\/\//, '')
  }

  if (options.removeWww) {
    formatted = formatted.replace(/^www\./, '')
  }

  if (options.removeTrailingSlash) {
    formatted = formatted.replace(/\/$/, '')
  }

  return formatted
}

/**
 * 格式化路径
 * 
 * @param path - 文件路径
 * @param maxLength - 最大长度
 * @returns 格式化后的路径
 */
export function formatPath(path: string, maxLength: number = 50): string {
  if (path.length <= maxLength) {
    return path
  }

  const parts = path.split(/[/\\]/)

  if (parts.length <= 2) {
    return '...' + path.slice(-(maxLength - 3))
  }

  let result = parts[0]
  let remaining = parts.slice(1)

  while (remaining.length > 0) {
    const next = remaining.shift()!
    const candidate = result + '/' + next

    if (candidate.length > maxLength - 3) {
      return result + '/.../' + remaining[remaining.length - 1]
    }

    result = candidate
  }

  return result
}

/**
 * 格式化 JSON
 * 
 * @param obj - 对象
 * @param options - 格式化选项
 * @returns 格式化后的 JSON 字符串
 */
export function formatJson(obj: any, options: {
  indent?: number
  sortKeys?: boolean
  removeQuotes?: boolean
} = {}): string {
  const {
    indent = 2,
    sortKeys = false,
    removeQuotes = false
  } = options

  let json = JSON.stringify(obj, sortKeys ? Object.keys(obj).sort() : null, indent)

  if (removeQuotes) {
    // 移除属性名的引号（仅适用于有效的标识符）
    json = json.replace(/"([a-zA-Z_$][a-zA-Z0-9_$]*)":/g, '$1:')
  }

  return json
}

/**
 * 格式化表格
 * 
 * @param data - 表格数据
 * @param options - 格式化选项
 * @returns 格式化后的表格字符串
 */
export function formatTable(data: Array<Record<string, any>>, options: {
  headers?: string[]
  align?: 'left' | 'center' | 'right'
  border?: boolean
} = {}): string {
  if (data.length === 0) {
    return ''
  }

  const {
    headers = Object.keys(data[0]),
    align = 'left',
    border = true
  } = options

  // 计算列宽
  const columnWidths = headers.map(header => {
    const headerWidth = header.length
    const dataWidth = Math.max(...data.map(row => String(row[header] || '').length))
    return Math.max(headerWidth, dataWidth)
  })

  // 格式化行
  const formatRow = (row: string[], widths: number[]) => {
    const cells = row.map((cell, i) => {
      const width = widths[i]
      switch (align) {
        case 'center':
          return cell.padStart((width + cell.length) / 2).padEnd(width)
        case 'right':
          return cell.padStart(width)
        default:
          return cell.padEnd(width)
      }
    })

    return border ? `| ${cells.join(' | ')} |` : cells.join('  ')
  }

  // 生成表格
  const lines: string[] = []

  // 表头
  lines.push(formatRow(headers, columnWidths))

  // 分隔线
  if (border) {
    const separator = columnWidths.map(width => '-'.repeat(width)).join('-+-')
    lines.push(`|-${separator}-|`)
  }

  // 数据行
  data.forEach(row => {
    const cells = headers.map(header => String(row[header] || ''))
    lines.push(formatRow(cells, columnWidths))
  })

  return lines.join('\n')
}

/**
 * 格式化代码
 * 
 * @param code - 代码字符串
 * @param language - 语言类型
 * @returns 格式化后的代码
 */
export function formatCode(code: string, _language: string = 'javascript'): string {
  // 简单的代码格式化（实际项目中可以使用 prettier 等工具）
  let formatted = code

  // 移除多余的空行
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n')

  // 统一缩进
  const lines = formatted.split('\n')
  let indent = 0
  const indentSize = 2

  const formattedLines = lines.map(line => {
    const trimmed = line.trim()

    if (trimmed === '') {
      return ''
    }

    // 减少缩进
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
      indent = Math.max(0, indent - indentSize)
    }

    const result = ' '.repeat(indent) + trimmed

    // 增加缩进
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
      indent += indentSize
    }

    return result
  })

  return formattedLines.join('\n')
}

/**
 * 格式化错误信息
 * 
 * @param error - 错误对象
 * @param options - 格式化选项
 * @returns 格式化后的错误信息
 */
export function formatError(error: Error, options: {
  includeStack?: boolean
  maxStackLines?: number
  includeTimestamp?: boolean
} = {}): string {
  const {
    includeStack = false,
    maxStackLines = 10,
    includeTimestamp = false
  } = options

  let formatted = error.message

  if (includeTimestamp) {
    const timestamp = new Date().toISOString()
    formatted = `[${timestamp}] ${formatted}`
  }

  if (includeStack && error.stack) {
    const stackLines = error.stack.split('\n').slice(1, maxStackLines + 1)
    formatted += '\n' + stackLines.join('\n')
  }

  return formatted
}

/**
 * 格式化命令行参数
 * 
 * @param args - 参数对象
 * @returns 格式化后的参数字符串
 */
export function formatCliArgs(args: Record<string, any>): string {
  const parts: string[] = []

  for (const [key, value] of Object.entries(args)) {
    if (value === true) {
      parts.push(`--${key}`)
    } else if (value !== false && value !== undefined && value !== null) {
      parts.push(`--${key} ${value}`)
    }
  }

  return parts.join(' ')
}
