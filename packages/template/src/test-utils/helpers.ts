import { mount, VueWrapper } from '@vue/test-utils'
import { render, RenderResult } from '@testing-library/vue'
import { nextTick } from 'vue'
import { vi } from 'vitest'
import type { Component } from 'vue'
import { mockTemplates, mockSelectorConfig, createMockElement } from './mocks'

// 测试工具函数

/**
 * 等待指定时间
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

/**
 * 等待 Vue 的下一个 tick 和额外的延迟
 */
export const waitForNextTick = async (delay = 0): Promise<void> => {
  await nextTick()
  if (delay > 0) {
    await sleep(delay)
  }
}

/**
 * 等待动画完成
 */
export const waitForAnimation = async (duration = 300): Promise<void> => {
  await sleep(duration + 50) // 额外 50ms 缓冲
}

/**
 * 等待 DOM 更新
 */
export const waitForDOMUpdate = async (): Promise<void> => {
  await nextTick()
  await sleep(10) // 小延迟确保 DOM 更新完成
}

/**
 * 创建测试用的 Vue 组件包装器
 */
export const createWrapper = <T extends Component>(
  component: T,
  options: any = {}
): VueWrapper<any> => {
  const defaultOptions = {
    global: {
      stubs: {
        transition: false,
        'transition-group': false,
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  }

  return mount(component, {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
    },
  })
}

/**
 * 创建测试用的 Testing Library 渲染结果
 */
export const createRender = <T extends Component>(
  component: T,
  options: any = {}
): RenderResult => {
  const defaultOptions = {
    global: {
      stubs: {
        transition: false,
        'transition-group': false,
      },
      mocks: {
        $t: (key: string) => key,
      },
    },
  }

  return render(component, {
    ...defaultOptions,
    ...options,
    global: {
      ...defaultOptions.global,
      ...options.global,
    },
  })
}

/**
 * 模拟用户点击事件
 */
export const mockUserClick = async (element: HTMLElement | Element): Promise<void> => {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  })
  element.dispatchEvent(event)
  await waitForDOMUpdate()
}

/**
 * 模拟用户输入事件
 */
export const mockUserInput = async (
  element: HTMLInputElement,
  value: string
): Promise<void> => {
  element.value = value
  const event = new Event('input', { bubbles: true })
  element.dispatchEvent(event)
  await waitForDOMUpdate()
}

/**
 * 模拟键盘事件
 */
export const mockKeyboardEvent = async (
  element: HTMLElement | Element,
  key: string,
  type: 'keydown' | 'keyup' | 'keypress' = 'keydown'
): Promise<void> => {
  const event = new KeyboardEvent(type, {
    key,
    bubbles: true,
    cancelable: true,
  })
  element.dispatchEvent(event)
  await waitForDOMUpdate()
}

/**
 * 模拟 CSS 动画事件
 */
export const mockAnimationEvent = (
  element: HTMLElement,
  type: 'animationstart' | 'animationend' | 'animationiteration',
  animationName = 'test-animation'
): void => {
  const event = new AnimationEvent(type, {
    animationName,
    elapsedTime: 0.3,
    pseudoElement: '',
  })
  element.dispatchEvent(event)
}

/**
 * 模拟 CSS 过渡事件
 */
export const mockTransitionEvent = (
  element: HTMLElement,
  type: 'transitionstart' | 'transitionend' | 'transitionrun' | 'transitioncancel',
  propertyName = 'opacity'
): void => {
  const event = new TransitionEvent(type, {
    propertyName,
    elapsedTime: 0.3,
    pseudoElement: '',
  })
  element.dispatchEvent(event)
}

/**
 * 创建模拟的模板选择器 props
 */
export const createMockSelectorProps = (overrides = {}) => ({
  visible: false,
  category: 'login',
  device: 'desktop',
  currentTemplate: 'default',
  showPreview: true,
  showSearch: true,
  showTags: true,
  showSort: true,
  ...overrides,
})

/**
 * 创建模拟的模板渲染器 props
 */
export const createMockRendererProps = (overrides = {}) => ({
  category: 'login',
  device: 'desktop',
  templateName: 'default',
  showSelector: false,
  selectorConfig: mockSelectorConfig,
  ...overrides,
})

/**
 * 创建模拟的 useTemplate 配置
 */
export const createMockUseTemplateOptions = (overrides = {}) => ({
  category: 'login',
  device: 'desktop',
  templateName: 'default',
  enableCache: true,
  showSelector: false,
  selectorConfig: mockSelectorConfig,
  ...overrides,
})

/**
 * 断言元素是否可见
 */
export const expectElementVisible = (element: HTMLElement | Element): void => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

/**
 * 断言元素是否隐藏
 */
export const expectElementHidden = (element: HTMLElement | null): void => {
  if (element) {
    expect(element).not.toBeVisible()
  } else {
    expect(element).toBeNull()
  }
}

/**
 * 断言动画类是否存在
 */
export const expectAnimationClass = (
  element: HTMLElement | Element,
  className: string
): void => {
  expect(element).toHaveClass(className)
}

/**
 * 等待元素出现
 */
export const waitForElement = async (
  selector: string,
  timeout = 1000
): Promise<HTMLElement> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      return element
    }
    await sleep(10)
  }

  throw new Error(`Element with selector "${selector}" not found within ${timeout}ms`)
}

/**
 * 等待元素消失
 */
export const waitForElementToDisappear = async (
  selector: string,
  timeout = 1000
): Promise<void> => {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const element = document.querySelector(selector)
    if (!element) {
      return
    }
    await sleep(10)
  }

  throw new Error(`Element with selector "${selector}" did not disappear within ${timeout}ms`)
}

/**
 * 创建模拟的 Intersection Observer 条目
 */
export const createMockIntersectionEntry = (
  target: HTMLElement,
  isIntersecting = true
) => ({
  target,
  isIntersecting,
  intersectionRatio: isIntersecting ? 1 : 0,
  boundingClientRect: target.getBoundingClientRect(),
  intersectionRect: isIntersecting ? target.getBoundingClientRect() : { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 },
  rootBounds: { top: 0, left: 0, right: 1920, bottom: 1080, width: 1920, height: 1080 },
  time: Date.now(),
})

/**
 * 模拟 ResizeObserver 回调
 */
export const mockResizeObserverCallback = (
  entries: Array<{ target: HTMLElement; contentRect: DOMRectReadOnly }>
): void => {
  const callback = vi.fn()
  entries.forEach(entry => {
    callback([{
      target: entry.target,
      contentRect: entry.contentRect,
      borderBoxSize: [{ blockSize: entry.contentRect.height, inlineSize: entry.contentRect.width }],
      contentBoxSize: [{ blockSize: entry.contentRect.height, inlineSize: entry.contentRect.width }],
      devicePixelContentBoxSize: [{ blockSize: entry.contentRect.height, inlineSize: entry.contentRect.width }],
    }])
  })
}

/**
 * 获取组件的所有 emit 事件
 */
export const getEmittedEvents = (wrapper: VueWrapper<any>) => {
  return wrapper.emitted()
}

/**
 * 断言事件是否被触发
 */
export const expectEventEmitted = (
  wrapper: VueWrapper<any>,
  eventName: string,
  times = 1
): void => {
  const events = wrapper.emitted(eventName)
  expect(events).toBeDefined()
  expect(events).toHaveLength(times)
}

/**
 * 断言事件是否被触发并包含特定参数
 */
export const expectEventEmittedWith = (
  wrapper: VueWrapper<any>,
  eventName: string,
  expectedArgs: any[]
): void => {
  const events = wrapper.emitted(eventName)
  expect(events).toBeDefined()
  expect(events![events!.length - 1]).toEqual(expectedArgs)
}
