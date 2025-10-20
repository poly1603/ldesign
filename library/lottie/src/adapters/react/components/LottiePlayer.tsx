/**
 * LottiePlayer 组件
 * 带控制栏的 Lottie 播放器
 */

import React, { useEffect, useRef, useState } from 'react'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance } from '../../../types'
import type { LottiePlayerProps } from '../types'

export const LottiePlayer: React.FC<LottiePlayerProps> = (props) => {
  const {
    path,
    animationData,
    loop = true,
    autoplay = false,
    renderer = 'svg',
    speed: initialSpeed = 1,
    config,
    showControls = true,
    height = '400px',
    onReady,
    onComplete,
    style,
    className,
    ...divProps
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const [instance, setInstance] = useState<ILottieInstance | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(0)
  const [speed, setSpeed] = useState(initialSpeed)

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
            data_ready: () => {
              if (inst.animation) {
                setTotalFrames(inst.animation.totalFrames)
              }
              onReady?.()
            },
            complete: () => {
              setIsPlaying(false)
              onComplete?.()
            },
            enterFrame: (e: any) => {
              setCurrentFrame(Math.floor(e.currentTime))
            },
            stateChange: (state: string) => {
              setIsPlaying(state === 'playing')
            },
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
        console.error('[LottiePlayer] Init error:', error)
      }
    }

    init()

    return () => {
      mounted = false
      instance?.destroy()
    }
  }, [path, animationData])

  const togglePlay = () => {
    if (!instance) return
    if (isPlaying) {
      instance.pause()
    } else {
      instance.play()
    }
  }

  const handleStop = () => {
    instance?.stop()
    setCurrentFrame(0)
  }

  const handleReset = () => {
    instance?.reset()
    setCurrentFrame(0)
  }

  const handleFrameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = parseInt(e.target.value)
    setCurrentFrame(frame)
    instance?.goToAndStop(frame, true)
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSpeed = parseFloat(e.target.value)
    setSpeed(newSpeed)
    instance?.setSpeed(newSpeed)
  }

  return (
    <div 
      className={className}
      style={{
        display: 'inline-block',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fff',
        ...style
      }}
      {...divProps}
    >
      <div 
        ref={containerRef}
        style={{
          height: typeof height === 'number' ? `${height}px` : height,
          background: '#f9f9f9'
        }}
      />
      
      {showControls && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px',
          background: '#fff',
          borderTop: '1px solid #eee'
        }}>
          <button 
            onClick={togglePlay}
            style={buttonStyle}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          
          <button 
            onClick={handleStop}
            style={buttonStyle}
            title="停止"
          >
            ⏹
          </button>
          
          <button 
            onClick={handleReset}
            style={buttonStyle}
            title="重置"
          >
            ⏮
          </button>
          
          <input 
            type="range"
            value={currentFrame}
            min={0}
            max={totalFrames - 1}
            onChange={handleFrameChange}
            style={{ flex: 1 }}
          />
          
          <span style={{ fontSize: '12px', color: '#666', minWidth: '80px' }}>
            {currentFrame} / {totalFrames}
          </span>
          
          <select 
            value={speed}
            onChange={handleSpeedChange}
            style={{
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '16px'
}


