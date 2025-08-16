<script setup lang="ts">
import { cryptoManager, type EncryptionAlgorithm, hash } from '@ldesign/crypto'
import { computed, onMounted, ref } from 'vue'

// 当前选中的算法
const selectedAlgorithm = ref<EncryptionAlgorithm>('AES')
const algorithms = ['AES', 'DES', '3DES', 'Blowfish', 'RSA'] as const

// 通用状态
const plaintext = ref('Hello, LDesign Crypto!')
const key = ref('')
const encrypted = ref('')
const decrypted = ref('')
const isProcessing = ref(false)
const error = ref('')
const success = ref('')

// 算法特定选项
const aesOptions = ref({
  mode: 'CBC',
  keySize: 256,
})

const desOptions = ref({
  mode: 'CBC',
})

const tripleDesOptions = ref({
  mode: 'CBC',
})

const blowfishOptions = ref({
  mode: 'CBC',
})

const rsaOptions = ref({
  keySize: 2048,
})

// 哈希相关
const hashInput = ref('Hello, Hash!')
const hashAlgorithm = ref('SHA256')
const hashResult = ref('')
const hashAlgorithms = ['MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512']

// RSA 密钥对
const rsaKeyPair = ref<any>(null)

// 计算属性
const currentOptions = computed(() => {
  switch (selectedAlgorithm.value) {
    case 'AES':
      return aesOptions.value
    case 'DES':
      return desOptions.value
    case '3DES':
      return tripleDesOptions.value
    case 'Blowfish':
      return blowfishOptions.value
    case 'RSA':
      return rsaOptions.value
    default:
      return {}
  }
})

const keyPlaceholder = computed(() => {
  switch (selectedAlgorithm.value) {
    case 'AES':
      return '输入 AES 密钥（任意长度）'
    case 'DES':
      return '输入 DES 密钥（8字节）'
    case '3DES':
      return '输入 3DES 密钥（24字节）'
    case 'Blowfish':
      return '输入 Blowfish 密钥（4-56字节）'
    case 'RSA':
      return 'RSA 使用密钥对，无需手动输入'
    default:
      return '输入密钥'
  }
})

const isRSA = computed(() => selectedAlgorithm.value === 'RSA')

// 方法
async function generateRandomKey() {
  try {
    if (selectedAlgorithm.value === 'RSA') {
      isProcessing.value = true
      const keyPair = await cryptoManager.generateKey(
        'RSA',
        rsaOptions.value.keySize,
      )
      rsaKeyPair.value = keyPair
      success.value = 'RSA 密钥对生成成功'
    }
    else {
      const generatedKey = cryptoManager.generateKey(selectedAlgorithm.value)
      key.value = generatedKey as string
      success.value = `${selectedAlgorithm.value} 密钥生成成功`
    }
    error.value = ''
  }
  catch (err) {
    error.value = `密钥生成失败: ${
      err instanceof Error ? err.message : '未知错误'
    }`
    success.value = ''
  }
  finally {
    isProcessing.value = false
  }
}

async function encryptData() {
  if (!plaintext.value.trim()) {
    error.value = '请输入要加密的文本'
    return
  }

  if (!isRSA.value && !key.value.trim()) {
    error.value = '请输入密钥或生成密钥'
    return
  }

  if (isRSA.value && !rsaKeyPair.value) {
    error.value = '请先生成 RSA 密钥对'
    return
  }

  try {
    isProcessing.value = true
    error.value = ''

    let result
    if (isRSA.value) {
      result = await cryptoManager.encryptData(
        plaintext.value,
        rsaKeyPair.value.publicKey,
        'RSA',
        currentOptions.value,
      )
    }
    else {
      result = await cryptoManager.encryptData(
        plaintext.value,
        key.value,
        selectedAlgorithm.value,
        currentOptions.value,
      )
    }

    if (result.success) {
      encrypted.value = JSON.stringify(result, null, 2)
      success.value = `${selectedAlgorithm.value} 加密成功`
    }
    else {
      error.value = result.error || '加密失败'
    }
  }
  catch (err) {
    error.value = `加密失败: ${err instanceof Error ? err.message : '未知错误'}`
  }
  finally {
    isProcessing.value = false
  }
}

async function decryptData() {
  if (!encrypted.value.trim()) {
    error.value = '请先加密数据'
    return
  }

  try {
    isProcessing.value = true
    error.value = ''

    const encryptedData = JSON.parse(encrypted.value)
    let result

    if (isRSA.value) {
      result = await cryptoManager.decryptData(
        encryptedData,
        rsaKeyPair.value.privateKey,
        'RSA',
      )
    }
    else {
      result = await cryptoManager.decryptData(encryptedData, key.value)
    }

    if (result.success) {
      decrypted.value = result.data || ''
      success.value = `${selectedAlgorithm.value} 解密成功`
    }
    else {
      error.value = result.error || '解密失败'
    }
  }
  catch (err) {
    error.value = `解密失败: ${err instanceof Error ? err.message : '未知错误'}`
  }
  finally {
    isProcessing.value = false
  }
}

async function calculateHash() {
  if (!hashInput.value.trim()) {
    error.value = '请输入要哈希的文本'
    return
  }

  try {
    let result: string

    // 根据算法调用对应的方法
    switch (hashAlgorithm.value) {
      case 'MD5':
        result = hash.md5(hashInput.value)
        break
      case 'SHA1':
        result = hash.sha1(hashInput.value)
        break
      case 'SHA224':
        result = hash.sha224(hashInput.value)
        break
      case 'SHA256':
        result = hash.sha256(hashInput.value)
        break
      case 'SHA384':
        result = hash.sha384(hashInput.value)
        break
      case 'SHA512':
        result = hash.sha512(hashInput.value)
        break
      default:
        result = hash.sha256(hashInput.value)
    }

    hashResult.value = result
    success.value = `${hashAlgorithm.value} 哈希计算成功`
    error.value = ''
  }
  catch (err) {
    error.value = `哈希计算失败: ${
      err instanceof Error ? err.message : '未知错误'
    }`
  }
}

function clearAll() {
  plaintext.value = 'Hello, LDesign Crypto!'
  key.value = ''
  encrypted.value = ''
  decrypted.value = ''
  error.value = ''
  success.value = ''
  rsaKeyPair.value = null
}

// 复制到剪贴板函数
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    success.value = '已复制到剪贴板'
    setTimeout(() => {
      success.value = ''
    }, 2000)
  }
  catch (err) {
    error.value = '复制失败，请手动复制'
  }
}

function onAlgorithmChange() {
  clearAll()
  // 为不同算法设置默认密钥
  switch (selectedAlgorithm.value) {
    case 'AES':
      key.value = 'my-aes-secret-key-256'
      break
    case 'DES':
      key.value = 'secret12'
      break
    case '3DES':
      key.value = 'secret123456789012345678'
      break
    case 'Blowfish':
      key.value = 'my-blowfish-key'
      break
    case 'RSA':
      key.value = ''
      break
  }
}

onMounted(() => {
  onAlgorithmChange()
})
</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <div class="container">
        <h1>🔐 LDesign Crypto 演示</h1>
        <p>全面的加解密算法演示 - 支持 AES、DES、3DES、Blowfish、RSA</p>
      </div>
    </header>

    <div class="container">
      <!-- 算法选择 -->
      <div class="algorithm-selector">
        <h2>选择加密算法</h2>
        <div class="algorithm-tabs">
          <button
            v-for="algorithm in algorithms"
            :key="algorithm"
            class="tab"
            :class="[{ active: selectedAlgorithm === algorithm }]"
            @click="
              selectedAlgorithm = algorithm
              onAlgorithmChange()
            "
          >
            {{ algorithm }}
          </button>
        </div>
      </div>

      <!-- 加密解密区域 -->
      <div class="crypto-section">
        <div class="card">
          <h3>{{ selectedAlgorithm }} 加密演示</h3>

          <div class="form-grid">
            <!-- 输入区域 -->
            <div class="input-area">
              <div class="form-group">
                <label>明文数据</label>
                <textarea
                  v-model="plaintext"
                  placeholder="输入要加密的文本"
                  rows="4"
                />
              </div>

              <div v-if="!isRSA" class="form-group">
                <label>密钥</label>
                <div class="key-input">
                  <input
                    v-model="key"
                    :placeholder="keyPlaceholder"
                    type="text"
                  >
                  <button class="btn-small" @click="generateRandomKey">
                    生成
                  </button>
                </div>
                <small class="key-info">当前密钥长度: {{ key.length }} 字符</small>
              </div>

              <!-- RSA 密钥对显示 -->
              <div v-if="isRSA && rsaKeyPair" class="form-group">
                <label>RSA 密钥对</label>
                <div class="key-pair-info">
                  <div>✅ 密钥对已生成 ({{ rsaOptions.keySize }} 位)</div>
                  <small>公钥用于加密，私钥用于解密</small>
                </div>
              </div>

              <!-- 算法选项 -->
              <div class="form-group">
                <label>算法选项</label>
                <div class="options">
                  <div v-if="selectedAlgorithm === 'AES'" class="option-group">
                    <select v-model="aesOptions.mode">
                      <option value="CBC">
                        CBC
                      </option>
                      <option value="ECB">
                        ECB
                      </option>
                      <option value="CFB">
                        CFB
                      </option>
                      <option value="OFB">
                        OFB
                      </option>
                    </select>
                    <select v-model="aesOptions.keySize">
                      <option :value="128">
                        AES-128
                      </option>
                      <option :value="192">
                        AES-192
                      </option>
                      <option :value="256">
                        AES-256
                      </option>
                    </select>
                  </div>

                  <div
                    v-else-if="selectedAlgorithm === 'DES'"
                    class="option-group"
                  >
                    <select v-model="desOptions.mode">
                      <option value="CBC">
                        CBC
                      </option>
                      <option value="ECB">
                        ECB
                      </option>
                      <option value="CFB">
                        CFB
                      </option>
                      <option value="OFB">
                        OFB
                      </option>
                    </select>
                  </div>

                  <div
                    v-else-if="selectedAlgorithm === '3DES'"
                    class="option-group"
                  >
                    <select v-model="tripleDesOptions.mode">
                      <option value="CBC">
                        CBC
                      </option>
                      <option value="ECB">
                        ECB
                      </option>
                      <option value="CFB">
                        CFB
                      </option>
                      <option value="OFB">
                        OFB
                      </option>
                    </select>
                  </div>

                  <div
                    v-else-if="selectedAlgorithm === 'Blowfish'"
                    class="option-group"
                  >
                    <select v-model="blowfishOptions.mode">
                      <option value="CBC">
                        CBC
                      </option>
                      <option value="ECB">
                        ECB
                      </option>
                    </select>
                  </div>

                  <div
                    v-else-if="selectedAlgorithm === 'RSA'"
                    class="option-group"
                  >
                    <select v-model="rsaOptions.keySize">
                      <option :value="1024">
                        1024 位
                      </option>
                      <option :value="2048">
                        2048 位
                      </option>
                      <option :value="3072">
                        3072 位
                      </option>
                      <option :value="4096">
                        4096 位
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="button-group">
                <button
                  v-if="isRSA && !rsaKeyPair"
                  :disabled="isProcessing"
                  class="btn btn-primary"
                  @click="generateRandomKey"
                >
                  {{ isProcessing ? '生成中...' : '生成密钥对' }}
                </button>

                <button
                  :disabled="isProcessing || (isRSA && !rsaKeyPair)"
                  class="btn btn-primary"
                  @click="encryptData"
                >
                  {{ isProcessing ? '加密中...' : '🔒 加密' }}
                </button>

                <button
                  :disabled="isProcessing || !encrypted"
                  class="btn btn-secondary"
                  @click="decryptData"
                >
                  {{ isProcessing ? '解密中...' : '🔓 解密' }}
                </button>

                <button class="btn btn-outline" @click="clearAll">
                  🗑️ 清空
                </button>
              </div>
            </div>

            <!-- 结果区域 -->
            <div class="result-area">
              <!-- 状态消息 -->
              <div v-if="error" class="message error">
                ❌ {{ error }}
              </div>

              <div v-if="success" class="message success">
                ✅ {{ success }}
              </div>

              <!-- 加密结果 -->
              <div v-if="encrypted" class="result-box">
                <h4>🔒 加密结果</h4>
                <pre class="code-block">{{ encrypted }}</pre>
                <button class="btn-copy" @click="copyToClipboard(encrypted)">
                  📋 复制
                </button>
              </div>

              <!-- 解密结果 -->
              <div v-if="decrypted" class="result-box success">
                <h4>🔓 解密结果</h4>
                <div class="decrypted-text">
                  {{ decrypted }}
                </div>
              </div>

              <!-- 处理中状态 -->
              <div v-if="isProcessing" class="loading">
                <div class="spinner" />
                <span>处理中...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 哈希算法演示 -->
      <div class="hash-section">
        <div class="card">
          <h3>🔍 哈希算法演示</h3>

          <div class="form-grid">
            <div class="input-area">
              <div class="form-group">
                <label>输入数据</label>
                <textarea
                  v-model="hashInput"
                  placeholder="输入要计算哈希的文本"
                  rows="3"
                />
              </div>

              <div class="form-group">
                <label>哈希算法</label>
                <select v-model="hashAlgorithm">
                  <option
                    v-for="algo in hashAlgorithms"
                    :key="algo"
                    :value="algo"
                  >
                    {{ algo }}
                  </option>
                </select>
              </div>

              <div class="button-group">
                <button class="btn btn-primary" @click="calculateHash">
                  🔍 计算哈希
                </button>
              </div>
            </div>

            <div class="result-area">
              <div v-if="hashResult" class="result-box">
                <h4>{{ hashAlgorithm }} 哈希值</h4>
                <div class="hash-result">
                  {{ hashResult }}
                </div>
                <button class="btn-copy" @click="copyToClipboard(hashResult)">
                  📋 复制
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 性能统计 -->
      <div class="stats-section">
        <div class="card">
          <h3>📊 性能统计</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">
                支持的算法
              </div>
              <div class="stat-value">
                {{ algorithms.length }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">
                当前算法
              </div>
              <div class="stat-value">
                {{ selectedAlgorithm }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">
                密钥长度
              </div>
              <div class="stat-value">
                {{
                  isRSA
                    ? rsaKeyPair
                      ? `${rsaOptions.keySize} 位`
                      : '未生成'
                    : `${key.length} 字符`
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    sans-serif;
}

.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem 0;
  text-align: center;
  color: white;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header p {
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* 算法选择器 */
.algorithm-selector {
  margin: 2rem 0;
}

.algorithm-selector h2 {
  color: white;
  margin-bottom: 1rem;
  text-align: center;
}

.algorithm-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tab {
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.tab.active {
  background: white;
  color: #667eea;
  border-color: white;
}

/* 卡片样式 */
.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.card h3 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
}

/* 表单网格 */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

/* 表单组件 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.key-input {
  display: flex;
  gap: 0.5rem;
}

.key-input input {
  flex: 1;
}

.key-info {
  color: #666;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.key-pair-info {
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  color: #0369a1;
}

/* 选项组 */
.options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.option-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.option-group select {
  width: auto;
  min-width: 120px;
}

/* 按钮样式 */
.button-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5a67d8;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #48bb78;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #38a169;
  transform: translateY(-2px);
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
  background: #667eea;
  color: white;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-small:hover {
  background: #38a169;
}

.btn-copy {
  padding: 0.5rem 1rem;
  background: #ed8936;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.btn-copy:hover {
  background: #dd6b20;
}

/* 消息样式 */
.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: 500;
}

.message.success {
  background: #f0fff4;
  color: #22543d;
  border: 1px solid #9ae6b4;
}

.message.error {
  background: #fed7d7;
  color: #742a2a;
  border: 1px solid #feb2b2;
}

/* 结果框 */
.result-box {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.result-box.success {
  background: #f0fff4;
  border-color: #9ae6b4;
}

.result-box h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
}

.code-block {
  background: #1a202c;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.decrypted-text {
  font-size: 1.1rem;
  color: #22543d;
  font-weight: 500;
  padding: 1rem;
  background: #c6f6d5;
  border-radius: 6px;
}

.hash-result {
  font-family: 'Fira Code', monospace;
  font-size: 0.875rem;
  background: #1a202c;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  word-break: break-all;
}

/* 加载动画 */
.loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #667eea;
  font-weight: 500;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1.5rem;
  background: #f7fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

/* 响应式设计 */
@media (max-width: 640px) {
  .header h1 {
    font-size: 2rem;
  }

  .card {
    padding: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }
}
</style>
