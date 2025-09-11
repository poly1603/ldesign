/**
 * 饼图示例
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
      chart.setOption({
        title: { textStyle: { color: textColor } },
        legend: { textStyle: { color: textColor } }
      })
    },
    resize: () => chart.resize(),
    dispose: () => chart.dispose()
  }
}

function createBasicPieChart() {
  const data = [
    { name: '移动端', value: 45 },
    { name: '桌面端', value: 35 },
    { name: '平板端', value: 15 },
    { name: '其他', value: 5 },
  ]

  try {
    const container = document.getElementById('basic-pie')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'pie',
      data,
      title: '基础饼图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: [{
          radius: '60%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    })

    const code = `const data = [
  { name: '移动端', value: 45 },
  { name: '桌面端', value: 35 },
  { name: '平板端', value: 15 },
  { name: '其他', value: 5 }
]

const chart = new Chart(container, {
  type: 'pie',
  data,
  title: '基础饼图'
})`

    document.getElementById('basic-pie-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建基础饼图失败:', error)
    return null
  }
}

function createDonutChart() {
  const data = [
    { name: '产品A', value: 335 },
    { name: '产品B', value: 310 },
    { name: '产品C', value: 234 },
    { name: '产品D', value: 135 },
  ]

  try {
    const container = document.getElementById('donut-pie')
    if (!container) return null

    const chart = new Chart(container, {
      type: 'pie',
      data,
      title: '环形图',
      theme: 'light',
      responsive: true,
      echartsOption: {
        series: [{
          radius: ['40%', '70%'],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    })

    const code = `const chart = new Chart(container, {
  type: 'pie',
  data,
  title: '环形图',
  donut: true,
  innerRadius: '40%',
  outerRadius: '70%'
})`

    document.getElementById('donut-pie-code').textContent = code

    return {
      chart,
      setTheme: (theme) => {
        chart.setTheme(theme)
      },
      resize: () => chart.resize(),
      dispose: () => chart.dispose()
    }
  } catch (error) {
    console.error('创建环形图失败:', error)
    return null
  }
}

export async function initPieCharts(appState) {
  console.log('🔄 初始化饼图页面...')
  
  const container = document.getElementById('pie-charts')
  if (!container) {
    throw new Error('找不到饼图容器')
  }

  container.innerHTML = `
    ${createChartContainer('basic-pie', '基础饼图', '展示数据的占比关系')}
    ${createChartContainer('donut-pie', '环形图', '中心空心的饼图')}
  `

  try {
    const charts = await Promise.all([
      createBasicPieChart(),
      createDonutChart()
    ])

    console.log('✅ 饼图页面初始化完成')
    
    return {
      basicPie: charts[0],
      donutPie: charts[1]
    }
  } catch (error) {
    console.error('❌ 饼图页面初始化失败:', error)
    throw error
  }
}
