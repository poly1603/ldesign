/**
 * 查询表单修复效果验证测试
 * 
 * 验证：
 * 1. 默认显示行数修复（从 2 行改为 1 行）
 * 2. 内联按钮组布局逻辑修复
 * 3. 响应式监听机制修复（使用 ResizeObserver 而不是 window resize）
 * 4. JavaScript 和 Vue 版本行为一致性
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// 模拟浏览器环境
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="queryForm"></div></body></html>')
global.window = dom.window
global.document = dom.window.document
global.HTMLElement = dom.window.HTMLElement
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
}))

// 导入查询表单类（需要在设置环境后导入）
const { DynamicQueryForm } = await import('../../src/core/query-form.ts')

describe('查询表单修复效果验证', () => {
  let container
  let queryForm
  
  const mockFields = [
    { name: 'username', label: '用户名', type: 'input' },
    { name: 'email', label: '邮箱', type: 'input' },
    { name: 'status', label: '状态', type: 'select', options: [{ label: '全部', value: '' }] },
    { name: 'createTime', label: '创建时间', type: 'date' },
    { name: 'department', label: '部门', type: 'select', options: [{ label: '全部', value: '' }] },
    { name: 'position', label: '职位', type: 'input' },
    { name: 'minAge', label: '最小年龄', type: 'number' },
    { name: 'maxAge', label: '最大年龄', type: 'number' }
  ]

  beforeEach(() => {
    container = document.getElementById('queryForm')
    container.innerHTML = ''
  })

  afterEach(() => {
    if (queryForm) {
      queryForm.destroy?.()
      queryForm = null
    }
  })

  describe('默认显示行数修复', () => {
    it('默认 defaultRowCount 应该为 1', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields,
        colCount: 4
        // 不传 defaultRowCount，应该默认为 1
      })

      expect(queryForm.options.defaultRowCount).toBe(1)
    })

    it('收起状态下应该只显示 1 行字段', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields,
        defaultRowCount: 1,
        colCount: 4
      })

      // 收起状态下，应该只显示 1 行（最多 4 个字段，考虑到内联按钮组可能占用位置）
      const visibleFieldCount = queryForm.getVisibleFieldCount()
      expect(visibleFieldCount).toBeLessThanOrEqual(4)
      expect(visibleFieldCount).toBeGreaterThan(0)
    })
  })

  describe('内联按钮组布局逻辑修复', () => {
    it('收起状态下，内联模式按钮组应该占用最后一行剩余位置', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields.slice(0, 3), // 3 个字段
        defaultRowCount: 1,
        colCount: 4,
        actionPosition: 'inline'
      })

      // 3 个字段，4 列，最后一行有剩余位置，应该内联显示
      const visibleFieldCount = queryForm.getVisibleFieldCount()
      const shouldInline = queryForm.shouldActionInline(visibleFieldCount)
      expect(shouldInline).toBe(true)
    })

    it('展开状态下，如果最后一行被占满，按钮组应该另起一行', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields, // 8 个字段
        defaultRowCount: 1,
        colCount: 4,
        actionPosition: 'inline'
      })

      // 展开状态
      queryForm.collapsed = false

      // 8 个字段，4 列，最后一行有 0 个字段（8 % 4 = 0），按钮组应该独占一行
      const visibleFieldCount = queryForm.getVisibleFieldCount()
      const shouldInline = queryForm.shouldActionInline(visibleFieldCount)
      expect(shouldInline).toBe(false)
    })

    it('auto 模式下应该根据字段数量自动决定按钮组位置', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields.slice(0, 3), // 3 个字段
        defaultRowCount: 1,
        colCount: 4,
        actionPosition: 'auto' // auto 模式
      })

      // 3 个字段，4 列，最后一行有剩余位置，auto 模式应该选择内联
      const visibleFieldCount = queryForm.getVisibleFieldCount()
      const shouldInline = queryForm.shouldActionInline(visibleFieldCount)
      expect(shouldInline).toBe(true)
    })
  })

  describe('响应式监听机制修复', () => {
    it('应该使用 ResizeObserver 监听容器宽度变化', () => {
      const mockResizeObserver = vi.fn(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
        unobserve: vi.fn()
      }))
      global.ResizeObserver = mockResizeObserver

      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields,
        responsive: true // 启用响应式
      })

      // 应该创建 ResizeObserver 实例
      expect(mockResizeObserver).toHaveBeenCalled()
    })

    it('响应式模式下应该根据容器宽度动态调整列数', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields,
        responsive: true,
        breakpoints: {
          xs: 1, sm: 2, md: 3, lg: 4, xl: 6, xxl: 6
        }
      })

      // 模拟不同的容器宽度
      queryForm.containerWidth = 500 // 小屏幕
      queryForm.updateLayout()
      expect(queryForm.currentColCount).toBe(1)

      queryForm.containerWidth = 800 // 中等屏幕
      queryForm.updateLayout()
      expect(queryForm.currentColCount).toBe(3)

      queryForm.containerWidth = 1200 // 大屏幕
      queryForm.updateLayout()
      expect(queryForm.currentColCount).toBe(4)
    })
  })

  describe('行为一致性验证', () => {
    it('JavaScript 版本的默认配置应该与 Vue 版本一致', () => {
      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        fields: mockFields
      })

      // 验证默认配置与 Vue 版本一致
      expect(queryForm.options.defaultRowCount).toBe(1)
      expect(queryForm.options.colCount).toBe(4)
      expect(queryForm.options.actionPosition).toBe('auto')
      expect(queryForm.options.actionAlign).toBe('left')
      expect(queryForm.options.responsive).toBe(true)
    })

    it('相同配置下的可见字段数量应该一致', () => {
      const config = {
        fields: mockFields,
        defaultRowCount: 1,
        colCount: 4,
        actionPosition: 'inline'
      }

      queryForm = new DynamicQueryForm({
        container: '#queryForm',
        ...config
      })

      // 收起状态下的可见字段数量
      const collapsedVisibleCount = queryForm.getVisibleFieldCount()
      expect(collapsedVisibleCount).toBeLessThanOrEqual(4)

      // 展开状态下的可见字段数量
      queryForm.collapsed = false
      const expandedVisibleCount = queryForm.getVisibleFieldCount()
      expect(expandedVisibleCount).toBe(mockFields.length)
    })
  })
})
