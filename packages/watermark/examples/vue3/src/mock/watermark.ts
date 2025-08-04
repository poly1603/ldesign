/**
 * 水印模拟实现 - 用于示例项目构建测试
 */

export interface WatermarkConfig {
  content: string | string[]
  style?: {
    fontSize?: number
    fontFamily?: string
    fontWeight?: string | number
    color?: string
    opacity?: number
    rotate?: number
    textShadow?: string
    lineHeight?: number
  }
  layout?: {
    gapX?: number
    gapY?: number
    offsetX?: number
    offsetY?: number
    autoCalculate?: boolean
  }
  renderMode?: 'dom' | 'canvas' | 'svg'
  zIndex?: number
  security?: {
    level?: 'none' | 'low' | 'medium' | 'high'
    mutationObserver?: boolean
    styleProtection?: boolean
    canvasProtection?: boolean
    onViolation?: (violation: any) => void
  }
  animation?: {
    type?: 'none' | 'fade' | 'slide' | 'rotate' | 'scale' | 'bounce'
    duration?: number
    easing?: string
    iteration?: string | number
  }
  responsive?: {
    enabled?: boolean
    autoResize?: boolean
    breakpoints?: Record<string, any>
  }
}

export interface WatermarkInstance {
  id: string
  config: WatermarkConfig
  container: HTMLElement
  elements: HTMLElement[]
  visible: boolean
  createdAt: number
  updatedAt: number
}

// 模拟实例存储
const instances = new Map<string, WatermarkInstance>()
let instanceCounter = 0

/**
 * 创建水印实例
 */
export async function createWatermark(
  container: HTMLElement | string,
  config: Partial<WatermarkConfig>
): Promise<WatermarkInstance> {
  const containerElement = typeof container === 'string'
    ? document.querySelector(container) as HTMLElement
    : container

  if (!containerElement) {
    throw new Error('Container element not found')
  }

  // 清除现有水印
  const existingElements = containerElement.querySelectorAll('.mock-watermark')
  existingElements.forEach(el => el.remove())

  const instanceId = `watermark-${++instanceCounter}`
  const now = Date.now()

  const finalConfig: WatermarkConfig = {
    content: 'Mock Watermark',
    style: {
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.15)',
      opacity: 1,
      rotate: -22
    },
    layout: {
      gapX: 100,
      gapY: 80
    },
    renderMode: 'dom',
    zIndex: 1000,
    ...config
  }

  // 创建水印元素
  const elements: HTMLElement[] = []
  const containerRect = containerElement.getBoundingClientRect()
  const { gapX = 100, gapY = 80 } = finalConfig.layout || {}

  // 计算需要创建的水印数量
  const cols = Math.ceil(containerRect.width / gapX) + 1
  const rows = Math.ceil(containerRect.height / gapY) + 1

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const element = document.createElement('div')
      element.className = 'mock-watermark'
      element.textContent = Array.isArray(finalConfig.content) 
        ? finalConfig.content.join('\n') 
        : finalConfig.content

      // 设置样式
      Object.assign(element.style, {
        position: 'absolute',
        left: `${col * gapX}px`,
        top: `${row * gapY}px`,
        fontSize: `${finalConfig.style?.fontSize || 16}px`,
        color: finalConfig.style?.color || 'rgba(0, 0, 0, 0.15)',
        opacity: String(finalConfig.style?.opacity || 1),
        transform: `rotate(${finalConfig.style?.rotate || -22}deg)`,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: String(finalConfig.zIndex || 1000),
        whiteSpace: 'pre-line'
      })

      containerElement.appendChild(element)
      elements.push(element)
    }
  }

  const instance: WatermarkInstance = {
    id: instanceId,
    config: finalConfig,
    container: containerElement,
    elements,
    visible: true,
    createdAt: now,
    updatedAt: now
  }

  instances.set(instanceId, instance)

  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 10))

  return instance
}

/**
 * 销毁水印实例
 */
export async function destroyWatermark(instance: WatermarkInstance): Promise<void> {
  if (!instance) return

  // 移除DOM元素
  instance.elements.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element)
    }
  })

  // 从存储中移除
  instances.delete(instance.id)

  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 10))
}

/**
 * 获取所有实例
 */
export function getAllInstances(): WatermarkInstance[] {
  return Array.from(instances.values())
}

/**
 * 根据ID获取实例
 */
export function getInstance(id: string): WatermarkInstance | undefined {
  return instances.get(id)
}

/**
 * 默认配置
 */
export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  content: 'Watermark',
  style: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.15)',
    opacity: 1,
    rotate: -22
  },
  layout: {
    gapX: 100,
    gapY: 80
  },
  renderMode: 'dom',
  zIndex: 1000
}
