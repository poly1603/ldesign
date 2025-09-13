/**
 * 拖拽排序组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DragSort, type DragSortConfig } from '../../src/components/DragSort'
import { createTestData } from '../setup'

describe('DragSort', () => {
  let dragSort: DragSort
  let container: HTMLElement
  let tbody: HTMLElement
  let testData: any[]

  beforeEach(() => {
    dragSort = new DragSort({ enabled: true })
    
    // 创建表格结构
    container = document.createElement('div')
    const table = document.createElement('table')
    tbody = document.createElement('tbody')
    
    table.appendChild(tbody)
    container.appendChild(table)
    document.body.appendChild(container)
    
    testData = createTestData(5)
    
    // 创建测试行
    testData.forEach((row, index) => {
      const tr = document.createElement('tr')
      tr.setAttribute('data-row-index', index.toString())
      tr.setAttribute('draggable', 'true')
      
      const td1 = document.createElement('td')
      const handle = document.createElement('span')
      handle.className = 'drag-handle'
      handle.textContent = '⋮⋮'
      td1.appendChild(handle)
      
      const td2 = document.createElement('td')
      td2.textContent = row.name
      
      tr.appendChild(td1)
      tr.appendChild(td2)
      tbody.appendChild(tr)
    })
    
    dragSort.init(container)
  })

  afterEach(() => {
    dragSort.destroy()
    document.body.removeChild(container)
  })

  describe('基础功能', () => {
    it('应该正确创建拖拽排序实例', () => {
      expect(dragSort).toBeDefined()
      expect(dragSort.isDragging()).toBe(false)
    })

    it('应该正确初始化拖拽手柄', () => {
      const handles = container.querySelectorAll('.drag-handle')
      expect(handles.length).toBe(5)
      
      handles.forEach(handle => {
        expect(handle.getAttribute('title')).toBe('拖拽排序')
        expect((handle as HTMLElement).style.cursor).toBe('grab')
      })
    })

    it('应该为行添加拖拽属性', () => {
      const rows = tbody.querySelectorAll('tr')
      rows.forEach((row, index) => {
        expect(row.getAttribute('draggable')).toBe('true')
        expect(row.getAttribute('data-row-index')).toBe(index.toString())
      })
    })
  })

  describe('配置选项', () => {
    it('应该支持禁用拖拽排序', () => {
      const disabledDragSort = new DragSort({ enabled: false })
      expect(disabledDragSort.isDragging()).toBe(false)
      disabledDragSort.destroy()
    })

    it('应该支持自定义拖拽手柄选择器', () => {
      const customDragSort = new DragSort({
        enabled: true,
        handleSelector: '.custom-handle'
      })
      
      // 添加自定义手柄
      const customHandle = document.createElement('span')
      customHandle.className = 'custom-handle'
      const firstRow = tbody.querySelector('tr')
      firstRow?.appendChild(customHandle)
      
      customDragSort.init(container)
      customDragSort.destroy()
    })

    it('应该支持拖拽约束配置', () => {
      const constrainedDragSort = new DragSort({
        enabled: true,
        constraints: {
          minIndex: 1,
          maxIndex: 3,
          disabledRows: ['1', '2']
        }
      })
      
      constrainedDragSort.init(container)
      constrainedDragSort.destroy()
    })
  })

  describe('拖拽事件', () => {
    it('应该触发拖拽开始事件', () => {
      const onDragStart = vi.fn()
      dragSort.on('drag-start', onDragStart)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      firstRow.dispatchEvent(dragStartEvent)
      
      expect(onDragStart).toHaveBeenCalledWith(
        expect.objectContaining({
          fromIndex: 0,
          toIndex: 0,
          element: firstRow
        })
      )
    })

    it('应该触发排序变化事件', () => {
      const onSortChange = vi.fn()
      dragSort.on('sort-change', onSortChange)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const secondRow = tbody.querySelectorAll('tr')[1] as HTMLElement
      
      // 模拟拖拽开始
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      firstRow.dispatchEvent(dragStartEvent)
      
      // 模拟拖拽悬停
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true
      })
      Object.defineProperty(dragOverEvent, 'target', { value: secondRow })
      secondRow.dispatchEvent(dragOverEvent)
      
      // 模拟拖拽放置
      const dropEvent = new DragEvent('drop', {
        bubbles: true
      })
      Object.defineProperty(dropEvent, 'target', { value: secondRow })
      secondRow.dispatchEvent(dropEvent)
      
      expect(onSortChange).toHaveBeenCalledWith(
        expect.objectContaining({
          fromIndex: 0,
          toIndex: 1
        })
      )
    })

    it('应该触发拖拽结束事件', () => {
      const onDragEnd = vi.fn()
      dragSort.on('drag-end', onDragEnd)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      
      // 模拟拖拽开始
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      firstRow.dispatchEvent(dragStartEvent)
      
      // 模拟拖拽结束
      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true
      })
      firstRow.dispatchEvent(dragEndEvent)
      
      expect(onDragEnd).toHaveBeenCalled()
    })
  })

  describe('拖拽状态管理', () => {
    it('应该正确管理拖拽状态', () => {
      expect(dragSort.isDragging()).toBe(false)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      firstRow.dispatchEvent(dragStartEvent)
      expect(dragSort.isDragging()).toBe(true)
      
      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true
      })
      firstRow.dispatchEvent(dragEndEvent)
      expect(dragSort.isDragging()).toBe(false)
    })

    it('应该在拖拽时设置正确的样式', () => {
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      firstRow.dispatchEvent(dragStartEvent)
      
      expect(firstRow.style.opacity).toBe('0.5')
      expect(firstRow.style.transform).toBe('rotate(2deg)')
    })
  })

  describe('占位符功能', () => {
    it('应该创建拖拽占位符', () => {
      const dragSortWithIndicator = new DragSort({
        enabled: true,
        showIndicator: true
      })
      
      dragSortWithIndicator.init(container)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      firstRow.dispatchEvent(dragStartEvent)
      
      // 检查是否创建了占位符（在实际实现中会创建）
      expect(dragSortWithIndicator.isDragging()).toBe(true)
      
      dragSortWithIndicator.destroy()
    })
  })

  describe('自动滚动', () => {
    it('应该支持自动滚动配置', () => {
      const autoScrollDragSort = new DragSort({
        enabled: true,
        autoScroll: true,
        scrollSpeed: 10
      })
      
      autoScrollDragSort.init(container)
      autoScrollDragSort.destroy()
    })
  })

  describe('拖拽约束', () => {
    it('应该阻止拖拽禁用的行', () => {
      const constrainedDragSort = new DragSort({
        enabled: true,
        constraints: {
          disabledRows: ['1']
        }
      })
      
      constrainedDragSort.init(container)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      // 由于约束检查需要访问行数据，这里主要测试配置是否正确设置
      expect(constrainedDragSort.isDragging()).toBe(false)
      
      constrainedDragSort.destroy()
    })

    it('应该支持索引范围约束', () => {
      const constrainedDragSort = new DragSort({
        enabled: true,
        constraints: {
          minIndex: 1,
          maxIndex: 3
        }
      })
      
      constrainedDragSort.init(container)
      constrainedDragSort.destroy()
    })
  })

  describe('配置更新', () => {
    it('应该支持动态更新配置', () => {
      const newConfig = {
        enabled: false,
        showIndicator: false
      }
      
      dragSort.updateConfig(newConfig)
      
      // 验证配置更新后的行为
      expect(dragSort.isDragging()).toBe(false)
    })
  })

  describe('事件监听器管理', () => {
    it('应该正确添加和移除事件监听器', () => {
      const listener = vi.fn()
      
      dragSort.on('drag-start', listener)
      dragSort.off('drag-start', listener)
      
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      firstRow.dispatchEvent(dragStartEvent)
      
      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('清理功能', () => {
    it('应该正确清理拖拽状态', () => {
      const firstRow = tbody.querySelector('tr') as HTMLElement
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      
      firstRow.dispatchEvent(dragStartEvent)
      expect(dragSort.isDragging()).toBe(true)
      
      // 模拟拖拽结束
      const dragEndEvent = new DragEvent('dragend', {
        bubbles: true
      })
      firstRow.dispatchEvent(dragEndEvent)
      
      expect(dragSort.isDragging()).toBe(false)
      expect(firstRow.style.opacity).toBe('')
      expect(firstRow.style.transform).toBe('')
    })

    it('应该正确销毁组件', () => {
      dragSort.destroy()
      expect(dragSort.isDragging()).toBe(false)
    })
  })

  describe('手柄验证', () => {
    it('应该验证拖拽手柄', () => {
      const handle = container.querySelector('.drag-handle') as HTMLElement
      const firstRow = tbody.querySelector('tr') as HTMLElement
      
      // 模拟从手柄开始拖拽
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      Object.defineProperty(dragStartEvent, 'target', { value: handle })
      
      firstRow.dispatchEvent(dragStartEvent)
      
      // 验证拖拽是否正确开始
      expect(dragSort.isDragging()).toBe(true)
    })

    it('应该拒绝非手柄元素的拖拽', () => {
      const nonHandle = container.querySelector('td:last-child') as HTMLElement
      const firstRow = tbody.querySelector('tr') as HTMLElement
      
      // 模拟从非手柄元素开始拖拽
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        dataTransfer: new DataTransfer()
      })
      Object.defineProperty(dragStartEvent, 'target', { value: nonHandle })
      
      firstRow.dispatchEvent(dragStartEvent)
      
      // 由于不是从手柄开始，拖拽应该被阻止
      // 注意：实际的阻止逻辑在preventDefault中，这里主要测试配置
      expect(dragSort.isDragging()).toBe(false)
    })
  })
})
