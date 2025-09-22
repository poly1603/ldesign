<template>
  <div class="cache-demo">
    <h1>@ldesign/cache Vue 3 综合示例</h1>
    
    <!-- 基础缓存管理 -->
    <section class="demo-section">
      <h2>基础缓存管理</h2>
      <div class="form-group">
        <label>用户名:</label>
        <input v-model="username" placeholder="输入用户名（自动保存）" />
        <small>值会在500ms后自动保存到缓存</small>
      </div>
      
      <div class="form-group">
        <label>主题偏好:</label>
        <select v-model="userSettings.theme">
          <option value="light">浅色主题</option>
          <option value="dark">深色主题</option>
          <option value="auto">自动</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="userSettings.notifications" />
          启用通知
        </label>
      </div>
    </section>

    <!-- 列表管理 -->
    <section class="demo-section">
      <h2>待办事项列表</h2>
      <div class="form-group">
        <input 
          v-model="newTodo" 
          @keyup.enter="addTodo"
          placeholder="添加新的待办事项" 
        />
        <button @click="addTodo" :disabled="!newTodo.trim()">添加</button>
      </div>
      
      <div class="todo-list">
        <div v-for="(todo, index) in todos.items" :key="index" class="todo-item">
          <span>{{ todo }}</span>
          <button @click="todos.remove(index)" class="delete-btn">删除</button>
        </div>
        <p v-if="todos.isEmpty">暂无待办事项</p>
        <small>总计: {{ todos.length }} 项</small>
      </div>
    </section>

    <!-- 计数器 -->
    <section class="demo-section">
      <h2>访问计数器</h2>
      <div class="counter">
        <button @click="counter.decrement" :disabled="!counter.canDecrement">-</button>
        <span class="count">{{ counter.count }}</span>
        <button @click="counter.increment" :disabled="!counter.canIncrement">+</button>
      </div>
      <div class="counter-controls">
        <button @click="counter.reset">重置</button>
        <small>范围: 0-100</small>
      </div>
    </section>

    <!-- 布尔值管理 -->
    <section class="demo-section">
      <h2>功能开关</h2>
      <div class="toggle-group">
        <label class="toggle">
          <input type="checkbox" v-model="featureFlag.value" />
          <span>实验性功能</span>
        </label>
        <div class="toggle-controls">
          <button @click="featureFlag.toggle">切换</button>
          <button @click="featureFlag.setTrue">启用</button>
          <button @click="featureFlag.setFalse">禁用</button>
        </div>
      </div>
    </section>

    <!-- 异步数据 -->
    <section class="demo-section">
      <h2>异步数据获取</h2>
      <div class="async-data">
        <div v-if="userData.loading" class="loading">加载中...</div>
        <div v-else-if="userData.error" class="error">
          错误: {{ userData.error.message }}
          <button @click="userData.refresh">重试</button>
        </div>
        <div v-else-if="userData.data" class="user-info">
          <h3>用户信息</h3>
          <p>ID: {{ userData.data.id }}</p>
          <p>姓名: {{ userData.data.name }}</p>
          <p>邮箱: {{ userData.data.email }}</p>
          <button @click="userData.refresh">刷新数据</button>
        </div>
      </div>
    </section>

    <!-- 缓存统计 -->
    <section class="demo-section">
      <h2>缓存统计</h2>
      <div class="stats" v-if="cacheStats.stats">
        <div class="stat-item">
          <label>总项目数:</label>
          <span>{{ cacheStats.stats.totalItems }}</span>
        </div>
        <div class="stat-item">
          <label>总大小:</label>
          <span>{{ cacheStats.formattedStats?.totalSizeFormatted }}</span>
        </div>
        <div class="stat-item">
          <label>命中率:</label>
          <span>{{ cacheStats.formattedStats?.hitRatePercentage }}%</span>
        </div>
        <button @click="cacheStats.refresh">刷新统计</button>
      </div>
    </section>

    <!-- 缓存操作 -->
    <section class="demo-section">
      <h2>缓存操作</h2>
      <div class="cache-operations">
        <button @click="clearAllCache">清空所有缓存</button>
        <button @click="exportCache">导出缓存数据</button>
        <button @click="showCacheInfo">显示缓存信息</button>
      </div>
      
      <div v-if="cacheInfo" class="cache-info">
        <h3>缓存信息</h3>
        <pre>{{ JSON.stringify(cacheInfo, null, 2) }}</pre>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  useCacheValue, 
  useCacheList, 
  useCacheCounter, 
  useCacheObject,
  useCacheBoolean,
  useCacheAsync,
  useCacheStats,
  useCache
} from '@ldesign/cache/vue'

// 基础缓存管理
const { clear: clearAllCache } = useCache({
  keyPrefix: 'demo_'
})

// 简单值 - 用户名（自动保存）
const username = useCacheValue('username', '', {
  autoSave: { debounce: 500 }
})

// 对象 - 用户设置（节流保存）
const userSettings = useCacheObject('user-settings', {
  theme: 'light',
  notifications: true
}, {
  autoSave: { throttle: 1000 }
})

// 列表 - 待办事项
const todos = useCacheList<string>('todos', [])
const newTodo = ref('')

const addTodo = () => {
  if (newTodo.value.trim()) {
    todos.add(newTodo.value.trim())
    newTodo.value = ''
  }
}

// 计数器 - 访问次数
const counter = useCacheCounter('visit-count', 0, {
  min: 0,
  max: 100,
  step: 1
})

// 布尔值 - 功能开关
const featureFlag = useCacheBoolean('experimental-feature', false)

// 异步数据 - 模拟用户数据获取
const userData = useCacheAsync('user-data', async () => {
  // 模拟API调用
  await new Promise(resolve => setTimeout(resolve, 1000))
  return {
    id: Math.floor(Math.random() * 1000),
    name: '张三',
    email: 'zhangsan@example.com',
    lastLogin: new Date().toISOString()
  }
}, {
  ttl: 30 * 1000, // 30秒缓存
  staleWhileRevalidate: true
})

// 缓存统计
const cacheStats = useCacheStats({
  refreshInterval: 5000 // 每5秒自动刷新
})

// 缓存信息
const cacheInfo = ref(null)

const exportCache = async () => {
  // 这里可以实现缓存导出逻辑
  alert('缓存导出功能（示例）')
}

const showCacheInfo = () => {
  cacheInfo.value = {
    username: username.value,
    userSettings: userSettings,
    todos: todos.items,
    counter: counter.count,
    featureFlag: featureFlag.value,
    stats: cacheStats.stats
  }
}

// 组件挂载时增加访问计数
onMounted(() => {
  counter.increment()
})
</script>

<style scoped>
.cache-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
}

.demo-section h2 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group small {
  color: #666;
  font-size: 12px;
}

.todo-list {
  margin-top: 15px;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.delete-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.counter {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.counter button {
  width: 40px;
  height: 40px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
}

.counter button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.count {
  font-size: 24px;
  font-weight: bold;
  min-width: 60px;
  text-align: center;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.cache-operations {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.cache-operations button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.cache-info {
  margin-top: 15px;
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.cache-info pre {
  margin: 0;
  font-size: 12px;
  overflow-x: auto;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
  padding: 15px;
  background: #f8d7da;
  border-radius: 4px;
  border: 1px solid #f5c6cb;
}

.user-info {
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.user-info h3 {
  margin-top: 0;
}
</style>
