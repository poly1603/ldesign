import type { NotificationManager } from '../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createNotificationHelpers,
  createNotificationManager,
} from '../src/notifications/notification-manager'

// Mock DOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn(cb => setTimeout(cb, 16)) as any as any

describe('notificationManager', () => {
  let manager: NotificationManager
  let _container: HTMLElement

  beforeEach(() => {
    // 设置 DOM 环境
    document.body.innerHTML = ''
    manager = createNotificationManager()
  })

  afterEach(() => {
    manager.destroy()
    document.body.innerHTML = ''
  })

  describe('基本功能', () => {
    it('应该能够显示通知', () => {
      const id = manager.show({
        message: '测试消息',
        type: 'info',
      })

      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
    })

    it('应该能够隐藏通知', async () => {
      const id = manager.show({
        message: '测试消息',
        type: 'info',
      })

      await manager.hide(id)

      const notifications = manager.getAll()
      expect(notifications).toHaveLength(0)
    })

    it('应该能够隐藏所有通知', async () => {
      manager.show({ message: '消息1', type: 'info' })
      manager.show({ message: '消息2', type: 'success' })
      manager.show({ message: '消息3', type: 'error' })

      await manager.hideAll()

      const notifications = manager.getAll()
      expect(notifications).toHaveLength(0)
    })

    it('应该能够获取所有可见通知', () => {
      manager.show({ message: '消息1', type: 'info' })
      manager.show({ message: '消息2', type: 'success' })

      const notifications = manager.getAll()
      expect(notifications).toHaveLength(2)

      // 通知按优先级和创建时间排序，所以顺序可能不同
      const messages = notifications.map(n => n.message)
      expect(messages).toContain('消息1')
      expect(messages).toContain('消息2')
    })
  })

  describe('位置管理', () => {
    it('应该能够设置和获取默认位置', () => {
      manager.setPosition('bottom-left')
      expect(manager.getPosition()).toBe('bottom-left')
    })

    it('应该为不同位置创建不同的容器', () => {
      manager.show({ message: '右上角', position: 'top-right' })
      manager.show({ message: '左下角', position: 'bottom-left' })

      const topRightContainer = document.getElementById(
        'engine-notifications-top-right',
      )
      const bottomLeftContainer = document.getElementById(
        'engine-notifications-bottom-left',
      )

      expect(topRightContainer).toBeTruthy()
      expect(bottomLeftContainer).toBeTruthy()
    })
  })

  describe('主题管理', () => {
    it('应该能够设置和获取主题', () => {
      manager.setTheme('dark')
      expect(manager.getTheme()).toBe('dark')
    })

    it('应该支持自动主题检测', () => {
      manager.setTheme('auto')
      expect(manager.getTheme()).toBe('auto')
    })
  })

  describe('通知限制', () => {
    it('应该能够设置最大通知数量', () => {
      manager.setMaxNotifications(2)
      expect(manager.getMaxNotifications()).toBe(2)
    })

    it('应该在超过最大数量时移除旧通知', () => {
      manager.setMaxNotifications(2)

      manager.show({ message: '消息1', position: 'top-right' })
      manager.show({ message: '消息2', position: 'top-right' })
      manager.show({ message: '消息3', position: 'top-right' })

      const notifications = manager.getAll()
      expect(notifications.length).toBeLessThanOrEqual(2)
    })
  })

  describe('持续时间管理', () => {
    it('应该能够设置默认持续时间', () => {
      manager.setDefaultDuration(5000)
      expect(manager.getDefaultDuration()).toBe(5000)
    })

    it('应该在指定时间后自动隐藏通知', async () => {
      const _id = manager.show({
        message: '自动隐藏',
        duration: 100,
      })

      // 等待超过持续时间
      await new Promise(resolve => setTimeout(resolve, 150))

      const notifications = manager.getAll()
      expect(notifications).toHaveLength(0)
    })

    it('持久通知不应该自动隐藏', async () => {
      manager.show({
        message: '持久通知',
        duration: 100,
        persistent: true,
      })

      await new Promise(resolve => setTimeout(resolve, 150))

      const notifications = manager.getAll()
      expect(notifications).toHaveLength(1)
    })
  })

  describe('统计信息', () => {
    it('应该提供正确的统计信息', () => {
      manager.show({ message: '成功', type: 'success', position: 'top-right' })
      manager.show({ message: '错误', type: 'error', position: 'bottom-left' })
      manager.show({ message: '信息', type: 'info', position: 'top-right' })

      const stats = manager.getStats()

      expect(stats.total).toBe(3)
      expect(stats.visible).toBe(3)
      expect(stats.byType.success).toBe(1)
      expect(stats.byType.error).toBe(1)
      expect(stats.byType.info).toBe(1)
      expect(stats.byPosition['top-right']).toBe(2)
      expect(stats.byPosition['bottom-left']).toBe(1)
    })
  })

  describe('回调函数', () => {
    it('应该触发 onShow 回调', () => {
      const onShow = vi.fn()

      manager.show({
        message: '测试',
        onShow,
      })

      expect(onShow).toHaveBeenCalled()
    })

    it('应该触发 onClose 回调', async () => {
      const onClose = vi.fn()

      const id = manager.show({
        message: '测试',
        onClose,
      })

      await manager.hide(id)
      expect(onClose).toHaveBeenCalled()
    })

    it('应该触发 onClick 回调', () => {
      const onClick = vi.fn()

      const id = manager.show({
        message: '测试',
        onClick,
      })

      // 模拟点击通知
      const element = document.getElementById(`notification-${id}`)
      if (element) {
        element.click()
        expect(onClick).toHaveBeenCalled()
      }
    })
  })
})

describe('notificationHelpers', () => {
  let manager: NotificationManager
  let helpers: ReturnType<typeof createNotificationHelpers>

  beforeEach(() => {
    document.body.innerHTML = ''
    manager = createNotificationManager()
    helpers = createNotificationHelpers(manager)
  })

  afterEach(() => {
    manager.destroy()
    document.body.innerHTML = ''
  })

  it('应该提供便捷的成功通知方法', () => {
    const id = helpers.success('操作成功')
    expect(id).toBeTruthy()

    const notifications = manager.getAll()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('success')
    expect(notifications[0].message).toBe('操作成功')
  })

  it('应该提供便捷的错误通知方法', () => {
    const id = helpers.error('操作失败')
    expect(id).toBeTruthy()

    const notifications = manager.getAll()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('error')
    expect(notifications[0].message).toBe('操作失败')
  })

  it('应该提供便捷的警告通知方法', () => {
    const id = helpers.warning('注意事项')
    expect(id).toBeTruthy()

    const notifications = manager.getAll()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('warning')
    expect(notifications[0].message).toBe('注意事项')
  })

  it('应该提供便捷的信息通知方法', () => {
    const id = helpers.info('提示信息')
    expect(id).toBeTruthy()

    const notifications = manager.getAll()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].type).toBe('info')
    expect(notifications[0].message).toBe('提示信息')
  })

  it('应该支持批量通知', () => {
    const ids = helpers.batch([
      { message: '消息1', type: 'info' },
      { message: '消息2', type: 'success' },
    ])

    expect(ids).toHaveLength(2)

    const notifications = manager.getAll()
    expect(notifications).toHaveLength(2)
  })

  it('应该提供确认对话框', async () => {
    const confirmPromise = helpers.confirm('确认删除吗？')

    // 模拟点击确认按钮
    setTimeout(() => {
      const confirmButton = document.querySelector(
        '.engine-notification-action',
      )
      if (confirmButton) {
        ; (confirmButton as HTMLElement).click()
      }
    }, 10)

    const result = await confirmPromise
    expect(typeof result).toBe('boolean')
  })

  it('应该提供加载通知', () => {
    const loading = helpers.loading('正在加载...')
    expect(loading.id).toBeTruthy()

    const notifications = manager.getAll()
    expect(notifications).toHaveLength(1)
    expect(notifications[0].message).toBe('正在加载...')
  })
})
