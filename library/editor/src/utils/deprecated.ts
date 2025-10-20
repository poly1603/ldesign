/**
 * 废弃的API和过渡导出
 * 
 * 为了向后兼容，保留一些旧的导出
 * 这些API应该逐步迁移到新的实现
 */

import { logger } from './logger'

/**
 * 创建废弃警告
 */
function deprecationWarning(oldAPI: string, newAPI: string): void {
  logger.warn(`[Deprecated] ${oldAPI} is deprecated. Use ${newAPI} instead.`)
}

/**
 * 废弃的DOM工具（从DOMUtils.ts迁移）
 * 建议使用 dom.ts 的 API
 */
export function $(selector: string, parent?: Element | Document) {
  deprecationWarning('$()', 'document.querySelector()')
  const root = parent || document
  return root.querySelector(selector)
}

export function $$(selector: string, parent?: Element | Document) {
  deprecationWarning('$$()', 'document.querySelectorAll()')
  const root = parent || document
  return Array.from(root.querySelectorAll(selector))
}

// 注意：此文件中的函数将在未来版本中移除
// 请尽快迁移到新API









