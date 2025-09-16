<template>
  <div class="crypto-demo">
    <div class="page-header">
      <h1>🔐 加密功能演示</h1>
      <p>测试 @ldesign/crypto 包的各种功能和集成效果</p>
    </div>

    <div class="test-sections">
      <!-- AES 加密演示 -->
      <section class="test-section">
        <h2>🔑 AES 对称加密</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>原始文本:</strong> {{ aesPlaintext || '未设置' }}</p>
            <p><strong>加密密钥:</strong> {{ aesKey || '未设置' }}</p>
            <p><strong>加密结果:</strong> {{ aesEncrypted || '无' }}</p>
            <p><strong>解密结果:</strong> {{ aesDecrypted || '无' }}</p>
          </div>
          <div class="controls">
            <input
              v-model="aesPlaintext"
              placeholder="输入要加密的文本"
              class="input-field"
            />
            <input
              v-model="aesKey"
              placeholder="输入加密密钥"
              class="input-field"
            />
            <button @click="encryptAES" class="btn btn-primary">AES 加密</button>
            <button @click="decryptAES" class="btn btn-secondary">AES 解密</button>
            <button @click="clearAES" class="btn btn-warning">清空</button>
          </div>
        </div>
      </section>

      <!-- Base64 编码演示 -->
      <section class="test-section">
        <h2>📝 Base64 编码</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>原始文本:</strong> {{ base64Text || '未设置' }}</p>
            <p><strong>编码结果:</strong> {{ base64Encoded || '无' }}</p>
            <p><strong>解码结果:</strong> {{ base64Decoded || '无' }}</p>
          </div>
          <div class="controls">
            <input
              v-model="base64Text"
              placeholder="输入要编码的文本"
              class="input-field"
            />
            <button @click="encodeBase64" class="btn btn-primary">Base64 编码</button>
            <button @click="decodeBase64" class="btn btn-secondary">Base64 解码</button>
            <button @click="clearBase64" class="btn btn-warning">清空</button>
          </div>
        </div>
      </section>

      <!-- 哈希演示 -->
      <section class="test-section">
        <h2>🔍 哈希算法</h2>
        <div class="test-content">
          <div class="state-display">
            <p><strong>原始文本:</strong> {{ hashText || '未设置' }}</p>
            <p><strong>MD5 哈希:</strong> {{ md5Hash || '无' }}</p>
            <p><strong>SHA256 哈希:</strong> {{ sha256Hash || '无' }}</p>
          </div>
          <div class="controls">
            <input
              v-model="hashText"
              placeholder="输入要计算哈希的文本"
              class="input-field"
            />
            <button @click="calculateMD5" class="btn btn-primary">计算 MD5</button>
            <button @click="calculateSHA256" class="btn btn-secondary">计算 SHA256</button>
            <button @click="clearHash" class="btn btn-warning">清空</button>
          </div>
        </div>
      </section>

      <!-- 加密统计 -->
      <section class="test-section">
        <h2>📊 加密统计</h2>
        <div class="test-content">
          <div class="info-grid">
            <div class="info-item">
              <strong>操作次数:</strong>
              <span class="status-success">{{ stats.operations }}</span>
            </div>
            <div class="info-item">
              <strong>平均耗时:</strong>
              <span class="status-success">{{ stats.avgTime }}ms</span>
            </div>
            <div class="info-item">
              <strong>处理数据:</strong>
              <span class="status-success">{{ stats.dataSize }}</span>
            </div>
            <div class="info-item">
              <strong>当前算法:</strong>
              <span class="status-success">{{ currentAlgorithm }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance } from 'vue'

// 获取当前组件实例
const instance = getCurrentInstance()

// 获取加密引擎实例
const crypto = instance?.appContext.app.config.globalProperties.$crypto

// AES 加密相关
const aesPlaintext = ref('')
const aesKey = ref('')
const aesEncrypted = ref('')
const aesDecrypted = ref('')

// Base64 编码相关
const base64Text = ref('')
const base64Encoded = ref('')
const base64Decoded = ref('')

// 哈希相关
const hashText = ref('')
const md5Hash = ref('')
const sha256Hash = ref('')

// 统计数据
const stats = reactive({
  operations: 0,
  avgTime: 0,
  dataSize: '0 B',
  totalTime: 0
})

const currentAlgorithm = ref('未知')

// AES 加密操作
const encryptAES = async () => {
  if (!crypto) {
    aesEncrypted.value = '加密引擎未初始化'
    return
  }
  
  try {
    const startTime = performance.now()
    aesEncrypted.value = await crypto.aes.encrypt(aesPlaintext.value, aesKey.value)
    const endTime = performance.now()
    updateStats(endTime - startTime, aesPlaintext.value.length)
  } catch (error) {
    aesEncrypted.value = `加密失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const decryptAES = async () => {
  if (!crypto) {
    aesDecrypted.value = '加密引擎未初始化'
    return
  }
  
  try {
    const startTime = performance.now()
    aesDecrypted.value = await crypto.aes.decrypt(aesEncrypted.value, aesKey.value)
    const endTime = performance.now()
    updateStats(endTime - startTime, aesEncrypted.value.length)
  } catch (error) {
    aesDecrypted.value = `解密失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const clearAES = () => {
  aesPlaintext.value = ''
  aesKey.value = ''
  aesEncrypted.value = ''
  aesDecrypted.value = ''
}

// Base64 编码操作
const encodeBase64 = async () => {
  if (!crypto) {
    base64Encoded.value = '加密引擎未初始化'
    return
  }
  
  try {
    const startTime = performance.now()
    base64Encoded.value = await crypto.base64.encode(base64Text.value)
    const endTime = performance.now()
    updateStats(endTime - startTime, base64Text.value.length)
  } catch (error) {
    base64Encoded.value = `编码失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const decodeBase64 = async () => {
  if (!crypto) {
    base64Decoded.value = '加密引擎未初始化'
    return
  }
  
  try {
    const startTime = performance.now()
    base64Decoded.value = await crypto.base64.decode(base64Encoded.value)
    const endTime = performance.now()
    updateStats(endTime - startTime, base64Encoded.value.length)
  } catch (error) {
    base64Decoded.value = `解码失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const clearBase64 = () => {
  base64Text.value = ''
  base64Encoded.value = ''
  base64Decoded.value = ''
}

// 哈希计算操作
const calculateMD5 = async () => {
  if (!crypto) {
    md5Hash.value = '加密引擎未初始化'
    return
  }
  
  try {
    const startTime = performance.now()
    md5Hash.value = await crypto.hash.md5(hashText.value)
    const endTime = performance.now()
    updateStats(endTime - startTime, hashText.value.length)
  } catch (error) {
    md5Hash.value = `计算失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const calculateSHA256 = async () => {
  if (!crypto) {
    sha256Hash.value = '加密引擎未初始化'
    return
  }
  
  try {
    const startTime = performance.now()
    sha256Hash.value = await crypto.hash.sha256(hashText.value)
    const endTime = performance.now()
    updateStats(endTime - startTime, hashText.value.length)
  } catch (error) {
    sha256Hash.value = `计算失败: ${error instanceof Error ? error.message : String(error)}`
  }
}

const clearHash = () => {
  hashText.value = ''
  md5Hash.value = ''
  sha256Hash.value = ''
}

// 更新统计信息
const updateStats = (operationTime: number, dataLength: number) => {
  stats.operations++
  stats.totalTime += operationTime
  stats.avgTime = Number((stats.totalTime / stats.operations).toFixed(3))
  stats.dataSize = formatBytes(dataLength)
}

// 格式化字节大小
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时初始化
onMounted(() => {
  if (crypto) {
    currentAlgorithm.value = 'AES-256-GCM'
  }
})
</script>

<style scoped lang="less">
.crypto-demo {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: 8px;
  }
  
  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 16px;
  }
}

.test-sections {
  display: grid;
  gap: 24px;
}

.test-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 24px;
  
  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: 16px;
    font-size: 18px;
  }
}

.test-content {
  display: grid;
  gap: 16px;
}

.state-display {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  padding: 16px;
  
  p {
    margin: 8px 0;
    color: var(--ldesign-text-color-primary);
    word-break: break-all;
    
    strong {
      color: var(--ldesign-brand-color);
    }
  }
}

.controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.input-field {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &.btn-primary {
    background: var(--ldesign-brand-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-brand-color-hover);
    }
  }
  
  &.btn-secondary {
    background: var(--ldesign-gray-color-6);
    color: white;
    
    &:hover {
      background: var(--ldesign-gray-color-7);
    }
  }
  
  &.btn-warning {
    background: var(--ldesign-warning-color);
    color: white;
    
    &:hover {
      background: var(--ldesign-warning-color-hover);
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  
  strong {
    color: var(--ldesign-text-color-primary);
  }
}

.status-success {
  color: var(--ldesign-success-color);
  font-weight: 500;
}
</style>
