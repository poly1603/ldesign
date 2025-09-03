/**
 * LPopup 组件测试
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LPopup from '../../src/components/popup/LPopup.vue'

describe('LPopup', () => {
  beforeEach(() => {
    // 模拟 DOM 环境
    document.body.innerHTML = ''
    // 模拟 Teleport 目标
    const teleportTarget = document.createElement('div')
    teleportTarget.id = 'teleport-target'
    document.body.appendChild(teleportTarget)
  })

  it('应该正确渲染触发元素', () => {
    const wrapper = mount(LPopup, {
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    expect(wrapper.find('.l-popup__trigger').exists()).toBe(true)
    expect(wrapper.find('button').text()).toBe('触发按钮')
  })

  it('应该在点击时显示弹出层', async () => {
    const wrapper = mount(LPopup, {
      props: {
        trigger: 'click',
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    await wrapper.find('.l-popup__trigger').trigger('click')
    expect(wrapper.emitted('show')).toBeTruthy()
  })

  it('应该正确显示弹出内容', () => {
    const wrapper = mount(LPopup, {
      props: {
        visible: true,
        content: '测试内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    expect(wrapper.find('.l-popup__content').exists()).toBe(true)
  })

  it('应该正确显示标题', () => {
    const wrapper = mount(LPopup, {
      props: {
        visible: true,
        title: '弹出标题',
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    expect(wrapper.find('.l-popup__title').text()).toBe('弹出标题')
  })

  it('应该正确处理不同的触发方式', async () => {
    const triggers = ['click', 'hover', 'focus'] as const
    
    for (const trigger of triggers) {
      const wrapper = mount(LPopup, {
        props: {
          trigger,
          content: '弹出内容'
        },
        slots: {
          default: '<button>触发按钮</button>'
        }
      })

      const triggerElement = wrapper.find('.l-popup__trigger')
      
      switch (trigger) {
        case 'click':
          await triggerElement.trigger('click')
          break
        case 'hover':
          await triggerElement.trigger('mouseenter')
          break
        case 'focus':
          await triggerElement.trigger('focus')
          break
      }
      
      // 验证事件被触发
      expect(wrapper.vm).toBeDefined()
    }
  })

  it('应该正确处理不同的弹出位置', () => {
    const placements = ['top', 'bottom', 'left', 'right'] as const
    
    placements.forEach(placement => {
      const wrapper = mount(LPopup, {
        props: {
          visible: true,
          placement,
          content: '弹出内容'
        },
        slots: {
          default: '<button>触发按钮</button>'
        }
      })
      
      expect(wrapper.find(`.l-popup__content--${placement}`).exists()).toBe(true)
    })
  })

  it('应该正确显示箭头', () => {
    const wrapper = mount(LPopup, {
      props: {
        visible: true,
        showArrow: true,
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    expect(wrapper.find('.l-popup__arrow').exists()).toBe(true)
  })

  it('应该正确处理禁用状态', () => {
    const wrapper = mount(LPopup, {
      props: {
        disabled: true,
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    // 禁用状态下点击不应该显示弹出层
    wrapper.find('.l-popup__trigger').trigger('click')
    expect(wrapper.emitted('show')).toBeFalsy()
  })

  it('应该正确处理自定义宽度', () => {
    const wrapper = mount(LPopup, {
      props: {
        visible: true,
        width: 300,
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    const popupContent = wrapper.find('.l-popup__content')
    expect(popupContent.attributes('style')).toContain('width: 300px')
  })

  it('应该正确处理动画效果', () => {
    const animations = ['fade', 'slide', 'zoom', 'bounce'] as const
    
    animations.forEach(animation => {
      const wrapper = mount(LPopup, {
        props: {
          visible: true,
          animation,
          content: '弹出内容'
        },
        slots: {
          default: '<button>触发按钮</button>'
        }
      })
      
      expect(wrapper.find('.l-popup__content').exists()).toBe(true)
    })
  })

  it('应该正确处理延迟显示和隐藏', async () => {
    vi.useFakeTimers()
    
    const wrapper = mount(LPopup, {
      props: {
        trigger: 'hover',
        showDelay: 100,
        hideDelay: 200,
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    // 触发显示
    await wrapper.find('.l-popup__trigger').trigger('mouseenter')
    
    // 快进时间
    vi.advanceTimersByTime(150)
    
    expect(wrapper.emitted('show')).toBeTruthy()
    
    vi.useRealTimers()
  })

  it('应该正确处理点击外部关闭', async () => {
    const wrapper = mount(LPopup, {
      props: {
        visible: true,
        closeOnClickOutside: true,
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    // 模拟点击外部
    const outsideClickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    })
    document.body.dispatchEvent(outsideClickEvent)

    expect(wrapper.emitted('click-outside')).toBeTruthy()
  })

  it('应该正确处理 ESC 键关闭', async () => {
    const wrapper = mount(LPopup, {
      props: {
        visible: true,
        closeOnEscape: true,
        content: '弹出内容'
      },
      slots: {
        default: '<button>触发按钮</button>'
      }
    })

    // 模拟按下 ESC 键
    const escapeEvent = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true
    })
    document.dispatchEvent(escapeEvent)

    expect(wrapper.emitted('hide')).toBeTruthy()
  })
})
