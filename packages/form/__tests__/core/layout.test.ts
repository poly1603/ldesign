/**
 * @ldesign/form 布局计算器测试
 */

import { describe, it, expect } from 'vitest'
import {
  groupFieldsByLayout,
  calculateLabelWidths,
  calculateResponsiveColumns,
  type FieldConfig,
  type GroupConfig,
  type LayoutConfig
} from '../../src/core/layout/calculator'

describe('布局计算器', () => {
  describe('groupFieldsByLayout', () => {
    it('应该正确分组字段', () => {
      const fields: FieldConfig[] = [
        { name: 'name', label: '姓名', type: 'input', span: 1 },
        { name: 'age', label: '年龄', type: 'number', span: 1 },
        { name: 'email', label: '邮箱', type: 'input', span: 2 },
        { name: 'address', label: '地址', type: 'textarea', span: 2 },
        { name: 'phone', label: '电话', type: 'input', span: 1 }
      ]

      const config: GroupConfig = {
        maxColumns: 4,
        previewRows: 2,
        reservedColumns: 1
      }

      const result = groupFieldsByLayout(fields, config)

      // 第一行：name(1) + age(1) + email(2) = 4列，但保留1列给按钮，所以只能放3列
      // 实际第一行：name(1) + age(1) = 2列，email(2)放不下，换行
      // 第二行：email(2) = 2列
      // 所以前2行有3个字段：name, age, email
      expect(result.preview).toHaveLength(3) // 前2行的字段
      expect(result.more).toHaveLength(2) // 剩余字段：address, phone
      expect(result.needExpand).toBe(true)
      expect(result.actualColumns).toBe(4)
    })

    it('应该处理不可见字段', () => {
      const fields: FieldConfig[] = [
        { name: 'name', label: '姓名', type: 'input', visible: true },
        { name: 'age', label: '年龄', type: 'number', visible: false },
        { name: 'email', label: '邮箱', type: 'input', visible: true }
      ]

      const config: GroupConfig = {
        maxColumns: 4,
        previewRows: 1,
        reservedColumns: 1
      }

      const result = groupFieldsByLayout(fields, config)

      expect(result.preview).toHaveLength(2) // 只有可见字段
      expect(result.more).toHaveLength(0)
    })

    it('应该正确处理字段span', () => {
      const fields: FieldConfig[] = [
        { name: 'name', label: '姓名', type: 'input', span: 2 },
        { name: 'age', label: '年龄', type: 'number', span: 1 },
        { name: 'email', label: '邮箱', type: 'input', span: 1 }
      ]

      const config: GroupConfig = {
        maxColumns: 4,
        previewRows: 1,
        reservedColumns: 1
      }

      const result = groupFieldsByLayout(fields, config)

      // 第一行：name(2) + age(1) = 3列，可用列数是3列（4-1保留）
      // 所以第一行可以放下name(2) + age(1)
      expect(result.preview).toHaveLength(2) // name和age在第一行
      expect(result.more).toHaveLength(1) // email在第二行
    })
  })

  describe('calculateLabelWidths', () => {
    it('应该计算标题宽度', () => {
      const fields: FieldConfig[] = [
        { name: 'name', label: '姓名', type: 'input', span: 1 },
        { name: 'email', label: '电子邮箱地址', type: 'input', span: 1 },
        { name: 'age', label: '年龄', type: 'number', span: 1 }
      ]

      const labelWidths = calculateLabelWidths(fields, 3)

      expect(labelWidths).toHaveLength(3)
      expect(labelWidths[0]).toBeGreaterThan(0) // 姓名
      expect(labelWidths[1]).toBeGreaterThan(labelWidths[0]) // 电子邮箱地址应该更宽
      expect(labelWidths[2]).toBeGreaterThan(0) // 年龄
    })

    it('应该处理空标题', () => {
      const fields: FieldConfig[] = [
        { name: 'name', label: '', type: 'input', span: 1 },
        { name: 'age', type: 'number', span: 1 } // 没有label
      ]

      const labelWidths = calculateLabelWidths(fields, 2)

      expect(labelWidths).toHaveLength(2)
      expect(labelWidths[0]).toBe(0)
      expect(labelWidths[1]).toBe(0)
    })
  })

  describe('calculateResponsiveColumns', () => {
    it('应该根据容器宽度计算列数', () => {
      const config: LayoutConfig = {
        columnWidth: 300,
        minColumns: 1,
        maxColumns: 6,
        gutter: 16
      }

      // 容器宽度1000px，列宽300px + 间距16px = 316px
      // 1000 / 316 ≈ 3.16，向下取整为3
      const columns1 = calculateResponsiveColumns(1000, config)
      expect(columns1).toBe(3)

      // 容器宽度1500px
      // 1500 / 316 ≈ 4.74，向下取整为4
      const columns2 = calculateResponsiveColumns(1500, config)
      expect(columns2).toBe(4)

      // 容器宽度300px，应该至少为minColumns
      const columns3 = calculateResponsiveColumns(300, config)
      expect(columns3).toBe(1)
    })

    it('应该尊重最小和最大列数限制', () => {
      const config: LayoutConfig = {
        columnWidth: 200,
        minColumns: 2,
        maxColumns: 4,
        gutter: 16
      }

      // 很小的容器宽度，应该使用minColumns
      const columns1 = calculateResponsiveColumns(100, config)
      expect(columns1).toBe(2)

      // 很大的容器宽度，应该使用maxColumns
      const columns2 = calculateResponsiveColumns(2000, config)
      expect(columns2).toBe(4)
    })

    it('应该处理固定列数', () => {
      const config: LayoutConfig = {
        columns: 3,
        columnWidth: 200,
        minColumns: 1,
        maxColumns: 6
      }

      // 即使容器很大，也应该使用固定列数
      const columns = calculateResponsiveColumns(2000, config)
      expect(columns).toBe(3)
    })
  })
})
