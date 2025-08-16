# 编码算法

编码算法用于将数据转换为不同的表示形式，常用于数据传输、存储和显示。

## 支持的编码格式

@ldesign/crypto 支持以下编码格式：

| 编码类型        | 用途             | 特点                     |
| --------------- | ---------------- | ------------------------ |
| Base64          | 数据传输、存储   | 可打印字符，适合文本协议 |
| URL-safe Base64 | URL 参数、文件名 | 不包含 +、/ 和 = 字符    |
| Hex             | 调试、显示       | 十六进制表示，易读       |
| UTF-8           | 文本处理         | 默认字符编码             |

## Base64 编码

Base64 是最常用的编码方式，将二进制数据转换为 ASCII 字符。

### 基本用法

```typescript
import { base64 } from '@ldesign/crypto'

const originalData = 'Hello, World! 你好，世界！'

// 编码
const encoded = base64.encode(originalData)
console.log(encoded) // "SGVsbG8sIFdvcmxkISDkvaDlpb3vvIzkuJbnlYzvvIE="

// 解码
const decoded = base64.decode(encoded)
console.log(decoded) // "Hello, World! 你好，世界！"
```

### URL 安全的 Base64

URL-safe Base64 使用 `-` 和 `_` 替代 `+` 和 `/`，并且不使用填充字符 `=`。

```typescript
const data = 'URL safe encoding test'

// 标准 Base64
const standardBase64 = base64.encode(data)
console.log(standardBase64) // 可能包含 +、/ 和 =

// URL 安全 Base64
const urlSafeBase64 = base64.encodeUrl(data)
console.log(urlSafeBase64) // 使用 -、_ 替代，无填充

// 解码
const decodedStandard = base64.decode(standardBase64)
const decodedUrlSafe = base64.decodeUrl(urlSafeBase64)
```

### 处理二进制数据

```typescript
// 模拟二进制数据
const binaryData = new Uint8Array([72, 101, 108, 108, 111])
const binaryString = String.fromCharCode(...binaryData)

const encoded = base64.encode(binaryString)
const decoded = base64.decode(encoded)

// 转换回 Uint8Array
const decodedBytes = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)))
```

## Hex 编码

Hex（十六进制）编码将每个字节表示为两个十六进制字符。

### 基本用法

```typescript
import { hex } from '@ldesign/crypto'

const data = 'Hello, Hex!'

// 编码
const encoded = hex.encode(data)
console.log(encoded) // "48656c6c6f2c20486578210"

// 解码
const decoded = hex.decode(encoded)
console.log(decoded) // "Hello, Hex!"
```

### 处理二进制数据

```typescript
// 字节数组转 Hex
const bytes = new Uint8Array([255, 128, 64, 32, 16, 8, 4, 2, 1])
const bytesString = String.fromCharCode(...bytes)
const hexString = hex.encode(bytesString)
console.log(hexString) // "ff80402010080402010"

// Hex 转字节数组
const decodedString = hex.decode(hexString)
const decodedBytes = new Uint8Array(decodedString.split('').map(c => c.charCodeAt(0)))
```

## 通用编码接口

使用通用接口可以动态选择编码类型：

```typescript
import { encoding } from '@ldesign/crypto'

const data = 'Dynamic encoding test'

// 动态选择编码类型
function encodeData(data: string, type: 'base64' | 'hex' | 'utf8'): string {
  return encoding.encode(data, type)
}

function decodeData(encodedData: string, type: 'base64' | 'hex' | 'utf8'): string {
  return encoding.decode(encodedData, type)
}

// 使用示例
const base64Encoded = encodeData(data, 'base64')
const hexEncoded = encodeData(data, 'hex')
const utf8Encoded = encodeData(data, 'utf8')
```

## 实际应用场景

### 1. 数据传输

```typescript
// 将二进制数据编码为文本进行传输
function prepareForTransmission(binaryData: Uint8Array): string {
  const dataString = String.fromCharCode(...binaryData)
  return base64.encode(dataString)
}

function receiveFromTransmission(encodedData: string): Uint8Array {
  const dataString = base64.decode(encodedData)
  return new Uint8Array(dataString.split('').map(c => c.charCodeAt(0)))
}
```

### 2. 配置文件存储

```typescript
interface Config {
  apiKey: string
  secretData: string
}

function saveConfig(config: Config): string {
  const configJson = JSON.stringify(config)
  return base64.encode(configJson)
}

function loadConfig(encodedConfig: string): Config {
  const configJson = base64.decode(encodedConfig)
  return JSON.parse(configJson)
}

// 使用示例
const config = { apiKey: 'key123', secretData: 'secret' }
const encodedConfig = saveConfig(config)
const loadedConfig = loadConfig(encodedConfig)
```

### 3. URL 参数编码

```typescript
function createSecureUrl(baseUrl: string, data: object): string {
  const dataJson = JSON.stringify(data)
  const encodedData = base64.encodeUrl(dataJson)
  return `${baseUrl}?data=${encodedData}`
}

function parseSecureUrl(url: string): object {
  const urlObj = new URL(url)
  const encodedData = urlObj.searchParams.get('data')
  if (!encodedData) throw new Error('No data parameter')

  const dataJson = base64.decodeUrl(encodedData)
  return JSON.parse(dataJson)
}

// 使用示例
const secureUrl = createSecureUrl('https://api.example.com/endpoint', {
  userId: 123,
  action: 'getData',
})
```

### 4. 调试和日志

```typescript
function logBinaryData(data: Uint8Array, label: string): void {
  const dataString = String.fromCharCode(...data)
  const hexString = hex.encode(dataString)
  const base64String = base64.encode(dataString)

  console.log(`${label}:`)
  console.log(`  Hex: ${hexString}`)
  console.log(`  Base64: ${base64String}`)
  console.log(`  Length: ${data.length} bytes`)
}

// 使用示例
const testData = new Uint8Array([1, 2, 3, 4, 5])
logBinaryData(testData, 'Test Data')
```

### 5. 数据完整性验证

```typescript
import { hash } from '@ldesign/crypto'

function createDataPacket(data: string): string {
  const dataHash = hash.sha256(data)
  const packet = {
    data: base64.encode(data),
    hash: dataHash,
    timestamp: Date.now(),
  }
  return base64.encode(JSON.stringify(packet))
}

function verifyDataPacket(encodedPacket: string): { data: string; valid: boolean } {
  try {
    const packetJson = base64.decode(encodedPacket)
    const packet = JSON.parse(packetJson)

    const originalData = base64.decode(packet.data)
    const computedHash = hash.sha256(originalData)
    const valid = computedHash === packet.hash

    return { data: originalData, valid }
  } catch {
    return { data: '', valid: false }
  }
}
```

## 性能考虑

### 编码选择

- **Base64**: 输出大小约为原始数据的 133%
- **Hex**: 输出大小为原始数据的 200%
- **URL-safe Base64**: 与标准 Base64 相同，但更适合 URL

### 大数据处理

```typescript
// 分块处理大数据
function encodeInChunks(data: string, chunkSize: number = 1024): string {
  const chunks: string[] = []

  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    chunks.push(base64.encode(chunk))
  }

  return chunks.join('|') // 使用分隔符连接
}

function decodeFromChunks(encodedChunks: string): string {
  const chunks = encodedChunks.split('|')
  return chunks.map(chunk => base64.decode(chunk)).join('')
}
```

### 内存优化

```typescript
// 流式处理（概念示例）
class StreamEncoder {
  private buffer = ''

  write(data: string): string {
    this.buffer += data

    // 当缓冲区达到一定大小时进行编码
    if (this.buffer.length >= 1024) {
      const encoded = base64.encode(this.buffer)
      this.buffer = ''
      return encoded
    }

    return ''
  }

  flush(): string {
    if (this.buffer.length > 0) {
      const encoded = base64.encode(this.buffer)
      this.buffer = ''
      return encoded
    }
    return ''
  }
}
```

## 错误处理

```typescript
function safeEncode(data: string, type: 'base64' | 'hex'): { result: string; error?: string } {
  try {
    const result = encoding.encode(data, type)
    return { result }
  } catch (error) {
    return {
      result: '',
      error: error instanceof Error ? error.message : 'Unknown encoding error',
    }
  }
}

function safeDecode(
  encodedData: string,
  type: 'base64' | 'hex'
): { result: string; error?: string } {
  try {
    const result = encoding.decode(encodedData, type)
    return { result }
  } catch (error) {
    return {
      result: '',
      error: error instanceof Error ? error.message : 'Unknown decoding error',
    }
  }
}

// 使用示例
const encodeResult = safeEncode('test data', 'base64')
if (encodeResult.error) {
  console.error('编码失败:', encodeResult.error)
} else {
  console.log('编码成功:', encodeResult.result)
}
```
