/**
 * CSS注入器测试
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createCSSInjector,
  createCSSVariableGenerator,
  CSSInjectorImpl,
  CSSVariableGenerator,
  defaultCSSInjector,
  defaultCSSVariableGenerator,
  injectScaleVariables,
  removeAllColorVariables,
} from '../src/utils/css-injector'

// Mock DOM environment
function createMockDocument() {
  const elements = new Map<string, any>()

  const mockHead = {
    appendChild: (element: any) => {
      element.parentNode = mockHead
      if (element.id) {
        elements.set(element.id, element)
      }
    },
    removeChild: (element: any) => {
      element.parentNode = null
      if (element.id) {
        elements.delete(element.id)
      }
    },
    innerHTML: '',
  }

  return {
    createElement: (tagName: string) => {
      const element = {
        id: '',
        type: '',
        textContent: '',
        parentNode: null,
        tagName: tagName.toUpperCase(),
        remove() {
          if (this.parentNode && this.parentNode.removeChild) {
            this.parentNode.removeChild(this)
          }
        },
      }
      return element
    },
    head: mockHead,
    getElementById: (id: string) => elements.get(id) || null,
    querySelector: (selector: string) => {
      if (selector.includes('data-test-id')) {
        const testId = selector.match(/"([^"]+)"/)?.[1]
        if (testId) {
          for (const [_id, element] of elements) {
            if (element.getAttribute && element.getAttribute('data-test-id') === testId) {
              return element
            }
          }
        }
      }
      return null
    },
  }
}

// Test helper to create a test environment
function createTestEnvironment() {
  const elements = new Map<string, any>()

  const mockHead = {
    appendChild: (element: any) => {
      element.parentNode = mockHead
      if (element.id) {
        elements.set(element.id, element)
      }
      if (element.getAttribute && element.getAttribute('data-test-id')) {
        elements.set(element.getAttribute('data-test-id'), element)
      }
    },
    removeChild: (element: any) => {
      element.parentNode = null
      if (element.id) {
        elements.delete(element.id)
      }
      if (element.getAttribute && element.getAttribute('data-test-id')) {
        elements.delete(element.getAttribute('data-test-id'))
      }
    },
    innerHTML: '',
  }

  const mockDocument = {
    createElement: (tagName: string) => {
      const element = {
        id: '',
        type: '',
        textContent: '',
        parentNode: null,
        tagName: tagName.toUpperCase(),
        attributes: new Map<string, string>(),
        setAttribute(name: string, value: string) {
          this.attributes.set(name, value)
        },
        getAttribute(name: string) {
          return this.attributes.get(name) || null
        },
        remove() {
          if (this.parentNode && this.parentNode.removeChild) {
            this.parentNode.removeChild(this)
          }
        },
      }
      return element
    },
    head: mockHead,
    getElementById: (id: string) => elements.get(id) || null,
    querySelector: (selector: string) => {
      if (selector.includes('data-test-id')) {
        const match = selector.match(/\[data-test-id="([^"]+)"\]/)
        if (match) {
          return elements.get(match[1]) || null
        }
      }
      return null
    },
  }

  globalThis.document = mockDocument as any

  return {
    injector: new CSSInjectorImpl({
      styleId: 'custom-style',
    }),
    mockDocument,
    elements,
  }
}

describe('cSSInjectorImpl', () => {
  let originalDocument: Document

  beforeEach(() => {
    originalDocument = globalThis.document
  })

  afterEach(() => {
    globalThis.document = originalDocument
  })

  describe('基本功能', () => {
    it('应该创建CSS注入器', () => {
      const { injector } = createTestEnvironment()
      expect(injector).toBeDefined()
    })

    it('应该注入CSS变量', () => {
      const { injector } = createTestEnvironment()
      const variables = {
        '--color-primary': '#1890ff',
        '--color-success': '#52c41a',
      }

      injector.injectVariables(variables)

      // 验证样式元素被创建
      const injectedIds = injector.getInjectedIds()
      expect(injectedIds).toContain('custom-style')
    })

    it('应该移除CSS变量', () => {
      const { injector } = createTestEnvironment()
      const variables = { '--color-primary': '#1890ff' }

      injector.injectVariables(variables)
      expect(injector.getInjectedIds()).toHaveLength(1)

      injector.removeVariables()
      expect(injector.getInjectedIds()).toHaveLength(0)
    })

    it('应该更新CSS变量', () => {
      const { injector } = createTestEnvironment()
      const variables1 = { '--color-primary': '#1890ff' }
      const variables2 = { '--color-primary': '#52c41a' }

      injector.injectVariables(variables1)
      injector.updateVariables(variables2)

      expect(injector.getInjectedIds()).toHaveLength(1)
    })

    it('应该支持自定义选项', () => {
      createTestEnvironment()
      const injector = new CSSInjectorImpl({
        prefix: '--my-color',
        selector: '.theme-container',
        important: true,
        styleId: 'my-theme-variables',
      })

      const options = injector.getOptions()
      expect(options.prefix).toBe('--my-color')
      expect(options.selector).toBe('.theme-container')
      expect(options.important).toBe(true)
      expect(options.styleId).toBe('my-theme-variables')
    })

    it('应该清空所有注入的样式', () => {
      const { injector } = createTestEnvironment()

      injector.injectVariables({ '--color-1': '#111' }, 'style1')
      injector.injectVariables({ '--color-2': '#222' }, 'style2')

      expect(injector.getInjectedIds()).toHaveLength(2)

      injector.clearAll()
      expect(injector.getInjectedIds()).toHaveLength(0)
    })

    it('应该更新注入选项', () => {
      const { injector } = createTestEnvironment()

      injector.updateOptions({ prefix: '--new-prefix' })
      expect(injector.getOptions().prefix).toBe('--new-prefix')
    })
  })
})

describe('cSSVariableGenerator', () => {
  describe('基本功能', () => {
    it('应该创建CSS变量生成器', () => {
      const generator = new CSSVariableGenerator()
      expect(generator).toBeDefined()
      expect(generator.getPrefix()).toBe('--color')
    })

    it('应该支持自定义前缀', () => {
      const generator = new CSSVariableGenerator('--my-theme')
      expect(generator.getPrefix()).toBe('--my-theme')
    })

    it('应该更新前缀', () => {
      const generator = new CSSVariableGenerator()
      generator.updatePrefix('--new-prefix')
      expect(generator.getPrefix()).toBe('--new-prefix')
    })
  })

  describe('色阶变量生成', () => {
    it('应该从色阶生成CSS变量', () => {
      const generator = new CSSVariableGenerator()
      const scales = {
        primary: {
          colors: ['#e6f7ff', '#1890ff', '#002766'],
          indices: { 1: '#e6f7ff', 5: '#1890ff', 10: '#002766' },
        },
        success: {
          colors: ['#f6ffed', '#52c41a', '#135200'],
          indices: { 1: '#f6ffed', 5: '#52c41a', 10: '#135200' },
        },
      }

      const variables = generator.generateFromScales(scales)

      expect(variables['--color-primary-1']).toBe('#e6f7ff')
      expect(variables['--color-primary-5']).toBe('#1890ff')
      expect(variables['--color-primary-10']).toBe('#002766')
      expect(variables['--color-primary']).toBe('#1890ff') // 主色使用索引5

      expect(variables['--color-success-1']).toBe('#f6ffed')
      expect(variables['--color-success-5']).toBe('#52c41a')
      expect(variables['--color-success']).toBe('#52c41a')
    })

    it('应该支持自定义前缀', () => {
      const generator = new CSSVariableGenerator()
      const scales = {
        primary: {
          colors: ['#e6f7ff', '#1890ff'],
          indices: { 1: '#e6f7ff', 5: '#1890ff' },
        },
      }

      const variables = generator.generateFromScales(scales, '--my-theme')

      expect(variables['--my-theme-primary-1']).toBe('#e6f7ff')
      expect(variables['--my-theme-primary-5']).toBe('#1890ff')
      expect(variables['--my-theme-primary']).toBe('#1890ff')
    })
  })

  describe('语义化变量生成', () => {
    it('应该生成语义化CSS变量', () => {
      const generator = new CSSVariableGenerator()
      const scales = {
        primary: {
          colors: Array.from({ length: 10 }).fill('#1890ff'),
          indices: {
            3: '#91d5ff',
            5: '#1890ff',
            6: '#0050b3',
            7: '#003a8c',
          },
        },
        success: {
          colors: Array.from({ length: 10 }).fill('#52c41a'),
          indices: {
            5: '#52c41a',
            6: '#389e0d',
            7: '#237804',
          },
        },
        gray: {
          colors: Array.from({ length: 10 }).fill('#8c8c8c'),
          indices: {
            1: '#fafafa',
            3: '#d9d9d9',
            4: '#bfbfbf',
            6: '#737373',
            8: '#262626',
          },
        },
      }

      const variables = generator.generateSemanticVariables(scales)

      // 验证主要颜色
      expect(variables['--color-primary']).toBe('#1890ff')
      expect(variables['--color-primary-hover']).toBe('#0050b3')
      expect(variables['--color-primary-active']).toBe('#003a8c')
      expect(variables['--color-primary-disabled']).toBe('#91d5ff')

      // 验证成功色
      expect(variables['--color-success']).toBe('#52c41a')
      expect(variables['--color-success-hover']).toBe('#389e0d')

      // 验证语义化变量
      expect(variables['--color-text']).toBe('#262626')
      expect(variables['--color-border']).toBe('#d9d9d9')
      expect(variables['--color-background']).toBe('#fafafa')
    })
  })
})

describe('便捷函数', () => {
  let mockDocument: ReturnType<typeof createMockDocument>
  let originalDocument: Document

  beforeEach(() => {
    mockDocument = createMockDocument()
    originalDocument = globalThis.document
    globalThis.document = mockDocument as any
  })

  afterEach(() => {
    globalThis.document = originalDocument
  })

  it('createCSSInjector应该工作', () => {
    const injector = createCSSInjector()
    expect(injector).toBeDefined()
  })

  it('createCSSVariableGenerator应该工作', () => {
    const generator = createCSSVariableGenerator('--test')
    expect(generator).toBeDefined()
    expect(generator.getPrefix()).toBe('--test')
  })

  it('默认实例应该可用', () => {
    expect(defaultCSSInjector).toBeDefined()
    expect(defaultCSSVariableGenerator).toBeDefined()
  })

  it('injectScaleVariables应该工作', () => {
    const scales = {
      primary: {
        colors: ['#e6f7ff', '#1890ff'],
        indices: { 1: '#e6f7ff', 5: '#1890ff' },
      },
    }

    expect(() => {
      injectScaleVariables(scales)
    }).not.toThrow()
  })

  it('removeAllColorVariables应该工作', () => {
    expect(() => {
      removeAllColorVariables()
    }).not.toThrow()
  })

  it('injectScaleVariables应该支持语义化变量', () => {
    const scales = {
      primary: {
        colors: ['#e6f7ff', '#1890ff'],
        indices: { 3: '#91d5ff', 5: '#1890ff', 6: '#0050b3' },
      },
    }

    expect(() => {
      injectScaleVariables(scales, { semantic: true })
    }).not.toThrow()
  })
})
