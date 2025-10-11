import { useState, useEffect } from 'react'
import { useLottie, Lottie, LottieProvider, useLottieManager } from '../../../src/adapters/react'
import './App.css'

// Example 1: Using useLottie Hook
function HookExample() {
  const { containerRef, state, isLoaded, isPlaying, play, pause, stop, reset } = useLottie({
    path: '/loading-spinner.json',
    loop: true,
    autoplay: false,
  })

  return (
    <div className="card">
      <h2>useLottie Hook</h2>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="controls">
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
        <button onClick={stop}>Stop</button>
        <button onClick={reset}>Reset</button>
      </div>
      <div className="info">
        <p><strong>State:</strong> {state}</p>
        <p><strong>Loaded:</strong> {isLoaded.toString()}</p>
        <p><strong>Playing:</strong> {isPlaying.toString()}</p>
      </div>
    </div>
  )
}

// Example 2: Using Lottie Component
function ComponentExample() {
  return (
    <div className="card">
      <h2>Lottie Component</h2>
      <Lottie
        path="/success-checkmark.json"
        loop={false}
        autoplay={true}
        className="lottie-container"
        onLoad={() => console.log('✅ Animation loaded')}
        onComplete={() => console.log('✅ Animation completed')}
      />
      <div className="info">
        <p>This uses the Lottie component</p>
        <p>Success animation plays once</p>
      </div>
    </div>
  )
}

// Example 3: Speed Control
function SpeedControlExample() {
  const [speed, setSpeed] = useState(1)
  const { containerRef, play, pause, setSpeed: updateSpeed } = useLottie({
    path: '/heart-beat.json',
    loop: true,
    autoplay: false,
    speed,
  })

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseFloat(e.target.value)
    setSpeed(newSpeed)
    updateSpeed(newSpeed)
  }

  return (
    <div className="card">
      <h2>Speed Control</h2>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="speed-control">
        <label>Speed: {speed}x</label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={speed}
          onChange={handleSpeedChange}
        />
      </div>
      <div className="controls">
        <button onClick={play}>Play</button>
        <button onClick={pause}>Pause</button>
      </div>
    </div>
  )
}

// Example 4: Rocket Animation
function RocketExample() {
  const { containerRef, play, stop } = useLottie({
    path: '/rocket.json',
    loop: false,
    autoplay: false,
  })

  return (
    <div className="card">
      <h2>🚀 Rocket Launch</h2>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="controls">
        <button onClick={play}>Launch</button>
        <button onClick={stop}>Reset</button>
      </div>
      <div className="info">
        <p>Rocket animation</p>
        <p>Perfect for startup actions</p>
      </div>
    </div>
  )
}

// Example 5: Confetti Animation
function ConfettiExample() {
  const { containerRef, play, stop } = useLottie({
    path: '/confetti.json',
    loop: false,
    autoplay: false,
  })

  return (
    <div className="card">
      <h2>🎉 Celebration</h2>
      <div ref={containerRef as any} className="lottie-container" />
      <div className="controls">
        <button onClick={play}>Celebrate</button>
        <button onClick={stop}>Reset</button>
      </div>
      <div className="info">
        <p>Confetti animation</p>
        <p>Great for achievements!</p>
      </div>
    </div>
  )
}

// Global Stats
function GlobalStats() {
  const manager = useLottieManager()
  const [stats, setStats] = useState({
    totalInstances: 0,
    activeInstances: 0,
    averageFps: 0,
    cacheHitRate: 0,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const globalStats = manager.getGlobalStats()
      setStats(globalStats)
    }, 1000)

    return () => clearInterval(interval)
  }, [manager])

  return (
    <div className="stats">
      <h2>📊 Global Statistics</h2>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.totalInstances}</div>
          <div className="stat-label">Total Instances</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.activeInstances}</div>
          <div className="stat-label">Active Instances</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.averageFps}</div>
          <div className="stat-label">Average FPS</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{Math.round(stats.cacheHitRate * 100)}%</div>
          <div className="stat-label">Cache Hit Rate</div>
        </div>
      </div>
    </div>
  )
}

// Main App
function App() {
  return (
    <LottieProvider>
      <div className="app">
        <header>
          <h1>🎨 Lottie React Example</h1>
          <p>Powerful Lottie animations in React</p>
        </header>

        <div className="grid">
          <HookExample />
          <ComponentExample />
          <SpeedControlExample />
          <RocketExample />
          <ConfettiExample />
        </div>

        <GlobalStats />
      </div>
    </LottieProvider>
  )
}

export default App
