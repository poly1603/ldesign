import { afterEach, describe, expect, it } from 'vitest'
import { destroyGlobalManager, useTemplate } from '@/vue/composables/useTemplate'

describe('useTemplate', () => {
  afterEach(() => {
    destroyGlobalManager()
  })

  describe('基础功能', () => {
    it('应该返回正确的对象结构', () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      expect(result.manager).toBeDefined()
      expect(result.currentTemplate).toBeDefined()
      expect(result.currentDevice).toBeDefined()
      expect(result.loading).toBeDefined()
      expect(result.error).toBeDefined()
      expect(result.availableTemplates).toBeDefined()
      expect(result.availableCategories).toBeDefined()
      expect(result.availableDevices).toBeDefined()
    })

    it('应该返回正确的方法', () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      expect(typeof result.scanTemplates).toBe('function')
      expect(typeof result.render).toBe('function')
      expect(typeof result.switchTemplate).toBe('function')
      expect(typeof result.getTemplates).toBe('function')
      expect(typeof result.hasTemplate).toBe('function')
      expect(typeof result.clearCache).toBe('function')
      expect(typeof result.refresh).toBe('function')
    })

    it('应该能扫描模板', async () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      await result.scanTemplates()
      expect(result.availableTemplates.value).toBeInstanceOf(Array)
    })

    it('应该能获取模板列表', async () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      const templates = await result.getTemplates()
      expect(templates).toBeInstanceOf(Array)
    })

    it('应该能检查模板是否存在', async () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      const exists = await result.hasTemplate('login', 'desktop', 'classic')
      expect(typeof exists).toBe('boolean')
    })

    it('应该能清空缓存', () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      expect(() => result.clearCache()).not.toThrow()
    })

    it('当前设备应该有效', () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      const device = result.currentDevice.value
      expect(['desktop', 'mobile', 'tablet']).toContain(device)
    })

    it('加载状态应该是布尔值', () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      expect(typeof result.loading.value).toBe('boolean')
    })

    it('错误状态应该正确', () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      expect(result.error.value === null || result.error.value instanceof Error).toBe(true)
    })

    it('应该能刷新模板列表', async () => {
      const result = useTemplate({
        autoScan: false,
        autoDetectDevice: false
      })

      await result.refresh()
      expect(result.availableTemplates.value).toBeInstanceOf(Array)
    })
  })
})
