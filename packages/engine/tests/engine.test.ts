import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createEngine, Engine, EngineState } from '../src/core/engine'
import { createPlugin } from '../src/core/plugin'
import type { IPlugin } from '../src/types'

describe('Engine', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createEngine({ debug: true })
  })

  describe('创建和初始化', () => {
    it('应该创建引擎实例', () => {
      expect(engine).toBeInstanceOf(Engine)
      expect(engine.version).toBe('1.0.0')
      expect(engine.getState()).toBe(EngineState.IDLE)
    })

    it('应该有事件总线和生命周期管理器', () => {
      expect(engine.eventBus).toBeDefined()
      expect(engine.lifecycle).toBeDefined()
    })
  })

  describe('插件管理', () => {
    it('应该能够安装插件', async () => {
      const plugin = createPlugin(
        'test-plugin',
        '1.0.0',
        (engine) => {
          // 插件安装逻辑
        }
      )

      await engine.use(plugin)
      expect(engine.getPlugin('test-plugin')).toBe(plugin)
      expect(engine.getPlugins()).toContain(plugin)
    })

    it('应该能够卸载插件', async () => {
      const plugin = createPlugin(
        'test-plugin',
        '1.0.0',
        (engine) => {
          // 插件安装逻辑
        },
        {
          uninstaller: (engine) => {
            // 插件卸载逻辑
          }
        }
      )

      await engine.use(plugin)
      expect(engine.getPlugin('test-plugin')).toBe(plugin)

      await engine.unuse('test-plugin')
      expect(engine.getPlugin('test-plugin')).toBeUndefined()
    })

    it('应该检查插件依赖', async () => {
      const dependencyPlugin = createPlugin(
        'dependency-plugin',
        '1.0.0',
        () => {}
      )

      const mainPlugin = createPlugin(
        'main-plugin',
        '1.0.0',
        () => {},
        {
          dependencies: ['dependency-plugin']
        }
      )

      // 没有安装依赖时应该抛出错误
      await expect(engine.use(mainPlugin)).rejects.toThrow()

      // 安装依赖后应该成功
      await engine.use(dependencyPlugin)
      await expect(engine.use(mainPlugin)).resolves.not.toThrow()
    })

    it('应该防止重复安装插件', async () => {
      const plugin = createPlugin(
        'test-plugin',
        '1.0.0',
        () => {}
      )

      await engine.use(plugin)
      await engine.use(plugin) // 重复安装应该被忽略
      
      expect(engine.getPlugins().filter(p => p.name === 'test-plugin')).toHaveLength(1)
    })

    it('应该防止卸载被依赖的插件', async () => {
      const dependencyPlugin = createPlugin(
        'dependency-plugin',
        '1.0.0',
        () => {}
      )

      const mainPlugin = createPlugin(
        'main-plugin',
        '1.0.0',
        () => {},
        {
          dependencies: ['dependency-plugin']
        }
      )

      await engine.use(dependencyPlugin)
      await engine.use(mainPlugin)

      // 尝试卸载被依赖的插件应该抛出错误
      await expect(engine.unuse('dependency-plugin')).rejects.toThrow()
    })
  })

  describe('生命周期管理', () => {
    it('应该能够启动引擎', async () => {
      await engine.start()
      expect(engine.getState()).toBe(EngineState.RUNNING)
    })

    it('应该能够停止引擎', async () => {
      await engine.start()
      await engine.stop()
      expect(engine.getState()).toBe(EngineState.STOPPED)
    })

    it('应该能够销毁引擎', async () => {
      await engine.start()
      await engine.destroy()
      expect(engine.getState()).toBe(EngineState.DESTROYED)
    })

    it('应该在启动时触发生命周期事件', async () => {
      const beforeStartSpy = vi.fn()
      const startedSpy = vi.fn()

      engine.eventBus.on('engine:before-start', beforeStartSpy)
      engine.eventBus.on('engine:started', startedSpy)

      await engine.start()

      expect(beforeStartSpy).toHaveBeenCalled()
      expect(startedSpy).toHaveBeenCalled()
    })

    it('应该在停止时触发生命周期事件', async () => {
      const beforeStopSpy = vi.fn()
      const stoppedSpy = vi.fn()

      engine.eventBus.on('engine:before-stop', beforeStopSpy)
      engine.eventBus.on('engine:stopped', stoppedSpy)

      await engine.start()
      await engine.stop()

      expect(beforeStopSpy).toHaveBeenCalled()
      expect(stoppedSpy).toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该处理插件安装错误', async () => {
      const faultyPlugin = createPlugin(
        'faulty-plugin',
        '1.0.0',
        () => {
          throw new Error('Installation failed')
        }
      )

      await expect(engine.use(faultyPlugin)).rejects.toThrow('Installation failed')
      expect(engine.getPlugin('faulty-plugin')).toBeUndefined()
    })

    it('应该处理状态错误', async () => {
      await engine.start()
      
      // 尝试重复启动应该抛出错误
      await expect(engine.start()).rejects.toThrow()
    })
  })
})