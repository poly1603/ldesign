<template>
  <div class="crypto-demo-container">
    <div class="crypto-header">
      <h1 class="crypto-title">{{ t('crypto.title') || '加密演示' }}</h1>
      <p class="crypto-subtitle">{{ t('crypto.subtitle') || '体验 @ldesign/crypto 加密功能' }}</p>
    </div>
    
    <div class="crypto-grid">
      <!-- AES 加密演示 -->
      <div class="crypto-card">
        <h3 class="card-title">
          <Lock class="icon" /> 
          AES 加密
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>原始文本</label>
            <input 
              v-model="aesInput" 
              type="text" 
              placeholder="输入要加密的文本"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>密钥</label>
            <input 
              v-model="aesKey" 
              type="text" 
              placeholder="输入密钥"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="encryptAES" class="action-btn primary">
              <Lock class="btn-icon" /> 加密
            </button>
            <button @click="decryptAES" class="action-btn secondary">
              <Unlock class="btn-icon" /> 解密
            </button>
            <button @click="clearAES" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除
            </button>
          </div>
          <div v-if="aesEncrypted" class="result-box">
            <label>加密结果</label>
            <div class="result-content">{{ aesEncrypted }}</div>
          </div>
          <div v-if="aesDecrypted" class="result-box success">
            <label>解密结果</label>
            <div class="result-content">{{ aesDecrypted }}</div>
          </div>
        </div>
      </div>

      <!-- Hash 哈希演示 -->
      <div class="crypto-card">
        <h3 class="card-title">
          <Hash class="icon" /> 
          哈希算法
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>原始文本</label>
            <input 
              v-model="hashInput" 
              type="text" 
              placeholder="输入要计算哈希的文本"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>算法</label>
            <select v-model="hashAlgorithm" class="select-field">
              <option value="md5">MD5</option>
              <option value="sha1">SHA1</option>
              <option value="sha256">SHA256</option>
              <option value="sha512">SHA512</option>
            </select>
          </div>
          <div class="button-group">
            <button @click="computeHash" class="action-btn primary">
              <Hash class="btn-icon" /> 计算哈希
            </button>
            <button @click="clearHash" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除
            </button>
          </div>
          <div v-if="hashResult" class="result-box">
            <label>哈希结果 ({{ hashAlgorithm.toUpperCase() }})</label>
            <div class="result-content hash-result">{{ hashResult }}</div>
          </div>
        </div>
      </div>

      <!-- HMAC 消息认证码演示 -->
      <div class="crypto-card">
        <h3 class="card-title">
          <ShieldCheck class="icon" /> 
          HMAC 消息认证
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>消息内容</label>
            <input 
              v-model="hmacMessage" 
              type="text" 
              placeholder="输入消息内容"
              class="input-field"
            />
          </div>
          <div class="input-group">
            <label>密钥</label>
            <input 
              v-model="hmacKey" 
              type="text" 
              placeholder="输入密钥"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="computeHMAC" class="action-btn primary">
              <ShieldCheck class="btn-icon" /> 生成 HMAC
            </button>
            <button @click="verifyHMAC" class="action-btn secondary">
              <Check class="btn-icon" /> 验证
            </button>
            <button @click="clearHMAC" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除
            </button>
          </div>
          <div v-if="hmacResult" class="result-box">
            <label>HMAC 结果</label>
            <div class="result-content hash-result">{{ hmacResult }}</div>
          </div>
          <div v-if="hmacVerifyResult !== null" class="result-box" :class="{ success: hmacVerifyResult, error: !hmacVerifyResult }">
            <label>验证结果</label>
            <div class="result-content">
              {{ hmacVerifyResult ? '✓ 验证通过' : '✗ 验证失败' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Base64 编码演示 -->
      <div class="crypto-card">
        <h3 class="card-title">
          <Binary class="icon" /> 
          Base64 编码
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>原始文本</label>
            <input 
              v-model="base64Input" 
              type="text" 
              placeholder="输入要编码的文本"
              class="input-field"
            />
          </div>
          <div class="button-group">
            <button @click="encodeBase64" class="action-btn primary">
              <ArrowRight class="btn-icon" /> 编码
            </button>
            <button @click="decodeBase64" class="action-btn secondary">
              <ArrowLeft class="btn-icon" /> 解码
            </button>
            <button @click="clearBase64" class="action-btn danger">
              <Trash2 class="btn-icon" /> 清除
            </button>
          </div>
          <div v-if="base64Encoded" class="result-box">
            <label>编码结果</label>
            <div class="result-content">{{ base64Encoded }}</div>
          </div>
          <div v-if="base64Decoded" class="result-box success">
            <label>解码结果</label>
            <div class="result-content">{{ base64Decoded }}</div>
          </div>
        </div>
      </div>

      <!-- 随机密钥生成 -->
      <div class="crypto-card">
        <h3 class="card-title">
          <Key class="icon" /> 
          密钥生成器
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>密钥长度（字节）</label>
            <select v-model.number="keyLength" class="select-field">
              <option :value="16">16 字节 (128 位)</option>
              <option :value="24">24 字节 (192 位)</option>
              <option :value="32">32 字节 (256 位)</option>
            </select>
          </div>
          <div class="button-group">
            <button @click="generateRandomKey" class="action-btn primary">
              <RefreshCw class="btn-icon" /> 生成密钥
            </button>
            <button @click="copyKey" class="action-btn secondary" :disabled="!generatedKey">
              <Copy class="btn-icon" /> 复制
            </button>
          </div>
          <div v-if="generatedKey" class="result-box">
            <label>生成的密钥</label>
            <div class="result-content hash-result">{{ generatedKey }}</div>
          </div>
        </div>
      </div>

      <!-- 密码强度检测 -->
      <div class="crypto-card">
        <h3 class="card-title">
          <ShieldAlert class="icon" /> 
          密码强度检测
        </h3>
        <div class="card-content">
          <div class="input-group">
            <label>密码</label>
            <input 
              v-model="passwordInput" 
              type="password" 
              placeholder="输入密码"
              class="input-field"
            />
          </div>
          <button @click="checkPasswordStrength" class="action-btn primary">
            <ShieldAlert class="btn-icon" /> 检测强度
          </button>
          <div v-if="passwordStrength" class="result-box">
            <label>强度评估</label>
            <div class="password-strength">
              <div class="strength-bar" :class="strengthClass">
                <div class="strength-fill" :style="{ width: passwordStrength.score * 25 + '%' }"></div>
              </div>
              <div class="strength-info">
                <div><strong>得分：</strong>{{ passwordStrength.score }}/4</div>
                <div><strong>等级：</strong>{{ strengthLabel }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/i18n'
import { aes, hash, hmac, encoding, RandomUtils, PasswordStrengthChecker } from '@ldesign/crypto'
import { 
  Lock, Unlock, Hash, ShieldCheck, ShieldAlert, Binary, Key, 
  Trash2, Check, ArrowRight, ArrowLeft, RefreshCw, Copy 
} from 'lucide-vue-next'

const { t } = useI18n()

// AES 加密
const aesInput = ref('Hello, World!')
const aesKey = ref('my-secret-key')
const aesEncrypted = ref('')
const aesDecrypted = ref('')

const encryptAES = () => {
  if (!aesInput.value || !aesKey.value) {
    alert('请输入文本和密钥')
    return
  }
  const result = aes.encrypt(aesInput.value, aesKey.value)
  if (result.success && result.data) {
    aesEncrypted.value = result.data
    aesDecrypted.value = ''
    console.log('AES 加密成功:', result)
  } else {
    alert('加密失败: ' + (result.error || '未知错误'))
  }
}

const decryptAES = () => {
  if (!aesEncrypted.value || !aesKey.value) {
    alert('请先加密或输入密钥')
    return
  }
  const result = aes.decrypt(aesEncrypted.value, aesKey.value)
  if (result.success && result.data) {
    aesDecrypted.value = result.data
    console.log('AES 解密成功:', result)
  } else {
    alert('解密失败: ' + (result.error || '未知错误'))
  }
}

const clearAES = () => {
  aesInput.value = ''
  aesKey.value = ''
  aesEncrypted.value = ''
  aesDecrypted.value = ''
}

// 哈希计算
const hashInput = ref('Hello, Hash!')
const hashAlgorithm = ref('sha256')
const hashResult = ref('')

const computeHash = () => {
  if (!hashInput.value) {
    alert('请输入文本')
    return
  }
  
  try {
    let result = ''
    switch (hashAlgorithm.value) {
      case 'md5':
        result = hash.md5(hashInput.value)
        break
      case 'sha1':
        result = hash.sha1(hashInput.value)
        break
      case 'sha256':
        result = hash.sha256(hashInput.value)
        break
      case 'sha512':
        result = hash.sha512(hashInput.value)
        break
    }
    hashResult.value = result
    console.log(`${hashAlgorithm.value.toUpperCase()} 计算成功:`, result)
  } catch (error: any) {
    alert('哈希计算失败: ' + error.message)
  }
}

const clearHash = () => {
  hashInput.value = ''
  hashResult.value = ''
}

// HMAC 消息认证
const hmacMessage = ref('Important message')
const hmacKey = ref('secret-key')
const hmacResult = ref('')
const hmacVerifyResult = ref<boolean | null>(null)

const computeHMAC = () => {
  if (!hmacMessage.value || !hmacKey.value) {
    alert('请输入消息和密钥')
    return
  }
  
  try {
    const result = hmac.sha256(hmacMessage.value, hmacKey.value)
    hmacResult.value = result
    hmacVerifyResult.value = null
    console.log('HMAC 生成成功:', result)
  } catch (error: any) {
    alert('HMAC 生成失败: ' + error.message)
  }
}

const verifyHMAC = () => {
  if (!hmacMessage.value || !hmacKey.value || !hmacResult.value) {
    alert('请先生成 HMAC')
    return
  }
  
  try {
    const isValid = hmac.verify(hmacMessage.value, hmacKey.value, hmacResult.value, 'SHA256')
    hmacVerifyResult.value = isValid
    console.log('HMAC 验证结果:', isValid)
  } catch (error: any) {
    alert('HMAC 验证失败: ' + error.message)
  }
}

const clearHMAC = () => {
  hmacMessage.value = ''
  hmacKey.value = ''
  hmacResult.value = ''
  hmacVerifyResult.value = null
}

// Base64 编码
const base64Input = ref('Hello, Base64!')
const base64Encoded = ref('')
const base64Decoded = ref('')

const encodeBase64 = () => {
  if (!base64Input.value) {
    alert('请输入文本')
    return
  }
  
  try {
    const result = encoding.encode(base64Input.value, 'base64')
    base64Encoded.value = result
    base64Decoded.value = ''
    console.log('Base64 编码成功:', result)
  } catch (error: any) {
    alert('编码失败: ' + error.message)
  }
}

const decodeBase64 = () => {
  if (!base64Encoded.value) {
    alert('请先编码')
    return
  }
  
  try {
    const result = encoding.decode(base64Encoded.value, 'base64')
    base64Decoded.value = result
    console.log('Base64 解码成功:', result)
  } catch (error: any) {
    alert('解码失败: ' + error.message)
  }
}

const clearBase64 = () => {
  base64Input.value = ''
  base64Encoded.value = ''
  base64Decoded.value = ''
}

// 密钥生成
const keyLength = ref(32)
const generatedKey = ref('')

const generateRandomKey = () => {
  try {
    const key = RandomUtils.generateKey(keyLength.value)
    generatedKey.value = key
    console.log('密钥生成成功:', key)
  } catch (error: any) {
    alert('密钥生成失败: ' + error.message)
  }
}

const copyKey = async () => {
  if (!generatedKey.value) return
  
  try {
    await navigator.clipboard.writeText(generatedKey.value)
    alert('密钥已复制到剪贴板')
  } catch (error) {
    alert('复制失败，请手动复制')
  }
}

// 密码强度检测
const passwordInput = ref('')
const passwordStrength = ref<any>(null)

const checkPasswordStrength = () => {
  if (!passwordInput.value) {
    alert('请输入密码')
    return
  }
  
  try {
    const checker = new PasswordStrengthChecker()
    const result = checker.check(passwordInput.value)
    passwordStrength.value = result
    console.log('密码强度:', result)
  } catch (error: any) {
    alert('检测失败: ' + error.message)
  }
}

const strengthClass = computed(() => {
  if (!passwordStrength.value) return ''
  const score = passwordStrength.value.score
  if (score === 0) return 'weak'
  if (score === 1) return 'fair'
  if (score === 2) return 'good'
  if (score === 3) return 'strong'
  return 'very-strong'
})

const strengthLabel = computed(() => {
  if (!passwordStrength.value) return ''
  const score = passwordStrength.value.score
  const labels = ['很弱', '弱', '中等', '强', '很强']
  return labels[score] || '未知'
})
</script>

<style scoped>
.crypto-demo-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.crypto-header {
  text-align: center;
  margin-bottom: 40px;
}

.crypto-title {
  font-size: 36px;
  color: var(--color-text-primary, #333);
  margin: 0 0 10px 0;
}

.crypto-subtitle {
  font-size: 18px;
  color: var(--color-text-secondary, #666);
  margin: 0;
}

.crypto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.crypto-card {
  background: var(--color-bg-container, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-title {
  font-size: 18px;
  color: var(--color-text-primary, #333);
  margin: 0;
  padding: 20px;
  background: var(--color-bg-container-secondary, #f5f5f5);
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 20px;
  height: 20px;
  color: var(--color-primary-default, #667eea);
}

.card-content {
  padding: 20px;
}

.input-group {
  margin-bottom: 15px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  font-size: 14px;
}

.input-field,
.select-field {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: var(--color-primary-default, #667eea);
}

.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.action-btn.primary {
  background: var(--color-primary-default, #667eea);
  color: white;
}

.action-btn.primary:hover {
  background: var(--color-primary-hover, #5568d3);
}

.action-btn.secondary {
  background: var(--color-success-default, #48bb78);
  color: white;
}

.action-btn.secondary:hover {
  background: var(--color-success-hover, #38a169);
}

.action-btn.danger {
  background: var(--color-danger-default, #f56565);
  color: white;
}

.action-btn.danger:hover {
  background: var(--color-danger-hover, #e53e3e);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.result-box {
  margin-top: 15px;
  padding: 12px;
  background: #f7fafc;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: 6px;
}

.result-box.success {
  background: #f0fff4;
  border-color: #48bb78;
}

.result-box.error {
  background: #fff5f5;
  border-color: #f56565;
}

.result-box label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--color-text-secondary, #666);
  font-size: 13px;
}

.result-content {
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  word-break: break-all;
  color: var(--color-text-primary, #333);
}

.result-content.hash-result {
  font-size: 11px;
  letter-spacing: 0.5px;
}

.password-strength {
  margin-top: 10px;
}

.strength-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.strength-fill {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-bar.weak .strength-fill {
  background: #f56565;
}

.strength-bar.fair .strength-fill {
  background: #ed8936;
}

.strength-bar.good .strength-fill {
  background: #ecc94b;
}

.strength-bar.strong .strength-fill {
  background: #48bb78;
}

.strength-bar.very-strong .strength-fill {
  background: #38a169;
}

.strength-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

@media (max-width: 768px) {
  .crypto-grid {
    grid-template-columns: 1fr;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>



