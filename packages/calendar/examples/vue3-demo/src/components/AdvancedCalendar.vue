<template>
  <div class="advanced-calendar">
    <div class="calendar-controls mb-3">
      <div class="view-switcher">
        <button 
          v-for="view in views" 
          :key="view.value"
          :class="['btn', { 'btn-primary': currentView === view.value }]"
          @click="switchView(view.value)"
        >
          {{ view.label }}
        </button>
      </div>
      
      <div class="feature-toggles">
        <label class="toggle-item">
          <input 
            type="checkbox" 
            v-model="showLunar" 
            @change="updateConfig"
          />
          显示农历
        </label>
        <label class="toggle-item">
          <input 
            type="checkbox" 
            v-model="showHolidays" 
            @change="updateConfig"
          />
          显示节假日
        </label>
      </div>
    </div>
    
    <div ref="calendarRef" class="calendar-container"></div>
    
    <div class="calendar-stats mt-3">
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ eventCount }}</div>
          <div class="stat-label">总事件数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ todayEventCount }}</div>
          <div class="stat-label">今日事件</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ currentView }}</div>
          <div class="stat-label">当前视图</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Calendar, type CalendarEvent } from '@ldesign/calendar'
import '@ldesign/calendar/styles/index.less'

// 响应式数据
const calendarRef = ref<HTMLElement>()
const currentView = ref<'month' | 'week' | 'day'>('month')
const showLunar = ref(true)
const showHolidays = ref(true)
const events = ref<CalendarEvent[]>([])

let calendar: Calendar | null = null

// 视图选项
const views = [
  { value: 'month', label: '月' },
  { value: 'week', label: '周' },
  { value: 'day', label: '日' }
]

// 计算属性
const eventCount = computed(() => events.value.length)

const todayEventCount = computed(() => {
  const today = new Date()
  const todayStr = today.toDateString()
  return events.value.filter(event => {
    const eventDate = new Date(event.start)
    return eventDate.toDateString() === todayStr
  }).length
})

// 初始化日历
onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: currentView.value,
      locale: 'zh-CN',
      showLunar: showLunar.value,
      showHolidays: showHolidays.value,
      editable: true,
      dragAndDrop: true,
      onEventClick: handleEventClick,
      onDateClick: handleDateClick
    })
    
    // 添加示例事件
    addSampleEvents()
    
    // 监听视图变化
    calendar.on('viewChange', (view) => {
      currentView.value = view
    })
    
    // 监听事件变化
    calendar.on('eventAdd', (event) => {
      events.value.push(event)
    })
    
    calendar.on('eventUpdate', (event) => {
      const index = events.value.findIndex(e => e.id === event.id)
      if (index >= 0) {
        events.value[index] = event
      }
    })
    
    calendar.on('eventRemove', (eventId) => {
      events.value = events.value.filter(e => e.id !== eventId)
    })
    
    calendar.render()
  }
})

// 清理资源
onUnmounted(() => {
  calendar?.destroy()
})

// 视图切换
const switchView = (view: 'month' | 'week' | 'day') => {
  currentView.value = view
  calendar?.setView(view)
}

// 更新配置
const updateConfig = () => {
  calendar?.updateConfig({
    showLunar: showLunar.value,
    showHolidays: showHolidays.value
  })
}

// 事件处理
const handleEventClick = (event: CalendarEvent) => {
  const action = confirm(`事件：${event.title}\n\n点击"确定"编辑，点击"取消"删除`)
  if (action) {
    // 编辑事件
    const newTitle = prompt('请输入新的事件标题：', event.title)
    if (newTitle && newTitle !== event.title) {
      const updatedEvent = { ...event, title: newTitle }
      calendar?.updateEvent(updatedEvent)
    }
  } else {
    // 删除事件
    calendar?.removeEvent(event.id)
  }
}

const handleDateClick = (date: Date) => {
  const title = prompt(`在 ${date.toLocaleDateString('zh-CN')} 添加新事件：`)
  if (title) {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
      end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
      color: '#722ED1'
    }
    calendar?.addEvent(newEvent)
  }
}

// 添加示例事件
const addSampleEvents = () => {
  const today = new Date()
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '晨会',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30),
      color: '#1890FF'
    },
    {
      id: '2',
      title: '项目开发',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      color: '#52C41A'
    },
    {
      id: '3',
      title: '午餐时间',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 0),
      color: '#FA8C16'
    }
  ]
  
  sampleEvents.forEach(event => {
    calendar?.addEvent(event)
    events.value.push(event)
  })
}
</script>

<style scoped>
.advanced-calendar {
  width: 100%;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.view-switcher {
  display: flex;
  gap: 4px;
}

.feature-toggles {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.toggle-item input[type="checkbox"] {
  margin: 0;
}

.calendar-container {
  width: 100%;
  height: 400px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-stats {
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #722ED1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .calendar-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-switcher {
    justify-content: center;
  }
  
  .feature-toggles {
    justify-content: center;
  }
  
  .calendar-container {
    height: 350px;
  }
}
</style>
