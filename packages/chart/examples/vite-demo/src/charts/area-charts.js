/**
 * 面积图示例
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
        legend: { textStyle: { color: axisColor } },
        xAxis: { axisLabel: { color: axisColor } },
        yAxis: { axisLabel: { color: axisColor } }
      })
    },
    resize: () => chart.resize(),
    dispose: () => chart.dispose()
  }
}

function createBasicAreaChart() {
  const data = [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 },
  ]

  try {
    const container = document.getElementById('basic-area')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'area',
      data,
      title: '基础面积图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: [{
          smooth: true,
          lineStyle: {
            color: '#722ED1'
          },
          itemStyle: {
            color: '#722ED1'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(114, 46, 209, 0.6)'
              }, {
                offset: 1,
                color: 'rgba(114, 46, 209, 0.1)'
              }]
            }
          }
        }]
      }
    })

    const code = `const data = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  // ... 更多数据
]

const chart = new Chart(container, {
  type: 'area',
  data,
  title: '基础面积图',
  smooth: true,
  areaOpacity: 0.6
})`

    document.getElementById('basic-area-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建基础面积图失败:', error)
    return null
  }
}

function createStackedAreaChart() {
  const data = {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [
      { name: '收入', data: [1000, 1200, 1100, 1400, 1300, 1600] },
      { name: '支出', data: [800, 900, 850, 1000, 950, 1100] },
      { name: '利润', data: [200, 300, 250, 400, 350, 500] },
    ]
  }

  try {
    const container = document.getElementById('stacked-area')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'area',
      data,
      title: '堆叠面积图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: data.series.map(() => ({
          stack: 'total',
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8
          }
        }))
      }
    })

    const code = `const data = {
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '收入', data: [1000, 1200, 1100, 1400, 1300, 1600] },
    { name: '支出', data: [800, 900, 850, 1000, 950, 1100] },
    { name: '利润', data: [200, 300, 250, 400, 350, 500] }
  ]
}

const chart = new Chart(container, {
  type: 'area',
  data,
  title: '堆叠面积图',
  stack: true
})`

    document.getElementById('stacked-area-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建堆叠面积图失败:', error)
    return null
  }
}

export async function initAreaCharts(appState) {
  console.log('🔄 初始化面积图页面...')
  
  const container = document.getElementById('area-charts')
  if (!container) {
    throw new Error('找不到面积图容器')
  }

  container.innerHTML = `
    ${createChartContainer('basic-area', '基础面积图', '强调数据的累积效果')}
    ${createChartContainer('stacked-area', '堆叠面积图', '多个数据系列的累积展示')}
  `

  try {
    // 等待DOM完全渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    const charts = await Promise.all([
      createBasicAreaChart(),
      createStackedAreaChart()
    ])

    console.log('✅ 面积图页面初始化完成')
    
    return {
      basicArea: charts[0],
      stackedArea: charts[1]
    }
  } catch (error) {
    console.error('❌ 面积图页面初始化失败:', error)
    throw error
  }
}
