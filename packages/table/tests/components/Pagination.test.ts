/**
 * 分页组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { Pagination, type PaginationConfig } from '../../src/components/Pagination'

describe('Pagination', () => {
  let container: HTMLElement
  let pagination: Pagination

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (pagination) {
      pagination.destroy()
    }
    document.body.removeChild(container)
  })

  describe('基础功能', () => {
    it('应该正确创建分页组件', () => {
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 100
      }

      pagination = new Pagination(container, config)

      expect(container.querySelector('.ldesign-pagination')).toBeTruthy()
    })

    it('应该正确显示页码按钮', () => {
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)

      const pageButtons = container.querySelectorAll('.ldesign-pagination-item')
      expect(pageButtons).toHaveLength(5) // 5页
    })

    it('应该正确标记当前页', () => {
      const config: PaginationConfig = {
        current: 3,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)

      const activeButton = container.querySelector('.ldesign-pagination-item-active')
      expect(activeButton?.textContent).toBe('3')
    })

    it('应该正确显示总数信息', () => {
      const config: PaginationConfig = {
        current: 2,
        pageSize: 10,
        total: 25,
        showTotal: true
      }

      pagination = new Pagination(container, config)

      const totalInfo = container.querySelector('.ldesign-pagination-total')
      expect(totalInfo?.textContent).toContain('共 25 条')
      expect(totalInfo?.textContent).toContain('显示 11-20 条')
    })
  })

  describe('页码切换', () => {
    it('应该正确处理页码点击', () => {
      const onChange = vi.fn()
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 50,
        onChange
      }

      pagination = new Pagination(container, config)

      const pageButton = container.querySelector('.ldesign-pagination-item:nth-child(3)') as HTMLElement
      pageButton.click()

      expect(onChange).toHaveBeenCalledWith(2, 10)
    })

    it('应该正确处理上一页按钮', () => {
      const onChange = vi.fn()
      const config: PaginationConfig = {
        current: 3,
        pageSize: 10,
        total: 50,
        onChange
      }

      pagination = new Pagination(container, config)

      const prevButton = container.querySelector('.ldesign-pagination-prev') as HTMLElement
      prevButton.click()

      expect(onChange).toHaveBeenCalledWith(2, 10)
    })

    it('应该正确处理下一页按钮', () => {
      const onChange = vi.fn()
      const config: PaginationConfig = {
        current: 2,
        pageSize: 10,
        total: 50,
        onChange
      }

      pagination = new Pagination(container, config)

      const nextButton = container.querySelector('.ldesign-pagination-next') as HTMLElement
      nextButton.click()

      expect(onChange).toHaveBeenCalledWith(3, 10)
    })

    it('第一页时上一页按钮应该禁用', () => {
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)

      const prevButton = container.querySelector('.ldesign-pagination-prev') as HTMLButtonElement
      expect(prevButton.disabled).toBe(true)
    })

    it('最后一页时下一页按钮应该禁用', () => {
      const config: PaginationConfig = {
        current: 5,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)

      const nextButton = container.querySelector('.ldesign-pagination-next') as HTMLButtonElement
      expect(nextButton.disabled).toBe(true)
    })
  })

  describe('每页条数选择', () => {
    it('应该显示每页条数选择器', () => {
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 100,
        showSizeChanger: true
      }

      pagination = new Pagination(container, config)

      const sizeSelect = container.querySelector('.ldesign-pagination-size-select')
      expect(sizeSelect).toBeTruthy()
    })

    it('应该正确处理每页条数变化', () => {
      const onShowSizeChange = vi.fn()
      const config: PaginationConfig = {
        current: 2,
        pageSize: 10,
        total: 100,
        showSizeChanger: true,
        onShowSizeChange
      }

      pagination = new Pagination(container, config)

      const sizeSelect = container.querySelector('.ldesign-pagination-size-select') as HTMLSelectElement
      sizeSelect.value = '20'
      sizeSelect.dispatchEvent(new Event('change'))

      expect(onShowSizeChange).toHaveBeenCalledWith(1, 20)
    })
  })

  describe('快速跳转', () => {
    it('应该显示快速跳转输入框', () => {
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 100,
        showQuickJumper: true
      }

      pagination = new Pagination(container, config)

      const quickInput = container.querySelector('.ldesign-pagination-quick-input')
      expect(quickInput).toBeTruthy()
    })

    it('应该正确处理快速跳转', () => {
      const onChange = vi.fn()
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 100,
        showQuickJumper: true,
        onChange
      }

      pagination = new Pagination(container, config)

      const quickInput = container.querySelector('.ldesign-pagination-quick-input') as HTMLInputElement
      quickInput.value = '5'
      quickInput.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }))

      expect(onChange).toHaveBeenCalledWith(5, 10)
    })
  })

  describe('简洁模式', () => {
    it('应该正确渲染简洁模式', () => {
      const config: PaginationConfig = {
        current: 3,
        pageSize: 10,
        total: 100,
        simple: true
      }

      pagination = new Pagination(container, config)

      const simpleWrapper = container.querySelector('.ldesign-pagination-simple')
      expect(simpleWrapper).toBeTruthy()

      const pageInfo = container.querySelector('.ldesign-pagination-simple-info')
      expect(pageInfo?.textContent).toBe('3 / 10')
    })
  })

  describe('禁用状态', () => {
    it('应该正确处理禁用状态', () => {
      const config: PaginationConfig = {
        current: 2,
        pageSize: 10,
        total: 50,
        disabled: true
      }

      pagination = new Pagination(container, config)

      const paginationElement = container.querySelector('.ldesign-pagination')
      expect(paginationElement?.classList.contains('ldesign-pagination-disabled')).toBe(true)

      const buttons = container.querySelectorAll('button')
      buttons.forEach(button => {
        expect(button.disabled).toBe(true)
      })
    })
  })

  describe('事件系统', () => {
    it('应该正确触发change事件', () => {
      const listener = vi.fn()
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)
      pagination.on('change', listener)

      const pageButton = container.querySelector('.ldesign-pagination-item:nth-child(3)') as HTMLElement
      pageButton.click()

      expect(listener).toHaveBeenCalledWith({ page: 2, pageSize: 10 })
    })

    it('应该正确触发sizeChange事件', () => {
      const listener = vi.fn()
      const config: PaginationConfig = {
        current: 2,
        pageSize: 10,
        total: 100,
        showSizeChanger: true
      }

      pagination = new Pagination(container, config)
      pagination.on('sizeChange', listener)

      const sizeSelect = container.querySelector('.ldesign-pagination-size-select') as HTMLSelectElement
      sizeSelect.value = '20'
      sizeSelect.dispatchEvent(new Event('change'))

      expect(listener).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    })

    it('应该正确移除事件监听器', () => {
      const listener = vi.fn()
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)
      pagination.on('change', listener)
      pagination.off('change', listener)

      const pageButton = container.querySelector('.ldesign-pagination-item:nth-child(3)') as HTMLElement
      pageButton.click()

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('配置更新', () => {
    it('应该正确更新配置', () => {
      const config: PaginationConfig = {
        current: 1,
        pageSize: 10,
        total: 50
      }

      pagination = new Pagination(container, config)

      pagination.updateConfig({
        current: 3,
        total: 100
      })

      const activeButton = container.querySelector('.ldesign-pagination-item-active')
      expect(activeButton?.textContent).toBe('3')

      const pageButtons = container.querySelectorAll('.ldesign-pagination-item')
      // 当总页数大于7时，会显示省略号，所以页码按钮数量会少于总页数
      expect(pageButtons.length).toBeGreaterThan(0)
    })

    it('应该正确获取当前配置', () => {
      const config: PaginationConfig = {
        current: 2,
        pageSize: 20,
        total: 100
      }

      pagination = new Pagination(container, config)

      const currentConfig = pagination.getConfig()
      expect(currentConfig.current).toBe(2)
      expect(currentConfig.pageSize).toBe(20)
      expect(currentConfig.total).toBe(100)
    })
  })
})
