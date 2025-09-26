/**
 * @ldesign/cropper Angular 适配器
 * 
 * 提供Angular框架的完整集成支持
 */

import { 
  Component, 
  Directive, 
  Injectable, 
  Input, 
  Output, 
  EventEmitter, 
  ElementRef, 
  OnInit, 
  OnDestroy, 
  OnChanges, 
  SimpleChanges,
  NgModule,
  Pipe,
  PipeTransform
} from '@angular/core';
import { Cropper } from '../../core/Cropper';
import type { 
  AngularAdapter, 
  AngularCropperInputs, 
  AngularCropperOutputs,
  AngularCropperService,
  AdapterConfig 
} from '../../types/adapters';
import type { CropperConfig } from '../../types/config';
import type { CropperEvent } from '../../types/events';
import { generateId } from '../../utils/common';

// ============================================================================
// Angular 服务
// ============================================================================

/**
 * Angular 裁剪器服务
 */
@Injectable({
  providedIn: 'root'
})
export class LCropperService implements AngularCropperService {
  private activeCroppers: Map<string, Cropper> = new Map();
  private globalConfig: Partial<CropperConfig> = {};

  /**
   * 创建裁剪器实例
   */
  async createCropper(container: ElementRef, config?: Partial<CropperConfig>): Promise<Cropper> {
    const finalConfig = {
      ...this.globalConfig,
      ...config,
      container: container.nativeElement
    };
    
    const cropper = new Cropper(container.nativeElement, finalConfig);
    const id = generateId('cropper');
    this.activeCroppers.set(id, cropper);
    
    // 监听销毁事件
    cropper.on('destroy', () => {
      this.activeCroppers.delete(id);
    });
    
    return cropper;
  }

  /**
   * 销毁裁剪器实例
   */
  destroyCropper(cropper: Cropper): void {
    cropper.destroy();
    
    // 从活动列表中移除
    for (const [id, instance] of this.activeCroppers.entries()) {
      if (instance === cropper) {
        this.activeCroppers.delete(id);
        break;
      }
    }
  }

  /**
   * 获取所有活动的裁剪器实例
   */
  getActiveCroppers(): Cropper[] {
    return Array.from(this.activeCroppers.values());
  }

  /**
   * 设置全局配置
   */
  setGlobalConfig(config: Partial<CropperConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
  }

  /**
   * 获取全局配置
   */
  getGlobalConfig(): Partial<CropperConfig> {
    return { ...this.globalConfig };
  }
}

// ============================================================================
// Angular 组件
// ============================================================================

/**
 * Angular 裁剪器组件
 */
@Component({
  selector: 'l-cropper',
  template: `
    <div 
      #container
      [id]="containerId"
      class="lcropper-container"
      [class.lcropper-disabled]="disabled"
      [class.lcropper-readonly]="readonly"
      [class.lcropper-loading]="loading">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .lcropper-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    
    .lcropper-disabled {
      pointer-events: none;
      opacity: 0.6;
    }
    
    .lcropper-readonly {
      pointer-events: none;
    }
    
    .lcropper-loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid #ccc;
      border-top-color: #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LCropperComponent implements OnInit, OnDestroy, OnChanges, AngularCropperInputs, AngularCropperOutputs {
  @Input() config?: Partial<CropperConfig>;
  @Input() src?: string | File | HTMLImageElement;
  @Input() disabled?: boolean = false;
  @Input() readonly?: boolean = false;

  @Output() ready = new EventEmitter<Cropper>();
  @Output() imageLoad = new EventEmitter<CropperEvent>();
  @Output() cropChange = new EventEmitter<CropperEvent>();
  @Output() transform = new EventEmitter<CropperEvent>();
  @Output() export = new EventEmitter<CropperEvent>();
  @Output() error = new EventEmitter<Error>();

  public containerId = `lcropper-${generateId()}`;
  public loading = false;
  public cropper: Cropper | null = null;

  constructor(
    private elementRef: ElementRef,
    private cropperService: LCropperService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeCropper();
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['src'] && this.cropper && changes['src'].currentValue) {
      await this.setImage(changes['src'].currentValue);
    }

    if (changes['disabled'] && this.cropper) {
      this.cropper.setEnabled(!changes['disabled'].currentValue);
    }

    if (changes['config'] && this.cropper && !changes['config'].firstChange) {
      this.cropper.updateConfig(changes['config'].currentValue);
    }
  }

  /**
   * 初始化裁剪器
   */
  private async initializeCropper(): Promise<void> {
    try {
      this.loading = true;
      
      this.cropper = await this.cropperService.createCropper(this.elementRef, this.config);
      
      // 绑定事件
      this.cropper.on('ready', (event: CropperEvent) => {
        this.ready.emit(this.cropper!);
      });
      
      this.cropper.on('imageLoad', (event: CropperEvent) => {
        this.imageLoad.emit(event);
      });
      
      this.cropper.on('cropChange', (event: CropperEvent) => {
        this.cropChange.emit(event);
      });
      
      this.cropper.on('transform', (event: CropperEvent) => {
        this.transform.emit(event);
      });
      
      this.cropper.on('export', (event: CropperEvent) => {
        this.export.emit(event);
      });
      
      this.cropper.on('error', (err: Error) => {
        this.error.emit(err);
      });
      
      // 设置图片源
      if (this.src) {
        await this.cropper.setImage(this.src);
      }
      
    } catch (err) {
      this.error.emit(err as Error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * 设置图片源
   */
  async setImage(src: string | File | HTMLImageElement): Promise<void> {
    if (!this.cropper) return;
    
    try {
      this.loading = true;
      await this.cropper.setImage(src);
    } catch (err) {
      this.error.emit(err as Error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * 获取裁剪数据
   */
  getCropData(): any {
    return this.cropper?.getCropData();
  }

  /**
   * 导出图片
   */
  async exportImage(options?: any): Promise<Blob> {
    if (!this.cropper) {
      throw new Error('Cropper not initialized');
    }
    return await this.cropper.export(options);
  }

  /**
   * 重置裁剪器
   */
  reset(): void {
    this.cropper?.reset();
  }

  /**
   * 销毁裁剪器
   */
  private destroyCropper(): void {
    if (this.cropper) {
      this.cropperService.destroyCropper(this.cropper);
      this.cropper = null;
    }
  }
}

// ============================================================================
// Angular 指令
// ============================================================================

/**
 * Angular 裁剪器指令
 */
@Directive({
  selector: '[lCropper]'
})
export class LCropperDirective implements OnInit, OnDestroy, OnChanges {
  @Input('lCropper') config?: Partial<CropperConfig>;
  @Input() src?: string | File | HTMLImageElement;

  private cropper: Cropper | null = null;

  constructor(
    private elementRef: ElementRef,
    private cropperService: LCropperService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeCropper();
  }

  ngOnDestroy(): void {
    this.destroyCropper();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['src'] && this.cropper && changes['src'].currentValue) {
      await this.cropper.setImage(changes['src'].currentValue);
    }

    if (changes['config'] && this.cropper && !changes['config'].firstChange) {
      this.cropper.updateConfig(changes['config'].currentValue);
    }
  }

  /**
   * 初始化裁剪器
   */
  private async initializeCropper(): Promise<void> {
    try {
      this.cropper = await this.cropperService.createCropper(this.elementRef, this.config);
      
      if (this.src) {
        await this.cropper.setImage(this.src);
      }
    } catch (err) {
      console.error('Failed to initialize cropper:', err);
    }
  }

  /**
   * 销毁裁剪器
   */
  private destroyCropper(): void {
    if (this.cropper) {
      this.cropperService.destroyCropper(this.cropper);
      this.cropper = null;
    }
  }
}

// ============================================================================
// Angular 管道
// ============================================================================

/**
 * 裁剪数据格式化管道
 */
@Pipe({
  name: 'cropData'
})
export class CropDataPipe implements PipeTransform {
  transform(cropper: Cropper | null, format: 'json' | 'string' = 'json'): any {
    if (!cropper) return null;
    
    const data = cropper.getCropData();
    
    if (format === 'string') {
      return JSON.stringify(data, null, 2);
    }
    
    return data;
  }
}

// ============================================================================
// Angular 模块
// ============================================================================

/**
 * Angular 裁剪器模块
 */
@NgModule({
  declarations: [
    LCropperComponent,
    LCropperDirective,
    CropDataPipe
  ],
  exports: [
    LCropperComponent,
    LCropperDirective,
    CropDataPipe
  ],
  providers: [
    LCropperService
  ]
})
export class LCropperModule {}

// ============================================================================
// Angular 适配器类
// ============================================================================

/**
 * Angular 适配器类
 */
export class AngularCropperAdapter implements AngularAdapter {
  public readonly framework = 'angular' as const;
  public readonly version = '1.0.0';
  public initialized = false;
  
  private config: AdapterConfig;

  constructor(config: AdapterConfig = { framework: 'angular' }) {
    this.config = {
      componentName: 'LCropper',
      directiveName: 'lCropper',
      development: false,
      debug: false,
      ...config
    };
  }

  // ============================================================================
  // 适配器生命周期
  // ============================================================================

  /**
   * 初始化适配器
   */
  initialize(): void {
    if (this.initialized) return;
    
    this.initialized = true;
    
    if (this.config.debug) {
      console.log('[LCropper Angular] Adapter initialized');
    }
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    this.initialized = false;
    
    if (this.config.debug) {
      console.log('[LCropper Angular] Adapter destroyed');
    }
  }

  // ============================================================================
  // 组件适配器接口实现
  // ============================================================================

  /**
   * 创建组件实例
   */
  createComponent(config: AngularCropperInputs): any {
    return LCropperComponent;
  }

  /**
   * 更新组件属性
   */
  updateProps(instance: any, props: Partial<AngularCropperInputs>): void {
    // Angular会自动处理属性更新
    if (this.config.debug) {
      console.log('[LCropper Angular] Props updated:', props);
    }
  }

  /**
   * 绑定事件
   */
  bindEvents(instance: any, events: Record<string, Function>): void {
    // Angular事件绑定通过组件输出处理
    if (this.config.debug) {
      console.log('[LCropper Angular] Events bound:', Object.keys(events));
    }
  }

  /**
   * 解绑事件
   */
  unbindEvents(instance: any): void {
    // Angular会自动清理事件监听器
    if (this.config.debug) {
      console.log('[LCropper Angular] Events unbound');
    }
  }

  // ============================================================================
  // Angular 特定方法
  // ============================================================================

  /**
   * 创建Angular模块
   */
  createModule(): any {
    return LCropperModule;
  }

  /**
   * 创建Angular组件
   */
  createComponent(): any {
    return LCropperComponent;
  }

  /**
   * 创建Angular指令
   */
  createDirective(): any {
    return LCropperDirective;
  }

  /**
   * 创建Angular服务
   */
  createService(): any {
    return LCropperService;
  }

  /**
   * 创建Angular管道
   */
  createPipe(): any {
    return CropDataPipe;
  }
}

// ============================================================================
// 默认导出
// ============================================================================

/**
 * 创建Angular适配器实例
 */
export function createAngularAdapter(config?: AdapterConfig): AngularCropperAdapter {
  return new AngularCropperAdapter(config);
}

/**
 * 默认适配器实例
 */
export const angularAdapter = createAngularAdapter();

/**
 * 默认导出
 */
export default {
  LCropperModule,
  LCropperComponent,
  LCropperDirective,
  LCropperService,
  CropDataPipe,
  createAngularAdapter,
  angularAdapter
};
