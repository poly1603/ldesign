# 编码示例

展示 Base64 与 Hex 的编码/解码，示例为纯代码，SSR 友好。

## Base64 编解码

```ts path=null start=null
import { decrypt, encrypt } from '@ldesign/crypto'

const encoded = encrypt.base64('Hello, Base64!')
const decoded = decrypt.base64(encoded)

const urlSafeEncoded = encrypt.base64Url('Hello, URL-safe!')
const urlSafeDecoded = decrypt.base64Url(urlSafeEncoded)
```

## Hex 编解码

```ts path=null start=null
import { decrypt, encrypt } from '@ldesign/crypto'

const hex = encrypt.hex('Hello, Hex!')
const text = decrypt.hex(hex)
```

## 通用编码接口

```ts path=null start=null
import { encoding } from '@ldesign/crypto'

const b64 = encoding.encode('Universal', 'base64')
const b64Decoded = encoding.decode(b64, 'base64')
const hexStr = encoding.encode('Universal', 'hex')
```

## 小贴士

- URL 参数建议使用 Base64 URL 安全格式
- Debug/展示建议使用 Hex

本页面展示了 @ldesign/crypto 中各种编码和解码功能的使用示例。

## 交互式演示

<!-- Interactive demo removed in SSR build: replace with static examples or client-only components -->



## 代码示例

### Base64 编码

```typescript
import { decrypt, encrypt } from '@ldesign/crypto'

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
<!-- client-only demo removed for SSR build -->
<script setup>
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

const { encodeBase64, decodeBase64, encodeHex, decodeHex, isEncoding, isDecoding, lastError }
  = useCrypto()

const inputData = ref('Hello, Vue Encoding!')
const encodingType = ref('base64')
const encodedResult = ref('')
const decodedResult = ref('')
const error = computed(() => lastError.value)

async function encode() {
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
  }
  catch (err) {
    console.error('编码失败:', err)
  }
}

async function decode() {
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
  }
  catch (err) {
    console.error('解码失败:', err)
  }
}
</script>

<template>
  <div>
    <h2>编码演示</h2>

    <div>
      <textarea v-model="inputData" placeholder="输入要编码的数据" />

      <div>
        <label>编码类型:</label>
        <select v-model="encodingType">
          <option value="base64">
            Base64
          </option>
          <option value="hex">
            Hex
          </option>
          <option value="base64url">
            URL 安全 Base64
          </option>
        </select>
      </div>

      <button :disabled="isEncoding" @click="encode">
        {{ isEncoding ? '编码中...' : '编码' }}
      </button>
      <button :disabled="isDecoding || !encodedResult" @click="decode">
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
    }
    catch (error) {
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
    }
    catch (error) {
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
  filters: { category: 'tech', status: 'active' },
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    }
    catch (error) {
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
    analytics: false,
  },
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
  static encodeQRData(data: { type: 'url' | 'text' | 'contact' | 'wifi', content: any }): string {
    const qrData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0',
    }

    const jsonString = JSON.stringify(qrData)
    return encrypt.base64Url(jsonString)
  }

  // 解码二维码数据
  static decodeQRData(encodedData: string): any {
    try {
      const jsonString = decrypt.base64Url(encodedData)
      return JSON.parse(jsonString)
    }
    catch (error) {
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
        hidden: false,
      },
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
      content: contact,
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
  organization: 'Example Corp',
})
console.log('联系人二维码数据:', contactQR)
```

## 编码格式对比

### 特性对比

| 编码格式   | 输出长度 | URL 安全 | 可读性 | 用途         |
| ---------- | -------- | -------- | ------ | ------------ |
| Base64     | +33%     | 否       | 中等   | 通用数据传输 |
| Base64 URL | +33%     | 是       | 中等   | URL 参数     |
| Hex        | +100%    | 是       | 高     | 调试、显示   |
| Binary     | 原始     | 否       | 低     | 内部处理     |

### 性能对比

```typescript
// 编码性能测试
function performanceTest() {
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
function chooseEncoding(purpose: string, data: string) {
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
function safeEncode(data: string, type: 'base64' | 'hex' | 'base64url') {
  try {
    switch (type) {
      case 'base64':
        return encrypt.base64(data)
      case 'hex':
        return encrypt.hex(data)
      case 'base64url':
        return encrypt.base64Url(data)
      default:
        throw new Error('不支持的编码类型')
    }
  }
  catch (error) {
    console.error('编码失败:', error)
    return null
  }
}

function safeDecode(encodedData: string, type: 'base64' | 'hex' | 'base64url') {
  try {
    switch (type) {
      case 'base64':
        return decrypt.base64(encodedData)
      case 'hex':
        return decrypt.hex(encodedData)
      case 'base64url':
        return decrypt.base64Url(encodedData)
      default:
        throw new Error('不支持的解码类型')
    }
  }
  catch (error) {
    console.error('解码失败:', error)
    return null
  }
}
```

