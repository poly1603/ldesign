# 编码示例

本页面展示了 @ldesign/crypto 中各种编码和解码功能的使用示例。

## 交互式演示

<div class="crypto-demo">
  <div class="demo-section">
    <h3>📝 Base64 编码演示</h3>
    
    <div class="form-group">
      <label>要编码的数据:</label>
      <textarea id="base64-data" placeholder="输入要编码的数据">Hello, Base64 Encoding! 你好，Base64编码！</textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>编码类型:</label>
        <select id="base64-type">
          <option value="standard" selected>标准 Base64</option>
          <option value="url-safe">URL 安全 Base64</option>
        </select>
      </div>
    </div>
    
    <div class="form-actions">
      <button id="base64-encode-btn" class="btn primary">📝 Base64 编码</button>
      <button id="base64-decode-btn" class="btn secondary">🔓 Base64 解码</button>
      <button id="base64-clear-btn" class="btn">🗑️ 清除</button>
    </div>
    
    <div id="base64-encoded-result" class="result-box" style="display: none;">
      <h4>📝 Base64 编码结果</h4>
      <div class="result-item">
        <label>编码数据:</label>
        <textarea id="base64-encoded-data" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>编码信息:</label>
        <div id="base64-encode-info" class="result-value"></div>
      </div>
    </div>
    
    <div id="base64-decoded-result" class="result-box success" style="display: none;">
      <h4>🔓 Base64 解码结果</h4>
      <div class="result-item">
        <label>解码数据:</label>
        <div id="base64-decoded-data" class="result-value"></div>
      </div>
    </div>
    
    <div id="base64-error" class="result-box error" style="display: none;"></div>
  </div>
</div>

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔢 Hex 编码演示</h3>
    
    <div class="form-group">
      <label>要编码的数据:</label>
      <textarea id="hex-data" placeholder="输入要编码的数据">Hello, Hex Encoding! 你好，十六进制编码！</textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>输出格式:</label>
        <select id="hex-format">
          <option value="lowercase" selected>小写 (a-f)</option>
          <option value="uppercase">大写 (A-F)</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>分隔符:</label>
        <select id="hex-separator">
          <option value="none" selected>无分隔符</option>
          <option value="space">空格分隔</option>
          <option value="colon">冒号分隔</option>
          <option value="dash">短横线分隔</option>
        </select>
      </div>
    </div>
    
    <div class="form-actions">
      <button id="hex-encode-btn" class="btn primary">🔢 Hex 编码</button>
      <button id="hex-decode-btn" class="btn secondary">🔓 Hex 解码</button>
      <button id="hex-clear-btn" class="btn">🗑️ 清除</button>
    </div>
    
    <div id="hex-encoded-result" class="result-box" style="display: none;">
      <h4>🔢 Hex 编码结果</h4>
      <div class="result-item">
        <label>编码数据:</label>
        <textarea id="hex-encoded-data" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>编码信息:</label>
        <div id="hex-encode-info" class="result-value"></div>
      </div>
    </div>
    
    <div id="hex-decoded-result" class="result-box success" style="display: none;">
      <h4>🔓 Hex 解码结果</h4>
      <div class="result-item">
        <label>解码数据:</label>
        <div id="hex-decoded-data" class="result-value"></div>
      </div>
    </div>
    
    <div id="hex-error" class="result-box error" style="display: none;"></div>
  </div>
</div>

<div class="crypto-demo">
  <div class="demo-section">
    <h3>🔄 编码转换演示</h3>
    
    <div class="form-group">
      <label>输入数据:</label>
      <textarea id="convert-input" placeholder="输入要转换的数据">Hello, Encoding Conversion!</textarea>
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>输入格式:</label>
        <select id="convert-from">
          <option value="text" selected>文本</option>
          <option value="base64">Base64</option>
          <option value="hex">Hex</option>
          <option value="binary">二进制</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>输出格式:</label>
        <select id="convert-to">
          <option value="text">文本</option>
          <option value="base64" selected>Base64</option>
          <option value="hex">Hex</option>
          <option value="binary">二进制</option>
        </select>
      </div>
    </div>
    
    <div class="form-actions">
      <button id="convert-btn" class="btn primary">🔄 转换</button>
      <button id="convert-clear-btn" class="btn">🗑️ 清除</button>
    </div>
    
    <div id="convert-result" class="result-box" style="display: none;">
      <h4>🔄 转换结果</h4>
      <div class="result-item">
        <label>转换数据:</label>
        <textarea id="convert-output" class="result-textarea" readonly></textarea>
      </div>
      <div class="result-item">
        <label>转换信息:</label>
        <div id="convert-info" class="result-value"></div>
      </div>
    </div>
    
    <div id="convert-error" class="result-box error" style="display: none;"></div>
  </div>
</div>

## 代码示例

### Base64 编码

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

// 基本 Base64 编码
const data = 'Hello, Base64!'
const encoded = encrypt.base64(data)
console.log('Base64 编码:', encoded)
// 输出: "SGVsbG8sIEJhc2U2NCE="

// Base64 解码
const decoded = decrypt.base64(encoded)
console.log('Base64 解码:', decoded)
// 输出: "Hello, Base64!"

// URL 安全的 Base64 编码
const urlSafeEncoded = encrypt.base64Url(data)
console.log('URL 安全 Base64:', urlSafeEncoded)

// URL 安全的 Base64 解码
const urlSafeDecoded = decrypt.base64Url(urlSafeEncoded)
console.log('URL 安全解码:', urlSafeDecoded)
```

### Hex 编码

```typescript
// 基本 Hex 编码
const data = 'Hello, Hex!'
const hexEncoded = encrypt.hex(data)
console.log('Hex 编码:', hexEncoded)
// 输出: "48656c6c6f2c20486578210"

// Hex 解码
const hexDecoded = decrypt.hex(hexEncoded)
console.log('Hex 解码:', hexDecoded)
// 输出: "Hello, Hex!"

// 中文字符的 Hex 编码
const chineseData = '你好，世界！'
const chineseHex = encrypt.hex(chineseData)
console.log('中文 Hex 编码:', chineseHex)
```

### 通用编码接口

```typescript
import { encoding } from '@ldesign/crypto'

// 使用通用编码接口
const data = 'Universal Encoding'

// 编码为不同格式
const base64Result = encoding.encode(data, 'base64')
const hexResult = encoding.encode(data, 'hex')

console.log('Base64:', base64Result)
console.log('Hex:', hexResult)

// 解码
const base64Decoded = encoding.decode(base64Result, 'base64')
const hexDecoded = encoding.decode(hexResult, 'hex')

console.log('Base64 解码:', base64Decoded)
console.log('Hex 解码:', hexDecoded)
```

## Vue 3 集成示例

### 使用 Composition API

```vue
<template>
  <div>
    <h2>编码演示</h2>
    
    <div>
      <textarea v-model="inputData" placeholder="输入要编码的数据"></textarea>
      
      <div>
        <label>编码类型:</label>
        <select v-model="encodingType">
          <option value="base64">Base64</option>
          <option value="hex">Hex</option>
          <option value="base64url">URL 安全 Base64</option>
        </select>
      </div>
      
      <button @click="encode" :disabled="isEncoding">
        {{ isEncoding ? '编码中...' : '编码' }}
      </button>
      <button @click="decode" :disabled="isDecoding || !encodedResult">
        {{ isDecoding ? '解码中...' : '解码' }}
      </button>
    </div>
    
    <div v-if="encodedResult">
      <h3>编码结果</h3>
      <pre>{{ encodedResult }}</pre>
    </div>
    
    <div v-if="decodedResult">
      <h3>解码结果</h3>
      <p>{{ decodedResult }}</p>
    </div>
    
    <div v-if="error" class="error">
      错误: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

const {
  encodeBase64,
  decodeBase64,
  encodeHex,
  decodeHex,
  isEncoding,
  isDecoding,
  lastError
} = useCrypto()

const inputData = ref('Hello, Vue Encoding!')
const encodingType = ref('base64')
const encodedResult = ref('')
const decodedResult = ref('')
const error = computed(() => lastError.value)

const encode = async () => {
  try {
    switch (encodingType.value) {
      case 'base64':
        encodedResult.value = await encodeBase64(inputData.value)
        break
      case 'hex':
        encodedResult.value = await encodeHex(inputData.value)
        break
      case 'base64url':
        encodedResult.value = await encodeBase64Url(inputData.value)
        break
    }
    decodedResult.value = ''
  } catch (err) {
    console.error('编码失败:', err)
  }
}

const decode = async () => {
  try {
    switch (encodingType.value) {
      case 'base64':
        decodedResult.value = await decodeBase64(encodedResult.value)
        break
      case 'hex':
        decodedResult.value = await decodeHex(encodedResult.value)
        break
      case 'base64url':
        decodedResult.value = await decodeBase64Url(encodedResult.value)
        break
    }
  } catch (err) {
    console.error('解码失败:', err)
  }
}
</script>
```

## 实际应用场景

### 1. 数据传输编码

```typescript
// API 数据传输中的编码处理
class DataTransferEncoder {
  // 编码 API 响应数据
  static encodeApiResponse(data: any): string {
    const jsonString = JSON.stringify(data)
    return encrypt.base64(jsonString)
  }
  
  // 解码 API 响应数据
  static decodeApiResponse(encodedData: string): any {
    try {
      const jsonString = decrypt.base64(encodedData)
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('API 响应解码失败')
    }
  }
  
  // 编码文件数据
  static encodeFileData(fileBuffer: ArrayBuffer): string {
    const uint8Array = new Uint8Array(fileBuffer)
    const binaryString = Array.from(uint8Array)
      .map(byte => String.fromCharCode(byte))
      .join('')
    
    return encrypt.base64(binaryString)
  }
  
  // 解码文件数据
  static decodeFileData(encodedData: string): ArrayBuffer {
    const binaryString = decrypt.base64(encodedData)
    const uint8Array = new Uint8Array(binaryString.length)
    
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }
    
    return uint8Array.buffer
  }
}

// 使用示例
const apiData = { message: 'Hello, API!', timestamp: Date.now() }
const encodedResponse = DataTransferEncoder.encodeApiResponse(apiData)
const decodedResponse = DataTransferEncoder.decodeApiResponse(encodedResponse)
```

### 2. URL 参数编码

```typescript
// URL 参数安全编码
class URLParameterEncoder {
  // 编码 URL 参数
  static encodeUrlParam(data: any): string {
    const jsonString = JSON.stringify(data)
    return encrypt.base64Url(jsonString)
  }
  
  // 解码 URL 参数
  static decodeUrlParam(encodedParam: string): any {
    try {
      const jsonString = decrypt.base64Url(encodedParam)
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('URL 参数解码失败')
    }
  }
  
  // 构建带编码参数的 URL
  static buildUrlWithParams(baseUrl: string, params: Record<string, any>): string {
    const encodedParams = this.encodeUrlParam(params)
    return `${baseUrl}?data=${encodedParams}`
  }
  
  // 从 URL 解析参数
  static parseUrlParams(url: string): Record<string, any> {
    const urlObj = new URL(url)
    const encodedData = urlObj.searchParams.get('data')
    
    if (!encodedData) {
      return {}
    }
    
    return this.decodeUrlParam(encodedData)
  }
}

// 使用示例
const params = {
  userId: 123,
  action: 'view',
  filters: { category: 'tech', status: 'active' }
}

const url = URLParameterEncoder.buildUrlWithParams('https://api.example.com/data', params)
console.log('编码后的 URL:', url)

const parsedParams = URLParameterEncoder.parseUrlParams(url)
console.log('解析的参数:', parsedParams)
```

### 3. 配置文件编码

```typescript
// 配置文件编码存储
class ConfigEncoder {
  private static readonly CONFIG_KEY = 'app-config'
  
  // 编码并存储配置
  static saveConfig(config: any): void {
    try {
      const configJson = JSON.stringify(config, null, 2)
      const encodedConfig = encrypt.base64(configJson)
      localStorage.setItem(this.CONFIG_KEY, encodedConfig)
    } catch (error) {
      throw new Error('配置保存失败')
    }
  }
  
  // 读取并解码配置
  static loadConfig(): any {
    try {
      const encodedConfig = localStorage.getItem(this.CONFIG_KEY)
      if (!encodedConfig) {
        return null
      }
      
      const configJson = decrypt.base64(encodedConfig)
      return JSON.parse(configJson)
    } catch (error) {
      console.error('配置读取失败:', error)
      return null
    }
  }
  
  // 导出配置（用于备份）
  static exportConfig(): string {
    const config = this.loadConfig()
    if (!config) {
      throw new Error('没有可导出的配置')
    }
    
    return encrypt.base64(JSON.stringify(config))
  }
  
  // 导入配置（从备份恢复）
  static importConfig(encodedConfig: string): void {
    try {
      const configJson = decrypt.base64(encodedConfig)
      const config = JSON.parse(configJson)
      this.saveConfig(config)
    } catch (error) {
      throw new Error('配置导入失败')
    }
  }
}

// 使用示例
const appConfig = {
  theme: 'dark',
  language: 'zh-CN',
  apiEndpoint: 'https://api.example.com',
  features: {
    notifications: true,
    analytics: false
  }
}

ConfigEncoder.saveConfig(appConfig)
const loadedConfig = ConfigEncoder.loadConfig()
console.log('加载的配置:', loadedConfig)
```

### 4. 二维码数据编码

```typescript
// 二维码数据编码
class QRCodeDataEncoder {
  // 编码二维码数据
  static encodeQRData(data: {
    type: 'url' | 'text' | 'contact' | 'wifi'
    content: any
  }): string {
    const qrData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    const jsonString = JSON.stringify(qrData)
    return encrypt.base64Url(jsonString)
  }
  
  // 解码二维码数据
  static decodeQRData(encodedData: string): any {
    try {
      const jsonString = decrypt.base64Url(encodedData)
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('二维码数据解码失败')
    }
  }
  
  // 生成 WiFi 二维码数据
  static generateWiFiQR(ssid: string, password: string, security: string = 'WPA'): string {
    return this.encodeQRData({
      type: 'wifi',
      content: {
        ssid,
        password,
        security,
        hidden: false
      }
    })
  }
  
  // 生成联系人二维码数据
  static generateContactQR(contact: {
    name: string
    phone?: string
    email?: string
    organization?: string
  }): string {
    return this.encodeQRData({
      type: 'contact',
      content: contact
    })
  }
}

// 使用示例
const wifiQR = QRCodeDataEncoder.generateWiFiQR('MyWiFi', 'password123', 'WPA2')
console.log('WiFi 二维码数据:', wifiQR)

const contactQR = QRCodeDataEncoder.generateContactQR({
  name: 'John Doe',
  phone: '+1234567890',
  email: 'john@example.com',
  organization: 'Example Corp'
})
console.log('联系人二维码数据:', contactQR)
```

## 编码格式对比

### 特性对比

| 编码格式 | 输出长度 | URL 安全 | 可读性 | 用途 |
|----------|----------|----------|--------|------|
| Base64 | +33% | 否 | 中等 | 通用数据传输 |
| Base64 URL | +33% | 是 | 中等 | URL 参数 |
| Hex | +100% | 是 | 高 | 调试、显示 |
| Binary | 原始 | 否 | 低 | 内部处理 |

### 性能对比

```typescript
// 编码性能测试
const performanceTest = () => {
  const testData = 'A'.repeat(10000) // 10KB 数据
  const iterations = 1000
  
  console.time('Base64 编码')
  for (let i = 0; i < iterations; i++) {
    encrypt.base64(testData)
  }
  console.timeEnd('Base64 编码')
  
  console.time('Hex 编码')
  for (let i = 0; i < iterations; i++) {
    encrypt.hex(testData)
  }
  console.timeEnd('Hex 编码')
  
  console.time('Base64 URL 编码')
  for (let i = 0; i < iterations; i++) {
    encrypt.base64Url(testData)
  }
  console.timeEnd('Base64 URL 编码')
}

performanceTest()
```

## 最佳实践

### 1. 选择合适的编码格式

```typescript
// 根据用途选择编码格式
const chooseEncoding = (purpose: string, data: string) => {
  switch (purpose) {
    case 'url-param':
      return encrypt.base64Url(data) // URL 安全
    case 'debug':
      return encrypt.hex(data) // 易于阅读
    case 'storage':
      return encrypt.base64(data) // 紧凑
    case 'display':
      return encrypt.hex(data).toUpperCase() // 美观
    default:
      return encrypt.base64(data)
  }
}
```

### 2. 错误处理

```typescript
// 安全的编码解码
const safeEncode = (data: string, type: 'base64' | 'hex' | 'base64url') => {
  try {
    switch (type) {
      case 'base64': return encrypt.base64(data)
      case 'hex': return encrypt.hex(data)
      case 'base64url': return encrypt.base64Url(data)
      default: throw new Error('不支持的编码类型')
    }
  } catch (error) {
    console.error('编码失败:', error)
    return null
  }
}

const safeDecode = (encodedData: string, type: 'base64' | 'hex' | 'base64url') => {
  try {
    switch (type) {
      case 'base64': return decrypt.base64(encodedData)
      case 'hex': return decrypt.hex(encodedData)
      case 'base64url': return decrypt.base64Url(encodedData)
      default: throw new Error('不支持的解码类型')
    }
  } catch (error) {
    console.error('解码失败:', error)
    return null
  }
}
```

<style>
.crypto-demo {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  background-color: #f8f9fa;
}

.demo-section h3 {
  margin-top: 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.result-textarea {
  min-height: 120px;
  font-family: monospace;
  font-size: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-actions {
  margin: 20px 0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn.primary {
  background-color: #007bff;
  color: white;
}

.btn.secondary {
  background-color: #6c757d;
  color: white;
}

.btn.success {
  background-color: #28a745;
  color: white;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.result-box {
  margin-top: 20px;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
  background-color: white;
}

.result-box.success {
  border-left-color: #28a745;
  background-color: #d4edda;
}

.result-box.error {
  border-left-color: #dc3545;
  background-color: #f8d7da;
  color: #721c24;
}

.result-box h4 {
  margin-top: 0;
  margin-bottom: 15px;
}

.result-item {
  margin-bottom: 10px;
}

.result-item label {
  font-weight: 600;
  color: #555;
  margin-bottom: 5px;
  display: block;
}

.result-value {
  background-color: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  word-break: break-all;
  border: 1px solid #e9ecef;
}

.error {
  color: #dc3545;
  margin-top: 10px;
  padding: 10px;
  background-color: #f8d7da;
  border-radius: 4px;
}
</style>
