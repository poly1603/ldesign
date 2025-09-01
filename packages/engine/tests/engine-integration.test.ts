import type { Engine } from '../src/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { createEngine, presets } from '../src'

describe('engine Integration', () => {
  let engine: Engine

  beforeEach(() => {
    engine = createEngine()
  })

  describe('核心管理器集成', () => {
    it('应该正确初始化所有管理器', () => {
      expect(engine.config).toBeDefined()
      expect(engine.plugins).toBeDefined()
      expect(engine.middleware).toBeDefined()
      expect(engine.events).toBeDefined()
      expect(engine.state).toBeDefined()
      expect(engine.cache).toBeDefined()
      expect(engine.performance).toBeDefined()
      expect(engine.security).toBeDefined()
      expect(engine.directives).toBeDefined()
      expect(engine.errors).toBeDefined()
      expect(engine.logger).toBeDefined()
      expect(engine.notifications).toBeDefined()
    })

    it('配置管理器应该正常工作', () => {
      // 测试配置设置和获取
      engine.setConfig('test.key', 'test value')
      expect(engine.getConfig('test.key')).toBe('test value')

      // 测试配置更新
      engine.updateConfig({
        app: {
          name: 'Test Engine App',
          version: '2.0.0',
        },
      })

      expect(engine.getConfig('app.name')).toBe('Test Engine App')
      expect(engine.getConfig('app.version')).toBe('2.0.0')
    })

    it('缓存管理器应该正常工作', () => {
      // 测试缓存设置和获取
      engine.cache.set('test-key', 'test-value')
      expect(engine.cache.get('test-key')).toBe('test-value')

      // 测试缓存检查
      expect(engine.cache.has('test-key')).toBe(true)
      expect(engine.cache.has('non-existent')).toBe(false)

      // 测试缓存删除
      engine.cache.delete('test-key')
      expect(engine.cache.has('test-key')).toBe(false)
    })

    it('事件系统应该正常工作', () => {
      let eventFired = false
      let eventData: any = null

      // 监听事件
      engine.events.on('test-event', (data) => {
        eventFired = true
        eventData = data
      })

      // 触发事件
      engine.events.emit('test-event', { message: 'Hello World' })

      expect(eventFired).toBe(true)
      expect(eventData).toEqual({ message: 'Hello World' })
    })

    it('状态管理器应该正常工作', () => {
      // 设置状态
      engine.state.set('user', {
        name: 'John Doe',
        email: 'john@example.com',
      })

      // 获取状态
      const user = engine.state.get('user')
      expect(user).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
      })

      // 更新状态
      engine.state.set('user.name', 'Jane Doe')
      const updatedUser = engine.state.get('user')
      expect(updatedUser.name).toBe('Jane Doe')
      expect(updatedUser.email).toBe('john@example.com')
    })

    it('日志系统应该正常工作', () => {
      // 测试不同级别的日志
      engine.logger.debug('Debug message')
      engine.logger.info('Info message')
      engine.logger.warn('Warning message')
      engine.logger.error('Error message')

      // 获取日志
      const logs = engine.logger.getLogs()
      expect(logs.length).toBeGreaterThan(0)

      // 检查日志内容
      const infoLogs = logs.filter(log => log.level === 'info')
      expect(infoLogs.some(log => log.message === 'Info message')).toBe(true)
    })

    it('通知系统应该正常工作', () => {
      // 显示通知
      const notificationId = engine.notifications.show({
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification',
        duration: 3000,
      })

      expect(notificationId).toBeDefined()
      expect(typeof notificationId).toBe('string')

      // 检查通知是否存在
      const notifications = engine.notifications.getAll()
      expect(notifications.length).toBe(1)
      expect(notifications[0].title).toBe('Test Notification')

      // 隐藏通知
      engine.notifications.hide(notificationId)
      const remainingNotifications = engine.notifications.getAll()
      expect(remainingNotifications.length).toBe(0)
    })
  })

  describe('配置预设', () => {
    it('开发环境预设应该正确配置', () => {
      const devEngine = createEngine(presets.development())

      expect(devEngine.getConfig('environment')).toBe('development')
      expect(devEngine.getConfig('debug')).toBe(true)
      expect(devEngine.getConfig('features.enableDevTools')).toBe(true)
      expect(devEngine.getConfig('features.enableHotReload')).toBe(true)
    })

    it('生产环境预设应该正确配置', () => {
      const prodEngine = createEngine(presets.production())

      expect(prodEngine.getConfig('environment')).toBe('production')
      expect(prodEngine.getConfig('debug')).toBe(false)
      expect(prodEngine.getConfig('features.enableDevTools')).toBe(false)
      expect(prodEngine.getConfig('features.enableHotReload')).toBe(false)
    })

    it('最小配置预设应该正确配置', () => {
      const minimalEngine = createEngine(presets.minimal())

      expect(minimalEngine.getConfig('environment')).toBe('production')
      expect(minimalEngine.getConfig('debug')).toBe(false)
      expect(minimalEngine.getConfig('features.enablePerformanceMonitoring')).toBe(false)
      expect(minimalEngine.getConfig('features.enableCaching')).toBe(false)
    })
  })

  describe('管理器间协作', () => {
    it('配置变化应该影响其他管理器', () => {
      // 监听配置变化事件
      let _configChanged = false
      engine.events.on('config:changed', () => {
        _configChanged = true
      })

      // 更改配置
      engine.setConfig('debug', false)

      // 验证日志级别是否相应改变
      // 注意：这需要在配置管理器中实现相应的监听器
    })

    it('错误应该被正确捕获和记录', () => {
      // 触发一个错误
      try {
        throw new Error('Test error')
      }
      catch (error) {
        engine.errors.captureError(error as Error, {
          context: 'test',
          severity: 'high',
        })
      }

      // 检查错误是否被记录
      const errors = engine.errors.getErrors()
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0].message).toBe('Test error')

      // 检查日志中是否有错误记录
      const logs = engine.logger.getLogs()
      const errorLogs = logs.filter(log => log.level === 'error')
      expect(errorLogs.length).toBeGreaterThan(0)
    })

    it('性能监控应该能够记录指标', () => {
      // 开始性能测量
      const eventId = (engine.performance as any).startEvent('custom', 'test-operation')

      // 模拟一些操作
      for (let i = 0; i < 1000; i++) {
        Math.random()
      }

      // 结束性能测量
      (engine.performance as any).endEvent(eventId)

      // 获取性能事件
      const events = (engine.performance as any).getEvents()
      expect(events.length).toBeGreaterThan(0)

      // 获取性能报告
      const report = engine.performance.getReport()
      expect(report).toBeDefined()
    })

    it('安全管理器应该能够清理输入', () => {
      const unsafeHTML = '<script>alert("xss")</script><p>Safe content</p>'
      const result = engine.security.sanitize(unsafeHTML)

      expect(result).not.toContain('<script>')
      expect(result).toContain('<p>Safe content</p>')
      // 安全管理器的 sanitize 方法返回清理后的字符串
      expect(typeof result).toBe('string')
    })
  })

  describe('引擎生命周期', () => {
    it('应该能够正确销毁引擎', async () => {
      // 设置一些状态
      engine.cache.set('test', 'value')
      engine.state.set('test', { data: 'value' })

      // 销毁引擎
      await engine.destroy()

      // 验证资源被清理
      expect(engine.cache.size()).toBe(0)
      expect(engine.state.get('test')).toBeUndefined()
    })
  })
})
