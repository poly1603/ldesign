# 数据可视化仪表板

本示例展示如何使用 @ldesign/store 构建一个数据可视化仪表板，包括实时数据更新、图表管理、用户自定义布局等功能。

## 🎯 功能特性

- 实时数据更新
- 多种图表类型支持
- 可拖拽的仪表板布局
- 数据过滤和筛选
- 自定义时间范围
- 数据导出功能
- 响应式设计

## 📁 项目结构

```
src/
├── stores/
│   ├── DashboardStore.ts     # 仪表板主 Store
│   ├── DataStore.ts          # 数据管理
│   ├── ChartStore.ts         # 图表配置
│   └── LayoutStore.ts        # 布局管理
├── components/
│   ├── Dashboard.vue         # 仪表板容器
│   ├── ChartWidget.vue       # 图表组件
│   ├── DataFilter.vue        # 数据过滤器
│   └── LayoutEditor.vue      # 布局编辑器
└── utils/
    ├── chartConfig.ts        # 图表配置工具
    └── dataProcessor.ts     # 数据处理工具
```

## 🏪 Store 实现

### 仪表板主 Store

```typescript
import { BaseStore, State, Action, Getter } from '@ldesign/store'
import { DataStore } from './DataStore'
import { ChartStore } from './ChartStore'
import { LayoutStore } from './LayoutStore'

export class DashboardStore extends BaseStore {
  @State
  @Persist({ key: 'dashboard-config' })
  config = {
    title: '数据仪表板',
    refreshInterval: 30000, // 30秒刷新
    theme: 'light',
    autoRefresh: true
  }

  @State
  loading = false

  @State
  error = null

  @State
  lastUpdated = null

  // 注入子 Store
  dataStore = new DataStore()
  chartStore = new ChartStore()
  layoutStore = new LayoutStore()

  @Getter
  get widgets() {
    return this.layoutStore.widgets.map(widget => ({
      ...widget,
      data: this.dataStore.getDataById(widget.dataSourceId),
      chartConfig: this.chartStore.getChartConfig(widget.chartType)
    }))
  }

  @Getter
  get isRealTimeMode() {
    return this.config.autoRefresh && this.config.refreshInterval > 0
  }

  @Action
  async initialize() {
    try {
      this.loading = true
      
      // 加载布局配置
      await this.layoutStore.loadLayout()
      
      // 加载图表配置
      await this.chartStore.loadChartConfigs()
      
      // 初始化数据
      await this.refreshAllData()
      
      // 启动自动刷新
      if (this.isRealTimeMode) {
        this.startAutoRefresh()
      }
      
    } catch (error) {
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  }

  @Action
  async refreshAllData() {
    try {
      this.loading = true
      
      const dataSources = this.layoutStore.getUniqueDataSources()
      await Promise.all(
        dataSources.map(sourceId => 
          this.dataStore.fetchData(sourceId)
        )
      )
      
      this.lastUpdated = Date.now()
      
    } catch (error) {
      this.error = error.message
      throw error
    } finally {
      this.loading = false
    }
  }

  @Action
  updateConfig(updates) {
    this.config = { ...this.config, ...updates }
    
    // 重新启动自动刷新
    if (this.isRealTimeMode) {
      this.startAutoRefresh()
    } else {
      this.stopAutoRefresh()
    }
  }

  @Action
  async addWidget(widgetConfig) {
    const widget = await this.layoutStore.addWidget(widgetConfig)
    
    // 加载新组件的数据
    if (widget.dataSourceId) {
      await this.dataStore.fetchData(widget.dataSourceId)
    }
    
    return widget
  }

  @Action
  async removeWidget(widgetId) {
    await this.layoutStore.removeWidget(widgetId)
  }

  @Action
  async exportData(format = 'json') {
    const data = {
      config: this.config,
      layout: this.layoutStore.layout,
      data: this.dataStore.getAllData(),
      timestamp: Date.now()
    }

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data)
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }
  }

  private autoRefreshTimer = null

  @Action
  private startAutoRefresh() {
    this.stopAutoRefresh()
    
    this.autoRefreshTimer = setInterval(() => {
      this.refreshAllData()
    }, this.config.refreshInterval)
  }

  @Action
  private stopAutoRefresh() {
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer)
      this.autoRefreshTimer = null
    }
  }

  @Action
  private convertToCSV(data) {
    // CSV 转换逻辑
    const rows = []
    
    Object.entries(data.data).forEach(([sourceId, sourceData]) => {
      if (Array.isArray(sourceData)) {
        sourceData.forEach(item => {
          rows.push([sourceId, ...Object.values(item)])
        })
      }
    })
    
    return rows.map(row => row.join(',')).join('\n')
  }
}
```

### 数据管理 Store

```typescript
export class DataStore extends BaseStore {
  @State
  dataSources = {}

  @State
  @Cache({ ttl: 60000 }) // 缓存1分钟
  cachedData = {}

  @State
  filters = {}

  @State
  timeRange = {
    start: Date.now() - 24 * 60 * 60 * 1000, // 24小时前
    end: Date.now()
  }

  @Getter
  getDataById() {
    return (sourceId) => {
      const rawData = this.dataSources[sourceId]
      if (!rawData) return null

      // 应用过滤器
      let filteredData = this.applyFilters(rawData, sourceId)
      
      // 应用时间范围
      filteredData = this.applyTimeRange(filteredData)
      
      return filteredData
    }
  }

  @Getter
  getAllData() {
    const result = {}
    Object.keys(this.dataSources).forEach(sourceId => {
      result[sourceId] = this.getDataById(sourceId)
    })
    return result
  }

  @Action
  async fetchData(sourceId) {
    try {
      const config = await this.getDataSourceConfig(sourceId)
      let data

      switch (config.type) {
        case 'api':
          data = await this.fetchFromAPI(config)
          break
        case 'websocket':
          data = await this.fetchFromWebSocket(config)
          break
        case 'database':
          data = await this.fetchFromDatabase(config)
          break
        default:
          throw new Error(`不支持的数据源类型: ${config.type}`)
      }

      this.dataSources[sourceId] = data
      this.cachedData[sourceId] = {
        data,
        timestamp: Date.now()
      }

    } catch (error) {
      console.error(`获取数据失败 (${sourceId}):`, error)
      throw error
    }
  }

  @Action
  updateFilters(sourceId, filters) {
    this.filters[sourceId] = { ...this.filters[sourceId], ...filters }
  }

  @Action
  updateTimeRange(start, end) {
    this.timeRange = { start, end }
  }

  @Action
  @Debounce(500)
  async searchData(sourceId, query) {
    const data = this.dataSources[sourceId]
    if (!data || !Array.isArray(data)) return []

    return data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    )
  }

  @Action
  private async fetchFromAPI(config) {
    const params = new URLSearchParams({
      ...config.params,
      start: this.timeRange.start,
      end: this.timeRange.end
    })

    const response = await fetch(`${config.url}?${params}`, {
      headers: config.headers || {}
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.statusText}`)
    }

    return await response.json()
  }

  @Action
  private async fetchFromWebSocket(config) {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(config.url)
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          resolve(data)
        } catch (error) {
          reject(error)
        }
      }
      
      ws.onerror = reject
      
      // 发送请求
      ws.onopen = () => {
        ws.send(JSON.stringify(config.request))
      }
    })
  }

  @Action
  private async getDataSourceConfig(sourceId) {
    // 从配置中获取数据源配置
    const configs = {
      'sales-data': {
        type: 'api',
        url: '/api/sales',
        params: { format: 'json' }
      },
      'user-analytics': {
        type: 'api',
        url: '/api/analytics/users',
        headers: { 'Authorization': 'Bearer token' }
      },
      'real-time-metrics': {
        type: 'websocket',
        url: 'ws://localhost:8080/metrics',
        request: { type: 'subscribe', channel: 'metrics' }
      }
    }

    return configs[sourceId] || { type: 'api', url: `/api/data/${sourceId}` }
  }

  @Action
  private applyFilters(data, sourceId) {
    const filters = this.filters[sourceId]
    if (!filters || !Array.isArray(data)) return data

    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === null || value === undefined || value === '') return true
        
        if (Array.isArray(value)) {
          return value.includes(item[key])
        }
        
        if (typeof value === 'object' && value.min !== undefined) {
          return item[key] >= value.min && item[key] <= value.max
        }
        
        return item[key] === value
      })
    })
  }

  @Action
  private applyTimeRange(data) {
    if (!Array.isArray(data)) return data

    return data.filter(item => {
      const timestamp = item.timestamp || item.createdAt || item.date
      if (!timestamp) return true

      const time = new Date(timestamp).getTime()
      return time >= this.timeRange.start && time <= this.timeRange.end
    })
  }
}
```

### 图表配置 Store

```typescript
export class ChartStore extends BaseStore {
  @State
  @Persist({ key: 'chart-configs' })
  chartConfigs = {}

  @State
  defaultConfigs = {
    line: {
      type: 'line',
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
    bar: {
      type: 'bar',
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true }
        }
      }
    },
    pie: {
      type: 'pie',
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    },
    gauge: {
      type: 'doughnut',
      options: {
        responsive: true,
        circumference: 180,
        rotation: 270,
        cutout: '80%'
      }
    }
  }

  @Getter
  getChartConfig() {
    return (chartType) => {
      return this.chartConfigs[chartType] || this.defaultConfigs[chartType]
    }
  }

  @Action
  async loadChartConfigs() {
    try {
      const configs = await api.getChartConfigs()
      this.chartConfigs = { ...this.defaultConfigs, ...configs }
    } catch (error) {
      console.warn('加载图表配置失败，使用默认配置:', error)
      this.chartConfigs = this.defaultConfigs
    }
  }

  @Action
  updateChartConfig(chartType, config) {
    this.chartConfigs[chartType] = {
      ...this.chartConfigs[chartType],
      ...config
    }
  }

  @Action
  async saveChartConfig(chartType, config) {
    this.updateChartConfig(chartType, config)
    
    try {
      await api.saveChartConfig(chartType, config)
    } catch (error) {
      console.error('保存图表配置失败:', error)
      throw error
    }
  }
}
```

## 🎨 Vue 组件

### 仪表板容器

```vue
<template>
  <div class="dashboard" :class="themeClass">
    <div class="dashboard-header">
      <h1>{{ config.title }}</h1>
      
      <div class="dashboard-controls">
        <DataFilter 
          @filter-change="handleFilterChange"
          @time-range-change="handleTimeRangeChange"
        />
        
        <button @click="refreshData" :disabled="loading">
          <Icon name="refresh" :spin="loading" />
          刷新
        </button>
        
        <button @click="toggleEditMode">
          <Icon name="edit" />
          {{ editMode ? '完成' : '编辑' }}
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <GridLayout
        v-model:layout="layout"
        :col-num="12"
        :row-height="60"
        :is-draggable="editMode"
        :is-resizable="editMode"
        :margin="[10, 10]"
        @layout-updated="handleLayoutUpdate"
      >
        <GridItem
          v-for="widget in widgets"
          :key="widget.id"
          :x="widget.x"
          :y="widget.y"
          :w="widget.w"
          :h="widget.h"
          :i="widget.id"
        >
          <ChartWidget
            :widget="widget"
            :edit-mode="editMode"
            @remove="removeWidget"
            @configure="configureWidget"
          />
        </GridItem>
      </GridLayout>
    </div>

    <div v-if="editMode" class="widget-palette">
      <h3>添加组件</h3>
      <div class="widget-types">
        <button
          v-for="type in widgetTypes"
          :key="type.id"
          @click="addWidget(type)"
          class="widget-type-btn"
        >
          <Icon :name="type.icon" />
          {{ type.name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { GridLayout, GridItem } from 'vue-grid-layout'
import { useDashboardStore } from '@/stores/DashboardStore'

const dashboardStore = useDashboardStore()
const editMode = ref(false)

const config = computed(() => dashboardStore.config)
const widgets = computed(() => dashboardStore.widgets)
const loading = computed(() => dashboardStore.loading)
const layout = computed(() => dashboardStore.layoutStore.layout)

const themeClass = computed(() => `theme-${config.value.theme}`)

const widgetTypes = [
  { id: 'line-chart', name: '折线图', icon: 'line-chart' },
  { id: 'bar-chart', name: '柱状图', icon: 'bar-chart' },
  { id: 'pie-chart', name: '饼图', icon: 'pie-chart' },
  { id: 'gauge', name: '仪表盘', icon: 'gauge' },
  { id: 'table', name: '数据表', icon: 'table' },
  { id: 'metric', name: '指标卡', icon: 'metric' }
]

onMounted(() => {
  dashboardStore.initialize()
})

onUnmounted(() => {
  // 清理定时器等资源
})

const refreshData = () => {
  dashboardStore.refreshAllData()
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
}

const handleFilterChange = (filters) => {
  Object.entries(filters).forEach(([sourceId, filter]) => {
    dashboardStore.dataStore.updateFilters(sourceId, filter)
  })
}

const handleTimeRangeChange = (timeRange) => {
  dashboardStore.dataStore.updateTimeRange(timeRange.start, timeRange.end)
}

const handleLayoutUpdate = (newLayout) => {
  dashboardStore.layoutStore.updateLayout(newLayout)
}

const addWidget = async (widgetType) => {
  const widget = {
    type: widgetType.id,
    title: widgetType.name,
    dataSourceId: 'default',
    chartType: widgetType.id.replace('-chart', ''),
    x: 0,
    y: 0,
    w: 4,
    h: 4
  }
  
  await dashboardStore.addWidget(widget)
}

const removeWidget = (widgetId) => {
  dashboardStore.removeWidget(widgetId)
}

const configureWidget = (widget) => {
  // 打开配置对话框
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--bg-color);
  border-bottom: 1px solid var(--border-color);
}

.dashboard-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.dashboard-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.widget-palette {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.widget-types {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.widget-type-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.widget-type-btn:hover {
  background: var(--bg-hover);
}

/* 主题样式 */
.theme-light {
  --bg-color: #ffffff;
  --border-color: #e0e0e0;
  --bg-hover: #f5f5f5;
}

.theme-dark {
  --bg-color: #1a1a1a;
  --border-color: #333333;
  --bg-hover: #2a2a2a;
  color: white;
}
</style>
```

## 🚀 使用方式

### 1. 初始化仪表板

```typescript
// main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useDashboardStore } from '@/stores/DashboardStore'

const app = createApp(App)
app.use(createPinia())

// 初始化仪表板
const dashboardStore = useDashboardStore()
dashboardStore.initialize()
```

### 2. 自定义数据源

```typescript
// 添加自定义数据源
dashboardStore.dataStore.addDataSource('custom-api', {
  type: 'api',
  url: '/api/custom-data',
  refreshInterval: 10000
})
```

### 3. 配置图表

```typescript
// 自定义图表配置
dashboardStore.chartStore.updateChartConfig('line', {
  options: {
    plugins: {
      title: {
        display: true,
        text: '自定义标题'
      }
    }
  }
})
```

## 📱 响应式设计

```css
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .dashboard-controls {
    width: 100%;
    justify-content: center;
  }
  
  .widget-palette {
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;
    top: auto;
    transform: none;
    border-radius: 8px 8px 0 0;
  }
}
```

## 🎯 特性说明

### 实时数据
- 自动刷新机制
- WebSocket 支持
- 数据缓存优化

### 可视化
- 多种图表类型
- 自定义配置
- 响应式布局

### 交互性
- 拖拽布局
- 数据过滤
- 时间范围选择

### 扩展性
- 插件化架构
- 自定义组件
- 主题系统

这个仪表板示例展示了如何使用 @ldesign/store 构建复杂的数据可视化应用，包含了实时数据处理、图表管理、布局系统等企业级功能。
