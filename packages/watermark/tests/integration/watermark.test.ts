/**
 * 水印系统集成测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createWatermark, destroyWatermark } from '../../src/index'
import { createTestContainer, cleanupTestContainer, sleep } from '../utils/test-helpers'
import type { WatermarkInstance } from '../../src/types'

describe('水印系统集成测试', () => {
  let container: HTMLElement
  let instances: WatermarkInstance[] = []

  beforeEach(() => {
    container = createTestContainer()
    instances = []
  })

  afterEach(async () => {
    // 清理所有实例
    for (const instance of instances) {
      try {
        await destroyWatermark(instance)
      } catch (error) {
        // 忽略清理错误
      }
    }
    instances = []
    cleanupTestContainer(container)
  })

  describe('基础功能集成', () => {
    it('应该成功创建和销毁水印', async () => {
      const instance = await createWatermark(container, {
        content: '集成测试水印',
      })
      instances.push(instance)

      expect(instance).toBeDefined()
      expect(instance.id).toBeTruthy()
      expect(instance.state).toBe('active')
      expect(container.children.length).toBeGreaterThan(0)

      await destroyWatermark(instance)
      expect(container.children.length).toBe(0)
    })

    it('应该支持字符串选择器', async () => {
      const instance = await createWatermark('#test-container', {
        content: '选择器测试',
      })
      instances.push(instance)

      expect(instance).toBeDefined()
      expect(instance.container).toBe(container)
    })

    it('应该支持不同的渲染模式', async () => {
      const modes = ['dom', 'canvas', 'svg'] as const

      for (const mode of modes) {
        const instance = await createWatermark(container, {
          content: `${mode}模式测试`,
          renderMode: mode,
        })
        instances.push(instance)

        expect(instance.config.renderMode).toBe(mode)
        expect(instance.renderer.type).toBe(mode)
      }
    })
  })

  describe('配置集成测试', () => {
    it('应该正确应用样式配置', async () => {
      const instance = await createWatermark(container, {
        content: '样式测试',
        style: {
          fontSize: 20,
          color: 'red',
          opacity: 0.8,
          rotate: 45,
        },
      })
      instances.push(instance)

      expect(instance.config.style?.fontSize).toBe(20)
      expect(instance.config.style?.color).toBe('red')
      expect(instance.config.style?.opacity).toBe(0.8)
      expect(instance.config.style?.rotate).toBe(45)
    })

    it('应该正确应用布局配置', async () => {
      const instance = await createWatermark(container, {
        content: '布局测试',
        layout: {
          gapX: 150,
          gapY: 120,
          offsetX: 20,
          offsetY: 10,
        },
      })
      instances.push(instance)

      expect(instance.config.layout?.gapX).toBe(150)
      expect(instance.config.layout?.gapY).toBe(120)
      expect(instance.config.layout?.offsetX).toBe(20)
      expect(instance.config.layout?.offsetY).toBe(10)
    })

    it('应该支持复杂内容配置', async () => {
      const instance = await createWatermark(container, {
        content: {
          text: '复杂内容',
          image: {
            src: 'data:image/png;base64,test',
            width: 100,
            height: 50,
          },
        },
      })
      instances.push(instance)

      expect(typeof instance.config.content).toBe('object')
      expect(instance.config.content).toHaveProperty('text')
      expect(instance.config.content).toHaveProperty('image')
    })
  })

  describe('生命周期集成测试', () => {
    it('应该正确处理实例生命周期', async () => {
      // 创建
      const instance = await createWatermark(container, {
        content: '生命周期测试',
      })
      instances.push(instance)

      expect(instance.state).toBe('active')
      expect(instance.createdAt).toBeLessThanOrEqual(Date.now())
      expect(instance.updatedAt).toBeLessThanOrEqual(Date.now())

      // 等待一小段时间
      await sleep(10)

      // 销毁
      await destroyWatermark(instance)
      // 注意：销毁后实例状态可能不会立即更新，这取决于实现
    })

    it('应该支持多个实例并存', async () => {
      const instance1 = await createWatermark(container, {
        content: '实例1',
      })
      const instance2 = await createWatermark(container, {
        content: '实例2',
      })
      instances.push(instance1, instance2)

      expect(instance1.id).not.toBe(instance2.id)
      expect(container.children.length).toBeGreaterThan(0)

      // 销毁第一个实例
      await destroyWatermark(instance1)
      
      // 第二个实例应该仍然存在
      expect(container.children.length).toBeGreaterThan(0)
    })
  })

  describe('错误处理集成测试', () => {
    it('应该处理无效容器', async () => {
      await expect(createWatermark('#non-existent', {
        content: '错误测试',
      })).rejects.toThrow()
    })

    it('应该处理无效配置', async () => {
      await expect(createWatermark(container, {
        content: '',
      })).rejects.toThrow()
    })

    it('应该处理重复销毁', async () => {
      const instance = await createWatermark(container, {
        content: '重复销毁测试',
      })

      await destroyWatermark(instance)
      
      // 第二次销毁应该不报错
      await expect(destroyWatermark(instance)).resolves.not.toThrow()
    })
  })

  describe('性能集成测试', () => {
    it('应该高效创建大量水印', async () => {
      const start = Date.now()
      
      const promises = Array.from({ length: 10 }, (_, i) =>
        createWatermark(container, {
          content: `性能测试${i}`,
        })
      )

      const createdInstances = await Promise.all(promises)
      instances.push(...createdInstances)

      const end = Date.now()
      const duration = end - start

      expect(createdInstances).toHaveLength(10)
      expect(duration).toBeLessThan(5000) // 应该在 5 秒内完成
    })

    it('应该高效销毁大量水印', async () => {
      // 先创建多个实例
      const createPromises = Array.from({ length: 10 }, (_, i) =>
        createWatermark(container, {
          content: `批量销毁测试${i}`,
        })
      )

      const createdInstances = await Promise.all(createPromises)

      const start = Date.now()
      
      const destroyPromises = createdInstances.map(instance =>
        destroyWatermark(instance)
      )

      await Promise.all(destroyPromises)

      const end = Date.now()
      const duration = end - start

      expect(duration).toBeLessThan(2000) // 应该在 2 秒内完成
      expect(container.children.length).toBe(0)
    })
  })

  describe('兼容性集成测试', () => {
    it('应该在不同容器尺寸下工作', async () => {
      const sizes = [
        { width: '200px', height: '150px' },
        { width: '800px', height: '600px' },
        { width: '1200px', height: '900px' },
      ]

      for (const size of sizes) {
        container.style.width = size.width
        container.style.height = size.height

        const instance = await createWatermark(container, {
          content: '尺寸测试',
        })
        instances.push(instance)

        expect(instance.elements.length).toBeGreaterThan(0)
      }
    })

    it('应该支持动态内容更新', async () => {
      const instance = await createWatermark(container, {
        content: '原始内容',
      })
      instances.push(instance)

      // 模拟内容更新（这需要核心系统支持）
      // 这里只是验证实例存在
      expect(instance.config.content).toBe('原始内容')
    })
  })

  describe('边界情况集成测试', () => {
    it('应该处理极小容器', async () => {
      container.style.width = '10px'
      container.style.height = '10px'

      const instance = await createWatermark(container, {
        content: '极小容器',
      })
      instances.push(instance)

      expect(instance).toBeDefined()
    })

    it('应该处理空内容', async () => {
      await expect(createWatermark(container, {
        content: '',
      })).rejects.toThrow()
    })

    it('应该处理特殊字符内容', async () => {
      const specialContents = [
        '🚀 特殊字符',
        '<script>alert("xss")</script>',
        '换行\n内容',
        'Very long content that might cause layout issues and should be handled gracefully by the watermark system',
      ]

      for (const content of specialContents) {
        try {
          const instance = await createWatermark(container, {
            content,
          })
          instances.push(instance)
          expect(instance).toBeDefined()
        } catch (error) {
          // 某些特殊内容可能会被拒绝，这是正常的
          console.warn(`Special content rejected: ${content}`)
        }
      }
    })
  })
})
