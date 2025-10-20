/**
 * useLottieInteractive Hook
 * 交互式 Lottie 动画
 */

import { useEffect } from 'react'
import { useLottie } from './useLottie'
import { InteractiveController } from '../../../core/InteractiveController'
import type { LottieConfig } from '../../../types'
import type { UseLottieReturn } from '../types'

interface UseLottieInteractiveOptions extends LottieConfig {
  enableClick?: boolean
  enableHover?: boolean
  enableScroll?: boolean
  enableDrag?: boolean
}

export function useLottieInteractive(
  config: UseLottieInteractiveOptions
): UseLottieReturn {
  const {
    enableClick = false,
    enableHover = false,
    enableScroll = false,
    enableDrag = false,
    ...lottieConfig
  } = config

  const lottie = useLottie(lottieConfig)

  useEffect(() => {
    if (!lottie.instance) return

    const controller = new InteractiveController({
      instance: lottie.instance,
      enableClick,
      enableHover,
      enableScroll,
      enableDrag
    })

    return () => {
      controller.destroy()
    }
  }, [lottie.instance, enableClick, enableHover, enableScroll, enableDrag])

  return lottie
}


