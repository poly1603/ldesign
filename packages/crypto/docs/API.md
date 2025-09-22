# @ldesign/crypto API 文档

## 核心模块

### AES 加密 (`aes`)

#### `aes.encrypt(data, key, options?)`

加密数据使用 AES 算法。

**参数：**
- `data: string` - 要加密的数据
- `key: string` - 加密密钥
- `options?: AESOptions` - 可选配置

**AESOptions：**
```typescript
interface AESOptions {
  keySize?: 128 | 192 | 256  // 密钥长度，默认 256
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'  // 加密模式，默认 'CBC'
  iv?: string  // 初始化向量，自动生成如果未提供
  padding?: string  // 填充方式，默认 'Pkcs7'
}
```

**返回值：**
```typescript
interface AESEncryptResult {
  success: boolean
  data?: string  // 加密后的数据（Base64 编码）
  iv?: string    // 使用的初始化向量
  algorithm: string  // 'AES'
  mode: string   // 使用的加密模式
  keySize: number  // 使用的密钥长度
  error?: string  // 错误信息（如果失败）
}
```

**示例：**
```typescript
import { aes } from '@ldesign/crypto'

const result = aes.encrypt('Hello World', 'my-secret-key', {
  keySize: 256,
  mode: 'CBC'
})

if (result.success) {
  console.log('加密成功:', result.data)
  console.log('IV:', result.iv)
} else {
  console.error('加密失败:', result.error)
}
```

#### `aes.decrypt(encryptedData, key, options?)`

解密 AES 加密的数据。

**参数：**
- `encryptedData: string | AESEncryptResult` - 加密的数据或加密结果对象
- `key: string` - 解密密钥
- `options?: AESDecryptOptions` - 可选配置

**AESDecryptOptions：**
```typescript
interface AESDecryptOptions {
  keySize?: 128 | 192 | 256
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'
  iv?: string  // 解密时必须提供正确的 IV
  padding?: string
}
```

**返回值：**
```typescript
interface AESDecryptResult {
  success: boolean
  data?: string  // 解密后的原始数据
  error?: string  // 错误信息（如果失败）
}
```

### 哈希算法 (`hash`)

#### `hash.md5(data, options?)`
#### `hash.sha1(data, options?)`
#### `hash.sha256(data, options?)`
#### `hash.sha384(data, options?)`
#### `hash.sha512(data, options?)`

计算数据的哈希值。

**参数：**
- `data: string` - 要计算哈希的数据
- `options?: HashOptions` - 可选配置

**HashOptions：**
```typescript
interface HashOptions {
  encoding?: 'hex' | 'base64'  // 输出编码，默认 'hex'
}
```

**返回值：** `string` - 哈希值

**示例：**
```typescript
import { hash } from '@ldesign/crypto'

const sha256Hash = hash.sha256('Hello World')
console.log(sha256Hash) // hex 编码的哈希值

const base64Hash = hash.sha256('Hello World', { encoding: 'base64' })
console.log(base64Hash) // base64 编码的哈希值
```

### RSA 加密 (`rsa`)

#### `rsa.generateKeyPair(keySize?)`

生成 RSA 密钥对。

**参数：**
- `keySize?: number` - 密钥长度，默认 2048

**返回值：**
```typescript
interface RSAKeyPair {
  publicKey: string   // PEM 格式的公钥
  privateKey: string  // PEM 格式的私钥
}
```

#### `rsa.encrypt(data, publicKey, options?)`

使用 RSA 公钥加密数据。

**参数：**
- `data: string` - 要加密的数据
- `publicKey: string` - PEM 格式的公钥
- `options?: RSAOptions` - 可选配置

#### `rsa.decrypt(encryptedData, privateKey, options?)`

使用 RSA 私钥解密数据。

### 编码工具 (`encoding`)

#### `encoding.encode(data, type)`
#### `encoding.decode(data, type)`

编码和解码数据。

**参数：**
- `data: string` - 要编码/解码的数据
- `type: 'base64' | 'hex'` - 编码类型

**示例：**
```typescript
import { encoding } from '@ldesign/crypto'

// Base64 编码
const encoded = encoding.encode('Hello World', 'base64')
console.log(encoded) // 'SGVsbG8gV29ybGQ='

// Base64 解码
const decoded = encoding.decode(encoded, 'base64')
console.log(decoded) // 'Hello World'

// Hex 编码
const hexEncoded = encoding.encode('Hello World', 'hex')
console.log(hexEncoded) // '48656c6c6f20576f726c64'
```

### 密钥生成器 (`keyGenerator`)

#### `keyGenerator.generateKey(length)`

生成随机密钥。

**参数：**
- `length: number` - 密钥长度（字节）

**返回值：** `string` - 十六进制格式的密钥

#### `keyGenerator.generateRSAKeyPair(keySize?)`

生成 RSA 密钥对。

#### `keyGenerator.generateRandomBytes(length)`

生成随机字节。

#### `keyGenerator.generateSalt(length?)`

生成随机盐值。

#### `keyGenerator.generateIV(length?)`

生成随机初始化向量。

## Vue 3 集成

### Composition API

#### `useCrypto()`

提供基础的加密解密功能。

**返回值：**
```typescript
interface UseCryptoReturn {
  // 状态
  isLoading: Ref<boolean>
  error: Ref<string | null>
  result: Ref<string | null>
  
  // 计算属性
  hasError: Ref<boolean>
  isReady: Ref<boolean>
  
  // 方法
  encrypt: {
    aes: (data: string, key: string, options?: AESOptions) => Promise<AESEncryptResult | null>
    rsa: (data: string, publicKey: string, options?: RSAOptions) => Promise<RSAEncryptResult | null>
  }
  decrypt: {
    aes: (data: string, key: string, options?: AESDecryptOptions) => Promise<AESDecryptResult | null>
    rsa: (data: string, privateKey: string, options?: RSAOptions) => Promise<RSADecryptResult | null>
  }
  clearError: () => void
  reset: () => void
}
```

#### `useHash()`

提供哈希计算功能。

**返回值：**
```typescript
interface UseHashReturn {
  // 状态
  isHashing: Ref<boolean>
  error: Ref<string | null>
  result: Ref<string | null>
  
  // 方法
  md5: (data: string, options?: HashOptions) => Promise<string | null>
  sha1: (data: string, options?: HashOptions) => Promise<string | null>
  sha256: (data: string, options?: HashOptions) => Promise<string | null>
  sha384: (data: string, options?: HashOptions) => Promise<string | null>
  sha512: (data: string, options?: HashOptions) => Promise<string | null>
  
  clearError: () => void
  reset: () => void
}
```

#### `useEncryption()`

提供便捷的加密解密功能。

**返回值：**
```typescript
interface UseEncryptionReturn {
  // 状态
  isLoading: Ref<boolean>
  error: Ref<string | null>
  result: Ref<string | null>
  
  // 方法
  encryptText: (text: string, password: string) => Promise<string | null>
  decryptText: (encryptedText: string, password: string) => Promise<string | null>
  encryptFile: (fileContent: string, password: string) => Promise<string | null>
  decryptFile: (encryptedContent: string, password: string) => Promise<string | null>
  
  clearError: () => void
}
```

#### `useKeyManager()`

提供密钥管理功能。

**返回值：**
```typescript
interface UseKeyManagerReturn {
  // 状态
  isGenerating: Ref<boolean>
  error: Ref<string | null>
  keys: Ref<Record<string, string | RSAKeyPair>>
  
  // 计算属性
  hasError: Ref<boolean>
  keyCount: Ref<number>
  keyNames: Ref<string[]>
  isReady: Ref<boolean>
  
  // 方法
  generateAESKey: (keySize?: 128 | 192 | 256) => Promise<string | null>
  generateRSAKeyPair: (keySize?: 1024 | 2048 | 3072 | 4096) => Promise<RSAKeyPair | null>
  generateRandomKey: (length?: number) => Promise<string | null>
  
  storeKey: (name: string, key: string | RSAKeyPair) => void
  getKey: (name: string) => string | RSAKeyPair | null
  removeKey: (name: string) => boolean
  
  exportKeys: () => string
  importKeys: (keysData: string) => boolean
  
  clearError: () => void
  clearKeys: () => void
}
```

### 插件

#### `CryptoPlugin`

Vue 3 插件，提供全局访问加密功能。

**安装：**
```typescript
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'
import App from './App.vue'

const app = createApp(App)
app.use(CryptoPlugin)
app.mount('#app')
```

**使用：**
```typescript
// 在组件中
export default {
  mounted() {
    // 通过 this.$crypto 访问
    const encrypted = this.$crypto.encrypt.aes('data', 'key')
    console.log(encrypted)
  }
}
```

## 错误处理

所有加密操作都返回包含 `success` 字段的结果对象。当操作失败时，`success` 为 `false`，并包含 `error` 字段描述错误信息。

```typescript
const result = aes.encrypt('data', 'key')
if (!result.success) {
  console.error('加密失败:', result.error)
  // 处理错误
}
```

在 Vue 组合式函数中，错误信息存储在响应式的 `error` 引用中：

```typescript
const { encrypt, error } = useCrypto()

watchEffect(() => {
  if (error.value) {
    console.error('操作失败:', error.value)
  }
})
```
