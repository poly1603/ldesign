<script setup lang="ts">
import { inject, onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine?: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 获取引擎实例
const engine = inject('engine') as any || props.engine

// 响应式数据
const eventName = ref('user:login')
const eventData = ref('{"username": "张三", "timestamp": "2024-01-01T10:00:00Z"}')
const listenerPriority = ref(5)
const isOnceListener = ref(false)
const namespace = ref('user')
const namespacedEvent = ref('login')
const eventStats = ref<any>(null)
const eventLogs = reactive<any[]>([])
const activeListeners = reactive<any[]>([])

const listenerIds: string[] = []

// 预设事件
const presets = [
  {
    name: '用户登录',
    event: 'user:login',
    data: { username: '张三', role: 'admin' },
  },
  {
    name: '数据加载',
    event: 'data:load',
    data: { type: 'users', count: 100 },
  },
  {
    name: '系统通知',
    event: 'system:notification',
    data: { type: 'info', message: '系统维护通知' },
  },
  {
    name: '错误事件',
    event: 'app:error',
    data: { code: 500, message: '服务器内部错误' },
  },
]

// 方法
function emitEvent() {
  try {
    let data = null
    if (eventData.value.trim()) {
      try {
        data = JSON.parse(eventData.value)
      }
      catch {
        data = eventData.value
      }
    }

    props.engine.events.emit(eventName.value, data)

    // 记录日志
    eventLogs.push({
      timestamp: Date.now(),
      type: 'emit',
      event: eventName.value,
      data,
    })

    emit('log', 'success', `触发事件: ${eventName.value}`, data)
  }
  catch (error: any) {
    emit('log', 'error', '触发事件失败', error)
  }
}

function listenEvent() {
  try {
    const listenerId = props.engine.events.on(eventName.value, (data: any) => {
      // 记录日志
      eventLogs.push({
        timestamp: Date.now(),
        type: 'receive',
        event: eventName.value,
        data,
      })

      emit('log', 'info', `接收事件: ${eventName.value}`, data)
    })

    listenerIds.push(listenerId)
    activeListeners.push({
      id: listenerId,
      event: eventName.value,
      priority: 0,
      once: false,
    })

    emit('log', 'success', `开始监听事件: ${eventName.value}`)
  }
  catch (error: any) {
    emit('log', 'error', '监听事件失败', error)
  }
}

function removeListener() {
  try {
    if (listenerIds.length > 0) {
      const listenerId = listenerIds.pop()
      if (listenerId) {
        props.engine.events.off(listenerId)

        // 从活跃监听器列表中移除
        const index = activeListeners.findIndex(l => l.id === listenerId)
        if (index !== -1) {
          activeListeners.splice(index, 1)
        }

        emit('log', 'warning', `移除监听器: ${listenerId}`)
      }
    }
  }
  catch (error: any) {
    emit('log', 'error', '移除监听器失败', error)
  }
}

function addPriorityListener() {
  try {
    const listenerId = props.engine.events.on(eventName.value, (data: any) => {
      eventLogs.push({
        timestamp: Date.now(),
        type: 'receive',
        event: eventName.value,
        data,
      })

      emit('log', 'info', `优先级监听器接收事件: ${eventName.value}`, data)
    }, { priority: listenerPriority.value })

    listenerIds.push(listenerId)
    activeListeners.push({
      id: listenerId,
      event: eventName.value,
      priority: listenerPriority.value,
      once: false,
    })

    emit('log', 'success', `添加优先级监听器: ${eventName.value} (优先级: ${listenerPriority.value})`)
  }
  catch (error: any) {
    emit('log', 'error', '添加优先级监听器失败', error)
  }
}

function addOnceListener() {
  try {
    const listenerId = props.engine.events.once(eventName.value, (data: any) => {
      eventLogs.push({
        timestamp: Date.now(),
        type: 'receive',
        event: eventName.value,
        data,
      })

      emit('log', 'info', `一次性监听器接收事件: ${eventName.value}`, data)

      // 从活跃监听器列表中移除
      const index = activeListeners.findIndex(l => l.id === listenerId)
      if (index !== -1) {
        activeListeners.splice(index, 1)
      }
    })

    listenerIds.push(listenerId)
    activeListeners.push({
      id: listenerId,
      event: eventName.value,
      priority: 0,
      once: true,
    })

    emit('log', 'success', `添加一次性监听器: ${eventName.value}`)
  }
  catch (error: any) {
    emit('log', 'error', '添加一次性监听器失败', error)
  }
}

function removeSpecificListener(listenerId: string) {
  try {
    props.engine.events.off(listenerId)

    // 从列表中移除
    const index = activeListeners.findIndex(l => l.id === listenerId)
    if (index !== -1) {
      activeListeners.splice(index, 1)
    }

    const listenerIndex = listenerIds.indexOf(listenerId)
    if (listenerIndex !== -1) {
      listenerIds.splice(listenerIndex, 1)
    }

    emit('log', 'warning', `移除指定监听器: ${listenerId}`)
  }
  catch (error: any) {
    emit('log', 'error', '移除指定监听器失败', error)
  }
}

function emitNamespacedEvent() {
  try {
    let data = null
    if (eventData.value.trim()) {
      try {
        data = JSON.parse(eventData.value)
      }
      catch {
        data = eventData.value
      }
    }

    const namespacedEventManager = props.engine.events.namespace(namespace.value)
    namespacedEventManager.emit(namespacedEvent.value, data)

    eventLogs.push({
      timestamp: Date.now(),
      type: 'emit',
      event: `${namespace.value}:${namespacedEvent.value}`,
      data,
    })

    emit('log', 'success', `触发命名空间事件: ${namespace.value}:${namespacedEvent.value}`, data)
  }
  catch (error: any) {
    emit('log', 'error', '触发命名空间事件失败', error)
  }
}

function listenNamespacedEvent() {
  try {
    const namespacedEventManager = props.engine.events.namespace(namespace.value)
    const listenerId = namespacedEventManager.on(namespacedEvent.value, (data: any) => {
      eventLogs.push({
        timestamp: Date.now(),
        type: 'receive',
        event: `${namespace.value}:${namespacedEvent.value}`,
        data,
      })

      emit('log', 'info', `接收命名空间事件: ${namespace.value}:${namespacedEvent.value}`, data)
    })

    listenerIds.push(listenerId)
    activeListeners.push({
      id: listenerId,
      event: `${namespace.value}:${namespacedEvent.value}`,
      priority: 0,
      once: false,
    })

    emit('log', 'success', `监听命名空间事件: ${namespace.value}:${namespacedEvent.value}`)
  }
  catch (error: any) {
    emit('log', 'error', '监听命名空间事件失败', error)
  }
}

function getEventStats() {
  try {
    const stats = props.engine.events.getStats()
    eventStats.value = stats
    emit('log', 'info', '获取事件统计信息', stats)
  }
  catch (error: any) {
    emit('log', 'error', '获取事件统计失败', error)
  }
}

function clearAllListeners() {
  try {
    listenerIds.forEach((id) => {
      props.engine.events.off(id)
    })
    listenerIds.length = 0
    activeListeners.splice(0, activeListeners.length)

    emit('log', 'warning', '清空所有监听器')
  }
  catch (error: any) {
    emit('log', 'error', '清空监听器失败', error)
  }
}

function clearEventLogs() {
  eventLogs.splice(0, eventLogs.length)
  emit('log', 'info', '清空事件日志')
}

function triggerPreset(preset: any) {
  try {
    props.engine.events.emit(preset.event, preset.data)

    eventLogs.push({
      timestamp: Date.now(),
      type: 'emit',
      event: preset.event,
      data: preset.data,
    })

    emit('log', 'success', `触发预设事件: ${preset.name}`, preset.data)
  }
  catch (error: any) {
    emit('log', 'error', '触发预设事件失败', error)
  }
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  emit('log', 'info', '事件管理器演示已加载')
})

onUnmounted(() => {
  // 清理所有监听器
  clearAllListeners()
})
</script>

<template>
  <div class="events-demo">
    <div class="demo-header">
      <h2>📡 事件管理器演示</h2>
      <p>EventManager 提供了强大的事件系统，支持事件发布订阅、命名空间、优先级控制等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础事件操作 -->
      <div class="card">
        <div class="card-header">
          <h3>基础事件操作</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>事件名称</label>
            <input
              v-model="eventName"
              type="text"
              placeholder="例如: user:login"
            >
          </div>

          <div class="form-group">
            <label>事件数据</label>
            <textarea
              v-model="eventData"
              placeholder="输入事件数据 (JSON 格式)"
              rows="3"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="emitEvent">
                触发事件
              </button>
              <button class="btn btn-secondary" @click="listenEvent">
                监听事件
              </button>
              <button class="btn btn-warning" @click="removeListener">
                移除监听
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 事件监听器管理 -->
      <div class="card">
        <div class="card-header">
          <h3>监听器管理</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>监听器优先级</label>
            <input
              v-model.number="listenerPriority"
              type="number"
              placeholder="数值越大优先级越高"
            >
          </div>

          <div class="form-group">
            <label>
              <input
                v-model="isOnceListener"
                type="checkbox"
              >
              一次性监听器
            </label>
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="addPriorityListener">
                添加优先级监听器
              </button>
              <button class="btn btn-secondary" @click="addOnceListener">
                添加一次性监听器
              </button>
            </div>
          </div>

          <div class="listeners-info">
            <h4>当前监听器</h4>
            <div class="listener-list">
              <div
                v-for="listener in activeListeners"
                :key="listener.id"
                class="listener-item"
              >
                <span class="listener-event">{{ listener.event }}</span>
                <span class="listener-priority">优先级: {{ listener.priority }}</span>
                <span class="listener-once">{{ listener.once ? '一次性' : '持续' }}</span>
                <button
                  class="btn btn-error btn-sm"
                  @click="removeSpecificListener(listener.id)"
                >
                  移除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 命名空间事件 -->
      <div class="card">
        <div class="card-header">
          <h3>命名空间事件</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>命名空间</label>
            <input
              v-model="namespace"
              type="text"
              placeholder="例如: user"
            >
          </div>

          <div class="form-group">
            <label>命名空间事件</label>
            <input
              v-model="namespacedEvent"
              type="text"
              placeholder="例如: login"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="emitNamespacedEvent">
                触发命名空间事件
              </button>
              <button class="btn btn-secondary" @click="listenNamespacedEvent">
                监听命名空间事件
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 事件统计 -->
      <div class="card">
        <div class="card-header">
          <h3>事件统计</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="getEventStats">
                获取统计信息
              </button>
              <button class="btn btn-warning" @click="clearAllListeners">
                清空所有监听器
              </button>
            </div>
          </div>

          <div v-if="eventStats" class="stats-info">
            <h4>统计信息</h4>
            <p>总监听器数: {{ eventStats.totalListeners }}</p>
            <p>事件类型数: {{ eventStats.eventTypes }}</p>
            <p>触发次数: {{ eventStats.emitCount }}</p>
          </div>
        </div>
      </div>

      <!-- 事件日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>事件日志</h3>
          <button class="btn btn-secondary btn-sm" @click="clearEventLogs">
            清空
          </button>
        </div>
        <div class="card-body">
          <div class="event-logs">
            <div
              v-for="(log, index) in eventLogs"
              :key="index"
              class="event-log-item"
              :class="log.type"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-type">{{ log.type }}</span>
              <span class="log-event">{{ log.event }}</span>
              <span class="log-data">{{ log.data ? JSON.stringify(log.data) : '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设事件 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>预设事件模板</h3>
        </div>
        <div class="card-body">
          <div class="preset-buttons">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="btn btn-secondary"
              @click="triggerPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.events-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .listeners-info {
    margin-top: var(--spacing-md);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    .listener-list {
      max-height: 200px;
      overflow-y: auto;

      .listener-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);
        background: var(--bg-secondary);
        border-radius: var(--border-radius);
        font-size: 12px;

        .listener-event {
          color: var(--primary-color);
          font-weight: 500;
          min-width: 120px;
        }

        .listener-priority {
          color: var(--text-secondary);
          min-width: 80px;
        }

        .listener-once {
          color: var(--warning-color);
          min-width: 60px;
        }
      }
    }
  }

  .stats-info {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--border-radius);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    p {
      margin: var(--spacing-xs) 0;
      font-size: 14px;
    }
  }

  .event-logs {
    max-height: 300px;
    overflow-y: auto;

    .event-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;

      &.emit {
        .log-type {
          color: var(--success-color);
        }
      }

      &.receive {
        .log-type {
          color: var(--info-color);
        }
      }

      .log-time {
        color: var(--text-muted);
        min-width: 80px;
      }

      .log-type {
        font-weight: bold;
        min-width: 60px;
      }

      .log-event {
        color: var(--primary-color);
        min-width: 150px;
      }

      .log-data {
        flex: 1;
        color: var(--text-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .preset-buttons {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .events-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
