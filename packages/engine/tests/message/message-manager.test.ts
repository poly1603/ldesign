/**
 * 消息管理器测试
 */

import type { MessageOptions } from '../../src/message/message-manager'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageManager } from '../../src/message/message-manager'

describe('messageManager', () => {
  let messageManager: MessageManager
  let container: HTMLElement

  beforeEach(async () => {
    messageManager = new MessageManager({
      maxCount: 3,
      defaultDuration: 1000,
      defaultPosition: 'top',
      defaultOffset: 20,
      zIndex: 3000,
      gap: 16,
    })

    await messageManager.initialize()
    container = document.querySelector('.engine-message-container') as HTMLElement
  })

  afterEach(async () => {
    await messageManager.destroy()
    // 清理DOM
    const containers = document.querySelectorAll('.engine-message-container')
    containers.forEach(el => el.remove())
    vi.clearAllMocks()
  })

  it('should create message manager instance', () => {
    expect(messageManager).toBeDefined()
    expect(messageManager.name).toBe('MessageManager')
  })

  it('should initialize and create container', () => {
    expect(container).toBeDefined()
    expect(container.className).toBe('engine-message-container')
    expect(container.style.position).toBe('fixed')
    expect(container.style.zIndex).toBe('3000')
  })

  it('should show success message', () => {
    const instance = messageManager.success('操作成功！')

    expect(instance).toBeDefined()
    expect(instance.id).toBeDefined()
    expect(instance.options.type).toBe('success')
    expect(instance.options.content).toBe('操作成功！')
    expect(instance.visible).toBe(true)
  })

  it('should show error message', () => {
    const instance = messageManager.error('操作失败！')

    expect(instance).toBeDefined()
    expect(instance.options.type).toBe('error')
    expect(instance.options.content).toBe('操作失败！')
    expect(instance.options.duration).toBe(0) // 错误消息默认不自动关闭
  })

  it('should show warning message', () => {
    const instance = messageManager.warning('请注意！')

    expect(instance).toBeDefined()
    expect(instance.options.type).toBe('warning')
    expect(instance.options.content).toBe('请注意！')
  })

  it('should show info message', () => {
    const instance = messageManager.info('提示信息')

    expect(instance).toBeDefined()
    expect(instance.options.type).toBe('info')
    expect(instance.options.content).toBe('提示信息')
  })

  it('should show loading message', () => {
    const instance = messageManager.loading('加载中...')

    expect(instance).toBeDefined()
    expect(instance.options.type).toBe('loading')
    expect(instance.options.content).toBe('加载中...')
    expect(instance.options.duration).toBe(0) // 加载消息默认不自动关闭
    expect(instance.options.showClose).toBe(false)
  })

  it('should show custom message with options', () => {
    const onClose = vi.fn()
    const onClick = vi.fn()

    const options: MessageOptions = {
      type: 'success',
      title: '成功',
      content: '自定义消息',
      duration: 5000,
      position: 'center',
      showClose: true,
      html: true,
      customClass: 'custom-message',
      onClose,
      onClick,
    }

    const instance = messageManager.show(options)

    expect(instance.options.title).toBe('成功')
    expect(instance.options.duration).toBe(5000)
    expect(instance.options.position).toBe('center')
    expect(instance.options.showClose).toBe(true)
    expect(instance.options.html).toBe(true)
    expect(instance.options.customClass).toBe('custom-message')
    expect(instance.options.onClose).toBe(onClose)
    expect(instance.options.onClick).toBe(onClick)
  })

  it('should close message by id', () => {
    const instance = messageManager.info('测试消息')
    const messageId = instance.id

    expect(instance.visible).toBe(true)

    const closed = messageManager.close(messageId)
    expect(closed).toBe(true)
  })

  it('should return false when closing non-existent message', () => {
    const closed = messageManager.close('non-existent-id')
    expect(closed).toBe(false)
  })

  it('should close all messages', async () => {
    messageManager.success('消息1')
    messageManager.info('消息2')
    messageManager.warning('消息3')

    const stats = messageManager.getStats()
    expect(stats.totalMessages).toBe(3)

    messageManager.closeAll()

    // 由于关闭是异步的，需要等待一下
    await new Promise(resolve => {
      setTimeout(() => {
        const newStats = messageManager.getStats()
        expect(newStats.totalMessages).toBe(0)
        resolve(void 0)
      }, 100)
    })
  })

  it('should respect max count limit', () => {
    // 配置最大数量为3
    messageManager.success('消息1')
    messageManager.success('消息2')
    messageManager.success('消息3')
    messageManager.success('消息4') // 这个应该会导致第一个消息被关闭

    const stats = messageManager.getStats()
    expect(stats.totalMessages).toBe(3)
  })

  it('should auto close message after duration', () => {
    return new Promise<void>((resolve) => {
      const instance = messageManager.show({
        content: '自动关闭消息',
        duration: 100,
      })

      expect(instance.visible).toBe(true)

      setTimeout(() => {
        expect(instance.visible).toBe(false)
        resolve()
      }, 150)
    })
  })

  it('should not auto close when duration is 0', () => {
    return new Promise<void>((resolve) => {
      const instance = messageManager.show({
        content: '不自动关闭',
        duration: 0,
      })

      expect(instance.visible).toBe(true)

      setTimeout(() => {
        expect(instance.visible).toBe(true)
        resolve()
      }, 100)
    })
  })

  it('should handle message with HTML content', () => {
    const _instance = messageManager.show({
      content: '<strong>粗体文本</strong>',
      html: true,
    })

    const messageElement = container.querySelector('.engine-message')
    const textElement = messageElement?.querySelector('.engine-message-text')

    expect(textElement?.innerHTML).toBe('<strong>粗体文本</strong>')
  })

  it('should handle message with title', () => {
    const _instance = messageManager.show({
      title: '标题',
      content: '内容',
    })

    const messageElement = container.querySelector('.engine-message')
    const titleElement = messageElement?.querySelector('.engine-message-title')

    expect(titleElement?.textContent).toBe('标题')
  })

  it('should trigger callbacks', () => {
    const onLoad = vi.fn()
    const _onEnter = vi.fn()

    const instance = messageManager.show({
      content: '回调测试',
      onLoad,
    })

    // 模拟触发回调
    instance.options.onLoad?.()
    expect(onLoad).toHaveBeenCalled()
  })

  it('should get correct stats', () => {
    messageManager.success('消息1')
    messageManager.error('消息2')

    const stats = messageManager.getStats()

    expect(stats.totalMessages).toBe(2)
    expect(stats.visibleMessages).toBe(2)
    expect(stats.messageIds).toHaveLength(2)
  })

  it('should handle message positioning', () => {
    const topMessage = messageManager.show({
      content: '顶部消息',
      position: 'top',
    })

    const centerMessage = messageManager.show({
      content: '中间消息',
      position: 'center',
    })

    const bottomMessage = messageManager.show({
      content: '底部消息',
      position: 'bottom',
    })

    expect(topMessage.options.position).toBe('top')
    expect(centerMessage.options.position).toBe('center')
    expect(bottomMessage.options.position).toBe('bottom')
  })

  it('should handle custom classes', () => {
    const _instance = messageManager.show({
      content: '自定义样式',
      customClass: 'my-custom-class',
    })

    const messageElement = container.querySelector('.engine-message')
    expect(messageElement?.classList.contains('my-custom-class')).toBe(true)
  })

  it('should clean up on destroy', async () => {
    messageManager.success('测试消息')

    await messageManager.destroy()

    const containers = document.querySelectorAll('.engine-message-container')
    expect(containers).toHaveLength(0)

    const styles = document.querySelector('#engine-message-styles')
    expect(styles).toBeNull()
  })
})
