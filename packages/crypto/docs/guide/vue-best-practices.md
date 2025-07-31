# Vue 3 最佳实践

本指南提供了在 Vue 3 项目中使用 @ldesign/crypto 的最佳实践和建议。

## 项目结构建议

### 推荐的目录结构

```
src/
├── composables/
│   ├── useCrypto.js          # 自定义加密 composable
│   └── useSecureStorage.js   # 安全存储 composable
├── utils/
│   ├── crypto.js             # 加密工具函数
│   └── security.js           # 安全相关工具
├── services/
│   ├── authService.js        # 认证服务
│   └── apiService.js         # API 服务
└── stores/
    └── authStore.js          # 认证状态管理
```

## 插件配置最佳实践

### 环境特定配置

```typescript
// config/crypto.ts
export const cryptoConfig = {
  development: {
    defaultAESKeySize: 128,     // 开发环境使用较小密钥提高性能
    defaultRSAKeySize: 1024,
    enableDebugLogs: true,
    strictValidation: false
  },
  
  production: {
    defaultAESKeySize: 256,     // 生产环境使用更强加密
    defaultRSAKeySize: 4096,
    enableDebugLogs: false,
    strictValidation: true
  },
  
  test: {
    defaultAESKeySize: 128,     // 测试环境优化性能
    defaultRSAKeySize: 1024,
    enableDebugLogs: false,
    strictValidation: true
  }
}

// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import { cryptoConfig } from './config/crypto'

const app = createApp(App)

const env = process.env.NODE_ENV || 'development'
app.use(CryptoPlugin, {
  config: cryptoConfig[env]
})
```

### 条件加载

```typescript
// 仅在需要时加载加密功能
const loadCryptoPlugin = async () => {
  if (process.env.NODE_ENV === 'production') {
    const { CryptoPlugin } = await import('@ldesign/crypto/vue')
    app.use(CryptoPlugin, productionConfig)
  }
}
```

## Composable 最佳实践

### 自定义 Composable 封装

```typescript
// composables/useSecureCrypto.ts
import { ref, computed } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

export function useSecureCrypto() {
  const crypto = useCrypto()
  const encryptionHistory = ref([])
  const maxHistorySize = 10
  
  // 安全的加密函数，带历史记录
  const secureEncrypt = async (data: string, key: string) => {
    try {
      const result = await crypto.encryptAES(data, key)
      
      // 记录加密历史（不包含敏感数据）
      encryptionHistory.value.unshift({
        timestamp: Date.now(),
        algorithm: result.algorithm,
        dataLength: data.length,
        success: true
      })
      
      // 限制历史记录大小
      if (encryptionHistory.value.length > maxHistorySize) {
        encryptionHistory.value = encryptionHistory.value.slice(0, maxHistorySize)
      }
      
      return result
    } catch (error) {
      encryptionHistory.value.unshift({
        timestamp: Date.now(),
        error: error.message,
        success: false
      })
      throw error
    }
  }
  
  // 清除敏感数据
  const clearHistory = () => {
    encryptionHistory.value = []
  }
  
  // 统计信息
  const stats = computed(() => ({
    totalOperations: encryptionHistory.value.length,
    successRate: encryptionHistory.value.filter(h => h.success).length / encryptionHistory.value.length,
    lastOperation: encryptionHistory.value[0]
  }))
  
  return {
    ...crypto,
    secureEncrypt,
    encryptionHistory: readonly(encryptionHistory),
    stats,
    clearHistory
  }
}
```

### 响应式状态管理

```typescript
// composables/useCryptoState.ts
import { ref, reactive, watch } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

export function useCryptoState() {
  const crypto = useCrypto()
  
  // 响应式状态
  const state = reactive({
    currentKey: '',
    encryptedData: null,
    decryptedData: '',
    isProcessing: false,
    lastOperation: null,
    operationCount: 0
  })
  
  // 监听加密状态变化
  watch([crypto.isEncrypting, crypto.isDecrypting], ([encrypting, decrypting]) => {
    state.isProcessing = encrypting || decrypting
  })
  
  // 监听操作结果
  watch(crypto.lastResult, (result) => {
    if (result) {
      state.lastOperation = {
        type: result.algorithm ? 'encrypt' : 'decrypt',
        timestamp: Date.now(),
        success: true
      }
      state.operationCount++
    }
  })
  
  // 监听错误
  watch(crypto.lastError, (error) => {
    if (error) {
      state.lastOperation = {
        type: 'error',
        timestamp: Date.now(),
        success: false,
        error: error
      }
    }
  })
  
  return {
    ...crypto,
    state: readonly(state)
  }
}
```

## 安全存储实践

### 安全的本地存储

```typescript
// composables/useSecureStorage.ts
import { ref, watch } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

export function useSecureStorage(storageKey: string, userKey: string) {
  const { encryptAES, decryptAES } = useCrypto()
  const data = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  
  // 加密存储
  const save = async (value: any) => {
    try {
      isLoading.value = true
      error.value = null
      
      const serialized = JSON.stringify(value)
      const encrypted = await encryptAES(serialized, userKey)
      
      localStorage.setItem(storageKey, JSON.stringify(encrypted))
      data.value = value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  // 解密读取
  const load = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const stored = localStorage.getItem(storageKey)
      if (!stored) {
        data.value = null
        return null
      }
      
      const encrypted = JSON.parse(stored)
      const decrypted = await decryptAES(encrypted, userKey)
      
      if (!decrypted.success) {
        throw new Error('解密失败')
      }
      
      const value = JSON.parse(decrypted.data)
      data.value = value
      return value
    } catch (err) {
      error.value = err.message
      data.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }
  
  // 删除
  const remove = () => {
    localStorage.removeItem(storageKey)
    data.value = null
  }
  
  // 自动保存
  const enableAutoSave = () => {
    watch(data, (newValue) => {
      if (newValue !== null) {
        save(newValue)
      }
    }, { deep: true })
  }
  
  return {
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),
    save,
    load,
    remove,
    enableAutoSave
  }
}
```

## 组件设计模式

### 加密表单组件

```vue
<!-- components/SecureForm.vue -->
<template>
  <form @submit.prevent="handleSubmit" class="secure-form">
    <div class="form-group">
      <label>敏感数据:</label>
      <textarea 
        v-model="formData.sensitiveData" 
        :disabled="isProcessing"
        placeholder="输入敏感数据"
      />
    </div>
    
    <div class="form-group">
      <label>加密密钥:</label>
      <input 
        v-model="formData.encryptionKey" 
        type="password"
        :disabled="isProcessing"
        placeholder="输入加密密钥"
      />
    </div>
    
    <div class="form-actions">
      <button 
        type="submit" 
        :disabled="!canSubmit"
        :class="{ loading: isProcessing }"
      >
        {{ isProcessing ? '处理中...' : '加密提交' }}
      </button>
      
      <button 
        type="button" 
        @click="clearForm"
        :disabled="isProcessing"
      >
        清除
      </button>
    </div>
    
    <div v-if="result" class="result">
      <h3>加密结果</h3>
      <pre>{{ result }}</pre>
    </div>
    
    <div v-if="error" class="error">
      错误: {{ error }}
    </div>
  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSecureCrypto } from '@/composables/useSecureCrypto'

const emit = defineEmits(['encrypted', 'error'])

const { secureEncrypt, isEncrypting, lastError, clearError } = useSecureCrypto()

const formData = ref({
  sensitiveData: '',
  encryptionKey: ''
})

const result = ref(null)
const error = computed(() => lastError.value)
const isProcessing = computed(() => isEncrypting.value)

const canSubmit = computed(() => 
  formData.value.sensitiveData.trim() && 
  formData.value.encryptionKey.trim() && 
  !isProcessing.value
)

const handleSubmit = async () => {
  try {
    clearError()
    result.value = null
    
    const encrypted = await secureEncrypt(
      formData.value.sensitiveData, 
      formData.value.encryptionKey
    )
    
    result.value = encrypted
    emit('encrypted', encrypted)
    
    // 清除敏感数据
    formData.value.sensitiveData = ''
    formData.value.encryptionKey = ''
  } catch (err) {
    emit('error', err)
  }
}

const clearForm = () => {
  formData.value.sensitiveData = ''
  formData.value.encryptionKey = ''
  result.value = null
  clearError()
}
</script>

<style scoped>
.secure-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  margin: 20px 0;
}

.form-actions button {
  margin-right: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="submit"] {
  background-color: #007bff;
  color: white;
}

.form-actions button[type="button"] {
  background-color: #6c757d;
  color: white;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-actions button.loading {
  position: relative;
}

.form-actions button.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  margin: auto;
  border: 2px solid transparent;
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result {
  margin-top: 20px;
  padding: 15px;
  background-color: #d4edda;
  border-left: 4px solid #28a745;
  border-radius: 4px;
}

.result pre {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.error {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
  border-radius: 4px;
  color: #721c24;
}
</style>
```

## 性能优化

### 懒加载加密功能

```typescript
// composables/useLazyCrypto.ts
import { ref, shallowRef } from 'vue'

export function useLazyCrypto() {
  const cryptoModule = shallowRef(null)
  const isLoading = ref(false)
  const error = ref(null)
  
  const loadCrypto = async () => {
    if (cryptoModule.value) return cryptoModule.value
    
    try {
      isLoading.value = true
      error.value = null
      
      const module = await import('@ldesign/crypto/vue')
      cryptoModule.value = module.useCrypto()
      
      return cryptoModule.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  return {
    cryptoModule: readonly(cryptoModule),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadCrypto
  }
}
```

### 缓存优化

```typescript
// composables/useCryptoCache.ts
import { ref, computed } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

export function useCryptoCache(maxCacheSize = 100) {
  const crypto = useCrypto()
  const cache = ref(new Map())
  
  const generateCacheKey = (data: string, key: string, operation: string) => {
    return `${operation}:${btoa(data)}:${btoa(key)}`
  }
  
  const cachedEncrypt = async (data: string, key: string) => {
    const cacheKey = generateCacheKey(data, key, 'encrypt')
    
    if (cache.value.has(cacheKey)) {
      return cache.value.get(cacheKey)
    }
    
    const result = await crypto.encryptAES(data, key)
    
    // 管理缓存大小
    if (cache.value.size >= maxCacheSize) {
      const firstKey = cache.value.keys().next().value
      cache.value.delete(firstKey)
    }
    
    cache.value.set(cacheKey, result)
    return result
  }
  
  const clearCache = () => {
    cache.value.clear()
  }
  
  const cacheStats = computed(() => ({
    size: cache.value.size,
    maxSize: maxCacheSize,
    usage: (cache.value.size / maxCacheSize) * 100
  }))
  
  return {
    ...crypto,
    cachedEncrypt,
    clearCache,
    cacheStats
  }
}
```

## 错误处理策略

### 全局错误处理

```typescript
// plugins/cryptoErrorHandler.ts
import { App } from 'vue'

export default {
  install(app: App) {
    app.config.errorHandler = (error, instance, info) => {
      if (error.name === 'CryptoError') {
        // 处理加密相关错误
        console.error('加密错误:', error.message)
        
        // 发送错误报告
        if (process.env.NODE_ENV === 'production') {
          // sendErrorReport(error, info)
        }
        
        // 显示用户友好的错误消息
        // showNotification('加密操作失败，请重试')
      }
    }
  }
}
```

### 组件级错误边界

```vue
<!-- components/CryptoErrorBoundary.vue -->
<template>
  <div>
    <slot v-if="!hasError" />
    <div v-else class="error-boundary">
      <h3>🔒 加密功能暂时不可用</h3>
      <p>{{ errorMessage }}</p>
      <button @click="retry">重试</button>
      <button @click="reset">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorMessage = ref('')

onErrorCaptured((error) => {
  if (error.name === 'CryptoError' || error.message.includes('crypto')) {
    hasError.value = true
    errorMessage.value = error.message
    return false // 阻止错误继续传播
  }
})

const retry = () => {
  hasError.value = false
  errorMessage.value = ''
}

const reset = () => {
  hasError.value = false
  errorMessage.value = ''
  // 重置相关状态
}
</script>
```

## 测试最佳实践

### 单元测试

```typescript
// tests/composables/useCrypto.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useCrypto } from '@ldesign/crypto/vue'

describe('useCrypto', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const { encryptAES, decryptAES } = useCrypto()
    
    const testData = 'Hello, World!'
    const testKey = 'test-key'
    
    const encrypted = await encryptAES(testData, testKey)
    expect(encrypted.data).toBeTruthy()
    expect(encrypted.algorithm).toContain('AES')
    
    const decrypted = await decryptAES(encrypted, testKey)
    expect(decrypted.success).toBe(true)
    expect(decrypted.data).toBe(testData)
  })
  
  it('should handle encryption errors gracefully', async () => {
    const { encryptAES, lastError } = useCrypto()
    
    try {
      await encryptAES('', '') // 无效输入
    } catch (error) {
      expect(lastError.value).toBeTruthy()
    }
  })
})
```

## 部署注意事项

### 环境变量管理

```typescript
// config/env.ts
export const cryptoEnv = {
  // 从环境变量读取配置
  defaultKeySize: parseInt(process.env.VITE_CRYPTO_KEY_SIZE || '256'),
  enableDebugLogs: process.env.VITE_CRYPTO_DEBUG === 'true',
  apiEndpoint: process.env.VITE_CRYPTO_API_ENDPOINT,
  
  // 验证必需的环境变量
  validate() {
    const required = ['VITE_CRYPTO_API_ENDPOINT']
    const missing = required.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    }
  }
}
```

### 生产环境优化

```typescript
// 生产环境配置
if (process.env.NODE_ENV === 'production') {
  // 禁用调试日志
  console.log = () => {}
  console.debug = () => {}
  
  // 启用性能监控
  // enablePerformanceMonitoring()
  
  // 启用错误报告
  // enableErrorReporting()
}
```

这些最佳实践将帮助您在 Vue 3 项目中安全、高效地使用 @ldesign/crypto。
