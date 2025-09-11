/**
 * 柱状图示例
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
 * 创建基础柱状图
 */
function createBasicBarChart() {
  const data = [
    { name: '产品A', value: 320 },
    { name: '产品B', value: 280 },
    { name: '产品C', value: 450 },
    { name: '产品D', value: 380 },
    { name: '产品E', value: 520 },
  ]

  try {
    const container = document.getElementById('basic-bar')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'bar',
      data,
      title: '基础柱状图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: [{
          itemStyle: {
            color: '#722ED1',
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '60%'
        }]
      }
    })

    const code = `const data = [
  { name: '产品A', value: 320 },
  { name: '产品B', value: 280 },
  // ... 更多数据
]

const chart = new Chart(container, {
  type: 'bar',
  data,
  title: '基础柱状图',
  barWidth: '60%'
})`

    document.getElementById('basic-bar-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建基础柱状图失败:', error)
    return null
  }
}

/**
 * 创建水平柱状图
 */
function createHorizontalBarChart() {
  const data = [
    { name: '移动端', value: 45 },
    { name: '桌面端', value: 35 },
    { name: '平板端', value: 15 },
    { name: '其他', value: 5 },
  ]

  try {
    const container = document.getElementById('horizontal-bar')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'bar',
      data,
      title: '水平柱状图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        xAxis: { type: 'value' },
        yAxis: { type: 'category' },
        series: [{
          itemStyle: {
            color: '#52c41a',
            borderRadius: [0, 4, 4, 0]
          }
        }]
      }
    })

    const code = `const chart = new Chart(container, {
  type: 'bar',
  data,
  title: '水平柱状图',
  horizontal: true
})`

    document.getElementById('horizontal-bar-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建水平柱状图失败:', error)
    return null
  }
}

/**
 * 创建堆叠柱状图
 */
function createStackedBarChart() {
  const data = {
    categories: ['1月', '2月', '3月', '4月', '5月'],
    series: [
      { name: '收入', data: [1000, 1200, 1100, 1400, 1300] },
      { name: '支出', data: [800, 900, 850, 1000, 950] },
      { name: '利润', data: [200, 300, 250, 400, 350] },
    ]
  }

  try {
    const container = document.getElementById('stacked-bar')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'bar',
      data,
      title: '堆叠柱状图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: data.series.map((s, index) => ({
          stack: 'total',
          itemStyle: {
            borderRadius: index === data.series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
          }
        }))
      }
    })

    const code = `const data = {
  categories: ['1月', '2月', '3月', '4月', '5月'],
  series: [
    { name: '收入', data: [1000, 1200, 1100, 1400, 1300] },
    { name: '支出', data: [800, 900, 850, 1000, 950] },
    { name: '利润', data: [200, 300, 250, 400, 350] }
  ]
}

const chart = new Chart(container, {
  type: 'bar',
  data,
  title: '堆叠柱状图',
  stack: true
})`

    document.getElementById('stacked-bar-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建堆叠柱状图失败:', error)
    return null
  }
}

/**
 * 创建分组柱状图
 */
function createGroupedBarChart() {
  const data = {
    categories: ['Q1', 'Q2', 'Q3', 'Q4'],
    series: [
      { name: '2023年', data: [120, 200, 150, 300] },
      { name: '2024年', data: [140, 180, 170, 280] },
    ]
  }

  try {
    const container = document.getElementById('grouped-bar')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'bar',
      data,
      title: '分组柱状图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: data.series.map(() => ({
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          },
          barWidth: '35%'
        }))
      }
    })

    const code = `const data = {
  categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  series: [
    { name: '2023年', data: [120, 200, 150, 300] },
    { name: '2024年', data: [140, 180, 170, 280] }
  ]
}

const chart = new Chart(container, {
  type: 'bar',
  data,
  title: '分组柱状图',
  grouped: true
})`

    document.getElementById('grouped-bar-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建分组柱状图失败:', error)
    return null
  }
}

/**
 * 初始化柱状图页面
 */
export async function initBarCharts(appState) {
  console.log('🔄 初始化柱状图页面...')
  
  const container = document.getElementById('bar-charts')
  if (!container) {
    throw new Error('找不到柱状图容器')
  }

  // 创建图表容器HTML
  container.innerHTML = `
    ${createChartContainer('basic-bar', '基础柱状图', '最简单的柱状图示例')}
    ${createChartContainer('horizontal-bar', '水平柱状图', '横向显示的柱状图')}
    ${createChartContainer('stacked-bar', '堆叠柱状图', '多个数据系列堆叠显示')}
    ${createChartContainer('grouped-bar', '分组柱状图', '多个数据系列分组对比')}
  `

  try {
    // 等待DOM完全渲染
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve)
      })
    })

    // 创建所有图表
    const charts = await Promise.all([
      createBasicBarChart(),
      createHorizontalBarChart(),
      createStackedBarChart(),
      createGroupedBarChart()
    ])

    console.log('✅ 柱状图页面初始化完成')
    
    return {
      basicBar: charts[0],
      horizontalBar: charts[1],
      stackedBar: charts[2],
      groupedBar: charts[3]
    }
  } catch (error) {
    console.error('❌ 柱状图页面初始化失败:', error)
    throw error
  }
}
