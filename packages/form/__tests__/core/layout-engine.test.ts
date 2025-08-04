import type { FormItemConfig, FormState, LayoutEngineConfig } from '../../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createLayoutEngine, LayoutEngine } from '../../src/core/layout-engine'

describe('layoutEngine', () => {
  let container: HTMLElement
  let engine: LayoutEngine
  let config: LayoutEngineConfig

  beforeEach(() => {
    container = document.createElement('div')
    container.style.width = '800px'
    container.style.height = '600px'
    document.body.appendChild(container)

    config = {
      layout: {
        defaultRows: 2,
        minColumns: 1,
        maxColumns: 4,
        columnWidth: 200,
        gap: {
          horizontal: 16,
          vertical: 16,
        },
      },
      display: {
        labelPosition: 'left',
        labelWidth: 80,
        showExpandButton: true,
        expandMode: 'inline',
      },
      debounceDelay: 50,
    }

    engine = new LayoutEngine(container, config)
  })

  afterEach(() => {
    engine.destroy()
    document.body.removeChild(container)
  })

  const createTestItems = (count: number): FormItemConfig[] => {
    return Array.from({ length: count }, (_, i) => ({
      key: `item-${i}`,
      label: `Item ${i}`,
      type: 'input' as const,
    }))
  }

  const createTestState = (expanded = false): FormState => ({
    values: {},
    layout: {
      containerWidth: 800,
      columns: 3,
      rows: 2,
      expanded,
      modalOpen: false,
    },
    validation: {
      errors: {},
      validating: new Set(),
      touched: new Set(),
    },
    interaction: {
      readonly: false,
      disabled: new Set(),
      focused: null,
    },
    groups: {},
  })

  describe('constructor and configuration', () => {
    it('should create layout engine with config', () => {
      expect(engine).toBeInstanceOf(LayoutEngine)
    })

    it('should create layout engine with createLayoutEngine helper', () => {
      const testEngine = createLayoutEngine(container, config)
      expect(testEngine).toBeInstanceOf(LayoutEngine)
      testEngine.destroy()
    })

    it('should update config', () => {
      const newConfig = {
        layout: { maxColumns: 6 },
        display: { labelPosition: 'top' as const },
      }

      engine.updateConfig(newConfig)

      // 通过渲染验证配置更新
      const items = createTestItems(2)
      const state = createTestState()

      engine.render(items, state)

      const labels = container.querySelectorAll('.form-item-label-top')
      expect(labels.length).toBe(2)
    })
  })

  describe('render', () => {
    it('should render form items', () => {
      const items = createTestItems(4)
      const state = createTestState()

      engine.render(items, state)

      expect(container.children.length).toBe(4)
      expect(container.querySelector('[data-key="item-0"]')).toBeTruthy()
      expect(container.querySelector('[data-key="item-3"]')).toBeTruthy()
    })

    it('should update container size in state', () => {
      const items = createTestItems(2)
      const state = createTestState()

      engine.render(items, state)

      expect(state.layout.containerWidth).toBe(800)
      expect(state.layout.columns).toBeGreaterThan(0)
      expect(state.layout.rows).toBeGreaterThan(0)
    })

    it('should handle empty items', () => {
      const state = createTestState()

      expect(() => {
        engine.render([], state)
      }).not.toThrow()

      expect(container.children.length).toBe(0)
    })
  })

  describe('layout calculations', () => {
    it('should calculate optimal columns', () => {
      const columns = engine.calculateOptimalColumns(800)
      expect(columns).toBeGreaterThan(0)
      expect(columns).toBeLessThanOrEqual(4) // maxColumns
    })

    it('should get visible and hidden items', () => {
      const items = createTestItems(8)

      const visibleItems = engine.getVisibleItems(items, false)
      const hiddenItems = engine.getHiddenItems(items, false)

      expect(visibleItems.length + hiddenItems.length).toBe(items.length)
      expect(visibleItems.length).toBeGreaterThan(0)

      // 展开状态下应该显示所有项目
      const allVisible = engine.getVisibleItems(items, true)
      const noneHidden = engine.getHiddenItems(items, true)

      expect(allVisible.length).toBe(items.length)
      expect(noneHidden.length).toBe(0)
    })

    it('should check if expand button is needed', () => {
      const fewItems = createTestItems(2)
      const manyItems = createTestItems(10)

      expect(engine.needsExpandButton(fewItems)).toBe(false)
      expect(engine.needsExpandButton(manyItems)).toBe(true)
    })
  })

  describe('form item operations', () => {
    beforeEach(() => {
      const items = createTestItems(2)
      const state = createTestState()
      engine.render(items, state)
    })

    it('should update form item', () => {
      engine.updateFormItem('item-0', 'new value', ['Error message'])

      const input = container.querySelector('[data-key="item-0"] input') as HTMLInputElement
      expect(input.value).toBe('new value')

      const wrapper = container.querySelector('[data-key="item-0"]')
      expect(wrapper).toHaveClass('has-error')
    })

    it('should get form item value', () => {
      const input = container.querySelector('[data-key="item-0"] input') as HTMLInputElement
      input.value = 'test value'

      const value = engine.getFormItemValue('item-0')
      expect(value).toBe('test value')
    })

    it('should focus form item', () => {
      const input = container.querySelector('[data-key="item-0"] input') as HTMLInputElement
      const focusSpy = vi.spyOn(input, 'focus')

      engine.focusFormItem('item-0')

      expect(focusSpy).toHaveBeenCalled()
    })
  })

  describe('resize handling', () => {
    it('should handle resize', () => {
      const items = createTestItems(4)
      const state = createTestState()
      engine.render(items, state)

      const initialLayout = engine.getCurrentLayout()

      // 模拟容器尺寸变化
      container.style.width = '1200px'

      engine.handleResize()

      const newLayout = engine.getCurrentLayout()
      expect(newLayout).not.toEqual(initialLayout)
    })

    it('should call resize listener', () => {
      const resizeListener = vi.fn()
      engine.onResizeListener(resizeListener)

      const items = createTestItems(2)
      const state = createTestState()
      engine.render(items, state)

      engine.handleResize()

      expect(resizeListener).toHaveBeenCalledWith(800, 600)
    })

    it('should call layout change listener', () => {
      const layoutChangeListener = vi.fn()
      engine.onLayoutChangeListener(layoutChangeListener)

      const items = createTestItems(4)
      const state = createTestState()

      engine.render(items, state)

      expect(layoutChangeListener).toHaveBeenCalledWith({
        containerWidth: 800,
        containerHeight: 600,
        columns: expect.any(Number),
        rows: expect.any(Number),
        visibleRows: expect.any(Number),
      })
    })
  })

  describe('updateLayout', () => {
    it('should update layout without full re-render', () => {
      const items = createTestItems(4)
      const state = createTestState()
      engine.render(items, state)

      const renderSpy = vi.spyOn(engine, 'render')

      // 更新布局（不改变列数）
      engine.updateLayout()

      // 应该不会调用完整的render
      expect(renderSpy).not.toHaveBeenCalled()
    })

    it('should re-render when columns change', () => {
      const items = createTestItems(4)
      const state = createTestState()
      engine.render(items, state)

      // 模拟容器宽度大幅变化，导致列数改变
      container.style.width = '400px'

      const renderSpy = vi.spyOn(engine, 'render')
      engine.updateLayout()

      // 列数变化时应该重新渲染
      expect(renderSpy).toHaveBeenCalled()
    })

    it('should handle updateLayout without items', () => {
      expect(() => {
        engine.updateLayout()
      }).not.toThrow()
    })
  })

  describe('utility methods', () => {
    it('should get container size', () => {
      const size = engine.getContainerSize()
      expect(size.width).toBe(800)
      expect(size.height).toBe(600)
    })

    it('should get current layout', () => {
      expect(engine.getCurrentLayout()).toBeNull()

      const items = createTestItems(2)
      const state = createTestState()
      engine.render(items, state)

      const layout = engine.getCurrentLayout()
      expect(layout).toBeTruthy()
      expect(layout?.items).toHaveLength(2)
    })
  })

  describe('destroy', () => {
    it('should clean up when destroyed', () => {
      const items = createTestItems(2)
      const state = createTestState()
      engine.render(items, state)

      expect(container.children.length).toBe(2)
      expect(engine.getCurrentLayout()).toBeTruthy()

      engine.destroy()

      expect(container.children.length).toBe(0)
      expect(engine.getCurrentLayout()).toBeNull()
    })

    it('should disconnect resize observer', () => {
      const disconnectSpy = vi.fn()
      // 模拟ResizeObserver
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: disconnectSpy,
      }

      // 这里我们无法直接测试ResizeObserver的断开，
      // 但可以确保destroy方法不会抛出错误
      expect(() => {
        engine.destroy()
      }).not.toThrow()
    })
  })

  describe('responsive behavior', () => {
    it('should adapt to different container sizes', () => {
      const items = createTestItems(6)
      const state = createTestState()

      // 小容器
      container.style.width = '400px'
      engine.render(items, state)
      const smallLayout = engine.getCurrentLayout()

      // 大容器
      container.style.width = '1200px'
      engine.render(items, state)
      const largeLayout = engine.getCurrentLayout()

      // 大容器应该有更多列
      expect(largeLayout?.totalColumns).toBeGreaterThanOrEqual(smallLayout?.totalColumns || 0)
    })

    it('should handle responsive configuration', () => {
      const responsiveConfig = {
        ...config,
        layout: {
          ...config.layout,
          responsive: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
          },
        },
      }

      const responsiveEngine = new LayoutEngine(container, responsiveConfig)

      // 测试不同宽度下的列数
      expect(responsiveEngine.calculateOptimalColumns(500)).toBe(1) // xs
      expect(responsiveEngine.calculateOptimalColumns(700)).toBe(2) // sm
      expect(responsiveEngine.calculateOptimalColumns(900)).toBe(3) // md
      expect(responsiveEngine.calculateOptimalColumns(1100)).toBe(4) // lg

      responsiveEngine.destroy()
    })
  })

  describe('debounce behavior', () => {
    it('should debounce resize events', async () => {
      const resizeListener = vi.fn()
      engine.onResizeListener(resizeListener)

      const items = createTestItems(2)
      const state = createTestState()
      engine.render(items, state)

      // 快速连续调用resize
      engine.handleResize()
      engine.handleResize()
      engine.handleResize()

      // 立即检查，由于防抖，监听器可能还没被调用
      expect(resizeListener).toHaveBeenCalledTimes(1) // render时调用一次

      // 等待防抖延迟
      await new Promise(resolve => setTimeout(resolve, 100))

      // 防抖后应该只调用一次额外的resize
      expect(resizeListener).toHaveBeenCalledTimes(2)
    })
  })
})
