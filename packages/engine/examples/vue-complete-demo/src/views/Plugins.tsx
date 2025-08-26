import { defineComponent, ref, onMounted } from 'vue'
import { useEngine } from '@ldesign/engine/vue'
import './Plugins.less'

export default defineComponent({
  name: 'Plugins',
  setup() {
    const engine = useEngine()

    // 插件列表
    const plugins = ref([
      {
        id: 'demo-logger',
        name: '演示日志插件',
        description: '记录应用的各种操作日志',
        status: 'installed',
        version: '1.0.0',
        enabled: true,
      },
      {
        id: 'demo-analytics',
        name: '演示分析插件',
        description: '收集用户行为数据进行分析',
        status: 'available',
        version: '2.1.0',
        enabled: false,
      },
      {
        id: 'demo-cache',
        name: '演示缓存插件',
        description: '提供智能缓存功能优化性能',
        status: 'installed',
        version: '1.5.0',
        enabled: true,
      },
      {
        id: 'demo-security',
        name: '演示安全插件',
        description: '提供XSS防护和输入验证功能',
        status: 'available',
        version: '1.2.0',
        enabled: false,
      },
    ])

    // 插件操作历史
    const pluginHistory = ref<string[]>([])

    // 添加历史记录
    function addHistory(message: string) {
      pluginHistory.value.unshift(`[${new Date().toLocaleTimeString()}] ${message}`)
      if (pluginHistory.value.length > 20) {
        pluginHistory.value = pluginHistory.value.slice(0, 20)
      }
    }

    // 安装插件
    function installPlugin(plugin: any) {
      plugin.status = 'installed'
      plugin.enabled = true
      addHistory(`安装插件: ${plugin.name} v${plugin.version}`)
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '✅ 插件安装成功',
          message: `${plugin.name} 已安装并启用`,
          type: 'success',
          duration: 3000,
        })
      }
    }

    // 卸载插件
    function uninstallPlugin(plugin: any) {
      plugin.status = 'available'
      plugin.enabled = false
      addHistory(`卸载插件: ${plugin.name}`)
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🗑️ 插件已卸载',
          message: `${plugin.name} 已从系统中移除`,
          type: 'warning',
          duration: 3000,
        })
      }
    }

    // 启用/禁用插件
    function togglePlugin(plugin: any) {
      if (plugin.status !== 'installed') {
        if (engine?.notifications) {
          engine.notifications.show({
            title: '❌ 操作失败',
            message: '请先安装插件',
            type: 'error',
            duration: 2000,
          })
        }
        return
      }

      plugin.enabled = !plugin.enabled
      const action = plugin.enabled ? '启用' : '禁用'
      addHistory(`${action}插件: ${plugin.name}`)
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: `${plugin.enabled ? '✅' : '⏸️'} 插件${action}`,
          message: `${plugin.name} 已${action}`,
          type: plugin.enabled ? 'success' : 'info',
          duration: 2000,
        })
      }
    }

    // 创建演示插件
    function createDemoPlugin() {
      const newPlugin = {
        id: `demo-plugin-${Date.now()}`,
        name: `自定义插件 ${plugins.value.length + 1}`,
        description: '这是一个演示用的自定义插件',
        status: 'available',
        version: '1.0.0',
        enabled: false,
      }
      
      plugins.value.push(newPlugin)
      addHistory(`创建新插件: ${newPlugin.name}`)
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🎉 插件创建成功',
          message: `${newPlugin.name} 已添加到插件列表`,
          type: 'success',
          duration: 3000,
        })
      }
    }

    // 清空历史记录
    function clearHistory() {
      pluginHistory.value = []
    }

    // 获取插件统计
    function getPluginStats() {
      const installed = plugins.value.filter(p => p.status === 'installed').length
      const enabled = plugins.value.filter(p => p.enabled).length
      const available = plugins.value.filter(p => p.status === 'available').length
      
      return {
        total: plugins.value.length,
        installed,
        enabled,
        available,
      }
    }

    onMounted(() => {
      addHistory('插件系统初始化完成')
      
      if (engine?.notifications) {
        engine.notifications.show({
          title: '🔌 插件系统',
          message: '插件管理界面已加载',
          type: 'info',
          duration: 3000,
        })
      }
    })

    return () => {
      const stats = getPluginStats()
      
      return (
        <div class="plugins">
          <div class="page-header">
            <h1 class="page-title">🔌 插件系统演示</h1>
            <p class="page-description">
              展示 Engine 的插件管理系统，支持插件安装、卸载、启用、禁用等功能
            </p>
          </div>

          {/* 插件统计 */}
          <div class="stats-section">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                  <div class="stat-value">{stats.total}</div>
                  <div class="stat-label">总插件数</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                  <div class="stat-value">{stats.installed}</div>
                  <div class="stat-label">已安装</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🟢</div>
                <div class="stat-content">
                  <div class="stat-value">{stats.enabled}</div>
                  <div class="stat-label">已启用</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📥</div>
                <div class="stat-content">
                  <div class="stat-value">{stats.available}</div>
                  <div class="stat-label">可安装</div>
                </div>
              </div>
            </div>
          </div>

          <div class="plugins-layout">
            {/* 插件列表 */}
            <div class="plugins-list">
              <div class="section-header">
                <h3>📋 插件列表</h3>
                <button class="btn btn-primary" onClick={createDemoPlugin}>
                  创建演示插件
                </button>
              </div>
              
              <div class="plugins-grid">
                {plugins.value.map(plugin => (
                  <div key={plugin.id} class={`plugin-card ${plugin.status}`}>
                    <div class="plugin-header">
                      <div class="plugin-info">
                        <h4 class="plugin-name">{plugin.name}</h4>
                        <span class="plugin-version">v{plugin.version}</span>
                      </div>
                      <div class="plugin-status">
                        <span class={`status-badge ${plugin.status}`}>
                          {plugin.status === 'installed' ? '已安装' : '可安装'}
                        </span>
                        {plugin.enabled && (
                          <span class="enabled-badge">已启用</span>
                        )}
                      </div>
                    </div>
                    
                    <p class="plugin-description">{plugin.description}</p>
                    
                    <div class="plugin-actions">
                      {plugin.status === 'available' ? (
                        <button 
                          class="btn btn-primary btn-sm"
                          onClick={() => installPlugin(plugin)}
                        >
                          安装
                        </button>
                      ) : (
                        <>
                          <button 
                            class={`btn btn-sm ${plugin.enabled ? 'btn-warning' : 'btn-success'}`}
                            onClick={() => togglePlugin(plugin)}
                          >
                            {plugin.enabled ? '禁用' : '启用'}
                          </button>
                          <button 
                            class="btn btn-danger btn-sm"
                            onClick={() => uninstallPlugin(plugin)}
                          >
                            卸载
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作历史 */}
            <div class="history-panel">
              <div class="section-header">
                <h3>📝 操作历史</h3>
                <button class="btn btn-outline btn-sm" onClick={clearHistory}>
                  清空历史
                </button>
              </div>
              
              <div class="history-list">
                {pluginHistory.value.length === 0 ? (
                  <div class="empty-history">暂无操作历史...</div>
                ) : (
                  pluginHistory.value.map((record, index) => (
                    <div key={index} class="history-item">
                      {record}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }
  },
})
