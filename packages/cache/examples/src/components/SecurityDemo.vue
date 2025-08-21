<script setup lang="ts">
import { reactive, ref } from 'vue'
// import { createCache } from '@ldesign/cache'

// 临时模拟 createCache 功能
function createCache(options: any = {}) {
  return {
    set: async (key: string, value: any, opts?: any) => {
      let finalValue = value

      // 模拟加密
      if (opts?.encrypt && options.security?.encryption?.enabled) {
        finalValue = btoa(JSON.stringify(value)) // 简单的 base64 "加密"
      }

      const data = { value: finalValue, timestamp: Date.now(), ...opts }
      localStorage.setItem(`secure_${key}`, JSON.stringify(data))
    },
    get: async (key: string) => {
      const item = localStorage.getItem(`secure_${key}`)
      if (item) {
        const parsed = JSON.parse(item)
        let value = parsed.value

        // 模拟解密
        if (options.security?.encryption?.enabled) {
          try {
            value = JSON.parse(atob(value))
          }
          catch {
            // 如果不是加密数据，直接返回
          }
        }

        return value
      }
      return null
    },
    clear: async () => {
      const keysToRemove = Object.keys(localStorage).filter(key =>
        key.startsWith('secure_'),
      )
      keysToRemove.forEach(key => localStorage.removeItem(key))
    },
  }
}

// 安全配置
const securityConfig = reactive({
  encryption: true,
  obfuscation: true,
})

// 创建安全缓存管理器
let secureCache = createCache({
  security: {
    encryption: {
      enabled: securityConfig.encryption,
      secretKey: 'demo-secret-key-123',
    },
    obfuscation: {
      enabled: securityConfig.obfuscation,
      prefix: 'secure_',
    },
  },
  debug: true,
})

// 响应式数据
const loading = ref(false)
const error = ref<Error | null>(null)
const sensitiveData = ref('这是一些敏感的用户数据，包含密码: password123')
const encryptionResult = ref('')
const rawStorageData = ref('')
const keyToObfuscate = ref('user-secret-token')
const obfuscationResult = ref<{
  original: string
  obfuscated: string
  deobfuscated: string
} | null>(null)
const customEncryptionResult = ref<{
  original: string
  encrypted: string
  decrypted: string
} | null>(null)

// 更新安全配置
function updateSecurityConfig() {
  secureCache = createCache({
    security: {
      encryption: {
        enabled: securityConfig.encryption,
        secretKey: 'demo-secret-key-123',
      },
      obfuscation: {
        enabled: securityConfig.obfuscation,
        prefix: 'secure_',
      },
    },
    debug: true,
  })
}

// 加密存储数据
async function setEncryptedData() {
  loading.value = true
  error.value = null

  try {
    await secureCache.set('sensitive-data', sensitiveData.value, {
      encrypt: true,
    })

    encryptionResult.value = '数据已加密存储'
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 获取解密数据
async function getEncryptedData() {
  loading.value = true
  error.value = null

  try {
    const result = await secureCache.get('sensitive-data')
    encryptionResult.value = result || '数据不存在'
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 查看原始存储数据
async function viewRawData() {
  try {
    // 直接从 localStorage 读取原始数据
    const rawData
      = localStorage.getItem('secure_sensitive-data')
        || localStorage.getItem('ldesign_cache_sensitive-data')
        || '未找到原始数据'
    rawStorageData.value = rawData
  }
  catch (err) {
    error.value = err as Error
  }
}

// 测试键名混淆
async function testKeyObfuscation() {
  loading.value = true
  error.value = null

  try {
    // 设置数据以触发键名混淆
    await secureCache.set(keyToObfuscate.value, 'test-value', {
      obfuscateKey: true,
    })

    // 模拟混淆结果（实际中混淆是内部的）
    obfuscationResult.value = {
      original: keyToObfuscate.value,
      obfuscated: `secure_${btoa(keyToObfuscate.value).replace(/[+/=]/g, '')}`,
      deobfuscated: keyToObfuscate.value,
    }
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}

// 测试自定义加密
async function testCustomEncryption() {
  loading.value = true
  error.value = null

  try {
    // 创建使用自定义加密的缓存管理器
    const customCache = createCache({
      security: {
        encryption: {
          enabled: true,
          algorithm: 'custom',
          customEncrypt: (data: string) => {
            // 简单的自定义加密：反转字符串 + Base64
            return btoa(data.split('').reverse().join(''))
          },
          customDecrypt: (data: string) => {
            // 对应的解密：Base64解码 + 反转字符串
            return atob(data).split('').reverse().join('')
          },
        },
      },
    })

    const originalData = '自定义加密测试数据'

    // 设置和获取数据
    await customCache.set('custom-encrypted', originalData)
    const decryptedData = await customCache.get('custom-encrypted')

    customEncryptionResult.value = {
      original: originalData,
      encrypted: btoa(originalData.split('').reverse().join('')),
      decrypted: decryptedData || '解密失败',
    }
  }
  catch (err) {
    error.value = err as Error
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="demo-card">
    <h3>🔒 安全功能演示</h3>
    <p>演示数据加密和键名混淆功能</p>

    <div class="demo-section">
      <h4>数据加密</h4>
      <textarea
        v-model="sensitiveData"
        placeholder="输入敏感数据..."
        rows="3"
        style="
          width: 100%;
          margin-bottom: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        "
      />
      <div>
        <button class="btn" @click="setEncryptedData">
          加密存储
        </button>
        <button class="btn secondary" @click="getEncryptedData">
          获取解密
        </button>
        <button class="btn secondary" @click="viewRawData">
          查看原始存储
        </button>
      </div>

      <div v-if="encryptionResult" class="code">
        <div><strong>解密结果:</strong> {{ encryptionResult }}</div>
      </div>

      <div v-if="rawStorageData" class="code">
        <div><strong>原始存储数据:</strong></div>
        <div style="word-break: break-all; font-size: 11px">
          {{ rawStorageData }}
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>键名混淆</h4>
      <input
        v-model="keyToObfuscate"
        placeholder="输入键名"
        style="
          margin-right: 10px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        "
      >
      <button class="btn" @click="testKeyObfuscation">
        测试混淆
      </button>

      <div v-if="obfuscationResult" class="code">
        <div><strong>原始键名:</strong> {{ obfuscationResult.original }}</div>
        <div><strong>混淆键名:</strong> {{ obfuscationResult.obfuscated }}</div>
        <div>
          <strong>反混淆结果:</strong> {{ obfuscationResult.deobfuscated }}
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>自定义加密算法</h4>
      <button class="btn" @click="testCustomEncryption">
        自定义加密演示
      </button>

      <div v-if="customEncryptionResult" class="code">
        <div>
          <strong>原始数据:</strong> {{ customEncryptionResult.original }}
        </div>
        <div>
          <strong>自定义加密:</strong> {{ customEncryptionResult.encrypted }}
        </div>
        <div>
          <strong>解密结果:</strong> {{ customEncryptionResult.decrypted }}
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h4>安全配置</h4>
      <div class="security-config">
        <label>
          <input
            v-model="securityConfig.encryption"
            type="checkbox"
            @change="updateSecurityConfig"
          >
          启用数据加密
        </label>
        <label>
          <input
            v-model="securityConfig.obfuscation"
            type="checkbox"
            @change="updateSecurityConfig"
          >
          启用键名混淆
        </label>
      </div>

      <div class="status info">
        当前配置: 加密 {{ securityConfig.encryption ? '✅' : '❌' }}, 混淆
        {{ securityConfig.obfuscation ? '✅' : '❌' }}
      </div>
    </div>

    <div v-if="loading" class="status info">
      处理中...
    </div>

    <div v-if="error" class="status error">
      错误: {{ error.message }}
    </div>
  </div>
</template>

<style scoped>
.security-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.security-config label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.security-config input[type='checkbox'] {
  margin: 0;
}

textarea {
  font-family: inherit;
  font-size: 14px;
}

.code {
  max-height: 200px;
  overflow-y: auto;
}

.code div {
  margin-bottom: 4px;
}
</style>
