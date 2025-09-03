<template>
  <div class="crypto-demo">
    <div class="crypto-header">
      <h1>🔐 Crypto 加密功能演示</h1>
      <p>展示 @ldesign/crypto 包在 @ldesign/engine 中的集成效果</p>
    </div>

    <div class="crypto-sections">
      <!-- AES 加密演示 -->
      <section class="crypto-section">
        <h2>🔑 AES 对称加密</h2>
        <div class="crypto-form">
          <div class="form-group">
            <label>原始文本：</label>
            <input 
              v-model="aesData.plaintext" 
              type="text" 
              placeholder="请输入要加密的文本"
              class="crypto-input"
            />
          </div>
          <div class="form-group">
            <label>密钥：</label>
            <input 
              v-model="aesData.key" 
              type="text" 
              placeholder="请输入密钥"
              class="crypto-input"
            />
          </div>
          <div class="form-actions">
            <button @click="handleAESEncrypt" class="crypto-btn primary">加密</button>
            <button @click="handleAESDecrypt" class="crypto-btn secondary">解密</button>
            <button @click="clearAESData" class="crypto-btn">清空</button>
          </div>
          <div class="form-group" v-if="aesData.encrypted">
            <label>加密结果：</label>
            <textarea 
              v-model="aesData.encrypted" 
              readonly 
              class="crypto-textarea"
              placeholder="加密结果将显示在这里"
            ></textarea>
          </div>
          <div class="form-group" v-if="aesData.decrypted">
            <label>解密结果：</label>
            <input 
              v-model="aesData.decrypted" 
              readonly 
              class="crypto-input"
              placeholder="解密结果将显示在这里"
            />
          </div>
        </div>
      </section>

      <!-- 哈希计算演示 -->
      <section class="crypto-section">
        <h2>🔍 哈希计算</h2>
        <div class="crypto-form">
          <div class="form-group">
            <label>输入文本：</label>
            <input 
              v-model="hashData.input" 
              type="text" 
              placeholder="请输入要计算哈希的文本"
              class="crypto-input"
            />
          </div>
          <div class="form-group">
            <label>哈希算法：</label>
            <select v-model="hashData.algorithm" class="crypto-select">
              <option value="md5">MD5</option>
              <option value="sha1">SHA1</option>
              <option value="sha256">SHA256</option>
              <option value="sha384">SHA384</option>
              <option value="sha512">SHA512</option>
            </select>
          </div>
          <div class="form-actions">
            <button @click="handleHashCalculate" class="crypto-btn primary">计算哈希</button>
            <button @click="clearHashData" class="crypto-btn">清空</button>
          </div>
          <div class="form-group" v-if="hashData.result">
            <label>哈希结果：</label>
            <textarea 
              v-model="hashData.result" 
              readonly 
              class="crypto-textarea"
              placeholder="哈希结果将显示在这里"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- Base64 编码演示 -->
      <section class="crypto-section">
        <h2>🔄 Base64 编码</h2>
        <div class="crypto-form">
          <div class="form-group">
            <label>原始文本：</label>
            <input 
              v-model="base64Data.input" 
              type="text" 
              placeholder="请输入要编码的文本"
              class="crypto-input"
            />
          </div>
          <div class="form-actions">
            <button @click="handleBase64Encode" class="crypto-btn primary">编码</button>
            <button @click="handleBase64Decode" class="crypto-btn secondary">解码</button>
            <button @click="clearBase64Data" class="crypto-btn">清空</button>
          </div>
          <div class="form-group" v-if="base64Data.encoded">
            <label>编码结果：</label>
            <textarea 
              v-model="base64Data.encoded" 
              readonly 
              class="crypto-textarea"
              placeholder="编码结果将显示在这里"
            ></textarea>
          </div>
          <div class="form-group" v-if="base64Data.decoded">
            <label>解码结果：</label>
            <input 
              v-model="base64Data.decoded" 
              readonly 
              class="crypto-input"
              placeholder="解码结果将显示在这里"
            />
          </div>
        </div>
      </section>

      <!-- 性能测试 -->
      <section class="crypto-section">
        <h2>⚡ 性能测试</h2>
        <div class="crypto-form">
          <div class="form-group">
            <label>测试数据大小：</label>
            <select v-model="performanceData.size" class="crypto-select">
              <option value="small">小数据 (100 字符)</option>
              <option value="medium">中等数据 (1000 字符)</option>
              <option value="large">大数据 (10000 字符)</option>
            </select>
          </div>
          <div class="form-actions">
            <button @click="handlePerformanceTest" class="crypto-btn primary">开始测试</button>
            <button @click="clearPerformanceData" class="crypto-btn">清空</button>
          </div>
          <div class="performance-results" v-if="performanceData.results.length > 0">
            <h3>测试结果：</h3>
            <div class="performance-item" v-for="result in performanceData.results" :key="result.operation">
              <span class="operation">{{ result.operation }}:</span>
              <span class="time">{{ result.time }}ms</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="crypto-error">
      <h3>❌ 错误信息</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="crypto-btn">清除错误</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useCrypto, useHash } from '@ldesign/crypto/vue'

// 使用 Composition API
const { encryptAES, decryptAES } = useCrypto()
const { md5, sha1, sha256, sha384, sha512 } = useHash()

// 响应式数据
const error = ref<string>('')

// AES 加密数据
const aesData = reactive({
  plaintext: 'Hello, LDesign Crypto!',
  key: 'my-secret-key-123',
  encrypted: '',
  decrypted: '',
  encryptResult: null as any // 存储完整的加密结果对象
})

// 哈希计算数据
const hashData = reactive({
  input: 'Hello, LDesign!',
  algorithm: 'sha256',
  result: ''
})

// Base64 编码数据
const base64Data = reactive({
  input: 'Hello, Base64!',
  encoded: '',
  decoded: ''
})

// 性能测试数据
const performanceData = reactive({
  size: 'small',
  results: [] as Array<{ operation: string; time: number }>
})

// AES 加密处理
const handleAESEncrypt = async () => {
  try {
    error.value = ''
    if (!aesData.plaintext || !aesData.key) {
      throw new Error('请输入原始文本和密钥')
    }

    const startTime = performance.now()
    const result = await encryptAES(aesData.plaintext, aesData.key)
    const endTime = performance.now()

    // 检查加密结果
    if (result && result.success && result.data) {
      aesData.encrypted = result.data
      aesData.encryptResult = result // 保存完整的加密结果对象
    } else {
      throw new Error(result?.error || '加密失败')
    }

    console.log(`AES 加密耗时: ${endTime - startTime}ms`)
  } catch (err) {
    error.value = `AES 加密失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// AES 解密处理
const handleAESDecrypt = async () => {
  try {
    error.value = ''
    if (!aesData.encryptResult || !aesData.key) {
      throw new Error('请先进行加密或输入密钥')
    }

    const startTime = performance.now()
    // 使用完整的加密结果对象进行解密
    const result = await decryptAES(aesData.encryptResult, aesData.key)
    const endTime = performance.now()

    // 检查解密结果
    if (result && result.success && result.data) {
      aesData.decrypted = result.data
    } else {
      throw new Error(result?.error || '解密失败')
    }

    console.log(`AES 解密耗时: ${endTime - startTime}ms`)
  } catch (err) {
    error.value = `AES 解密失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 哈希计算处理
const handleHashCalculate = async () => {
  try {
    error.value = ''
    if (!hashData.input) {
      throw new Error('请输入要计算哈希的文本')
    }
    
    const startTime = performance.now()
    let result = ''
    
    switch (hashData.algorithm) {
      case 'md5':
        result = await md5(hashData.input)
        break
      case 'sha1':
        result = await sha1(hashData.input)
        break
      case 'sha256':
        result = await sha256(hashData.input)
        break
      case 'sha384':
        result = await sha384(hashData.input)
        break
      case 'sha512':
        result = await sha512(hashData.input)
        break
      default:
        throw new Error('不支持的哈希算法')
    }
    
    hashData.result = result
    const endTime = performance.now()
    
    console.log(`${hashData.algorithm.toUpperCase()} 哈希计算耗时: ${endTime - startTime}ms`)
  } catch (err) {
    error.value = `哈希计算失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Base64 编码处理
const handleBase64Encode = () => {
  try {
    error.value = ''
    if (!base64Data.input) {
      throw new Error('请输入要编码的文本')
    }
    
    base64Data.encoded = btoa(unescape(encodeURIComponent(base64Data.input)))
  } catch (err) {
    error.value = `Base64 编码失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// Base64 解码处理
const handleBase64Decode = () => {
  try {
    error.value = ''
    if (!base64Data.encoded) {
      throw new Error('请先进行编码')
    }
    
    base64Data.decoded = decodeURIComponent(escape(atob(base64Data.encoded)))
  } catch (err) {
    error.value = `Base64 解码失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 性能测试处理
const handlePerformanceTest = async () => {
  try {
    error.value = ''
    performanceData.results = []
    
    // 生成测试数据
    const sizes = {
      small: 100,
      medium: 1000,
      large: 10000
    }
    
    const testData = 'A'.repeat(sizes[performanceData.size as keyof typeof sizes])
    const testKey = 'performance-test-key'
    
    // AES 加密性能测试
    const encryptStart = performance.now()
    const encryptResult = await encryptAES(testData, testKey)
    const encryptEnd = performance.now()

    if (!encryptResult?.success || !encryptResult?.data) {
      throw new Error('AES 加密失败')
    }

    performanceData.results.push({
      operation: 'AES 加密',
      time: Math.round((encryptEnd - encryptStart) * 100) / 100
    })

    // AES 解密性能测试 - 使用完整的加密结果对象
    const decryptStart = performance.now()
    const decryptResult = await decryptAES(encryptResult, testKey)
    const decryptEnd = performance.now()

    if (!decryptResult?.success || !decryptResult?.data) {
      throw new Error('AES 解密失败')
    }

    performanceData.results.push({
      operation: 'AES 解密',
      time: Math.round((decryptEnd - decryptStart) * 100) / 100
    })
    
    // SHA256 哈希性能测试
    const hashStart = performance.now()
    await sha256(testData)
    const hashEnd = performance.now()
    
    performanceData.results.push({
      operation: 'SHA256 哈希',
      time: Math.round((hashEnd - hashStart) * 100) / 100
    })
    
  } catch (err) {
    error.value = `性能测试失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 清空数据函数
const clearAESData = () => {
  aesData.plaintext = ''
  aesData.key = ''
  aesData.encrypted = ''
  aesData.decrypted = ''
  aesData.encryptResult = null
}

const clearHashData = () => {
  hashData.input = ''
  hashData.result = ''
}

const clearBase64Data = () => {
  base64Data.input = ''
  base64Data.encoded = ''
  base64Data.decoded = ''
}

const clearPerformanceData = () => {
  performanceData.results = []
}

const clearError = () => {
  error.value = ''
}
</script>

<style lang="less" scoped>
.crypto-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.crypto-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    color: var(--ldesign-brand-color);
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: 1.1rem;
  }
}

.crypto-sections {
  display: grid;
  gap: 30px;
}

.crypto-section {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--ldesign-shadow-1);

  h2 {
    color: var(--ldesign-brand-color);
    font-size: 1.5rem;
    margin-bottom: 20px;
    border-bottom: 2px solid var(--ldesign-brand-color-2);
    padding-bottom: 8px;
  }
}

.crypto-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    font-size: 0.9rem;
  }
}

.crypto-input,
.crypto-textarea,
.crypto-select {
  padding: 12px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);

  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
  }

  &::placeholder {
    color: var(--ldesign-text-color-placeholder);
  }
}

.crypto-textarea {
  min-height: 80px;
  resize: vertical;
  font-family: 'Courier New', monospace;
}

.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.crypto-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background: var(--ldesign-brand-color);
    color: white;

    &:hover {
      background: var(--ldesign-brand-color-hover);
    }

    &:active {
      background: var(--ldesign-brand-color-active);
    }
  }

  &.secondary {
    background: var(--ldesign-success-color);
    color: white;

    &:hover {
      background: var(--ldesign-success-color-hover);
    }

    &:active {
      background: var(--ldesign-success-color-active);
    }
  }

  &:not(.primary):not(.secondary) {
    background: var(--ldesign-gray-color-2);
    color: var(--ldesign-text-color-primary);

    &:hover {
      background: var(--ldesign-gray-color-3);
    }
  }
}

.performance-results {
  margin-top: 16px;
  padding: 16px;
  background: var(--ldesign-bg-color-component);
  border-radius: 6px;
  border: 1px solid var(--ldesign-border-color);

  h3 {
    margin: 0 0 12px 0;
    color: var(--ldesign-brand-color);
    font-size: 1.1rem;
  }
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--ldesign-border-color);

  &:last-child {
    border-bottom: none;
  }

  .operation {
    font-weight: 500;
    color: var(--ldesign-text-color-primary);
  }

  .time {
    font-family: 'Courier New', monospace;
    color: var(--ldesign-success-color);
    font-weight: 600;
  }
}

.crypto-error {
  margin-top: 30px;
  padding: 20px;
  background: var(--ldesign-error-color-1);
  border: 1px solid var(--ldesign-error-color);
  border-radius: 8px;

  h3 {
    margin: 0 0 10px 0;
    color: var(--ldesign-error-color);
  }

  p {
    margin: 0 0 15px 0;
    color: var(--ldesign-text-color-primary);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .crypto-demo {
    padding: 15px;
  }

  .crypto-header h1 {
    font-size: 2rem;
  }

  .crypto-section {
    padding: 16px;
  }

  .form-actions {
    flex-direction: column;
  }

  .crypto-btn {
    width: 100%;
  }
}
</style>
