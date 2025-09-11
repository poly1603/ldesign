/**
 * 渲染器工厂
 */

import type {
  BaseRenderer,
  RendererFactory as IRendererFactory,
  WatermarkConfig,
} from '../types'

import {
  ErrorSeverity,
  WatermarkError,
  WatermarkErrorCode,
} from '../types/error'
import { CanvasRendererImpl } from './canvas-renderer'
import { DOMRendererImpl } from './dom-renderer'
import { SVGRendererImpl } from './svg-renderer'

/**
 * 渲染器工厂
 * 根据配置创建合适的渲染器
 */
export class RendererFactory implements IRendererFactory {
  private renderers = new Map<string, BaseRenderer>()
  private defaultRenderer: BaseRenderer

  constructor() {
    // 注册默认渲染器
    this.registerRenderer('dom', new DOMRendererImpl() as any)
    this.registerRenderer('canvas', new CanvasRendererImpl() as any)
    this.registerRenderer('svg', new SVGRendererImpl() as any)

    // 设置默认渲染器
    this.defaultRenderer = this.renderers.get('dom')!
  }

  /**
   * 创建渲染器
   */
  createRenderer(config: WatermarkConfig): BaseRenderer {
    // 首先尝试使用renderMode，如果不存在再使用mode
    const mode = config.renderMode || config.mode || 'dom'

    // 检查浏览器兼容性
    if (!this.isRendererSupported(mode)) {
      console.warn(
        `Renderer '${mode}' is not supported, falling back to DOM renderer`,
      )
      return this.defaultRenderer
    }

    const renderer = this.renderers.get(mode)
    if (!renderer) {
      throw new WatermarkError(
        `Renderer '${mode}' is not registered`,
        WatermarkErrorCode.RENDERER_NOT_FOUND,
        ErrorSeverity.HIGH,
        { context: { mode } },
      )
    }

    return renderer
  }

  /**
   * 注册渲染器
   */
  registerRenderer(name: string, renderer: BaseRenderer): void {
    this.renderers.set(name, renderer)
  }

  /**
   * 注销渲染器
   */
  unregisterRenderer(name: string): boolean {
    return this.renderers.delete(name)
  }

  /**
   * 获取渲染器
   */
  getRenderer(name: string): BaseRenderer | undefined {
    return this.renderers.get(name)
  }

  /**
   * 获取所有注册的渲染器名称
   */
  getRegisteredRenderers(): string[] {
    return Array.from(this.renderers.keys())
  }

  /**
   * 检查渲染器是否支持
   */
  isRendererSupported(mode: string): boolean {
    const renderer = this.renderers.get(mode)
    if (!renderer) {
      return false
    }
    
    // 优先使用渲染器自身的 isSupported 方法
    if (typeof (renderer as any).isSupported === 'function') {
      return (renderer as any).isSupported()
    }
    
    // 备用检查逻辑
    switch (mode) {
      case 'dom':
        return true // DOM渲染器总是支持的

      case 'canvas':
        return this.isCanvasSupported()

      case 'svg':
        return this.isSVGSupported()

      default:
        return this.renderers.has(mode)
    }
  }

  /**
   * 获取推荐的渲染器
   */
  getRecommendedRenderer(config: WatermarkConfig): string {
    // 根据配置特性推荐最适合的渲染器

    // 如果需要复杂动画，推荐Canvas
    if (
      config.animation
      && config.animation.type !== 'none'
      && config.animation.type !== 'fade'
    ) {
      if (this.isCanvasSupported()) {
        return 'canvas'
      }
    }

    // 如果需要高质量图片渲染，推荐Canvas
    if (
      typeof config.content === 'object'
      && config.content?.image
      && this.isCanvasSupported()
    ) {
      return 'canvas'
    }

    // 如果需要矢量图形，推荐SVG
    if (config.style?.vectorGraphics && this.isSVGSupported()) {
      return 'svg'
    }

    // 如果需要高性能，推荐Canvas
    if (config.performance?.highPerformance && this.isCanvasSupported()) {
      return 'canvas'
    }

    // 默认推荐DOM渲染器（兼容性最好）
    return 'dom'
  }

  /**
   * 获取渲染器能力信息
   */
  getRendererCapabilities(name: string): {
    supportsAnimation: boolean
    supportsTransparency: boolean
    supportsBlending: boolean
    supportsFilters: boolean
    performance: 'low' | 'medium' | 'high'
  } {
    switch (name) {
      case 'dom':
        return {
          supportsAnimation: true,
          supportsTransparency: true,
          supportsBlending: true,
          supportsFilters: true,
          performance: 'medium',
        }

      case 'canvas':
        return {
          supportsAnimation: true,
          supportsTransparency: true,
          supportsBlending: true,
          supportsFilters: false,
          performance: 'high',
        }

      case 'svg':
        return {
          supportsAnimation: true,
          supportsTransparency: true,
          supportsBlending: true,
          supportsFilters: true,
          performance: 'low',
        }

      default:
        return {
          supportsAnimation: false,
          supportsTransparency: false,
          supportsBlending: false,
          supportsFilters: false,
          performance: 'low',
        }
    }
  }

  /**
   * 设置默认渲染器
   */
  setDefaultRenderer(name: string): void {
    const renderer = this.renderers.get(name)
    if (!renderer) {
      throw new WatermarkError(
        `Cannot set default renderer: '${name}' is not registered`,
        WatermarkErrorCode.RENDERER_NOT_FOUND,
        ErrorSeverity.MEDIUM,
        { context: { name } },
      )
    }

    this.defaultRenderer = renderer
  }

  /**
   * 获取默认渲染器
   */
  getDefaultRenderer(): BaseRenderer {
    return this.defaultRenderer
  }

  /**
   * 清理所有渲染器
   */
  dispose(): void {
    for (const renderer of this.renderers.values()) {
      if (typeof (renderer as any).dispose === 'function') {
        ;(renderer as any).dispose()
      }
    }
    this.renderers.clear()
  }

  // 私有方法

  private isCanvasSupported(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext && canvas.getContext('2d'))
    }
    catch {
      return false
    }
  }

  private isSVGSupported(): boolean {
    try {
      return !!(
        document.createElementNS
        && document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          .createSVGRect
      )
    }
    catch {
      return false
    }
  }

  // 实现RendererFactory接口的缺失方法
  createDOMRenderer(): any {
    return new DOMRendererImpl()
  }

  createCanvasRenderer(): any {
    return new CanvasRendererImpl()
  }

  createSVGRenderer(): any {
    return new SVGRendererImpl()
  }
}
