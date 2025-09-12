/**
 * @file 适配器测试
 * @description 测试所有框架适配器
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { BaseAdapter, AdapterState } from '@/adapters/base-adapter'
import { VueAdapter } from '@/adapters/vue-adapter'
import { ReactAdapter } from '@/adapters/react-adapter'
import { AngularAdapter } from '@/adapters/angular-adapter'
import { VanillaAdapter } from '@/adapters/vanilla-adapter'
import { AdapterFactory, AdapterRegistry } from '@/adapters'

describe('适配器系统', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '400px'
    container.style.height = '300px'
    document.body.appendChild(container)

    // 手动注册适配器
    AdapterRegistry.register('vue', VueAdapter)
    AdapterRegistry.register('react', ReactAdapter)
    AdapterRegistry.register('angular', AngularAdapter)
    AdapterRegistry.register('vanilla', VanillaAdapter)
  })

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }

    // 清理注册表
    AdapterRegistry.clear()
  })

  describe('BaseAdapter', () => {
    class TestAdapter extends BaseAdapter {
      protected async onInit(): Promise<void> {
        // 测试适配器的初始化
      }

      protected onDestroy(): void {
        // 测试适配器的销毁
      }
    }

    it('应该能够创建基础适配器', () => {
      const adapter = new TestAdapter(container, { autoInit: false })
      expect(adapter).toBeInstanceOf(BaseAdapter)
      expect(adapter.getState()).toBe(AdapterState.IDLE)
      expect(adapter.getCropper()).toBeNull()
      expect(adapter.isReady()).toBe(false)
    })

    it('应该能够初始化适配器', async () => {
      const adapter = new TestAdapter(container, { autoInit: false })
      await adapter.init(container)

      expect(adapter.getState()).toBe(AdapterState.READY)
      expect(adapter.getCropper()).not.toBeNull()
      expect(adapter.isReady()).toBe(true)

      adapter.destroy()
    })

    it('应该能够销毁适配器', async () => {
      const adapter = new TestAdapter(container, { autoInit: false })
      await adapter.init(container)

      adapter.destroy()

      expect(adapter.getState()).toBe(AdapterState.DESTROYED)
      expect(adapter.getCropper()).toBeNull()
      expect(adapter.isReady()).toBe(false)
    })

    it('应该能够添加和移除事件监听器', async () => {
      const adapter = new TestAdapter(container, { autoInit: false })
      const listener = vi.fn()

      adapter.on('ready', listener)
      await adapter.init(container)

      adapter.off('ready', listener)
      adapter.destroy()
    })

    it('应该能够处理错误', async () => {
      const onError = vi.fn()
      const adapter = new TestAdapter('invalid-selector', {
        autoInit: false,
        onError
      })

      await expect(adapter.init('invalid-selector')).rejects.toThrow()
      expect(onError).toHaveBeenCalled()
    })
  })

  describe('VueAdapter', () => {
    it('应该能够创建Vue适配器', () => {
      const adapter = new VueAdapter(container, { autoInit: false })
      expect(adapter).toBeInstanceOf(VueAdapter)
      expect(adapter).toBeInstanceOf(BaseAdapter)
    })

    it('应该能够初始化Vue适配器', async () => {
      const adapter = new VueAdapter(container, { autoInit: false })
      await adapter.init(container)

      expect(adapter.isReady()).toBe(true)

      adapter.destroy()
    })

    it('应该能够使用Vue组合式API', () => {
      const mockRef = { value: container }

      expect(() => {
        VueAdapter.useVueCropper(mockRef as any)
      }).not.toThrow()
    })
  })

  describe('ReactAdapter', () => {
    it('应该能够创建React适配器', () => {
      const adapter = new ReactAdapter(container, { autoInit: false })
      expect(adapter).toBeInstanceOf(ReactAdapter)
      expect(adapter).toBeInstanceOf(BaseAdapter)
    })

    it('应该能够初始化React适配器', async () => {
      const adapter = new ReactAdapter(container, { autoInit: false })
      await adapter.init(container)

      expect(adapter.isReady()).toBe(true)

      adapter.destroy()
    })
  })

  describe('AngularAdapter', () => {
    it('应该能够创建Angular适配器', () => {
      const adapter = new AngularAdapter(container, { autoInit: false })
      expect(adapter).toBeInstanceOf(AngularAdapter)
      expect(adapter).toBeInstanceOf(BaseAdapter)
    })

    it('应该能够初始化Angular适配器', async () => {
      const adapter = new AngularAdapter(container, { autoInit: false })
      await adapter.init(container)

      expect(adapter.isReady()).toBe(true)

      adapter.destroy()
    })
  })

  describe('VanillaAdapter', () => {
    it('应该能够创建原生适配器', () => {
      const adapter = new VanillaAdapter(container, { autoInit: false })
      expect(adapter).toBeInstanceOf(VanillaAdapter)
      expect(adapter).toBeInstanceOf(BaseAdapter)
    })

    it('应该能够初始化原生适配器', async () => {
      const adapter = new VanillaAdapter(container, { autoInit: false })
      await adapter.init(container)

      expect(adapter.isReady()).toBe(true)

      adapter.destroy()
    })

    it('应该能够绑定到全局对象', async () => {
      const adapter = new VanillaAdapter(container, {
        autoInit: false,
        bindToGlobal: true,
        globalName: 'TestCropper'
      })

      await adapter.init(container)

      expect((window as any).TestCropper).toBeDefined()
      expect((window as any).TestCropper.instances).toBeInstanceOf(Map)

      adapter.destroy()

      // 清理全局对象
      delete (window as any).TestCropper
    })

    it('应该能够检查浏览器支持', () => {
      expect(VanillaAdapter.isSupported()).toBe(true)
    })

    it('应该能够解析data属性', () => {
      const element = document.createElement('div')
      element.setAttribute('data-aspect-ratio', '16/9')
      element.setAttribute('data-quality', '0.8')
      element.setAttribute('data-debug', 'true')

      const options = VanillaAdapter.parseDataAttributes(element)

      expect(options.quality).toBe(0.8)
      expect(options.debug).toBe(true)
    })

    it('应该能够自动初始化', () => {
      // 创建测试元素
      const testElement = document.createElement('div')
      testElement.setAttribute('data-cropper', '')
      testElement.style.width = '200px'
      testElement.style.height = '150px'
      document.body.appendChild(testElement)

      const adapters = VanillaAdapter.autoInit('[data-cropper]', { autoInit: false })

      expect(adapters).toHaveLength(1)
      expect(adapters[0]).toBeInstanceOf(VanillaAdapter)

      // 清理
      adapters.forEach(adapter => adapter.destroy())
      document.body.removeChild(testElement)
    })
  })

  describe('AdapterFactory', () => {
    it('应该能够创建不同框架的适配器', () => {
      const vueAdapter = AdapterFactory.create('vue', container, { autoInit: false })
      const reactAdapter = AdapterFactory.create('react', container, { autoInit: false })
      const angularAdapter = AdapterFactory.create('angular', container, { autoInit: false })
      const vanillaAdapter = AdapterFactory.create('vanilla', container, { autoInit: false })

      expect(vueAdapter).toBeInstanceOf(VueAdapter)
      expect(reactAdapter).toBeInstanceOf(ReactAdapter)
      expect(angularAdapter).toBeInstanceOf(AngularAdapter)
      expect(vanillaAdapter).toBeInstanceOf(VanillaAdapter)
    })

    it('应该在不支持的框架时抛出错误', () => {
      expect(() => {
        AdapterFactory.create('unsupported' as any, container)
      }).toThrow('Unsupported framework: unsupported')
    })

    it('应该能够检测框架', () => {
      // 模拟不同框架环境
      const originalVue = (window as any).Vue
      const originalReact = (window as any).React

        // 测试Vue检测
        ; (window as any).Vue = {}
      expect(AdapterFactory.detectFramework()).toBe('vue')

      // 测试React检测
      delete (window as any).Vue
        ; (window as any).React = {}
      expect(AdapterFactory.detectFramework()).toBe('react')

      // 测试默认情况
      delete (window as any).React
      expect(AdapterFactory.detectFramework()).toBe('vanilla')

      // 恢复原始值
      if (originalVue) (window as any).Vue = originalVue
      if (originalReact) (window as any).React = originalReact
    })

    it('应该能够自动创建适配器', () => {
      const adapter = AdapterFactory.auto(container, { autoInit: false })
      expect(adapter).toBeInstanceOf(BaseAdapter)
    })
  })

  describe('AdapterRegistry', () => {
    it('应该能够注册和获取适配器', () => {
      class CustomAdapter extends BaseAdapter {
        protected async onInit(): Promise<void> { }
        protected onDestroy(): void { }
      }

      AdapterRegistry.register('custom', CustomAdapter as any)

      const RegisteredAdapter = AdapterRegistry.get('custom')
      expect(RegisteredAdapter).toBe(CustomAdapter)

      AdapterRegistry.unregister('custom')
    })

    it('应该能够获取所有适配器', () => {
      const allAdapters = AdapterRegistry.getAll()
      expect(allAdapters.size).toBeGreaterThan(0)
      expect(allAdapters.has('vue')).toBe(true)
      expect(allAdapters.has('react')).toBe(true)
      expect(allAdapters.has('angular')).toBe(true)
      expect(allAdapters.has('vanilla')).toBe(true)
    })

    it('应该能够移除适配器', () => {
      class TempAdapter extends BaseAdapter {
        protected async onInit(): Promise<void> { }
        protected onDestroy(): void { }
      }

      AdapterRegistry.register('temp', TempAdapter as any)
      expect(AdapterRegistry.get('temp')).toBe(TempAdapter)

      const removed = AdapterRegistry.unregister('temp')
      expect(removed).toBe(true)
      expect(AdapterRegistry.get('temp')).toBeUndefined()
    })
  })

  describe('适配器代理方法', () => {
    let adapter: VanillaAdapter

    beforeEach(async () => {
      adapter = new VanillaAdapter(container, { autoInit: false })
      await adapter.init(container)
    })

    afterEach(() => {
      adapter.destroy()
    })

    it('应该能够代理裁剪器方法', () => {
      expect(() => adapter.getCropData()).not.toThrow()
      expect(() => adapter.zoom(1.5)).not.toThrow()
      expect(() => adapter.rotate(90)).not.toThrow()
      expect(() => adapter.flip(true, false)).not.toThrow()
      expect(() => adapter.reset()).not.toThrow()
    })

    it('应该在未准备就绪时抛出错误', () => {
      const notReadyAdapter = new VanillaAdapter(container, { autoInit: false })

      expect(() => notReadyAdapter.getCropData()).toThrow('Adapter is not ready')
      expect(() => notReadyAdapter.zoom(1.5)).toThrow('Adapter is not ready')
    })
  })
})
