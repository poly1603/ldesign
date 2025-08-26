import { defineComponent, ref, onMounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import './Middleware.less'

export default defineComponent({
  name: 'Middleware',
  setup() {
    const engine = useEngine()
    const middlewareLogs = ref<string[]>([])
    const requestData = ref('{"method":"GET","url":"/api/users","headers":{}}')

    // 中间件列表
    const middlewares = ref([
      {
        id: 'logger',
        name: '日志中间件',
        description: '记录请求和响应信息',
        enabled: true,
        priority: 1,
      },
      {
        id: 'auth',
        name: '认证中间件',
        description: '验证用户身份和权限',
        enabled: true,
        priority: 2,
      },
      {
        id: 'cache',
        name: '缓存中间件',
        description: '缓存响应数据提高性能',
        enabled: false,
        priority: 3,
      },
      {
        id: 'rate-limit',
        name: '限流中间件',
        description: '限制请求频率防止滥用',
        enabled: true,
        priority: 4,
      },
    ])

    // 添加日志
    function addLog(message: string) {
      middlewareLogs.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
      if (middlewareLogs.value.length > 30) {
        middlewareLogs.value = middlewareLogs.value.slice(0, 30)
      }
    }

    // 模拟请求处理
    function processRequest() {
      try {
        const request = JSON.parse(requestData.value)
        addLog(`开始处理请求: ${request.method} ${request.url}`)

        // 模拟中间件处理
        const enabledMiddlewares = middlewares.value
          .filter(m => m.enabled)
          .sort((a, b) => a.priority - b.priority)

        enabledMiddlewares.forEach(middleware => {
          addLog(`执行中间件: ${middleware.name}`)
          
          // 模拟中间件逻辑
          switch (middleware.id) {
            case 'logger':
              addLog(`  - 记录请求日志: ${request.method} ${request.url}`)
              break
            case 'auth':
              addLog(`  - 验证用户权限: 通过`)
              break
            case 'cache':
              addLog(`  - 检查缓存: 未命中`)
              break
            case 'rate-limit':
              addLog(`  - 检查限流: 通过`)
              break
          }
        })

        addLog(`请求处理完成: 200 OK`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '✅ 请求处理成功',
            message: `${request.method} ${request.url}`,
            type: 'success',
            duration: 2000,
          })
        }
      } catch (error) {
        addLog(`请求处理失败: ${error}`)
        
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 请求处理失败',
            message: '请检查请求数据格式',
            type: 'error',
            duration: 3000,
          })
        }
      }
    }

    // 切换中间件状态
    function toggleMiddleware(middleware: any) {
      middleware.enabled = !middleware.enabled
      const action = middleware.enabled ? '启用' : '禁用'
      addLog(`${action}中间件: ${middleware.name}`)
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: `${middleware.enabled ? '✅' : '⏸️'} 中间件${action}`,
          message: middleware.name,
          type: middleware.enabled ? 'success' : 'info',
          duration: 2000,
        })
      }
    }

    // 清空日志
    function clearLogs() {
      middlewareLogs.value = []
    }

    // 重置请求数据
    function resetRequestData() {
      requestData.value = '{"method":"GET","url":"/api/users","headers":{}}'
    }

    onMounted(() => {
      addLog('中间件系统初始化完成')
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🔄 中间件系统',
          message: '中间件演示已初始化',
          type: 'info',
          duration: 3000,
        })
      }
    })

    return () => (
      <div class="middleware">
        <div class="page-header">
          <h1 class="page-title">🔄 中间件系统演示</h1>
          <p class="page-description">
            展示 Engine 的中间件机制，支持请求处理、错误捕获、性能监控等功能
          </p>
        </div>

        <div class="middleware-layout">
          {/* 控制面板 */}
          <div class="control-panel">
            <div class="panel-section">
              <h3>🎛️ 请求模拟</h3>
              <div class="input-group">
                <label>请求数据 (JSON格式):</label>
                <textarea
                  v-model={requestData.value}
                  class="textarea-field"
                  rows={6}
                  placeholder="输入请求数据"
                />
              </div>
              <div class="control-group">
                <button class="btn btn-primary" onClick={processRequest}>
                  处理请求
                </button>
                <button class="btn btn-outline" onClick={resetRequestData}>
                  重置数据
                </button>
              </div>
            </div>

            <div class="panel-section">
              <h3>⚙️ 中间件配置</h3>
              <div class="middleware-list">
                {middlewares.value.map(middleware => (
                  <div key={middleware.id} class={`middleware-item ${middleware.enabled ? 'enabled' : 'disabled'}`}>
                    <div class="middleware-info">
                      <div class="middleware-header">
                        <span class="middleware-name">{middleware.name}</span>
                        <span class="middleware-priority">优先级: {middleware.priority}</span>
                      </div>
                      <p class="middleware-description">{middleware.description}</p>
                    </div>
                    <div class="middleware-actions">
                      <button
                        class={`btn btn-sm ${middleware.enabled ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleMiddleware(middleware)}
                      >
                        {middleware.enabled ? '禁用' : '启用'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 信息面板 */}
          <div class="info-panel">
            <div class="logs-section">
              <div class="logs-header">
                <h3>📝 处理日志</h3>
                <button class="btn btn-sm btn-outline" onClick={clearLogs}>
                  清空日志
                </button>
              </div>
              <div class="logs-container">
                {middlewareLogs.value.length === 0 ? (
                  <div class="empty-logs">暂无处理日志...</div>
                ) : (
                  middlewareLogs.value.map((log, index) => (
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
