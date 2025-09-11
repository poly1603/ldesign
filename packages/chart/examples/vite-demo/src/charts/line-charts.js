/**
 * 折线图示例
 */

// 引入图表库
import { Chart } from '@ldesign/chart'

/**
 * 创建图表容器
 */
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

/**
 * 通用图表包装器
 */
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

/**
 * 创建基础折线图
 */
function createBasicLineChart() {
  const data = [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 },
    { name: '7月', value: 350 },
    { name: '8月', value: 450 },
  ]

  try {
    const container = document.getElementById('basic-line')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'line',
      data,
      title: '基础折线图',
      theme: 'light',
      responsive: true
    })

    // 代码示例
    const code = `const data = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  // ... 更多数据
]

const chart = new Chart(container, {
  type: 'line',
  data,
  title: '基础折线图'
})`

    document.getElementById('basic-line-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建基础折线图失败:', error)
    return null
  }
}

/**
 * 创建平滑折线图
 */
function createSmoothLineChart() {
  const data = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 78 },
    { name: 'Mar', value: 92 },
    { name: 'Apr', value: 85 },
    { name: 'May', value: 98 },
    { name: 'Jun', value: 87 },
  ]

  try {
    const container = document.getElementById('smooth-line')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'line',
      data,
      title: '平滑折线图',
      theme: 'light',
      responsive: true,
      // 这些选项需要通过 echartsOption 传递
      echartsOption: {
        series: [{
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#52c41a',
            width: 3
          },
          itemStyle: { color: '#52c41a' }
        }]
      }
    })

    const code = `const chart = new Chart(container, {
  type: 'line',
  data,
  title: '平滑折线图',
  smooth: true,
  symbolSize: 8,
  lineWidth: 3
})`

    document.getElementById('smooth-line-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建平滑折线图失败:', error)
    return null
  }
}

/**
 * 创建多系列折线图
 */
function createMultiLineChart() {
  const data = {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
    series: [
      { name: '产品A', data: [120, 200, 150, 300, 250, 400] },
      { name: '产品B', data: [80, 180, 120, 280, 200, 350] },
      { name: '产品C', data: [100, 160, 140, 260, 220, 380] },
    ]
  }

  try {
    const container = document.getElementById('multi-line')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'line',
      data,
      title: '多系列折线图',
      theme: 'light',
      responsive: true
    })

    const code = `const data = {
  categories: ['1月', '2月', '3月', '4月', '5月', '6月'],
  series: [
    { name: '产品A', data: [120, 200, 150, 300, 250, 400] },
    { name: '产品B', data: [80, 180, 120, 280, 200, 350] },
    { name: '产品C', data: [100, 160, 140, 260, 220, 380] }
  ]
}

const chart = new Chart(container, {
  type: 'line',
  data,
  title: '多系列折线图'
})`

    document.getElementById('multi-line-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建多系列折线图失败:', error)
    return null
  }
}

/**
 * 创建时间序列折线图
 */
function createTimeSeriesChart() {
  // 生成时间序列数据，转换为我们库支持的格式
  const startDate = new Date('2024-01-01')
  const data = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
    const value = Math.floor(Math.random() * 100) + 50
    data.push({
      name: date.toISOString().split('T')[0],
      value: value
    })
  }

  try {
    const container = document.getElementById('time-series')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'line',
      data,
      title: '时间序列折线图',
      theme: 'light',
      responsive: true,
      // 时间序列特定配置
      echartsOption: {
        xAxis: {
          type: 'category', // 暂时使用 category 类型
          axisLabel: {
            rotate: 45
          }
        },
        series: [{
          lineStyle: { color: '#fa8c16' },
          itemStyle: { color: '#fa8c16' },
          symbol: 'circle',
          symbolSize: 4
        }]
      }
    })

    const code = `// 时间序列数据格式
const data = [
  ['2024-01-01', 65],
  ['2024-01-02', 78],
  ['2024-01-03', 92],
  // ... 更多时间数据
]

const chart = new Chart(container, {
  type: 'line',
  data,
  title: '时间序列折线图',
  xAxisType: 'time'
})`

    document.getElementById('time-series-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建时间序列折线图失败:', error)
    return null
  }
}

/**
 * 初始化折线图页面
 */
export async function initLineCharts(appState) {
  console.log('🔄 初始化折线图页面...')
  
  const container = document.getElementById('line-charts')
  if (!container) {
    throw new Error('找不到折线图容器')
  }

  // 创建图表容器HTML
  container.innerHTML = `
    ${createChartContainer('basic-line', '基础折线图', '最简单的折线图示例')}
    ${createChartContainer('smooth-line', '平滑折线图', '使用平滑曲线的折线图')}
    ${createChartContainer('multi-line', '多系列折线图', '展示多个数据系列的对比')}
    ${createChartContainer('time-series', '时间序列折线图', '基于时间轴的数据展示')}
  `

  try {
    // 创建所有图表
    const charts = await Promise.all([
      createBasicLineChart(),
      createSmoothLineChart(),
      createMultiLineChart(),
      createTimeSeriesChart()
    ])

    console.log('✅ 折线图页面初始化完成')
    
    return {
      basicLine: charts[0],
      smoothLine: charts[1],
      multiLine: charts[2],
      timeSeries: charts[3]
    }
  } catch (error) {
    console.error('❌ 折线图页面初始化失败:', error)
    throw error
  }
}
