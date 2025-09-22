<template>
  <div class="crypto-demo">
    <h2>@ldesign/crypto Vue 集成演示</h2>
    
    <!-- 简单加密演示 -->
    <div class="demo-section">
      <h3>简单文本加密</h3>
      <div class="form-group">
        <label>要加密的文本：</label>
        <input v-model="plainText" placeholder="输入要加密的文本" />
      </div>
      <div class="form-group">
        <label>密码：</label>
        <input v-model="password" type="password" placeholder="输入密码" />
      </div>
      <div class="form-group">
        <button @click="handleEncrypt" :disabled="encryption.isLoading.value">
          {{ encryption.isLoading.value ? '加密中...' : '加密' }}
        </button>
        <button @click="handleDecrypt" :disabled="encryption.isLoading.value">
          {{ encryption.isLoading.value ? '解密中...' : '解密' }}
        </button>
      </div>
      
      <div v-if="encryption.error.value" class="error">
        错误: {{ encryption.error.value }}
      </div>
      
      <div v-if="encryptedText" class="result">
        <h4>加密结果：</h4>
        <textarea v-model="encryptedText" readonly></textarea>
      </div>
      
      <div v-if="decryptedText" class="result">
        <h4>解密结果：</h4>
        <p>{{ decryptedText }}</p>
      </div>
    </div>

    <!-- 密钥管理演示 -->
    <div class="demo-section">
      <h3>密钥管理</h3>
      <div class="form-group">
        <button @click="generateAESKey" :disabled="keyManager.isGenerating.value">
          {{ keyManager.isGenerating.value ? '生成中...' : '生成 AES 密钥' }}
        </button>
        <button @click="generateRSAKeyPair" :disabled="keyManager.isGenerating.value">
          {{ keyManager.isGenerating.value ? '生成中...' : '生成 RSA 密钥对' }}
        </button>
      </div>
      
      <div v-if="keyManager.error.value" class="error">
        错误: {{ keyManager.error.value }}
      </div>
      
      <div v-if="keyManager.keyCount.value > 0" class="result">
        <h4>已生成的密钥 ({{ keyManager.keyCount.value }})：</h4>
        <ul>
          <li v-for="keyName in keyManager.keyNames.value" :key="keyName">
            {{ keyName }}
            <button @click="() => keyManager.removeKey(keyName)">删除</button>
          </li>
        </ul>
      </div>
    </div>

    <!-- 哈希演示 -->
    <div class="demo-section">
      <h3>哈希计算</h3>
      <div class="form-group">
        <label>要哈希的文本：</label>
        <input v-model="hashText" placeholder="输入要哈希的文本" />
      </div>
      <div class="form-group">
        <button @click="calculateMD5" :disabled="hash.isHashing.value">MD5</button>
        <button @click="calculateSHA256" :disabled="hash.isHashing.value">SHA256</button>
        <button @click="calculateSHA512" :disabled="hash.isHashing.value">SHA512</button>
      </div>
      
      <div v-if="hash.error.value" class="error">
        错误: {{ hash.error.value }}
      </div>
      
      <div v-if="hashResult" class="result">
        <h4>哈希结果：</h4>
        <p><strong>{{ hashAlgorithm }}:</strong> {{ hashResult }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEncryption, useKeyManager, useHash } from '@ldesign/crypto/vue'

// 响应式数据
const plainText = ref('Hello, Vue + Crypto!')
const password = ref('mySecretPassword')
const encryptedText = ref('')
const decryptedText = ref('')

const hashText = ref('Hello, Hash!')
const hashResult = ref('')
const hashAlgorithm = ref('')

// 使用组合式函数
const encryption = useEncryption()
const keyManager = useKeyManager()
const hash = useHash()

// 加密处理
const handleEncrypt = async () => {
  if (!plainText.value || !password.value) return
  
  const result = await encryption.encryptText(plainText.value, password.value)
  if (result) {
    encryptedText.value = result
    decryptedText.value = ''
  }
}

// 解密处理
const handleDecrypt = async () => {
  if (!encryptedText.value || !password.value) return
  
  const result = await encryption.decryptText(encryptedText.value, password.value)
  if (result) {
    decryptedText.value = result
  }
}

// 生成 AES 密钥
const generateAESKey = async () => {
  const key = await keyManager.generateAESKey(256)
  if (key) {
    keyManager.storeKey(`AES-${Date.now()}`, key)
  }
}

// 生成 RSA 密钥对
const generateRSAKeyPair = async () => {
  const keyPair = await keyManager.generateRSAKeyPair(2048)
  if (keyPair) {
    keyManager.storeKey(`RSA-${Date.now()}`, keyPair)
  }
}

// 计算 MD5
const calculateMD5 = async () => {
  if (!hashText.value) return
  
  const result = await hash.md5(hashText.value)
  if (result) {
    hashResult.value = result
    hashAlgorithm.value = 'MD5'
  }
}

// 计算 SHA256
const calculateSHA256 = async () => {
  if (!hashText.value) return
  
  const result = await hash.sha256(hashText.value)
  if (result) {
    hashResult.value = result
    hashAlgorithm.value = 'SHA256'
  }
}

// 计算 SHA512
const calculateSHA512 = async () => {
  if (!hashText.value) return
  
  const result = await hash.sha512(hashText.value)
  if (result) {
    hashResult.value = result
    hashAlgorithm.value = 'SHA512'
  }
}
</script>

<style scoped>
.crypto-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.demo-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
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
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-group button {
  margin-right: 10px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.form-group button:hover:not(:disabled) {
  background-color: #0056b3;
}

.form-group button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.error {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.result {
  margin-top: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.result h4 {
  margin-top: 0;
  color: #495057;
}

.result ul {
  list-style-type: none;
  padding: 0;
}

.result li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  margin-bottom: 5px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.result li button {
  padding: 4px 8px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.result li button:hover {
  background-color: #c82333;
}
</style>
