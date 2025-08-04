/**
 * ID生成器工具
 */

/**
 * 生成唯一ID
 * @param prefix 前缀
 * @returns 唯一ID
 */
export function generateId(prefix = 'id'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}-${timestamp}-${random}`
}

/**
 * 生成UUID v4
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 生成短ID
 * @param length 长度
 * @returns 短ID
 */
export function generateShortId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成数字ID
 * @param length 长度
 * @returns 数字ID
 */
export function generateNumericId(length = 10): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString()
  }
  return result
}

/**
 * 生成带时间戳的ID
 * @param prefix 前缀
 * @returns 带时间戳的ID
 */
export function generateTimestampId(prefix = ''): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 6)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}