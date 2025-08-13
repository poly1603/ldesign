<script setup lang="ts">
import { reactive, ref } from 'vue'

// 模拟数据和状态
const loading = ref(false)
const data = ref(null)
const error = ref<Error | null>(null)

const requestCount = ref<number>(0)
const successCount = ref<number>(0)
const errorCount = ref<number>(0)

// 表单数据
const form = reactive({
  title: '新文章标题',
  body: '这是文章内容',
  userId: 1,
})

// 模拟 HTTP 请求函数
async function mockRequest(url: string, options: any = {}) {
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
      ...options.data,
    },
    status: 200,
    statusText: 'OK',
  }
}

// 基础请求方法
async function sendGetRequest() {
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

async function sendPostRequest() {
  try {
    loading.value = true
    error.value = null
    const response = await mockRequest('/api/posts', {
      method: 'POST',
      data: { title: '新文章', body: '文章内容' },
    })
    data.value = response.data
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}

async function sendErrorRequest() {
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

async function submitForm() {
  try {
    loading.value = true
    error.value = null
    const response = await mockRequest('/api/posts', {
      method: 'POST',
      data: form,
    })
    data.value = response.data
  } catch (err) {
    error.value = err as Error
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div id="app">
    <h1>@ldesign/http Vue 3 示例</h1>

    <!-- 统计信息 -->
    <div class="stats">
      <div class="stat-item">
        <span class="label">请求总数:</span>
        <span class="value">{{ requestCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">成功数:</span>
        <span class="value">{{ successCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">错误数:</span>
        <span class="value">{{ errorCount }}</span>
      </div>
    </div>

    <!-- 基础请求 -->
    <section class="section">
      <h2>基础 HTTP 请求</h2>
      <div class="button-group">
        <button :disabled="loading" @click="sendGetRequest">
          {{ loading ? '请求中...' : 'GET 请求' }}
        </button>
        <button :disabled="loading" @click="sendPostRequest">
          {{ loading ? '请求中...' : 'POST 请求' }}
        </button>
        <button :disabled="loading" @click="sendErrorRequest">
          {{ loading ? '请求中...' : '错误请求' }}
        </button>
      </div>

      <div class="output">
        <div v-if="loading" class="loading">🔄 请求进行中...</div>
        <div v-else-if="error" class="error">❌ 错误: {{ error.message }}</div>
        <div v-else-if="data" class="success">
          ✅ 成功:
          <pre>{{ JSON.stringify(data, null, 2) }}</pre>
        </div>
        <div v-else class="placeholder">点击按钮发送请求</div>
      </div>
    </section>

    <!-- 表单提交 -->
    <section class="section">
      <h2>表单提交</h2>
      <form class="form" @submit.prevent="submitForm">
        <div class="form-group">
          <label>标题:</label>
          <input v-model="form.title" type="text" />
        </div>
        <div class="form-group">
          <label>内容:</label>
          <textarea v-model="form.body" />
        </div>
        <button type="submit" :disabled="loading">
          {{ loading ? '提交中...' : '提交表单' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 30px;
}

h2 {
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}

.stats {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.label {
  font-size: 14px;
  color: #666;
}

.value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #2980b9;
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.output {
  padding: 15px;
  border-radius: 4px;
  min-height: 100px;
}

.loading {
  color: #f39c12;
}

.error {
  color: #e74c3c;
  background: #fdf2f2;
  padding: 10px;
  border-radius: 4px;
}

.success {
  color: #27ae60;
  background: #f0f9f4;
  padding: 10px;
  border-radius: 4px;
}

.placeholder {
  color: #7f8c8d;
  font-style: italic;
}

.form {
  max-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #2c3e50;
}

input,
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  height: 80px;
  resize: vertical;
}

pre {
  background: #f4f4f4;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
}
</style>
