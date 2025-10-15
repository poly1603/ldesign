# 解密 API

本文档描述了 @ldesign/crypto 提供的所有解密功能。

## 目录

- [Decrypt 类](#decrypt-类)
- [AES 解密](#aes-解密)
- [RSA 解密](#rsa-解密)
- [DES/3DES 解密](#des3des-解密)
- [Blowfish 解密](#blowfish-解密)
- [解码功能](#解码功能)
- [链式解密](#链式解密)
- [认证解密](#认证解密)

## Decrypt 类

`Decrypt` 类提供了统一的解密 API，与 `Encrypt` 类配套使用。

### 导入方式

```typescript
import { Decrypt, decrypt } from '@ldesign/crypto'

// 使用类
const decryptor = new Decrypt()

// 使用实例（推荐）
import { decrypt } from '@ldesign/crypto'
```

### 通用解密方法

#### `decrypt(encryptedData, key, algorithm?, options?)`

根据算法类型自动选择合适的解密方法。

**参数：**

- `encryptedData` (string | EncryptResult) - 加密数据或加密结果对象
- `key` (string) - 解密密钥
- `algorithm` (EncryptionAlgorithm?) - 加密算法（如果传入 EncryptResult 可省略）
- `options` (EncryptionOptions?) - 可选的解密选项

**返回值：** `DecryptResult`

**示例：**

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

// 加密
const encrypted = encrypt.aes('Hello World', 'my-secret-key')

// 方式 1：传入 EncryptResult（推荐）
const result1 = decrypt.decrypt(encrypted, 'my-secret-key')

// 方式 2：传入字符串并指定算法
const result2 = decrypt.decrypt(encrypted.data!, 'my-secret-key', 'AES', {
    iv: encrypted.iv,
    keySize: encrypted.keySize
})

if (result1.success) {
    console.log('解密成功:', result1.data)
} else {
    console.error('解密失败:', result1.error)
}
```

---

## AES 解密

### `aes(encryptedData, key, options?)`

使用 AES 算法解密数据。

**参数：**

- `encryptedData` (string | EncryptResult) - 加密数据
- `key` (string) - 解密密钥（与加密时使用的密钥相同）
- `options` (AESOptions?) - 解密选项

**返回值：** `DecryptResult`

**示例：**

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

// 加密
const encrypted = encrypt.aes256('Hello World', 'my-secret-key')

// 解密 - 方式 1：传入 EncryptResult（最简单）
const decrypted1 = decrypt.aes(encrypted, 'my-secret-key')
console.log(decrypted1.data) // 'Hello World'

// 解密 - 方式 2：传入字符串（需要提供完整选项）
const decrypted2 = decrypt.aes(encrypted.data!, 'my-secret-key', {
    iv: encrypted.iv,
    keySize: 256,
    mode: 'CBC'
})

// 解密 - 方式 3：使用 CryptoJS 默认格式
const defaultFormatEncrypted = 'U2FsdGVkX1...' // CryptoJS 默认格式
const decrypted3 = decrypt.aes(defaultFormatEncrypted, 'my-secret-key')
```

### AES 快捷方法

#### `aes128(encryptedData, key, options?)`

使用 AES-128 解密。

```typescript
const decrypted = decrypt.aes128(encrypted, 'key')
```

#### `aes192(encryptedData, key, options?)`

使用 AES-192 解密。

```typescript
const decrypted = decrypt.aes192(encrypted, 'key')
```

#### `aes256(encryptedData, key, options?)`

使用 AES-256 解密（推荐）。

```typescript
const decrypted = decrypt.aes256(encrypted, 'key')
```

### 解密选项

与加密时相同的选项：

```typescript
interface AESOptions {
    mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR' | 'GCM'
    keySize?: 128 | 192 | 256
    iv?: string
    padding?: string
    salt?: string
    iterations?: number
}
```

### 处理不同格式

```typescript
// 1. 处理 EncryptResult 对象
const encrypted = encrypt.aes('data', 'key')
const decrypted = decrypt.aes(encrypted, 'key')

// 2. 处理 CryptoJS 默认格式字符串（包含 IV）
const cryptojsFormat = 'U2FsdGVkX1...'
const decrypted2 = decrypt.aes(cryptojsFormat, 'key')

// 3. 处理纯密文字符串（需要提供 IV）
const ciphertext = 'abc123...'
const iv = '0123456789abcdef0123456789abcdef'
const decrypted3 = decrypt.aes(ciphertext, 'key', { iv })
```

---

## RSA 解密

### `rsa(encryptedData, privateKey, options?)`

使用 RSA 私钥解密数据。

**参数：**

- `encryptedData` (string | EncryptResult) - 加密数据
- `privateKey` (string) - RSA 私钥（PEM 格式）
- `options` (RSAOptions?) - 解密选项

**返回值：** `DecryptResult`

**示例：**

```typescript
import { encrypt, decrypt, keyGenerator } from '@ldesign/crypto'

// 生成密钥对
const keyPair = keyGenerator.generateRSAKeyPair(2048)

// 加密
const encrypted = encrypt.rsa('Hello World', keyPair.publicKey)

// 解密
const decrypted = decrypt.rsa(encrypted, keyPair.privateKey)

if (decrypted.success) {
    console.log('解密成功:', decrypted.data)
}

// 指定选项
const decrypted2 = decrypt.rsa(encrypted.data!, keyPair.privateKey, {
    padding: 'OAEP',
    keySize: 2048
})
```

### RSA 解密注意事项

1. **密钥匹配**：必须使用与加密时配对的私钥
2. **填充方式**：必须与加密时使用的填充方式相同
3. **数据完整性**：任何数据损坏都会导致解密失败

---

## DES/3DES 解密

### `des(encryptedData, key, options?)`

使用 DES 解密数据。

**参数：**

- `encryptedData` (string | EncryptResult) - 加密数据
- `key` (string) - 解密密钥（8 字节）
- `options` (DESOptions?) - 解密选项

**示例：**

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

const encrypted = encrypt.des('Hello', '8bytekey')
const decrypted = decrypt.des(encrypted, '8bytekey')

console.log(decrypted.data) // 'Hello'
```

### `des3(encryptedData, key, options?)` / `tripledes(encryptedData, key, options?)`

使用 3DES 解密数据。

**参数：**

- `encryptedData` (string | EncryptResult) - 加密数据
- `key` (string) - 解密密钥（24 字节）
- `options` (TripleDESOptions?) - 解密选项

**示例：**

```typescript
const encrypted = encrypt.des3('Hello', '24-byte-long-secret-key!')
const decrypted = decrypt.des3(encrypted, '24-byte-long-secret-key!')
// 或者
const decrypted2 = decrypt.tripledes(encrypted, '24-byte-long-secret-key!')
```

---

## Blowfish 解密

### `blowfish(encryptedData, key, options?)`

使用 Blowfish 解密数据。

**参数：**

- `encryptedData` (string | EncryptResult) - 加密数据
- `key` (string) - 解密密钥（4-56 字节）
- `options` (BlowfishOptions?) - 解密选项

**示例：**

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

const encrypted = encrypt.blowfish('Hello World', 'secret-key')
const decrypted = decrypt.blowfish(encrypted, 'secret-key')

console.log(decrypted.data) // 'Hello World'
```

---

## 解码功能

Decrypt 类还提供了解码功能。

### `base64(encodedData)`

将 Base64 字符串解码为原始字符串。

```typescript
const decoded = decrypt.base64('SGVsbG8gV29ybGQ=')
console.log(decoded) // 'Hello World'
```

### `base64Url(encodedData)`

将 URL 安全的 Base64 字符串解码。

```typescript
const decoded = decrypt.base64Url('SGVsbG8gV29ybGQ')
```

### `hex(encodedData)`

将十六进制字符串解码为原始字符串。

```typescript
const decoded = decrypt.hex('48656c6c6f')
console.log(decoded) // 'Hello'
```

### `decode(encodedData, encodingType)`

通用解码方法。

```typescript
const original1 = decrypt.decode('SGVsbG8=', 'base64')
const original2 = decrypt.decode('48656c6c6f', 'hex')
const original3 = decrypt.decode('Hello', 'utf8')
```

---

## 链式解密

使用链式 API 进行流畅的解密操作。

### 基本用法

```typescript
import { chain } from '@ldesign/crypto'

// 解码并解密
const decrypted = chain(encryptedBase64String)
    .fromBase64()
    .decrypt('AES', 'secret-key')
    .execute()

console.log('解密结果:', decrypted)
```

### 完整流程

```typescript
import { chain } from '@ldesign/crypto'

// 加密流程
const encrypted = chain('Hello World')
    .encrypt('AES', 'secret-key')
    .base64()
    .execute()

// 解密流程（反向操作）
const decrypted = chain(encrypted)
    .fromBase64()
    .decrypt('AES', 'secret-key')
    .execute()

console.log(decrypted) // 'Hello World'
```

### 多步骤解密

```typescript
// 假设数据经过：加密 -> Base64 -> Hex 编码
const decrypted = chain(hexEncodedData)
    .fromHex()          // 1. 解码 Hex
    .fromBase64()       // 2. 解码 Base64
    .decrypt('AES', 'key') // 3. 解密
    .execute()
```

---

## 认证解密

认证解密（AEAD）解密数据并验证完整性。

### `decryptWithAuth(encryptedData, key, options?)`

解密数据并验证认证标签。

**参数：**

- `encryptedData` (AuthenticatedEncryptResult | string) - 认证加密结果
- `key` (string) - 解密密钥
- `options` (AuthenticatedEncryptionOptions?) - 选项

**返回值：** `AuthenticatedDecryptResult`

```typescript
interface AuthenticatedDecryptResult {
    success: boolean
    data: string          // 解密后的数据
    verified: boolean     // 认证是否通过
    error?: string        // 错误信息
}
```

**示例：**

```typescript
import { encryptWithAuth, decryptWithAuth } from '@ldesign/crypto'

// 加密
const encrypted = encryptWithAuth('敏感数据', 'secret-key')

// 解密并验证
const decrypted = decryptWithAuth(encrypted, 'secret-key')

if (decrypted.success && decrypted.verified) {
    console.log('数据完整，解密成功:', decrypted.data)
} else {
    console.error('数据可能被篡改!', decrypted.error)
}

// 错误密钥会导致验证失败
const wrongKey = decryptWithAuth(encrypted, 'wrong-key')
console.log(wrongKey.verified) // false
```

### JSON 认证解密

```typescript
import { encryptJSONWithAuth, decryptJSONWithAuth } from '@ldesign/crypto'

// 加密 JSON
const userData = { id: 1, name: 'Alice' }
const encrypted = encryptJSONWithAuth(userData, 'secret-key')

// 解密 JSON
const result = decryptJSONWithAuth<typeof userData>(encrypted, 'secret-key')

if (result.verified && result.data) {
    console.log('用户 ID:', result.data.id)
    console.log('用户名:', result.data.name)
} else {
    console.error('验证失败:', result.error)
}
```

### 数据完整性验证

认证解密会自动验证：

1. **数据完整性**：数据未被修改
2. **认证标签**：验证消息来源
3. **附加数据**：如果使用了 AAD，也会验证

```typescript
const encrypted = encryptWithAuth('data', 'key', {
    aad: 'user-id:123'
})

// 正确解密
const result1 = decryptWithAuth(encrypted, 'key')
console.log(result1.verified) // true

// 篡改数据
encrypted.ciphertext = 'tampered-data'
const result2 = decryptWithAuth(encrypted, 'key')
console.log(result2.verified) // false
```

---

## 错误处理

### 检查解密结果

```typescript
const result = decrypt.aes(encrypted, 'key')

if (result.success) {
    console.log('解密成功:', result.data)
} else {
    console.error('解密失败:', result.error)
}
```

### 常见错误

```typescript
// 1. 密钥错误
const wrong = decrypt.aes(encrypted, 'wrong-key')
console.log(wrong.error) // 'Decrypted data contains invalid characters'

// 2. IV 缺失
const noIv = decrypt.aes('ciphertext', 'key')
console.log(noIv.error) // 'IV not found in encrypted data'

// 3. 格式错误
const badFormat = decrypt.aes('invalid-base64!@#', 'key')
console.log(badFormat.error) // 'Invalid encrypted data format'

// 4. 算法不匹配
const wrongAlgo = decrypt.des(aesEncrypted, 'key')
console.log(wrongAlgo.error) // 'Decryption failed'
```

### 链式解密错误处理

```typescript
const chain = decrypt.chain(encrypted)
    .fromBase64()
    .decrypt('AES', 'key')

if (chain.hasError()) {
    const error = chain.getError()
    console.error('解密过程出错:', error?.message)

    // 清除错误并继续
    chain.clearError()
}
```

---

## 完整示例

### 加密解密完整流程

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

// 1. 加密
const originalData = '这是需要保护的敏感信息'
const secretKey = 'my-secret-key-2023'

const encrypted = encrypt.aes256(originalData, secretKey)

if (encrypted.success) {
    console.log('加密成功!')
    console.log('密文:', encrypted.data)
    console.log('IV:', encrypted.iv)

    // 2. 可以将 encrypted 对象序列化存储
    const stored = JSON.stringify(encrypted)

    // 3. 从存储恢复
    const restored = JSON.parse(stored)

    // 4. 解密
    const decrypted = decrypt.aes(restored, secretKey)

    if (decrypted.success) {
        console.log('解密成功!')
        console.log('原文:', decrypted.data)
        console.log('验证:', decrypted.data === originalData) // true
    }
}
```

### 文件解密

```typescript
import { decrypt } from '@ldesign/crypto'

// 从文件或数据库读取加密数据
const encryptedFileData = {
    data: '...',
    iv: '...',
    algorithm: 'AES',
    keySize: 256
}

// 解密
const decrypted = decrypt.aes(encryptedFileData, fileEncryptionKey)

if (decrypted.success) {
    // 使用解密后的内容
    console.log('文件内容:', decrypted.data)
} else {
    console.error('文件解密失败:', decrypted.error)
}
```

### 混合加密解密

```typescript
import { encrypt, decrypt, keyGenerator } from '@ldesign/crypto'

// 1. 加密方：生成 AES 密钥并加密数据
const aesKey = keyGenerator.generateKey(32)
const encryptedData = encrypt.aes256(largeData, aesKey)

// 2. 加密方：用 RSA 公钥加密 AES 密钥
const encryptedKey = encrypt.rsa(aesKey, recipientPublicKey)

// 3. 传输 encryptedData 和 encryptedKey

// 4. 解密方：用 RSA 私钥解密 AES 密钥
const decryptedKey = decrypt.rsa(encryptedKey, recipientPrivateKey)

// 5. 解密方：用 AES 密钥解密数据
if (decryptedKey.success) {
    const decryptedData = decrypt.aes(encryptedData, decryptedKey.data!)
    console.log('最终数据:', decryptedData.data)
}
```

---

## 最佳实践

1. **使用 EncryptResult 对象**
   - 推荐传入完整的加密结果对象
   - 自动包含所有必要的参数（IV、算法等）

2. **密钥管理**
   - 使用相同的密钥解密
   - 安全存储解密密钥
   - 不要在客户端暴露私钥

3. **错误处理**
   - 始终检查 `success` 字段
   - 妥善处理解密失败情况
   - 不要泄露详细的错误信息

4. **数据验证**
   - 验证解密后的数据格式
   - 使用认证加密确保完整性
   - 检查数据的合法性

5. **性能优化**
   - 缓存解密密钥
   - 批量解密使用管理器
   - 避免重复解密

---

## 相关链接

- [加密 API](./encryption.md)
- [密钥生成 API](./key-generation.md)
- [管理器 API](./manager.md)
- [类型定义](./types.md)
