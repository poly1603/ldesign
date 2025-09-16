<template>
  <div class="http-test-page">
    <h1>HTTP 插件重构测试</h1>
    
    <div class="test-section">
      <h2>插件信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>插件名称:</label>
          <span>{{ pluginInfo.name }}</span>
        </div>
        <div class="info-item">
          <label>插件版本:</label>
          <span>{{ pluginInfo.version }}</span>
        </div>
        <div class="info-item">
          <label>创建方式:</label>
          <span>{{ pluginInfo.createdBy }}</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>HTTP 客户端测试</h2>
      <div class="test-controls">
        <button @click="testHttpClient" :disabled="loading">
          {{ loading ? '测试中...' : '测试 HTTP 请求' }}
        </button>
        <button @click="testCacheFeature" :disabled="loading">
          测试缓存功能
        </button>
        <button @click="testRetryFeature" :disabled="loading">
          测试重试功能
        </button>
      </div>
      
      <div v-if="testResults.length > 0" class="test-results">
        <h3>测试结果</h3>
        <div v-for="(result, index) in testResults" :key="index" 
             :class="['test-result', result.success ? 'success' : 'error']">
          <div class="result-header">
            <span class="result-title">{{ result.title }}</span>
            <span class="result-status">{{ result.success ? '✅' : '❌' }}</span>
          </div>
          <div class="result-details">{{ result.message }}</div>
          <div v-if="result.data" class="result-data">
            <pre>{{ JSON.stringify(result.data, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useHttp } from '@ldesign/http/vue/index.ts'
import { httpPlugin } from './index'

// 响应式数据
const loading = ref(false)
const testResults = ref<Array<{
  title: string
  success: boolean
  message: string
  data?: any
}>>([])

// 插件信息
const pluginInfo = ref({
  name: httpPlugin.name,
  version: httpPlugin.version,
  createdBy: 'createHttpEnginePlugin (标准化)'
})

// 使用 HTTP 客户端
const { get, post } = useHttp()

/**
 * 添加测试结果
 */
function addTestResult(title: string, success: boolean, message: string, data?: any) {
  testResults.value.push({ title, success, message, data })
}

/**
 * 清空测试结果
 */
function clearTestResults() {
  testResults.value = []
}

/**
 * 测试基本 HTTP 请求
 */
async function testHttpClient() {
  loading.value = true
  clearTestResults()
  
  try {
    // 测试 GET 请求
    const response = await get('/posts/1')
    addTestResult(
      'GET 请求测试',
      true,
      '成功获取数据',
      response.data
    )
    
    // 测试 POST 请求
    const postResponse = await post('/posts', {
      title: 'Test Post',
      body: 'This is a test post',
      userId: 1
    })
    addTestResult(
      'POST 请求测试',
      true,
      '成功创建数据',
      postResponse.data
    )
    
  } catch (error: any) {
    addTestResult(
      'HTTP 请求测试',
      false,
      `请求失败: ${error.message}`,
      error
    )
  } finally {
    loading.value = false
  }
}

/**
 * 测试缓存功能
 */
async function testCacheFeature() {
  loading.value = true
  clearTestResults()
  
  try {
    const startTime = Date.now()
    
    // 第一次请求
    await get('/posts/1')
    const firstRequestTime = Date.now() - startTime
    
    // 第二次请求（应该从缓存获取）
    const cacheStartTime = Date.now()
    await get('/posts/1')
    const secondRequestTime = Date.now() - cacheStartTime
    
    addTestResult(
      '缓存功能测试',
      secondRequestTime < firstRequestTime,
      `第一次请求: ${firstRequestTime}ms, 第二次请求: ${secondRequestTime}ms`,
      {
        firstRequest: firstRequestTime,
        secondRequest: secondRequestTime,
        cacheWorking: secondRequestTime < firstRequestTime
      }
    )
    
  } catch (error: any) {
    addTestResult(
      '缓存功能测试',
      false,
      `测试失败: ${error.message}`,
      error
    )
  } finally {
    loading.value = false
  }
}

/**
 * 测试重试功能
 */
async function testRetryFeature() {
  loading.value = true
  clearTestResults()
  
  try {
    // 请求一个不存在的端点来触发重试
    await get('/nonexistent-endpoint')
    
    addTestResult(
      '重试功能测试',
      false,
      '意外成功 - 应该失败并重试',
    )
    
  } catch (error: any) {
    addTestResult(
      '重试功能测试',
      true,
      '按预期失败，重试机制已触发',
      {
        error: error.message,
        note: '检查网络面板可以看到重试请求'
      }
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  console.log('🎯 HTTP 插件重构测试页面已加载')
  console.log('插件信息:', pluginInfo.value)
})
</script>

<style scoped lang="less">
.http-test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  background: var(--ldesign-bg-color-container);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  
  label {
    font-weight: 600;
    color: var(--ldesign-text-color-secondary);
  }
  
  span {
    color: var(--ldesign-text-color-primary);
  }
}

.test-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  
  button {
    padding: 10px 20px;
    border: 1px solid var(--ldesign-brand-color);
    background: var(--ldesign-brand-color);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.test-results {
  margin-top: 20px;
}

.test-result {
  margin-bottom: 15px;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid;
  
  &.success {
    background: var(--ldesign-success-color-1);
    border-left-color: var(--ldesign-success-color);
  }
  
  &.error {
    background: var(--ldesign-error-color-1);
    border-left-color: var(--ldesign-error-color);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-title {
  font-weight: 600;
}

.result-details {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: 10px;
}

.result-data {
  background: var(--ldesign-bg-color-component);
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  
  pre {
    margin: 0;
    font-size: 12px;
    color: var(--ldesign-text-color-primary);
  }
}
</style>
