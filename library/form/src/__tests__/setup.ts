/**
 * @ldesign/form - Test Setup
 * 测试设置
 */

import { expect, afterEach } from 'vitest'

// 全局清理
afterEach(() => {
  // 清理 DOM
  document.body.innerHTML = ''
  
  // 重置主题
  document.documentElement.removeAttribute('data-theme')
})

// 扩展expect
expect.extend({
  toBeValidationResult(received: any, expected: { valid: boolean; message?: string }) {
    const pass = received.valid === expected.valid &&
      (!expected.message || received.message === expected.message)

    return {
      pass,
      message: () =>
        pass
          ? `expected validation result not to be ${JSON.stringify(expected)}`
          : `expected validation result to be ${JSON.stringify(expected)}, got ${JSON.stringify(received)}`
    }
  }
})



