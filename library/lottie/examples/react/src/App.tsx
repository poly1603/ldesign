/**
 * React 完整示例
 * 展示所有用法：Hook、组件、Context
 */

import React, { useState, useRef } from 'react'
import {
  useLottie,
  LottieAnimation,
  LottiePlayer,
  LottieSequence,
  LottieProvider,
  useLottieContext
} from '@ldesign/lottie/react'
import './App.css'

function App() {
  return (
    <LottieProvider>
      <div className="app">
        <header className="header">
          <h1>🎬 Lottie React 完整示例</h1>
          <p className="subtitle">展示所有用法：Hook、组件、Context</p>
        </header>

        <div className="container">
          <HookExample />
          <ComponentExample />
          <PlayerExample />
          <SequenceExample />
          <ContextExample />
          <EventLog />
        </div>
      </div>
    </LottieProvider>
  )
}

// 1. Hook 用法
function HookExample() {
  const [speed, setSpeed] = useState(1)
  
  const {
    containerRef,
    state,
    isPlaying,
    play,
    pause,
    stop,
    reset,
    setSpeed: setAnimSpeed
  } = useLottie({
    path: '../assets/loading.json',
    loop: true,
    autoplay: true
  })

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setSpeed(value)
    setAnimSpeed(value)
  }

  return (
    <section className="section">
      <h2>1️⃣ Hook 用法 (useLottie)</h2>
      <div className="demo-box">
        <div ref={containerRef} className="lottie-box" />
        <div className="controls">
          <button onClick={play} className="btn btn-primary">播放</button>
          <button onClick={pause} className="btn btn-secondary">暂停</button>
          <button onClick={stop} className="btn btn-secondary">停止</button>
          <button onClick={reset} className="btn btn-secondary">重置</button>
          <label className="speed-control">
            速度: 
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1"
              value={speed}
              onChange={handleSpeedChange}
            />
            <span>{speed.toFixed(1)}x</span>
          </label>
        </div>
        <div className="info">
          状态: <span className={`badge ${state}`}>{state}</span>
          &nbsp; 播放中: {isPlaying ? '是' : '否'}
        </div>
      </div>
    </section>
  )
}

// 2. 组件用法
function ComponentExample() {
  const [speed, setSpeed] = useState(1)
  const animRef = useRef<any>(null)

  return (
    <section className="section">
      <h2>2️⃣ 基础组件 (LottieAnimation)</h2>
      <div className="demo-box">
        <LottieAnimation
          ref={animRef}
          path="../assets/heart.json"
          loop={true}
          autoplay={true}
          speed={speed}
          style={{ width: '300px', height: '300px', margin: '0 auto' }}
          onReady={() => console.log('组件动画加载完成')}
          onComplete={() => console.log('组件动画播放完成')}
        />
        <div className="controls">
          <button onClick={() => animRef.current?.play()} className="btn btn-primary">
            播放
          </button>
          <button onClick={() => animRef.current?.pause()} className="btn btn-secondary">
            暂停
          </button>
          <label className="speed-control">
            速度: 
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
            />
            <span>{speed.toFixed(1)}x</span>
          </label>
        </div>
      </div>
    </section>
  )
}

// 3. 播放器组件
function PlayerExample() {
  return (
    <section className="section">
      <h2>3️⃣ 播放器组件 (LottiePlayer)</h2>
      <div className="demo-box">
        <LottiePlayer
          path="../assets/success.json"
          loop={true}
          autoplay={false}
          showControls={true}
          height="350px"
          style={{ maxWidth: '600px', margin: '0 auto' }}
          onReady={() => console.log('播放器加载完成')}
        />
      </div>
    </section>
  )
}

// 4. 序列组件
function SequenceExample() {
  const items = [
    {
      config: { path: '../assets/loading.json' },
      delay: 0
    },
    {
      config: { path: '../assets/success.json' },
      delay: 300
    },
    {
      config: { path: '../assets/heart.json' },
      delay: 300
    }
  ]

  return (
    <section className="section">
      <h2>4️⃣ 序列组件 (LottieSequence)</h2>
      <div className="demo-box">
        <LottieSequence
          items={items}
          loop={false}
          autoplay={false}
          showControls={true}
        />
      </div>
    </section>
  )
}

// 5. Context 用法
function ContextExample() {
  const context = useLottieContext()

  return (
    <section className="section">
      <h2>5️⃣ Context 用法 (LottieProvider)</h2>
      <div className="demo-box">
        <div className="info">
          当前实例数: {context.instances.size}
        </div>
        <div className="controls">
          <button onClick={context.playAll} className="btn btn-primary">
            播放全部
          </button>
          <button onClick={context.pauseAll} className="btn btn-secondary">
            暂停全部
          </button>
          <button onClick={context.stopAll} className="btn btn-danger">
            停止全部
          </button>
        </div>
      </div>
    </section>
  )
}

// 6. 事件日志
function EventLog() {
  const [logs, setLogs] = useState<string[]>([
    '等待用户操作...'
  ])

  return (
    <section className="section">
      <h2>📝 事件日志</h2>
      <div className="log">
        {logs.map((entry, index) => (
          <div key={index} className="log-entry">{entry}</div>
        ))}
      </div>
    </section>
  )
}

export default App
