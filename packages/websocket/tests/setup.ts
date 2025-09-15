/**
 * 测试环境设置
 * 
 * 配置测试环境和全局 Mock
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import { vi } from 'vitest'

// Mock WebSocket 全局对象
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  url: string
  protocols?: string | string[]
  binaryType: 'blob' | 'arraybuffer' = 'arraybuffer'

  onopen: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string, protocols?: string | string[]) {
    this.url = url
    this.protocols = protocols

    // 模拟异步连接
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      if (this.onopen) {
        this.onopen(new Event('open'))
      }
    }, 10)
  }

  send(data: string | ArrayBuffer): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
  }

  close(code?: number, reason?: string): void {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code: code || 1000, reason: reason || '' }))
    }
  }

  // 测试辅助方法
  simulateMessage(data: string | ArrayBuffer): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }))
    }
  }

  simulateError(): void {
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  simulateClose(code = 1000, reason = ''): void {
    this.readyState = MockWebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }))
    }
  }
}

// 设置全局 WebSocket Mock
global.WebSocket = MockWebSocket as any

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true
})

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    }))
  },
  writable: true
})

// Mock console methods
const originalConsole = { ...console }

// 导出测试工具
export { MockWebSocket, localStorageMock, sessionStorageMock }

// 测试辅助函数
export function createMockWebSocket(url: string, protocols?: string | string[]): MockWebSocket {
  return new MockWebSocket(url, protocols)
}

export function waitForNextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function mockConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => { }),
    info: vi.spyOn(console, 'info').mockImplementation(() => { }),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
    error: vi.spyOn(console, 'error').mockImplementation(() => { }),
    debug: vi.spyOn(console, 'debug').mockImplementation(() => { })
  }
}

export function restoreConsole(mocks: ReturnType<typeof mockConsole>) {
  Object.values(mocks).forEach(mock => mock.mockRestore())
}
