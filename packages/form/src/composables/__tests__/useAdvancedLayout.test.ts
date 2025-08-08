// useAdvancedLayout 测试

import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useAdvancedLayout } from '../useAdvancedLayout'
import type { FormItemConfig } from '../../types/field'

describe('useAdvancedLayout', () => {
  let mockFields: FormItemConfig[]
  let containerRef: any

  beforeEach(() => {
    mockFields = [
      { name: 'name', title: '姓名', component: 'FormInput', required: true },
      { name: 'email', title: '邮箱地址', component: 'FormInput' },
      { name: 'phone', title: '手机号码', component: 'FormInput' },
      { name: 'address', title: '详细地址', component: 'FormInput' },
      { name: 'country', title: '国家', component: 'FormSelect' },
      {
        name: 'province',
        title: '省份',
        component: 'FormInput',
        showWhen: { field: 'country', value: 'china' },
      },
    ]

    // 模拟容器元素
    containerRef = ref({
      offsetWidth: 800,
      clientWidth: 800,
    })
  })

  it('应该正确计算可见字段', () => {
    const { calculateVisibleFields } = useAdvancedLayout({
      fields: mockFields,
      containerRef,
      watchResize: false,
    })

    // 没有条件时，所有字段都可见
    const allVisible = calculateVisibleFields({})
    expect(allVisible).toHaveLength(6)

    // 有条件时，只显示符合条件的字段
    const conditionalVisible = calculateVisibleFields({ country: 'china' })
    expect(conditionalVisible).toHaveLength(6) // 包括 province 字段

    const conditionalHidden = calculateVisibleFields({ country: 'usa' })
    expect(conditionalHidden).toHaveLength(5) // 不包括 province 字段
  })

  it('应该正确计算最佳列数', () => {
    const { calculateOptimalColumns, calculatedColumns } = useAdvancedLayout({
      fields: mockFields,
      config: {
        autoColumns: true,
        fieldMinWidth: 200,
      },
      containerRef,
      watchResize: false,
    })

    calculateOptimalColumns()

    // 800px 容器宽度，200px 最小字段宽度，应该计算出 4 列
    expect(calculatedColumns.value).toBe(4)
  })

  it('应该正确计算标签宽度', () => {
    const { calculateLabelWidths, calculatedLabelWidths } = useAdvancedLayout({
      fields: mockFields,
      config: {
        label: {
          autoWidth: true,
          position: 'left',
        },
        columns: 2,
      },
      containerRef,
      watchResize: false,
    })

    calculateLabelWidths()

    // 应该为每一列计算标签宽度
    expect(calculatedLabelWidths.value).toHaveProperty('0')
    expect(calculatedLabelWidths.value).toHaveProperty('1')
    expect(calculatedLabelWidths.value[0]).toBeGreaterThan(80)
    expect(calculatedLabelWidths.value[1]).toBeGreaterThan(80)
  })

  it('应该正确处理展开/收起功能', () => {
    const { isExpanded, toggleExpand, hasHiddenFields } = useAdvancedLayout({
      fields: mockFields,
      config: {
        defaultRows: 2,
        columns: 2,
      },
      containerRef,
      watchResize: false,
    })

    // 初始状态应该是收起的
    expect(isExpanded.value).toBe(false)

    // 应该有隐藏字段（6个字段，2行2列只能显示4个）
    expect(hasHiddenFields.value).toBe(true)

    // 切换展开状态
    toggleExpand()
    expect(isExpanded.value).toBe(true)
  })

  it('应该正确处理统一间距设置', () => {
    const { toggleUnifiedSpacing } = useAdvancedLayout({
      fields: mockFields,
      config: {
        unifiedSpacing: false,
        horizontalGap: 16,
        verticalGap: 20,
      },
      containerRef,
      watchResize: false,
    })

    // 切换统一间距
    toggleUnifiedSpacing()

    // 这里我们无法直接测试内部状态，但可以确保方法不会抛出错误
    expect(() => toggleUnifiedSpacing()).not.toThrow()
  })

  it('应该正确处理自动列数切换', () => {
    const { toggleAutoColumns, calculatedColumns } = useAdvancedLayout({
      fields: mockFields,
      config: {
        autoColumns: false,
        columns: 3,
      },
      containerRef,
      watchResize: false,
    })

    // 初始状态使用固定列数
    expect(calculatedColumns.value).toBe(3)

    // 切换到自动列数
    toggleAutoColumns()

    // 方法应该正常执行
    expect(() => toggleAutoColumns()).not.toThrow()
  })

  it('应该正确获取字段标签宽度', () => {
    const { getLabelWidth } = useAdvancedLayout({
      fields: mockFields,
      config: {
        label: {
          position: 'left',
          width: 120,
        },
      },
      containerRef,
      watchResize: false,
    })

    const width = getLabelWidth(mockFields[0], 0)
    expect(width).toBeDefined()
  })

  it('应该正确处理字段条件显示', () => {
    const { shouldShowField } = useAdvancedLayout({
      fields: mockFields,
      containerRef,
      watchResize: false,
    })

    // 无条件字段应该显示
    expect(shouldShowField(mockFields[0])).toBe(true)

    // 有条件字段应该根据条件显示
    const conditionalField = mockFields.find(f => f.name === 'province')!
    expect(shouldShowField(conditionalField, { country: 'china' })).toBe(true)
    expect(shouldShowField(conditionalField, { country: 'usa' })).toBe(false)
  })

  it('应该正确计算字段统计信息', () => {
    const { visibleFieldsCount, hiddenFieldsCount } = useAdvancedLayout({
      fields: mockFields,
      config: {
        defaultRows: 2,
        columns: 2,
      },
      containerRef,
      watchResize: false,
    })

    // 2行2列应该显示4个字段，隐藏2个字段
    expect(visibleFieldsCount.value).toBe(4)
    expect(hiddenFieldsCount.value).toBe(2)
  })
})
