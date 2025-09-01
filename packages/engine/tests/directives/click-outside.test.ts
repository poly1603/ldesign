/**
 * 点击外部指令测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ClickOutsideDirective } from '../../src/directives/modules/click-outside'

describe('clickOutsideDirective', () => {
  let directive: ClickOutsideDirective
  let element: HTMLElement
  let mockHandler: ReturnType<typeof vi.fn>

  beforeEach(() => {
    directive = new ClickOutsideDirective()
    element = document.createElement('div')
    document.body.appendChild(element)
    mockHandler = vi.fn()
  })

  afterEach(() => {
    document.body.removeChild(element)
    vi.clearAllMocks()
  })

  it('should create directive instance', () => {
    expect(directive).toBeDefined()
    expect(directive.name).toBe('click-outside')
    expect(directive.description).toBe('点击元素外部时触发回调')
  })

  it('should trigger handler when clicking outside element', async () => {
    const binding = {
      value: mockHandler,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)

    // 模拟点击外部
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(clickEvent, 'target', {
      value: outsideElement,
      enumerable: true,
    })

    document.dispatchEvent(clickEvent)

    expect(mockHandler).toHaveBeenCalledWith(clickEvent)

    document.body.removeChild(outsideElement)
  })

  it('should not trigger handler when clicking inside element', () => {
    const binding = {
      value: mockHandler,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)

    // 模拟点击内部
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(clickEvent, 'target', {
      value: element,
      enumerable: true,
    })

    document.dispatchEvent(clickEvent)

    expect(mockHandler).not.toHaveBeenCalled()
  })

  it('should handle exclude elements', () => {
    const excludeElement = document.createElement('div')
    excludeElement.className = 'exclude-element'
    document.body.appendChild(excludeElement)

    const binding = {
      value: {
        handler: mockHandler,
        exclude: ['.exclude-element'],
      },
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)

    // 模拟点击排除元素
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(clickEvent, 'target', {
      value: excludeElement,
      enumerable: true,
    })

    document.dispatchEvent(clickEvent)

    expect(mockHandler).not.toHaveBeenCalled()

    document.body.removeChild(excludeElement)
  })

  it('should handle disabled state', () => {
    const binding = {
      value: {
        handler: mockHandler,
        disabled: true,
      },
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)

    // 模拟点击外部
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(clickEvent, 'target', {
      value: outsideElement,
      enumerable: true,
    })

    document.dispatchEvent(clickEvent)

    expect(mockHandler).not.toHaveBeenCalled()

    document.body.removeChild(outsideElement)
  })

  it('should clean up event listeners on unmount', () => {
    const binding = {
      value: mockHandler,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)
    directive.unmounted(element)

    // 模拟点击外部
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(clickEvent, 'target', {
      value: outsideElement,
      enumerable: true,
    })

    document.dispatchEvent(clickEvent)

    expect(mockHandler).not.toHaveBeenCalled()

    document.body.removeChild(outsideElement)
  })

  it('should update configuration when binding changes', () => {
    const newHandler = vi.fn()

    const initialBinding = {
      value: mockHandler,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    const updatedBinding = {
      value: newHandler,
      oldValue: mockHandler,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, initialBinding)
    directive.updated(element, updatedBinding)

    // 模拟点击外部
    const outsideElement = document.createElement('div')
    document.body.appendChild(outsideElement)

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    })

    Object.defineProperty(clickEvent, 'target', {
      value: outsideElement,
      enumerable: true,
    })

    document.dispatchEvent(clickEvent)

    expect(mockHandler).not.toHaveBeenCalled()
    expect(newHandler).toHaveBeenCalledWith(clickEvent)

    document.body.removeChild(outsideElement)
  })

  it('should handle capture option', () => {
    const binding = {
      value: {
        handler: mockHandler,
        capture: true,
      },
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)

    // 验证事件监听器是否以capture模式添加
    expect(element._clickOutsideHandler).toBeDefined()
  })

  it('should warn when no handler provided', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const binding = {
      value: null,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      instance: null,
      dir: {},
    }

    directive.mounted(element, binding)

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Directive:click-outside]',
      'click-outside directive requires a handler function',
    )

    consoleSpy.mockRestore()
  })
})
