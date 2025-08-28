<script setup lang="ts">
import { ref } from 'vue'

// 加解密状态
const isProcessing = ref(false)
const result = ref<string>('')
const errorMessage = ref('')

// 输入文本和密钥
const inputText = ref('')
const encryptionKey = ref('')

// 操作模式：encrypt 或 decrypt
const mode = ref<'encrypt' | 'decrypt'>('encrypt')

// 加密算法选择
const algorithm = ref('AES')
const availableAlgorithms = ['AES', 'DES', 'Base64', 'Caesar']


// 切换模式
function toggleMode() {
  mode.value = mode.value === 'encrypt' ? 'decrypt' : 'encrypt'
  result.value = ''
  errorMessage.value = ''
}

// 处理加密/解密
async function handleProcess() {
  if (!inputText.value.trim()) {
    errorMessage.value = '请输入要处理的文本'
    return
  }

  if (algorithm.value !== 'Base64' && !encryptionKey.value.trim()) {
    errorMessage.value = '请输入密钥'
    return
  }

  isProcessing.value = true
  errorMessage.value = ''

  try {
    // 模拟处理过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (mode.value === 'encrypt') {
      result.value = await performEncryption(inputText.value, encryptionKey.value, algorithm.value)
    } else {
      result.value = await performDecryption(inputText.value, encryptionKey.value, algorithm.value)
    }
  } catch (error) {
    errorMessage.value = `${mode.value === 'encrypt' ? '加密' : '解密'}失败：${error instanceof Error ? error.message : '未知错误'}`
    console.error('处理错误:', error)
  } finally {
    isProcessing.value = false
  }
}

// 安全的Base64编码函数，支持Unicode字符
function safeBase64Encode(str: string): string {
  try {
    // 使用encodeURIComponent处理Unicode字符，然后进行Base64编码
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16))
    }))
  } catch (error) {
    // 如果还是失败，使用TextEncoder
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    return btoa(String.fromCharCode(...data))
  }
}

// 模拟加密函数
async function performEncryption(text: string, key: string, algo: string): Promise<string> {
  switch (algo) {
    case 'AES':
      return `AES_ENCRYPTED:${safeBase64Encode(text + key).split('').reverse().join('')}`
    case 'DES':
      return `DES_ENCRYPTED:${safeBase64Encode(text + key)}`
    case 'Base64':
      return safeBase64Encode(text)
    case 'Caesar':
      const shift = key ? parseInt(key) || 3 : 3
      return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0)
          const base = code >= 65 && code <= 90 ? 65 : 97
          return String.fromCharCode(((code - base + shift) % 26) + base)
        }
        return char
      }).join('')
    default:
      throw new Error('不支持的加密算法')
  }
}

// 安全的Base64解码函数，支持Unicode字符
function safeBase64Decode(str: string): string {
  try {
    // 先进行Base64解码，然后使用decodeURIComponent处理Unicode字符
    const decoded = atob(str)
    return decodeURIComponent(decoded.split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
  } catch (error) {
    // 如果失败，尝试使用TextDecoder
    try {
      const decoded = atob(str)
      const bytes = new Uint8Array(decoded.length)
      for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i)
      }
      const decoder = new TextDecoder()
      return decoder.decode(bytes)
    } catch {
      // 最后的备选方案
      return atob(str)
    }
  }
}

// 模拟解密函数
async function performDecryption(text: string, key: string, algo: string): Promise<string> {
  switch (algo) {
    case 'AES':
      if (!text.startsWith('AES_ENCRYPTED:')) {
        throw new Error('无效的AES加密格式')
      }
      const aesEncrypted = text.replace('AES_ENCRYPTED:', '')
      const aesDecoded = safeBase64Decode(aesEncrypted.split('').reverse().join(''))
      return aesDecoded.replace(key, '')
    case 'DES':
      if (!text.startsWith('DES_ENCRYPTED:')) {
        throw new Error('无效的DES加密格式')
      }
      const desEncrypted = text.replace('DES_ENCRYPTED:', '')
      const desDecoded = safeBase64Decode(desEncrypted)
      return desDecoded.replace(key, '')
    case 'Base64':
      return safeBase64Decode(text)
    case 'Caesar':
      const shift = key ? parseInt(key) || 3 : 3
      return text.split('').map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0)
          const base = code >= 65 && code <= 90 ? 65 : 97
          return String.fromCharCode(((code - base - shift + 26) % 26) + base)
        }
        return char
      }).join('')
    default:
      throw new Error('不支持的解密算法')
  }
}

// 复制结果到剪贴板
async function copyResult() {
  if (!result.value) return

  try {
    await navigator.clipboard.writeText(result.value)
    // 简单的成功提示
    const originalText = result.value
    result.value = '✅ 已复制到剪贴板'
    setTimeout(() => {
      result.value = originalText
    }, 1000)
  } catch (error) {
    console.error('复制失败:', error)
    errorMessage.value = '复制到剪贴板失败'
  }
}

// 清空所有内容
function clearAll() {
  inputText.value = ''
  encryptionKey.value = ''
  result.value = ''
  errorMessage.value = ''
}

// 交换输入和输出
function swapInputOutput() {
  if (!result.value) return

  const temp = inputText.value
  inputText.value = result.value
  result.value = temp

  // 切换模式
  toggleMode()
}
</script>

<template>
  <div class="decrypt-page">
    <div class="decrypt-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>� 字符串加解密</h1>
        <p>安全的文本加解密工具 - Engine Router Demo</p>
      </div>

      <!-- 加解密表单 -->
      <div class="decrypt-form">
        <!-- 模式切换 -->
        <div class="mode-section">
          <div class="mode-toggle">
            <button
              :class="{ active: mode === 'encrypt' }"
              @click="mode = 'encrypt'; result = ''; errorMessage = ''"
            >
              🔒 加密模式
            </button>
            <button
              :class="{ active: mode === 'decrypt' }"
              @click="mode = 'decrypt'; result = ''; errorMessage = ''"
            >
              🔓 解密模式
            </button>
          </div>
        </div>

        <!-- 算法选择 -->
        <div class="algorithm-section">
          <h2>⚙️ 加密算法</h2>
          <select v-model="algorithm" class="algorithm-select">
            <option v-for="algo in availableAlgorithms" :key="algo" :value="algo">
              {{ algo }}
            </option>
          </select>
        </div>

        <!-- 输入文本区域 -->
        <div class="input-section">
          <h2>📝 {{ mode === 'encrypt' ? '原始文本' : '加密文本' }}</h2>
          <textarea
            v-model="inputText"
            class="text-input"
            :placeholder="mode === 'encrypt' ? '请输入要加密的文本...' : '请输入要解密的文本...'"
            rows="6"
          />
        </div>

        <!-- 密钥输入 -->
        <div class="key-section" v-if="algorithm !== 'Base64'">
          <h2>🔑 {{ mode === 'encrypt' ? '加密密钥' : '解密密钥' }}</h2>
          <div class="key-input-group">
            <input
              v-model="encryptionKey"
              type="text"
              class="key-input"
              :placeholder="algorithm === 'Caesar' ? '请输入偏移量 (数字，默认3)' : '请输入密钥'"
              :disabled="isProcessing"
            >
            <button
              class="process-btn"
              :disabled="!inputText.trim() || isProcessing || (algorithm !== 'Base64' && !encryptionKey.trim())"
              @click="handleProcess"
            >
              <span
                v-if="isProcessing"
                class="loading-spinner"
              />
              {{ isProcessing ? '处理中...' : (mode === 'encrypt' ? '开始加密' : '开始解密') }}
            </button>
          </div>
        </div>

        <!-- Base64 特殊处理 -->
        <div class="base64-section" v-else>
          <button
            class="process-btn full-width"
            :disabled="!inputText.trim() || isProcessing"
            @click="handleProcess"
          >
            <span
              v-if="isProcessing"
              class="loading-spinner"
            />
            {{ isProcessing ? '处理中...' : (mode === 'encrypt' ? 'Base64 编码' : 'Base64 解码') }}
          </button>
        </div>

        <!-- 消息提示 -->
        <div
          v-if="errorMessage"
          class="message error-message"
        >
          <span class="message-icon">⚠️</span>
          {{ errorMessage }}
        </div>

        <!-- 处理结果 -->
        <div
          v-if="result"
          class="result-section"
        >
          <h2>📋 {{ mode === 'encrypt' ? '加密结果' : '解密结果' }}</h2>
          <div class="result-content">
            <textarea
              class="result-text"
              :value="result"
              readonly
              rows="6"
            />
            <div class="result-actions">
              <button
                class="copy-btn"
                @click="copyResult"
              >
                📋 复制结果
              </button>
              <button
                class="swap-btn"
                @click="swapInputOutput"
                title="将结果作为新的输入"
              >
                � 交换输入输出
              </button>
              <button
                class="clear-btn"
                @click="clearAll"
              >
                �️ 清空所有
              </button>
            </div>
          </div>
        </div>

        <!-- 演示说明 -->
        <div class="demo-info">
          <h3>💡 演示说明</h3>
          <ul>
            <li>这是一个字符串加解密功能的演示页面</li>
            <li>支持多种加密算法：AES、DES、Base64、Caesar</li>
            <li>Base64 不需要密钥，其他算法需要输入密钥</li>
            <li>Caesar 密码需要输入数字作为偏移量</li>
            <li>可以复制结果或交换输入输出进行反向操作</li>
            <li>实际应用中会使用更安全的加密算法</li>
          </ul>
        </div>
      </div>

      <!-- 返回链接 -->
      <div class="back-link">
        <router-link to="/">
          ← 返回首页
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.decrypt-page {
  min-height: 100vh;
  background: var(--color-background, #f8fafc);
  padding: var(--size-4xl, 2rem);
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.decrypt-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: var(--size-6xl, 3rem);
  background: var(--color-surface, white);
  padding: var(--size-4xl, 2rem);
  border-radius: var(--size-lg, 16px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
}

.page-header h1 {
  font-size: var(--size-4xl, 2.5rem);
  margin-bottom: var(--size-sm, 0.5rem);
  font-weight: 700;
  color: var(--color-text, #1a202c);
}

.page-header p {
  font-size: var(--size-lg, 1.1rem);
  opacity: 0.9;
  margin: 0;
  color: var(--color-text-secondary, #718096);
}

.decrypt-form {
  background: var(--color-surface, white);
  border-radius: var(--size-lg, 16px);
  padding: var(--size-4xl, 2rem);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: var(--size-4xl, 2rem);
  border: 1px solid var(--color-border, #e2e8f0);
}

.mode-section,
.algorithm-section,
.input-section,
.key-section,
.base64-section,
.result-section {
  margin-bottom: var(--size-4xl, 2rem);
}

.mode-section h2,
.algorithm-section h2,
.input-section h2,
.key-section h2,
.result-section h2 {
  color: var(--color-text, #1a202c);
  margin-bottom: var(--size-lg, 1rem);
  font-size: var(--size-xl, 1.3rem);
  font-weight: 600;
}

.mode-toggle {
  display: flex;
  gap: var(--size-lg, 1rem);
  margin-bottom: var(--size-lg, 1rem);
}

.mode-toggle button {
  flex: 1;
  padding: var(--size-sm, 0.75rem) var(--size-2xl, 1.5rem);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-md, 8px);
  background: var(--color-surface, white);
  color: var(--color-text-secondary, #4a5568);
  font-size: var(--size-base, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-toggle button:hover {
  border-color: var(--color-primary, #3b82f6);
  color: var(--color-primary, #3b82f6);
  transform: translateY(-1px);
}

.mode-toggle button.active {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-primary, #3b82f6);
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.algorithm-select {
  width: 100%;
  padding: var(--size-sm, 0.75rem) var(--size-lg, 1rem);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-md, 8px);
  font-size: var(--size-base, 1rem);
  background: var(--color-surface, white);
  color: var(--color-text, #1a202c);
  cursor: pointer;
  transition: all 0.2s ease;
}

.algorithm-select:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-input {
  width: 100%;
  padding: var(--size-sm, 0.75rem) var(--size-lg, 1rem);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-md, 8px);
  font-size: var(--size-base, 1rem);
  font-family: 'Courier New', monospace;
  resize: vertical;
  transition: all 0.2s ease;
  background: var(--color-surface, white);
  color: var(--color-text, #1a202c);
}

.text-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.key-input-group {
  display: flex;
  gap: var(--size-lg, 1rem);
}

.key-input {
  flex: 1;
  padding: var(--size-sm, 0.75rem) var(--size-lg, 1rem);
  border: 2px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-md, 8px);
  font-size: var(--size-base, 1rem);
  transition: all 0.2s ease;
  background: var(--color-surface, white);
  color: var(--color-text, #1a202c);
}

.key-input:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.key-input:disabled {
  background: var(--color-muted, #f7fafc);
  cursor: not-allowed;
  opacity: 0.6;
}

.process-btn {
  background: linear-gradient(135deg, var(--color-primary, #3b82f6) 0%, var(--color-secondary, #8b5cf6) 100%);
  color: white;
  border: none;
  padding: var(--size-sm, 0.75rem) var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  font-size: var(--size-base, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--size-sm, 0.5rem);
  min-width: 120px;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.process-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.process-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.process-btn.full-width {
  width: 100%;
}

.loading-spinner {
  width: var(--size-lg, 16px);
  height: var(--size-lg, 16px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.message {
  padding: var(--size-lg, 1rem);
  border-radius: var(--size-md, 8px);
  margin-bottom: var(--size-lg, 1rem);
  display: flex;
  align-items: center;
  gap: var(--size-sm, 0.5rem);
  font-weight: 500;
  font-size: var(--size-base, 1rem);
}

.error-message {
  background: var(--color-error-light, #fff2f0);
  color: var(--color-error, #dc2626);
  border: 1px solid var(--color-error-border, #fecaca);
}

.success-message {
  background: var(--color-success-light, #f0fdf4);
  color: var(--color-success, #16a34a);
  border: 1px solid var(--color-success-border, #bbf7d0);
}

.message-icon {
  font-size: var(--size-lg, 1.2rem);
}

.result-content {
  background: var(--color-muted, #f7fafc);
  border-radius: var(--size-md, 8px);
  padding: var(--size-2xl, 1.5rem);
  border: 1px solid var(--color-border, #e2e8f0);
}

.result-text {
  width: 100%;
  background: var(--color-surface, white);
  padding: var(--size-lg, 1rem);
  border-radius: var(--size-sm, 6px);
  border: 1px solid var(--color-border, #e2e8f0);
  font-family: 'Courier New', monospace;
  font-size: var(--size-sm, 0.9rem);
  line-height: 1.5;
  resize: vertical;
  margin-bottom: var(--size-lg, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.2s ease;
}

.result-text:focus {
  outline: none;
  border-color: var(--color-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.result-actions {
  display: flex;
  gap: var(--size-lg, 1rem);
  flex-wrap: wrap;
}

.copy-btn,
.swap-btn,
.clear-btn {
  padding: var(--size-sm, 0.5rem) var(--size-lg, 1rem);
  border: none;
  border-radius: var(--size-sm, 6px);
  font-size: var(--size-sm, 0.9rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-btn {
  background: var(--color-success, #16a34a);
  color: white;
  box-shadow: 0 2px 4px rgba(22, 163, 74, 0.3);
}

.copy-btn:hover {
  background: var(--color-success-dark, #15803d);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(22, 163, 74, 0.4);
}

.swap-btn {
  background: var(--color-info, #0ea5e9);
  color: white;
  box-shadow: 0 2px 4px rgba(14, 165, 233, 0.3);
}

.swap-btn:hover {
  background: var(--color-info-dark, #0284c7);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(14, 165, 233, 0.4);
}

.clear-btn {
  background: var(--color-muted, #f7fafc);
  color: var(--color-text-secondary, #4a5568);
  border: 1px solid var(--color-border, #e2e8f0);
}

.clear-btn:hover {
  background: var(--color-surface, white);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.demo-info {
  background: var(--color-muted, #f7fafc);
  padding: var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  border-left: 4px solid var(--color-primary, #3b82f6);
  margin-top: var(--size-4xl, 2rem);
  border: 1px solid var(--color-border, #e2e8f0);
}

.demo-info h3 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-lg, 1.1rem);
  font-weight: 600;
}

.demo-info ul {
  margin: 0;
  padding-left: var(--size-2xl, 1.5rem);
  color: var(--color-text-secondary, #4a5568);
  line-height: 1.6;
}

.demo-info li {
  margin-bottom: var(--size-sm, 0.5rem);
  font-size: var(--size-base, 1rem);
}

.demo-info code {
  background: var(--color-primary-light, #dbeafe);
  color: var(--color-primary, #3b82f6);
  padding: var(--size-xs, 0.2rem) var(--size-sm, 0.4rem);
  border-radius: var(--size-xs, 4px);
  font-family: 'Courier New', monospace;
  font-size: var(--size-sm, 0.9rem);
}

.back-link {
  text-align: center;
  background: var(--color-surface, white);
  padding: var(--size-lg, 1rem);
  border-radius: var(--size-md, 8px);
  border: 1px solid var(--color-border, #e2e8f0);
}

.back-link a {
  color: var(--color-text, #1a202c);
  text-decoration: none;
  font-size: var(--size-lg, 1.1rem);
  padding: var(--size-sm, 0.5rem) var(--size-lg, 1rem);
  border-radius: var(--size-sm, 6px);
  background: var(--color-muted, #f7fafc);
  transition: all 0.2s ease;
  border: 1px solid var(--color-border, #e2e8f0);
  display: inline-block;
}

.back-link a:hover {
  background: var(--color-primary, #3b82f6);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .decrypt-page {
    padding: var(--size-lg, 1rem);
  }

  .page-header {
    padding: var(--size-lg, 1rem);
    margin-bottom: var(--size-4xl, 2rem);
  }

  .page-header h1 {
    font-size: var(--size-2xl, 1.5rem);
  }

  .page-header p {
    font-size: var(--size-base, 1rem);
  }

  .decrypt-form {
    padding: var(--size-lg, 1rem);
  }

  .mode-toggle {
    flex-direction: column;
    gap: var(--size-sm, 0.5rem);
  }

  .key-input-group {
    flex-direction: column;
    gap: var(--size-sm, 0.5rem);
  }

  .result-actions {
    flex-direction: column;
    gap: var(--size-sm, 0.5rem);
  }

  .copy-btn,
  .swap-btn,
  .clear-btn {
    width: 100%;
    text-align: center;
  }

  .demo-info {
    padding: var(--size-lg, 1rem);
    margin-top: var(--size-2xl, 1.5rem);
  }

  .demo-info h3 {
    font-size: var(--size-base, 1rem);
  }

  .demo-info li {
    font-size: var(--size-sm, 0.9rem);
  }
}
    gap: 0.5rem;
  }
}
</style>
