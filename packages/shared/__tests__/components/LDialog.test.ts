/**
 * LDialog 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LDialog from '../../src/components/dialog/LDialog.vue'

describe('LDialog', () => {
  beforeEach(() => {
    // 模拟 DOM 环境
    document.body.innerHTML = ''
    // 模拟 Teleport 目标
    const teleportTarget = document.createElement('div')
    teleportTarget.id = 'teleport-target'
    document.body.appendChild(teleportTarget)
  })

  it('应该正确渲染对话框', async () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        title: '测试对话框'
      },
      slots: {
        default: '<p>对话框内容</p>'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    // 由于使用了 Teleport，需要在 document.body 中查找元素
    expect(document.querySelector('.l-dialog')).toBeTruthy()
    expect(document.querySelector('.l-dialog__title')?.textContent).toBe('测试对话框')
  })

  it('应该正确显示遮罩层', async () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        showMask: true
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()
    expect(document.querySelector('.l-dialog-mask')).toBeTruthy()
  })

  it('应该正确处理关闭按钮', async () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        showClose: true
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const closeButton = document.querySelector('.l-dialog__close') as HTMLElement
    expect(closeButton).toBeTruthy()

    closeButton.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('应该正确显示头部和底部', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        showHeader: true,
        showFooter: true,
        title: '测试标题'
      }
    })

    expect(wrapper.find('.l-dialog__header').exists()).toBe(true)
    expect(wrapper.find('.l-dialog__footer').exists()).toBe(true)
  })

  it('应该正确处理确认和取消按钮', async () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        showFooter: true,
        showConfirm: true,
        showCancel: true,
        confirmText: '确定',
        cancelText: '取消'
      }
    })

    const confirmButton = wrapper.find('.l-dialog__button--confirm')
    const cancelButton = wrapper.find('.l-dialog__button--cancel')
    
    expect(confirmButton.exists()).toBe(true)
    expect(cancelButton.exists()).toBe(true)
    expect(confirmButton.text()).toBe('确定')
    expect(cancelButton.text()).toBe('取消')
    
    await confirmButton.trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
    
    await cancelButton.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('应该正确处理不同的确认按钮类型', () => {
    const types = ['primary', 'success', 'warning', 'danger'] as const
    
    types.forEach(type => {
      const wrapper = mount(LDialog, {
        props: {
          visible: true,
          showFooter: true,
          showConfirm: true,
          confirmType: type
        }
      })
      
      const confirmButton = wrapper.find('.l-dialog__button--confirm')
      expect(confirmButton.classes()).toContain(`l-dialog__button--${type}`)
    })
  })

  it('应该正确处理加载状态', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        showFooter: true,
        showConfirm: true,
        confirmLoading: true
      }
    })

    const confirmButton = wrapper.find('.l-dialog__button--confirm')
    expect(confirmButton.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.l-dialog__loading').exists()).toBe(true)
  })

  it('应该正确处理点击遮罩关闭', async () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        closeOnClickMask: true
      }
    })

    const mask = wrapper.find('.l-dialog-mask')
    await mask.trigger('click')
    expect(wrapper.emitted('mask-click')).toBeTruthy()
  })

  it('应该正确处理 ESC 键关闭', async () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        closeOnEscape: true
      }
    })

    // 模拟按下 ESC 键
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    })
    document.dispatchEvent(escapeEvent)

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('应该正确处理全屏模式', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        fullscreen: true
      }
    })

    expect(wrapper.find('.l-dialog--fullscreen').exists()).toBe(true)
  })

  it('应该正确处理居中显示', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        center: true
      }
    })

    expect(wrapper.find('.l-dialog--center').exists()).toBe(true)
  })

  it('应该正确处理可拖拽功能', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        draggable: true
      }
    })

    expect(wrapper.find('.l-dialog--draggable').exists()).toBe(true)
    expect(wrapper.find('.l-dialog__header--draggable').exists()).toBe(true)
  })

  it('应该正确处理可调整大小功能', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        resizable: true
      }
    })

    expect(wrapper.find('.l-dialog--resizable').exists()).toBe(true)
    expect(wrapper.find('.l-dialog__resize-handles').exists()).toBe(true)
  })

  it('应该正确处理自定义宽度和高度', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        width: 600,
        height: 400
      }
    })

    const dialog = wrapper.find('.l-dialog')
    const style = dialog.attributes('style')
    expect(style).toContain('width: 600px')
    expect(style).toContain('height: 400px')
  })

  it('应该正确处理动画效果', () => {
    const animations = ['fade', 'slide', 'zoom', 'bounce'] as const
    
    animations.forEach(animation => {
      const wrapper = mount(LDialog, {
        props: {
          visible: true,
          animation
        }
      })
      
      expect(wrapper.find('.l-dialog').exists()).toBe(true)
    })
  })

  it('应该正确处理锁定滚动', () => {
    const originalOverflow = document.body.style.overflow
    
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        lockScroll: true
      }
    })

    // 验证滚动被锁定
    expect(document.body.style.overflow).toBe('hidden')
    
    // 清理
    wrapper.unmount()
    document.body.style.overflow = originalOverflow
  })

  it('应该正确处理自定义类名和样式', () => {
    const wrapper = mount(LDialog, {
      props: {
        visible: true,
        dialogClass: 'custom-dialog',
        dialogStyle: { backgroundColor: 'red' },
        maskClass: 'custom-mask',
        maskStyle: { opacity: '0.8' }
      }
    })

    const dialog = wrapper.find('.l-dialog')
    const mask = wrapper.find('.l-dialog-mask')
    
    expect(dialog.classes()).toContain('custom-dialog')
    expect(dialog.attributes('style')).toContain('background-color: red')
    expect(mask.classes()).toContain('custom-mask')
    expect(mask.attributes('style')).toContain('opacity: 0.8')
  })
})
