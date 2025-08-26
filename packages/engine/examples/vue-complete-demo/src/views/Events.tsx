import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import './Events.less'

export default defineComponent({
  name: 'Events',
  setup() {
    const engine = useEngine()
    const eventLogs = ref<string[]>([])
    const eventStats = ref<any>({})
    const customEventName = ref('custom-event')
    const customEventData = ref('Hello World')

    // 事件监听器引用
    const listeners = ref<Array<() => void>>([])

    // 添加日志
    function addLog(message: string) {
      eventLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
      if (eventLogs.value.length > 50) {
        eventLogs.value = eventLogs.value.slice(0, 50)
      }
    }

    // 更新事件统计
    function updateEventStats() {
      if (engine?.events && typeof engine.events.getEventStats === 'function') {
        eventStats.value = engine.events.getEventStats()
      }
    }

    // 触发系统事件
    function triggerSystemEvent() {
      if (engine?.events) {
        engine.events.emit('system:test', { 
          message: '系统测试事件',
          timestamp: Date.now()
        })
        addLog('触发系统事件: system:test')
        updateEventStats()
      }
    }

    // 触发自定义事件
    function triggerCustomEvent() {
      if (engine?.events && customEventName.value) {
        engine.events.emit(customEventName.value, {
          data: customEventData.value,
          timestamp: Date.now()
        })
        addLog(`触发自定义事件: ${customEventName.value}`)
        updateEventStats()
      }
    }

    // 注册事件监听器
    function registerListener() {
      if (engine?.events && customEventName.value) {
        const unsubscribe = engine.events.on(customEventName.value, (data: any) => {
          addLog(`监听到事件 ${customEventName.value}: ${JSON.stringify(data)}`)
          updateEventStats()
        })
        
        listeners.value.push(unsubscribe)
        addLog(`注册监听器: ${customEventName.value}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '📡 事件监听器',
            message: `已注册监听器: ${customEventName.value}`,
            type: 'success',
            duration: 2000,
          })
        }
      }
    }

    // 注册一次性监听器
    function registerOnceListener() {
      if (engine?.events && customEventName.value) {
        const unsubscribe = engine.events.once(customEventName.value, (data: any) => {
          addLog(`一次性监听到事件 ${customEventName.value}: ${JSON.stringify(data)}`)
          updateEventStats()
        })
        
        listeners.value.push(unsubscribe)
        addLog(`注册一次性监听器: ${customEventName.value}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '📡 一次性监听器',
            message: `已注册一次性监听器: ${customEventName.value}`,
            type: 'info',
            duration: 2000,
          })
        }
      }
    }

    // 移除所有监听器
    function removeAllListeners() {
      listeners.value.forEach(unsubscribe => unsubscribe())
      listeners.value = []
      addLog('移除所有监听器')
      updateEventStats()
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🗑️ 清理监听器',
          message: '已移除所有监听器',
          type: 'warning',
          duration: 2000,
        })
      }
    }

    // 批量触发事件
    function batchTriggerEvents() {
      if (engine?.events) {
        for (let i = 0; i < 10; i++) {
          setTimeout(() => {
            engine.events.emit('batch:test', { 
              index: i,
              message: `批量事件 ${i}`,
              timestamp: Date.now()
            })
          }, i * 100)
        }
        addLog('批量触发 10 个事件')
        
        // 延迟更新统计
        setTimeout(updateEventStats, 1500)
      }
    }

    // 清空日志
    function clearLogs() {
      eventLogs.value = []
    }

    // 重置事件统计
    function resetEventStats() {
      if (engine?.events && typeof engine.events.resetStats === 'function') {
        engine.events.resetStats()
        updateEventStats()
        addLog('重置事件统计')
      }
    }

    onMounted(() => {
      if (engine?.events) {
        // 注册一些系统事件监听器
        const systemListener = engine.events.on('system:test', (data: any) => {
          addLog(`系统事件监听器收到: ${JSON.stringify(data)}`)
        })
        
        const batchListener = engine.events.on('batch:test', (data: any) => {
          addLog(`批量事件监听器收到: 索引 ${data.index}`)
        })
        
        listeners.value.push(systemListener, batchListener)
        
        // 初始化统计
        updateEventStats()
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '📡 事件系统',
            message: '事件系统演示已初始化',
            type: 'info',
            duration: 3000,
          })
        }
      }
    })

    onUnmounted(() => {
      // 清理所有监听器
      listeners.value.forEach(unsubscribe => unsubscribe())
    })

    return () => (
      <div class="events">
        <div class="page-header">
          <h1 class="page-title">📡 事件系统演示</h1>
          <p class="page-description">
            展示 Engine 的事件发布订阅系统，包括事件触发、监听、统计等功能
          </p>
        </div>

        <div class="events-layout">
          {/* 控制面板 */}
          <div class="control-panel">
            <div class="panel-section">
              <h3>🎯 事件触发</h3>
              <div class="control-group">
                <button class="btn btn-primary" onClick={triggerSystemEvent}>
                  触发系统事件
                </button>
                <button class="btn btn-secondary" onClick={batchTriggerEvents}>
                  批量触发事件
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>🎛️ 自定义事件</h3>
              <div class="input-group">
                <label>事件名称:</label>
                <input
                  type="text"
                  v-model={customEventName.value}
                  placeholder="输入事件名称"
                  class="input-field"
                />
              </div>
              <div class="input-group">
                <label>事件数据:</label>
                <input
                  type="text"
                  v-model={customEventData.value}
                  placeholder="输入事件数据"
                  class="input-field"
                />
              </div>
              <div class="control-group">
                <button class="btn btn-primary" onClick={triggerCustomEvent}>
                  触发自定义事件
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>👂 事件监听</h3>
              <div class="control-group">
                <button class="btn btn-success" onClick={registerListener}>
                  注册监听器
                </button>
                <button class="btn btn-info" onClick={registerOnceListener}>
                  注册一次性监听器
                </button>
                <button class="btn btn-warning" onClick={removeAllListeners}>
                  移除所有监听器
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>🧹 管理操作</h3>
              <div class="control-group">
                <button class="btn btn-outline" onClick={clearLogs}>
                  清空日志
                </button>
                <button class="btn btn-outline" onClick={resetEventStats}>
                  重置统计
                </button>
                <button class="btn btn-outline" onClick={updateEventStats}>
                  刷新统计
                </button>
              </div>
            </div>
          </div>

          {/* 信息面板 */}
          <div class="info-panel">
            {/* 事件统计 */}
            <div class="stats-section">
              <h3>📊 事件统计</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">总事件数:</span>
                  <span class="stat-value">{eventStats.value.totalEvents || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">监听器数:</span>
                  <span class="stat-value">{eventStats.value.totalListeners || 0}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">事件类型:</span>
                  <span class="stat-value">{Object.keys(eventStats.value.eventTypes || {}).length}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">活跃监听器:</span>
                  <span class="stat-value">{listeners.value.length}</span>
                </div>
              </div>
            </div>

            {/* 事件日志 */}
            <div class="logs-section">
              <h3>📝 事件日志</h3>
              <div class="logs-container">
                {eventLogs.value.length === 0 ? (
                  <div class="empty-logs">暂无事件日志...</div>
                ) : (
                  eventLogs.value.map((log, index) => (
                    <div key={index} class="log-item">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
})
