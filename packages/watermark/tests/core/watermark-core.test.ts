/**
 * 水印核心类测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WatermarkCore } from '../../src/core/watermark-core'
import { createTestContainer, cleanupTestContainer, createDefaultConfig, validateWatermarkInstance } from '../utils/test-helpers'

describe('WatermarkCore', () => {
  let core: WatermarkCore
  let container: HTMLElement

  beforeEach(async () => {
    container = createTestContainer()
    core = new WatermarkCore()
    await core.init()
  })

  afterEach(async () => {
    if (core) {
      await core.dispose()
    }
    cleanupTestContainer(container)
  })

  describe('初始化', () => {
    it('应该正确初始化核心系统', async () => {
      const newCore = new WatermarkCore()
      await expect(newCore.init()).resolves.not.toThrow()
    })

    it('应该在重复初始化时不报错', async () => {
      await expect(core.init()).resolves.not.toThrow()
    })
  })

  describe('创建水印实例', () => {
    it('应该成功创建基础文字水印', async () => {
      const config = createDefaultConfig({
        content: '测试水印',
      })

      const instance = await core.create(container, config)
      
      validateWatermarkInstance(instance)
      expect(instance.config.content).toBe('测试水印')
      expect(instance.state).toBe('active')
      expect(instance.elements.length).toBeGreaterThan(0)
    })

    it('应该成功创建图片水印', async () => {
      const config = createDefaultConfig({
        content: {
          image: {
            src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            width: 100,
            height: 50,
          },
        },
      })

      const instance = await core.create(container, config)
      
      validateWatermarkInstance(instance)
      expect(instance.state).toBe('active')
    })

    it('应该支持不同的渲染模式', async () => {
      const modes = ['dom', 'canvas', 'svg'] as const

      for (const mode of modes) {
        const config = createDefaultConfig({
          content: `${mode}水印`,
          renderMode: mode,
        })

        const instance = await core.create(container, config)
        
        validateWatermarkInstance(instance)
        expect(instance.config.renderMode).toBe(mode)
        expect(instance.renderer.type).toBe(mode)
      }
    })

    it('应该在容器不存在时抛出错误', async () => {
      const invalidContainer = document.createElement('div')
      const config = createDefaultConfig()

      await expect(core.create(invalidContainer, config)).rejects.toThrow()
    })

    it('应该在配置无效时抛出错误', async () => {
      const invalidConfig = {} as any

      await expect(core.create(container, invalidConfig)).rejects.toThrow()
    })
  })

  describe('更新水印实例', () => {
    it('应该成功更新水印内容', async () => {
      const config = createDefaultConfig({ content: '原始水印' })
      const instance = await core.create(container, config)

      await core.update(instance.id, { content: '更新后的水印' })

      const updatedInstance = core.getInstance(instance.id)
      expect(updatedInstance?.config.content).toBe('更新后的水印')
    })

    it('应该成功更新样式配置', async () => {
      const config = createDefaultConfig()
      const instance = await core.create(container, config)

      await core.update(instance.id, {
        style: {
          fontSize: 24,
          color: 'red',
        },
      })

      const updatedInstance = core.getInstance(instance.id)
      expect(updatedInstance?.config.style?.fontSize).toBe(24)
      expect(updatedInstance?.config.style?.color).toBe('red')
    })

    it('应该在实例不存在时抛出错误', async () => {
      await expect(core.update('non-existent-id', {})).rejects.toThrow()
    })
  })

  describe('销毁水印实例', () => {
    it('应该成功销毁水印实例', async () => {
      const config = createDefaultConfig()
      const instance = await core.create(container, config)

      await core.destroy(instance.id)

      expect(core.getInstance(instance.id)).toBeUndefined()
      expect(container.children.length).toBe(0)
    })

    it('应该在实例不存在时不报错', async () => {
      await expect(core.destroy('non-existent-id')).resolves.not.toThrow()
    })
  })

  describe('实例管理', () => {
    it('应该正确获取实例', async () => {
      const config = createDefaultConfig()
      const instance = await core.create(container, config)

      const retrievedInstance = core.getInstance(instance.id)
      expect(retrievedInstance).toBe(instance)
    })

    it('应该正确获取所有实例', async () => {
      const config1 = createDefaultConfig({ content: '水印1' })
      const config2 = createDefaultConfig({ content: '水印2' })

      const instance1 = await core.create(container, config1)
      const instance2 = await core.create(container, config2)

      const allInstances = core.getAllInstances()
      expect(allInstances).toHaveLength(2)
      expect(allInstances).toContain(instance1)
      expect(allInstances).toContain(instance2)
    })
  })

  describe('实例控制', () => {
    it('应该成功暂停和恢复实例', async () => {
      const config = createDefaultConfig()
      const instance = await core.create(container, config)

      await core.pause(instance.id)
      expect(core.getInstance(instance.id)?.state).toBe('paused')

      await core.resume(instance.id)
      expect(core.getInstance(instance.id)?.state).toBe('active')
    })

    it('应该成功显示和隐藏实例', async () => {
      const config = createDefaultConfig()
      const instance = await core.create(container, config)

      core.hide(instance.id)
      expect(core.getInstance(instance.id)?.visible).toBe(false)

      core.show(instance.id)
      expect(core.getInstance(instance.id)?.visible).toBe(true)
    })
  })

  describe('事件系统', () => {
    it('应该正确触发创建事件', async () => {
      const createHandler = vi.fn()
      core.on('INSTANCE_CREATED', createHandler)

      const config = createDefaultConfig()
      await core.create(container, config)

      expect(createHandler).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发更新事件', async () => {
      const updateHandler = vi.fn()
      core.on('INSTANCE_UPDATED', updateHandler)

      const config = createDefaultConfig()
      const instance = await core.create(container, config)
      await core.update(instance.id, { content: '更新' })

      expect(updateHandler).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发销毁事件', async () => {
      const destroyHandler = vi.fn()
      core.on('INSTANCE_DESTROYED', destroyHandler)

      const config = createDefaultConfig()
      const instance = await core.create(container, config)
      await core.destroy(instance.id)

      expect(destroyHandler).toHaveBeenCalledTimes(1)
    })
  })

  describe('错误处理', () => {
    it('应该正确处理渲染错误', async () => {
      const errorHandler = vi.fn()
      core.on('ERROR', errorHandler)

      // 模拟渲染错误
      const invalidConfig = createDefaultConfig({
        content: {
          image: {
            src: 'invalid-image-url',
          },
        },
      })

      await expect(core.create(container, invalidConfig)).rejects.toThrow()
    })
  })

  describe('性能优化', () => {
    it('应该支持批量操作', async () => {
      const configs = Array.from({ length: 10 }, (_, i) => 
        createDefaultConfig({ content: `水印${i}` })
      )

      const instances = await Promise.all(
        configs.map(config => core.create(container, config))
      )

      expect(instances).toHaveLength(10)
      expect(core.getAllInstances()).toHaveLength(10)
    })
  })
})
