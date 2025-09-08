/**
 * Angular QR Code Service
 * 提供二维码生成的服务层支持
 */

import { Injectable, OnDestroy } from '@angular/core'
import { BehaviorSubject, Observable, from } from 'rxjs'
import type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
} from '../types'
import { QRCodeGenerator } from '../core/generator'
import { createError, getDefaultOptions } from '../utils'

/**
 * QR码生成状态接口
 */
export interface QRCodeState {
  result: QRCodeResult | null
  loading: boolean
  error: QRCodeError | null
}

/**
 * Angular QR Code Service
 * 
 * @example
 * ```typescript
 * // 在组件中注入服务
 * constructor(private qrCodeService: QRCodeService) {}
 * 
 * // 生成二维码
 * ngOnInit() {
 *   this.qrCodeService.generate('Hello World', {
 *     size: 200,
 *     format: 'canvas'
 *   }).subscribe({
 *     next: (result) => console.log('Generated:', result),
 *     error: (error) => console.error('Error:', error)
 *   })
 * }
 * 
 * // 监听状态变化
 * ngOnInit() {
 *   this.qrCodeService.state$.subscribe(state => {
 *     console.log('State:', state)
 *   })
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class QRCodeService implements OnDestroy {
  private generator: QRCodeGenerator
  private stateSubject = new BehaviorSubject<QRCodeState>({
    result: null,
    loading: false,
    error: null,
  })

  /**
   * 状态流，可订阅获取实时状态
   */
  public readonly state$: Observable<QRCodeState> = this.stateSubject.asObservable()

  /**
   * 当前状态
   */
  public get state(): QRCodeState {
    return this.stateSubject.value
  }

  /**
   * 当前结果
   */
  public get result(): QRCodeResult | null {
    return this.state.result
  }

  /**
   * 是否正在加载
   */
  public get loading(): boolean {
    return this.state.loading
  }

  /**
   * 当前错误
   */
  public get error(): QRCodeError | null {
    return this.state.error
  }

  constructor() {
    // 使用默认选项初始化生成器
    this.generator = new QRCodeGenerator(getDefaultOptions())
  }

  /**
   * 生成二维码
   * 
   * @param text - 要编码的文本
   * @param options - 配置选项
   * @returns Observable<QRCodeResult>
   */
  generate(text: string, options?: Partial<QRCodeOptions>): Observable<QRCodeResult> {
    if (!text || !text.trim()) {
      const error = createError('Text cannot be empty', 'INVALID_TEXT')
      this.updateState({ error, loading: false })
      throw error
    }

    // 更新加载状态
    this.updateState({ loading: true, error: null })

    // 如果提供了选项，更新生成器
    if (options) {
      this.generator.updateOptions(options)
    }

    // 返回Observable
    return from(this.generateInternal(text))
  }

  /**
   * 重新生成当前二维码
   */
  regenerate(): Observable<QRCodeResult> {
    const currentOptions = this.generator.getOptions()
    if (!currentOptions.data) {
      const error = createError('No data to regenerate', 'NO_DATA')
      this.updateState({ error, loading: false })
      throw error
    }

    return this.generate(currentOptions.data, currentOptions)
  }

  /**
   * 更新生成器选项
   * 
   * @param options - 新的配置选项
   */
  updateOptions(options: Partial<QRCodeOptions>): void {
    this.generator.updateOptions(options)
  }

  /**
   * 获取当前选项
   */
  getOptions(): QRCodeOptions {
    return this.generator.getOptions()
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.generator.clearCache()
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetric[] {
    return this.generator.getPerformanceMetrics()
  }

  /**
   * 清除当前状态
   */
  clearState(): void {
    this.updateState({
      result: null,
      loading: false,
      error: null,
    })
  }

  /**
   * 销毁服务
   */
  ngOnDestroy(): void {
    this.generator.destroy()
    this.stateSubject.complete()
  }

  /**
   * 内部生成方法
   */
  private async generateInternal(text: string): Promise<QRCodeResult> {
    try {
      const result = await this.generator.generate(text)
      this.updateState({ result, loading: false, error: null })
      return result
    } catch (err) {
      const error = err as QRCodeError
      this.updateState({ error, loading: false })
      throw error
    }
  }

  /**
   * 更新状态
   */
  private updateState(partialState: Partial<QRCodeState>): void {
    const currentState = this.stateSubject.value
    const newState = { ...currentState, ...partialState }
    this.stateSubject.next(newState)
  }
}

/**
 * 创建独立的QR码服务实例
 * 用于需要多个独立实例的场景
 * 
 * @param options - 初始配置选项
 * @returns QRCodeService实例
 * 
 * @example
 * ```typescript
 * const qrService = createQRCodeService({
 *   size: 300,
 *   format: 'svg',
 *   errorCorrectionLevel: 'H'
 * })
 * 
 * qrService.generate('Hello World').subscribe(result => {
 *   console.log('Generated:', result)
 * })
 * ```
 */
export function createQRCodeService(options?: Partial<QRCodeOptions>): QRCodeService {
  const service = new QRCodeService()
  if (options) {
    service.updateOptions(options)
  }
  return service
}
