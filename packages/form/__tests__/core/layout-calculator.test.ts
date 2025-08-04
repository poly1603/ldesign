import type { FormItemConfig, LayoutConfig } from '../../src/types'
import { describe, expect, it } from 'vitest'
import { LayoutCalculator } from '../../src/core/layout-calculator'

describe('layoutCalculator', () => {
  const defaultConfig: LayoutConfig = {
    defaultRows: 2,
    minColumns: 1,
    maxColumns: 4,
    columnWidth: 200,
    gap: {
      horizontal: 16,
      vertical: 16,
    },
  }

  const createItems = (count: number): FormItemConfig[] => {
    return Array.from({ length: count }, (_, i) => ({
      key: `item-${i}`,
      label: `Item ${i}`,
      type: 'input' as const,
    }))
  }

  describe('constructor and configuration', () => {
    it('should create calculator with config', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      expect(calculator).toBeInstanceOf(LayoutCalculator)
    })

    it('should update config', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateConfig({ maxColumns: 6 })

      // 通过计算结果验证配置更新
      calculator.updateContainerSize(1200)
      const columns = calculator.calculateOptimalColumns()
      expect(columns).toBeLessThanOrEqual(6)
    })

    it('should update container size', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800, 600)

      const columns = calculator.calculateOptimalColumns()
      expect(columns).toBeGreaterThan(0)
    })
  })

  describe('calculateOptimalColumns', () => {
    it('should calculate optimal columns based on container width', () => {
      const calculator = new LayoutCalculator(defaultConfig)

      // 容器宽度800px，列宽200px，间距16px
      // 理论列数: (800 - 16 + 16) / (200 + 16) ≈ 3.7 -> 3列
      const columns = calculator.calculateOptimalColumns(800)
      expect(columns).toBe(3)
    })

    it('should respect min and max columns', () => {
      const calculator = new LayoutCalculator({
        ...defaultConfig,
        minColumns: 2,
        maxColumns: 3,
      })

      expect(calculator.calculateOptimalColumns(100)).toBe(2) // 应该使用最小列数
      expect(calculator.calculateOptimalColumns(2000)).toBe(3) // 应该使用最大列数
    })

    it('should use responsive configuration when available', () => {
      const calculator = new LayoutCalculator({
        ...defaultConfig,
        responsive: {
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
        },
      })

      expect(calculator.calculateOptimalColumns(500)).toBe(1) // xs
      expect(calculator.calculateOptimalColumns(700)).toBe(2) // sm
      expect(calculator.calculateOptimalColumns(900)).toBe(3) // md
      expect(calculator.calculateOptimalColumns(1100)).toBe(4) // lg
    })
  })

  describe('calculateLayout', () => {
    it('should calculate layout for empty items', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const result = calculator.calculateLayout([])

      expect(result.totalColumns).toBe(0)
      expect(result.totalRows).toBe(0)
      expect(result.visibleRows).toBe(0)
      expect(result.items).toHaveLength(0)
      expect(result.performance.itemCount).toBe(0)
    })

    it('should calculate layout for simple items', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items = createItems(6)
      const result = calculator.calculateLayout(items)

      expect(result.totalColumns).toBe(3) // 基于800px宽度
      expect(result.totalRows).toBe(2) // 6个项目，3列，需要2行
      expect(result.items).toHaveLength(6)

      // 检查第一个项目的位置
      expect(result.items[0].row).toBe(0)
      expect(result.items[0].column).toBe(0)
      expect(result.items[0].span).toBe(1)

      // 检查第四个项目的位置（第二行第一列）
      expect(result.items[3].row).toBe(1)
      expect(result.items[3].column).toBe(0)
    })

    it('should handle items with custom span', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items: FormItemConfig[] = [
        { key: 'item-0', label: 'Item 0', type: 'input', span: 2 },
        { key: 'item-1', label: 'Item 1', type: 'input', span: 1 },
        { key: 'item-2', label: 'Item 2', type: 'input', span: 1 },
        { key: 'item-3', label: 'Item 3', type: 'input', span: 3 },
      ]

      const result = calculator.calculateLayout(items)

      // 第一个项目跨2列
      expect(result.items[0].span).toBe(2)
      expect(result.items[0].row).toBe(0)
      expect(result.items[0].column).toBe(0)

      // 第二个项目在第一行第三列
      expect(result.items[1].span).toBe(1)
      expect(result.items[1].row).toBe(0)
      expect(result.items[1].column).toBe(2)

      // 第三个项目应该换行
      expect(result.items[2].row).toBe(1)
      expect(result.items[2].column).toBe(0)

      // 第四个项目跨3列，应该在新行
      expect(result.items[3].span).toBe(3)
      expect(result.items[3].row).toBe(2)
      expect(result.items[3].column).toBe(0)
    })

    it('should limit span to max columns', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items: FormItemConfig[] = [
        { key: 'item-0', label: 'Item 0', type: 'input', span: 10 }, // 超过最大列数
      ]

      const result = calculator.calculateLayout(items)
      const columns = result.totalColumns

      expect(result.items[0].span).toBe(columns) // 应该被限制为最大列数
    })

    it('should calculate visible rows correctly', () => {
      const calculator = new LayoutCalculator({
        ...defaultConfig,
        defaultRows: 1,
      })
      calculator.updateContainerSize(800)

      const items = createItems(6)

      // 未展开状态
      const collapsedResult = calculator.calculateLayout(items, false)
      expect(collapsedResult.visibleRows).toBe(1)
      expect(collapsedResult.items.filter(item => item.visible)).toHaveLength(3) // 1行3列

      // 展开状态
      const expandedResult = calculator.calculateLayout(items, true)
      expect(expandedResult.visibleRows).toBe(2) // 显示所有行
      expect(expandedResult.items.filter(item => item.visible)).toHaveLength(6) // 所有项目
    })

    it('should calculate action button position', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items = createItems(5) // 5个项目，3列，最后一行有2个项目
      const result = calculator.calculateLayout(items)

      expect(result.actionButton).toBeDefined()
      expect(result.actionButton!.row).toBe(1) // 第二行
      expect(result.actionButton!.column).toBe(2) // 第三列
      expect(result.actionButton!.span).toBe(1) // 占用剩余的1列
    })

    it('should include performance metrics', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items = createItems(10)
      const result = calculator.calculateLayout(items)

      expect(result.performance.calculationTime).toBeGreaterThan(0)
      expect(result.performance.itemCount).toBe(10)
      expect(result.performance.hiddenCount).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getVisibleItems and getHiddenItems', () => {
    it('should return correct visible items when collapsed', () => {
      const calculator = new LayoutCalculator({
        ...defaultConfig,
        defaultRows: 1,
      })
      calculator.updateContainerSize(800) // 3列

      const items = createItems(6)
      const visibleItems = calculator.getVisibleItems(items, false)

      expect(visibleItems).toHaveLength(3) // 1行 × 3列 = 3个项目
      expect(visibleItems[0].key).toBe('item-0')
      expect(visibleItems[2].key).toBe('item-2')
    })

    it('should return all items when expanded', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items = createItems(6)
      const visibleItems = calculator.getVisibleItems(items, true)

      expect(visibleItems).toHaveLength(6)
      expect(visibleItems).toEqual(items)
    })

    it('should return correct hidden items', () => {
      const calculator = new LayoutCalculator({
        ...defaultConfig,
        defaultRows: 1,
      })
      calculator.updateContainerSize(800) // 3列

      const items = createItems(6)
      const hiddenItems = calculator.getHiddenItems(items, false)

      expect(hiddenItems).toHaveLength(3) // 剩余3个项目
      expect(hiddenItems[0].key).toBe('item-3')
      expect(hiddenItems[2].key).toBe('item-5')
    })

    it('should return empty array for hidden items when expanded', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const items = createItems(6)
      const hiddenItems = calculator.getHiddenItems(items, true)

      expect(hiddenItems).toHaveLength(0)
    })
  })

  describe('calculateItemSize', () => {
    it('should calculate item size correctly', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const item: FormItemConfig = {
        key: 'test',
        label: 'Test',
        type: 'input',
      }

      const position = {
        key: 'test',
        row: 0,
        column: 0,
        span: 1,
        width: 0,
        height: 0,
        visible: true,
      }

      const size = calculator.calculateItemSize(item, position)

      expect(size.width).toBeGreaterThan(0)
      expect(size.height).toBe(60) // 默认高度
    })

    it('should calculate size for spanning items', () => {
      const calculator = new LayoutCalculator(defaultConfig)
      calculator.updateContainerSize(800)

      const item: FormItemConfig = {
        key: 'test',
        label: 'Test',
        type: 'input',
        span: 2,
      }

      const position = {
        key: 'test',
        row: 0,
        column: 0,
        span: 2,
        width: 0,
        height: 0,
        visible: true,
      }

      const size = calculator.calculateItemSize(item, position)
      const singleSize = calculator.calculateItemSize(
        { ...item, span: 1 },
        { ...position, span: 1 },
      )

      // 跨2列的项目宽度应该大于单列项目
      expect(size.width).toBeGreaterThan(singleSize.width)
    })
  })
})
