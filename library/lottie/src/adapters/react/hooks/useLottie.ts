/**
 * useLottie Hook
 * React Hook for Lottie animations
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { lottieManager } from '../../../core/LottieManager'
import type { LottieConfig, ILottieInstance, AnimationState } from '../../../types'
import type { UseLottieReturn } from '../types'

/**
 * 使用 Lottie 动画
 */
export function useLottie(config: LottieConfig): UseLottieReturn {
  const containerRef = useRef<HTMLDivElement>(null)
  const [instance, setInstance] = useState<ILottieInstance | null>(null)
  const [state, setState] = useState<AnimationState>('idle')

  // 计算属性
  const isPlaying = state === 'playing'
  const isLoaded = state !== 'idle' && state !== 'loading'

  // 初始化
  useEffect(() => {
    if (!containerRef.current) return

    let mounted = true

    const init = async () => {
      try {
        const inst = lottieManager.create({
          ...config,
          container: containerRef.current!
        })

        if (!mounted) {
          inst.destroy()
          return
        }

        // 监听状态变化
        inst.on('stateChange', (newState) => {
          if (mounted) {
            setState(newState)
          }
        })

        setInstance(inst)
        await inst.load()
      } catch (error) {
        console.error('[useLottie] Failed to initialize:', error)
        if (mounted) {
          setState('error')
        }
      }
    }

    init()

    return () => {
      mounted = false
      instance?.destroy()
    }
  }, [config.path, config.animationData])

  // 控制方法
  const play = useCallback(() => instance?.play(), [instance])
  const pause = useCallback(() => instance?.pause(), [instance])
  const stop = useCallback(() => instance?.stop(), [instance])
  const reset = useCallback(() => instance?.reset(), [instance])
  const setSpeed = useCallback((speed: number) => instance?.setSpeed(speed), [instance])
  const setDirection = useCallback((direction: 1 | -1) => instance?.setDirection(direction), [instance])
  
  const goToFrame = useCallback((frame: number, play = false) => {
    if (play) {
      instance?.goToAndPlay(frame, true)
    } else {
      instance?.goToAndStop(frame, true)
    }
  }, [instance])

  return {
    containerRef,
    instance,
    state,
    isPlaying,
    isLoaded,
    play,
    pause,
    stop,
    reset,
    setSpeed,
    setDirection,
    goToFrame
  }
}


