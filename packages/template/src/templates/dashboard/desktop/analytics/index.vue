<template>
  <div class="dashboard-template-analytics" :style="cssVars">
    <!-- 头部区域 -->
    <div class="analytics-header">
      <slot name="header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="dashboard-title">{{ title }}</h1>
            <p class="dashboard-subtitle">{{ subtitle }}</p>
          </div>
          
          <div class="header-right">
            <!-- 实时状态指示器 -->
            <div v-if="showRealTime" class="realtime-indicator" :class="{ active: isRealTimeActive }">
              <div class="indicator-dot"></div>
              <span class="indicator-text">{{ isRealTimeActive ? '实时更新' : '已暂停' }}</span>
              <button class="toggle-btn" @click="toggleRealTime">
                {{ isRealTimeActive ? '⏸️' : '▶️' }}
              </button>
            </div>
            
            <!-- 导出按钮 -->
            <button v-if="showExport" class="export-btn" @click="handleExport">
              <span class="btn-icon">📊</span>
              <span class="btn-text">导出报告</span>
            </button>
          </div>
        </div>
      </slot>
    </div>

    <!-- 筛选器区域 -->
    <div v-if="showFilters" class="analytics-filters">
      <slot name="filters">
        <div class="filters-content">
          <div class="filter-group">
            <label class="filter-label">时间范围</label>
            <select v-model="selectedTimeRange" class="filter-select">
              <option value="1d">今天</option>
              <option value="7d">最近7天</option>
              <option value="30d">最近30天</option>
              <option value="90d">最近90天</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">数据源</label>
            <select v-model="selectedDataSource" class="filter-select">
              <option value="all">全部</option>
              <option value="web">网站</option>
              <option value="mobile">移动端</option>
              <option value="api">API</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">指标类型</label>
            <select v-model="selectedMetric" class="filter-select">
              <option value="traffic">流量</option>
              <option value="conversion">转化</option>
              <option value="revenue">收入</option>
              <option value="engagement">参与度</option>
            </select>
          </div>
          
          <button class="apply-filters-btn" @click="applyFilters">
            <span class="btn-icon">🔍</span>
            <span class="btn-text">应用筛选</span>
          </button>
        </div>
      </slot>
    </div>

    <!-- KPI指标卡片 -->
    <div class="kpi-section">
      <slot name="kpi-cards">
        <div class="kpi-grid">
          <div v-for="kpi in kpiData" :key="kpi.id" class="kpi-card" :class="kpi.trend">
            <div class="kpi-header">
              <div class="kpi-icon" :style="{ background: kpi.color }">{{ kpi.icon }}</div>
              <div class="kpi-trend-indicator">
                <span class="trend-arrow">{{ kpi.trend === 'up' ? '↗️' : kpi.trend === 'down' ? '↘️' : '➡️' }}</span>
                <span class="trend-value">{{ kpi.change }}</span>
              </div>
            </div>
            <div class="kpi-content">
              <div class="kpi-value">{{ formatKpiValue(kpi.value, kpi.type) }}</div>
              <div class="kpi-label">{{ kpi.label }}</div>
            </div>
            <div class="kpi-sparkline">
              <div class="sparkline-bars">
                <div v-for="(bar, index) in kpi.sparkline" :key="index" 
                     class="sparkline-bar" 
                     :style="{ height: `${bar}%`, background: kpi.color }">
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>

    <!-- 主要图表区域 -->
    <div class="main-chart-section">
      <slot name="main-chart">
        <div class="chart-container">
          <div class="chart-header">
            <h3 class="chart-title">流量趋势分析</h3>
            <div class="chart-controls">
              <div class="chart-tabs">
                <button v-for="tab in chartTabs" :key="tab.id" 
                        class="chart-tab" 
                        :class="{ active: activeChartTab === tab.id }"
                        @click="activeChartTab = tab.id">
                  {{ tab.label }}
                </button>
              </div>
            </div>
          </div>
          <div class="chart-content">
            <div class="main-chart">
              <!-- 模拟折线图 -->
              <svg class="line-chart" viewBox="0 0 800 300">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" :style="{ stopColor: primaryColor, stopOpacity: 0.3 }" />
                    <stop offset="100%" :style="{ stopColor: primaryColor, stopOpacity: 0 }" />
                  </linearGradient>
                </defs>
                
                <!-- 网格线 -->
                <g class="grid-lines">
                  <line v-for="i in 5" :key="`h-${i}`" 
                        :x1="0" :y1="i * 60" :x2="800" :y2="i * 60" 
                        stroke="#f0f0f0" stroke-width="1" />
                  <line v-for="i in 8" :key="`v-${i}`" 
                        :x1="i * 100" :y1="0" :x2="i * 100" :y2="300" 
                        stroke="#f0f0f0" stroke-width="1" />
                </g>
                
                <!-- 数据区域 -->
                <path :d="chartPath" :fill="'url(#chartGradient)'" />
                
                <!-- 数据线 -->
                <path :d="chartPath" fill="none" :stroke="primaryColor" stroke-width="3" />
                
                <!-- 数据点 -->
                <circle v-for="(point, index) in chartPoints" :key="index"
                        :cx="point.x" :cy="point.y" r="4" 
                        :fill="primaryColor" stroke="#fff" stroke-width="2" />
              </svg>
            </div>
          </div>
        </div>
      </slot>
    </div>

    <!-- 次要图表区域 -->
    <div class="secondary-charts-section">
      <slot name="secondary-charts">
        <div class="charts-grid">
          <!-- 饼图 -->
          <div class="chart-card">
            <div class="chart-header">
              <h4 class="chart-title">流量来源</h4>
            </div>
            <div class="chart-content">
              <div class="pie-chart-container">
                <svg class="pie-chart" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="80" fill="none" 
                          :stroke="primaryColor" stroke-width="20" 
                          stroke-dasharray="251.2" stroke-dashoffset="62.8" />
                  <circle cx="100" cy="100" r="80" fill="none" 
                          :stroke="accentColor" stroke-width="20" 
                          stroke-dasharray="125.6" stroke-dashoffset="188.4" />
                  <circle cx="100" cy="100" r="80" fill="none" 
                          stroke="#f0f0f0" stroke-width="20" 
                          stroke-dasharray="62.8" stroke-dashoffset="251.2" />
                </svg>
                <div class="pie-center">
                  <div class="pie-value">75%</div>
                  <div class="pie-label">直接访问</div>
                </div>
              </div>
              <div class="pie-legend">
                <div class="legend-item">
                  <div class="legend-color" :style="{ background: primaryColor }"></div>
                  <span class="legend-text">直接访问 (75%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" :style="{ background: accentColor }"></div>
                  <span class="legend-text">搜索引擎 (20%)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color" style="background: #f0f0f0"></div>
                  <span class="legend-text">其他 (5%)</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 柱状图 -->
          <div class="chart-card">
            <div class="chart-header">
              <h4 class="chart-title">设备分布</h4>
            </div>
            <div class="chart-content">
              <div class="bar-chart">
                <div class="bar-item">
                  <div class="bar-label">桌面端</div>
                  <div class="bar-container">
                    <div class="bar-fill" :style="{ width: '65%', background: primaryColor }"></div>
                  </div>
                  <div class="bar-value">65%</div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">移动端</div>
                  <div class="bar-container">
                    <div class="bar-fill" :style="{ width: '30%', background: accentColor }"></div>
                  </div>
                  <div class="bar-value">30%</div>
                </div>
                <div class="bar-item">
                  <div class="bar-label">平板</div>
                  <div class="bar-container">
                    <div class="bar-fill" style="width: 5%; background: #f0f0f0"></div>
                  </div>
                  <div class="bar-value">5%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 热力图 -->
          <div class="chart-card">
            <div class="chart-header">
              <h4 class="chart-title">活跃时段</h4>
            </div>
            <div class="chart-content">
              <div class="heatmap">
                <div v-for="hour in 24" :key="hour" class="heatmap-cell"
                     :style="{ opacity: getHeatmapOpacity(hour) }"
                     :title="`${hour}:00 - ${getHeatmapValue(hour)}%`">
                </div>
              </div>
              <div class="heatmap-legend">
                <span class="legend-label">活跃度</span>
                <div class="legend-gradient"></div>
                <div class="legend-labels">
                  <span>低</span>
                  <span>高</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>

    <!-- 智能洞察 -->
    <div class="insights-section">
      <slot name="insights">
        <div class="insights-container">
          <div class="insights-header">
            <h3 class="insights-title">🧠 智能洞察</h3>
            <div class="insights-time">{{ currentTime }}</div>
          </div>
          <div class="insights-content">
            <div v-for="insight in insights" :key="insight.id" class="insight-item" :class="insight.type">
              <div class="insight-icon">{{ insight.icon }}</div>
              <div class="insight-content">
                <div class="insight-title">{{ insight.title }}</div>
                <div class="insight-description">{{ insight.description }}</div>
              </div>
              <div class="insight-action">
                <button class="insight-btn">查看详情</button>
              </div>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

// Props定义
interface Props {
  title?: string
  subtitle?: string
  showFilters?: boolean
  showRealTime?: boolean
  showExport?: boolean
  timeRange?: string
  primaryColor?: string
  accentColor?: string
  enableAnimations?: boolean
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '数据分析中心',
  subtitle: '洞察数据，驱动增长',
  showFilters: true,
  showRealTime: true,
  showExport: true,
  timeRange: '7d',
  primaryColor: '#722ed1',
  accentColor: '#13c2c2',
  enableAnimations: true,
  refreshInterval: 30000
})

// 状态管理
const isRealTimeActive = ref(true)
const selectedTimeRange = ref(props.timeRange)
const selectedDataSource = ref('all')
const selectedMetric = ref('traffic')
const activeChartTab = ref('overview')
const currentTime = ref('')

// 图表数据
const kpiData = reactive([
  {
    id: 'visitors',
    label: '访问用户',
    value: 24567,
    type: 'number',
    change: '+12.5%',
    trend: 'up',
    color: '#722ed1',
    icon: '👥',
    sparkline: [60, 70, 65, 80, 75, 90, 85]
  },
  {
    id: 'pageviews',
    label: '页面浏览',
    value: 89234,
    type: 'number',
    change: '+8.3%',
    trend: 'up',
    color: '#13c2c2',
    icon: '📄',
    sparkline: [45, 55, 60, 70, 65, 75, 80]
  },
  {
    id: 'bounce_rate',
    label: '跳出率',
    value: 32.5,
    type: 'percentage',
    change: '-2.1%',
    trend: 'down',
    color: '#52c41a',
    icon: '📉',
    sparkline: [80, 75, 70, 65, 60, 55, 50]
  },
  {
    id: 'conversion',
    label: '转化率',
    value: 4.8,
    type: 'percentage',
    change: '+0.3%',
    trend: 'up',
    color: '#fa8c16',
    icon: '🎯',
    sparkline: [30, 35, 40, 45, 50, 48, 52]
  }
])

const chartTabs = [
  { id: 'overview', label: '概览' },
  { id: 'traffic', label: '流量' },
  { id: 'conversion', label: '转化' },
  { id: 'revenue', label: '收入' }
]

const insights = reactive([
  {
    id: 1,
    type: 'positive',
    icon: '📈',
    title: '流量增长显著',
    description: '相比上周，网站流量增长了12.5%，主要来源于搜索引擎优化的改善。'
  },
  {
    id: 2,
    type: 'warning',
    icon: '⚠️',
    title: '移动端跳出率偏高',
    description: '移动端用户的跳出率达到45%，建议优化移动端用户体验。'
  },
  {
    id: 3,
    type: 'info',
    icon: '💡',
    title: '最佳发布时间',
    description: '数据显示，下午2-4点是用户最活跃的时段，建议在此时间发布内容。'
  }
])

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--accent-color': props.accentColor
}))

// 模拟图表数据
const chartPoints = computed(() => {
  const points = []
  for (let i = 0; i < 8; i++) {
    points.push({
      x: i * 100 + 50,
      y: 250 - Math.random() * 200
    })
  }
  return points
})

const chartPath = computed(() => {
  if (chartPoints.value.length === 0) return ''
  
  let path = `M ${chartPoints.value[0].x} ${chartPoints.value[0].y}`
  for (let i = 1; i < chartPoints.value.length; i++) {
    path += ` L ${chartPoints.value[i].x} ${chartPoints.value[i].y}`
  }
  path += ` L ${chartPoints.value[chartPoints.value.length - 1].x} 300 L ${chartPoints.value[0].x} 300 Z`
  return path
})

// 工具函数
const formatKpiValue = (value: number, type: string) => {
  if (type === 'percentage') {
    return `${value}%`
  }
  return value.toLocaleString()
}

const getHeatmapOpacity = (hour: number) => {
  // 模拟一天中不同时段的活跃度
  const activity = Math.sin((hour - 6) * Math.PI / 12) * 0.5 + 0.5
  return Math.max(0.1, activity)
}

const getHeatmapValue = (hour: number) => {
  return Math.round(getHeatmapOpacity(hour) * 100)
}

const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-CN')
}

// 事件处理
const toggleRealTime = () => {
  isRealTimeActive.value = !isRealTimeActive.value
}

const handleExport = () => {
  alert('导出报告功能')
}

const applyFilters = () => {
  console.log('应用筛选:', {
    timeRange: selectedTimeRange.value,
    dataSource: selectedDataSource.value,
    metric: selectedMetric.value
  })
}

// 生命周期
let refreshTimer: number

onMounted(() => {
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)
  
  if (props.refreshInterval > 0) {
    refreshTimer = window.setInterval(() => {
      if (isRealTimeActive.value) {
        // 模拟数据更新
        console.log('刷新数据')
      }
    }, props.refreshInterval)
  }
  
  return () => {
    clearInterval(timeInterval)
    if (refreshTimer) clearInterval(refreshTimer)
  }
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style lang="less" scoped>
.dashboard-template-analytics {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 头部区域
.analytics-header {
  background: #fff;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;

    .header-left {
      .dashboard-title {
        font-size: 2rem;
        font-weight: 700;
        color: #262626;
        margin-bottom: 0.5rem;
        background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .dashboard-subtitle {
        font-size: 1rem;
        color: #8c8c8c;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;

      .realtime-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #f5f5f5;
        border-radius: 20px;
        font-size: 0.9rem;

        &.active {
          background: rgba(114, 46, 209, 0.1);
          color: var(--primary-color);

          .indicator-dot {
            background: var(--primary-color);
            animation: pulse 2s infinite;
          }
        }

        .indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #d9d9d9;
        }

        .toggle-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 0.25rem;
          border-radius: 4px;
          transition: background 0.3s ease;

          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        }
      }

      .export-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--primary-color);
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;

        &:hover {
          background: var(--accent-color);
          transform: translateY(-2px);
        }

        .btn-icon {
          font-size: 1rem;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

// 筛选器区域
.analytics-filters {
  background: #fff;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e8e8e8;

  .filters-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .filter-label {
        font-size: 0.8rem;
        font-weight: 500;
        color: #8c8c8c;
      }

      .filter-select {
        padding: 0.5rem 1rem;
        border: 1px solid #d9d9d9;
        border-radius: 6px;
        font-size: 0.9rem;
        background: #fff;
        cursor: pointer;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }

    .apply-filters-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--accent-color);
      color: #fff;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      margin-top: 1.5rem;
      transition: background 0.3s ease;

      &:hover {
        background: var(--primary-color);
      }
    }
  }
}

// KPI指标卡片
.kpi-section {
  padding: 2rem;

  .kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;

    .kpi-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e8e8e8;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .kpi-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #fff;
        }

        .kpi-trend-indicator {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.9rem;
          font-weight: 600;

          .trend-arrow {
            font-size: 1rem;
          }
        }

        &.up .kpi-trend-indicator {
          color: #52c41a;
        }

        &.down .kpi-trend-indicator {
          color: #ff4d4f;
        }

        &.stable .kpi-trend-indicator {
          color: #faad14;
        }
      }

      .kpi-content {
        margin-bottom: 1rem;

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          color: #262626;
          margin-bottom: 0.25rem;
        }

        .kpi-label {
          font-size: 0.9rem;
          color: #8c8c8c;
        }
      }

      .kpi-sparkline {
        .sparkline-bars {
          display: flex;
          align-items: end;
          gap: 2px;
          height: 40px;

          .sparkline-bar {
            flex: 1;
            border-radius: 1px;
            opacity: 0.8;
            transition: opacity 0.3s ease;

            &:hover {
              opacity: 1;
            }
          }
        }
      }
    }
  }
}

// 主要图表区域
.main-chart-section {
  padding: 0 2rem 2rem;

  .chart-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8e8e8;
    max-width: 1400px;
    margin: 0 auto;

    .chart-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .chart-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #262626;
      }

      .chart-controls {
        .chart-tabs {
          display: flex;
          gap: 0.5rem;

          .chart-tab {
            padding: 0.5rem 1rem;
            background: none;
            border: 1px solid #d9d9d9;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;

            &:hover {
              border-color: var(--primary-color);
              color: var(--primary-color);
            }

            &.active {
              background: var(--primary-color);
              border-color: var(--primary-color);
              color: #fff;
            }
          }
        }
      }
    }

    .chart-content {
      padding: 1.5rem;

      .main-chart {
        .line-chart {
          width: 100%;
          height: 300px;
        }
      }
    }
  }
}

// 次要图表区域
.secondary-charts-section {
  padding: 0 2rem 2rem;

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;

    .chart-card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #e8e8e8;

      .chart-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e8e8e8;

        .chart-title {
          font-size: 1rem;
          font-weight: 600;
          color: #262626;
        }
      }

      .chart-content {
        padding: 1.5rem;

        // 饼图样式
        .pie-chart-container {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;

          .pie-chart {
            width: 200px;
            height: 200px;
          }

          .pie-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;

            .pie-value {
              font-size: 1.5rem;
              font-weight: 700;
              color: #262626;
            }

            .pie-label {
              font-size: 0.8rem;
              color: #8c8c8c;
            }
          }
        }

        .pie-legend {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .legend-color {
              width: 12px;
              height: 12px;
              border-radius: 2px;
            }

            .legend-text {
              font-size: 0.9rem;
              color: #595959;
            }
          }
        }

        // 柱状图样式
        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .bar-item {
            display: flex;
            align-items: center;
            gap: 1rem;

            .bar-label {
              width: 60px;
              font-size: 0.9rem;
              color: #595959;
            }

            .bar-container {
              flex: 1;
              height: 20px;
              background: #f5f5f5;
              border-radius: 10px;
              overflow: hidden;

              .bar-fill {
                height: 100%;
                border-radius: 10px;
                transition: width 0.3s ease;
              }
            }

            .bar-value {
              width: 40px;
              text-align: right;
              font-size: 0.9rem;
              font-weight: 600;
              color: #262626;
            }
          }
        }

        // 热力图样式
        .heatmap {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 2px;
          margin-bottom: 1rem;

          .heatmap-cell {
            aspect-ratio: 1;
            background: var(--primary-color);
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              transform: scale(1.1);
            }
          }
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;

          .legend-label {
            color: #8c8c8c;
          }

          .legend-gradient {
            width: 60px;
            height: 12px;
            background: linear-gradient(to right, rgba(114, 46, 209, 0.1), var(--primary-color));
            border-radius: 6px;
          }

          .legend-labels {
            display: flex;
            justify-content: space-between;
            width: 60px;
            color: #8c8c8c;
          }
        }
      }
    }
  }
}

// 智能洞察
.insights-section {
  padding: 0 2rem 2rem;

  .insights-container {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8e8e8;
    max-width: 1400px;
    margin: 0 auto;

    .insights-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e8e8e8;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .insights-title {
        font-size: 1.2rem;
        font-weight: 600;
        color: #262626;
      }

      .insights-time {
        font-size: 0.8rem;
        color: #8c8c8c;
      }
    }

    .insights-content {
      padding: 1.5rem;

      .insight-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        transition: all 0.3s ease;

        &:hover {
          background: #fafafa;
        }

        &.positive {
          border-left: 4px solid #52c41a;
        }

        &.warning {
          border-left: 4px solid #faad14;
        }

        &.info {
          border-left: 4px solid var(--primary-color);
        }

        .insight-icon {
          font-size: 1.5rem;
        }

        .insight-content {
          flex: 1;

          .insight-title {
            font-size: 1rem;
            font-weight: 600;
            color: #262626;
            margin-bottom: 0.25rem;
          }

          .insight-description {
            font-size: 0.9rem;
            color: #595959;
            line-height: 1.5;
          }
        }

        .insight-action {
          .insight-btn {
            padding: 0.5rem 1rem;
            background: none;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;

            &:hover {
              background: var(--primary-color);
              color: #fff;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .analytics-header .header-content,
  .analytics-filters .filters-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .secondary-charts-section .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .analytics-header,
  .analytics-filters,
  .kpi-section,
  .main-chart-section,
  .secondary-charts-section,
  .insights-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .kpi-section .kpi-grid {
    grid-template-columns: 1fr;
  }

  .analytics-filters .filters-content {
    .filter-group {
      width: 100%;
    }
  }
}
</style>
