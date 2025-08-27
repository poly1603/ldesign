/**
 * SizeSwitcher 组件测试
 */

import type { SizeMode } from '../../types'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SizeSwitcher from '../../vue/SizeSwitcher'

// Mock CSS import
vi.mock('../../vue/SizeSwitcher.less', () => ({}))

// Mock composables
vi.mock('../../vue/composables', () => ({
  useSizeSwitcher: vi.fn(() => ({
    currentMode: { value: 'medium' as SizeMode },
    availableModes: ['small', 'medium', 'large'] as SizeMode[],
    setMode: vi.fn(),
    nextMode: vi.fn(),
    previousMode: vi.fn(),
    getModeDisplayName: vi.fn((mode: SizeMode) => {
      const names: Partial<Record<SizeMode, string>> = {
        'small': '小',
        'medium': '中',
        'large': '大',
        'extra-large': '超大',
      }
      return names[mode] || mode
    }),
    currentModeDisplayName: { value: '中' },
  })),
}))

// Mock utils
vi.mock('../../utils', () => ({
  getRecommendedSizeMode: vi.fn(() => 'medium' as SizeMode),
  createResponsiveSizeWatcher: vi.fn(() => vi.fn()),
}))

describe('sizeSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该正确渲染按钮样式切换器', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'button',
          showLabels: true,
        },
      })

      expect(wrapper.find('.size-switcher').exists()).toBe(true)
      expect(wrapper.find('.size-switcher--button').exists()).toBe(true)
      expect(wrapper.find('.size-switcher__buttons').exists()).toBe(true)
    })

    it('应该正确渲染选择器样式切换器', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'select',
        },
      })

      expect(wrapper.find('.size-switcher--select').exists()).toBe(true)
      expect(wrapper.find('.size-switcher__select').exists()).toBe(true)
    })

    it('应该正确渲染单选框样式切换器', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'radio',
        },
      })

      expect(wrapper.find('.size-switcher--radio').exists()).toBe(true)
      expect(wrapper.find('.size-switcher__radios').exists()).toBe(true)
    })

    it('应该正确渲染分段控制器样式切换器', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'segmented',
        },
      })

      expect(wrapper.find('.size-switcher__segmented').exists()).toBe(true)
    })

    it('应该正确渲染滑块样式切换器', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'slider',
        },
      })

      expect(wrapper.find('.size-switcher__slider').exists()).toBe(true)
    })
  })

  describe('属性配置', () => {
    it('应该支持自定义模式列表', () => {
      const modes: SizeMode[] = ['small', 'large']
      const wrapper = mount(SizeSwitcher, {
        props: {
          modes,
          switcherStyle: 'button',
        },
      })

      const buttons = wrapper.findAll('.size-switcher__button')
      expect(buttons).toHaveLength(2)
    })

    it('应该支持显示图标', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          showIcons: true,
          switcherStyle: 'button',
        },
      })

      expect(wrapper.find('.size-switcher__button-icon').exists()).toBe(true)
    })

    it('应该支持显示描述', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          showDescriptions: true,
          switcherStyle: 'button',
        },
      })

      expect(wrapper.find('.size-switcher__description').exists()).toBe(true)
    })

    it('应该支持禁用状态', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          disabled: true,
          switcherStyle: 'button',
        },
      })

      expect(wrapper.find('.size-switcher--disabled').exists()).toBe(true)

      const buttons = wrapper.findAll('.size-switcher__button')
      buttons.forEach((button) => {
        expect(button.attributes('disabled')).toBeDefined()
      })
    })

    it('应该支持不同尺寸', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          size: 'large',
        },
      })

      expect(wrapper.find('.size-switcher--large').exists()).toBe(true)
    })

    it('应该支持主题设置', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          theme: 'dark',
        },
      })

      expect(wrapper.find('.size-switcher--theme-dark').exists()).toBe(true)
    })

    it('应该支持动画设置', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          animated: true,
        },
      })

      expect(wrapper.find('.size-switcher--animated').exists()).toBe(true)
    })
  })

  describe('交互行为', () => {
    it('应该在点击按钮时触发模式变化', async () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'button',
        },
      })

      const button = wrapper.find('.size-switcher__button')
      await button.trigger('click')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('update:mode')).toBeTruthy()
    })

    it('应该在选择器变化时触发模式变化', async () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'select',
        },
      })

      const select = wrapper.find('.size-switcher__select')
      await select.setValue('large')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('update:mode')).toBeTruthy()
    })

    it('应该在单选框变化时触发模式变化', async () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'radio',
        },
      })

      const radio = wrapper.find('.size-switcher__radio')
      await radio.trigger('change')

      expect(wrapper.emitted('change')).toBeTruthy()
      expect(wrapper.emitted('update:mode')).toBeTruthy()
    })

    it('应该在禁用时不响应交互', async () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          disabled: true,
          switcherStyle: 'button',
        },
      })

      const button = wrapper.find('.size-switcher__button')
      await button.trigger('click')

      expect(wrapper.emitted('change')).toBeFalsy()
      expect(wrapper.emitted('update:mode')).toBeFalsy()
    })
  })

  describe('响应式功能', () => {
    it('应该在启用响应式时设置监听器', () => {
      const { createResponsiveSizeWatcher } = require('../../utils')

      mount(SizeSwitcher, {
        props: {
          responsive: true,
        },
      })

      expect(createResponsiveSizeWatcher).toHaveBeenCalled()
    })
  })

  describe('可访问性', () => {
    it('应该为按钮提供 title 属性', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'button',
        },
      })

      const buttons = wrapper.findAll('.size-switcher__button')
      buttons.forEach((button) => {
        expect(button.attributes('title')).toBeDefined()
      })
    })

    it('应该为单选框提供正确的 name 属性', () => {
      const wrapper = mount(SizeSwitcher, {
        props: {
          switcherStyle: 'radio',
        },
      })

      const radios = wrapper.findAll('.size-switcher__radio')
      const names = radios.map(radio => radio.attributes('name'))

      // 所有单选框应该有相同的 name
      expect(new Set(names).size).toBe(1)
    })
  })
})

describe('sizeIndicator', () => {
  it('应该正确显示当前模式', () => {
    const wrapper = mount(SizeIndicator, {
      props: {
        showMode: true,
      },
    })

    expect(wrapper.find('.size-indicator__mode').exists()).toBe(true)
    expect(wrapper.text()).toContain('当前尺寸')
  })

  it('应该支持显示比例信息', () => {
    const wrapper = mount(SizeIndicator, {
      props: {
        showScale: true,
      },
    })

    expect(wrapper.find('.size-indicator__scale').exists()).toBe(true)
  })

  it('应该支持隐藏模式显示', () => {
    const wrapper = mount(SizeIndicator, {
      props: {
        showMode: false,
      },
    })

    expect(wrapper.find('.size-indicator__mode').exists()).toBe(false)
  })
})

describe('sizeControlPanel', () => {
  it('应该同时渲染指示器和切换器', () => {
    const wrapper = mount(SizeControlPanel, {
      props: {
        showIndicator: true,
        showSwitcher: true,
      },
    })

    expect(wrapper.find('.size-control-panel__indicator').exists()).toBe(true)
    expect(wrapper.find('.size-control-panel__switcher').exists()).toBe(true)
  })

  it('应该支持隐藏指示器', () => {
    const wrapper = mount(SizeControlPanel, {
      props: {
        showIndicator: false,
        showSwitcher: true,
      },
    })

    expect(wrapper.find('.size-control-panel__indicator').exists()).toBe(false)
    expect(wrapper.find('.size-control-panel__switcher').exists()).toBe(true)
  })

  it('应该支持隐藏切换器', () => {
    const wrapper = mount(SizeControlPanel, {
      props: {
        showIndicator: true,
        showSwitcher: false,
      },
    })

    expect(wrapper.find('.size-control-panel__indicator').exists()).toBe(true)
    expect(wrapper.find('.size-control-panel__switcher').exists()).toBe(false)
  })

  it('应该传递切换器样式属性', () => {
    const wrapper = mount(SizeControlPanel, {
      props: {
        switcherStyle: 'select',
      },
    })

    const switcher = wrapper.findComponent(SizeSwitcher)
    expect(switcher.props('switcherStyle')).toBe('select')
  })

  it('应该转发变化事件', async () => {
    const wrapper = mount(SizeControlPanel)

    const switcher = wrapper.findComponent(SizeSwitcher)
    await switcher.vm.$emit('change', 'large')

    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')?.[0]).toEqual(['large'])
  })
})
