import React, { useState } from 'react'
import { Chart } from '@ldesign/chart/react'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(12)

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

  return (
    <div className="container">
      <h1>@ldesign/chart - React Example</h1>

      <div className="controls">
        <button onClick={toggleDarkMode}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <button onClick={increaseFontSize}>Increase Font Size</button>
        <button onClick={decreaseFontSize}>Decrease Font Size</button>
        <button onClick={refreshData}>Refresh Data</button>
      </div>

      <div className="chart-grid">
        {/* Line Chart */}
        <div className="chart-card">
          <h2>Line Chart - Simple Array</h2>
          <Chart
            type="line"
            data={lineData}
            title="Monthly Sales Trend"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
          />
        </div>

        {/* Bar Chart */}
        <div className="chart-card">
          <h2>Bar Chart - With Labels</h2>
          <Chart
            type="bar"
            data={barData}
            title="Quarterly Revenue"
            darkMode={darkMode}
            fontSize={fontSize}
            height={300}
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
          <h2>Multi-Series Line Chart</h2>
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
          />
        </div>
      </div>
    </div>
  )
}

export default App

