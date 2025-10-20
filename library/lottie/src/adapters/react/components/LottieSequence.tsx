/**
 * LottieSequence 组件
 * 动画序列播放组件
 */

import React from 'react'
import { useLottieSequence } from '../hooks/useLottieSequence'
import type { LottieConfig } from '../../../types'

interface LottieSequenceProps {
  items: Array<{
    config: LottieConfig
    delay?: number
    duration?: number
  }>
  loop?: boolean
  autoplay?: boolean
  showControls?: boolean
  style?: React.CSSProperties
  className?: string
}

export const LottieSequence: React.FC<LottieSequenceProps> = (props) => {
  const {
    items,
    loop = false,
    autoplay = false,
    showControls = true,
    style,
    className
  } = props

  const {
    containerRefs,
    currentIndex,
    progress,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop
  } = useLottieSequence({ items, loop, autoplay })

  return (
    <div className={className} style={style}>
      <div style={{ position: 'relative' }}>
        {items.map((_, index) => (
          <div
            key={index}
            ref={(el) => {
              if (el) containerRefs.current[index] = el
            }}
            style={{
              display: index === currentIndex ? 'block' : 'none',
              width: '100%',
              height: '300px'
            }}
          />
        ))}
      </div>
      
      {showControls && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '8px'
        }}>
          <button onClick={play} style={buttonStyle}>播放</button>
          <button onClick={pause} style={buttonStyle}>暂停</button>
          <button onClick={resume} style={buttonStyle}>继续</button>
          <button onClick={stop} style={buttonStyle}>停止</button>
          
          <div style={{
            flex: 1,
            height: '4px',
            background: '#ddd',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s'
            }} />
          </div>
          
          <span style={{ fontSize: '14px', color: '#666' }}>
            {currentIndex + 1} / {items.length}
          </span>
        </div>
      )}
    </div>
  )
}

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer',
  fontSize: '14px'
}


