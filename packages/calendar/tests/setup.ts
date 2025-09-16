/**
 * 测试环境设置
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// 模拟浏览器环境
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
})

// 模拟 ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 模拟 Notification API
Object.defineProperty(window, 'Notification', {
  writable: true,
  value: class Notification {
    static permission = 'granted'
    static requestPermission = () => Promise.resolve('granted')
    constructor(title: string, options?: NotificationOptions) {}
    close() {}
  },
})

// 模拟 performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
    now: () => Date.now(),
  },
})

// 模拟 localStorage
Object.defineProperty(window, 'localStorage', {
  writable: true,
  value: {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => {},
    removeItem: (key: string) => {},
    clear: () => {},
    length: 0,
    key: (index: number) => null,
  },
})

// 模拟 sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  writable: true,
  value: {
    getItem: (key: string) => null,
    setItem: (key: string, value: string) => {},
    removeItem: (key: string) => {},
    clear: () => {},
    length: 0,
    key: (index: number) => null,
  },
})

// 模拟 URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: () => 'blob:mock-url',
})

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: () => {},
})

// 模拟 Audio
global.Audio = class Audio {
  play() {
    return Promise.resolve()
  }
  pause() {}
  load() {}
  volume = 1
  currentTime = 0
  duration = 0
  paused = true
  ended = false
}

// 模拟 fetch
global.fetch = async (url: string, options?: RequestInit) => {
  return new Response(JSON.stringify({}), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// 设置测试环境
beforeAll(() => {
  // 全局测试设置
})

afterAll(() => {
  // 全局测试清理
})

beforeEach(() => {
  // 每个测试前的设置
  document.body.innerHTML = ''
})

afterEach(() => {
  // 每个测试后的清理
  document.body.innerHTML = ''
  
  // 清理定时器
  const timers = (global as any).__timers
  if (timers) {
    timers.forEach((timer: any) => clearTimeout(timer))
  }
})

// 测试工具函数
export const TestUtils = {
  /**
   * 创建测试容器
   */
  createContainer(id = 'test-container'): HTMLElement {
    const container = document.createElement('div')
    container.id = id
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)
    return container
  },

  /**
   * 等待异步操作
   */
  async waitFor(condition: () => boolean, timeout = 1000): Promise<void> {
    const start = Date.now()
    while (!condition() && Date.now() - start < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    if (!condition()) {
      throw new Error('Timeout waiting for condition')
    }
  },

  /**
   * 模拟用户点击
   */
  click(element: HTMLElement): void {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
    element.dispatchEvent(event)
  },

  /**
   * 模拟键盘按键
   */
  keyDown(element: HTMLElement, key: string, options: KeyboardEventInit = {}): void {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    })
    element.dispatchEvent(event)
  },

  /**
   * 模拟鼠标悬停
   */
  hover(element: HTMLElement): void {
    const event = new MouseEvent('mouseenter', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
    element.dispatchEvent(event)
  },

  /**
   * 模拟拖拽
   */
  dragAndDrop(source: HTMLElement, target: HTMLElement): void {
    // 拖拽开始
    const dragStartEvent = new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer(),
    })
    source.dispatchEvent(dragStartEvent)

    // 拖拽悬停
    const dragOverEvent = new DragEvent('dragover', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer(),
    })
    target.dispatchEvent(dragOverEvent)

    // 放置
    const dropEvent = new DragEvent('drop', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer(),
    })
    target.dispatchEvent(dropEvent)

    // 拖拽结束
    const dragEndEvent = new DragEvent('dragend', {
      bubbles: true,
      cancelable: true,
      dataTransfer: new DataTransfer(),
    })
    source.dispatchEvent(dragEndEvent)
  },

  /**
   * 模拟滚动
   */
  scroll(element: HTMLElement, scrollTop: number): void {
    element.scrollTop = scrollTop
    const event = new Event('scroll', {
      bubbles: true,
      cancelable: true,
    })
    element.dispatchEvent(event)
  },

  /**
   * 模拟窗口大小变化
   */
  resize(width: number, height: number): void {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    })
    
    const event = new Event('resize')
    window.dispatchEvent(event)
  },

  /**
   * 获取元素的计算样式
   */
  getComputedStyle(element: HTMLElement, property: string): string {
    return window.getComputedStyle(element).getPropertyValue(property)
  },

  /**
   * 检查元素是否可见
   */
  isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  },

  /**
   * 检查元素是否有焦点
   */
  hasFocus(element: HTMLElement): boolean {
    return document.activeElement === element
  },

  /**
   * 创建模拟事件
   */
  createMockEvent(data: any = {}): any {
    const id = data.id || `test-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const defaultStart = new Date('2024-01-15T09:00:00')
    const defaultEnd = new Date('2024-01-15T10:00:00')

    const event = {
      id,
      title: 'Test Event',
      start: defaultStart,
      end: defaultEnd,
      description: 'Test event description',
      color: '#722ED1',
      ...data,
    }

    // 如果只提供了start日期，调整end日期
    if (data.start && !data.end) {
      const startDate = new Date(data.start)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000) // 1小时后
      event.end = endDate
    }

    return event
  },

  /**
   * 创建模拟事件列表
   */
  createMockEvents(count = 5): any[] {
    return Array.from({ length: count }, (_, index) => {
      // 确保日期有效，循环使用1-28号
      const day = (index % 28) + 1
      const month = Math.floor(index / 28) + 1
      return {
        id: `test-event-${index + 1}`,
        title: `Test Event ${index + 1}`,
        start: new Date(`2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T09:00:00`),
        end: new Date(`2024-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T10:00:00`),
        description: `Test event ${index + 1} description`,
        color: '#722ED1',
      }
    })
  },

  /**
   * 模拟异步延迟
   */
  async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  /**
   * 清理DOM
   */
  cleanup(): void {
    document.body.innerHTML = ''
  },
}

// 导出测试工具
export default TestUtils
