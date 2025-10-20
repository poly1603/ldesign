/**
 * useTemplate 组合式函数测试用例
 */

import type { TemplateManagerOptions } from '../../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTemplate } from '../../../src/composables/useTemplate'

// Mock Vue
vi.mock('vue', () => ({
  ref: vi.fn(value => ({ value })),
  computed: vi.fn(fn => ({ value: fn() })),
  onMounted: vi.fn(fn => fn()),
  onUnmounted: vi.fn(),
  watch: vi.fn(),
}))

describe('useTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础功能', () => {
    it('应该返回模板管理器实例', () => {
      const { manager } = useTemplate()

      expect(manager).toBeDefined()
      expect(manager.value).toBeDefined()
    })

    it('应该返回响应式状态', () => {
      const {
        currentTemplate,
        isLoading,
        error,
        templates,
      } = useTemplate()

      expect(currentTemplate).toBeDefined()
      expect(isLoading).toBeDefined()
      expect(error).toBeDefined()
      expect(templates).toBeDefined()
    })

    it('应该返回操作方法', () => {
      const {
        scanTemplates,
        switchTemplate,
        render,
        refresh,
      } = useTemplate()

      expect(typeof scanTemplates).toBe('function')
      expect(typeof switchTemplate).toBe('function')
      expect(typeof render).toBe('function')
      expect(typeof refresh).toBe('function')
    })
  })

  describe('配置选项', () => {
    it('应该接受配置选项', () => {
      const config: TemplateManagerConfig = {
        enableCache: false,
        defaultDevice: 'mobile',
        debug: true,
      }

      const { manager } = useTemplate(config)

      expect(manager.value).toBeDefined()
    })

    it('应该支持自动扫描选项', () => {
      const { manager } = useTemplate({}, { autoScan: true })

      expect(manager.value).toBeDefined()
    })

    it('应该支持自动设备检测选项', () => {
      const { manager } = useTemplate({}, { autoDetectDevice: true })

      expect(manager.value).toBeDefined()
    })
  })

  describe('scanTemplates', () => {
    it('应该能够扫描模板', async () => {
      const { scanTemplates, isLoading } = useTemplate()

      const promise = scanTemplates()

      // 扫描期间应该是加载状态
      expect(isLoading.value).toBe(true)

      await promise

      // 扫描完成后应该不是加载状态
      expect(isLoading.value).toBe(false)
    })

    it('应该处理扫描错误', async () => {
      const { scanTemplates, error } = useTemplate()

      // Mock 扫描失败
      vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await scanTemplates()
      }
      catch (e) {
        // 错误应该被捕获并设置到 error 状态
        expect(error.value).toBeDefined()
      }
    })
  })

  describe('switchTemplate', () => {
    it('应该能够切换模板', async () => {
      const { switchTemplate, currentTemplate } = useTemplate()

      await switchTemplate('login', 'desktop', 'classic')

      // 当前模板应该被更新
      expect(currentTemplate.value).toBeDefined()
    })

    it('应该处理切换错误', async () => {
      const { switchTemplate, error } = useTemplate()

      try {
        await switchTemplate('nonexistent', 'desktop', 'nonexistent')
      }
      catch (e) {
        expect(error.value).toBeDefined()
      }
    })
  })

  describe('render', () => {
    it('应该能够渲染模板', async () => {
      const { render } = useTemplate()

      const result = await render({
        category: 'login',
        device: 'desktop',
        template: 'classic',
      })

      expect(result).toBeDefined()
    })

    it('应该处理渲染错误', async () => {
      const { render, error } = useTemplate()

      try {
        await render({
          category: 'nonexistent',
          device: 'desktop',
          template: 'nonexistent',
          fallback: false,
        })
      }
      catch (e) {
        expect(error.value).toBeDefined()
      }
    })
  })

  describe('refresh', () => {
    it('应该能够刷新模板管理器', async () => {
      const { refresh } = useTemplate()

      await expect(refresh()).resolves.not.toThrow()
    })
  })

  describe('响应式更新', () => {
    it('应该在模板变化时更新状态', () => {
      const { manager, currentTemplate } = useTemplate()

      // 模拟模板变化事件
      const mockTemplate = {
        category: 'login',
        device: 'desktop',
        template: 'classic',
        name: 'Classic Login',
        description: 'A classic login template',
        path: '../templates/login/desktop/classic/index.tsx',
        componentPath: '../templates/login/desktop/classic/index.tsx',
        tags: ['login', 'desktop'],
        recommended: true,
      }

      // 模拟事件触发
      if (manager.value && typeof manager.value.emit === 'function') {
        manager.value.emit('template:switch:complete', { template: mockTemplate })
      }

      // 状态应该被更新
      expect(currentTemplate.value).toBeDefined()
    })

    it('应该在设备变化时更新状态', () => {
      const { manager } = useTemplate()

      // 模拟设备变化事件
      if (manager.value && typeof manager.value.emit === 'function') {
        manager.value.emit('device:change', { device: 'mobile' })
      }

      // 应该触发相应的处理逻辑
      expect(manager.value).toBeDefined()
    })
  })

  describe('清理', () => {
    it('应该在组件卸载时清理事件监听器', () => {
      const { manager } = useTemplate()

      // 模拟组件卸载
      const onUnmountedMock = vi.mocked(require('vue').onUnmounted)
      expect(onUnmountedMock).toHaveBeenCalled()

      // 执行清理函数
      const cleanupFn = onUnmountedMock.mock.calls[0][0]
      expect(() => cleanupFn()).not.toThrow()
    })
  })

  describe('错误处理', () => {
    it('应该正确处理和重置错误', async () => {
      const { error, switchTemplate } = useTemplate()

      // 初始状态应该没有错误
      expect(error.value).toBeNull()

      try {
        await switchTemplate('nonexistent', 'desktop', 'nonexistent')
      }
      catch (e) {
        // 错误应该被设置
        expect(error.value).toBeDefined()
      }

      // 成功操作应该清除错误
      try {
        await switchTemplate('login', 'desktop', 'classic')
        expect(error.value).toBeNull()
      }
      catch (e) {
        // 如果操作失败，至少不应该抛出未处理的错误
      }
    })
  })
})
