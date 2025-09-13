/**
 * 分页管理器测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { PaginationManager, type PaginationManagerConfig } from '../../src/managers/PaginationManager'

interface TestRow {
  id: number
  name: string
  age: number
}

describe('PaginationManager', () => {
  let container: HTMLElement
  let paginationManager: PaginationManager<TestRow>
  let testData: TestRow[]

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    testData = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      age: 20 + i
    }))
  })

  afterEach(() => {
    if (paginationManager) {
      paginationManager.destroy()
    }
    document.body.removeChild(container)
  })

  describe('基础功能', () => {
    it('应该正确创建分页管理器', () => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)

      expect(paginationManager.isEnabled()).toBe(true)
    })

    it('应该正确设置数据', () => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)

      const state = paginationManager.getState()
      expect(state.total).toBe(25)
      expect(state.totalPages).toBe(3)
    })

    it('应该正确获取当前页数据', () => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData).toHaveLength(10)
      expect(currentPageData[0].id).toBe(1)
      expect(currentPageData[9].id).toBe(10)
    })

    it('禁用分页时应该返回所有数据', () => {
      const config: PaginationManagerConfig = {
        enabled: false,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData).toHaveLength(25)
    })
  })

  describe('前端分页', () => {
    beforeEach(() => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)
    })

    it('应该正确切换页码', () => {
      paginationManager.setPage(2)

      const state = paginationManager.getState()
      expect(state.current).toBe(2)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData).toHaveLength(10)
      expect(currentPageData[0].id).toBe(11)
      expect(currentPageData[9].id).toBe(20)
    })

    it('应该正确处理最后一页', () => {
      paginationManager.setPage(3)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData).toHaveLength(5) // 最后一页只有5条数据
      expect(currentPageData[0].id).toBe(21)
      expect(currentPageData[4].id).toBe(25)
    })

    it('应该正确切换每页条数', () => {
      paginationManager.setPageSize(5)

      const state = paginationManager.getState()
      expect(state.pageSize).toBe(5)
      expect(state.totalPages).toBe(5)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData).toHaveLength(5)
    })

    it('切换每页条数时应该保持当前数据位置', () => {
      // 先切换到第2页
      paginationManager.setPage(2)
      
      // 然后改变每页条数
      paginationManager.setPageSize(5)

      const state = paginationManager.getState()
      // 原来第2页的第1条数据（id=11）现在应该在第3页
      expect(state.current).toBe(3)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData[0].id).toBe(11)
    })

    it('应该忽略无效的页码', () => {
      const originalState = paginationManager.getState()

      // 尝试设置无效页码
      paginationManager.setPage(0)
      expect(paginationManager.getState().current).toBe(originalState.current)

      paginationManager.setPage(10)
      expect(paginationManager.getState().current).toBe(originalState.current)
    })
  })

  describe('后端分页', () => {
    beforeEach(() => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'backend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 100
        }
      }

      paginationManager = new PaginationManager(config)
    })

    it('应该正确设置总条数', () => {
      paginationManager.setTotal(200)

      const state = paginationManager.getState()
      expect(state.total).toBe(200)
      expect(state.totalPages).toBe(20)
    })

    it('应该正确设置当前页数据', () => {
      const pageData = testData.slice(0, 10)
      paginationManager.setCurrentPageData(pageData)

      const currentPageData = paginationManager.getCurrentPageData()
      expect(currentPageData).toHaveLength(10)
      expect(currentPageData[0].id).toBe(1)
    })
  })

  describe('启用和禁用', () => {
    it('应该正确启用分页', () => {
      const config: PaginationManagerConfig = {
        enabled: false,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      expect(paginationManager.isEnabled()).toBe(false)

      paginationManager.enable()
      expect(paginationManager.isEnabled()).toBe(true)
    })

    it('应该正确禁用分页', () => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      expect(paginationManager.isEnabled()).toBe(true)

      paginationManager.disable()
      expect(paginationManager.isEnabled()).toBe(false)
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)
    })

    it('应该正确触发页码变化事件', () => {
      const listener = vi.fn()
      paginationManager.on('page-change', listener)

      paginationManager.setPage(2)

      expect(listener).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        state: expect.objectContaining({
          current: 2,
          pageSize: 10
        })
      })
    })

    it('应该正确触发每页条数变化事件', () => {
      const listener = vi.fn()
      paginationManager.on('page-size-change', listener)

      paginationManager.setPageSize(20)

      expect(listener).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        state: expect.objectContaining({
          current: 1,
          pageSize: 20
        })
      })
    })

    it('应该正确移除事件监听器', () => {
      const listener = vi.fn()
      paginationManager.on('page-change', listener)
      paginationManager.off('page-change', listener)

      paginationManager.setPage(2)

      expect(listener).not.toHaveBeenCalled()
    })

    it('应该正确移除所有事件监听器', () => {
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      paginationManager.on('page-change', listener1)
      paginationManager.on('page-change', listener2)
      paginationManager.off('page-change')

      paginationManager.setPage(2)

      expect(listener1).not.toHaveBeenCalled()
      expect(listener2).not.toHaveBeenCalled()
    })
  })

  describe('状态管理', () => {
    it('应该正确获取分页状态', () => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 2,
          pageSize: 5,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)

      const state = paginationManager.getState()
      expect(state.current).toBe(2)
      expect(state.pageSize).toBe(5)
      expect(state.total).toBe(25)
      expect(state.totalPages).toBe(5)
    })
  })

  describe('销毁', () => {
    it('应该正确销毁分页管理器', () => {
      const config: PaginationManagerConfig = {
        enabled: true,
        mode: 'frontend',
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }

      paginationManager = new PaginationManager(config)
      paginationManager.setData(testData)

      paginationManager.destroy()

      // 销毁后应该清空数据
      expect(paginationManager.getCurrentPageData()).toHaveLength(0)
    })
  })
})
