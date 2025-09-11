/**
 * 散点图示例
 */

// 引入图表库
import { Chart } from '@ldesign/chart'

function createChartContainer(id, title, description) {
  return `
    <div class="demo-container">
      <div class="demo-header">
        <h3 class="demo-title">${title}</h3>
        <p class="demo-description">${description}</p>
      </div>
      <div id="${id}" class="chart-container"></div>
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
        xAxis: { axisLabel: { color: axisColor }, nameTextStyle: { color: textColor } },
        yAxis: { axisLabel: { color: axisColor }, nameTextStyle: { color: textColor } }
      })
    },
    resize: () => chart.resize(),
    dispose: () => chart.dispose()
  }
}

function createBasicScatterChart() {
  // 生成随机散点数据，转换为我们库支持的格式
  const data = []
  for (let i = 0; i < 50; i++) {
    data.push({
      name: `点${i + 1}`,
      value: [Math.random() * 100, Math.random() * 100]
    })
  }

  try {
    const container = document.getElementById('basic-scatter')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'scatter',
      data,
      title: '基础散点图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        xAxis: {
          name: 'X轴',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value'
        },
        yAxis: {
          name: 'Y轴',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value'
        },
        series: [{
          symbolSize: 8,
          itemStyle: {
            color: '#722ED1'
          }
        }]
      }
    })

    const code = `const data = [
  { name: '点1', value: [10, 20] },
  { name: '点2', value: [15, 25] },
  { name: '点3', value: [20, 18] },
  // ... 更多坐标点
]

const chart = new Chart(container, {
  type: 'scatter',
  data,
  title: '基础散点图',
  xAxis: { name: 'X轴' },
  yAxis: { name: 'Y轴' }
})`

    document.getElementById('basic-scatter-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建基础散点图失败:', error)
    return null
  }
}

function createBubbleChart() {
  // 生成气泡图数据，转换为我们库支持的格式
  const data = []
  for (let i = 0; i < 30; i++) {
    data.push({
      name: `气泡${i + 1}`,
      value: [
        Math.random() * 100,
        Math.random() * 100,
        Math.random() * 50 + 10
      ]
    })
  }

  try {
    const container = document.getElementById('bubble-chart')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'scatter',
      data,
      title: '气泡图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        xAxis: {
          name: '销售额',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value'
        },
        yAxis: {
          name: '利润率',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value'
        },
        series: [{
          symbolSize: function (data) {
            return data[2] / 2
          },
          itemStyle: {
            color: '#52c41a',
            opacity: 0.7
          }
        }]
      }
    })

    const code = `const data = [
  { name: '气泡1', value: [100, 20, 50] }, // [x, y, size]
  { name: '气泡2', value: [150, 25, 80] },
  { name: '气泡3', value: [200, 18, 30] }
  // ... 更多数据点
]

const chart = new Chart(container, {
  type: 'scatter',
  data,
  title: '气泡图',
  symbolSize: (value) => value[2],
  xAxis: { name: '销售额' },
  yAxis: { name: '利润率' }
})`

    document.getElementById('bubble-chart-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建气泡图失败:', error)
    return null
  }
}

export async function initScatterCharts(appState) {
  console.log('🔄 初始化散点图页面...')
  
  const container = document.getElementById('scatter-charts')
  if (!container) {
    throw new Error('找不到散点图容器')
  }

  container.innerHTML = `
    ${createChartContainer('basic-scatter', '基础散点图', '展示两个变量之间的关系')}
    ${createChartContainer('bubble-chart', '气泡图', '三维数据的可视化展示')}
  `

  try {
    // 等待DOM完全渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    const charts = await Promise.all([
      createBasicScatterChart(),
      createBubbleChart()
    ])

    console.log('✅ 散点图页面初始化完成')
    
    return {
      basicScatter: charts[0],
      bubbleChart: charts[1]
    }
  } catch (error) {
    console.error('❌ 散点图页面初始化失败:', error)
    throw error
  }
}
