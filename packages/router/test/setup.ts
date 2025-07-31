import { beforeEach } from 'vitest'

// 全局测试设置
beforeEach(() => {
  // 清理DOM
  document.body.innerHTML = ''
  
  // 重置location
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', '/')
  }
})

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  },
  writable: true
})

// Mock console methods for cleaner test output
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn()
}