/**
 * React 适配器
 * 提供React组件封装和Hooks支持
 */

import React, { 
  useRef, 
  useEffect, 
  useState, 
  useCallback, 
  useMemo,
  forwardRef,
  useImperativeHandle
} from 'react'
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

// React组件属性类型
export interface CaptchaProps {
  /** 验证码类型 */
  type: CaptchaType
  /** 宽度 */
  width?: number
  /** 高度 */
  height?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 调试模式 */
  debug?: boolean
  /** 自定义样式类名 */
  className?: string
  /** 自定义样式 */
  style?: React.CSSProperties
  /** 基础配置 */
  config?: Partial<BaseCaptchaConfig>
  /** 滑动拼图配置 */
  slidePuzzleConfig?: Partial<SlidePuzzleConfig>
  /** 点击文字配置 */
  clickTextConfig?: Partial<ClickTextConfig>
  /** 旋转滑块配置 */
  rotateSliderConfig?: Partial<RotateSliderConfig>
  /** 点击验证配置 */
  clickConfig?: Partial<ClickConfig>
  /** 验证成功回调 */
  onSuccess?: (result: CaptchaResult) => void
  /** 验证失败回调 */
  onFail?: (error: CaptchaError) => void
  /** 状态变化回调 */
  onStatusChange?: (status: CaptchaStatus) => void
  /** 重试回调 */
  onRetry?: () => void
  /** 初始化完成回调 */
  onReady?: () => void
  /** 开始验证回调 */
  onStart?: () => void
  /** 验证进度回调 */
  onProgress?: (data: any) => void
}

// 组件引用类型
export interface CaptchaRef {
  /** 重置验证码 */
  reset: () => void
  /** 开始验证 */
  start: () => void
  /** 重试验证 */
  retry: () => void
  /** 验证结果 */
  verify: (data?: any) => Promise<CaptchaResult>
  /** 获取验证码实例 */
  getInstance: () => ICaptcha | null
  /** 获取当前状态 */
  getStatus: () => CaptchaStatus
}

/**
 * React 验证码组件
 */
export const LCaptcha = forwardRef<CaptchaRef, CaptchaProps>((props, ref) => {
  const {
    type,
    width = 320,
    height = 180,
    disabled = false,
    debug = false,
    className,
    style,
    config = {},
    slidePuzzleConfig = {},
    clickTextConfig = {},
    rotateSliderConfig = {},
    clickConfig = {},
    onSuccess,
    onFail,
    onStatusChange,
    onRetry,
    onReady,
    onStart,
    onProgress
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const captchaInstanceRef = useRef<ICaptcha | null>(null)
  const [status, setStatus] = useState<CaptchaStatus>(CaptchaStatus.UNINITIALIZED)

  // 合并配置
  const mergedConfig = useMemo(() => {
    const baseConfig: BaseCaptchaConfig = {
      container: containerRef.current!,
      width,
      height,
      disabled,
      debug,
      onSuccess,
      onFail,
      onStatusChange: (newStatus) => {
        setStatus(newStatus)
        onStatusChange?.(newStatus)
      },
      onRetry,
      ...config
    }

    // 根据类型合并特定配置
    switch (type) {
      case CaptchaType.SLIDE_PUZZLE:
        return { ...baseConfig, ...slidePuzzleConfig }
      case CaptchaType.CLICK_TEXT:
        return { ...baseConfig, ...clickTextConfig }
      case CaptchaType.ROTATE_SLIDER:
        return { ...baseConfig, ...rotateSliderConfig }
      case CaptchaType.CLICK:
        return { ...baseConfig, ...clickConfig }
      default:
        return baseConfig
    }
  }, [
    type, width, height, disabled, debug, config,
    slidePuzzleConfig, clickTextConfig, rotateSliderConfig, clickConfig,
    onSuccess, onFail, onStatusChange, onRetry
  ])

  // 创建验证码实例
  const createCaptcha = useCallback(() => {
    if (!containerRef.current) return null

    const finalConfig = { ...mergedConfig, container: containerRef.current }

    switch (type) {
      case CaptchaType.SLIDE_PUZZLE:
        return new SlidePuzzleCaptcha(finalConfig as SlidePuzzleConfig)
      case CaptchaType.CLICK_TEXT:
        return new ClickTextCaptcha(finalConfig as ClickTextConfig)
      case CaptchaType.ROTATE_SLIDER:
        return new RotateSliderCaptcha(finalConfig as RotateSliderConfig)
      case CaptchaType.CLICK:
        return new ClickCaptcha(finalConfig as ClickConfig)
      default:
        throw new Error(`不支持的验证码类型: ${type}`)
    }
  }, [type, mergedConfig])

  // 初始化验证码
  const initCaptcha = useCallback(async () => {
    try {
      if (captchaInstanceRef.current) {
        captchaInstanceRef.current.destroy()
      }

      captchaInstanceRef.current = createCaptcha()
      
      if (captchaInstanceRef.current) {
        // 绑定事件
        captchaInstanceRef.current.on('ready', () => onReady?.())
        captchaInstanceRef.current.on('start', () => onStart?.())
        captchaInstanceRef.current.on('progress', (data) => onProgress?.(data.data))

        await captchaInstanceRef.current.init()
      }
    } catch (error) {
      console.error('[LCaptcha] 初始化失败:', error)
      onFail?.({
        code: 'INIT_ERROR',
        message: '验证码初始化失败',
        timestamp: Date.now()
      })
    }
  }, [createCaptcha, onReady, onStart, onProgress, onFail])

  // 重置验证码
  const reset = useCallback(() => {
    captchaInstanceRef.current?.reset()
  }, [])

  // 开始验证
  const start = useCallback(() => {
    captchaInstanceRef.current?.start()
  }, [])

  // 重试验证
  const retry = useCallback(() => {
    captchaInstanceRef.current?.retry()
  }, [])

  // 验证结果
  const verify = useCallback(async (data?: any) => {
    if (!captchaInstanceRef.current) {
      throw new Error('验证码未初始化')
    }
    return await captchaInstanceRef.current.verify(data)
  }, [])

  // 获取验证码实例
  const getInstance = useCallback(() => {
    return captchaInstanceRef.current
  }, [])

  // 获取当前状态
  const getStatus = useCallback(() => {
    return status
  }, [status])

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    reset,
    start,
    retry,
    verify,
    getInstance,
    getStatus
  }), [reset, start, retry, verify, getInstance, getStatus])

  // 组件挂载和更新
  useEffect(() => {
    if (containerRef.current) {
      initCaptcha()
    }

    return () => {
      if (captchaInstanceRef.current) {
        captchaInstanceRef.current.destroy()
      }
    }
  }, [initCaptcha])

  return (
    <div
      ref={containerRef}
      className={`ldesign-captcha-react-container ${className || ''}`}
      style={style}
    />
  )
})

LCaptcha.displayName = 'LCaptcha'

/**
 * React Hook for Captcha
 */
export function useCaptcha(type: CaptchaType, config?: Partial<BaseCaptchaConfig>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const captchaInstanceRef = useRef<ICaptcha | null>(null)
  const [status, setStatus] = useState<CaptchaStatus>(CaptchaStatus.UNINITIALIZED)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<CaptchaError | null>(null)

  // 创建验证码实例
  const createInstance = useCallback(() => {
    if (!containerRef.current) return null

    const mergedConfig: BaseCaptchaConfig = {
      container: containerRef.current,
      onStatusChange: (newStatus) => {
        setStatus(newStatus)
      },
      onSuccess: (result) => {
        setLoading(false)
        setError(null)
      },
      onFail: (err) => {
        setLoading(false)
        setError(err)
      },
      ...config
    }

    switch (type) {
      case CaptchaType.SLIDE_PUZZLE:
        return new SlidePuzzleCaptcha(mergedConfig as SlidePuzzleConfig)
      case CaptchaType.CLICK_TEXT:
        return new ClickTextCaptcha(mergedConfig as ClickTextConfig)
      case CaptchaType.ROTATE_SLIDER:
        return new RotateSliderCaptcha(mergedConfig as RotateSliderConfig)
      case CaptchaType.CLICK:
        return new ClickCaptcha(mergedConfig as ClickConfig)
      default:
        return null
    }
  }, [type, config])

  // 初始化
  const init = useCallback(async () => {
    if (!containerRef.current) {
      throw new Error('容器元素未准备就绪')
    }

    setLoading(true)
    setError(null)

    try {
      if (captchaInstanceRef.current) {
        captchaInstanceRef.current.destroy()
      }

      captchaInstanceRef.current = createInstance()
      
      if (captchaInstanceRef.current) {
        await captchaInstanceRef.current.init()
      }
    } catch (err) {
      const error: CaptchaError = {
        code: 'INIT_ERROR',
        message: err instanceof Error ? err.message : '初始化失败',
        timestamp: Date.now()
      }
      setError(error)
      throw err
    } finally {
      setLoading(false)
    }
  }, [createInstance])

  // 重置
  const reset = useCallback(() => {
    captchaInstanceRef.current?.reset()
    setError(null)
  }, [])

  // 开始验证
  const start = useCallback(() => {
    captchaInstanceRef.current?.start()
    setLoading(true)
    setError(null)
  }, [])

  // 重试
  const retry = useCallback(() => {
    captchaInstanceRef.current?.retry()
    setError(null)
  }, [])

  // 验证
  const verify = useCallback(async (data?: any) => {
    if (!captchaInstanceRef.current) {
      throw new Error('验证码未初始化')
    }
    return await captchaInstanceRef.current.verify(data)
  }, [])

  // 销毁
  const destroy = useCallback(() => {
    if (captchaInstanceRef.current) {
      captchaInstanceRef.current.destroy()
      captchaInstanceRef.current = null
    }
  }, [])

  // 计算状态
  const isReady = useMemo(() => status === CaptchaStatus.READY, [status])
  const isVerifying = useMemo(() => status === CaptchaStatus.VERIFYING, [status])
  const isSuccess = useMemo(() => status === CaptchaStatus.SUCCESS, [status])
  const isFailed = useMemo(() => status === CaptchaStatus.FAILED, [status])

  return {
    containerRef,
    captchaInstance: captchaInstanceRef.current,
    status,
    loading,
    error,
    isReady,
    isVerifying,
    isSuccess,
    isFailed,
    init,
    reset,
    start,
    retry,
    verify,
    destroy
  }
}

// 类型导出
export type { CaptchaProps, CaptchaRef }
