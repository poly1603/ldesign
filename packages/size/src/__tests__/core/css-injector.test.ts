/**
 * CSS注入器测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCSSInjector,
  CSSInjector,
  getCSSVariableValue,
  injectGlobalVariables,
  isVariablesInjected,
  setCSSVariableValue,
} from '../../core/css-injector'

// Mock DOM
const mockDocument = {
  createElement: vi.fn(),
  getElementById: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
  documentElement: {
    style: {
      setProperty: vi.fn(),
    },
  },
}

const mockGetComputedStyle = vi.fn()

// Mock window and document
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
})

Object.defineProperty(global, 'window', {
  value: {
    getComputedStyle: mockGetComputedStyle,
  },
  writable: true,
})

describe('cSSInjector', () => {
  let injector: CSSInjector
  let mockStyleElement: any

  beforeEach(() => {
    injector = new CSSInjector()
    mockStyleElement = {
      id: '',
      textContent: '',
      remove: vi.fn(),
    }

    mockDocument.createElement.mockReturnValue(mockStyleElement)
    mockDocument.getElementById.mockReturnValue(null)
    mockDocument.head.appendChild.mockClear()
    mockGetComputedStyle.mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue('16px'),
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('构造函数', () => {
    it('应该使用默认选项', () => {
      const options = injector.getOptions()
      expect(options.styleId).toBe('ldesign-size-variables')
      expect(options.selector).toBe(':root')
      expect(options.important).toBe(false)
    })

    it('应该使用自定义选项', () => {
      const customInjector = new CSSInjector({
        styleId: 'custom-id',
        selector: '.custom',
        important: true,
      })

      const options = customInjector.getOptions()
      expect(options.styleId).toBe('custom-id')
      expect(options.selector).toBe('.custom')
      expect(options.important).toBe(true)
    })
  })

  describe('injectVariables', () => {
    it('应该创建并插入样式元素', () => {
      const variables = {
        '--test-var': 'value1',
        '--test-var2': 'value2',
      }

      injector.injectVariables(variables)

      expect(mockDocument.createElement).toHaveBeenCalledWith('style')
      expect(mockStyleElement.id).toBe('ldesign-size-variables')
      expect(mockStyleElement.textContent).toContain(':root {')
      expect(mockStyleElement.textContent).toContain('--test-var: value1;')
      expect(mockStyleElement.textContent).toContain('--test-var2: value2;')
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockStyleElement)
    })

    it('应该移除现有的样式元素', () => {
      const existingElement = { remove: vi.fn() }
      mockDocument.getElementById.mockReturnValue(existingElement)

      injector.injectVariables({ '--test': 'value' })

      expect(mockDocument.getElementById).toHaveBeenCalledWith('ldesign-size-variables')
      expect(existingElement.remove).toHaveBeenCalled()
    })

    it('应该处理浏览器环境检查', () => {
      const originalDocument = global.document
      // @ts-ignore
      delete global.document

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

      injector.injectVariables({ '--test': 'value' })

      expect(consoleSpy).toHaveBeenCalledWith('CSS injection is only available in browser environment')

      global.document = originalDocument
      consoleSpy.mockRestore()
    })
  })

  describe('injectCSS', () => {
    it('应该注入CSS字符串', () => {
      const cssString = ':root { --test: value; }'

      injector.injectCSS(cssString)

      expect(mockStyleElement.textContent).toBe(cssString)
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockStyleElement)
    })
  })

  describe('removeCSS', () => {
    it('应该移除样式元素', () => {
      const existingElement = { remove: vi.fn() }
      mockDocument.getElementById.mockReturnValue(existingElement)

      injector.removeCSS()

      expect(mockDocument.getElementById).toHaveBeenCalledWith('ldesign-size-variables')
      expect(existingElement.remove).toHaveBeenCalled()
    })

    it('应该处理不存在的样式元素', () => {
      mockDocument.getElementById.mockReturnValue(null)

      expect(() => injector.removeCSS()).not.toThrow()
    })
  })

  describe('updateVariables', () => {
    it('应该更新CSS变量', () => {
      const variables = { '--test': 'value' }

      injector.updateVariables(variables)

      expect(mockDocument.createElement).toHaveBeenCalledWith('style')
      expect(mockStyleElement.textContent).toContain('--test: value;')
    })
  })

  describe('isInjected', () => {
    it('应该检查样式是否已注入', () => {
      mockDocument.getElementById.mockReturnValue(mockStyleElement)
      expect(injector.isInjected()).toBe(true)

      mockDocument.getElementById.mockReturnValue(null)
      expect(injector.isInjected()).toBe(false)
    })
  })

  describe('updateOptions', () => {
    it('应该更新选项', () => {
      injector.updateOptions({
        styleId: 'new-id',
        important: true,
      })

      const options = injector.getOptions()
      expect(options.styleId).toBe('new-id')
      expect(options.important).toBe(true)
      expect(options.selector).toBe(':root') // 保持原有值
    })
  })

  describe('destroy', () => {
    it('应该清理资源', () => {
      const existingElement = { remove: vi.fn() }
      mockDocument.getElementById.mockReturnValue(existingElement)

      injector.destroy()

      expect(existingElement.remove).toHaveBeenCalled()
    })
  })
})

describe('工厂函数和便捷函数', () => {
  let mockStyleElement: any

  beforeEach(() => {
    mockStyleElement = {
      id: '',
      textContent: '',
      remove: vi.fn(),
    }
    vi.clearAllMocks()
  })

  describe('createCSSInjector', () => {
    it('应该创建新的注入器实例', () => {
      const injector = createCSSInjector({ styleId: 'custom' })
      expect(injector).toBeInstanceOf(CSSInjector)
      expect(injector.getOptions().styleId).toBe('custom')
    })
  })

  describe('injectGlobalVariables', () => {
    it('应该使用全局注入器', () => {
      const variables = { '--test': 'value' }
      injectGlobalVariables(variables)

      expect(mockDocument.createElement).toHaveBeenCalled()
    })

    it('应该使用自定义选项', () => {
      const variables = { '--test': 'value' }
      injectGlobalVariables(variables, { styleId: 'custom' })

      expect(mockDocument.createElement).toHaveBeenCalled()
    })
  })

  describe('isVariablesInjected', () => {
    it('应该检查默认样式ID', () => {
      mockDocument.getElementById.mockReturnValue(mockStyleElement)
      expect(isVariablesInjected()).toBe(true)

      expect(mockDocument.getElementById).toHaveBeenCalledWith('ldesign-size-variables')
    })

    it('应该检查自定义样式ID', () => {
      mockDocument.getElementById.mockReturnValue(mockStyleElement)
      expect(isVariablesInjected('custom-id')).toBe(true)

      expect(mockDocument.getElementById).toHaveBeenCalledWith('custom-id')
    })
  })

  describe('getCSSVariableValue', () => {
    it('应该处理非浏览器环境', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      const value = getCSSVariableValue('--test-var')
      expect(value).toBe('')

      global.window = originalWindow
    })
  })

  describe('setCSSVariableValue', () => {
    it('应该处理非浏览器环境', () => {
      const originalDocument = global.document
      // @ts-ignore
      delete global.document

      expect(() => setCSSVariableValue('--test-var', '20px')).not.toThrow()

      global.document = originalDocument
    })
  })
})
