<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { onMounted, ref } from 'vue'

// 使用引擎组合式API
const { engine } = useEngine()

// 中间件列表
const middlewares = ref([
  {
    id: 'auth',
    name: '身份验证中间件',
    description: '验证用户身份和权限',
    enabled: true,
    priority: 1,
    executions: 245,
    avgTime: '2.3ms',
  },
  {
    id: 'logger',
    name: '日志记录中间件',
    description: '记录请求和响应信息',
    enabled: true,
    priority: 2,
    executions: 892,
    avgTime: '0.8ms',
  },
  {
    id: 'cache',
    name: '缓存处理中间件',
    description: '处理缓存读写操作',
    enabled: true,
    priority: 3,
    executions: 156,
    avgTime: '1.5ms',
  },
  {
    id: 'cors',
    name: 'CORS处理中间件',
    description: '处理跨域请求',
    enabled: false,
    priority: 4,
    executions: 0,
    avgTime: '0ms',
  },
])

// 执行日志
const executionLogs = ref([
  {
    id: 1,
    middleware: 'auth',
    action: '验证用户token',
    result: 'success',
    duration: '2.1ms',
    timestamp: new Date(Date.now() - 5000).toLocaleString(),
  },
  {
    id: 2,
    middleware: 'logger',
    action: '记录API请求',
    result: 'success',
    duration: '0.5ms',
    timestamp: new Date(Date.now() - 10000).toLocaleString(),
  },
  {
    id: 3,
    middleware: 'cache',
    action: '缓存查询结果',
    result: 'success',
    duration: '1.2ms',
    timestamp: new Date(Date.now() - 15000).toLocaleString(),
  },
])

// 新中间件表单
const newMiddleware = ref({
  name: '',
  description: '',
  code: `async (context, next) => {
  console.log('中间件执行前')
  
  try {
    await next()
    console.log('中间件执行后')
  } catch (error) {
    console.error('中间件捕获错误:', error)
    throw error
  }
}`,
})

// 切换中间件状态
function toggleMiddleware(id: string) {
  const middleware = middlewares.value.find(m => m.id === id)
  if (middleware) {
    middleware.enabled = !middleware.enabled
    
    // 添加执行日志
    addExecutionLog(id, middleware.enabled ? '启用中间件' : '禁用中间件', 'success')
    
    // 显示通知
    engine.value?.notifications.show({
      title: middleware.enabled ? '✅ 中间件已启用' : '⏸️ 中间件已禁用',
      message: `${middleware.name} 已${middleware.enabled ? '启用' : '禁用'}`,
      type: middleware.enabled ? 'success' : 'warning',
    })
  }
}

// 测试中间件
function testMiddleware(id: string) {
  const middleware = middlewares.value.find(m => m.id === id)
  if (middleware && middleware.enabled) {
    // 模拟中间件执行
    const startTime = Date.now()
    
    setTimeout(() => {
      const duration = Date.now() - startTime
      middleware.executions++
      
      // 添加执行日志
      addExecutionLog(id, '测试执行', 'success', `${duration}ms`)
      
      // 显示通知
      engine.value?.notifications.show({
        title: '🧪 中间件测试完成',
        message: `${middleware.name} 执行成功，耗时 ${duration}ms`,
        type: 'success',
      })
    }, Math.random() * 1000 + 500) // 模拟随机执行时间
  }
}

// 更新中间件优先级
function updatePriority(id: string, change: number) {
  const middleware = middlewares.value.find(m => m.id === id)
  if (middleware) {
    const newPriority = Math.max(1, middleware.priority + change)
    middleware.priority = newPriority
    
    // 重新排序
    middlewares.value.sort((a, b) => a.priority - b.priority)
    
    // 添加执行日志
    addExecutionLog(id, `优先级调整为 ${newPriority}`, 'success')
    
    // 显示通知
    engine.value?.notifications.show({
      title: '📊 优先级已更新',
      message: `${middleware.name} 优先级调整为 ${newPriority}`,
      type: 'info',
    })
  }
}

// 创建新中间件
function createMiddleware() {
  if (!newMiddleware.value.name || !newMiddleware.value.description) {
    engine.value?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写中间件名称和描述',
      type: 'error',
    })
    return
  }

  const middleware = {
    id: `custom-${Date.now()}`,
    name: newMiddleware.value.name,
    description: newMiddleware.value.description,
    enabled: true,
    priority: middlewares.value.length + 1,
    executions: 0,
    avgTime: '0ms',
  }

  middlewares.value.push(middleware)
  
  // 添加执行日志
  addExecutionLog(middleware.id, '创建新中间件', 'success')
  
  // 重置表单
  newMiddleware.value = {
    name: '',
    description: '',
    code: `async (context, next) => {
  console.log('中间件执行前')
  
  try {
    await next()
    console.log('中间件执行后')
  } catch (error) {
    console.error('中间件捕获错误:', error)
    throw error
  }
}`,
  }

  // 显示通知
  engine.value?.notifications.show({
    title: '🎉 中间件创建成功',
    message: `${middleware.name} 已成功创建`,
    type: 'success',
  })
}

// 演示中间件管道
function demoPipeline() {
  engine.value?.notifications.show({
    title: '🔄 中间件管道演示',
    message: '正在执行完整的中间件管道...',
    type: 'info',
  })

  // 模拟中间件管道执行
  const enabledMiddlewares = middlewares.value.filter(m => m.enabled)
  let currentIndex = 0

  function executeNext() {
    if (currentIndex < enabledMiddlewares.length) {
      const middleware = enabledMiddlewares[currentIndex]
      middleware.executions++
      
      addExecutionLog(
        middleware.id,
        `管道执行 [${currentIndex + 1}/${enabledMiddlewares.length}]`,
        'success',
        `${Math.random() * 3 + 1}ms`
      )
      
      currentIndex++
      setTimeout(executeNext, 800)
    } else {
      engine.value?.notifications.show({
        title: '✅ 管道执行完成',
        message: `成功执行了 ${enabledMiddlewares.length} 个中间件`,
        type: 'success',
      })
    }
  }

  executeNext()
}

// 添加执行日志
function addExecutionLog(middleware: string, action: string, result: string, duration = '1ms') {
  const middlewareObj = middlewares.value.find(m => m.id === middleware)
  const log = {
    id: Date.now(),
    middleware: middlewareObj?.name || middleware,
    action,
    result,
    duration,
    timestamp: new Date().toLocaleString(),
  }
  
  executionLogs.value.unshift(log)
  
  // 只保留最近50条日志
  if (executionLogs.value.length > 50) {
    executionLogs.value = executionLogs.value.slice(0, 50)
  }
}

// 清除日志
function clearLogs() {
  executionLogs.value = []
  engine.value?.notifications.show({
    title: '🗑️ 日志已清除',
    message: '所有执行日志已清除',
    type: 'info',
  })
}

// 组件挂载
onMounted(() => {
  engine.value?.logger.info('中间件管理页面已加载')
})
</script>

<template>
  <div class="middleware">
    <div class="page-header">
      <h1>🔄 中间件系统</h1>
      <p>管理请求处理管道，控制中间件的执行顺序和优先级</p>
    </div>

    <!-- 中间件统计 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔄</div>
        <div class="stat-content">
          <div class="stat-value">{{ middlewares.length }}</div>
          <div class="stat-label">总中间件</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-content">
          <div class="stat-value">{{ middlewares.filter(m => m.enabled).length }}</div>
          <div class="stat-label">已启用</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ middlewares.reduce((sum, m) => sum + m.executions, 0) }}</div>
          <div class="stat-label">总执行次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🚀</div>
        <div class="stat-content">
          <button class="demo-btn" @click="demoPipeline">
            演示管道
          </button>
        </div>
      </div>
    </div>

    <!-- 中间件列表 -->
    <div class="section">
      <h2>📋 中间件列表</h2>
      <div class="middleware-list">
        <div v-for="middleware in middlewares" :key="middleware.id" class="middleware-card">
          <div class="middleware-header">
            <div class="middleware-info">
              <h3 class="middleware-name">{{ middleware.name }}</h3>
              <span class="middleware-priority">优先级: {{ middleware.priority }}</span>
            </div>
            <div class="middleware-controls">
              <button
                :class="['toggle-btn', middleware.enabled ? 'enabled' : 'disabled']"
                @click="toggleMiddleware(middleware.id)"
              >
                {{ middleware.enabled ? '✅' : '⏸️' }}
              </button>
            </div>
          </div>
          
          <p class="middleware-description">{{ middleware.description }}</p>
          
          <div class="middleware-stats">
            <div class="stat-item">
              <span class="stat-label">执行次数:</span>
              <span class="stat-value">{{ middleware.executions }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均耗时:</span>
              <span class="stat-value">{{ middleware.avgTime }}</span>
            </div>
          </div>
          
          <div class="middleware-actions">
            <button class="btn btn-sm btn-primary" @click="testMiddleware(middleware.id)">
              🧪 测试
            </button>
            <button class="btn btn-sm btn-secondary" @click="updatePriority(middleware.id, -1)">
              ⬆️ 提升
            </button>
            <button class="btn btn-sm btn-secondary" @click="updatePriority(middleware.id, 1)">
              ⬇️ 降低
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建新中间件 -->
    <div class="section">
      <h2>➕ 创建新中间件</h2>
      <div class="create-middleware">
        <div class="form-row">
          <div class="form-group">
            <label>中间件名称</label>
            <input 
              v-model="newMiddleware.name" 
              type="text" 
              placeholder="输入中间件名称"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>中间件描述</label>
            <input 
              v-model="newMiddleware.description" 
              type="text" 
              placeholder="输入中间件描述"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>中间件代码</label>
          <textarea 
            v-model="newMiddleware.code" 
            class="form-textarea code-editor"
            rows="10"
          />
        </div>
        
        <button class="btn btn-primary" @click="createMiddleware">
          🎉 创建中间件
        </button>
      </div>
    </div>

    <!-- 执行日志 -->
    <div class="section">
      <div class="section-header">
        <h2>📋 执行日志</h2>
        <button class="btn btn-sm btn-secondary" @click="clearLogs">
          🗑️ 清除日志
        </button>
      </div>
      
      <div class="logs-container">
        <div v-if="executionLogs.length === 0" class="empty-logs">
          <div class="empty-icon">📋</div>
          <p>暂无执行日志</p>
        </div>
        
        <div v-for="log in executionLogs.slice(0, 20)" :key="log.id" class="log-item">
          <div class="log-content">
            <div class="log-middleware">{{ log.middleware }}</div>
            <div class="log-action">{{ log.action }}</div>
            <div class="log-time">{{ log.timestamp }}</div>
          </div>
          <div class="log-meta">
            <span :class="['log-result', log.result]">
              {{ log.result === 'success' ? '✅' : '❌' }}
            </span>
            <span class="log-duration">{{ log.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.middleware {
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

.demo-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.demo-btn:hover {
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

.middleware-list {
  display: grid;
  gap: 1.5rem;
}

.middleware-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.middleware-card:hover {
  transform: translateY(-2px);
}

.middleware-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.middleware-info {
  flex: 1;
}

.middleware-name {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.middleware-priority {
  background: #ecf0f1;
  color: #7f8c8d;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.middleware-controls {
  display: flex;
  gap: 0.5rem;
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

.middleware-description {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.middleware-stats {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.middleware-actions {
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

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.create-middleware {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.code-editor {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
}

.logs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
}

.empty-logs {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.log-item:last-child {
  border-bottom: none;
}

.log-content {
  flex: 1;
  display: grid;
  grid-template-columns: 200px 1fr 150px;
  gap: 1rem;
  align-items: center;
}

.log-middleware {
  font-weight: bold;
  color: #667eea;
}

.log-action {
  color: #2c3e50;
}

.log-time {
  color: #666;
  font-size: 0.9rem;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.log-result {
  font-size: 1.2rem;
}

.log-duration {
  color: #666;
  font-size: 0.9rem;
  min-width: 50px;
  text-align: right;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .middleware-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .middleware-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .log-content {
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
