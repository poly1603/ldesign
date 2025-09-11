/**
 * 测试辅助工具
 */

import { vi } from 'vitest'
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

/**
 * 创建 Mock Canvas Context
 */
export function createMockCanvasContext(): CanvasRenderingContext2D {
  const mockContext = {
    // 绘制方法
    fillText: vi.fn(),
    strokeText: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    rect: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    
    // 变换方法
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    
    // 样式属性（使用可写的属性来模拟真实的Canvas上下文）
    _fillStyle: '#000000',
    get fillStyle() { return this._fillStyle },
    set fillStyle(value) { this._fillStyle = value },
    _strokeStyle: '#000000',
    get strokeStyle() { return this._strokeStyle },
    set strokeStyle(value) { this._strokeStyle = value },
    _globalAlpha: 1,
    get globalAlpha() { return this._globalAlpha },
    set globalAlpha(value) { this._globalAlpha = value },
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    miterLimit: 10,
    _font: '10px sans-serif',
    get font() { return this._font },
    set font(value) { this._font = value },
    textAlign: 'start',
    textBaseline: 'alphabetic',
    direction: 'ltr',
    globalCompositeOperation: 'source-over',
    
    // 其他方法
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    createLinearGradient: vi.fn(),
    createRadialGradient: vi.fn(),
    createPattern: vi.fn(),
    getImageData: vi.fn().mockImplementation((x: number, y: number, width: number, height: number) => {
      // 返回一个模拟ImageData对象
      const data = new Uint8ClampedArray(width * height * 4) // RGBA
      return { data, width, height }
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn(),
    
    // Canvas 属性
    canvas: null as any,
  } as any
  
  return mockContext
}

/**
 * 设置 Canvas Mock
 */
export function setupCanvasMock(): void {
  // Mock HTMLCanvasElement.getContext
  if (typeof HTMLCanvasElement !== 'undefined') {
    const originalGetContext = HTMLCanvasElement.prototype.getContext
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL
    
    // 使用WeakMap来存储每个canvas元素对应的context对象
    const canvasContextMap = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>()
    
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(function(this: HTMLCanvasElement, contextId: string) {
      if (contextId === '2d') {
        // 检查是否已经为这个canvas创建了context
        if (canvasContextMap.has(this)) {
          return canvasContextMap.get(this)!
        }
        
        // 创建新的context并存储起来
        const mockContext = createMockCanvasContext()
        mockContext.canvas = this
        canvasContextMap.set(this, mockContext)
        return mockContext
      }
      return originalGetContext.call(this, contextId as any)
    })
    
    // Mock toDataURL
    HTMLCanvasElement.prototype.toDataURL = vi.fn().mockReturnValue('data:image/png;base64,mock-canvas-data')
  }
}

/**
 * 清理 Canvas Mock
 */
export function cleanupCanvasMock(): void {
  if (typeof HTMLCanvasElement !== 'undefined' && HTMLCanvasElement.prototype.getContext) {
    vi.restoreAllMocks()
  }
}
