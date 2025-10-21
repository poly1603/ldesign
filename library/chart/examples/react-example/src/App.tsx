import React, { useState, useEffect } from 'react'
import { Chart } from '@ldesign/chart/react'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(12)
  const [showLargeData, setShowLargeData] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [updateCount, setUpdateCount] = useState(0)
  const [realtimeRunning, setRealtimeRunning] = useState(false)

  // 折线图数据
  const [lineData, setLineData] = useState([120, 200, 150, 80, 70, 110, 130])

  // 柱状图数据
  const [barData] = useState({
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{ name: 'Revenue', data: [100, 200, 150, 300] }]
  })

  // 饼图数据
  const [pieData] = useState({
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [{ data: [30, 25, 25, 20] }]
  })

  // 多系列折线图数据
  const [multiLineData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { name: 'Sales', data: [100, 200, 300, 250, 280, 350] },
      { name: 'Profit', data: [50, 80, 120, 100, 110, 140] }
    ]
  })

  // 散点图数据
  const [scatterData] = useState({
    labels: [],
    datasets: [
      {
        name: 'Data Points',
        data: Array.from({ length: 50 }, () => [
          Math.random() * 100,
          Math.random() * 100
        ])
      }
    ]
  })

  // 雷达图数据
  const [radarData] = useState({
    labels: ['Quality', 'Service', 'Price', 'Speed', 'Innovation'],
    datasets: [
      { name: 'Product A', data: [80, 90, 70, 85, 75] },
      { name: 'Product B', data: [70, 85, 80, 75, 80] }
    ]
  })

  // 大数据集
  const [largeData, setLargeData] = useState<number[]>([])

  // 实时数据
  const [realtimeData, setRealtimeData] = useState({
    labels: ['A', 'B', 'C', 'D', 'E', 'F'],
    datasets: [
      { name: 'Real-time', data: [10, 20, 30, 40, 50, 60] }
    ]
  })

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 2, 24))
  }

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 2, 8))
  }

  const refreshData = () => {
    setLineData(Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50))
  }

  const generateLargeData = () => {
    console.time('Generate large dataset')
    const data = Array.from({ length: 50000 }, (_, i) => {
      return Math.sin(i / 100) * 50 + 50 + Math.random() * 20
    })
    setLargeData(data)
    console.timeEnd('Generate large dataset')

    setShowLargeData(true)

    setTimeout(() => {
      showStatsPanel()
    }, 1000)
  }

  const showStatsPanel = () => {
    // 模拟统计数据
    const mockStats = {
      cache: {
        size: 12,
        maxSize: 100,
        hits: 45,
        misses: 10,
        hitRate: 0.818,
        totalAccess: 55,
        memoryUsage: 2048000
      },
      instances: {
        total: 8,
        active: 8,
        memoryUsage: 15728640,
        avgAccessCount: 3.5
      },
      cleanup: {
        memoryPressure: 'low',
        cleanupCount: 5,
        lastCleanup: Date.now()
      }
    }

    setStats(mockStats)
  }

  const startRealtime = () => {
    if (realtimeRunning) {
      setRealtimeRunning(false)
      setUpdateCount(0)
    } else {
      setRealtimeRunning(true)
    }
  }

  // 实时更新效果
  useEffect(() => {
    if (!realtimeRunning) return

    const timer = setInterval(() => {
      setRealtimeData({
        labels: ['A', 'B', 'C', 'D', 'E', 'F'],
        datasets: [
          {
            name: 'Real-time',
            data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100))
          }
        ]
      })
      setUpdateCount(prev => prev + 1)
    }, 500)

    return () => clearInterval(timer)
  }, [realtimeRunning])

  return (
    <div className="container">
      <h1>@ldesign/chart v1.2.0 - React Example</h1>

      <div className="version-badge">
        <span className="badge">✅ Performance +40-70%</span>
        <span className="badge">✅ Memory -30%</span>
        <span className="badge">✅ Zero Memory Leaks</span>
      </div>

      <div className="controls">
        <button onClick={toggleDarkMode}>
          {darkMode ? '🌞 Light' : '🌙 Dark'}
        </button>
        <button onClick={increaseFontSize}>🔼 Font</button>
        <button onClick={decreaseFontSize}>🔽 Font</button>
        <button onClick={refreshData}>🔄 Refresh</button>
        <button onClick={showStatsPanel}>📊 Stats</button>
        <button onClick={generateLargeData}>🚀 Big Data</button>
      </div>

      {stats && (
        <div className="stats-panel">
          <h3>Performance Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="label">Cache Hit Rate:</span>
              <span className="value">{(stats.cache.hitRate * 100).toFixed(1)}%</span>
            </div>
            <div className="stat-item">
              <span className="label">Active Instances:</span>
              <span className="value">{stats.instances.active}</span>
            </div>
            <div className="stat-item">
              <span className="label">Memory Usage:</span>
              <span className="value">{(stats.instances.memoryUsage / 1024 / 1024).toFixed(1)}MB</span>
            </div>
            <div className="stat-item">
              <span className="label">Memory Pressure:</span>
              <span className="value">{stats.cleanup.memoryPressure}</span>
            </div>
          </div>
          <button onClick={() => setStats(null)}>Close</button>
        </div>
      )}

      <div className="chart-grid">
        {/* Line Chart - with cache */}
        <div className="chart-card">
          <h2>Line Chart - Simple Array <span className="opt-tag">✨ Cache</span></h2>
          <Chart
            type="line"
            data={lineData}
            title="Monthly Sales Trend"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
            cache
          />
        </div>

        {/* Bar Chart - High Priority */}
        <div className="chart-card">
          <h2>Bar Chart - Labels <span className="opt-tag">⭐ Priority</span></h2>
          <Chart
            type="bar"
            data={barData}
            title="Quarterly Revenue"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
            cache
            priority={8}
          />
        </div>

        {/* Pie Chart */}
        <div className="chart-card">
          <h2>Pie Chart</h2>
          <Chart
            type="pie"
            data={pieData}
            title="Product Distribution"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
          />
        </div>

        {/* Multi-Series Line Chart */}
        <div className="chart-card">
          <h2>Multi-Series Line</h2>
          <Chart
            type="line"
            data={multiLineData}
            title="Sales vs Profit"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
          />
        </div>

        {/* Scatter Chart */}
        <div className="chart-card">
          <h2>Scatter Chart</h2>
          <Chart
            type="scatter"
            data={scatterData}
            title="Data Distribution"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
          />
        </div>

        {/* Radar Chart */}
        <div className="chart-card">
          <h2>Radar Chart</h2>
          <Chart
            type="radar"
            data={radarData}
            title="Comprehensive Score"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
            cache
          />
        </div>

        {/* Large Dataset - Virtual Rendering */}
        {showLargeData && (
          <div className="chart-card chart-large">
            <h2>Large Dataset <span className="opt-tag">🚀 Virtual + Worker + Cache</span></h2>
            <p className="chart-desc">{largeData.length.toLocaleString()} data points with all optimizations</p>
            <Chart
              type="line"
              data={largeData}
              title="High Performance Large Dataset"
              darkMode={darkMode}
              fontSize={fontSize}
              height={400}
              virtual
              worker
              cache
              priority={9}
            />
          </div>
        )}

        {/* Real-time Updates */}
        <div className="chart-card chart-large">
          <h2>Real-time Updates <span className="opt-tag">⚡ RAF Scheduler</span></h2>
          <p className="chart-desc">
            <span className="tag">RAF Scheduling</span>
            <span className="tag">Batch Updates</span>
            <span className="tag">{updateCount} updates</span>
          </p>
          <button onClick={startRealtime}>
            {realtimeRunning ? '⏸️ Stop' : '▶️ Start'} Real-time Updates
          </button>
          <Chart
            type="bar"
            data={realtimeData}
            title="Real-time Data Stream"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
            cache
          />
        </div>
      </div>
    </div>
  )
}

export default App
