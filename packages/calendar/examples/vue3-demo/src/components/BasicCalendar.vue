<template>
  <div class="basic-calendar">
    <div class="calendar-controls mb-3">
      <div class="btn-group">
        <button class="btn" @click="prevMonth">上个月</button>
        <button class="btn" @click="today">今天</button>
        <button class="btn" @click="nextMonth">下个月</button>
      </div>
      
      <div class="current-date">
        {{ currentDateText }}
      </div>
    </div>
    
    <div ref="calendarRef" class="calendar-container"></div>
    
    <div class="calendar-info mt-3">
      <p class="text-center">
        <small>点击日期可以查看详情，当前视图：{{ currentView }}</small>
      </p>
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
const currentDate = ref(new Date())

let calendar: Calendar | null = null

// 计算属性
const currentDateText = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
})

// 初始化日历
onMounted(() => {
  if (calendarRef.value) {
    calendar = new Calendar(calendarRef.value, {
      view: 'month',
      locale: 'zh-CN',
      showLunar: true,
      showHolidays: true,
      onDateClick: handleDateClick
    })
    
    // 添加示例事件
    addSampleEvents()
    
    // 监听日期变化
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
const prevMonth = () => {
  calendar?.prev()
}

const nextMonth = () => {
  calendar?.next()
}

const today = () => {
  calendar?.today()
}

// 事件处理
const handleDateClick = (date: Date) => {
  alert(`您点击了日期：${date.toLocaleDateString('zh-CN')}`)
}

// 添加示例事件
const addSampleEvents = () => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const sampleEvents: CalendarEvent[] = [
    {
      id: '1',
      title: '团队会议',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0),
      color: '#722ED1',
      description: '讨论项目进展'
    },
    {
      id: '2',
      title: '项目评审',
      start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0),
      end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0),
      color: '#52C41A',
      description: '产品功能评审'
    },
    {
      id: '3',
      title: '生日聚会',
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      allDay: true,
      color: '#FA8C16',
      description: '朋友生日聚会'
    }
  ]
  
  sampleEvents.forEach(event => {
    calendar?.addEvent(event)
  })
}
</script>

<style scoped>
.basic-calendar {
  width: 100%;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.current-date {
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.calendar-container {
  width: 100%;
  height: 400px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-info {
  color: #8c8c8c;
}

@media (max-width: 768px) {
  .calendar-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .current-date {
    text-align: center;
  }
  
  .calendar-container {
    height: 350px;
  }
}
</style>
