<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEditing ? '编辑事件' : '添加事件' }}</h3>
        <button class="btn-close" @click="$emit('close')">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">事件标题 *</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="formData.title"
            placeholder="请输入事件标题"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">描述</label>
          <textarea 
            class="form-control" 
            v-model="formData.description"
            placeholder="请输入事件描述"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">开始时间 *</label>
            <input 
              type="datetime-local" 
              class="form-control" 
              v-model="formData.startTime"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">结束时间 *</label>
            <input 
              type="datetime-local" 
              class="form-control" 
              v-model="formData.endTime"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label class="toggle-item">
            <input 
              type="checkbox" 
              v-model="formData.allDay"
              @change="handleAllDayChange"
            />
            全天事件
          </label>
        </div>
        
        <div class="form-group">
          <label class="form-label">颜色</label>
          <div class="color-picker">
            <div 
              v-for="color in colorOptions" 
              :key="color"
              :class="['color-option', { 'color-option-selected': formData.color === color }]"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
            ></div>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">位置</label>
          <input 
            type="text" 
            class="form-control" 
            v-model="formData.location"
            placeholder="请输入事件位置"
          />
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn" @click="$emit('close')">
            取消
          </button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? '更新' : '创建' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CalendarEvent } from '@ldesign/calendar'

// Props
interface Props {
  event?: CalendarEvent | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  save: [event: CalendarEvent]
  close: []
}>()

// 颜色选项
const colorOptions = [
  '#722ED1', // 紫色
  '#1890FF', // 蓝色
  '#52C41A', // 绿色
  '#FA8C16', // 橙色
  '#F5222D', // 红色
  '#13C2C2', // 青色
  '#EB2F96', // 粉色
  '#722ED1'  // 深紫色
]

// 表单数据
const formData = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  allDay: false,
  color: '#722ED1',
  location: ''
})

// 计算属性
const isEditing = computed(() => !!props.event?.id)

// 工具函数
const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// 监听props变化
watch(() => props.event, (newEvent) => {
  if (newEvent) {
    const start = new Date(newEvent.start)
    const end = new Date(newEvent.end)

    formData.value = {
      title: newEvent.title || '',
      description: newEvent.description || '',
      startTime: formatDateTimeLocal(start),
      endTime: formatDateTimeLocal(end),
      allDay: newEvent.allDay || false,
      color: newEvent.color || '#722ED1',
      location: newEvent.location || ''
    }
  } else {
    // 重置表单
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

    formData.value = {
      title: '',
      description: '',
      startTime: formatDateTimeLocal(now),
      endTime: formatDateTimeLocal(oneHourLater),
      allDay: false,
      color: '#722ED1',
      location: ''
    }
  }
}, { immediate: true })

// 处理全天事件变化
const handleAllDayChange = () => {
  if (formData.value.allDay) {
    // 设置为全天
    const start = new Date(formData.value.startTime)
    const end = new Date(formData.value.startTime)
    end.setDate(end.getDate() + 1)
    
    formData.value.startTime = formatDateLocal(start)
    formData.value.endTime = formatDateLocal(end)
  } else {
    // 设置为具体时间
    const start = new Date(formData.value.startTime)
    const end = new Date(start)
    end.setHours(end.getHours() + 1)
    
    formData.value.startTime = formatDateTimeLocal(start)
    formData.value.endTime = formatDateTimeLocal(end)
  }
}

// 处理表单提交
const handleSubmit = () => {
  const startDate = new Date(formData.value.startTime)
  const endDate = new Date(formData.value.endTime)
  
  // 验证时间
  if (endDate <= startDate) {
    alert('结束时间必须晚于开始时间')
    return
  }
  
  const eventData: CalendarEvent = {
    id: props.event?.id || '',
    title: formData.value.title,
    description: formData.value.description,
    start: startDate,
    end: endDate,
    allDay: formData.value.allDay,
    color: formData.value.color,
    location: formData.value.location
  }
  
  emit('save', eventData)
}

// 处理遮罩点击
const handleOverlayClick = () => {
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #262626;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  font-size: 24px;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c8c8c;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f5f5f5;
  color: #262626;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.toggle-item input[type="checkbox"] {
  margin: 0;
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option-selected {
  border-color: #262626;
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-header,
  .modal-body {
    padding: 16px;
  }
}
</style>
