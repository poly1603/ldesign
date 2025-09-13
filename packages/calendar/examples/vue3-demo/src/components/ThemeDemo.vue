<template>
  <div class="theme-demo">
    <div class="theme-controls mb-3">
      <h4>主题选择</h4>
      <div class="theme-options">
        <div 
          v-for="theme in themes" 
          :key="theme.name"
          :class="['theme-option', { 'theme-option-active': currentTheme === theme.name }]"
          @click="switchTheme(theme.name)"
        >
          <div class="theme-preview">
            <div 
              class="theme-color" 
              v-for="color in theme.colors" 
              :key="color"
              :style="{ backgroundColor: color }"
            ></div>
          </div>
          <div class="theme-name">{{ theme.label }}</div>
        </div>
      </div>
    </div>
    
    <div class="calendar-preview" :data-theme="currentTheme">
      <div ref="calendarRef" class="calendar-container"></div>
    </div>
    
    <div class="theme-info mt-3">
      <h4>当前主题：{{ getCurrentThemeLabel() }}</h4>
      <p>{{ getCurrentThemeDescription() }}</p>
      
      <div class="theme-variables">
        <h5>主要颜色变量：</h5>
        <div class="variable-list">
          <div v-for="variable in getCurrentThemeVariables()" :key="variable.name" class="variable-item">
            <div class="variable-color" :style="{ backgroundColor: variable.value }"></div>
            <div class="variable-info">
              <div class="variable-name">{{ variable.name }}</div>
              <div class="variable-value">{{ variable.value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, type CalendarEvent } from '@ldesign/calendar'
import '@ldesign/calendar/styles/index.less'

// 响应式数据
const calendarRef = ref<HTMLElement>()
const currentTheme = ref('default')

let calendar: Calendar | null = null

// 主题配置
const themes = [
  {
    name: 'default',
    label: '默认主题',
    description: '基于紫色的默认主题，适合大多数场景',
    colors: ['#722ED1', '#9254DE', '#B37FEB', '#D3ADF7'],
    variables: [
      { name: '--ldesign-brand-color', value: '#722ED1' },
      { name: '--ldesign-brand-color-hover', value: '#9254DE' },
      { name: '--ldesign-brand-color-active', value: '#531DAB' },
      { name: '--ldesign-brand-color-focus', value: '#F1ECF9' }
    ]
  },
  {
    name: 'blue',
    label: '蓝色主题',
    description: '清新的蓝色主题，适合商务场景',
    colors: ['#1890FF', '#40A9FF', '#69C0FF', '#91D5FF'],
    variables: [
      { name: '--ldesign-brand-color', value: '#1890FF' },
      { name: '--ldesign-brand-color-hover', value: '#40A9FF' },
      { name: '--ldesign-brand-color-active', value: '#096DD9' },
      { name: '--ldesign-brand-color-focus', value: '#E6F7FF' }
    ]
  },
  {
    name: 'green',
    label: '绿色主题',
    description: '自然的绿色主题，适合健康和环保相关应用',
    colors: ['#52C41A', '#73D13D', '#95DE64', '#B7EB8F'],
    variables: [
      { name: '--ldesign-brand-color', value: '#52C41A' },
      { name: '--ldesign-brand-color-hover', value: '#73D13D' },
      { name: '--ldesign-brand-color-active', value: '#389E0D' },
      { name: '--ldesign-brand-color-focus', value: '#F6FFED' }
    ]
  },
  {
    name: 'orange',
    label: '橙色主题',
    description: '温暖的橙色主题，适合创意和活力场景',
    colors: ['#FA8C16', '#FFA940', '#FFC069', '#FFD591'],
    variables: [
      { name: '--ldesign-brand-color', value: '#FA8C16' },
      { name: '--ldesign-brand-color-hover', value: '#FFA940' },
      { name: '--ldesign-brand-color-active', value: '#D46B08' },
      { name: '--ldesign-brand-color-focus', value: '#FFF7E6' }
    ]
  },
  {
    name: 'dark',
    label: '深色主题',
    description: '深色主题，适合夜间使用或专业场景',
    colors: ['#434343', '#595959', '#8C8C8C', '#BFBFBF'],
    variables: [
      { name: '--ldesign-brand-color', value: '#434343' },
      { name: '--ldesign-brand-color-hover', value: '#595959' },
      { name: '--ldesign-brand-color-active', value: '#262626' },
      { name: '--ldesign-brand-color-focus', value: '#F5F5F5' }
    ]
  }
]

// 初始化日历
onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: 'month',
      locale: 'zh-CN',
      showLunar: true,
      showHolidays: true
    })
    
    // 添加示例事件
    addSampleEvents()
    
    calendar.render()
  }
})

// 清理资源
onUnmounted(() => {
  calendar?.destroy()
})

// 切换主题
const switchTheme = (themeName: string) => {
  currentTheme.value = themeName
  
  // 应用主题变量
  const theme = themes.find(t => t.name === themeName)
  if (theme) {
    const root = document.documentElement
    theme.variables.forEach(variable => {
      root.style.setProperty(variable.name, variable.value)
    })
    
    // 刷新日历以应用新主题
    calendar?.refresh()
  }
}

// 获取当前主题信息
const getCurrentThemeLabel = () => {
  const theme = themes.find(t => t.name === currentTheme.value)
  return theme?.label || '未知主题'
}

const getCurrentThemeDescription = () => {
  const theme = themes.find(t => t.name === currentTheme.value)
  return theme?.description || ''
}

const getCurrentThemeVariables = () => {
  const theme = themes.find(t => t.name === currentTheme.value)
  return theme?.variables || []
}

// 添加示例事件
const addSampleEvents = () => {
  const today = new Date()
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '主题演示事件',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      color: '#722ED1'
    },
    {
      id: '2',
      title: '颜色测试',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
      color: '#52C41A'
    },
    {
      id: '3',
      title: '样式预览',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      allDay: true,
      color: '#FA8C16'
    }
  ]
  
  sampleEvents.forEach(event => {
    calendar?.addEvent(event)
  })
}
</script>

<style scoped>
.theme-demo {
  width: 100%;
}

.theme-controls h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.theme-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.theme-option:hover {
  border-color: #d9d9d9;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-option-active {
  border-color: #722ED1;
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
}

.theme-preview {
  display: flex;
  gap: 2px;
  margin-bottom: 8px;
}

.theme-color {
  width: 16px;
  height: 16px;
  border-radius: 2px;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  text-align: center;
}

.calendar-preview {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-container {
  width: 100%;
  height: 400px;
  border: none;
}

.theme-info {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.theme-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.theme-info p {
  margin: 0 0 20px 0;
  color: #595959;
  line-height: 1.5;
}

.theme-info h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

.variable-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.variable-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
}

.variable-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.variable-info {
  flex: 1;
  min-width: 0;
}

.variable-name {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.variable-value {
  font-size: 11px;
  color: #8c8c8c;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

/* 主题特定样式 */
.calendar-preview[data-theme="dark"] {
  background: #141414;
}

.calendar-preview[data-theme="dark"] .calendar-container {
  background: #141414;
  color: white;
}

@media (max-width: 768px) {
  .theme-options {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
  
  .variable-list {
    grid-template-columns: 1fr;
  }
  
  .calendar-container {
    height: 350px;
  }
}
</style>
