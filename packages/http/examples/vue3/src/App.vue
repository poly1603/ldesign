<template>
  <div id="app">
    <header class="header">
      <h1>@ldesign/http - Vue 3 示例</h1>
      <p>演示 HTTP 客户端在 Vue 3 中的使用</p>
    </header>

    <main class="main">
      <!-- 基础请求示例 -->
      <section class="section">
        <h2>🚀 基础请求示例</h2>
        <div class="controls">
          <button @click="sendGetRequest" :disabled="loading">GET 请求</button>
          <button @click="sendPostRequest" :disabled="loading" class="btn-success">POST 请求</button>
          <button @click="sendErrorRequest" :disabled="loading" class="btn-danger">错误请求</button>
        </div>
        
        <div class="output">
          <div v-if="loading" class="loading">🔄 请求中...</div>
          <div v-else-if="error" class="error">
            ❌ 错误: {{ error.message }}
          </div>
          <div v-else-if="data" class="success">
            ✅ 成功: <pre>{{ JSON.stringify(data, null, 2) }}</pre>
          </div>
          <div v-else class="placeholder">
            点击上方按钮发送请求...
          </div>
        </div>
      </section>

      <!-- useRequest Hook 示例 -->
      <section class="section">
        <h2>🎣 useRequest Hook 示例</h2>
        <div class="controls">
          <button @click="userRequest.execute" :disabled="userRequest.loading.value">
            获取用户信息
          </button>
          <button @click="userRequest.refresh" :disabled="userRequest.loading.value">
            刷新
          </button>
          <button @click="userRequest.reset">重置</button>
        </div>
        
        <div class="output">
          <div v-if="userRequest.loading.value" class="loading">🔄 加载中...</div>
          <div v-else-if="userRequest.error.value" class="error">
            ❌ 错误: {{ userRequest.error.value.message }}
          </div>
          <div v-else-if="userRequest.data.value" class="success">
            ✅ 用户信息: <pre>{{ JSON.stringify(userRequest.data.value, null, 2) }}</pre>
          </div>
          <div v-else class="placeholder">
            点击上方按钮获取用户信息...
          </div>
        </div>
      </section>

      <!-- useMutation Hook 示例 -->
      <section class="section">
        <h2>✏️ useMutation Hook 示例</h2>
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label>标题:</label>
            <input v-model="form.title" type="text" required />
          </div>
          <div class="form-group">
            <label>内容:</label>
            <textarea v-model="form.body" required></textarea>
          </div>
          <button type="submit" :disabled="createPost.loading.value" class="btn-success">
            {{ createPost.loading.value ? '提交中...' : '创建文章' }}
          </button>
        </form>
        
        <div class="output">
          <div v-if="createPost.loading.value" class="loading">🔄 创建中...</div>
          <div v-else-if="createPost.error.value" class="error">
            ❌ 创建失败: {{ createPost.error.value.message }}
          </div>
          <div v-else-if="createPost.data.value" class="success">
            ✅ 创建成功: <pre>{{ JSON.stringify(createPost.data.value, null, 2) }}</pre>
          </div>
        </div>
      </section>

      <!-- 状态统计 -->
      <section class="section">
        <h2>📊 状态统计</h2>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">{{ requestCount }}</div>
            <div class="stat-label">总请求数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ successCount }}</div>
            <div class="stat-label">成功请求</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ errorCount }}</div>
            <div class="stat-label">失败请求</div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 模拟 HTTP 客户端和 hooks
// 在实际项目中应该导入：
// import { useRequest, useMutation } from '@ldesign/http/vue'

// 模拟数据和状态
const loading = ref(false)
const data = ref(null)
const error = ref(null)

const requestCount = ref(0)
const successCount = ref(0)
const errorCount = ref(0)

// 表单数据
const form = reactive({
  title: '',
  body: ''
})

// 模拟 HTTP 请求函数
const mockRequest = async (url: string, options: any = {}) => {
  requestCount.value++
  
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (url.includes('error')) {
    errorCount.value++
    throw new Error('模拟网络错误')
  }
  
  successCount.value++
  return {
    data: {
      id: Math.random().toString(36).substr(2, 9),
      url,
      method: options.method || 'GET',
      timestamp: new Date().toISOString(),
      ...options.data
    },
    status: 200,
    statusText: 'OK'
  }
}

// 基础请求方法
const sendGetRequest = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await mockRequest('/api/posts/1')
    data.value = response.data
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

const sendPostRequest = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await mockRequest('/api/posts', {
      method: 'POST',
      data: { title: '新文章', body: '文章内容' }
    })
    data.value = response.data
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

const sendErrorRequest = async () => {
  try {
    loading.value = true
    error.value = null
    await mockRequest('/api/error')
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

// 模拟 useRequest hook
const userRequest = {
  data: ref(null),
  loading: ref(false),
  error: ref(null),
  finished: ref(false),
  
  execute: async () => {
    try {
      userRequest.loading.value = true
      userRequest.error.value = null
      const response = await mockRequest('/api/users/1')
      userRequest.data.value = response.data
      userRequest.finished.value = true
    } catch (err) {
      userRequest.error.value = err as Error
      userRequest.finished.value = true
    } finally {
      userRequest.loading.value = false
    }
  },
  
  refresh: async () => {
    await userRequest.execute()
  },
  
  reset: () => {
    userRequest.data.value = null
    userRequest.loading.value = false
    userRequest.error.value = null
    userRequest.finished.value = false
  }
}

// 模拟 useMutation hook
const createPost = {
  data: ref(null),
  loading: ref(false),
  error: ref(null),
  
  mutate: async (postData: any) => {
    try {
      createPost.loading.value = true
      createPost.error.value = null
      const response = await mockRequest('/api/posts', {
        method: 'POST',
        data: postData
      })
      createPost.data.value = response.data
      
      // 重置表单
      form.title = ''
      form.body = ''
    } catch (err) {
      createPost.error.value = err as Error
    } finally {
      createPost.loading.value = false
    }
  }
}

const handleSubmit = () => {
  createPost.mutate({
    title: form.title,
    body: form.body,
    userId: 1
  })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  padding: 40px 20px;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #7f8c8d;
  font-size: 18px;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section {
  background: white;
  margin: 20px 0;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

button {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #2980b9;
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-success {
  background: #27ae60;
}

.btn-success:hover:not(:disabled) {
  background: #229954;
}

.btn-danger {
  background: #e74c3c;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.output {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 20px;
  margin-top: 20px;
  min-height: 100px;
}

.loading {
  color: #3498db;
  font-weight: bold;
}

.success {
  color: #27ae60;
}

.error {
  color: #e74c3c;
}

.placeholder {
  color: #7f8c8d;
  font-style: italic;
}

.form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #ecf0f1;
  padding: 20px;
  border-radius: 6px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.stat-label {
  color: #7f8c8d;
  margin-top: 5px;
}

pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
