<template>
  <div class="l-form-debug-panel">
    <div class="l-form-debug-panel__header">
      <h4 class="l-form-debug-panel__title">表单调试面板</h4>
      <div class="l-form-debug-panel__controls">
        <button
          :class="[
            'l-form-debug-panel__control',
            { 'l-form-debug-panel__control--active': activeTab === 'state' }
          ]"
          @click="activeTab = 'state'"
        >
          状态
        </button>
        <button
          :class="[
            'l-form-debug-panel__control',
            { 'l-form-debug-panel__control--active': activeTab === 'data' }
          ]"
          @click="activeTab = 'data'"
        >
          数据
        </button>
        <button
          :class="[
            'l-form-debug-panel__control',
            { 'l-form-debug-panel__control--active': activeTab === 'events' }
          ]"
          @click="activeTab = 'events'"
        >
          事件
        </button>
        <button
          :class="[
            'l-form-debug-panel__control',
            { 'l-form-debug-panel__control--active': activeTab === 'performance' }
          ]"
          @click="activeTab = 'performance'"
        >
          性能
        </button>
        <button
          class="l-form-debug-panel__control l-form-debug-panel__control--clear"
          @click="clearLogs"
        >
          清空
        </button>
        <button
          class="l-form-debug-panel__control l-form-debug-panel__control--close"
          @click="$emit('close')"
        >
          ×
        </button>
      </div>
    </div>
    
    <div class="l-form-debug-panel__content">
      <!-- 状态面板 -->
      <div v-if="activeTab === 'state'" class="l-form-debug-panel__tab">
        <div class="l-form-debug-panel__section">
          <h5>表单状态</h5>
          <div class="l-form-debug-panel__grid">
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">是否脏数据:</span>
              <span :class="getStatusClass(formState.isDirty)">
                {{ formState.isDirty ? '是' : '否' }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">是否有效:</span>
              <span :class="getStatusClass(formState.isValid)">
                {{ formState.isValid ? '是' : '否' }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">是否提交中:</span>
              <span :class="getStatusClass(formState.isSubmitting)">
                {{ formState.isSubmitting ? '是' : '否' }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">是否加载中:</span>
              <span :class="getStatusClass(formState.isLoading)">
                {{ formState.isLoading ? '是' : '否' }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">错误数量:</span>
              <span :class="getStatusClass(formState.errorCount === 0)">
                {{ formState.errorCount || 0 }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">字段数量:</span>
              <span class="l-form-debug-panel__value">
                {{ formState.fieldCount || 0 }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="l-form-debug-panel__section">
          <h5>引擎状态</h5>
          <div v-if="formInstance" class="l-form-debug-panel__grid">
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">已挂载:</span>
              <span :class="getStatusClass(formInstance.isMounted)">
                {{ formInstance.isMounted ? '是' : '否' }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">已销毁:</span>
              <span :class="getStatusClass(!formInstance.isDestroyed)">
                {{ formInstance.isDestroyed ? '是' : '否' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 数据面板 -->
      <div v-if="activeTab === 'data'" class="l-form-debug-panel__tab">
        <div class="l-form-debug-panel__section">
          <h5>表单数据</h5>
          <pre class="l-form-debug-panel__code">{{ formatJson(formData) }}</pre>
        </div>
        
        <div v-if="formInstance" class="l-form-debug-panel__section">
          <h5>字段状态</h5>
          <div class="l-form-debug-panel__field-states">
            <div
              v-for="(state, fieldName) in fieldStates"
              :key="fieldName"
              class="l-form-debug-panel__field-state"
            >
              <div class="l-form-debug-panel__field-name">{{ fieldName }}</div>
              <div class="l-form-debug-panel__field-info">
                <span :class="getStatusClass(!state.isDirty)">
                  {{ state.isDirty ? '脏' : '净' }}
                </span>
                <span :class="getStatusClass(state.isVisible)">
                  {{ state.isVisible ? '显示' : '隐藏' }}
                </span>
                <span :class="getStatusClass(!state.isDisabled)">
                  {{ state.isDisabled ? '禁用' : '启用' }}
                </span>
                <span v-if="state.errors?.length" class="l-form-debug-panel__value--error">
                  {{ state.errors.length }}个错误
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 事件面板 -->
      <div v-if="activeTab === 'events'" class="l-form-debug-panel__tab">
        <div class="l-form-debug-panel__section">
          <h5>事件日志 ({{ eventLogs.length }})</h5>
          <div class="l-form-debug-panel__events">
            <div
              v-for="(event, index) in eventLogs.slice().reverse()"
              :key="index"
              class="l-form-debug-panel__event"
            >
              <div class="l-form-debug-panel__event-header">
                <span class="l-form-debug-panel__event-type">{{ event.type }}</span>
                <span class="l-form-debug-panel__event-time">
                  {{ formatTime(event.timestamp) }}
                </span>
              </div>
              <div v-if="event.data" class="l-form-debug-panel__event-data">
                <pre>{{ formatJson(event.data) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 性能面板 -->
      <div v-if="activeTab === 'performance'" class="l-form-debug-panel__tab">
        <div class="l-form-debug-panel__section">
          <h5>验证统计</h5>
          <div v-if="validationStats" class="l-form-debug-panel__grid">
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">总验证次数:</span>
              <span class="l-form-debug-panel__value">
                {{ validationStats.totalValidations }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">成功次数:</span>
              <span class="l-form-debug-panel__value--success">
                {{ validationStats.successfulValidations }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">失败次数:</span>
              <span class="l-form-debug-panel__value--error">
                {{ validationStats.failedValidations }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">平均耗时:</span>
              <span class="l-form-debug-panel__value">
                {{ validationStats.averageValidationTime.toFixed(2) }}ms
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">缓存命中率:</span>
              <span class="l-form-debug-panel__value">
                {{ (validationStats.cacheHitRate * 100).toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
        
        <div class="l-form-debug-panel__section">
          <h5>事件统计</h5>
          <div v-if="eventStats" class="l-form-debug-panel__grid">
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">总事件数:</span>
              <span class="l-form-debug-panel__value">
                {{ eventStats.totalEvents }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">监听器数:</span>
              <span class="l-form-debug-panel__value">
                {{ eventStats.listenerCount }}
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">平均处理时间:</span>
              <span class="l-form-debug-panel__value">
                {{ eventStats.averageProcessTime.toFixed(2) }}ms
              </span>
            </div>
            <div class="l-form-debug-panel__item">
              <span class="l-form-debug-panel__label">错误数:</span>
              <span class="l-form-debug-panel__value--error">
                {{ eventStats.errorCount }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { FormState, AnyObject } from '../../types'

// 组件属性
interface Props {
  formInstance?: any
  formData?: AnyObject
  formState?: FormState
}

// 组件事件
interface Emits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  formInstance: null,
  formData: () => ({}),
  formState: () => ({} as FormState)
})

const emit = defineEmits<Emits>()

// 响应式数据
const activeTab = ref<'state' | 'data' | 'events' | 'performance'>('state')
const eventLogs = ref<Array<{ type: string; timestamp: number; data?: any }>>([])

// 计算属性
const fieldStates = computed(() => {
  if (!props.formInstance?.stateManager) return {}
  
  const states: Record<string, any> = {}
  for (const [fieldPath] of props.formInstance.stateManager.fieldConfigs) {
    const state = props.formInstance.stateManager.getFieldState(fieldPath)
    if (state) {
      states[fieldPath] = state
    }
  }
  return states
})

const validationStats = computed(() => {
  return props.formInstance?.validationEngine?.getStatistics()
})

const eventStats = computed(() => {
  return props.formInstance?.eventBus?.getStats()
})

// 方法
const getStatusClass = (isGood: boolean) => {
  return isGood 
    ? 'l-form-debug-panel__value--success' 
    : 'l-form-debug-panel__value--error'
}

const formatJson = (obj: any) => {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const clearLogs = () => {
  eventLogs.value = []
}

// 监听表单事件
const setupEventListeners = () => {
  if (!props.formInstance?.eventBus) return
  
  const eventBus = props.formInstance.eventBus
  
  // 监听所有事件
  const originalEmit = eventBus.emit.bind(eventBus)
  eventBus.emit = (type: string, data?: any) => {
    // 记录事件日志
    eventLogs.value.push({
      type,
      timestamp: Date.now(),
      data: data ? { ...data } : undefined
    })
    
    // 限制日志数量
    if (eventLogs.value.length > 100) {
      eventLogs.value = eventLogs.value.slice(-100)
    }
    
    return originalEmit(type, data)
  }
}

// 监听表单实例变化
watch(() => props.formInstance, (newInstance) => {
  if (newInstance) {
    setupEventListeners()
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  setupEventListeners()
})
</script>

<style lang="less">
.l-form-debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background-color: var(--background-color, #ffffff);
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color-light, #f0f0f0);
    background-color: var(--background-color-light, #fafafa);
    border-radius: 8px 8px 0 0;
  }
  
  &__title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--text-color-primary, #262626);
  }
  
  &__controls {
    display: flex;
    gap: 4px;
  }
  
  &__control {
    padding: 4px 8px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 4px;
    background-color: var(--background-color, #ffffff);
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--primary-color, #1890ff);
      color: var(--primary-color, #1890ff);
    }
    
    &--active {
      background-color: var(--primary-color, #1890ff);
      border-color: var(--primary-color, #1890ff);
      color: white;
    }
    
    &--clear {
      background-color: var(--warning-color, #faad14);
      border-color: var(--warning-color, #faad14);
      color: white;
      
      &:hover {
        background-color: var(--warning-color-hover, #ffc53d);
        border-color: var(--warning-color-hover, #ffc53d);
      }
    }
    
    &--close {
      background-color: var(--error-color, #ff4d4f);
      border-color: var(--error-color, #ff4d4f);
      color: white;
      
      &:hover {
        background-color: var(--error-color-hover, #ff7875);
        border-color: var(--error-color-hover, #ff7875);
      }
    }
  }
  
  &__content {
    max-height: 500px;
    overflow-y: auto;
    padding: 16px;
  }
  
  &__section {
    margin-bottom: 20px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    h5 {
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-color-primary, #262626);
      border-bottom: 1px solid var(--border-color-light, #f0f0f0);
      padding-bottom: 4px;
    }
  }
  
  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  &__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }
  
  &__label {
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 11px;
  }
  
  &__value {
    color: var(--text-color-primary, #262626);
    font-weight: 500;
    
    &--success {
      color: var(--success-color, #52c41a);
      font-weight: 500;
    }
    
    &--error {
      color: var(--error-color, #ff4d4f);
      font-weight: 500;
    }
  }
  
  &__code {
    background-color: var(--background-color-light, #fafafa);
    border: 1px solid var(--border-color-light, #f0f0f0);
    border-radius: 4px;
    padding: 8px;
    margin: 0;
    font-size: 11px;
    line-height: 1.4;
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
  
  &__field-states {
    max-height: 200px;
    overflow-y: auto;
  }
  
  &__field-state {
    padding: 6px 0;
    border-bottom: 1px solid var(--border-color-light, #f0f0f0);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  &__field-name {
    font-weight: 500;
    color: var(--text-color-primary, #262626);
    margin-bottom: 4px;
  }
  
  &__field-info {
    display: flex;
    gap: 8px;
    
    span {
      padding: 2px 6px;
      border-radius: 2px;
      font-size: 10px;
      background-color: var(--background-color-light, #fafafa);
      color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &__events {
    max-height: 300px;
    overflow-y: auto;
  }
  
  &__event {
    padding: 8px 0;
    border-bottom: 1px solid var(--border-color-light, #f0f0f0);
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  &__event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
  
  &__event-type {
    font-weight: 500;
    color: var(--primary-color, #1890ff);
  }
  
  &__event-time {
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 10px;
  }
  
  &__event-data {
    pre {
      background-color: var(--background-color-light, #fafafa);
      border: 1px solid var(--border-color-light, #f0f0f0);
      border-radius: 2px;
      padding: 4px;
      margin: 0;
      font-size: 10px;
      line-height: 1.3;
      max-height: 100px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
