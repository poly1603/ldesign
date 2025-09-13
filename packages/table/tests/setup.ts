/**
 * 测试环境设置文件
 * 
 * 配置测试环境和全局设置
 * 提供测试工具和模拟对象
 */

import { vi } from 'vitest'

// ==================== DOM环境设置 ====================

// 设置全局DOM环境
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// 模拟requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation(cb => {
  return setTimeout(cb, 16)
})

global.cancelAnimationFrame = vi.fn().mockImplementation(id => {
  clearTimeout(id)
})

// 模拟getComputedStyle
global.getComputedStyle = vi.fn().mockImplementation(() => ({
  getPropertyValue: vi.fn().mockReturnValue(''),
  setProperty: vi.fn(),
  removeProperty: vi.fn(),
}))

// ==================== 控制台设置 ====================

// 在测试环境中静默某些控制台输出
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = vi.fn().mockImplementation((...args) => {
  // 过滤掉一些预期的警告
  const message = args[0]
  if (typeof message === 'string') {
    // 忽略某些预期的警告
    if (message.includes('deprecated') || message.includes('warning')) {
      return
    }
  }
  originalConsoleWarn.apply(console, args)
})

console.error = vi.fn().mockImplementation((...args) => {
  // 过滤掉一些预期的错误
  const message = args[0]
  if (typeof message === 'string') {
    // 忽略某些预期的错误
    if (message.includes('test error') || message.includes('mock error')) {
      return
    }
  }
  originalConsoleError.apply(console, args)
})

// ==================== 测试工具函数 ====================

/**
 * 创建测试用的DOM容器
 */
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div')
  container.id = 'test-container'
  container.style.width = '800px'
  container.style.height = '600px'
  document.body.appendChild(container)
  return container
}

/**
 * 清理测试用的DOM容器
 */
export function cleanupTestContainer(container?: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
  
  // 清理所有测试容器
  const testContainers = document.querySelectorAll('#test-container')
  testContainers.forEach(el => {
    if (el.parentNode) {
      el.parentNode.removeChild(el)
    }
  })
}

/**
 * 等待下一个事件循环
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 0)
  })
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

/**
 * 模拟鼠标事件
 */
export function mockMouseEvent(
  type: string,
  options: Partial<MouseEventInit> = {}
): MouseEvent {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    ...options
  })
}

/**
 * 模拟键盘事件
 */
export function mockKeyboardEvent(
  type: string,
  options: Partial<KeyboardEventInit> = {}
): KeyboardEvent {
  return new KeyboardEvent(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    ...options
  })
}

/**
 * 模拟滚动事件
 */
export function mockScrollEvent(
  target: Element,
  scrollTop: number = 0,
  scrollLeft: number = 0
): void {
  Object.defineProperty(target, 'scrollTop', {
    value: scrollTop,
    writable: true
  })
  
  Object.defineProperty(target, 'scrollLeft', {
    value: scrollLeft,
    writable: true
  })
  
  target.dispatchEvent(new Event('scroll', { bubbles: true }))
}

/**
 * 创建测试数据
 */
export function createTestData(count: number = 10): any[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Name ${index + 1}`,
    age: 20 + (index % 50),
    email: `user${index + 1}@example.com`,
    status: index % 2 === 0 ? 'active' : 'inactive',
    createTime: new Date(2023, 0, index + 1).toISOString(),
    score: Math.floor(Math.random() * 100)
  }))
}

/**
 * 创建测试列配置
 */
export function createTestColumns(): any[] {
  return [
    {
      key: 'id',
      title: 'ID',
      width: 80,
      sortable: true
    },
    {
      key: 'name',
      title: '姓名',
      width: 120,
      sortable: true
    },
    {
      key: 'age',
      title: '年龄',
      width: 80,
      sortable: true,
      align: 'center'
    },
    {
      key: 'email',
      title: '邮箱',
      width: 200,
      sortable: true
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      filterable: true,
      render: (value: string) => {
        return `<span class="status-${value}">${value}</span>`
      }
    },
    {
      key: 'createTime',
      title: '创建时间',
      width: 150,
      sortable: true,
      render: (value: string) => {
        return new Date(value).toLocaleDateString()
      }
    },
    {
      key: 'score',
      title: '评分',
      width: 80,
      sortable: true,
      align: 'right'
    }
  ]
}

/**
 * 断言元素是否可见
 */
export function expectElementVisible(element: Element): void {
  expect(element).toBeDefined()
  expect(element).toBeInstanceOf(Element)
  expect(element.parentNode).toBeTruthy()
}

/**
 * 断言元素是否包含指定类名
 */
export function expectElementHasClass(element: Element, className: string): void {
  expect(element.classList.contains(className)).toBe(true)
}

/**
 * 断言元素是否不包含指定类名
 */
export function expectElementNotHasClass(element: Element, className: string): void {
  expect(element.classList.contains(className)).toBe(false)
}

// ==================== 全局测试钩子 ====================

// 每个测试前的清理
beforeEach(() => {
  // 清理DOM
  document.body.innerHTML = ''
  
  // 重置所有模拟
  vi.clearAllMocks()
})

// 每个测试后的清理
afterEach(() => {
  // 清理测试容器
  cleanupTestContainer()
  
  // 清理定时器
  vi.clearAllTimers()
})

// 所有测试完成后的清理
afterAll(() => {
  // 恢复原始的控制台方法
  console.warn = originalConsoleWarn
  console.error = originalConsoleError
})
