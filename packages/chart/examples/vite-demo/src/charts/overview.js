/**
 * 概览页面图表
 */

// 注意：这里我们直接引用构建后的文件，因为在开发环境中可能会有模块解析问题
// 在实际项目中，你可以直接使用 import { Chart } from '@ldesign/chart'

/**
 * 创建快速开始示例
 */
function createQuickStartExample() {
  // 模拟 Chart 类的基本功能
  const mockChart = {
    setTheme: (theme) => {
      console.log(`设置主题: ${theme}`)
      // 这里应该更新图表主题
    },
    resize: () => {
      console.log('调整图表大小')
      // 这里应该调整图表大小
    },
    dispose: () => {
      console.log('销毁图表')
      // 这里应该销毁图表
    }
  }

  // 示例数据
  const data = [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 },
  ]

  // 创建原生 ECharts 图表作为演示
  const container = document.getElementById('quick-start-chart')
  if (!container) return null

  // 动态导入 ECharts
  import('echarts').then(echarts => {
    const chart = echarts.init(container)
    
    const option = {
      title: {
        text: '月度销售趋势',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c}'
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          color: '#666'
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: '#666'
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [{
        data: data.map(item => item.value),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
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
              color: 'rgba(114, 46, 209, 0.3)'
            }, {
              offset: 1,
              color: 'rgba(114, 46, 209, 0.05)'
            }]
          }
        }
      }],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      }
    }

    chart.setOption(option)

    // 响应式处理
    const resizeChart = () => {
      chart.resize()
    }
    window.addEventListener('resize', resizeChart)

    // 主题切换处理
    mockChart.setTheme = (theme) => {
      const isDark = theme === 'dark'
      const isColorful = theme === 'colorful'
      
      let colors = {
        text: isDark ? '#ffffff' : '#333333',
        line: isDark ? '#404040' : '#e0e0e0',
        split: isDark ? '#404040' : '#f0f0f0',
        primary: isColorful ? '#ff6b6b' : '#722ED1'
      }

      chart.setOption({
        title: {
          textStyle: {
            color: colors.text
          }
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: colors.line
            }
          },
          axisLabel: {
            color: colors.text
          }
        },
        yAxis: {
          axisLabel: {
            color: colors.text
          },
          splitLine: {
            lineStyle: {
              color: colors.split
            }
          }
        },
        series: [{
          lineStyle: {
            color: colors.primary
          },
          itemStyle: {
            color: colors.primary
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
                color: colors.primary.replace(')', ', 0.3)')
              }, {
                offset: 1,
                color: colors.primary.replace(')', ', 0.05)')
              }]
            }
          }
        }]
      })
    }

    mockChart.resize = resizeChart
    mockChart.dispose = () => {
      window.removeEventListener('resize', resizeChart)
      chart.dispose()
    }
  }).catch(error => {
    console.error('加载 ECharts 失败:', error)
    container.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #999;">图表加载失败</div>'
  })

  return mockChart
}

/**
 * 显示代码示例
 */
function showCodeExample() {
  const codeElement = document.getElementById('quick-start-code')
  if (!codeElement) return

  const code = `import { Chart } from '@ldesign/chart'

// 准备数据
const data = [
  { name: '1月', value: 120 },
  { name: '2月', value: 200 },
  { name: '3月', value: 150 },
  { name: '4月', value: 300 },
  { name: '5月', value: 250 },
  { name: '6月', value: 400 },
]

// 创建图表
const chart = new Chart(container, {
  type: 'line',
  data,
  title: '月度销售趋势',
  smooth: true,
  theme: 'light'
})

// 主题切换
chart.setTheme('dark')

// 数据更新
chart.updateData(newData)

// 事件监听
chart.on('click', (params) => {
  console.log('点击了:', params.name, params.value)
})`

  codeElement.textContent = code
}

/**
 * 初始化概览页面
 */
export async function initOverview(appState) {
  console.log('🔄 初始化概览页面...')
  
  try {
    // 创建快速开始示例
    const quickStartChart = createQuickStartExample()
    
    // 显示代码示例
    showCodeExample()
    
    console.log('✅ 概览页面初始化完成')
    
    return {
      quickStart: quickStartChart
    }
  } catch (error) {
    console.error('❌ 概览页面初始化失败:', error)
    throw error
  }
}
