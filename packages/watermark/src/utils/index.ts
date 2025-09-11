/**
 * 工具函数
 */
export function isValidInput(input: unknown): boolean {
  if (input == null) {
    return false
  }
  
  if (typeof input === 'string') {
    return input.trim().length > 0
  }
  
  if (Array.isArray(input)) {
    return input.length > 0 && input.some(item => isValidInput(item))
  }
  
  if (typeof input === 'object' && input !== null) {
    // 对于对象类型，检查是否有text或image属性
    const objInput = input as any
    return !!(objInput.text && isValidInput(objInput.text)) || !!(objInput.image && objInput.image.src)
  }
  
  return true
}

// 导出ID生成器
export * from './id-generator'
