/**
 * 性能测试示例
 */

// 引入图表库
import { Chart } from '@ldesign/chart'

function createChartContainer(id, title, description, hasControls = false) {
  return `
    <div class="demo-container">
      <div class="demo-header">
        <h3 class="demo-title">${title}</h3>
        <p class="demo-description">${description}</p>
      </div>
      <div id="${id}" class="chart-container"></div>
      ${hasControls ? `<div id="${id}-controls" class="controls"></div>` : ''}
      <div class="code-container">
        <pre><code id="${id}-code"></code></pre>
      </div>
    </div>
  `
}

function createChartWrapper(chart) {
  return {
    chart,
    setTheme: (theme) => {
      const isDark = theme === 'dark'
      const textColor = isDark ? '#fff' : '#333'
      const axisColor = isDark ? '#fff' : '#666'
      
      chart.setOption({
        title: { textStyle: { color: textColor } },
        xAxis: { axisLabel: { color: axisColor } },
        yAxis: { axisLabel: { color: axisColor } }
      })
    },
    resize: () => chart.resize(),
    dispose: () => chart.dispose()
  }
}

function createLargeDataChart() {
  // 生成大量数据
  function generateLargeData(count) {
    const data = []
    for (let i = 0; i < count; i++) {
      data.push({
        name: `点${i}`,
        value: [i, Math.sin(i / 100) * 100 + Math.random() * 50]
      })
    }
    return data
  }

  try {
    const container = document.getElementById('large-data-chart')
    if (!container) return null

    let currentDataCount = 1000

    const chart = new Chart(container, {
      type: 'line',
      data: generateLargeData(currentDataCount),
      title: `大数据量图表 (${currentDataCount.toLocaleString()} 个点)`,
      theme: 'light',
      responsive: true,
      echartsOption: {
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          symbol: 'none',
          lineStyle: {
            color: '#722ED1',
            width: 1
          },
          large: true,
          largeThreshold: 500
        }]
      }
    })

    const updateChart = (dataCount) => {
      const startTime = performance.now()
      const data = generateLargeData(dataCount)
      const generateTime = performance.now() - startTime

      const renderStartTime = performance.now()
      chart.updateData(data)
      chart.setTitle(`大数据量图表 (${dataCount.toLocaleString()} 个点)`)
      const renderTime = performance.now() - renderStartTime

      // 更新性能信息
      const infoElement = document.getElementById('performance-info')
      if (infoElement) {
        infoElement.innerHTML = `
          <div>数据生成时间: ${generateTime.toFixed(2)}ms</div>
          <div>图表渲染时间: ${renderTime.toFixed(2)}ms</div>
          <div>总时间: ${(generateTime + renderTime).toFixed(2)}ms</div>
        `
      }
    }

    updateChart(currentDataCount)

    // 创建控制面板
    const controlsContainer = document.getElementById('large-data-chart-controls')
    if (controlsContainer) {
      controlsContainer.innerHTML = `
        <div class="control-group">
          <label>数据量:</label>
          <select id="data-count-select">
            <option value="1000">1,000 点</option>
            <option value="5000">5,000 点</option>
            <option value="10000">10,000 点</option>
            <option value="50000">50,000 点</option>
            <option value="100000">100,000 点</option>
          </select>
        </div>
        <div class="control-group">
          <button id="update-performance-btn">更新图表</button>
        </div>
        <div id="performance-info" style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;"></div>
      `

      document.getElementById('update-performance-btn').addEventListener('click', () => {
        const select = document.getElementById('data-count-select')
        currentDataCount = parseInt(select.value)
        updateChart(currentDataCount)
      })
    }

    const code = `// 生成大量数据
function generateLargeData(count) {
  const data = []
  for (let i = 0; i < count; i++) {
    data.push({ name: \`点\${i}\`, value: [i, Math.sin(i / 100) * 100 + Math.random() * 50] })
  }
  return data
}

// 创建高性能图表
const chart = new Chart(container, {
  type: 'line',
  data: generateLargeData(100000),
  title: '大数据量图表',
  large: true,
  largeThreshold: 500,
  symbol: 'none'
})`

    document.getElementById('large-data-chart-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建大数据量图表失败:', error)
    return null
  }
}

function createRealTimeChart() {
  const maxDataPoints = 50
  let data = []
  let timeIndex = 0

  try {
    const container = document.getElementById('realtime-chart')
    if (!container) return null

    // 初始化一些数据点，避免空数据验证失败
    const initialData = [
      { name: '0', value: 0 }
    ]

    const chart = new Chart(container, {
      type: 'line',
      data: initialData,
      title: '实时数据图表',
      theme: 'light',
      responsive: true,
      echartsOption: {
        yAxis: {
          min: 0,
          max: 100
        },
        series: [{
          smooth: true,
          lineStyle: { color: '#52c41a' },
          itemStyle: { color: '#52c41a' },
          symbol: 'circle',
          symbolSize: 4
        }]
      }
    })

    // 添加新数据点
    const addDataPoint = () => {
      const now = new Date()
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

      data.push({
        name: timeStr,
        value: Math.floor(Math.random() * 100)
      })

      // 保持数据点数量不超过最大值
      if (data.length > maxDataPoints) {
        data.shift()
      }

      chart.updateData([...data])
    }

    // 初始化一些数据
    for (let i = 0; i < 10; i++) {
      addDataPoint()
    }

    // 每秒添加新数据
    const interval = setInterval(addDataPoint, 1000)

    const code = `// 实时数据更新
const chart = new Chart(container, {
  type: 'line',
  data: [],
  title: '实时数据图表',
  smooth: true
})

// 每秒更新数据
setInterval(() => {
  const newData = {
    name: new Date().toLocaleTimeString(),
    value: Math.random() * 100
  }

  chart.updateData([...data, newData])

  // 保持数据量在合理范围
  if (data.length > 50) {
    data.shift()
  }
}, 1000)`

    document.getElementById('realtime-chart-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => {
        clearInterval(interval)
        chart.dispose()
      }
    }
  } catch (error) {
    console.error('创建实时数据图表失败:', error)
    return null
  }
}

export async function initPerformanceCharts(appState) {
  console.log('🔄 初始化性能测试页面...')
  
  const container = document.getElementById('performance-charts')
  if (!container) {
    throw new Error('找不到性能测试容器')
  }

  container.innerHTML = `
    ${createChartContainer('large-data-chart', '大数据量测试', '测试图表在大数据量下的渲染性能', true)}
    ${createChartContainer('realtime-chart', '实时数据更新', '模拟实时数据流的更新性能')}
  `

  try {
    // 等待DOM完全渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    const charts = await Promise.all([
      createLargeDataChart(),
      createRealTimeChart()
    ])

    console.log('✅ 性能测试页面初始化完成')
    
    return {
      largeDataChart: charts[0],
      realtimeChart: charts[1]
    }
  } catch (error) {
    console.error('❌ 性能测试页面初始化失败:', error)
    throw error
  }
}
