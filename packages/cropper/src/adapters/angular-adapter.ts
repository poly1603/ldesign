/**
 * @file Angular 适配器
 * @description Angular 框架的裁剪器适配器
 */

import { BaseAdapter, type AdapterOptions, AdapterState } from './base-adapter'
import type { CropperEventType } from '@/types'

/**
 * Angular 适配器配置
 */
export interface AngularAdapterOptions extends AdapterOptions {
  /** Angular 组件实例 */
  component?: any
  /** 是否使用 Zone.js */
  useZone?: boolean
}

/**
 * Angular 适配器类
 */
export class AngularAdapter extends BaseAdapter {
  /** Angular 适配器配置 */
  protected override options: AngularAdapterOptions

  /** Angular 组件实例 */
  private component?: any

  /** Zone.js 实例 */
  private zone?: any

  /** 默认配置 */
  protected static readonly DEFAULT_ANGULAR_OPTIONS: AngularAdapterOptions = {
    ...BaseAdapter.DEFAULT_OPTIONS,
    useZone: true,
  }

  /**
   * 构造函数
   * @param container 容器元素或选择器
   * @param options Angular 适配器配置
   */
  constructor(container: HTMLElement | string, options: Partial<AngularAdapterOptions> = {}) {
    const mergedOptions = { ...AngularAdapter.DEFAULT_ANGULAR_OPTIONS, ...options }
    super(container, mergedOptions)
    this.options = mergedOptions
    this.component = options.component
    
    // 尝试获取 Zone.js
    if (this.options.useZone && typeof window !== 'undefined') {
      this.zone = (window as any).Zone?.current
    }
  }

  /**
   * 框架特定的初始化
   */
  protected override async onInit(): Promise<void> {
    // Angular 特定的初始化逻辑
    if (this.component && this.component.ngZone) {
      this.zone = this.component.ngZone
    }
  }

  /**
   * 框架特定的销毁
   */
  protected override onDestroy(): void {
    // Angular 特定的清理逻辑
    this.component = undefined
    this.zone = undefined
  }

  /**
   * 在 Angular Zone 中运行函数
   * @param fn 要执行的函数
   */
  private runInZone<T>(fn: () => T): T {
    if (this.zone && this.zone.run) {
      return this.zone.run(fn)
    }
    return fn()
  }

  /**
   * 重写事件触发，确保在 Angular Zone 中执行
   */
  protected override emit(type: CropperEventType, data?: any): void {
    this.runInZone(() => {
      super.emit(type, data)
    })
  }
  /**
   * 获取默认配置（公开）
   */
  static getDefaultAngularOptions(): AngularAdapterOptions {
    return { ...AngularAdapter.DEFAULT_ANGULAR_OPTIONS }
  }
}

/**
 * Angular 指令配置接口
 */
export interface CropperDirectiveConfig extends Partial<AngularAdapterOptions> {
  /** 图片源 */
  src?: string | File | HTMLImageElement
  /** 裁剪数据 */
  cropData?: any
}

/**
 * Angular 服务接口
 */
export interface CropperService {
  /** 创建适配器实例 */
  createAdapter(container: HTMLElement, options?: Partial<AngularAdapterOptions>): Promise<AngularAdapter>
  /** 销毁适配器实例 */
  destroyAdapter(adapter: AngularAdapter): void
  /** 获取默认配置 */
  getDefaultOptions(): AngularAdapterOptions
}

/**
 * Angular 组件接口
 */
export interface CropperComponentInterface {
  /** 图片源输入 */
  src: string | File | HTMLImageElement | null
  /** 配置选项输入 */
  options: Partial<AngularAdapterOptions>
  /** 裁剪数据输入/输出 */
  cropData: any
  /** 准备就绪事件 */
  ready: any // EventEmitter<AngularAdapter>
  /** 裁剪开始事件 */
  cropStart: any // EventEmitter<any>
  /** 裁剪移动事件 */
  cropMove: any // EventEmitter<any>
  /** 裁剪结束事件 */
  cropEnd: any // EventEmitter<any>
  /** 缩放事件 */
  onZoom: any // EventEmitter<any>
  /** 错误事件 */
  error: any // EventEmitter<Error>
  
  /** 适配器实例 */
  adapter: AngularAdapter | null
  /** 是否已准备就绪 */
  isReady: boolean
  /** 适配器状态 */
  state: AdapterState
  
  /** 组件初始化 */
  ngOnInit(): void
  /** 组件销毁 */
  ngOnDestroy(): void
  /** 输入变化处理 */
  ngOnChanges(changes: any): void
  
  /** 加载图片 */
  loadImage(source: string | File | HTMLImageElement): Promise<void>
  /** 获取裁剪数据 */
  getCropData(): any
  /** 设置裁剪数据 */
  setCropData(data: any): void
  /** 获取裁剪后的Canvas */
  getCroppedCanvas(options?: any): HTMLCanvasElement | null
  /** 获取裁剪后的Data URL */
  getCroppedDataURL(format?: string, quality?: number): string | null
  /** 获取裁剪后的Blob */
  getCroppedBlob(format?: string, quality?: number): Promise<Blob | null>
  /** 缩放 */
  zoom(ratio: number): void
  /** 旋转 */
  rotate(degree: number): void
  /** 翻转 */
  flip(horizontal?: boolean, vertical?: boolean): void
  /** 重置 */
  reset(): void
}

/**
 * Angular 模块配置接口
 */
export interface CropperModuleConfig {
  /** 默认配置 */
  defaultOptions?: Partial<AngularAdapterOptions>
  /** 是否提供服务 */
  provideService?: boolean
  /** 是否声明组件 */
  declareComponent?: boolean
  /** 是否声明指令 */
  declareDirective?: boolean
}

/**
 * 创建 Angular 服务的工厂函数
 */
export function createCropperService(): any {
  // 这里需要实际的 Angular 服务实现
  // 由于我们在纯 TypeScript 环境中，这里只提供接口定义
  
  return class CropperServiceImpl implements CropperService {
    async createAdapter(
      container: HTMLElement,
      options: Partial<AngularAdapterOptions> = {}
    ): Promise<AngularAdapter> {
      const adapter = new AngularAdapter(container, {
        ...options,
        autoInit: false,
      })
      await adapter.init(container)
      return adapter
    }

    destroyAdapter(adapter: AngularAdapter): void {
      adapter.destroy()
    }

    getDefaultOptions(): AngularAdapterOptions {
      return AngularAdapter.getDefaultAngularOptions()
    }
  }
}

/**
 * 创建 Angular 组件的工厂函数
 */
export function createCropperComponent(): any {
  // 这里需要实际的 Angular 组件实现
  // 由于我们在纯 TypeScript 环境中，这里只提供接口定义
  
  throw new Error('CropperComponent must be used in an Angular environment')
}

/**
 * 创建 Angular 指令的工厂函数
 */
export function createCropperDirective(): any {
  // 这里需要实际的 Angular 指令实现
  // 由于我们在纯 TypeScript 环境中，这里只提供接口定义
  
  throw new Error('CropperDirective must be used in an Angular environment')
}

/**
 * 创建 Angular 模块的工厂函数
 */
export function createCropperModule(config: CropperModuleConfig = {}): any {
  // 这里需要实际的 Angular 模块实现
  // 由于我们在纯 TypeScript 环境中，这里只提供接口定义
  
  throw new Error('CropperModule must be used in an Angular environment')
}

/**
 * 默认导出
 */
export default AngularAdapter

/**
 * 使用示例（注释形式，实际使用时需要在 Angular 环境中）
 */

/*
// 服务使用示例
@Injectable({
  providedIn: 'root'
})
export class MyCropperService {
  constructor(private cropperService: CropperService) {}

  async createCropper(container: HTMLElement) {
    return await this.cropperService.createAdapter(container, {
      aspectRatio: 16 / 9,
      quality: 0.8
    })
  }
}

// 组件使用示例
@Component({
  selector: 'app-my-cropper',
  template: `
    <l-cropper
      [src]="imageSrc"
      [options]="cropperOptions"
      [(cropData)]="cropData"
      (ready)="onReady($event)"
      (cropEnd)="onCropEnd($event)"
      (error)="onError($event)">
    </l-cropper>
  `
})
export class MyCropperComponent {
  imageSrc = '/path/to/image.jpg'
  cropperOptions = { aspectRatio: 1 }
  cropData: any = null

  onReady(adapter: AngularAdapter) {
    console.log('Cropper ready:', adapter)
  }

  onCropEnd(data: any) {
    console.log('Crop ended:', data)
  }

  onError(error: Error) {
    console.error('Cropper error:', error)
  }
}

// 指令使用示例
@Component({
  selector: 'app-directive-example',
  template: `
    <div lCropper
         [src]="imageSrc"
         [cropperOptions]="options"
         (cropperReady)="onReady($event)">
    </div>
  `
})
export class DirectiveExampleComponent {
  imageSrc = '/path/to/image.jpg'
  options = { aspectRatio: 16 / 9 }

  onReady(adapter: AngularAdapter) {
    console.log('Cropper ready:', adapter)
  }
}

// 模块配置示例
@NgModule({
  imports: [
    CropperModule.forRoot({
      defaultOptions: {
        aspectRatio: 16 / 9,
        quality: 0.8
      },
      provideService: true,
      declareComponent: true,
      declareDirective: true
    })
  ]
})
export class AppModule {}
*/
