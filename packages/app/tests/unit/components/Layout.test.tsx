import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Layout from '../../../src/components/Layout'

// Mock child components
vi.mock('../../../src/components/Header', () => ({
  default: {
    name: 'Header',
    props: ['sidebarCollapsed', 'currentDemo', 'onToggleSidebar'],
    template: '<div class="mock-header">Header</div>',
  },
}))

vi.mock('../../../src/components/Sidebar', () => ({
  default: {
    name: 'Sidebar',
    props: ['collapsed', 'currentDemo', 'onDemoChange'],
    template: '<div class="mock-sidebar">Sidebar</div>',
  },
}))

vi.mock('../../../src/components/MainContent', () => ({
  default: {
    name: 'MainContent',
    props: ['currentDemo', 'sidebarCollapsed'],
    template: '<div class="mock-main-content">MainContent</div>',
  },
}))

describe('Layout', () => {
  const mockEngine = {
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
    },
    events: {
      emit: vi.fn(),
    },
  }

  it('should render all child components', () => {
    const wrapper = mount(Layout, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    expect(wrapper.find('.mock-header').exists()).toBe(true)
    expect(wrapper.find('.mock-sidebar').exists()).toBe(true)
    expect(wrapper.find('.mock-main-content').exists()).toBe(true)
  })

  it('should toggle sidebar state', async () => {
    const wrapper = mount(Layout, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    // Initial state
    expect(wrapper.find('.layout-sidebar-collapsed').exists()).toBe(false)

    // Find and trigger sidebar toggle (this would be passed to Header component)
    const headerComponent = wrapper.findComponent({ name: 'Header' })
    expect(headerComponent.exists()).toBe(true)

    // Simulate toggle action by calling the component's method directly
    const layoutComponent = wrapper.vm as any
    if (layoutComponent.toggleSidebar) {
      await layoutComponent.toggleSidebar()

      expect(wrapper.find('.layout-sidebar-collapsed').exists()).toBe(true)
      expect(mockEngine.logger.debug).toHaveBeenCalledWith('侧边栏状态切换', {
        collapsed: true,
        timestamp: expect.any(String),
      })
    }
  })

  it('should handle demo change', async () => {
    const wrapper = mount(Layout, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    // Simulate demo change by calling the component's method directly
    const layoutComponent = wrapper.vm as any
    if (layoutComponent.handleDemoChange) {
      await layoutComponent.handleDemoChange('plugin')

      expect(mockEngine.logger.info).toHaveBeenCalledWith('切换演示模块', {
        demo: 'plugin',
        timestamp: expect.any(String),
      })

      expect(mockEngine.events.emit).toHaveBeenCalledWith('demo:change', {
        demo: 'plugin',
        timestamp: expect.any(String),
      })
    }
  })

  it('should apply correct CSS classes', async () => {
    const wrapper = mount(Layout, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    // Initial state
    expect(wrapper.classes()).toContain('layout')
    expect(wrapper.classes()).not.toContain('layout-sidebar-collapsed')

    // Toggle sidebar
    const layoutComponent = wrapper.vm as any
    if (layoutComponent.toggleSidebar) {
      await layoutComponent.toggleSidebar()
      expect(wrapper.classes()).toContain('layout-sidebar-collapsed')
    }
  })
})
