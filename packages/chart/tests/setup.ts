/**
 * Vitest 测试环境设置
 *
 * 配置测试环境，包括 DOM 模拟、全局变量等
 */

import { beforeEach, afterEach, vi } from 'vitest'

// ============================================================================
// ECharts 模拟
// ============================================================================

/**
 * 模拟 ECharts 实例
 */
export const mockEChartsInstance = {
  setOption: vi.fn(),
  resize: vi.fn(),
  dispose: vi.fn(),
  clear: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  getWidth: vi.fn().mockReturnValue(400),
  getHeight: vi.fn().mockReturnValue(300),
  getDom: vi.fn(),
  getOption: vi.fn().mockReturnValue({}),
}

// Mock ECharts for testing
vi.mock('echarts', () => ({
  init: vi.fn(() => mockEChartsInstance),
  dispose: vi.fn(),
  getInstanceByDom: vi.fn(),
  registerTheme: vi.fn(),
  graphic: {
    LinearGradient: vi.fn(),
  },
}))

// ============================================================================
// DOM 环境模拟
// ============================================================================

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation((callback) => {
  const instance = {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    callback,
  }
  return instance
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn().mockReturnValue(''),
  })),
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// ============================================================================
// 测试工具函数
// ============================================================================

/**
 * 创建测试容器元素
 * @param id - 容器 ID
 * @returns 容器元素
 */
export function createTestContainer(id = 'test-chart-container'): HTMLElement {
  const container = document.createElement('div')
  container.id = id
  container.style.width = '400px'
  container.style.height = '300px'
  document.body.appendChild(container)
  return container
}

/**
 * 清理测试容器
 * @param container - 容器元素
 */
export function cleanupTestContainer(container: HTMLElement): void {
  if (container.parentNode) {
    container.parentNode.removeChild(container)
  }
}

/**
 * 创建测试数据
 * @param type - 数据类型
 * @returns 测试数据
 */
export function createTestData(type: 'simple' | 'complex' = 'simple') {
  if (type === 'simple') {
    return [
      { name: '1月', value: 100 },
      { name: '2月', value: 200 },
      { name: '3月', value: 150 },
      { name: '4月', value: 300 },
      { name: '5月', value: 250 },
    ]
  }

  return {
    categories: ['1月', '2月', '3月', '4月', '5月'],
    series: [
      { name: '销售额', data: [100, 200, 150, 300, 250] },
      { name: '利润', data: [30, 60, 45, 90, 75] },
    ],
  }
}

/**
 * 创建测试配置
 * @param overrides - 覆盖配置
 * @returns 测试配置
 */
export function createTestConfig(overrides = {}) {
  return {
    type: 'line',
    data: createTestData(),
    title: '测试图表',
    theme: 'light',
    responsive: true,
    animation: true,
    ...overrides,
  }
}

/**
 * 等待异步操作完成
 * @param ms - 等待时间（毫秒）
 * @returns Promise
 */
export function waitFor(ms = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 等待下一个事件循环
 * @returns Promise
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 重置所有模拟
 */
export function resetAllMocks(): void {
  vi.clearAllMocks()
  mockEChartsInstance.setOption.mockClear()
  mockEChartsInstance.resize.mockClear()
  mockEChartsInstance.dispose.mockClear()
  mockEChartsInstance.clear.mockClear()
  mockEChartsInstance.showLoading.mockClear()
  mockEChartsInstance.hideLoading.mockClear()
  mockEChartsInstance.on.mockClear()
  mockEChartsInstance.off.mockClear()
}

// ============================================================================
// 全局测试钩子
// ============================================================================

beforeEach(() => {
  // Reset DOM before each test
  document.head.innerHTML = ''
  document.body.innerHTML = ''

  // Clear localStorage
  localStorage.clear()

  // Clear sessionStorage
  sessionStorage.clear()

  // Reset all mocks
  resetAllMocks()

  // Create a test container div
  createTestContainer()
})

afterEach(() => {
  // Clean up any remaining timers
  vi.clearAllTimers()

  // Reset DOM
  document.body.innerHTML = ''

  // Reset mocks
  vi.restoreAllMocks()
})
