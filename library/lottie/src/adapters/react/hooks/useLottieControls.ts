/**
 * useLottieControls Hook
 * 提供细粒度的动画控制
 */

import { useState, useCallback } from 'react'
import type { ILottieInstance } from '../../../types'

export function useLottieControls(instance: ILottieInstance | null) {
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const [speed, setSpeedState] = useState(1)
  const [direction, setDirectionState] = useState<1 | -1>(1)

  // 更新帧信息
  const updateFrameInfo = useCallback(() => {
    if (instance?.animation) {
      setTotalFrames(instance.animation.totalFrames)
      setCurrentFrame(Math.floor(instance.animation.currentFrame))
    }
  }, [instance])

  // 设置速度
  const setSpeed = useCallback((speed: number) => {
    instance?.setSpeed(speed)
    setSpeedState(speed)
  }, [instance])

  // 设置方向
  const setDirection = useCallback((dir: 1 | -1) => {
    instance?.setDirection(dir)
    setDirectionState(dir)
  }, [instance])

  // 跳转到帧
  const goToFrame = useCallback((frame: number, play = false) => {
    if (play) {
      instance?.goToAndPlay(frame, true)
    } else {
      instance?.goToAndStop(frame, true)
    }
    setCurrentFrame(frame)
  }, [instance])

  // 播放片段
  const playSegment = useCallback((start: number, end: number) => {
    instance?.playSegments([start, end], true)
  }, [instance])

  // 切换方向
  const toggleDirection = useCallback(() => {
    const newDir = direction === 1 ? -1 : 1
    setDirection(newDir)
  }, [direction, setDirection])

  return {
    currentFrame,
    totalFrames,
    speed,
    direction,
    setSpeed,
    setDirection,
    toggleDirection,
    goToFrame,
    playSegment,
    updateFrameInfo
  }
}


