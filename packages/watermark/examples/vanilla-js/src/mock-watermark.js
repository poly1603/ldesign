/**
 * 水印模拟实现 - 用于原生 JavaScript 示例项目
 */

// 模拟实例存储
const instances = new Map()
let instanceCounter = 0

/**
 * 创建水印实例
 */
export async function createWatermark(container, config = {}) {
  const containerElement
    = typeof container === 'string'
      ? document.querySelector(container)
      : container

  if (!containerElement) {
    throw new Error('Container element not found')
  }

  // 清除现有水印
  const existingElements = containerElement.querySelectorAll('.mock-watermark')
  existingElements.forEach(el => el.remove())

  const instanceId = `watermark-${++instanceCounter}`
  const now = Date.now()

  const finalConfig = {
    content: 'Mock Watermark',
    style: {
      fontSize: 16,
      color: 'rgba(0, 0, 0, 0.15)',
      opacity: 1,
      rotate: -22,
      ...config.style,
    },
    layout: {
      gapX: 100,
      gapY: 80,
      ...config.layout,
    },
    renderMode: 'dom',
    zIndex: 1000,
    ...config,
  }

  // 创建水印元素
  const elements = []
  const containerRect = containerElement.getBoundingClientRect()
  const { gapX = 100, gapY = 80 } = finalConfig.layout

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
        fontSize: `${finalConfig.style.fontSize}px`,
        color: finalConfig.style.color,
        opacity: String(finalConfig.style.opacity),
        transform: `rotate(${finalConfig.style.rotate}deg)`,
        pointerEvents: 'none',
        userSelect: 'none',
        zIndex: String(finalConfig.zIndex),
        whiteSpace: 'pre-line',
      })

      containerElement.appendChild(element)
      elements.push(element)
    }
  }

  const instance = {
    id: instanceId,
    config: finalConfig,
    container: containerElement,
    elements,
    visible: true,
    createdAt: now,
    updatedAt: now,
  }

  instances.set(instanceId, instance)

  // 模拟异步操作
  await new Promise(resolve => setTimeout(resolve, 10))

  return instance
}

/**
 * 销毁水印实例
 */
export async function destroyWatermark(instance) {
  if (!instance)
    return

  // 移除DOM元素
  instance.elements.forEach((element) => {
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
 * 水印核心类 - 模拟实现
 */
export class WatermarkCore {
  constructor(config = {}) {
    this.config = config
    this.instances = new Map()
  }

  async create(container, config) {
    return await createWatermark(container, { ...this.config, ...config })
  }

  async destroy(instance) {
    return await destroyWatermark(instance)
  }

  getInstances() {
    return Array.from(instances.values())
  }
}

/**
 * 默认配置
 */
export const DEFAULT_WATERMARK_CONFIG = {
  content: 'Watermark',
  style: {
    fontSize: 16,
    color: 'rgba(0, 0, 0, 0.15)',
    opacity: 1,
    rotate: -22,
  },
  layout: {
    gapX: 100,
    gapY: 80,
  },
  renderMode: 'dom',
  zIndex: 1000,
}

/**
 * 获取所有实例
 */
export function getAllInstances() {
  return Array.from(instances.values())
}

/**
 * 根据ID获取实例
 */
export function getInstance(id) {
  return instances.get(id)
}
