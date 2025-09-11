/**
 * 渲染器工厂的测试Mock实现
 */

import type {
  BaseRenderer,
  RendererFactory as IRendererFactory,
  WatermarkConfig,
} from '../../src/types'

import { DOMRendererImpl } from '../../src/renderers/dom-renderer'

/**
 * Mock渲染器基类
 */
export class MockBaseRenderer implements BaseRenderer {
  type: string
  supportsAnimation: boolean = true
  supportsOpacity: boolean = true

  constructor(type: string) {
    this.type = type
  }

  isSupported(): boolean {
    return true
  }

  async render(): Promise<HTMLElement[]> {
    const div = document.createElement('div')
    div.setAttribute('data-watermark-renderer', this.type)
    return [div]
  }

  async update(): Promise<void> {
    // Mock实现
  }

  async destroy(): Promise<void> {
    // Mock实现
  }

  getType(): string {
    return this.type
  }

  async applyAnimation(): Promise<void> {
    // Mock实现
  }

  applyStyles(): void {
    // Mock实现
  }

  cleanup(): void {
    // Mock实现
  }
}

/**
 * Mock DOM渲染器
 */
export class MockDOMRenderer extends MockBaseRenderer {
  constructor() {
    super('dom')
  }
}

/**
 * Mock Canvas渲染器
 */
export class MockCanvasRenderer extends MockBaseRenderer {
  constructor() {
    super('canvas')
  }
}

/**
 * Mock SVG渲染器
 */
export class MockSVGRenderer extends MockBaseRenderer {
  constructor() {
    super('svg')
  }
}

/**
 * Mock渲染器工厂
 */
export class MockRendererFactory implements IRendererFactory {
  private renderers = new Map<string, BaseRenderer>()
  private defaultRenderer: BaseRenderer

  constructor() {
    // 注册Mock渲染器
    this.registerRenderer('dom', new MockDOMRenderer())
    this.registerRenderer('canvas', new MockCanvasRenderer())
    this.registerRenderer('svg', new MockSVGRenderer())

    // 实际DOM渲染器可以保留，它在测试中工作良好
    this.registerRenderer('real-dom', new DOMRendererImpl() as any)

    // 设置默认渲染器
    this.defaultRenderer = this.renderers.get('dom')!
  }

  createRenderer(config: WatermarkConfig): BaseRenderer {
    const mode = config.renderMode || config.mode || 'dom'
    return this.renderers.get(mode) || this.defaultRenderer
  }

  registerRenderer(name: string, renderer: BaseRenderer): void {
    this.renderers.set(name, renderer)
  }

  unregisterRenderer(name: string): boolean {
    return this.renderers.delete(name)
  }

  getRenderer(name: string): BaseRenderer | undefined {
    return this.renderers.get(name)
  }

  getRegisteredRenderers(): string[] {
    return Array.from(this.renderers.keys())
  }

  isRendererSupported(mode: string): boolean {
    return true // 在测试中所有渲染器都支持
  }

  getRecommendedRenderer(): string {
    return 'dom'
  }

  getRendererCapabilities(name: string): any {
    return {
      supportsAnimation: true,
      supportsTransparency: true,
      supportsBlending: true,
      supportsFilters: true,
      performance: 'high',
    }
  }

  setDefaultRenderer(name: string): void {
    const renderer = this.renderers.get(name)
    if (renderer) {
      this.defaultRenderer = renderer
    }
  }

  getDefaultRenderer(): BaseRenderer {
    return this.defaultRenderer
  }

  dispose(): void {
    this.renderers.clear()
  }

  createDOMRenderer(): BaseRenderer {
    return new MockDOMRenderer()
  }

  createCanvasRenderer(): BaseRenderer {
    return new MockCanvasRenderer()
  }

  createSVGRenderer(): BaseRenderer {
    return new MockSVGRenderer()
  }
}
