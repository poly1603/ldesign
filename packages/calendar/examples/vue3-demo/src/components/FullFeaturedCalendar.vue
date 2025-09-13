<template>
  <div class="full-featured-calendar">
    <!-- 工具栏 -->
    <div class="calendar-toolbar">
      <div class="toolbar-left">
        <div class="btn-group">
          <button class="btn" @click="prevPeriod">
            <span>‹</span>
          </button>
          <button class="btn" @click="today">今天</button>
          <button class="btn" @click="nextPeriod">
            <span>›</span>
          </button>
        </div>
        
        <div class="current-period">
          {{ currentPeriodText }}
        </div>
      </div>
      
      <div class="toolbar-center">
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
      </div>
      
      <div class="toolbar-right">
        <div class="btn-group">
          <button class="btn" @click="showEventModal = true">
            <span>+</span> 添加事件
          </button>
          <button class="btn" @click="exportEvents">导出</button>
          <button class="btn" @click="toggleTheme">
            {{ isDarkTheme ? '浅色' : '深色' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要内容区域 -->
    <div class="calendar-content">
      <!-- 日历主体 -->
      <div class="calendar-main">
        <div ref="calendarRef" class="calendar-container"></div>
      </div>
      
      <!-- 事件列表侧边栏 -->
      <div class="calendar-sidebar">
        <div class="sidebar-header">
          <h3>事件列表</h3>
          <span class="event-count">{{ events.length }} 个事件</span>
        </div>
        
        <div class="event-list">
          <div 
            v-for="event in sortedEvents" 
            :key="event.id"
            :class="['event-item', { 'event-item-selected': selectedEventId === event.id }]"
            @click="selectEvent(event)"
          >
            <div class="event-color" :style="{ backgroundColor: event.color }"></div>
            <div class="event-content">
              <div class="event-title">{{ event.title }}</div>
              <div class="event-time">
                {{ formatEventTime(event) }}
              </div>
              <div v-if="event.description" class="event-description">
                {{ event.description }}
              </div>
            </div>
            <div class="event-actions">
              <button class="btn-icon" @click.stop="editEvent(event)">✏️</button>
              <button class="btn-icon" @click.stop="deleteEvent(event.id)">🗑️</button>
            </div>
          </div>
          
          <div v-if="events.length === 0" class="empty-state">
            <p>暂无事件</p>
            <button class="btn btn-primary" @click="showEventModal = true">
              添加第一个事件
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 事件编辑弹窗 -->
    <EventModal
      v-if="showEventModal"
      :event="editingEvent"
      @save="saveEvent"
      @close="closeEventModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Calendar, type CalendarEvent } from '@ldesign/calendar'
import '@ldesign/calendar/styles/index.less'
import EventModal from './EventModal.vue'

// 响应式数据
const calendarRef = ref<HTMLElement>()
const currentView = ref<'month' | 'week' | 'day'>('month')
const currentDate = ref(new Date())
const events = ref<CalendarEvent[]>([])
const selectedEventId = ref<string | null>(null)
const showEventModal = ref(false)
const editingEvent = ref<CalendarEvent | null>(null)
const isDarkTheme = ref(false)

let calendar: Calendar | null = null

// 视图选项
const views = [
  { value: 'month', label: '月' },
  { value: 'week', label: '周' },
  { value: 'day', label: '日' }
]

// 计算属性
const currentPeriodText = computed(() => {
  const date = currentDate.value
  switch (currentView.value) {
    case 'month':
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
    case 'week':
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return `${weekStart.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`
    case 'day':
      return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    default:
      return ''
  }
})

const sortedEvents = computed(() => {
  return [...events.value].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
})

// 初始化日历
onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: currentView.value,
      locale: 'zh-CN',
      showLunar: true,
      showHolidays: true,
      editable: true,
      dragAndDrop: true,
      onEventClick: handleEventClick,
      onDateClick: handleDateClick
    })
    
    // 添加示例事件
    addSampleEvents()
    
    // 监听事件
    calendar.on('viewChange', (view) => {
      currentView.value = view
    })
    
    calendar.on('dateChange', (date) => {
      currentDate.value = date
    })
    
    calendar.render()
  }
})

// 清理资源
onUnmounted(() => {
  calendar?.destroy()
})

// 导航方法
const prevPeriod = () => {
  calendar?.prev()
}

const nextPeriod = () => {
  calendar?.next()
}

const today = () => {
  calendar?.today()
}

const switchView = (view: 'month' | 'week' | 'day') => {
  currentView.value = view
  calendar?.setView(view)
}

// 事件处理
const handleEventClick = (event: CalendarEvent) => {
  selectedEventId.value = event.id
}

const handleDateClick = (date: Date) => {
  editingEvent.value = {
    id: '',
    title: '',
    start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 10, 0),
    end: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 11, 0),
    color: '#722ED1',
    allDay: false
  }
  showEventModal.value = true
}

const selectEvent = (event: CalendarEvent) => {
  selectedEventId.value = event.id
}

const editEvent = (event: CalendarEvent) => {
  editingEvent.value = { ...event }
  showEventModal.value = true
}

const deleteEvent = (eventId: string) => {
  if (confirm('确定要删除这个事件吗？')) {
    events.value = events.value.filter(e => e.id !== eventId)
    calendar?.removeEvent(eventId)
    if (selectedEventId.value === eventId) {
      selectedEventId.value = null
    }
  }
}

const saveEvent = (event: CalendarEvent) => {
  if (event.id) {
    // 更新现有事件
    const index = events.value.findIndex(e => e.id === event.id)
    if (index >= 0) {
      events.value[index] = event
      calendar?.updateEvent(event)
    }
  } else {
    // 添加新事件
    event.id = Date.now().toString()
    events.value.push(event)
    calendar?.addEvent(event)
  }
  closeEventModal()
}

const closeEventModal = () => {
  showEventModal.value = false
  editingEvent.value = null
}

const exportEvents = () => {
  const dataStr = JSON.stringify(events.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'calendar-events.json'
  link.click()
  URL.revokeObjectURL(url)
}

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  // 这里可以实现主题切换逻辑
  console.log('切换主题:', isDarkTheme.value ? '深色' : '浅色')
}

const formatEventTime = (event: CalendarEvent) => {
  const start = new Date(event.start)
  const end = new Date(event.end)
  
  if (event.allDay) {
    return '全天'
  }
  
  return `${start.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
}

// 添加示例事件
const addSampleEvents = () => {
  const today = new Date()
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '团队会议',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      color: '#722ED1',
      description: '讨论项目进展和下周计划'
    },
    {
      id: '2',
      title: '产品评审',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 16, 0),
      color: '#52C41A',
      description: '新功能产品评审会议'
    },
    {
      id: '3',
      title: '假期',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      allDay: true,
      color: '#FA8C16',
      description: '年假休息'
    }
  ]
  
  sampleEvents.forEach(event => {
    calendar?.addEvent(event)
    events.value.push(event)
  })
}
</script>

<style scoped>
.full-featured-calendar {
  width: 100%;
  height: 700px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.calendar-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-period {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
  min-width: 200px;
}

.view-switcher {
  display: flex;
  gap: 4px;
}

.calendar-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.calendar-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-container {
  flex: 1;
  border: none;
}

.calendar-sidebar {
  width: 300px;
  border-left: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #262626;
}

.event-count {
  font-size: 12px;
  color: #8c8c8c;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 12px;
}

.event-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.event-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.event-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.event-item-selected {
  border-color: #722ED1;
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
}

.event-color {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-title {
  font-weight: 600;
  color: #262626;
  margin-bottom: 4px;
  word-break: break-word;
}

.event-time {
  font-size: 12px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.event-description {
  font-size: 12px;
  color: #595959;
  line-height: 1.4;
  word-break: break-word;
}

.event-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.event-item:hover .event-actions {
  opacity: 1;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: background-color 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.empty-state p {
  margin-bottom: 16px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .calendar-content {
    flex-direction: column;
  }

  .calendar-sidebar {
    width: 100%;
    height: 200px;
    border-left: none;
    border-top: 1px solid #f0f0f0;
  }

  .full-featured-calendar {
    height: 600px;
  }
}

@media (max-width: 768px) {
  .calendar-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    justify-content: center;
  }

  .current-period {
    text-align: center;
    min-width: auto;
  }

  .calendar-sidebar {
    height: 150px;
  }

  .full-featured-calendar {
    height: 500px;
  }
}
</style>
