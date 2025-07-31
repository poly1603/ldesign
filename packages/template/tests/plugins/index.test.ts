import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { TemplatePlugin, getGlobalTemplateManager, destroyGlobalTemplateManager } from '@/vue/plugins'

describe('TemplatePlugin', () => {
  let app: any

  beforeEach(() => {
    app = createApp({})
  })

  afterEach(() => {
    destroyGlobalTemplateManager()
  })

  describe('插件安装', () => {
    it('应该能够安装插件', () => {
      expect(() => {
        app.use(TemplatePlugin)
      }).not.toThrow()
    })

    it('应该能够使用配置安装插件', () => {
      expect(() => {
        app.use(TemplatePlugin, {
          defaultDevice: 'mobile',
          autoScan: false,
          autoDetectDevice: false
        })
      }).not.toThrow()
    })

    it('应该注册全局组件', () => {
      app.use(TemplatePlugin)
      
      // 检查全局组件是否已注册
      expect(app._context.components.LTemplateRenderer).toBeDefined()
    })

    it('应该注册全局指令', () => {
      app.use(TemplatePlugin)
      
      // 检查全局指令是否已注册
      expect(app._context.directives.template).toBeDefined()
    })
  })

  describe('全局管理器', () => {
    it('应该能获取全局模板管理器', () => {
      app.use(TemplatePlugin)
      
      const manager = getGlobalTemplateManager()
      expect(manager).toBeDefined()
      expect(typeof manager.scanTemplates).toBe('function')
    })

    it('应该能销毁全局模板管理器', () => {
      app.use(TemplatePlugin)
      
      const manager = getGlobalTemplateManager()
      expect(manager).toBeDefined()
      
      destroyGlobalTemplateManager()
      
      // 销毁后应该创建新的实例
      const newManager = getGlobalTemplateManager()
      expect(newManager).toBeDefined()
      expect(newManager).not.toBe(manager)
    })
  })

  describe('插件配置', () => {
    it('应该使用默认配置', () => {
      app.use(TemplatePlugin)
      
      const manager = getGlobalTemplateManager()
      expect(manager).toBeDefined()
    })

    it('应该应用自定义配置', () => {
      const customConfig = {
        defaultDevice: 'tablet' as const,
        autoScan: false,
        autoDetectDevice: false
      }
      
      app.use(TemplatePlugin, customConfig)
      
      const manager = getGlobalTemplateManager()
      expect(manager).toBeDefined()
    })
  })

  describe('多次安装', () => {
    it('应该防止重复安装', () => {
      app.use(TemplatePlugin)
      
      // 第二次安装应该不会出错
      expect(() => {
        app.use(TemplatePlugin)
      }).not.toThrow()
    })
  })
})
