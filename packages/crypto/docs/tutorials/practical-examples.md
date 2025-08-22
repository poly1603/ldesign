# 实战教程：常见应用场景

本教程通过实际应用场景，展示如何使用 @ldesign/crypto 解决常见的加密需求。

## 1. 用户密码安全存储

### 场景描述

在用户注册和登录系统中，需要安全地存储用户密码。

### 解决方案

```typescript
import { hash, RandomUtils } from '@ldesign/crypto'

class UserPasswordManager {
  // 注册时加密密码
  static async hashPassword(plainPassword: string): Promise<{
    hashedPassword: string
    salt: string
  }> {
    // 生成随机盐值
    const salt = RandomUtils.generateRandomHex(32)

    // 使用盐值和密码生成哈希
    const hashedPassword = hash.sha256(plainPassword + salt)

    return {
      hashedPassword,
      salt,
    }
  }

  // 登录时验证密码
  static async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
    salt: string
  ): Promise<boolean> {
    // 使用相同的盐值计算哈希
    const computedHash = hash.sha256(plainPassword + salt)

    // 安全比较哈希值
    return StringUtils.secureCompare(computedHash, hashedPassword)
  }
}

// 使用示例
async function registerUser(username: string, password: string) {
  const { hashedPassword, salt } = await UserPasswordManager.hashPassword(password)

  // 存储到数据库
  await database.users.create({
    username,
    hashedPassword,
    salt,
    createdAt: new Date(),
  })
}

async function loginUser(username: string, password: string) {
  const user = await database.users.findByUsername(username)

  if (!user) {
    throw new Error('用户不存在')
  }

  const isValid = await UserPasswordManager.verifyPassword(password, user.hashedPassword, user.salt)

  if (!isValid) {
    throw new Error('密码错误')
  }

  return user
}
```

### 安全要点

- 使用随机盐值防止彩虹表攻击
- 使用 SHA-256 等强哈希算法
- 使用安全比较函数防止时序攻击

## 2. 敏感数据加密存储

### 场景描述

需要在数据库中安全存储用户的敏感信息，如身份证号、银行卡号等。

### 解决方案

```typescript
import { aes, keyGenerator, base64 } from '@ldesign/crypto'

class SensitiveDataManager {
  private static readonly MASTER_KEY = process.env.ENCRYPTION_MASTER_KEY!

  // 加密敏感数据
  static encryptSensitiveData(data: string): {
    encryptedData: string
    iv: string
  } {
    // 生成随机 IV
    const iv = keyGenerator.generateIV(16)

    // 使用 AES-256-CBC 加密
    const encrypted = aes.encrypt(data, this.MASTER_KEY, {
      keySize: 256,
      mode: 'CBC',
      iv,
    })

    if (!encrypted.success) {
      throw new Error('加密失败: ' + encrypted.error)
    }

    return {
      encryptedData: encrypted.data!,
      iv: encrypted.iv!,
    }
  }

  // 解密敏感数据
  static decryptSensitiveData(encryptedData: string, iv: string): string {
    const decrypted = aes.decrypt(encryptedData, this.MASTER_KEY, {
      keySize: 256,
      mode: 'CBC',
      iv,
    })

    if (!decrypted.success) {
      throw new Error('解密失败: ' + decrypted.error)
    }

    return decrypted.data!
  }
}

// 使用示例
class UserProfile {
  async saveUserProfile(
    userId: string,
    profileData: {
      name: string
      idCard: string
      bankCard: string
    }
  ) {
    // 加密敏感字段
    const encryptedIdCard = SensitiveDataManager.encryptSensitiveData(profileData.idCard)
    const encryptedBankCard = SensitiveDataManager.encryptSensitiveData(profileData.bankCard)

    // 存储到数据库
    await database.userProfiles.create({
      userId,
      name: profileData.name, // 非敏感数据不加密
      idCard: encryptedIdCard.encryptedData,
      idCardIv: encryptedIdCard.iv,
      bankCard: encryptedBankCard.encryptedData,
      bankCardIv: encryptedBankCard.iv,
    })
  }

  async getUserProfile(userId: string) {
    const profile = await database.userProfiles.findByUserId(userId)

    if (!profile) {
      return null
    }

    // 解密敏感字段
    const idCard = SensitiveDataManager.decryptSensitiveData(profile.idCard, profile.idCardIv)

    const bankCard = SensitiveDataManager.decryptSensitiveData(profile.bankCard, profile.bankCardIv)

    return {
      name: profile.name,
      idCard,
      bankCard,
    }
  }
}
```

### 安全要点

- 使用环境变量存储主密钥
- 每次加密使用不同的 IV
- 分别存储加密数据和 IV
- 只在需要时解密数据

## 3. API 接口签名验证

### 场景描述

在 API 接口中实现请求签名，确保请求的完整性和来源可信。

### 解决方案

```typescript
import { hmac, hash } from '@ldesign/crypto'

class APISignatureManager {
  // 生成请求签名
  static generateSignature(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    secretKey: string
  ): string {
    // 构建签名字符串
    const signatureString = [method.toUpperCase(), url, body, timestamp.toString()].join('\n')

    // 使用 HMAC-SHA256 生成签名
    return hmac.sha256(signatureString, secretKey)
  }

  // 验证请求签名
  static verifySignature(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    signature: string,
    secretKey: string
  ): boolean {
    // 检查时间戳（防重放攻击）
    const now = Date.now()
    const timeDiff = Math.abs(now - timestamp)

    if (timeDiff > 5 * 60 * 1000) {
      // 5分钟有效期
      return false
    }

    // 生成期望的签名
    const expectedSignature = this.generateSignature(method, url, body, timestamp, secretKey)

    // 安全比较签名
    return StringUtils.secureCompare(signature, expectedSignature)
  }
}

// 客户端使用示例
class APIClient {
  private secretKey: string

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  async makeRequest(method: string, url: string, body: any = null) {
    const timestamp = Date.now()
    const bodyString = body ? JSON.stringify(body) : ''

    // 生成签名
    const signature = APISignatureManager.generateSignature(
      method,
      url,
      bodyString,
      timestamp,
      this.secretKey
    )

    // 发送请求
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Timestamp': timestamp.toString(),
        'X-Signature': signature,
      },
      body: bodyString || undefined,
    })

    return response.json()
  }
}

// 服务端验证中间件
function signatureVerificationMiddleware(req: Request, res: Response, next: NextFunction) {
  const { method, url, body } = req
  const timestamp = parseInt(req.headers['x-timestamp'] as string)
  const signature = req.headers['x-signature'] as string
  const secretKey = getSecretKeyForClient(req.headers['x-client-id'] as string)

  const bodyString = JSON.stringify(body)

  const isValid = APISignatureManager.verifySignature(
    method,
    url,
    bodyString,
    timestamp,
    signature,
    secretKey
  )

  if (!isValid) {
    return res.status(401).json({ error: '签名验证失败' })
  }

  next()
}
```

### 安全要点

- 包含时间戳防止重放攻击
- 使用 HMAC 确保签名不可伪造
- 安全比较签名防止时序攻击
- 设置合理的时间窗口

## 4. 文件完整性验证

### 场景描述

在文件上传和下载过程中，验证文件的完整性，确保文件未被篡改。

### 解决方案

```typescript
import { hash } from '@ldesign/crypto'

class FileIntegrityManager {
  // 计算文件哈希
  static async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = () => {
        const content = reader.result as string
        const fileHash = hash.sha256(content)
        resolve(fileHash)
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  // 验证文件完整性
  static async verifyFileIntegrity(file: File, expectedHash: string): Promise<boolean> {
    const actualHash = await this.calculateFileHash(file)
    return StringUtils.secureCompare(actualHash, expectedHash)
  }
}

// 文件上传示例
class FileUploadManager {
  async uploadFile(file: File) {
    // 计算文件哈希
    const fileHash = await FileIntegrityManager.calculateFileHash(file)

    // 上传文件和哈希
    const formData = new FormData()
    formData.append('file', file)
    formData.append('hash', fileHash)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    return response.json()
  }

  async downloadAndVerifyFile(fileId: string) {
    // 获取文件信息
    const fileInfo = await fetch(`/api/files/${fileId}/info`).then(r => r.json())

    // 下载文件
    const fileResponse = await fetch(`/api/files/${fileId}/download`)
    const fileBlob = await fileResponse.blob()
    const file = new File([fileBlob], fileInfo.name)

    // 验证文件完整性
    const isValid = await FileIntegrityManager.verifyFileIntegrity(file, fileInfo.hash)

    if (!isValid) {
      throw new Error('文件完整性验证失败，文件可能已被篡改')
    }

    return file
  }
}
```

### 安全要点

- 使用强哈希算法（SHA-256）
- 在上传时计算并存储哈希
- 在下载时重新计算并验证哈希
- 哈希不匹配时拒绝使用文件

## 5. 前端数据加密传输

### 场景描述

在前端向后端传输敏感数据时，进行端到端加密。

### 解决方案

```typescript
import { rsa, aes, keyGenerator } from '@ldesign/crypto'

class SecureDataTransmission {
  private serverPublicKey: string

  constructor(serverPublicKey: string) {
    this.serverPublicKey = serverPublicKey
  }

  // 加密数据进行传输
  async encryptForTransmission(data: any): Promise<{
    encryptedData: string
    encryptedKey: string
    iv: string
  }> {
    // 生成随机 AES 密钥
    const aesKey = keyGenerator.generateKey(32)
    const iv = keyGenerator.generateIV(16)

    // 使用 AES 加密数据
    const encryptedData = aes.encrypt(JSON.stringify(data), aesKey, {
      keySize: 256,
      mode: 'CBC',
      iv,
    })

    if (!encryptedData.success) {
      throw new Error('数据加密失败')
    }

    // 使用 RSA 公钥加密 AES 密钥
    const encryptedKey = rsa.encrypt(aesKey, this.serverPublicKey)

    if (!encryptedKey.success) {
      throw new Error('密钥加密失败')
    }

    return {
      encryptedData: encryptedData.data!,
      encryptedKey: encryptedKey.data!,
      iv: encryptedData.iv!,
    }
  }

  // 发送加密数据
  async sendSecureData(endpoint: string, data: any) {
    const encrypted = await this.encryptForTransmission(data)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encrypted),
    })

    return response.json()
  }
}

// 服务端解密示例
class SecureDataReceiver {
  private privateKey: string

  constructor(privateKey: string) {
    this.privateKey = privateKey
  }

  // 解密接收到的数据
  decryptReceivedData(encryptedPayload: {
    encryptedData: string
    encryptedKey: string
    iv: string
  }): any {
    // 使用 RSA 私钥解密 AES 密钥
    const decryptedKey = rsa.decrypt(encryptedPayload.encryptedKey, this.privateKey)

    if (!decryptedKey.success) {
      throw new Error('密钥解密失败')
    }

    // 使用 AES 密钥解密数据
    const decryptedData = aes.decrypt(encryptedPayload.encryptedData, decryptedKey.data!, {
      keySize: 256,
      mode: 'CBC',
      iv: encryptedPayload.iv,
    })

    if (!decryptedData.success) {
      throw new Error('数据解密失败')
    }

    return JSON.parse(decryptedData.data!)
  }
}

// 使用示例
const client = new SecureDataTransmission(serverPublicKey)

// 发送敏感数据
await client.sendSecureData('/api/sensitive-data', {
  creditCard: '1234-5678-9012-3456',
  ssn: '123-45-6789',
  personalInfo: {
    name: 'John Doe',
    address: '123 Main St',
  },
})
```

### 安全要点

- 使用混合加密（RSA + AES）
- 每次传输使用不同的 AES 密钥
- 使用强随机数生成器
- 验证服务器公钥的真实性
