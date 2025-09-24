/**
 * 文本处理工具函数
 * 统一处理各种文本格式，解决文本处理不一致的问题
 */

/**
 * 标准化文本值
 * 处理LogicFlow中可能出现的不同文本格式
 */
export function normalizeTextValue(text: any): string {
  // 处理字符串类型
  if (typeof text === 'string') {
    return text
  }
  
  // 处理对象类型的文本（LogicFlow格式）
  if (text && typeof text === 'object') {
    if (typeof text.value === 'string') {
      return text.value
    }
    if (typeof text.text === 'string') {
      return text.text
    }
  }
  
  // 处理数字类型
  if (typeof text === 'number') {
    return text.toString()
  }
  
  // 处理boolean类型
  if (typeof text === 'boolean') {
    return text.toString()
  }
  
  // 兜底返回空字符串
  return ''
}

/**
 * 创建标准文本对象
 * 用于LogicFlow的文本配置
 */
export function createTextObject(text: string, x?: number, y?: number): {
  value: string
  x?: number
  y?: number
  draggable: boolean
  editable: boolean
} {
  return {
    value: normalizeTextValue(text),
    ...(x !== undefined && { x }),
    ...(y !== undefined && { y }),
    draggable: false,
    editable: true
  }
}

/**
 * 安全获取文本内容
 * 防止访问undefined属性导致的错误
 */
export function safeGetText(obj: any, fallback = ''): string {
  try {
    return normalizeTextValue(obj) || fallback
  } catch (error) {
    console.warn('获取文本内容时出错:', error)
    return fallback
  }
}

/**
 * 文本长度验证
 */
export function validateTextLength(text: string, maxLength = 100): {
  valid: boolean
  message?: string
  trimmed?: string
} {
  if (text.length <= maxLength) {
    return { valid: true }
  }
  
  return {
    valid: false,
    message: `文本长度超出限制，最大允许${maxLength}个字符`,
    trimmed: text.substring(0, maxLength)
  }
}

/**
 * 清理文本内容
 * 移除多余空白字符和特殊字符
 */
export function cleanText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')  // 多个空白字符替换为单个空格
    .replace(/[\r\n\t]/g, ' ')  // 换行符和制表符替换为空格
}

/**
 * 转义特殊字符
 * 防止XSS攻击和格式问题
 */
export function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * 反转义特殊字符
 */
export function unescapeText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
}

/**
 * 文本截断
 * 智能截断文本并添加省略号
 */
export function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.substring(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * 多行文本处理
 * 将长文本按指定宽度分行
 */
export function wrapText(text: string, maxLineLength: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  for (const word of words) {
    if ((currentLine + word).length <= maxLineLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines
}
