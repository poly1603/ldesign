import { defineComponent, ref, onMounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import './State.less'

export default defineComponent({
  name: 'State',
  setup() {
    const engine = useEngine()
    
    // 状态演示数据
    const stateKey = ref('user.profile.name')
    const stateValue = ref('张三')
    const stateHistory = ref<string[]>([])
    
    // 预设状态数据
    const presetStates = ref([
      { key: 'user.profile.name', value: '张三', type: 'string' },
      { key: 'user.profile.age', value: 25, type: 'number' },
      { key: 'user.settings.theme', value: 'dark', type: 'string' },
      { key: 'app.config.debug', value: true, type: 'boolean' },
      { key: 'cart.items', value: [], type: 'array' },
    ])

    // 添加历史记录
    function addHistory(message: string) {
      stateHistory.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
      if (stateHistory.value.length > 20) {
        stateHistory.value = stateHistory.value.slice(0, 20)
      }
    }

    // 设置状态
    function setState() {
      if (!stateKey.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 设置失败',
            message: '请输入状态键名',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.state) {
        let value: any = stateValue.value
        
        // 尝试解析JSON
        try {
          if (stateValue.value.startsWith('{') || stateValue.value.startsWith('[')) {
            value = JSON.parse(stateValue.value)
          } else if (stateValue.value === 'true' || stateValue.value === 'false') {
            value = stateValue.value === 'true'
          } else if (!isNaN(Number(stateValue.value))) {
            value = Number(stateValue.value)
          }
        } catch (e) {
          // 保持字符串值
        }

        engine.state.set(stateKey.value, value)
        addHistory(`设置状态: ${stateKey.value} = ${JSON.stringify(value)}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '✅ 状态设置成功',
            message: `${stateKey.value} = ${JSON.stringify(value)}`,
            type: 'success',
            duration: 2000,
          })
        }
      }
    }

    // 获取状态
    function getState() {
      if (!stateKey.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 获取失败',
            message: '请输入状态键名',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.state) {
        const value = engine.state.get(stateKey.value)
        stateValue.value = typeof value === 'object' ? JSON.stringify(value) : String(value)
        addHistory(`获取状态: ${stateKey.value} = ${JSON.stringify(value)}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '✅ 状态获取成功',
            message: `值: ${JSON.stringify(value)}`,
            type: 'success',
            duration: 2000,
          })
        }
      }
    }

    // 删除状态
    function deleteState() {
      if (!stateKey.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 删除失败',
            message: '请输入状态键名',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.state) {
        engine.state.delete(stateKey.value)
        addHistory(`删除状态: ${stateKey.value}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '🗑️ 状态已删除',
            message: `键: ${stateKey.value}`,
            type: 'warning',
            duration: 2000,
          })
        }
      }
    }

    // 设置预设状态
    function setPresetState(preset: any) {
      stateKey.value = preset.key
      stateValue.value = typeof preset.value === 'object' ? JSON.stringify(preset.value) : String(preset.value)
      setState()
    }

    // 清空历史
    function clearHistory() {
      stateHistory.value = []
    }

    // 监听状态变化
    function watchState() {
      if (!stateKey.value) {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 监听失败',
            message: '请输入状态键名',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      if (engine?.state) {
        const unwatch = engine.state.watch(stateKey.value, (newValue: any, oldValue: any) => {
          addHistory(`状态变化: ${stateKey.value} 从 ${JSON.stringify(oldValue)} 变为 ${JSON.stringify(newValue)}`)
        })
        
        addHistory(`开始监听状态: ${stateKey.value}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '👁️ 开始监听状态',
            message: `正在监听: ${stateKey.value}`,
            type: 'info',
            duration: 2000,
          })
        }

        // 5秒后自动取消监听
        setTimeout(() => {
          unwatch()
          addHistory(`停止监听状态: ${stateKey.value}`)
        }, 5000)
      }
    }

    onMounted(() => {
      // 初始化一些预设状态
      if (engine?.state) {
        presetStates.value.forEach(preset => {
          engine.state.set(preset.key, preset.value)
        })
      }
      
      addHistory('状态管理系统初始化完成')
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '📊 状态管理',
          message: '状态管理演示已初始化',
          type: 'info',
          duration: 3000,
        })
      }
    })

    return () => (
      <div class="state">
        <div class="page-header">
          <h1 class="page-title">📊 状态管理演示</h1>
          <p class="page-description">
            展示 Engine 的响应式状态管理系统，支持嵌套状态、状态监听、状态持久化
          </p>
        </div>

        <div class="state-layout">
          {/* 控制面板 */}
          <div class="control-panel">
            <div class="panel-section">
              <h3>🎛️ 状态操作</h3>
              <div class="input-group">
                <label>状态键名 (支持嵌套路径):</label>
                <input
                  type="text"
                  v-model={stateKey.value}
                  placeholder="例如: user.profile.name"
                  class="input-field"
                />
              </div>
              <div class="input-group">
                <label>状态值 (支持JSON格式):</label>
                <textarea
                  v-model={stateValue.value}
                  placeholder="输入状态值，支持字符串、数字、布尔值、JSON对象"
                  class="textarea-field"
                  rows={3}
                />
              </div>
              <div class="control-group">
                <button class="btn btn-primary" onClick={setState}>
                  设置状态
                </button>
                <button class="btn btn-secondary" onClick={getState}>
                  获取状态
                </button>
                <button class="btn btn-info" onClick={watchState}>
                  监听状态
                </button>
                <button class="btn btn-danger" onClick={deleteState}>
                  删除状态
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>📋 预设状态</h3>
              <div class="preset-list">
                {presetStates.value.map((preset, index) => (
                  <div key={index} class="preset-item">
                    <div class="preset-info">
                      <span class="preset-key">{preset.key}</span>
                      <span class={`preset-type type-${preset.type}`}>
                        {preset.type}
                      </span>
                    </div>
                    <div class="preset-value">
                      {typeof preset.value === 'object' ? JSON.stringify(preset.value) : String(preset.value)}
                    </div>
                    <button 
                      class="btn btn-sm btn-outline"
                      onClick={() => setPresetState(preset)}
                    >
                      使用
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 信息面板 */}
          <div class="info-panel">
            <div class="logs-section">
              <div class="logs-header">
                <h3>📝 状态操作日志</h3>
                <button class="btn btn-sm btn-outline" onClick={clearHistory}>
                  清空日志
                </button>
              </div>
              <div class="logs-container">
                {stateHistory.value.length === 0 ? (
                  <div class="empty-logs">暂无操作日志...</div>
                ) : (
                  stateHistory.value.map((log, index) => (
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
