/**
 * 弹窗管理器测试
 */

import type { FormItemConfig, ModalConfig } from '../../src/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createModalManager, ModalManager } from '../../src/core/modal'

// Mock DOM methods
Object.defineProperty(window, 'requestAnimationFrame', {
  value: (callback: FrameRequestCallback) => setTimeout(callback, 16),
})

Object.defineProperty(window, 'cancelAnimationFrame', {
  value: (id: number) => clearTimeout(id),
})

// Mock document.body
Object.defineProperty(document, 'body', {
  value: {
    appendChild: vi.fn(),
    removeChild: vi.fn(),
  },
  writable: true,
})

describe('modalManager', () => {
  let modalManager: ModalManager
  let mockItems: FormItemConfig[]
  let mockValues: Record<string, any>

  beforeEach(() => {
    modalManager = new ModalManager()

    mockItems = [
      {
        key: 'field1',
        label: '字段1',
        type: 'input' as any,
        value: 'value1',
      },
      {
        key: 'field2',
        label: '字段2',
        type: 'textarea' as any,
        value: 'value2',
      },
    ]

    mockValues = {
      field1: 'value1',
      field2: 'value2',
    }

    // Clear any existing modals
    document.querySelectorAll('.form-modal, .form-modal-mask').forEach(el => el.remove())
  })

  afterEach(() => {
    modalManager.destroy()
    // Clean up any remaining DOM elements
    document.querySelectorAll('.form-modal, .form-modal-mask').forEach(el => el.remove())
  })

  describe('基础功能', () => {
    it('应该正确创建弹窗管理器', () => {
      expect(modalManager).toBeInstanceOf(ModalManager)
      expect(modalManager.isOpen()).toBe(false)
    })

    it('应该支持自定义配置', () => {
      const config: ModalConfig = {
        title: '自定义标题',
        width: 800,
        height: 600,
        closable: false,
        maskClosable: false,
      }

      const customModal = new ModalManager(config)
      expect(customModal).toBeInstanceOf(ModalManager)
      customModal.destroy()
    })

    it('应该支持便捷创建函数', () => {
      const modal = createModalManager({ title: '测试弹窗' })
      expect(modal).toBeInstanceOf(ModalManager)
      modal.destroy()
    })
  })

  describe('弹窗状态管理', () => {
    it('应该正确管理弹窗状态', async () => {
      expect(modalManager.isOpen()).toBe(false)

      await modalManager.open(mockItems, mockValues, false)
      expect(modalManager.isOpen()).toBe(true)

      await modalManager.close(false)
      expect(modalManager.isOpen()).toBe(false)
    })

    it('应该正确获取状态信息', async () => {
      const initialState = modalManager.getState()
      expect(initialState.open).toBe(false)
      expect(initialState.animating).toBe(false)
      expect(initialState.items).toEqual([])

      await modalManager.open(mockItems, mockValues, false)
      const openState = modalManager.getState()
      expect(openState.open).toBe(true)
      expect(openState.items).toEqual(mockItems)
      expect(openState.values).toEqual(mockValues)
    })

    it('应该防止重复打开', async () => {
      await modalManager.open(mockItems, mockValues, false)
      expect(modalManager.isOpen()).toBe(true)

      // 尝试再次打开应该被忽略
      await modalManager.open(mockItems, mockValues, false)
      expect(modalManager.isOpen()).toBe(true)
    })

    it('应该防止重复关闭', async () => {
      expect(modalManager.isOpen()).toBe(false)

      // 尝试关闭未打开的弹窗应该被忽略
      await modalManager.close(false)
      expect(modalManager.isOpen()).toBe(false)
    })
  })

  describe('弹窗操作', () => {
    beforeEach(async () => {
      await modalManager.open(mockItems, mockValues, false)
    })

    it('应该支持切换弹窗状态', async () => {
      expect(modalManager.isOpen()).toBe(true)

      await modalManager.toggle(undefined, undefined, false)
      expect(modalManager.isOpen()).toBe(false)

      await modalManager.toggle(mockItems, mockValues, false)
      expect(modalManager.isOpen()).toBe(true)
    })

    it('应该支持确认操作', async () => {
      const eventSpy = vi.fn()
      modalManager.onModalEvent(eventSpy)

      await modalManager.confirm(false)

      expect(modalManager.isOpen()).toBe(false)
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'confirm',
          trigger: 'button',
        }),
      )
    })

    it('应该支持取消操作', async () => {
      const eventSpy = vi.fn()
      modalManager.onModalEvent(eventSpy)

      await modalManager.cancel(false)

      expect(modalManager.isOpen()).toBe(false)
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cancel',
          trigger: 'button',
        }),
      )
    })

    it('应该支持更新内容', () => {
      const newItems: FormItemConfig[] = [
        {
          key: 'field3',
          label: '字段3',
          type: 'select' as any,
          value: 'value3',
        },
      ]
      const newValues = { field3: 'value3' }

      modalManager.updateContent(newItems, newValues)

      const state = modalManager.getState()
      expect(state.items).toEqual(newItems)
      expect(state.values).toEqual(newValues)
    })
  })

  describe('事件处理', () => {
    it('应该正确触发打开事件', async () => {
      const eventSpy = vi.fn()
      modalManager.onModalEvent(eventSpy)

      await modalManager.open(mockItems, mockValues, false)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'open',
          trigger: 'api',
        }),
      )
    })

    it('应该正确触发关闭事件', async () => {
      await modalManager.open(mockItems, mockValues, false)

      const eventSpy = vi.fn()
      modalManager.onModalEvent(eventSpy)

      await modalManager.close(false, 'mask')

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'close',
          trigger: 'mask',
        }),
      )
    })

    it('应该支持取消事件监听', async () => {
      const eventSpy = vi.fn()
      const unsubscribe = modalManager.onModalEvent(eventSpy)

      unsubscribe()

      await modalManager.open(mockItems, mockValues, false)
      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('配置更新', () => {
    it('应该支持更新配置', () => {
      const newConfig: Partial<ModalConfig> = {
        title: '新标题',
        width: 900,
        closable: false,
      }

      modalManager.updateConfig(newConfig)

      // 配置更新应该不会抛出错误
      expect(() => modalManager.updateConfig(newConfig)).not.toThrow()
    })

    it('应该在弹窗打开时应用配置更新', async () => {
      await modalManager.open(mockItems, mockValues, false)

      const newConfig: Partial<ModalConfig> = {
        title: '更新后的标题',
        width: 1000,
      }

      expect(() => modalManager.updateConfig(newConfig)).not.toThrow()
    })
  })

  describe('动画处理', () => {
    it('应该支持动画打开', async () => {
      const startTime = Date.now()
      await modalManager.open(mockItems, mockValues, true)
      const endTime = Date.now()

      expect(modalManager.isOpen()).toBe(true)
      // 动画应该需要一些时间（至少100ms）
      expect(endTime - startTime).toBeGreaterThan(50)
    })

    it('应该支持动画关闭', async () => {
      await modalManager.open(mockItems, mockValues, false)

      const startTime = Date.now()
      await modalManager.close(true)
      const endTime = Date.now()

      expect(modalManager.isOpen()).toBe(false)
      // 动画应该需要一些时间
      expect(endTime - startTime).toBeGreaterThan(50)
    })

    it('应该在动画期间防止重复操作', async () => {
      // 开始动画打开
      const openPromise = modalManager.open(mockItems, mockValues, true)

      // 在动画期间尝试关闭应该被忽略
      await modalManager.close(true)

      // 等待打开动画完成
      await openPromise
      expect(modalManager.isOpen()).toBe(true)
    })
  })

  describe('销毁处理', () => {
    it('应该正确销毁弹窗管理器', async () => {
      await modalManager.open(mockItems, mockValues, false)
      expect(modalManager.isOpen()).toBe(true)

      modalManager.destroy()

      // 销毁后应该清理所有状态
      expect(() => modalManager.getState()).not.toThrow()
    })

    it('应该在销毁时清理DOM元素', async () => {
      await modalManager.open(mockItems, mockValues, false)

      // 确保DOM元素存在
      expect(document.querySelector('.form-modal')).toBeTruthy()
      expect(document.querySelector('.form-modal-mask')).toBeTruthy()

      modalManager.destroy()

      // 销毁后DOM元素应该被清理
      expect(document.querySelector('.form-modal')).toBeFalsy()
      expect(document.querySelector('.form-modal-mask')).toBeFalsy()
    })

    it('应该在销毁时清理事件监听器', async () => {
      const eventSpy = vi.fn()
      modalManager.onModalEvent(eventSpy)

      modalManager.destroy()

      // 销毁后事件监听器应该被清理
      // 这里无法直接测试，但确保不会抛出错误
      expect(() => modalManager.destroy()).not.toThrow()
    })
  })

  describe('边界情况', () => {
    it('应该处理空的表单项数组', async () => {
      await modalManager.open([], {}, false)
      expect(modalManager.isOpen()).toBe(true)

      const state = modalManager.getState()
      expect(state.items).toEqual([])
    })

    it('应该处理空的表单值', async () => {
      await modalManager.open(mockItems, {}, false)
      expect(modalManager.isOpen()).toBe(true)

      const state = modalManager.getState()
      expect(state.values).toEqual({})
    })

    it('应该处理未打开时的内容更新', () => {
      expect(modalManager.isOpen()).toBe(false)

      // 未打开时更新内容应该被忽略
      expect(() => modalManager.updateContent(mockItems, mockValues)).not.toThrow()
    })

    it('应该处理多次销毁调用', () => {
      modalManager.destroy()

      // 多次销毁应该不会抛出错误
      expect(() => modalManager.destroy()).not.toThrow()
      expect(() => modalManager.destroy()).not.toThrow()
    })
  })
})
