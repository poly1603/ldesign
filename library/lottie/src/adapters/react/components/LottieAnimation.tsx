/**
 * LottieAnimation 组件
 * React 组件方式使用 Lottie
 */

import React, { useEffect, useRef, useState } from 'react'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance } from '../../../types'
import type { LottieAnimationProps } from '../types'

export const LottieAnimation = React.forwardRef<ILottieInstance | null, LottieAnimationProps>(
  (props, ref) => {
    const {
      path,
      animationData,
      loop = true,
      autoplay = true,
      renderer = 'svg',
      speed = 1,
      config,
      onReady,
      onComplete,
      onLoopComplete,
      onError,
      style,
      className,
      ...divProps
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [instance, setInstance] = useState<ILottieInstance | null>(null)

    // 暴露实例给父组件
    React.useImperativeHandle(ref, () => instance, [instance])

    useEffect(() => {
      if (!containerRef.current) return

      let mounted = true

      const init = async () => {
        try {
          const inst = lottieManager.create({
            container: containerRef.current!,
            path,
            animationData,
            loop,
            autoplay,
            renderer,
            speed,
            ...config,
            events: {
              data_ready: () => onReady?.(),
              complete: () => onComplete?.(),
              loopComplete: () => onLoopComplete?.(),
              data_failed: (error: Error) => onError?.(error),
              ...config?.events
            }
          })

          if (!mounted) {
            inst.destroy()
            return
          }

          setInstance(inst)
          await inst.load()
        } catch (error) {
          onError?.(error as Error)
        }
      }

      init()

      return () => {
        mounted = false
        instance?.destroy()
      }
    }, [path, animationData])

    return (
      <div 
        ref={containerRef}
        className={className}
        style={{
          display: 'inline-block',
          overflow: 'hidden',
          ...style
        }}
        {...divProps}
      />
    )
  }
)

LottieAnimation.displayName = 'LottieAnimation'


