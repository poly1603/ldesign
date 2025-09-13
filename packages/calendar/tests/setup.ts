/**
 * 测试环境设置文件
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// 全局测试设置
beforeAll(() => {
  // 设置测试环境
  console.log('🧪 开始运行日历组件库测试')

  // 模拟浏览器环境
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => { },
      removeListener: () => { },
      addEventListener: () => { },
      removeEventListener: () => { },
      dispatchEvent: () => { },
    }),
  })

  // 模拟 ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
  }

  // 模拟 IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    root = null
    rootMargin = ''
    thresholds = []

    constructor() { }
    observe() { }
    unobserve() { }
    disconnect() { }
    takeRecords() { return [] }
  }
})

afterAll(() => {
  console.log('✅ 日历组件库测试完成')
})

beforeEach(() => {
  // 每个测试前的清理工作
  document.body.innerHTML = ''
})

afterEach(() => {
  // 每个测试后的清理工作
  document.body.innerHTML = ''
})
