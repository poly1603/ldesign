/**
 * Angular 适配器
 * 提供Angular组件封装和服务支持
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
  Injectable,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import type {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  CaptchaError,
  BaseCaptchaConfig,
  SlidePuzzleConfig,
  ClickTextConfig,
  RotateSliderConfig,
  ClickConfig,
  ICaptcha
} from '../types'
import {
  SlidePuzzleCaptcha,
  ClickTextCaptcha,
  RotateSliderCaptcha,
  ClickCaptcha
} from '../index'

/**
 * Angular 验证码服务
 */
@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  /**
   * 创建验证码实例
   */
  createCaptcha(type: CaptchaType, config: BaseCaptchaConfig): ICaptcha {
    switch (type) {
      case CaptchaType.SLIDE_PUZZLE:
        return new SlidePuzzleCaptcha(config as SlidePuzzleConfig)
      case CaptchaType.CLICK_TEXT:
        return new ClickTextCaptcha(config as ClickTextConfig)
      case CaptchaType.ROTATE_SLIDER:
        return new RotateSliderCaptcha(config as RotateSliderConfig)
      case CaptchaType.CLICK:
        return new ClickCaptcha(config as ClickConfig)
      default:
        throw new Error(`不支持的验证码类型: ${type}`)
    }
  }
}

/**
 * Angular 验证码组件
 */
@Component({
  selector: 'l-captcha',
  template: `<div #container class="ldesign-captcha-angular-container"></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CaptchaComponent),
      multi: true
    }
  ]
})
export class CaptchaComponent implements OnInit, OnDestroy, OnChanges, ControlValueAccessor {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>

  /** 验证码类型 */
  @Input() type!: CaptchaType

  /** 宽度 */
  @Input() width: number = 320

  /** 高度 */
  @Input() height: number = 180

  /** 是否禁用 */
  @Input() disabled: boolean = false

  /** 调试模式 */
  @Input() debug: boolean = false

  /** 基础配置 */
  @Input() config: Partial<BaseCaptchaConfig> = {}

  /** 滑动拼图配置 */
  @Input() slidePuzzleConfig: Partial<SlidePuzzleConfig> = {}

  /** 点击文字配置 */
  @Input() clickTextConfig: Partial<ClickTextConfig> = {}

  /** 旋转滑块配置 */
  @Input() rotateSliderConfig: Partial<RotateSliderConfig> = {}

  /** 点击验证配置 */
  @Input() clickConfig: Partial<ClickConfig> = {}

  /** 验证成功事件 */
  @Output() success = new EventEmitter<CaptchaResult>()

  /** 验证失败事件 */
  @Output() fail = new EventEmitter<CaptchaError>()

  /** 状态变化事件 */
  @Output() statusChange = new EventEmitter<CaptchaStatus>()

  /** 重试事件 */
  @Output() retry = new EventEmitter<void>()

  /** 初始化完成事件 */
  @Output() ready = new EventEmitter<void>()

  /** 开始验证事件 */
  @Output() start = new EventEmitter<void>()

  /** 验证进度事件 */
  @Output() progress = new EventEmitter<any>()

  /** 验证码实例 */
  private captchaInstance: ICaptcha | null = null

  /** 当前状态 */
  public status: CaptchaStatus = CaptchaStatus.UNINITIALIZED

  /** 表单控件值变化回调 */
  private onChange = (value: CaptchaResult | null) => {}

  /** 表单控件触摸回调 */
  private onTouched = () => {}

  constructor(
    private captchaService: CaptchaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initCaptcha()
  }

  ngOnDestroy(): void {
    if (this.captchaInstance) {
      this.captchaInstance.destroy()
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['type'] || changes['width'] || changes['height'] || changes['disabled']) {
      this.initCaptcha()
    }
  }

  /**
   * 初始化验证码
   */
  private async initCaptcha(): Promise<void> {
    if (!this.containerRef?.nativeElement || !this.type) {
      return
    }

    try {
      if (this.captchaInstance) {
        this.captchaInstance.destroy()
      }

      const mergedConfig = this.getMergedConfig()
      this.captchaInstance = this.captchaService.createCaptcha(this.type, mergedConfig)

      // 绑定事件
      this.captchaInstance.on('ready', () => {
        this.ready.emit()
        this.cdr.detectChanges()
      })

      this.captchaInstance.on('start', () => {
        this.start.emit()
        this.onTouched()
        this.cdr.detectChanges()
      })

      this.captchaInstance.on('progress', (data) => {
        this.progress.emit(data.data)
        this.cdr.detectChanges()
      })

      await this.captchaInstance.init()
    } catch (error) {
      console.error('[CaptchaComponent] 初始化失败:', error)
      const captchaError: CaptchaError = {
        code: 'INIT_ERROR',
        message: '验证码初始化失败',
        timestamp: Date.now()
      }
      this.fail.emit(captchaError)
    }
  }

  /**
   * 获取合并后的配置
   */
  private getMergedConfig(): BaseCaptchaConfig {
    const baseConfig: BaseCaptchaConfig = {
      container: this.containerRef.nativeElement,
      width: this.width,
      height: this.height,
      disabled: this.disabled,
      debug: this.debug,
      onSuccess: (result) => {
        this.success.emit(result)
        this.onChange(result)
        this.cdr.detectChanges()
      },
      onFail: (error) => {
        this.fail.emit(error)
        this.onChange(null)
        this.cdr.detectChanges()
      },
      onStatusChange: (status) => {
        this.status = status
        this.statusChange.emit(status)
        this.cdr.detectChanges()
      },
      onRetry: () => {
        this.retry.emit()
        this.cdr.detectChanges()
      },
      ...this.config
    }

    // 根据类型合并特定配置
    switch (this.type) {
      case CaptchaType.SLIDE_PUZZLE:
        return { ...baseConfig, ...this.slidePuzzleConfig }
      case CaptchaType.CLICK_TEXT:
        return { ...baseConfig, ...this.clickTextConfig }
      case CaptchaType.ROTATE_SLIDER:
        return { ...baseConfig, ...this.rotateSliderConfig }
      case CaptchaType.CLICK:
        return { ...baseConfig, ...this.clickConfig }
      default:
        return baseConfig
    }
  }

  /**
   * 重置验证码
   */
  reset(): void {
    this.captchaInstance?.reset()
  }

  /**
   * 开始验证
   */
  startVerification(): void {
    this.captchaInstance?.start()
  }

  /**
   * 重试验证
   */
  retryVerification(): void {
    this.captchaInstance?.retry()
  }

  /**
   * 验证结果
   */
  async verify(data?: any): Promise<CaptchaResult> {
    if (!this.captchaInstance) {
      throw new Error('验证码未初始化')
    }
    return await this.captchaInstance.verify(data)
  }

  /**
   * 获取验证码实例
   */
  getInstance(): ICaptcha | null {
    return this.captchaInstance
  }

  /**
   * 获取当前状态
   */
  getStatus(): CaptchaStatus {
    return this.status
  }

  // ControlValueAccessor 实现
  writeValue(value: CaptchaResult | null): void {
    // 当表单控件值变化时调用
    if (value === null) {
      this.reset()
    }
  }

  registerOnChange(fn: (value: CaptchaResult | null) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled
    this.cdr.detectChanges()
  }
}

/**
 * Angular 验证码模块
 */
import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

@NgModule({
  declarations: [CaptchaComponent],
  imports: [CommonModule],
  exports: [CaptchaComponent],
  providers: [CaptchaService]
})
export class CaptchaModule {}

// 类型导出
export type {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  CaptchaError,
  BaseCaptchaConfig,
  SlidePuzzleConfig,
  ClickTextConfig,
  RotateSliderConfig,
  ClickConfig,
  ICaptcha
}
