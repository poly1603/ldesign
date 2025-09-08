/**
 * Angular QR Code Component
 * 提供与Vue和React版本一致的API
 */

import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core'
import { Subscription } from 'rxjs'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
} from '../types'
import { QRCodeService, createQRCodeService } from './qrcode.service'
import { download } from '../helpers'

/**
 * Angular QR Code Component
 * 
 * @example
 * ```html
 * <!-- 基础使用 -->
 * <qr-code 
 *   text="Hello World"
 *   [size]="200"
 *   format="canvas">
 * </qr-code>
 * 
 * <!-- 带下载功能 -->
 * <qr-code 
 *   text="https://example.com"
 *   [size]="300"
 *   format="svg"
 *   [showDownloadButton]="true"
 *   downloadButtonText="下载二维码"
 *   (generated)="onGenerated($event)"
 *   (error)="onError($event)">
 * </qr-code>
 * 
 * <!-- 自定义样式 -->
 * <qr-code 
 *   [text]="dynamicText"
 *   [size]="250"
 *   [color]="{ foreground: '#000', background: '#fff' }"
 *   [logo]="{ src: 'logo.png', size: 50 }"
 *   class="custom-qrcode">
 * </qr-code>
 * ```
 */
@Component({
  selector: 'qr-code',
  template: `
    <div 
      #container
      class="qrcode-container"
      [class.qrcode-loading]="loading"
      [class.qrcode-error]="!!error"
      [ngStyle]="containerStyle">
      
      <!-- 加载状态 -->
      <div *ngIf="loading" class="qrcode-loading-content">
        <ng-content select="[slot=loading]">
          <div class="qrcode-loading-default">生成中...</div>
        </ng-content>
      </div>

      <!-- 错误状态 -->
      <div *ngIf="error && !loading" class="qrcode-error-content">
        <ng-content select="[slot=error]">
          <div class="qrcode-error-default">
            生成失败: {{ error.message }}
          </div>
        </ng-content>
      </div>

      <!-- 二维码内容 -->
      <div *ngIf="result && !loading && !error" class="qrcode-content">
        <!-- Canvas渲染 -->
        <canvas
          *ngIf="format === 'canvas'"
          #canvasElement
          [width]="actualWidth"
          [height]="actualHeight"
          class="qrcode-canvas">
        </canvas>

        <!-- SVG渲染 -->
        <div
          *ngIf="format === 'svg'"
          #svgElement
          class="qrcode-svg"
          [innerHTML]="result.data">
        </div>

        <!-- Image渲染 -->
        <img
          *ngIf="format === 'image'"
          #imageElement
          [src]="result.data"
          [width]="actualWidth"
          [height]="actualHeight"
          [alt]="'QR Code: ' + (text || data)"
          class="qrcode-image">
      </div>

      <!-- 下载按钮 -->
      <div *ngIf="showDownloadButton && result && !loading" class="qrcode-actions">
        <button
          type="button"
          (click)="handleDownload()"
          class="qrcode-download-button">
          {{ downloadButtonText }}
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./qrcode.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [QRCodeService]
})
export class QRCodeComponent implements OnInit, OnDestroy, OnChanges {
  // 基础属性
  @Input() text?: string
  @Input() data?: string
  @Input() size: number = 200
  @Input() format: 'canvas' | 'svg' | 'image' = 'canvas'
  @Input() margin?: number
  @Input() errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
  
  // 样式选项
  @Input() color?: any
  @Input() style?: any
  @Input() logo?: any
  
  // 显示选项
  @Input() showDownloadButton: boolean = false
  @Input() downloadButtonText: string = '下载二维码'
  @Input() downloadFilename: string = 'qrcode'
  
  // 自定义样式
  @Input() containerStyle?: { [key: string]: any }
  
  // 事件输出
  @Output() generated = new EventEmitter<QRCodeResult>()
  @Output() error = new EventEmitter<QRCodeError>()
  @Output() download = new EventEmitter<QRCodeResult>()

  // 视图引用
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>
  @ViewChild('canvasElement') canvasRef?: ElementRef<HTMLCanvasElement>
  @ViewChild('svgElement') svgRef?: ElementRef<HTMLDivElement>
  @ViewChild('imageElement') imageRef?: ElementRef<HTMLImageElement>

  // 状态
  result: QRCodeResult | null = null
  loading: boolean = false
  error: QRCodeError | null = null

  // 私有属性
  private qrService: QRCodeService
  private subscription?: Subscription

  constructor(
    private cdr: ChangeDetectorRef
  ) {
    // 创建独立的服务实例
    this.qrService = createQRCodeService()
  }

  ngOnInit(): void {
    // 订阅状态变化
    this.subscription = this.qrService.state$.subscribe(state => {
      this.result = state.result
      this.loading = state.loading
      this.error = state.error

      // 触发事件
      if (state.result) {
        this.generated.emit(state.result)
        this.renderResult(state.result)
      }
      if (state.error) {
        this.error.emit(state.error)
      }

      // 触发变更检测
      this.cdr.markForCheck()
    })

    // 初始生成
    this.generateQRCode()
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 当输入属性变化时重新生成
    if (changes['text'] || changes['data'] || changes['size'] || 
        changes['format'] || changes['color'] || changes['style'] || 
        changes['logo'] || changes['margin'] || changes['errorCorrectionLevel']) {
      this.generateQRCode()
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    this.qrService.ngOnDestroy()
  }

  /**
   * 生成二维码
   */
  generateQRCode(): void {
    const textToGenerate = this.text || this.data
    if (!textToGenerate || !textToGenerate.trim()) {
      return
    }

    // 构建选项
    const options: Partial<QRCodeOptions> = {
      size: this.size,
      format: this.format,
      margin: this.margin,
      errorCorrectionLevel: this.errorCorrectionLevel,
      color: this.color,
      style: this.style,
      logo: this.logo,
    }

    // 生成二维码
    this.qrService.generate(textToGenerate, options).subscribe({
      // 错误处理在服务的状态流中处理
    })
  }

  /**
   * 重新生成二维码
   */
  regenerate(): void {
    this.qrService.regenerate().subscribe({
      // 错误处理在服务的状态流中处理
    })
  }

  /**
   * 处理下载
   */
  async handleDownload(): Promise<void> {
    if (!this.result) return

    try {
      await download(this.result, this.downloadFilename)
      this.download.emit(this.result)
    } catch (err) {
      const qrError = err as QRCodeError
      this.error.emit(qrError)
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.qrService.clearCache()
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return this.qrService.getMetrics()
  }

  /**
   * 获取实际尺寸
   */
  get actualWidth(): number {
    return this.size || 200
  }

  get actualHeight(): number {
    return this.size || 200
  }

  /**
   * 渲染结果到对应元素
   */
  private renderResult(result: QRCodeResult): void {
    // 延迟执行以确保视图已更新
    setTimeout(() => {
      if (this.format === 'canvas' && this.canvasRef && result.element) {
        const canvas = this.canvasRef.nativeElement
        const sourceCanvas = result.element as HTMLCanvasElement
        const ctx = canvas.getContext('2d')
        if (ctx) {
          canvas.width = sourceCanvas.width
          canvas.height = sourceCanvas.height
          ctx.drawImage(sourceCanvas, 0, 0)
        }
      }
    }, 0)
  }
}
