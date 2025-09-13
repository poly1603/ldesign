# Vue 3 集成指南

本指南将详细介绍如何在 Vue 3 项目中集成和使用 @ldesign/calendar。

## 📦 安装

```bash
npm install @ldesign/calendar
# 或
yarn add @ldesign/calendar
# 或
pnpm add @ldesign/calendar
```

## 🚀 基础集成

### 1. 创建日历组件

```vue
<template>
  <div ref="calendarRef" class="calendar-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Calendar, type CalendarConfig, type CalendarEvent } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

const calendarRef = ref<HTMLElement>()
let calendar: Calendar | null = null

onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: 'month',
      locale: 'zh-CN',
      showLunar: true,
      showHolidays: true
    })
    calendar.render()
  }
})

onUnmounted(() => {
  calendar?.destroy()
})
</script>

<style scoped>
.calendar-container {
  width: 100%;
  height: 600px;
}
</style>
```

### 2. 使用 Composition API

```vue
<template>
  <div>
    <div class="calendar-controls">
      <button @click="prevMonth">上个月</button>
      <button @click="today">今天</button>
      <button @click="nextMonth">下个月</button>
      <select v-model="currentView" @change="changeView">
        <option value="month">月视图</option>
        <option value="week">周视图</option>
        <option value="day">日视图</option>
      </select>
    </div>
    <div ref="calendarRef" class="calendar-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { Calendar, type CalendarEvent } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

// 响应式数据
const calendarRef = ref<HTMLElement>()
const currentView = ref<'month' | 'week' | 'day'>('month')
const events = ref<CalendarEvent[]>([])

let calendar: Calendar | null = null

// 初始化日历
onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: currentView.value,
      locale: 'zh-CN',
      onEventClick: handleEventClick,
      onDateClick: handleDateClick
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

// 导航方法
const prevMonth = () => {
  calendar?.prev()
}

const nextMonth = () => {
  calendar?.next()
}

const today = () => {
  calendar?.today()
}

const changeView = () => {
  calendar?.setView(currentView.value)
}

// 事件处理
const handleEventClick = (event: CalendarEvent) => {
  console.log('点击事件:', event)
  // 可以在这里显示事件详情弹窗
}

const handleDateClick = (date: Date) => {
  console.log('点击日期:', date)
  // 可以在这里添加新事件
}

// 添加示例事件
const addSampleEvents = () => {
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '团队会议',
      start: new Date('2023-12-25T10:00:00'),
      end: new Date('2023-12-25T11:00:00'),
      color: '#722ED1'
    },
    {
      id: '2',
      title: '项目评审',
      start: new Date('2023-12-26T14:00:00'),
      end: new Date('2023-12-26T16:00:00'),
      color: '#52C41A'
    }
  ]
  
  sampleEvents.forEach(event => {
    calendar?.addEvent(event)
  })
  
  events.value = sampleEvents
}

// 监听视图变化
watch(currentView, (newView) => {
  calendar?.setView(newView)
})
</script>

<style scoped>
.calendar-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  align-items: center;
}

.calendar-controls button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.calendar-controls button:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.calendar-controls select {
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.calendar-container {
  width: 100%;
  height: 600px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
}
</style>
```

## 🎯 高级用法

### 1. 可复用的日历组件

```vue
<!-- CalendarComponent.vue -->
<template>
  <div class="calendar-wrapper">
    <div v-if="showControls" class="calendar-controls">
      <button @click="$emit('prev')">{{ prevText }}</button>
      <span class="current-date">{{ currentDateText }}</span>
      <button @click="$emit('next')">{{ nextText }}</button>
      
      <div class="view-switcher">
        <button 
          v-for="view in views" 
          :key="view.value"
          :class="{ active: currentView === view.value }"
          @click="$emit('viewChange', view.value)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>
    
    <div ref="calendarRef" class="calendar-container" :style="containerStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { Calendar, type CalendarConfig, type CalendarEvent } from '@ldesign/calendar'
import '@ldesign/calendar/dist/style.css'

// Props
interface Props {
  config?: Partial<CalendarConfig>
  events?: CalendarEvent[]
  height?: string | number
  showControls?: boolean
  prevText?: string
  nextText?: string
}

const props = withDefaults(defineProps<Props>(), {
  height: '600px',
  showControls: true,
  prevText: '上一页',
  nextText: '下一页'
})

// Emits
const emit = defineEmits<{
  prev: []
  next: []
  today: []
  viewChange: [view: 'month' | 'week' | 'day']
  eventClick: [event: CalendarEvent]
  dateClick: [date: Date]
  eventAdd: [event: CalendarEvent]
  eventUpdate: [event: CalendarEvent]
  eventRemove: [eventId: string]
}>()

// 响应式数据
const calendarRef = ref<HTMLElement>()
const currentView = ref<'month' | 'week' | 'day'>('month')
const currentDate = ref(new Date())

let calendar: Calendar | null = null

// 计算属性
const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

const currentDateText = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
})

const views = [
  { value: 'month', label: '月' },
  { value: 'week', label: '周' },
  { value: 'day', label: '日' }
]

// 初始化日历
onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: 'month',
      locale: 'zh-CN',
      ...props.config,
      onEventClick: (event) => emit('eventClick', event),
      onDateClick: (date) => emit('dateClick', date)
    })
    
    // 添加事件监听
    calendar.on('viewChange', (view) => {
      currentView.value = view
    })
    
    calendar.on('dateChange', (date) => {
      currentDate.value = date
    })
    
    calendar.on('eventAdd', (event) => emit('eventAdd', event))
    calendar.on('eventUpdate', (event) => emit('eventUpdate', event))
    calendar.on('eventRemove', (eventId) => emit('eventRemove', eventId))
    
    calendar.render()
  }
})

// 清理资源
onUnmounted(() => {
  calendar?.destroy()
})

// 监听事件变化
watch(() => props.events, (newEvents) => {
  if (calendar && newEvents) {
    calendar.clearEvents()
    newEvents.forEach(event => {
      calendar?.addEvent(event)
    })
  }
}, { deep: true })

// 暴露方法
defineExpose({
  calendar,
  addEvent: (event: CalendarEvent) => calendar?.addEvent(event),
  updateEvent: (event: CalendarEvent) => calendar?.updateEvent(event),
  removeEvent: (eventId: string) => calendar?.removeEvent(eventId),
  setView: (view: 'month' | 'week' | 'day') => calendar?.setView(view),
  goToDate: (date: Date) => calendar?.goToDate(date),
  today: () => calendar?.today(),
  prev: () => calendar?.prev(),
  next: () => calendar?.next()
})
</script>

<style scoped>
.calendar-wrapper {
  width: 100%;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.current-date {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.view-switcher {
  display: flex;
  gap: 4px;
}

.view-switcher button {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-switcher button:hover {
  border-color: #722ED1;
  color: #722ED1;
}

.view-switcher button.active {
  background: #722ED1;
  border-color: #722ED1;
  color: white;
}

.calendar-container {
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}
</style>
```

### 2. 使用可复用组件

```vue
<template>
  <div class="app">
    <h1>我的日历应用</h1>
    
    <CalendarComponent
      ref="calendarRef"
      :events="events"
      :config="calendarConfig"
      height="700px"
      @event-click="handleEventClick"
      @date-click="handleDateClick"
      @event-add="handleEventAdd"
      @prev="handlePrev"
      @next="handleNext"
      @view-change="handleViewChange"
    />
    
    <!-- 事件详情弹窗 -->
    <EventModal
      v-if="showEventModal"
      :event="selectedEvent"
      @close="showEventModal = false"
      @save="handleEventSave"
      @delete="handleEventDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CalendarComponent from './components/CalendarComponent.vue'
import EventModal from './components/EventModal.vue'
import type { CalendarEvent, CalendarConfig } from '@ldesign/calendar'

// 响应式数据
const calendarRef = ref()
const events = ref<CalendarEvent[]>([])
const showEventModal = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)

// 日历配置
const calendarConfig: Partial<CalendarConfig> = reactive({
  locale: 'zh-CN',
  showLunar: true,
  showHolidays: true,
  editable: true,
  dragAndDrop: true
})

// 事件处理
const handleEventClick = (event: CalendarEvent) => {
  selectedEvent.value = event
  showEventModal.value = true
}

const handleDateClick = (date: Date) => {
  // 创建新事件
  const newEvent: CalendarEvent = {
    id: Date.now().toString(),
    title: '新事件',
    start: date,
    end: new Date(date.getTime() + 60 * 60 * 1000), // 1小时后
    color: '#722ED1'
  }
  
  selectedEvent.value = newEvent
  showEventModal.value = true
}

const handleEventAdd = (event: CalendarEvent) => {
  events.value.push(event)
}

const handleEventSave = (event: CalendarEvent) => {
  const index = events.value.findIndex(e => e.id === event.id)
  if (index >= 0) {
    events.value[index] = event
    calendarRef.value?.updateEvent(event)
  } else {
    events.value.push(event)
    calendarRef.value?.addEvent(event)
  }
  showEventModal.value = false
}

const handleEventDelete = (eventId: string) => {
  events.value = events.value.filter(e => e.id !== eventId)
  calendarRef.value?.removeEvent(eventId)
  showEventModal.value = false
}

const handlePrev = () => {
  calendarRef.value?.prev()
}

const handleNext = () => {
  calendarRef.value?.next()
}

const handleViewChange = (view: 'month' | 'week' | 'day') => {
  calendarRef.value?.setView(view)
}
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #262626;
  margin-bottom: 30px;
}
</style>
```

## 🎨 样式自定义

### 1. 使用CSS变量

```vue
<style>
/* 自定义主题色 */
:root {
  --ldesign-brand-color: #1890ff;
  --ldesign-brand-color-hover: #40a9ff;
  --ldesign-brand-color-active: #096dd9;
}

/* 自定义日历样式 */
.calendar-container {
  --calendar-border-radius: 12px;
  --calendar-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
```

### 2. 深度选择器

```vue
<style scoped>
.calendar-container :deep(.ldesign-calendar-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.calendar-container :deep(.ldesign-calendar-event) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
```

## 🔧 常见问题

### Q: 如何在 Vue 3 中处理事件更新？
A: 使用 `watch` 监听 props 变化，然后调用日历的更新方法。

### Q: 如何实现事件的双向绑定？
A: 通过 emit 事件将变化传递给父组件，父组件更新数据后传递给子组件。

### Q: 如何处理组件销毁时的内存泄漏？
A: 在 `onUnmounted` 钩子中调用 `calendar.destroy()` 方法。

## 🎯 最佳实践

1. **组件封装**：将日历封装为可复用组件
2. **事件管理**：使用 Vue 的响应式系统管理事件数据
3. **样式隔离**：使用 scoped 样式避免样式冲突
4. **性能优化**：合理使用 watch 和 computed
5. **类型安全**：使用 TypeScript 确保类型安全

## 📚 相关资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Composition API 指南](https://vuejs.org/guide/extras/composition-api-faq.html)
- [TypeScript 支持](https://vuejs.org/guide/typescript/overview.html)
