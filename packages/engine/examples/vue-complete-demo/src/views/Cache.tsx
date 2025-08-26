import { defineComponent, ref, computed, onMounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import './Cache.less'

export default defineComponent({
  name: 'Cache',
  setup() {
    const engine = useEngine()
    const testKey = ref('')
    const testValue = ref('')
    const testTTL = ref(3600)

    // 缓存演示数据
    const cacheData = ref([
      {
        key: 'user:123',
        value: '{"id":123,"name":"张三","email":"zhang@example.com"}',
        type: 'user',
        ttl: 3600,
        size: 52,
        hits: 15,
        created: new Date(Date.now() - 1800000).toLocaleString(),
        lastAccessed: new Date(Date.now() - 300000).toLocaleString(),
      },
      {
        key: 'api:posts:latest',
        value: '[{"id":1,"title":"最新文章"},{"id":2,"title":"热门文章"}]',
        type: 'api',
        ttl: 1800,
        size: 98,
        hits: 42,
        created: new Date(Date.now() - 900000).toLocaleString(),
        lastAccessed: new Date(Date.now() - 60000).toLocaleString(),
      },
      {
        key: 'config:app',
        value: '{"theme":"dark","language":"zh-CN","debug":true}',
        type: 'config',
        ttl: 86400,
        size: 45,
        hits: 8,
        created: new Date(Date.now() - 3600000).toLocaleString(),
        lastAccessed: new Date(Date.now() - 1800000).toLocaleString(),
      },
    ])

    // 缓存统计
    const cacheStats = ref({
      total: 1247,
      hits: 892,
      misses: 355,
      size: '2.3MB',
      avgResponseTime: '12ms',
      hitRate: 71.5,
      memoryUsage: 65.2,
      evictions: 23,
      namespaces: 8,
    })

    // 缓存操作日志
    const operationLogs = ref<string[]>([])

    // 添加日志
    function addLog(message: string) {
      operationLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
      if (operationLogs.value.length > 20) {
        operationLogs.value = operationLogs.value.slice(0, 20)
      }
    }

    // 设置缓存
    function setCache() {
      if (!testKey.value || !testValue.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 设置失败',
            message: '请输入键和值',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.cache) {
        engine.cache.set(testKey.value, testValue.value, testTTL.value * 1000)
        addLog(`设置缓存: ${testKey.value} = ${testValue.value} (TTL: ${testTTL.value}s)`)
        
        // 更新演示数据
        const existingIndex = cacheData.value.findIndex(item => item.key === testKey.value)
        const newItem = {
          key: testKey.value,
          value: testValue.value,
          type: 'custom',
          ttl: testTTL.value,
          size: testValue.value.length,
          hits: 0,
          created: new Date().toLocaleString(),
          lastAccessed: new Date().toLocaleString(),
        }

        if (existingIndex >= 0) {
          cacheData.value[existingIndex] = newItem
        } else {
          cacheData.value.unshift(newItem)
        }

        if (engine?.notifications) {
          engine.notifications.show({
            title: '✅ 缓存设置成功',
            message: `键: ${testKey.value}`,
            type: 'success',
            duration: 2000,
          })
        }
      }
    }

    // 获取缓存
    function getCache() {
      if (!testKey.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 获取失败',
            message: '请输入键名',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.cache) {
        const value = engine.cache.get(testKey.value)
        if (value !== undefined) {
          testValue.value = String(value)
          addLog(`获取缓存: ${testKey.value} = ${value}`)
          
          // 更新命中次数
          const item = cacheData.value.find(item => item.key === testKey.value)
          if (item) {
            item.hits++
            item.lastAccessed = new Date().toLocaleString()
          }

          if (engine?.notifications) {
            engine.notifications.show({
              title: '✅ 缓存命中',
              message: `值: ${value}`,
              type: 'success',
              duration: 2000,
            })
          }
        } else {
          addLog(`缓存未命中: ${testKey.value}`)
          if (engine?.notifications) {
            engine.notifications.show({
              title: '❌ 缓存未命中',
              message: `键: ${testKey.value}`,
              type: 'warning',
              duration: 2000,
            })
          }
        }
      }
    }

    // 删除缓存
    function deleteCache() {
      if (!testKey.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 删除失败',
            message: '请输入键名',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.cache) {
        const existed = engine.cache.has(testKey.value)
        engine.cache.delete(testKey.value)
        addLog(`删除缓存: ${testKey.value}`)
        
        // 从演示数据中移除
        const index = cacheData.value.findIndex(item => item.key === testKey.value)
        if (index >= 0) {
          cacheData.value.splice(index, 1)
        }

        if (engine?.notifications) {
          engine.notifications.show({
            title: existed ? '✅ 删除成功' : '⚠️ 键不存在',
            message: `键: ${testKey.value}`,
            type: existed ? 'success' : 'warning',
            duration: 2000,
          })
        }
      }
    }

    // 清空缓存
    function clearCache() {
      if (engine?.cache) {
        engine.cache.clear()
        cacheData.value = []
        addLog('清空所有缓存')
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '🗑️ 缓存已清空',
            message: '所有缓存项已删除',
            type: 'info',
            duration: 2000,
          })
        }
      }
    }

    // 获取缓存统计
    function getCacheStats() {
      if (engine?.cache) {
        const stats = engine.cache.getStats()
        cacheStats.value = {
          ...cacheStats.value,
          total: stats.size || cacheData.value.length,
          hits: stats.hits || cacheStats.value.hits,
          misses: stats.misses || cacheStats.value.misses,
          hitRate: stats.hits && stats.total ? Math.round((stats.hits / stats.total) * 100) : cacheStats.value.hitRate,
        }
        addLog('更新缓存统计')
      }
    }

    // 清空日志
    function clearLogs() {
      operationLogs.value = []
    }

    // 计算属性
    const hitRateColor = computed(() => {
      const rate = cacheStats.value.hitRate
      if (rate >= 80) return '#4CAF50'
      if (rate >= 60) return '#FF9800'
      return '#F44336'
    })

    onMounted(() => {
      getCacheStats()
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '💾 缓存系统',
          message: '缓存系统演示已初始化',
          type: 'info',
          duration: 3000,
        })
      }
    })

    return () => (
      <div class="cache">
        <div class="page-header">
          <h1 class="page-title">💾 缓存系统演示</h1>
          <p class="page-description">
            展示 Engine 的智能缓存系统，支持 LRU、TTL 过期、命名空间等功能
          </p>
        </div>

        <div class="cache-layout">
          {/* 控制面板 */}
          <div class="control-panel">
            <div class="panel-section">
              <h3>🎛️ 缓存操作</h3>
              <div class="input-group">
                <label>键名 (Key):</label>
                <input
                  type="text"
                  v-model={testKey.value}
                  placeholder="输入缓存键名"
                  class="input-field"
                />
              </div>
              <div class="input-group">
                <label>值 (Value):</label>
                <textarea
                  v-model={testValue.value}
                  placeholder="输入缓存值"
                  class="textarea-field"
                  rows={3}
                />
              </div>
              <div class="input-group">
                <label>过期时间 (TTL, 秒):</label>
                <input
                  type="number"
                  v-model={testTTL.value}
                  min="1"
                  max="86400"
                  class="input-field"
                />
              </div>
              <div class="control-group">
                <button class="btn btn-primary" onClick={setCache}>
                  设置缓存
                </button>
                <button class="btn btn-secondary" onClick={getCache}>
                  获取缓存
                </button>
                <button class="btn btn-warning" onClick={deleteCache}>
                  删除缓存
                </button>
                <button class="btn btn-danger" onClick={clearCache}>
                  清空缓存
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>📊 缓存统计</h3>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-icon">📦</span>
                  <div class="stat-content">
                    <span class="stat-value">{cacheStats.value.total}</span>
                    <span class="stat-label">总缓存项</span>
                  </div>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">🎯</span>
                  <div class="stat-content">
                    <span class="stat-value">{cacheStats.value.hits}</span>
                    <span class="stat-label">命中次数</span>
                  </div>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">❌</span>
                  <div class="stat-content">
                    <span class="stat-value">{cacheStats.value.misses}</span>
                    <span class="stat-label">未命中次数</span>
                  </div>
                </div>
                <div class="stat-item">
                  <span class="stat-icon">📈</span>
                  <div class="stat-content">
                    <span 
                      class="stat-value" 
                      style={{ color: hitRateColor.value }}
                    >
                      {cacheStats.value.hitRate}%
                    </span>
                    <span class="stat-label">命中率</span>
                  </div>
                </div>
              </div>
              <div class="control-group">
                <button class="btn btn-outline" onClick={getCacheStats}>
                  刷新统计
                </button>
              </div>
            </div>
          </div>

          {/* 信息面板 */}
          <div class="info-panel">
            {/* 缓存数据列表 */}
            <div class="cache-list-section">
              <h3>📋 缓存数据列表</h3>
              <div class="cache-table">
                <div class="table-header">
                  <span>键名</span>
                  <span>类型</span>
                  <span>大小</span>
                  <span>命中</span>
                  <span>TTL</span>
                  <span>最后访问</span>
                </div>
                <div class="table-body">
                  {cacheData.value.length === 0 ? (
                    <div class="empty-data">暂无缓存数据...</div>
                  ) : (
                    cacheData.value.map((item, index) => (
                      <div key={index} class="table-row">
                        <span class="cell-key" title={item.value}>
                          {item.key}
                        </span>
                        <span class={`cell-type type-${item.type}`}>
                          {item.type}
                        </span>
                        <span class="cell-size">
                          {item.size}B
                        </span>
                        <span class="cell-hits">
                          {item.hits}
                        </span>
                        <span class="cell-ttl">
                          {item.ttl}s
                        </span>
                        <span class="cell-time">
                          {item.lastAccessed}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 操作日志 */}
            <div class="logs-section">
              <div class="logs-header">
                <h3>📝 操作日志</h3>
                <button class="btn btn-sm btn-outline" onClick={clearLogs}>
                  清空日志
                </button>
              </div>
              <div class="logs-container">
                {operationLogs.value.length === 0 ? (
                  <div class="empty-logs">暂无操作日志...</div>
                ) : (
                  operationLogs.value.map((log, index) => (
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
