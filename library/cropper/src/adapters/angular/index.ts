/**
 * @file Angular 适配器
 * @description 为 Angular 提供的裁剪器组件
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  forwardRef,
  ChangeDetectionStrategy,
  NgModule,
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { CommonModule } from '@angular/common'

import { Cropper } from '../../core/Cropper'
import type {
  CropperOptions,
  CropData,
  ImageInfo,
  ImageSource,
  CropperEventType,
  CropOutputOptions,
} from '../../types'

/**
 * Angular 裁剪器组件
 */
@Component({
  selector: 'ng-cropper',
  template: `
    <div
      #container
      class="angular-cropper-container"
      [class]="containerClass"
      [style]="containerStyle"
    ></div>
  `,
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AngularCropperComponent),
      multi: true,
    },
  ],
})
export class AngularCropperComponent
  implements OnInit, OnDestroy, OnChanges, ControlValueAccessor
{
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>

  // 输入属性
  @Input() src?: ImageSource
  @Input() immediate = true
  @Input() containerClass = ''
  @Input() containerStyle: Record<string, any> = {}

  // 裁剪器配置
  @Input() shape: CropperOptions['shape'] = 'rectangle'
  @Input() aspectRatio = 0
  @Input() initialCrop?: CropperOptions['initialCrop']
  @Input() minCropSize?: CropperOptions['minCropSize']
  @Input() maxCropSize?: CropperOptions['maxCropSize']
  @Input() movable = true
  @Input() resizable = true
  @Input() zoomable = true
  @Input() rotatable = true
  @Input() zoomRange: [number, number] = [0.1, 10]
  @Input() backgroundColor = '#000000'
  @Input() maskOpacity = 0.6
  @Input() guides = true
  @Input() centerLines = false
  @Input() responsive = true
  @Input() touchEnabled = true
  @Input() autoCrop = true
  @Input() preview?: CropperOptions['preview']

  // 输出事件
  @Output() ready = new EventEmitter<void>()
  @Output() imageLoaded = new EventEmitter<ImageInfo>()
  @Output() imageError = new EventEmitter<Error>()
  @Output() cropChange = new EventEmitter<CropData>()
  @Output() cropStart = new EventEmitter<void>()
  @Output() cropMove = new EventEmitter<CropData>()
  @Output() cropEnd = new EventEmitter<CropData>()
  @Output() zoomChange = new EventEmitter<number>()
  @Output() rotationChange = new EventEmitter<number>()
  @Output() flipChange = new EventEmitter<{ flipX: boolean; flipY: boolean }>()
  @Output() dragStart = new EventEmitter<void>()
  @Output() dragMove = new EventEmitter<CropData>()
  @Output() dragEnd = new EventEmitter<CropData>()
  @Output() reset = new EventEmitter<void>()
  @Output() destroy = new EventEmitter<void>()

  // 内部状态
  private cropper: Cropper | null = null
  private isReady = false

  // ControlValueAccessor 实现
  private onChange = (value: CropData | null) => {}
  private onTouched = () => {}

  ngOnInit(): void {
    if (this.immediate) {
      this.initCropper()
    }
  }

  ngOnDestroy(): void {
    this.destroyCropper()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 监听 src 变化
    if (changes['src'] && !changes['src'].firstChange && this.cropper) {
      if (this.src) {
        this.setImage(this.src)
      }
    }
  }

  /**
   * 初始化裁剪器
   */
  async initCropper(): Promise<void> {
    if (!this.containerRef?.nativeElement) return

    try {
      const options: CropperOptions = {
        container: this.containerRef.nativeElement,
        shape: this.shape,
        aspectRatio: this.aspectRatio,
        initialCrop: this.initialCrop,
        minCropSize: this.minCropSize,
        maxCropSize: this.maxCropSize,
        movable: this.movable,
        resizable: this.resizable,
        zoomable: this.zoomable,
        rotatable: this.rotatable,
        zoomRange: this.zoomRange,
        backgroundColor: this.backgroundColor,
        maskOpacity: this.maskOpacity,
        guides: this.guides,
        centerLines: this.centerLines,
        responsive: this.responsive,
        touchEnabled: this.touchEnabled,
        autoCrop: this.autoCrop,
        preview: this.preview,
      }

      this.cropper = new Cropper(options)
      this.bindEvents()

      // 如果有初始图片源，加载它
      if (this.src) {
        await this.setImage(this.src)
      }
    } catch (error) {
      console.error('初始化裁剪器失败:', error)
      this.imageError.emit(error as Error)
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.cropper) return

    this.cropper.on('ready' as CropperEventType, () => {
      this.isReady = true
      this.ready.emit()
    })

    this.cropper.on('imageLoaded' as CropperEventType, (event) => {
      this.imageLoaded.emit(event.imageInfo!)
    })

    this.cropper.on('imageError' as CropperEventType, (event) => {
      this.imageError.emit(event.error)
    })

    this.cropper.on('cropChange' as CropperEventType, (event) => {
      const cropData = event.cropData!
      this.cropChange.emit(cropData)
      this.onChange(cropData)
      this.onTouched()
    })

    this.cropper.on('cropStart' as CropperEventType, () => {
      this.cropStart.emit()
    })

    this.cropper.on('cropMove' as CropperEventType, (event) => {
      this.cropMove.emit(event.cropData!)
    })

    this.cropper.on('cropEnd' as CropperEventType, (event) => {
      this.cropEnd.emit(event.cropData!)
    })

    this.cropper.on('zoomChange' as CropperEventType, (event) => {
      this.zoomChange.emit(event.scale || 1)
    })

    this.cropper.on('rotationChange' as CropperEventType, (event) => {
      this.rotationChange.emit(event.rotation || 0)
    })

    this.cropper.on('flipChange' as CropperEventType, (event) => {
      this.flipChange.emit({
        flipX: event.flipX || false,
        flipY: event.flipY || false,
      })
    })

    this.cropper.on('dragStart' as CropperEventType, () => {
      this.dragStart.emit()
    })

    this.cropper.on('dragMove' as CropperEventType, (event) => {
      this.dragMove.emit(event.cropData!)
    })

    this.cropper.on('dragEnd' as CropperEventType, (event) => {
      this.dragEnd.emit(event.cropData!)
    })

    this.cropper.on('reset' as CropperEventType, () => {
      this.reset.emit()
    })

    this.cropper.on('destroy' as CropperEventType, () => {
      this.destroy.emit()
    })
  }

  /**
   * 设置图片
   */
  async setImage(src: ImageSource): Promise<void> {
    if (!this.cropper) return
    await this.cropper.setImage(src)
  }

  /**
   * 获取裁剪数据
   */
  getCropData(): CropData | null {
    return this.cropper?.getCropData() || null
  }

  /**
   * 设置裁剪数据
   */
  setCropData(data: Partial<CropData>): void {
    this.cropper?.setCropData(data)
  }

  /**
   * 获取裁剪后的 Canvas
   */
  getCroppedCanvas(options?: CropOutputOptions): HTMLCanvasElement | null {
    return this.cropper?.getCroppedCanvas(options) || null
  }

  /**
   * 获取裁剪后的 DataURL
   */
  getCroppedDataURL(options?: CropOutputOptions): string | null {
    return this.cropper?.getCroppedDataURL(options) || null
  }

  /**
   * 获取裁剪后的 Blob
   */
  async getCroppedBlob(options?: CropOutputOptions): Promise<Blob | null> {
    if (!this.cropper) return null
    return await this.cropper.getCroppedBlob(options)
  }

  /**
   * 缩放
   */
  zoom(scale: number): void {
    this.cropper?.zoom(scale)
  }

  /**
   * 放大
   */
  zoomIn(delta?: number): void {
    this.cropper?.zoomIn(delta)
  }

  /**
   * 缩小
   */
  zoomOut(delta?: number): void {
    this.cropper?.zoomOut(delta)
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    this.cropper?.rotate(angle)
  }

  /**
   * 向左旋转
   */
  rotateLeft(): void {
    this.cropper?.rotateLeft()
  }

  /**
   * 向右旋转
   */
  rotateRight(): void {
    this.cropper?.rotateRight()
  }

  /**
   * 翻转
   */
  flip(horizontal: boolean, vertical: boolean): void {
    this.cropper?.flip(horizontal, vertical)
  }

  /**
   * 水平翻转
   */
  flipHorizontal(): void {
    this.cropper?.flipHorizontal()
  }

  /**
   * 垂直翻转
   */
  flipVertical(): void {
    this.cropper?.flipVertical()
  }

  /**
   * 重置
   */
  resetCropper(): void {
    this.cropper?.reset()
  }

  /**
   * 销毁裁剪器
   */
  destroyCropper(): void {
    this.cropper?.destroy()
    this.cropper = null
    this.isReady = false
  }

  /**
   * 检查是否准备就绪
   */
  getIsReady(): boolean {
    return this.isReady
  }

  /**
   * 获取裁剪器实例
   */
  getCropperInstance(): Cropper | null {
    return this.cropper
  }

  // ControlValueAccessor 实现
  writeValue(value: CropData | null): void {
    if (value && this.cropper) {
      this.setCropData(value)
    }
  }

  registerOnChange(fn: (value: CropData | null) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    // 可以在这里实现禁用状态的逻辑
  }
}

/**
 * Angular 裁剪器模块
 */
@NgModule({
  declarations: [AngularCropperComponent],
  imports: [CommonModule],
  exports: [AngularCropperComponent],
})
export class AngularCropperModule {}

// 导出
export { AngularCropperComponent, AngularCropperModule }
export default AngularCropperModule
