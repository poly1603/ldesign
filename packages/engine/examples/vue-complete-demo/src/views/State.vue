<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, ref, watch } from 'vue'

// 使用引擎组合式API
const engine = useEngine()

// 状态管理演示数据
const stateDemo = ref({
  user: {
    id: 1,
    name: 'Vue开发者',
    email: 'developer@vue.com',
    avatar: '👨‍💻',
    preferences: {
      theme: 'dark',
      language: 'zh-CN',
      notifications: true,
    },
  },
  settings: {
    debug: true,
    autoSave: true,
    maxHistory: 50,
  },
  counters: {
    clicks: 0,
    visits: 23,
    actions: 156,
  },
})

// 状态历史记录
const stateHistory = ref<Array<{ id: number; action: string; description: string; timestamp: string }>>([])

// 状态监听器
const watchers = ref<Array<{ id: string; path: string; active: boolean; description: string }>>([
  {
    id: 'user-watcher',
    path: 'user.name',
    active: true,
    description: '监听用户名变化',
  },
  {
    id: 'theme-watcher',
    path: 'user.preferences.theme',
    active: true,
    description: '监听主题变化',
  },
  {
    id: 'counter-watcher',
    path: 'counters.clicks',
    active: false,
    description: '监听点击计数变化',
  },
])

// 新状态表单
const newState = ref<{ key: string; value: string; type: 'string' | 'number' | 'boolean' | 'object' | 'array' }>({
  key: '',
  value: '',
  type: 'string',
})

// 计算属性
const allStates = computed(() => {
  const states: Array<{ key: string; value: string; type: string }> = []
  
  function flattenObject(obj: any, prefix = '') {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flattenObject(value, fullKey)
      } else {
        states.push({
          key: fullKey,
          value: JSON.stringify(value),
          type: typeof value,
        })
      }
    }
  }
  
  flattenObject(stateDemo.value)
  return states
})

// 初始化状态到引擎
function initializeState() {
  if ((engine as any)?.state) {
    // 设置初始状态
    ;(engine as any).state.set('demo', stateDemo.value)
    
    // 设置监听器
    watchers.value.forEach(watcher => {
      if (watcher.active) {
        setupWatcher(watcher)
      }
    })
    
    addHistoryEntry('初始化', '设置初始状态数据')
  }
}

// 设置状态监听器
function setupWatcher(watcher: { id: string; path: string; active: boolean; description: string }) {
  if ((engine as any)?.state) {
    ;(engine as any).state.watch(`demo.${watcher.path}`, (newValue: any, oldValue: any) => {
      addHistoryEntry('状态变化', `${watcher.path}: ${oldValue} → ${newValue}`)
      
      // 显示通知
      engine?.notifications.show({
        title: '📊 状态变化监听',
        message: `${watcher.description}: ${JSON.stringify(newValue)}`,
        type: 'info',
        duration: 3000,
      })
    })
  }
}

// 切换监听器
function toggleWatcher(watcherId: string) {
  const watcher = watchers.value.find(w => w.id === watcherId)
  if (watcher) {
    watcher.active = !watcher.active
    
    if (watcher.active) {
      setupWatcher(watcher)
      addHistoryEntry('监听器启用', `启用 ${watcher.description}`)
    } else {
      addHistoryEntry('监听器禁用', `禁用 ${watcher.description}`)
    }
    
    // 显示通知
    engine?.notifications.show({
      title: watcher.active ? '👁️ 监听器已启用' : '🙈 监听器已禁用',
      message: watcher.description,
      type: watcher.active ? 'success' : 'warning',
    })
  }
}

// 更新状态
function updateState(path: string, value: any) {
  const keys = path.split('.')
  let current = stateDemo.value
  
  // 导航到目标对象
  for (let i = 0; i < keys.length - 1; i++) {
    const k: any = keys[i]
    if (!(current as any)[k]) {
      ;(current as any)[k] = {}
    }
    current = (current as any)[k]
  }
  
  // 设置值
  const lastKey: any = keys[keys.length - 1]
  const oldValue = (current as any)[lastKey]
  ;(current as any)[lastKey] = value
  
  // 同步到引擎状态
  if ((engine as any)?.state) {
    ;(engine as any).state.set('demo', stateDemo.value)
  }
  
  addHistoryEntry('状态更新', `${path}: ${oldValue} → ${value}`)
}

// 增加计数器
function incrementCounter(counter: keyof typeof stateDemo.value.counters) {
  updateState(`counters.${counter}`, stateDemo.value.counters[counter] + 1)
}

// 切换主题
function toggleTheme() {
  const newTheme = stateDemo.value.user.preferences.theme === 'dark' ? 'light' : 'dark'
  updateState('user.preferences.theme', newTheme)
}

// 切换设置
function toggleSetting(setting: keyof typeof stateDemo.value.settings) {
  updateState(`settings.${setting}`, !stateDemo.value.settings[setting])
}

// 创建新状态
function createNewState() {
  if (!newState.value.key || !newState.value.value) {
    engine?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写状态键和值',
      type: 'error',
    })
    return
  }
  
  let value: any = newState.value.value
  
  // 根据类型转换值
  try {
    switch (newState.value.type) {
      case 'number':
        value = Number(value as any) as any
        break
      case 'boolean':
        value = (value as any) === 'true' as any
        break
      case 'object':
        value = JSON.parse(value)
        break
      case 'array':
        value = JSON.parse(value)
        break
    }
  } catch (error) {
    engine?.notifications.show({
      title: '❌ 值格式错误',
      message: '请输入有效的JSON格式',
      type: 'error',
    })
    return
  }
  
  updateState(newState.value.key, value)
  
  // 重置表单
  newState.value = { key: '', value: '', type: 'string' }
  
  // 显示通知
  engine?.notifications.show({
    title: '✅ 状态创建成功',
    message: `新状态 ${newState.value.key} 已创建`,
    type: 'success',
  })
}

// 重置所有状态
function resetState() {
  stateDemo.value = {
    user: {
      id: 1,
      name: 'Vue开发者',
      email: 'developer@vue.com',
      avatar: '👨‍💻',
      preferences: {
        theme: 'dark',
        language: 'zh-CN',
        notifications: true,
      },
    },
    settings: {
      debug: true,
      autoSave: true,
      maxHistory: 50,
    },
    counters: {
      clicks: 0,
      visits: 23,
      actions: 156,
    },
  }
  
  // 同步到引擎
  if ((engine as any)?.state) {
    ;(engine as any).state.set('demo', stateDemo.value)
  }
  
  addHistoryEntry('状态重置', '重置所有状态到初始值')
  
  // 显示通知
  engine?.notifications.show({
    title: '🔄 状态已重置',
    message: '所有状态已重置到初始值',
    type: 'info',
  })
}

// 导出状态
function exportState() {
  const stateJson = JSON.stringify(stateDemo.value, null, 2)
  
  // 创建下载链接
  const blob = new Blob([stateJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'state-export.json'
  a.click()
  
  URL.revokeObjectURL(url)
  
  addHistoryEntry('状态导出', '导出当前状态到JSON文件')
  
  // 显示通知
  engine?.notifications.show({
    title: '📁 状态导出成功',
    message: '状态已导出到JSON文件',
    type: 'success',
  })
}

// 添加历史记录
function addHistoryEntry(action: string, description: string) {
  stateHistory.value.unshift({
    id: Date.now(),
    action,
    description,
    timestamp: new Date().toLocaleString(),
  })
  
  // 限制历史记录数量
  if (stateHistory.value.length > 50) {
    stateHistory.value = stateHistory.value.slice(0, 50)
  }
}

// 清除历史记录
function clearHistory() {
  stateHistory.value = []
  
  engine?.notifications.show({
    title: '🗑️ 历史记录已清除',
    message: '所有状态历史记录已清除',
    type: 'info',
  })
}

// 演示状态持久化
function demoPersistence() {
  // 模拟保存到localStorage
  localStorage.setItem('demo-state', JSON.stringify(stateDemo.value))
  
  addHistoryEntry('状态持久化', '状态已保存到localStorage')
  
  engine?.notifications.show({
    title: '💾 状态持久化演示',
    message: '状态已保存到本地存储',
    type: 'success',
  })
}

// 组件挂载
onMounted(() => {
  initializeState()
  engine?.logger.info('状态管理页面已加载')
})

// 监听状态变化
watch(stateDemo, (newValue) => {
  // 同步到引擎状态
  if ((engine as any)?.state) {
    ;(engine as any).state.set('demo', newValue)
  }
}, { deep: true })
</script>

<template>
  <div class="state">
    <div class="page-header">
      <h1>📊 状态管理</h1>
      <p>演示响应式状态管理、状态监听、状态持久化等功能</p>
    </div>

    <!-- 状态统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-value">{{ allStates.length }}</div>
          <div class="stat-label">状态数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-content">
          <div class="stat-value">{{ watchers.filter(w => w.active).length }}</div>
          <div class="stat-label">活跃监听器</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ stateHistory.length }}</div>
          <div class="stat-label">历史记录</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">💾</div>
        <div class="stat-content">
          <button class="persist-btn" @click="demoPersistence">
            持久化
          </button>
        </div>
      </div>
    </div>

    <!-- 用户状态演示 -->
    <div class="section">
      <h2>👤 用户状态演示</h2>
      <div class="user-demo">
        <div class="user-info">
          <div class="user-avatar">{{ stateDemo.user.avatar }}</div>
          <div class="user-details">
            <h3>{{ stateDemo.user.name }}</h3>
            <p>{{ stateDemo.user.email }}</p>
            <div class="user-preferences">
              <span class="preference-item">
                🎨 主题: {{ stateDemo.user.preferences.theme }}
              </span>
              <span class="preference-item">
                🌍 语言: {{ stateDemo.user.preferences.language }}
              </span>
              <span class="preference-item">
                🔔 通知: {{ stateDemo.user.preferences.notifications ? '开启' : '关闭' }}
              </span>
            </div>
          </div>
        </div>
        <div class="user-actions">
          <input 
            v-model="stateDemo.user.name" 
            type="text" 
            placeholder="用户名"
            class="form-input"
          >
          <input 
            v-model="stateDemo.user.email" 
            type="email" 
            placeholder="邮箱"
            class="form-input"
          >
          <button class="btn btn-primary" @click="toggleTheme">
            切换主题
          </button>
        </div>
      </div>
    </div>

    <!-- 计数器演示 -->
    <div class="section">
      <h2>🔢 计数器演示</h2>
      <div class="counters-grid">
        <div v-for="(value, key) in stateDemo.counters" :key="key" class="counter-card">
          <div class="counter-icon">
            {{ key === 'clicks' ? '👆' : key === 'visits' ? '👁️' : '⚡' }}
          </div>
          <div class="counter-info">
            <div class="counter-label">{{ key }}</div>
            <div class="counter-value">{{ value }}</div>
          </div>
          <button class="counter-btn" @click="incrementCounter(key)">
            ➕
          </button>
        </div>
      </div>
    </div>

    <!-- 设置演示 -->
    <div class="section">
      <h2>⚙️ 设置演示</h2>
      <div class="settings-grid">
        <div v-for="(value, key) in stateDemo.settings" :key="key" class="setting-item">
          <div class="setting-info">
            <div class="setting-label">{{ key }}</div>
            <div class="setting-description">
              {{ key === 'debug' ? '调试模式' : key === 'autoSave' ? '自动保存' : '最大历史记录' }}
            </div>
          </div>
          <div class="setting-control">
            <template v-if="typeof value === 'boolean'">
              <button 
                :class="['toggle-btn', value ? 'active' : 'inactive']"
                @click="toggleSetting(key)"
              >
                {{ value ? '✅' : '❌' }}
              </button>
            </template>
            <template v-else>
              <input 
                v-model="stateDemo.settings[key]" 
                type="number" 
                class="form-input setting-input"
              >
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态监听器 -->
    <div class="section">
      <h2>👁️ 状态监听器</h2>
      <div class="watchers-grid">
        <div v-for="watcher in watchers" :key="watcher.id" class="watcher-card">
          <div class="watcher-info">
            <div class="watcher-path">{{ watcher.path }}</div>
            <div class="watcher-description">{{ watcher.description }}</div>
          </div>
          <div class="watcher-control">
            <button 
              :class="['watcher-toggle', watcher.active ? 'active' : 'inactive']"
              @click="toggleWatcher(watcher.id)"
            >
              {{ watcher.active ? '👁️' : '🙈' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新状态 -->
    <div class="section">
      <h2>➕ 创建新状态</h2>
      <div class="create-state">
        <div class="form-row">
          <div class="form-group">
            <label>状态键</label>
            <input 
              v-model="newState.key" 
              type="text" 
              placeholder="例如: user.age"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>数据类型</label>
            <select v-model="newState.type" class="form-select">
              <option value="string">字符串</option>
              <option value="number">数字</option>
              <option value="boolean">布尔值</option>
              <option value="object">对象</option>
              <option value="array">数组</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>状态值</label>
          <textarea 
            v-model="newState.value" 
            :placeholder="newState.type === 'object' || newState.type === 'array' ? 'JSON格式' : '输入值'"
            class="form-textarea"
          />
        </div>
        <button class="btn btn-primary" @click="createNewState">
          🎉 创建状态
        </button>
      </div>
    </div>

    <!-- 所有状态列表 -->
    <div class="section">
      <div class="section-header">
        <h2>📋 所有状态</h2>
        <div class="section-actions">
          <button class="btn btn-sm btn-secondary" @click="exportState">
            📁 导出
          </button>
          <button class="btn btn-sm btn-warning" @click="resetState">
            🔄 重置
          </button>
        </div>
      </div>
      
      <div class="states-table">
        <div class="table-header">
          <div class="table-col">状态键</div>
          <div class="table-col">值</div>
          <div class="table-col">类型</div>
        </div>
        <div v-for="state in allStates" :key="state.key" class="table-row">
          <div class="table-col state-key">{{ state.key }}</div>
          <div class="table-col state-value">{{ state.value }}</div>
          <div class="table-col state-type">
            <span :class="['type-badge', state.type]">{{ state.type }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 状态历史 -->
    <div class="section">
      <div class="section-header">
        <h2>📚 状态历史</h2>
        <button class="btn btn-sm btn-secondary" @click="clearHistory">
          🗑️ 清除历史
        </button>
      </div>
      
      <div class="history-container">
        <div v-if="stateHistory.length === 0" class="empty-history">
          <div class="empty-icon">📚</div>
          <p>暂无历史记录</p>
        </div>
        
        <div v-for="entry in stateHistory.slice(0, 20)" :key="entry.id" class="history-item">
          <div class="history-content">
            <div class="history-action">{{ entry.action }}</div>
            <div class="history-description">{{ entry.description }}</div>
            <div class="history-time">{{ entry.timestamp }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.state {
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

.persist-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.persist-btn:hover {
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
}

.user-demo {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  font-size: 3rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 50%;
}

.user-details h3 {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.user-details p {
  color: #666;
  margin: 0 0 1rem 0;
}

.user-preferences {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.preference-item {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 200px;
}

.counters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.counter-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.counter-icon {
  font-size: 2rem;
}

.counter-info {
  flex: 1;
}

.counter-label {
  color: #666;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.counter-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.counter-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
}

.counter-btn:hover {
  background: #218838;
}

.settings-grid {
  display: grid;
  gap: 1rem;
}

.setting-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: bold;
  color: #2c3e50;
  text-transform: capitalize;
}

.setting-description {
  color: #666;
  font-size: 0.9rem;
}

.setting-control {
  display: flex;
  align-items: center;
}

.toggle-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.toggle-btn:hover {
  transform: scale(1.1);
}

.setting-input {
  width: 80px;
}

.watchers-grid {
  display: grid;
  gap: 1rem;
}

.watcher-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.watcher-info {
  flex: 1;
}

.watcher-path {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #667eea;
  font-weight: bold;
}

.watcher-description {
  color: #666;
  font-size: 0.9rem;
}

.watcher-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.watcher-toggle:hover {
  transform: scale(1.1);
}

.create-state {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
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
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.states-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  font-weight: bold;
  color: #2c3e50;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.table-row:last-child {
  border-bottom: none;
}

.table-col {
  display: flex;
  align-items: center;
}

.state-key {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #667eea;
  font-weight: bold;
}

.state-value {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  color: #2c3e50;
  word-break: break-all;
}

.type-badge {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.type-badge.string {
  background: #d1ecf1;
  color: #0c5460;
}

.type-badge.number {
  background: #d4edda;
  color: #155724;
}

.type-badge.boolean {
  background: #f8d7da;
  color: #721c24;
}

.type-badge.object {
  background: #e2e3e5;
  color: #383d41;
}

.type-badge.array {
  background: #fff3cd;
  color: #856404;
}

.history-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.history-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.history-item:last-child {
  border-bottom: none;
}

.history-action {
  font-weight: bold;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.history-description {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.history-time {
  color: #666;
  font-size: 0.9rem;
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

@media (max-width: 768px) {
  .user-demo {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .counters-grid {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
