/**
 * 排序指示器组件测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { SortIndicator, type SortIndicatorConfig } from '../../src/components/SortIndicator'

describe('SortIndicator', () => {
  let container: HTMLElement
  let sortIndicator: SortIndicator

  beforeEach(() => {
    // 创建测试容器
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    // 清理
    if (sortIndicator) {
      sortIndicator.destroy()
    }
    if (container.parentNode) {
      document.body.removeChild(container)
    }
  })

  describe('基础功能', () => {
    it('应该正确创建排序指示器', () => {
      sortIndicator = new SortIndicator(container, {
        sortable: true
      })

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement).toBeTruthy()

      const ascButton = container.querySelector('.ldesign-table-sort-asc')
      const descButton = container.querySelector('.ldesign-table-sort-desc')
      expect(ascButton).toBeTruthy()
      expect(descButton).toBeTruthy()
    })

    it('应该在不可排序时不渲染指示器', () => {
      sortIndicator = new SortIndicator(container, {
        sortable: false
      })

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement).toBeFalsy()
    })

    it('应该正确设置初始排序方向', () => {
      sortIndicator = new SortIndicator(container, {
        direction: 'asc'
      })

      const ascButton = container.querySelector('.ldesign-table-sort-asc')
      expect(ascButton?.classList.contains('active')).toBe(true)
    })

    it('应该正确处理禁用状态', () => {
      sortIndicator = new SortIndicator(container, {
        disabled: true
      })

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement?.classList.contains('ldesign-table-sort-indicator-disabled')).toBe(true)
    })
  })

  describe('交互功能', () => {
    it('应该正确处理升序按钮点击', () => {
      const onClickSpy = vi.fn()
      sortIndicator = new SortIndicator(container, {
        onClick: onClickSpy
      })

      const ascButton = container.querySelector('.ldesign-table-sort-asc') as HTMLElement
      ascButton.click()

      expect(onClickSpy).toHaveBeenCalledWith('asc')
    })

    it('应该正确处理降序按钮点击', () => {
      const onClickSpy = vi.fn()
      sortIndicator = new SortIndicator(container, {
        onClick: onClickSpy
      })

      const descButton = container.querySelector('.ldesign-table-sort-desc') as HTMLElement
      descButton.click()

      expect(onClickSpy).toHaveBeenCalledWith('desc')
    })

    it('应该正确处理循环排序', () => {
      const onClickSpy = vi.fn()
      sortIndicator = new SortIndicator(container, {
        onClick: onClickSpy
      })

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator') as HTMLElement

      // 第一次点击：无排序 -> 升序
      indicatorElement.click()
      expect(onClickSpy).toHaveBeenCalledWith('asc')

      // 设置为升序状态
      sortIndicator.setDirection('asc')

      // 第二次点击：升序 -> 降序
      indicatorElement.click()
      expect(onClickSpy).toHaveBeenCalledWith('desc')

      // 设置为降序状态
      sortIndicator.setDirection('desc')

      // 第三次点击：降序 -> 无排序
      indicatorElement.click()
      expect(onClickSpy).toHaveBeenCalledWith(null)
    })

    it('应该在禁用时不响应点击', () => {
      const onClickSpy = vi.fn()
      sortIndicator = new SortIndicator(container, {
        disabled: true,
        onClick: onClickSpy
      })

      const ascButton = container.querySelector('.ldesign-table-sort-asc') as HTMLElement
      ascButton.click()

      expect(onClickSpy).not.toHaveBeenCalled()
    })

    it('应该正确处理重复点击同一方向', () => {
      const onClickSpy = vi.fn()
      sortIndicator = new SortIndicator(container, {
        direction: 'asc',
        onClick: onClickSpy
      })

      const ascButton = container.querySelector('.ldesign-table-sort-asc') as HTMLElement
      ascButton.click()

      // 点击当前激活的方向应该清除排序
      expect(onClickSpy).toHaveBeenCalledWith(null)
    })
  })

  describe('状态管理', () => {
    beforeEach(() => {
      sortIndicator = new SortIndicator(container)
    })

    it('应该正确设置排序方向', () => {
      sortIndicator.setDirection('asc')
      expect(sortIndicator.getDirection()).toBe('asc')

      const ascButton = container.querySelector('.ldesign-table-sort-asc')
      expect(ascButton?.classList.contains('active')).toBe(true)
    })

    it('应该正确清除排序方向', () => {
      sortIndicator.setDirection('asc')
      sortIndicator.setDirection(null)

      expect(sortIndicator.getDirection()).toBe(null)

      const ascButton = container.querySelector('.ldesign-table-sort-asc')
      const descButton = container.querySelector('.ldesign-table-sort-desc')
      expect(ascButton?.classList.contains('active')).toBe(false)
      expect(descButton?.classList.contains('active')).toBe(false)
    })

    it('应该正确设置可排序状态', () => {
      sortIndicator.setSortable(false)

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement).toBeFalsy()
    })

    it('应该正确设置禁用状态', () => {
      sortIndicator.setDisabled(true)

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement?.classList.contains('ldesign-table-sort-indicator-disabled')).toBe(true)
    })

    it('应该正确更新配置', () => {
      sortIndicator.updateConfig({
        direction: 'desc',
        disabled: true
      })

      expect(sortIndicator.getDirection()).toBe('desc')

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement?.classList.contains('ldesign-table-sort-indicator-disabled')).toBe(true)
    })
  })

  describe('事件系统', () => {
    beforeEach(() => {
      sortIndicator = new SortIndicator(container)
    })

    it('应该正确触发排序变化事件', () => {
      const eventSpy = vi.fn()
      sortIndicator.on('sort-change', eventSpy)

      sortIndicator.setDirection('asc')

      expect(eventSpy).toHaveBeenCalledWith({
        direction: 'asc',
        previousDirection: undefined
      })
    })

    it('应该正确移除事件监听器', () => {
      const eventSpy = vi.fn()
      sortIndicator.on('sort-change', eventSpy)
      sortIndicator.off('sort-change', eventSpy)

      sortIndicator.setDirection('asc')

      expect(eventSpy).not.toHaveBeenCalled()
    })

    it('应该正确移除所有事件监听器', () => {
      const eventSpy1 = vi.fn()
      const eventSpy2 = vi.fn()
      sortIndicator.on('sort-change', eventSpy1)
      sortIndicator.on('sort-change', eventSpy2)
      sortIndicator.off('sort-change')

      sortIndicator.setDirection('asc')

      expect(eventSpy1).not.toHaveBeenCalled()
      expect(eventSpy2).not.toHaveBeenCalled()
    })
  })

  describe('销毁功能', () => {
    it('应该正确销毁排序指示器', () => {
      sortIndicator = new SortIndicator(container)

      const indicatorElement = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElement).toBeTruthy()

      sortIndicator.destroy()

      const indicatorElementAfter = container.querySelector('.ldesign-table-sort-indicator')
      expect(indicatorElementAfter).toBeFalsy()
    })

    it('应该在销毁后清理事件监听器', () => {
      sortIndicator = new SortIndicator(container)
      const eventSpy = vi.fn()
      sortIndicator.on('sort-change', eventSpy)

      sortIndicator.destroy()

      // 尝试触发事件应该不会调用监听器
      try {
        sortIndicator.setDirection('asc')
      } catch (error) {
        // 预期会出错，因为组件已销毁
      }

      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('错误处理', () => {
    it('应该在容器不存在时抛出错误', () => {
      expect(() => {
        new SortIndicator('#non-existent-container')
      }).toThrow('排序指示器容器不存在')
    })

    it('应该正确处理事件监听器中的错误', () => {
      sortIndicator = new SortIndicator(container)

      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })
      const faultyListener = vi.fn(() => {
        throw new Error('Test error')
      })

      sortIndicator.on('sort-change', faultyListener)
      sortIndicator.setDirection('asc')

      expect(errorSpy).toHaveBeenCalled()
      errorSpy.mockRestore()
    })
  })
})
