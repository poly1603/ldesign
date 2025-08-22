/**
 * 适配器系统测试用例
 * 测试Vue和React适配器的跨框架支持功能
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { VueAdapter } from '../../src/adapters/vue-adapter'
import { ReactAdapter } from '../../src/adapters/react-adapter'
import { PdfApi } from '../../src/api/pdf-api'

// 模拟Vue
const mockVue = {
  ref: vi.fn((value: any) => ({ value })),
  reactive: vi.fn((obj: any) => obj),
  computed: vi.fn((fn: Function) => ({ value: fn() })),
  watch: vi.fn(),
  onMounted: vi.fn(),
  onUnmounted: vi.fn(),
  nextTick: vi.fn(() => Promise.resolve()),
}

// 模拟React
const mockReact = {
  useState: vi.fn((initial: any) => [initial, vi.fn()]),
  useEffect: vi.fn(),
  useRef: vi.fn(() => ({ current: null })),
  useCallback: vi.fn((fn: Function) => fn),
  useMemo: vi.fn((fn: Function) => fn()),
  createElement: vi.fn(),
}

// 模拟DOM元素
const mockElement = {
  appendChild: vi.fn(),
  removeChild: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  querySelector: vi.fn(),
  style: {},
  offsetWidth: 800,
  offsetHeight: 600,
}

describe('适配器系统测试', () => {
  let pdfApi: PdfApi
  let vueAdapter: VueAdapter
  let reactAdapter: ReactAdapter

  beforeEach(() => {
    vi.clearAllMocks()
    
    // 模拟全局对象
    vi.stubGlobal('document', {
      createElement: vi.fn().mockReturnValue(mockElement),
    })

    pdfApi = new PdfApi({
      enableWorker: false,
      debug: false,
    })

    vueAdapter = new VueAdapter(pdfApi, mockVue as any)
    reactAdapter = new ReactAdapter(pdfApi, mockReact as any)
  })

  afterEach(() => {
    vueAdapter.destroy()
    reactAdapter.destroy()
    pdfApi.destroy()
    vi.unstubAllGlobals()
  })

  describe('Vue适配器', () => {
    describe('初始化', () => {
      it('应该成功创建Vue适配器', () => {
        expect(vueAdapter).toBeDefined()
        expect(vueAdapter.framework).toBe('vue')
      })

      it('应该检测Vue版本', () => {
        const version = vueAdapter.getFrameworkVersion()
        expect(version).toBeDefined()
      })
    })

    describe('组合式API', () => {
      it('应该创建usePdfViewer组合函数', () => {
        const usePdfViewer = vueAdapter.createComposable('usePdfViewer')
        expect(usePdfViewer).toBeDefined()
        expect(typeof usePdfViewer).toBe('function')
      })

      it('应该提供响应式状态', () => {
        const usePdfViewer = vueAdapter.createComposable('usePdfViewer')
        const result = usePdfViewer({
          source: 'https://example.com/test.pdf',
          container: mockElement,
        })

        expect(result).toBeDefined()
        expect(result.loading).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.totalPages).toBeDefined()
        expect(result.currentPage).toBeDefined()
        expect(mockVue.ref).toHaveBeenCalled()
      })

      it('应该提供页面控制方法', () => {
        const usePdfViewer = vueAdapter.createComposable('usePdfViewer')
        const result = usePdfViewer({
          source: 'https://example.com/test.pdf',
          container: mockElement,
        })

        expect(result.nextPage).toBeDefined()
        expect(result.prevPage).toBeDefined()
        expect(result.goToPage).toBeDefined()
        expect(result.zoomIn).toBeDefined()
        expect(result.zoomOut).toBeDefined()
        expect(result.resetZoom).toBeDefined()
      })

      it('应该处理生命周期钩子', () => {
        const usePdfViewer = vueAdapter.createComposable('usePdfViewer')
        usePdfViewer({
          source: 'https://example.com/test.pdf',
          container: mockElement,
        })

        expect(mockVue.onMounted).toHaveBeenCalled()
        expect(mockVue.onUnmounted).toHaveBeenCalled()
      })

      it('应该创建usePdfRenderer组合函数', () => {
        const usePdfRenderer = vueAdapter.createComposable('usePdfRenderer')
        const result = usePdfRenderer()

        expect(result).toBeDefined()
        expect(result.renderPage).toBeDefined()
        expect(result.renderProgress).toBeDefined()
      })
    })

    describe('组件创建', () => {
      it('应该创建PDF预览组件', () => {
        const PdfViewer = vueAdapter.createComponent('PdfViewer', {
          props: ['source', 'scale', 'page'],
          emits: ['load', 'error', 'pageChange'],
        })

        expect(PdfViewer).toBeDefined()
        expect(PdfViewer.name).toBe('PdfViewer')
        expect(PdfViewer.props).toBeDefined()
        expect(PdfViewer.emits).toBeDefined()
      })

      it('应该创建PDF缩略图组件', () => {
        const PdfThumbnail = vueAdapter.createComponent('PdfThumbnail', {
          props: ['source', 'page', 'width', 'height'],
        })

        expect(PdfThumbnail).toBeDefined()
        expect(PdfThumbnail.name).toBe('PdfThumbnail')
      })
    })

    describe('指令支持', () => {
      it('应该创建v-pdf指令', () => {
        const directive = vueAdapter.createDirective('pdf', {
          mounted: vi.fn(),
          updated: vi.fn(),
          unmounted: vi.fn(),
        })

        expect(directive).toBeDefined()
        expect(directive.mounted).toBeDefined()
        expect(directive.updated).toBeDefined()
        expect(directive.unmounted).toBeDefined()
      })
    })

    describe('插件集成', () => {
      it('应该创建Vue插件', () => {
        const plugin = vueAdapter.createPlugin({
          components: ['PdfViewer', 'PdfThumbnail'],
          composables: ['usePdfViewer', 'usePdfRenderer'],
          directives: ['pdf'],
        })

        expect(plugin).toBeDefined()
        expect(plugin.install).toBeDefined()
        expect(typeof plugin.install).toBe('function')
      })

      it('应该正确安装插件', () => {
        const mockApp = {
          component: vi.fn(),
          directive: vi.fn(),
          provide: vi.fn(),
        }

        const plugin = vueAdapter.createPlugin({
          components: ['PdfViewer'],
          directives: ['pdf'],
        })

        plugin.install(mockApp, {})

        expect(mockApp.component).toHaveBeenCalled()
        expect(mockApp.directive).toHaveBeenCalled()
        expect(mockApp.provide).toHaveBeenCalled()
      })
    })
  })

  describe('React适配器', () => {
    describe('初始化', () => {
      it('应该成功创建React适配器', () => {
        expect(reactAdapter).toBeDefined()
        expect(reactAdapter.framework).toBe('react')
      })

      it('应该检测React版本', () => {
        const version = reactAdapter.getFrameworkVersion()
        expect(version).toBeDefined()
      })
    })

    describe('Hook函数', () => {
      it('应该创建usePdfViewer Hook', () => {
        const usePdfViewer = reactAdapter.createHook('usePdfViewer')
        expect(usePdfViewer).toBeDefined()
        expect(typeof usePdfViewer).toBe('function')
      })

      it('应该提供状态管理', () => {
        const usePdfViewer = reactAdapter.createHook('usePdfViewer')
        const result = usePdfViewer({
          source: 'https://example.com/test.pdf',
          container: mockElement,
        })

        expect(result).toBeDefined()
        expect(result.loading).toBeDefined()
        expect(result.error).toBeDefined()
        expect(result.totalPages).toBeDefined()
        expect(result.currentPage).toBeDefined()
        expect(mockReact.useState).toHaveBeenCalled()
      })

      it('应该处理副作用', () => {
        const usePdfViewer = reactAdapter.createHook('usePdfViewer')
        usePdfViewer({
          source: 'https://example.com/test.pdf',
          container: mockElement,
        })

        expect(mockReact.useEffect).toHaveBeenCalled()
      })

      it('应该创建usePdfRenderer Hook', () => {
        const usePdfRenderer = reactAdapter.createHook('usePdfRenderer')
        const result = usePdfRenderer()

        expect(result).toBeDefined()
        expect(result.renderPage).toBeDefined()
        expect(result.renderProgress).toBeDefined()
      })
    })

    describe('组件创建', () => {
      it('应该创建PDF预览组件', () => {
        const PdfViewer = reactAdapter.createComponent('PdfViewer', {
          displayName: 'PdfViewer',
          propTypes: {},
          defaultProps: {},
        })

        expect(PdfViewer).toBeDefined()
        expect(PdfViewer.displayName).toBe('PdfViewer')
        expect(mockReact.createElement).toHaveBeenCalled()
      })

      it('应该创建高阶组件', () => {
        const withPdfViewer = reactAdapter.createHOC('withPdfViewer', {
          injectProps: ['pdfApi', 'pdfState'],
        })

        expect(withPdfViewer).toBeDefined()
        expect(typeof withPdfViewer).toBe('function')
      })
    })

    describe('Context支持', () => {
      it('应该创建PDF Context', () => {
        const PdfContext = reactAdapter.createContext('PdfContext', {
          defaultValue: {
            api: pdfApi,
            options: {},
          },
        })

        expect(PdfContext).toBeDefined()
        expect(PdfContext.Provider).toBeDefined()
        expect(PdfContext.Consumer).toBeDefined()
      })

      it('应该创建Context Provider组件', () => {
        const PdfProvider = reactAdapter.createProvider('PdfProvider', {
          contextName: 'PdfContext',
          providerProps: ['api', 'options'],
        })

        expect(PdfProvider).toBeDefined()
      })
    })
  })

  describe('通用适配器功能', () => {
    describe('事件系统', () => {
      it('Vue适配器应该处理事件', () => {
        const eventSpy = vi.fn()
        vueAdapter.on('documentLoaded', eventSpy)
        vueAdapter.emit('documentLoaded', { pages: 10 })

        expect(eventSpy).toHaveBeenCalledWith({ pages: 10 })
      })

      it('React适配器应该处理事件', () => {
        const eventSpy = vi.fn()
        reactAdapter.on('documentLoaded', eventSpy)
        reactAdapter.emit('documentLoaded', { pages: 10 })

        expect(eventSpy).toHaveBeenCalledWith({ pages: 10 })
      })
    })

    describe('生命周期管理', () => {
      it('Vue适配器应该管理组件生命周期', () => {
        const lifeCycleSpy = vi.fn()
        vueAdapter.onMounted(lifeCycleSpy)
        vueAdapter.onUnmounted(lifeCycleSpy)

        expect(mockVue.onMounted).toHaveBeenCalled()
        expect(mockVue.onUnmounted).toHaveBeenCalled()
      })

      it('React适配器应该管理组件生命周期', () => {
        const effectSpy = vi.fn()
        reactAdapter.useEffect(effectSpy, [])

        expect(mockReact.useEffect).toHaveBeenCalledWith(effectSpy, [])
      })
    })

    describe('性能优化', () => {
      it('Vue适配器应该支持计算属性', () => {
        const computedFn = vi.fn(() => 'computed value')
        const computed = vueAdapter.computed(computedFn)

        expect(mockVue.computed).toHaveBeenCalledWith(computedFn)
      })

      it('React适配器应该支持memoization', () => {
        const memoFn = vi.fn(() => 'memo value')
        const memo = reactAdapter.useMemo(memoFn, [])

        expect(mockReact.useMemo).toHaveBeenCalledWith(memoFn, [])
      })
    })

    describe('错误处理', () => {
      it('适配器应该处理框架不兼容错误', () => {
        expect(() => {
          new VueAdapter(pdfApi, null as any)
        }).toThrow()

        expect(() => {
          new ReactAdapter(pdfApi, null as any)
        }).toThrow()
      })

      it('适配器应该验证组件配置', () => {
        expect(() => {
          vueAdapter.createComponent('', {})
        }).toThrow()

        expect(() => {
          reactAdapter.createComponent('', {})
        }).toThrow()
      })
    })
  })

  describe('适配器工厂', () => {
    it('应该根据环境自动选择适配器', () => {
      // 模拟Vue环境
      vi.stubGlobal('Vue', mockVue)
      
      const autoAdapter = vueAdapter.detectFramework()
      expect(autoAdapter).toBe('vue')
      
      vi.unstubAllGlobals()
    })

    it('应该提供适配器兼容性检查', () => {
      const isVueCompatible = vueAdapter.isCompatible(mockVue)
      const isReactCompatible = reactAdapter.isCompatible(mockReact)

      expect(isVueCompatible).toBe(true)
      expect(isReactCompatible).toBe(true)
    })
  })

  describe('销毁和清理', () => {
    it('Vue适配器应该正确清理资源', () => {
      const cleanup = vi.fn()
      vueAdapter.onUnmounted(cleanup)
      vueAdapter.destroy()

      // 验证清理函数被调用
      expect(cleanup).toHaveBeenCalled()
    })

    it('React适配器应该正确清理资源', () => {
      const cleanup = vi.fn()
      reactAdapter.useEffect(() => cleanup, [])
      reactAdapter.destroy()

      // 验证effect被正确设置
      expect(mockReact.useEffect).toHaveBeenCalled()
    })
  })
})