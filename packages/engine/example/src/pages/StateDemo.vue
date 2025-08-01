<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, onMounted, ref } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const newKey = ref('')
const newValue = ref('')
const getKey = ref('')
const getResult = ref<any>(null)
const removeKey = ref('')
const watchKey = ref('')
const watchers = ref<any[]>([])
const stateLogs = ref<any[]>([])
const allKeys = ref<string[]>([])

// 计算属性
const memoryUsage = computed(() => {
  const stateStr = JSON.stringify(allKeys.value.map(key => ({ [key]: engine.state.get(key) })))
  return Math.round(new Blob([stateStr]).size / 1024 * 100) / 100
})

// 基础状态操作
function setState() {
  if (!newKey.value)
    return

  let value: any = newValue.value

  // 尝试解析JSON
  try {
    value = JSON.parse(newValue.value)
  }
  catch {
    // 保持字符串值
  }

  const oldValue = engine.state.get(newKey.value)
  engine.state.set(newKey.value, value)

  logStateChange('set', newKey.value, value, oldValue)
  updateKeys()

  newKey.value = ''
  newValue.value = ''

  engine.notifications.show({
    type: 'success',
    title: '成功',
    message: `状态 ${newKey.value} 已设置`,
    duration: 2000,
  })
}

function getState() {
  if (!getKey.value)
    return

  getResult.value = engine.state.get(getKey.value)
  logStateChange('get', getKey.value, getResult.value)

  engine.notifications.show({
    type: 'info',
    title: '获取状态',
    message: `键: ${getKey.value}`,
    duration: 2000,
  })
}

function removeState(key?: string) {
  const keyToRemove = key || removeKey.value
  if (!keyToRemove)
    return

  const oldValue = engine.state.get(keyToRemove)
  engine.state.remove(keyToRemove)

  logStateChange('remove', keyToRemove, undefined, oldValue)
  updateKeys()

  if (!key)
    removeKey.value = ''

  engine.notifications.show({
    type: 'warning',
    title: '删除状态',
    message: `状态 ${keyToRemove} 已删除`,
    duration: 2000,
  })
}

// 预设操作
function setUserProfile() {
  const profile = {
    id: 123,
    name: '张三',
    email: 'zhangsan@example.com',
    avatar: 'https://example.com/avatar.jpg',
    preferences: {
      theme: 'dark',
      language: 'zh-CN',
      notifications: true,
    },
  }

  engine.state.set('user.profile', profile)
  logStateChange('set', 'user.profile', profile)
  updateKeys()
}

function setAppSettings() {
  const settings = {
    version: '1.0.0',
    debug: true,
    apiUrl: 'https://api.example.com',
    features: {
      darkMode: true,
      analytics: false,
      beta: true,
    },
  }

  engine.state.set('app.settings', settings)
  logStateChange('set', 'app.settings', settings)
  updateKeys()
}

function updateCounter() {
  const current = engine.state.get('counter', 0) as number
  const newValue = current + 1

  engine.state.set('counter', newValue)
  logStateChange('set', 'counter', newValue, current)
  updateKeys()
}

function setNestedData() {
  const data = {
    level1: {
      level2: {
        level3: {
          value: 'deep nested value',
          timestamp: Date.now(),
        },
      },
    },
  }

  engine.state.set('nested.data', data)
  logStateChange('set', 'nested.data', data)
  updateKeys()
}

function clearAllState() {
  engine.state.clear()
  logStateChange('clear', 'all')
  updateKeys()

  engine.notifications.show({
    type: 'warning',
    title: '清空状态',
    message: '所有状态已清空',
    duration: 2000,
  })
}

// 监听器管理
function addWatcher() {
  if (!watchKey.value)
    return

  const watcherId = Date.now() + Math.random()
  const unwatch = engine.state.watch(watchKey.value, (newValue, oldValue) => {
    logStateChange('watch', watchKey.value, newValue, oldValue)
    engine.logger.info(`状态监听器触发: ${watchKey.value}`, { newValue, oldValue })
  })

  watchers.value.push({
    id: watcherId,
    key: watchKey.value,
    unwatch,
  })

  watchKey.value = ''

  engine.notifications.show({
    type: 'success',
    title: '监听器',
    message: '监听器已添加',
    duration: 2000,
  })
}

function removeWatcher(watcherId: number) {
  const index = watchers.value.findIndex(w => w.id === watcherId)
  if (index > -1) {
    const watcher = watchers.value[index]
    watcher.unwatch()
    watchers.value.splice(index, 1)

    engine.notifications.show({
      type: 'info',
      title: '监听器',
      message: '监听器已移除',
      duration: 2000,
    })
  }
}

function clearWatchers() {
  watchers.value.forEach(watcher => watcher.unwatch())
  watchers.value = []

  engine.notifications.show({
    type: 'info',
    title: '监听器',
    message: '所有监听器已清除',
    duration: 2000,
  })
}

// 命名空间操作
function setUserNamespaceData() {
  const userNamespace = engine.state.namespace('user')
  userNamespace.set('profile.name', '李四')
  userNamespace.set('profile.age', 25)
  userNamespace.set('settings.theme', 'light')

  logStateChange('namespace-set', 'user.*')
  updateKeys()
}

function getUserNamespaceData() {
  const userNamespace = engine.state.namespace('user')
  const data = {
    name: userNamespace.get('profile.name'),
    age: userNamespace.get('profile.age'),
    theme: userNamespace.get('settings.theme'),
  }

  engine.logger.info('用户命名空间数据:', data)
  logStateChange('namespace-get', 'user.*', data)
}

function clearUserNamespace() {
  const userNamespace = engine.state.namespace('user')
  userNamespace.clear()

  logStateChange('namespace-clear', 'user.*')
  updateKeys()
}

function setAppNamespaceData() {
  const appNamespace = engine.state.namespace('app')
  appNamespace.set('config.version', '2.0.0')
  appNamespace.set('config.debug', false)
  appNamespace.set('stats.users', 1000)

  logStateChange('namespace-set', 'app.*')
  updateKeys()
}

function getAppNamespaceData() {
  const appNamespace = engine.state.namespace('app')
  const data = {
    version: appNamespace.get('config.version'),
    debug: appNamespace.get('config.debug'),
    users: appNamespace.get('stats.users'),
  }

  engine.logger.info('应用命名空间数据:', data)
  logStateChange('namespace-get', 'app.*', data)
}

function clearAppNamespace() {
  const appNamespace = engine.state.namespace('app')
  appNamespace.clear()

  logStateChange('namespace-clear', 'app.*')
  updateKeys()
}

// 工具函数
function updateKeys() {
  allKeys.value = engine.state.keys()
}

function logStateChange(type: string, key: string, value?: any, oldValue?: any) {
  stateLogs.value.unshift({
    id: Date.now() + Math.random(),
    type,
    key,
    value,
    oldValue,
    timestamp: Date.now(),
  })

  // 限制日志数量
  if (stateLogs.value.length > 100) {
    stateLogs.value = stateLogs.value.slice(0, 100)
  }
}

function clearStateLogs() {
  stateLogs.value = []
}

function exportStateLogs() {
  const data = JSON.stringify(stateLogs.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `state-logs-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '状态日志已导出',
    duration: 2000,
  })
}

function formatValue(value: any): string {
  if (value === null)
    return 'null'
  if (value === undefined)
    return 'undefined'
  if (typeof value === 'string')
    return `"${value}"`
  if (typeof value === 'object')
    return JSON.stringify(value)
  return String(value)
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString()
}

onMounted(() => {
  updateKeys()

  // 设置一些初始数据
  engine.state.set('demo.initialized', true)
  engine.state.set('demo.timestamp', Date.now())

  logStateChange('init', 'demo.*')
  updateKeys()
})
</script>

<template>
  <div class="demo-page">
    <header class="page-header">
      <h1>💾 状态管理演示</h1>
      <p>响应式状态管理，支持嵌套路径和命名空间</p>
    </header>

    <section class="demo-section">
      <h2>基础状态操作</h2>
      <div class="state-operations">
        <div class="operation-group">
          <h3>设置状态</h3>
          <div class="input-group">
            <input
              v-model="newKey"
              placeholder="状态键名"
              class="form-input"
            >
            <input
              v-model="newValue"
              placeholder="状态值"
              class="form-input"
            >
            <button class="btn btn-primary" @click="setState">
              设置
            </button>
          </div>
        </div>

        <div class="operation-group">
          <h3>获取状态</h3>
          <div class="input-group">
            <input
              v-model="getKey"
              placeholder="要获取的键名"
              class="form-input"
            >
            <button class="btn btn-info" @click="getState">
              获取
            </button>
          </div>
          <div v-if="getResult !== null" class="result">
            结果: {{ getResult }}
          </div>
        </div>

        <div class="operation-group">
          <h3>删除状态</h3>
          <div class="input-group">
            <input
              v-model="removeKey"
              placeholder="要删除的键名"
              class="form-input"
            >
            <button class="btn btn-danger" @click="removeState">
              删除
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>预设状态操作</h2>
      <div class="preset-operations">
        <button class="btn btn-success" @click="setUserProfile">
          设置用户资料
        </button>
        <button class="btn btn-info" @click="setAppSettings">
          设置应用配置
        </button>
        <button class="btn btn-warning" @click="updateCounter">
          增加计数器
        </button>
        <button class="btn btn-secondary" @click="setNestedData">
          设置嵌套数据
        </button>
        <button class="btn btn-danger" @click="clearAllState">
          清空所有状态
        </button>
      </div>
    </section>

    <section class="demo-section">
      <h2>状态监听</h2>
      <div class="watch-section">
        <div class="watch-controls">
          <input
            v-model="watchKey"
            placeholder="要监听的键名"
            class="form-input"
          >
          <button class="btn btn-primary" @click="addWatcher">
            添加监听器
          </button>
          <button class="btn btn-secondary" @click="clearWatchers">
            清除所有监听器
          </button>
        </div>

        <div class="watchers-list">
          <h4>活跃监听器 ({{ watchers.length }})</h4>
          <div v-for="watcher in watchers" :key="watcher.id" class="watcher-item">
            <span class="watcher-key">{{ watcher.key }}</span>
            <button class="btn btn-sm btn-danger" @click="removeWatcher(watcher.id)">
              移除
            </button>
          </div>
          <div v-if="watchers.length === 0" class="empty-state">
            暂无活跃监听器
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>命名空间演示</h2>
      <div class="namespace-demo">
        <div class="namespace-group">
          <h3>用户命名空间</h3>
          <div class="namespace-operations">
            <button class="btn btn-primary" @click="setUserNamespaceData">
              设置用户数据
            </button>
            <button class="btn btn-info" @click="getUserNamespaceData">
              获取用户数据
            </button>
            <button class="btn btn-danger" @click="clearUserNamespace">
              清空用户数据
            </button>
          </div>
        </div>

        <div class="namespace-group">
          <h3>应用命名空间</h3>
          <div class="namespace-operations">
            <button class="btn btn-primary" @click="setAppNamespaceData">
              设置应用数据
            </button>
            <button class="btn btn-info" @click="getAppNamespaceData">
              获取应用数据
            </button>
            <button class="btn btn-danger" @click="clearAppNamespace">
              清空应用数据
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>当前状态</h2>
      <div class="state-display">
        <div class="state-summary">
          <div class="summary-item">
            <span class="label">状态键总数:</span>
            <span class="value">{{ allKeys.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">监听器数量:</span>
            <span class="value">{{ watchers.length }}</span>
          </div>
          <div class="summary-item">
            <span class="label">内存使用:</span>
            <span class="value">{{ memoryUsage }} KB</span>
          </div>
        </div>

        <div class="state-tree">
          <h4>状态树</h4>
          <div class="tree-container">
            <div v-for="key in allKeys" :key="key" class="tree-item">
              <div class="tree-key">
                {{ key }}
              </div>
              <div class="tree-value">
                {{ formatValue(engine.state.get(key)) }}
              </div>
              <button class="btn btn-sm btn-danger" @click="removeState(key)">
                删除
              </button>
            </div>
            <div v-if="allKeys.length === 0" class="empty-state">
              暂无状态数据
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>状态变更日志</h2>
      <div class="log-controls">
        <button class="btn btn-secondary" @click="clearStateLogs">
          清空日志
        </button>
        <button class="btn btn-info" @click="exportStateLogs">
          导出日志
        </button>
      </div>
      <div class="state-logs">
        <div
          v-for="log in stateLogs"
          :key="log.id"
          :class="`log-entry log-${log.type}`"
        >
          <span class="log-time">[{{ formatTime(log.timestamp) }}]</span>
          <span class="log-type">{{ log.type.toUpperCase() }}</span>
          <span class="log-key">{{ log.key }}</span>
          <span v-if="log.value !== undefined" class="log-value">{{ formatValue(log.value) }}</span>
          <span v-if="log.oldValue !== undefined" class="log-old-value">← {{ formatValue(log.oldValue) }}</span>
        </div>
        <div v-if="stateLogs.length === 0" class="empty-state">
          暂无状态变更日志
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.state-operations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.operation-group h3 {
  margin-bottom: 1rem;
  color: #34495e;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.875rem;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.result {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.preset-operations {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.watch-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.watch-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.watchers-list h4 {
  margin-bottom: 1rem;
  color: #34495e;
}

.watcher-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.watcher-key {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #2c3e50;
}

.namespace-demo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.namespace-group h3 {
  margin-bottom: 1rem;
  color: #34495e;
}

.namespace-operations {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.state-display {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.state-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.label {
  color: #7f8c8d;
}

.value {
  font-weight: 500;
  color: #2c3e50;
}

.state-tree h4 {
  margin-bottom: 1rem;
  color: #34495e;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
}

.tree-item {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid #e9ecef;
}

.tree-item:last-child {
  border-bottom: none;
}

.tree-key {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #3498db;
  font-weight: 500;
}

.tree-value {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: #27ae60;
  word-break: break-all;
}

.log-controls {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}

.state-logs {
  max-height: 400px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 1rem;
}

.log-entry {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  color: #7f8c8d;
  min-width: 80px;
}

.log-type {
  color: #3498db;
  font-weight: 500;
  min-width: 80px;
}

.log-key {
  color: #2c3e50;
  min-width: 120px;
}

.log-value {
  color: #27ae60;
  flex: 1;
}

.log-old-value {
  color: #e74c3c;
  font-style: italic;
}

.log-set {
  background: #e8f5e8;
}

.log-get {
  background: #e3f2fd;
}

.log-remove {
  background: #ffebee;
}

.log-watch {
  background: #fff3e0;
}

.log-clear {
  background: #f3e5f5;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 2rem;
}
</style>
