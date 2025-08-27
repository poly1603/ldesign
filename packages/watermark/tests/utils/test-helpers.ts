/**
 * 测试辅助工具
 */

import type { WatermarkConfig, WatermarkInstance } from '../../src/types'

/**
 * 创建测试容器
 */
export function createTestContainer(id = 'test-container'): HTMLElement {
  const container = document.createElement('div')
  container.id = id
  container.style.width = '800px'
  container.style.height = '600px'
  container.style.position = 'relative'
  document.body.appendChild(container)
  return container
}

/**
 * 清理测试容器
 */
export function cleanupTestContainer(container?: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container)
  }
  // 清理所有测试容器
  const containers = document.querySelectorAll('[id^="test-container"]')
  containers.forEach(el => el.parentNode?.removeChild(el))
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 等待下一个事件循环
 */
export function nextTick(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0))
}

/**
 * 创建默认水印配置
 */
export function createDefaultConfig(overrides: Partial<WatermarkConfig> = {}): WatermarkConfig {
  return {
    content: 'Test Watermark',
    style: {
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.15)',
      opacity: 1,
      rotate: -22,
    },
    layout: {
      width: 120,
      height: 64,
      gapX: 100,
      gapY: 100,
      offsetX: 0,
      offsetY: 0,
    },
    renderMode: 'dom',
    enabled: true,
    zIndex: 9999,
    visible: true,
    ...overrides,
  }
}

/**
 * 模拟图片加载
 */
export function mockImageLoad(src: string, success = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    setTimeout(() => {
      if (success) {
        Object.defineProperty(img, 'naturalWidth', { value: 100 })
        Object.defineProperty(img, 'naturalHeight', { value: 100 })
        Object.defineProperty(img, 'src', { value: src })
        resolve(img)
      } else {
        reject(new Error(`Failed to load image: ${src}`))
      }
    }, 10)
  })
}

/**
 * 模拟 DOM 矩形信息
 */
export function mockDOMRect(overrides: Partial<DOMRect> = {}): DOMRect {
  return {
    x: 0,
    y: 0,
    width: 800,
    height: 600,
    top: 0,
    right: 800,
    bottom: 600,
    left: 0,
    toJSON: () => ({}),
    ...overrides,
  }
}

/**
 * 验证水印实例
 */
export function validateWatermarkInstance(instance: WatermarkInstance): void {
  expect(instance).toBeDefined()
  expect(instance.id).toBeTruthy()
  expect(instance.state).toBeDefined()
  expect(instance.config).toBeDefined()
  expect(instance.container).toBeDefined()
  expect(instance.elements).toBeDefined()
  expect(instance.renderer).toBeDefined()
  expect(instance.renderContext).toBeDefined()
}

/**
 * 验证水印元素
 */
export function validateWatermarkElements(elements: HTMLElement[]): void {
  expect(elements).toBeDefined()
  expect(Array.isArray(elements)).toBe(true)
  expect(elements.length).toBeGreaterThan(0)
  
  elements.forEach(element => {
    expect(element).toBeInstanceOf(HTMLElement)
    expect(element.parentNode).toBeTruthy()
  })
}

/**
 * 计算预期的水印数量
 */
export function calculateExpectedWatermarkCount(
  containerWidth: number,
  containerHeight: number,
  gapX: number,
  gapY: number
): number {
  const cols = Math.ceil(containerWidth / gapX) + 1
  const rows = Math.ceil(containerHeight / gapY) + 1
  return cols * rows
}

/**
 * 模拟用户交互事件
 */
export function simulateEvent(element: Element, eventType: string, options: any = {}): void {
  const event = new Event(eventType, { bubbles: true, cancelable: true, ...options })
  element.dispatchEvent(event)
}

/**
 * 检查元素是否可见
 */
export function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

/**
 * 获取元素的计算样式值
 */
export function getComputedStyleValue(element: HTMLElement, property: string): string {
  return window.getComputedStyle(element).getPropertyValue(property)
}
