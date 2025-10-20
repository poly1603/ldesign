/**
 * useLottieSequence Hook
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { AnimationSequence } from '../../../core/AnimationSequence'
import type { LottieConfig } from '../../../types'

interface UseLottieSequenceOptions {
  items: Array<{
    config: LottieConfig
    delay?: number
    duration?: number
  }>
  loop?: boolean
  autoplay?: boolean
}

export function useLottieSequence(options: UseLottieSequenceOptions) {
  const containerRefs = useRef<(HTMLDivElement | null)[]>([])
  const sequenceRef = useRef<AnimationSequence | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const sequence = new AnimationSequence(
      options.items.map((item, index) => ({
        config: {
          ...item.config,
          container: containerRefs.current[index]!
        },
        delay: item.delay,
        duration: item.duration
      }))
    )

    sequenceRef.current = sequence

    if (options.autoplay) {
      play()
    }

    return () => {
      sequence.destroy()
    }
  }, [])

  const play = useCallback(async () => {
    if (!sequenceRef.current) return

    setIsPlaying(true)
    setIsPaused(false)

    try {
      await sequenceRef.current.play()
      
      if (options.loop) {
        setCurrentIndex(0)
        play()
      } else {
        setIsPlaying(false)
      }
    } catch (error) {
      console.error('[useLottieSequence] Play error:', error)
      setIsPlaying(false)
    }
  }, [options.loop])

  const pause = useCallback(() => {
    sequenceRef.current?.pause()
    setIsPaused(true)
  }, [])

  const resume = useCallback(() => {
    sequenceRef.current?.resume()
    setIsPaused(false)
  }, [])

  const stop = useCallback(() => {
    sequenceRef.current?.stop()
    setIsPlaying(false)
    setIsPaused(false)
    setCurrentIndex(0)
    setProgress(0)
  }, [])

  return {
    containerRefs,
    currentIndex,
    progress,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop
  }
}


