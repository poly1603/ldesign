/**
 * 高级功能示例
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
        legend: { textStyle: { color: axisColor } },
        xAxis: { axisLabel: { color: axisColor } },
        yAxis: { axisLabel: { color: axisColor } }
      })
    },
    resize: () => chart.resize(),
    dispose: () => chart.dispose()
  }
}

function createInteractiveChart() {
  let data = [
    { name: '产品A', value: 100 },
    { name: '产品B', value: 200 },
    { name: '产品C', value: 150 },
    { name: '产品D', value: 300 },
  ]

  try {
    const container = document.getElementById('interactive-chart')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'bar',
      data,
      title: '交互式图表',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: [{
          itemStyle: {
            color: '#722ED1',
            borderRadius: [4, 4, 0, 0]
          }
        }]
      }
    })

    // 添加点击事件
    chart.getEChartsInstance().on('click', function (params) {
      alert(`点击了 ${params.name}: ${params.value}`)
    })

    const updateChart = () => {
      chart.updateData(data)
    }

    // 创建控制面板
    const controlsContainer = document.getElementById('interactive-chart-controls')
    if (controlsContainer) {
      controlsContainer.innerHTML = `
        <div class="control-group">
          <button id="update-data-btn">更新数据</button>
        </div>
        <div class="control-group">
          <button id="add-data-btn">添加数据</button>
        </div>
        <div class="control-group">
          <button id="remove-data-btn">删除数据</button>
        </div>
      `

      // 更新数据按钮
      document.getElementById('update-data-btn').addEventListener('click', () => {
        data = data.map(item => ({
          ...item,
          value: Math.floor(Math.random() * 400) + 50
        }))
        updateChart()
      })

      // 添加数据按钮
      document.getElementById('add-data-btn').addEventListener('click', () => {
        const newItem = {
          name: `产品${String.fromCharCode(65 + data.length)}`,
          value: Math.floor(Math.random() * 400) + 50
        }
        data.push(newItem)
        updateChart()
      })

      // 删除数据按钮
      document.getElementById('remove-data-btn').addEventListener('click', () => {
        if (data.length > 1) {
          data.pop()
          updateChart()
        }
      })
    }

    const code = `// 创建图表
const chart = new Chart(container, {
  type: 'bar',
  data,
  title: '交互式图表'
})

// 添加点击事件
chart.getEChartsInstance().on('click', (params) => {
  alert(\`点击了 \${params.name}: \${params.value}\`)
})

// 动态更新数据
chart.updateData(newData)`

    document.getElementById('interactive-chart-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建交互式图表失败:', error)
    return null
  }
}

function createAnimationChart() {
  const categories = ['1月', '2月', '3月', '4月', '5月', '6月']
  let currentIndex = 0
  const allData = [
    [120, 200, 150, 300, 250, 400],
    [140, 180, 170, 280, 270, 380],
    [100, 220, 130, 320, 230, 420],
    [160, 160, 190, 260, 290, 360],
  ]

  try {
    const container = document.getElementById('animation-chart')
    if (!container) return null

    // 转换数据格式
    const convertData = (dataIndex) => {
      return categories.map((name, index) => ({
        name,
        value: allData[dataIndex][index]
      }))
    }

    const chart = new Chart(container, {
      type: 'line',
      data: convertData(0),
      title: `动画图表 - 数据集 1`,
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: [{
          smooth: true,
          lineStyle: { color: '#52c41a' },
          itemStyle: { color: '#52c41a' },
          animationDuration: 1000,
          animationEasing: 'cubicOut'
        }]
      }
    })

    const updateChart = (dataIndex) => {
      const newData = convertData(dataIndex)
      chart.updateData(newData)
      chart.setTitle(`动画图表 - 数据集 ${dataIndex + 1}`)
    }

    updateChart(0)

    // 自动切换数据
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % allData.length
      updateChart(currentIndex)
    }, 3000)

    const code = `const chart = new Chart(container, {
  type: 'line',
  data,
  title: '动画图表',
  animation: {
    duration: 1000,
    easing: 'cubicOut'
  }
})

// 自动更新数据
setInterval(() => {
  chart.updateData(getNextData())
}, 3000)`

    document.getElementById('animation-chart-code').textContent = code

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
    console.error('创建动画图表失败:', error)
    return null
  }
}

export async function initAdvancedCharts(appState) {
  console.log('🔄 初始化高级功能页面...')
  
  const container = document.getElementById('advanced-charts')
  if (!container) {
    throw new Error('找不到高级功能容器')
  }

  container.innerHTML = `
    ${createChartContainer('interactive-chart', '交互式图表', '支持点击事件和动态数据更新', true)}
    ${createChartContainer('animation-chart', '动画图表', '自动切换数据的动画效果')}
  `

  try {
    // 等待DOM完全渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    const charts = await Promise.all([
      createInteractiveChart(),
      createAnimationChart()
    ])

    console.log('✅ 高级功能页面初始化完成')
    
    return {
      interactiveChart: charts[0],
      animationChart: charts[1]
    }
  } catch (error) {
    console.error('❌ 高级功能页面初始化失败:', error)
    throw error
  }
}
