/**
 * 简化的工具函数集合
 */

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

/**
 * 生成唯一ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}`
}
