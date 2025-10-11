import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { lottieManager } from '../core/LottieManager'
import type { LottieConfig, ILottieInstance, AnimationState, PerformanceMetrics } from '../types'

/**
 * React Hook - useLottie
 */
export function useLottie(config: LottieConfig) {
  const [instance, setInstance] = useState<ILottieInstance | null>(null)
  const [state, setState] = useState<AnimationState>('idle')
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  const containerRef = useRef<HTMLElement | null>(null)
  const configRef = useRef(config)

  // 初始化
  useEffect(() => {
    const init = async () => {
      try {
        const cfg: LottieConfig = {
          ...configRef.current,
          container: containerRef.current || configRef.current.container,
        }

        const inst = lottieManager.create(cfg)

        // 监听状态变化
        inst.on('stateChange', (newState) => {
          setState(newState)
          setIsPlaying(newState === 'playing')
          setIsLoaded(newState === 'loaded' || newState === 'playing' || newState === 'paused')
        })

        // 监听错误
        inst.on('data_failed', (err) => {
          setError(err)
        })

        // 监听性能指标
        inst.on('performanceWarning', (m) => {
          setMetrics(m)
        })

        // 加载动画
        await inst.load()
        setInstance(inst)
      } catch (err) {
        setError(err as Error)
        console.error('[useLottie] Failed to initialize:', err)
      }
    }

    init()

    // 清理
    return () => {
      if (instance) {
        lottieManager.destroy(instance.id)
      }
    }
  }, []) // 只在挂载时执行

  // 播放
  const play = useCallback(() => {
    instance?.play()
  }, [instance])

  // 暂停
  const pause = useCallback(() => {
    instance?.pause()
  }, [instance])

  // 停止
  const stop = useCallback(() => {
    instance?.stop()
  }, [instance])

  // 重置
  const reset = useCallback(() => {
    instance?.reset()
  }, [instance])

  // 设置速度
  const setSpeed = useCallback((speed: number) => {
    instance?.setSpeed(speed)
  }, [instance])

  // 跳转到指定帧
  const goToAndStop = useCallback((frame: number, isFrame = true) => {
    instance?.goToAndStop(frame, isFrame)
  }, [instance])

  // 跳转并播放
  const goToAndPlay = useCallback((frame: number, isFrame = true) => {
    instance?.goToAndPlay(frame, isFrame)
  }, [instance])

  return {
    containerRef,
    instance,
    state,
    isLoaded,
    isPlaying,
    error,
    metrics,
    play,
    pause,
    stop,
    reset,
    setSpeed,
    goToAndStop,
    goToAndPlay,
  }
}

/**
 * React 组件 - Lottie
 */
export interface LottieProps extends Omit<LottieConfig, 'container'> {
  style?: React.CSSProperties
  className?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  onComplete?: () => void
}

export function Lottie({
  style,
  className,
  onLoad,
  onError,
  onComplete,
  ...config
}: LottieProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const instanceRef = useRef<ILottieInstance | null>(null)

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return

      try {
        const instance = lottieManager.create({
          ...config,
          container: containerRef.current,
        })

        instanceRef.current = instance

        // 事件监听
        instance.on('data_ready', () => {
          onLoad?.()
        })

        instance.on('data_failed', (err) => {
          onError?.(err)
        })

        instance.on('complete', () => {
          onComplete?.()
        })

        await instance.load()
      } catch (err) {
        console.error('[Lottie] Failed to load:', err)
        onError?.(err as Error)
      }
    }

    init()

    return () => {
      if (instanceRef.current) {
        lottieManager.destroy(instanceRef.current.id)
      }
    }
  }, [config.path, config.animationData])

  return <div ref={containerRef} style={style} className={className} />
}

/**
 * React Context
 */
import { createContext, useContext } from 'react'

const LottieManagerContext = createContext(lottieManager)

export function LottieProvider({ children }: { children: React.ReactNode }) {
  return (
    <LottieManagerContext.Provider value={lottieManager}>
      {children}
    </LottieManagerContext.Provider>
  )
}

export function useLottieManager() {
  return useContext(LottieManagerContext)
}
