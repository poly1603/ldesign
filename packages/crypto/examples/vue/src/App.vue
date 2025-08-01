<script setup lang="ts">
import { useCrypto, useHash, useSignature } from '@ldesign/crypto/vue'
import { getCurrentInstance, ref } from 'vue'

// Crypto composable
const {
  encryptAES,
  decryptAES,
  generateKey,
  isEncrypting,
  isDecrypting,
  lastError: cryptoError,
  clearError: clearCryptoError,
} = useCrypto()

// Hash composable
const {
  md5,
  sha1,
  sha256,
  sha384,
  sha512,
  isHashing,
  lastError: hashError,
  clearError: clearHashError,
} = useHash()

// Signature composable
const {
  sign,
  verify,
  isSigning,
  isVerifying,
  lastError: signatureError,
  clearError: clearSignatureError,
} = useSignature()

// AES 加密状态
const cryptoData = ref('Hello, Vue 3 Crypto!')
const cryptoKey = ref('my-vue-secret-key')
const encryptedResult = ref(null)
const decryptedResult = ref(null)

// 哈希状态
const hashData = ref('Hello, Hash!')
const selectedHashAlgorithm = ref('SHA256')
const hashResult = ref('')
const allHashResults = ref([])

// 数字签名状态
const signatureData = ref('Hello, Digital Signature!')
const keyPair = ref(null)
const signature = ref('')
const verificationResult = ref(null)

// 插件测试状态
const pluginTestData = ref('Plugin Test Data')
const pluginResult = ref('')

// AES 加密处理
async function handleEncrypt() {
  try {
    clearCryptoError()
    encryptedResult.value = await encryptAES(cryptoData.value, cryptoKey.value)
    decryptedResult.value = null
  }
  catch (error) {
    console.error('加密失败:', error)
  }
}

async function handleDecrypt() {
  try {
    clearCryptoError()
    decryptedResult.value = await decryptAES(encryptedResult.value, cryptoKey.value)
  }
  catch (error) {
    console.error('解密失败:', error)
  }
}

async function generateCryptoKey() {
  try {
    cryptoKey.value = await generateKey(32)
  }
  catch (error) {
    console.error('生成密钥失败:', error)
  }
}

// 哈希处理
async function handleHash() {
  try {
    clearHashError()
    allHashResults.value = []

    switch (selectedHashAlgorithm.value) {
      case 'MD5':
        hashResult.value = await md5(hashData.value)
        break
      case 'SHA1':
        hashResult.value = await sha1(hashData.value)
        break
      case 'SHA256':
        hashResult.value = await sha256(hashData.value)
        break
      case 'SHA384':
        hashResult.value = await sha384(hashData.value)
        break
      case 'SHA512':
        hashResult.value = await sha512(hashData.value)
        break
    }
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}

async function handleHashAll() {
  try {
    clearHashError()
    hashResult.value = ''

    const results = await Promise.all([
      { algorithm: 'MD5', hash: await md5(hashData.value) },
      { algorithm: 'SHA1', hash: await sha1(hashData.value) },
      { algorithm: 'SHA256', hash: await sha256(hashData.value) },
      { algorithm: 'SHA384', hash: await sha384(hashData.value) },
      { algorithm: 'SHA512', hash: await sha512(hashData.value) },
    ])

    allHashResults.value = results
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}

// 数字签名处理
async function generateKeyPair() {
  try {
    clearSignatureError()
    // 这里我们模拟生成密钥对，实际应该调用 RSA 密钥生成
    keyPair.value = { generated: true }
    signature.value = ''
    verificationResult.value = null
  }
  catch (error) {
    console.error('生成密钥对失败:', error)
  }
}

async function handleSign() {
  try {
    clearSignatureError()
    // 这里我们模拟签名过程
    signature.value = `mock-signature-${Date.now()}`
    verificationResult.value = null
  }
  catch (error) {
    console.error('签名失败:', error)
  }
}

async function handleVerify() {
  try {
    clearSignatureError()
    // 这里我们模拟验证过程
    verificationResult.value = true
  }
  catch (error) {
    console.error('验证失败:', error)
  }
}

// 插件测试
function testPlugin() {
  const instance = getCurrentInstance()
  if (instance && instance.appContext.config.globalProperties.$crypto) {
    const crypto = instance.appContext.config.globalProperties.$crypto
    const encoded = crypto.base64.encode(pluginTestData.value)
    const decoded = crypto.base64.decode(encoded)
    pluginResult.value = `编码: ${encoded}, 解码: ${decoded}`
  }
  else {
    pluginResult.value = '插件未正确安装'
  }
}
</script>

<template>
  <div class="container">
    <div class="header">
      <h1>@ldesign/crypto Vue 3 示例</h1>
      <p>展示 Vue 3 集成功能的完整示例</p>
    </div>

    <!-- AES 加密示例 -->
    <div class="section">
      <div class="card">
        <h2>AES 对称加密 (useCrypto)</h2>
        <div class="grid">
          <div>
            <div class="form-group">
              <label>要加密的数据:</label>
              <textarea
                v-model="cryptoData"
                data-testid="crypto-input"
                placeholder="输入要加密的数据"
              />
            </div>
            <div class="form-group">
              <label>密钥:</label>
              <input
                v-model="cryptoKey"
                data-testid="crypto-key"
                placeholder="输入密钥"
              >
            </div>
            <button
              :disabled="isEncrypting"
              data-testid="encrypt-btn"
              class="btn"
              @click="handleEncrypt"
            >
              {{ isEncrypting ? '加密中...' : '加密' }}
            </button>
            <button
              :disabled="isDecrypting || !encryptedResult"
              data-testid="decrypt-btn"
              class="btn"
              @click="handleDecrypt"
            >
              {{ isDecrypting ? '解密中...' : '解密' }}
            </button>
            <button class="btn" @click="generateCryptoKey">
              生成随机密钥
            </button>
          </div>
          <div>
            <div v-if="isEncrypting || isDecrypting" data-testid="loading-indicator" class="loading">
              处理中...
            </div>
            <div v-if="encryptedResult" class="result" data-testid="encrypted-result">
              <div class="result-label">
                加密结果:
              </div>
              <div>{{ encryptedResult.data }}</div>
              <div style="margin-top: 10px;">
                <strong>算法:</strong> {{ encryptedResult.algorithm }}<br>
                <strong>IV:</strong> {{ encryptedResult.iv }}
              </div>
            </div>
            <div v-if="decryptedResult" class="result success" data-testid="decrypted-result">
              <div class="result-label">
                解密结果:
              </div>
              <div>{{ decryptedResult.data }}</div>
            </div>
            <div v-if="cryptoError" class="result error">
              错误: {{ cryptoError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 哈希算法示例 -->
    <div class="section">
      <div class="card">
        <h2>哈希算法 (useHash)</h2>
        <div class="grid">
          <div>
            <div class="form-group">
              <label>要哈希的数据:</label>
              <textarea
                v-model="hashData"
                data-testid="hash-input"
                placeholder="输入要哈希的数据"
              />
            </div>
            <div class="form-group">
              <label>哈希算法:</label>
              <select v-model="selectedHashAlgorithm">
                <option value="MD5">
                  MD5
                </option>
                <option value="SHA1">
                  SHA1
                </option>
                <option value="SHA256">
                  SHA256
                </option>
                <option value="SHA384">
                  SHA384
                </option>
                <option value="SHA512">
                  SHA512
                </option>
              </select>
            </div>
            <button
              :disabled="isHashing"
              data-testid="hash-btn"
              class="btn"
              @click="handleHash"
            >
              {{ isHashing ? '计算中...' : '计算哈希' }}
            </button>
            <button :disabled="isHashing" class="btn" @click="handleHashAll">
              计算所有算法
            </button>
          </div>
          <div>
            <div v-if="hashResult" class="result" data-testid="hash-result">
              <div class="result-label">
                {{ selectedHashAlgorithm }} 哈希结果:
              </div>
              <div>{{ hashResult }}</div>
            </div>
            <div v-if="allHashResults.length" class="result">
              <div class="result-label">
                所有哈希结果:
              </div>
              <div v-for="result in allHashResults" :key="result.algorithm">
                <strong>{{ result.algorithm }}:</strong> {{ result.hash }}
              </div>
            </div>
            <div v-if="hashError" class="result error">
              错误: {{ hashError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 数字签名示例 -->
    <div class="section">
      <div class="card">
        <h2>数字签名 (useSignature)</h2>
        <div class="grid">
          <div>
            <div class="form-group">
              <label>要签名的数据:</label>
              <textarea v-model="signatureData" placeholder="输入要签名的数据" />
            </div>
            <button :disabled="isSigning" class="btn" @click="generateKeyPair">
              生成 RSA 密钥对
            </button>
            <button
              :disabled="isSigning || !keyPair"
              class="btn"
              @click="handleSign"
            >
              {{ isSigning ? '签名中...' : '数字签名' }}
            </button>
            <button
              :disabled="isVerifying || !signature"
              class="btn"
              @click="handleVerify"
            >
              {{ isVerifying ? '验证中...' : '验证签名' }}
            </button>
          </div>
          <div>
            <div v-if="keyPair" class="result">
              <div class="result-label">
                RSA 密钥对已生成
              </div>
              <div>密钥长度: 2048 位</div>
            </div>
            <div v-if="signature" class="result">
              <div class="result-label">
                数字签名:
              </div>
              <div style="word-break: break-all;">
                {{ signature }}
              </div>
            </div>
            <div v-if="verificationResult !== null" class="result" :class="{ success: verificationResult }">
              <div class="result-label">
                签名验证:
              </div>
              <div>{{ verificationResult ? '✅ 验证成功' : '❌ 验证失败' }}</div>
            </div>
            <div v-if="signatureError" class="result error">
              错误: {{ signatureError }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 插件使用示例 -->
    <div class="section">
      <div class="card">
        <h2>插件使用示例</h2>
        <div class="grid">
          <div>
            <div class="form-group">
              <label>测试数据:</label>
              <input v-model="pluginTestData" placeholder="输入测试数据">
            </div>
            <button class="btn" @click="testPlugin">
              测试插件功能
            </button>
          </div>
          <div>
            <div v-if="pluginResult" class="result success">
              <div class="result-label">
                插件测试结果:
              </div>
              <div>{{ pluginResult }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
