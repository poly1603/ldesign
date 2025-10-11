/**
 * 测试设置文件
 * 配置测试环境和全局设置
 */

import { vi } from 'vitest'

// Mock 浏览器 API
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  },
  writable: true,
})

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    language: 'en-US',
    languages: ['en-US', 'en'],
    userAgent: 'Mozilla/5.0 (Test Environment)',
  },
  writable: true,
})

// Mock location
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
  },
  writable: true,
})

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  value: '',
  writable: true,
})

// Mock fetch
global.fetch = vi.fn()

// 全局测试工具
global.createMockLanguagePackage = (locale: string, translations: Record<string, any>) => ({
  info: {
    name: locale === 'zh-CN' ? '中文' : 'English',
    nativeName: locale === 'zh-CN' ? '中文' : 'English',
    code: locale,
    direction: 'ltr',
    dateFormat: 'YYYY-MM-DD',
  },
  translations,
})

// 清理函数
beforeEach(() => {
  vi.clearAllMocks()

  // 重置 localStorage mock
  const localStorageMock = window.localStorage as any
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockImplementation(() => {})
  localStorageMock.removeItem.mockImplementation(() => {})
  localStorageMock.clear.mockImplementation(() => {})

  // 重置 sessionStorage mock
  const sessionStorageMock = window.sessionStorage as any
  sessionStorageMock.getItem.mockReturnValue(null)
  sessionStorageMock.setItem.mockImplementation(() => {})
  sessionStorageMock.removeItem.mockImplementation(() => {})
  sessionStorageMock.clear.mockImplementation(() => {})

  // 重置 fetch mock
  const fetchMock = global.fetch as any
  fetchMock.mockClear()

  // 重置 document.cookie
  document.cookie = ''
})

// 类型声明
declare global {
  function createMockLanguagePackage(locale: string, translations: Record<string, any>): {
    info: {
      name: string
      nativeName: string
      code: string
      direction: string
      dateFormat: string
    }
    translations: Record<string, any>
  }
}
