/**
 * Toast通知系统测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ToastManager, toast } from '../../ui/native/Toast'

// Mock DOM APIs
Object.defineProperty(window, 'setTimeout', {
  value: vi.fn((fn, delay) => {
    fn()
    return 1
  })
})

Object.defineProperty(window, 'clearTimeout', {
  value: vi.fn()
})

// Mock document.body
const mockBody = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  contains: vi.fn(() => true)
}

Object.defineProperty(document, 'body', {
  value: mockBody,
  writable: true
})

// Mock document.createElement
const mockElement = {
  className: '',
  style: { cssText: '' },
  innerHTML: '',
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  contains: vi.fn(() => true),
  addEventListener: vi.fn(),
  getBoundingClientRect: vi.fn(() => ({
    left: 0,
    top: 0,
    right: 100,
    bottom: 50,
    width: 100,
    height: 50
  }))
}

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({ ...mockElement }))
})

Object.defineProperty(document, 'head', {
  value: {
    appendChild: vi.fn()
  }
})

describe('ToastManager', () => {
  let toastManager: ToastManager

  beforeEach(() => {
    vi.clearAllMocks()
    toastManager = new ToastManager()
  })

  afterEach(() => {
    toastManager.destroy()
  })

  describe('基础功能', () => {
    it('应该能够创建Toast管理器', () => {
      expect(toastManager).toBeDefined()
    })

    it('应该能够显示Toast', () => {
      const id = toastManager.show('测试消息')
      expect(id).toBeDefined()
      expect(typeof id).toBe('string')
    })

    it('应该能够显示不同类型的Toast', () => {
      const successId = toastManager.success('成功消息')
      const errorId = toastManager.error('错误消息')
      const warningId = toastManager.warning('警告消息')
      const infoId = toastManager.info('信息消息')

      expect(successId).toBeDefined()
      expect(errorId).toBeDefined()
      expect(warningId).toBeDefined()
      expect(infoId).toBeDefined()
    })

    it('应该能够移除Toast', () => {
      const id = toastManager.show('测试消息')
      expect(() => toastManager.remove(id)).not.toThrow()
    })

    it('应该能够清空所有Toast', () => {
      toastManager.show('消息1')
      toastManager.show('消息2')
      toastManager.show('消息3')
      
      expect(() => toastManager.clear()).not.toThrow()
    })
  })

  describe('配置选项', () => {
    it('应该支持自定义位置', () => {
      const customToast = new ToastManager({ position: 'bottom-left' })
      expect(customToast).toBeDefined()
      customToast.destroy()
    })

    it('应该支持自定义最大数量', () => {
      const customToast = new ToastManager({ maxToasts: 3 })
      expect(customToast).toBeDefined()
      customToast.destroy()
    })

    it('应该支持自定义持续时间', () => {
      const id = toastManager.show('测试消息', { duration: 5000 })
      expect(id).toBeDefined()
    })

    it('应该支持禁用自动关闭', () => {
      const id = toastManager.show('测试消息', { duration: 0 })
      expect(id).toBeDefined()
    })
  })

  describe('全局Toast', () => {
    it('应该能够使用全局Toast方法', () => {
      expect(() => toast.show('测试消息')).not.toThrow()
      expect(() => toast.success('成功消息')).not.toThrow()
      expect(() => toast.error('错误消息')).not.toThrow()
      expect(() => toast.warning('警告消息')).not.toThrow()
      expect(() => toast.info('信息消息')).not.toThrow()
    })

    it('应该能够清空全局Toast', () => {
      toast.show('消息1')
      toast.show('消息2')
      expect(() => toast.clear()).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该处理无效的Toast ID', () => {
      expect(() => toastManager.remove('invalid-id')).not.toThrow()
    })

    it('应该处理销毁后的操作', () => {
      toastManager.destroy()
      expect(() => toastManager.show('测试消息')).not.toThrow()
    })
  })
})
