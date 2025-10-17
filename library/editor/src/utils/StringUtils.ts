/**
 * 字符串工具函数
 * 统一管理字符串处理相关功能
 */

/**
 * HTML转义
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * HTML反转义
 */
export function unescapeHTML(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || ''
}

/**
 * 驼峰命名转换
 */
export function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * 短横线命名转换
 */
export function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase()
}

/**
 * 首字母大写
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 截断字符串
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str
  return str.substring(0, length - suffix.length) + suffix
}

/**
 * 生成随机字符串
 */
export function randomString(length: number = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  let size = bytes
  
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  
  return `${size.toFixed(2)} ${units[index]}`
}

/**
 * 格式化时间
 */
export function formatTime(date: Date | number | string): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hour = String(d.getHours()).padStart(2, '0')
  const minute = String(d.getMinutes()).padStart(2, '0')
  const second = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

/**
 * 生成UUID
 */
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 判断是否为URL
 */
export function isURL(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}

/**
 * 判断是否为Email
 */
export function isEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(str)
}

/**
 * 清理空白字符
 */
export function cleanWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim()
}

/**
 * 计算字符串中文字符数
 */
export function countChineseChars(str: string): number {
  const matches = str.match(/[\u4e00-\u9fa5]/g)
  return matches ? matches.length : 0
}

/**
 * 计算字数（中文算一个，英文单词算一个）
 */
export function countWords(str: string): number {
  // 统计中文字符
  const chineseCount = countChineseChars(str)
  // 移除中文字符后统计英文单词
  const withoutChinese = str.replace(/[\u4e00-\u9fa5]/g, ' ')
  const englishWords = withoutChinese.match(/\b\w+\b/g)
  const englishCount = englishWords ? englishWords.length : 0
  
  return chineseCount + englishCount
}