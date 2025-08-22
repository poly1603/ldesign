<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, ref } from 'vue'

// 使用引擎组合式API
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
])

// 插件注册历史
const pluginHistory = ref([
  {
    id: 1,
    action: '安装',
    plugin: 'demo-logger',
    timestamp: new Date(Date.now() - 3600000).toLocaleString(),
    status: 'success',
  },
  {
    id: 2,
    action: '启用',
    plugin: 'demo-cache',
    timestamp: new Date(Date.now() - 1800000).toLocaleString(),
    status: 'success',
  },
])

// 新插件信息
const newPlugin = ref({
  name: '',
  description: '',
})

// 计算属性
const installedPlugins = computed(() =>
  plugins.value.filter(p => p.status === 'installed')
)

const enabledPlugins = computed(() =>
  plugins.value.filter(p => p.enabled)
)

// 安装插件
function installPlugin(pluginId: string) {
  const plugin = plugins.value.find(p => p.id === pluginId)
  if (plugin) {
    plugin.status = 'installed'
    plugin.enabled = true
    
    // 添加到历史记录
    pluginHistory.value.unshift({
      id: Date.now(),
      action: '安装',
      plugin: plugin.name,
      timestamp: new Date().toLocaleString(),
      status: 'success',
    })

    // 显示通知
    engine?.notifications.show({
      title: '✅ 插件安装成功',
      message: `${plugin.name} 已成功安装并启用`,
      type: 'success',
    })
  }
}

// 卸载插件
function uninstallPlugin(pluginId: string) {
  const plugin = plugins.value.find(p => p.id === pluginId)
  if (plugin) {
    plugin.status = 'available'
    plugin.enabled = false
    
    // 添加到历史记录
    pluginHistory.value.unshift({
      id: Date.now(),
      action: '卸载',
      plugin: plugin.name,
      timestamp: new Date().toLocaleString(),
      status: 'success',
    })

    // 显示通知
    engine?.notifications.show({
      title: '🗑️ 插件卸载成功',
      message: `${plugin.name} 已成功卸载`,
      type: 'info',
    })
  }
}

// 启用/禁用插件
function togglePlugin(pluginId: string) {
  const plugin = plugins.value.find(p => p.id === pluginId)
  if (plugin && plugin.status === 'installed') {
    plugin.enabled = !plugin.enabled
    
    // 添加到历史记录
    pluginHistory.value.unshift({
      id: Date.now(),
      action: plugin.enabled ? '启用' : '禁用',
      plugin: plugin.name,
      timestamp: new Date().toLocaleString(),
      status: 'success',
    })

    // 显示通知
    engine?.notifications.show({
      title: plugin.enabled ? '✅ 插件已启用' : '⏸️ 插件已禁用',
      message: `${plugin.name} 已${plugin.enabled ? '启用' : '禁用'}`,
      type: plugin.enabled ? 'success' : 'warning',
    })
  }
}

// 创建新插件
function createPlugin() {
  if (!newPlugin.value.name || !newPlugin.value.description) {
    engine?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写插件名称和描述',
      type: 'error',
    })
    return
  }

  const plugin = {
    id: `custom-${Date.now()}`,
    name: newPlugin.value.name,
    description: newPlugin.value.description,
    status: 'installed' as const,
    version: '1.0.0',
    enabled: true,
  }

  plugins.value.push(plugin)
  
  // 重置表单
  newPlugin.value = { name: '', description: '' }

  // 显示通知
  engine?.notifications.show({
    title: '🎉 插件创建成功',
    message: `${plugin.name} 已成功创建并安装`,
    type: 'success',
  })
}

// 演示插件热重载
function demoHotReload() {
  engine?.notifications.show({
    title: '🔄 热重载演示',
    message: '正在重载所有插件...',
    type: 'info',
  })

  // 模拟重载过程
  setTimeout(() => {
    engine?.notifications.show({
      title: '✅ 热重载完成',
      message: '所有插件已成功重载',
      type: 'success',
    })
  }, 2000)
}

// 组件挂载
onMounted(() => {
  // 记录日志
  engine?.logger.info('插件管理页面已加载')
})
</script>

<template>
  <div class="plugins">
    <div class="page-header">
      <h1>🔌 插件系统</h1>
      <p>管理和控制应用插件，支持动态安装、卸载和热重载</p>
    </div>

    <!-- 插件统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔌</div>
        <div class="stat-content">
          <div class="stat-value">{{ plugins.length }}</div>
          <div class="stat-label">总插件数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ installedPlugins.length }}</div>
          <div class="stat-label">已安装</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⚡</div>
        <div class="stat-content">
          <div class="stat-value">{{ enabledPlugins.length }}</div>
          <div class="stat-label">已启用</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <button class="reload-btn" @click="demoHotReload">
            热重载
          </button>
        </div>
      </div>
    </div>

    <!-- 插件列表 -->
    <div class="section">
      <h2>📦 插件列表</h2>
      <div class="plugins-grid">
        <div v-for="plugin in plugins" :key="plugin.id" class="plugin-card">
          <div class="plugin-header">
            <div class="plugin-info">
              <h3 class="plugin-name">{{ plugin.name }}</h3>
              <span class="plugin-version">v{{ plugin.version }}</span>
            </div>
            <div class="plugin-status">
              <span :class="['status-badge', plugin.status]">
                {{ plugin.status === 'installed' ? '已安装' : '可用' }}
              </span>
            </div>
          </div>
          <p class="plugin-description">{{ plugin.description }}</p>
          <div class="plugin-actions">
            <template v-if="plugin.status === 'installed'">
              <button 
                :class="['btn', 'btn-sm', plugin.enabled ? 'btn-warning' : 'btn-success']"
                @click="togglePlugin(plugin.id)"
              >
                {{ plugin.enabled ? '禁用' : '启用' }}
              </button>
              <button class="btn btn-sm btn-danger" @click="uninstallPlugin(plugin.id)">
                卸载
              </button>
            </template>
            <template v-else>
              <button class="btn btn-sm btn-primary" @click="installPlugin(plugin.id)">
                安装
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新插件 -->
    <div class="section">
      <h2>➕ 创建新插件</h2>
      <div class="create-plugin">
        <div class="form-group">
          <label>插件名称</label>
          <input 
            v-model="newPlugin.name" 
            type="text" 
            placeholder="输入插件名称"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>插件描述</label>
          <textarea 
            v-model="newPlugin.description" 
            placeholder="输入插件描述"
            class="form-textarea"
          />
        </div>
        <button class="btn btn-primary" @click="createPlugin">
          🎉 创建插件
        </button>
      </div>
    </div>

    <!-- 操作历史 -->
    <div class="section">
      <h2>📋 操作历史</h2>
      <div class="history-list">
        <div v-for="item in pluginHistory" :key="item.id" class="history-item">
          <div class="history-content">
            <span class="history-action">{{ item.action }}</span>
            <span class="history-plugin">{{ item.plugin }}</span>
            <span class="history-time">{{ item.timestamp }}</span>
          </div>
          <div :class="['history-status', item.status]">
            {{ item.status === 'success' ? '✅' : '❌' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plugins {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.reload-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.reload-btn:hover {
  background: #5a6fd8;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.plugin-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.plugin-card:hover {
  transform: translateY(-2px);
}

.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.plugin-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plugin-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0;
}

.plugin-version {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.status-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status-badge.installed {
  background: #d4edda;
  color: #155724;
}

.status-badge.available {
  background: #e2e3e5;
  color: #383d41;
}

.plugin-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.plugin-actions {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.create-plugin {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.history-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.history-action {
  font-weight: bold;
  color: #667eea;
}

.history-plugin {
  color: #2c3e50;
}

.history-time {
  color: #666;
  font-size: 0.9rem;
}

.history-status {
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .plugins-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .plugin-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .history-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
