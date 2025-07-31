# 数字签名

数字签名用于验证数据的完整性和来源的真实性，是现代密码学的重要组成部分。

## 什么是数字签名

数字签名具有以下特性：
- **身份验证**: 确认签名者的身份
- **完整性**: 确保数据未被篡改
- **不可否认**: 签名者无法否认已签名的数据
- **不可伪造**: 他人无法伪造签名

## RSA 数字签名

@ldesign/crypto 使用 RSA 算法实现数字签名功能。

### 基本流程

1. **密钥生成**: 生成 RSA 密钥对（公钥和私钥）
2. **签名**: 使用私钥对数据进行签名
3. **验证**: 使用公钥验证签名的有效性

### 基本用法

```typescript
import { digitalSignature, rsa } from '@ldesign/crypto'

// 1. 生成 RSA 密钥对
const keyPair = rsa.generateKeyPair(2048)
console.log('公钥:', keyPair.publicKey)
console.log('私钥:', keyPair.privateKey)

// 2. 对数据进行签名
const data = 'Important document content'
const signature = digitalSignature.sign(data, keyPair.privateKey)
console.log('数字签名:', signature)

// 3. 验证签名
const isValid = digitalSignature.verify(data, signature, keyPair.publicKey)
console.log('签名验证结果:', isValid) // true
```

### 指定哈希算法

```typescript
// 使用不同的哈希算法进行签名
const signatureSHA256 = digitalSignature.sign(data, keyPair.privateKey, 'sha256')
const signatureSHA384 = digitalSignature.sign(data, keyPair.privateKey, 'sha384')
const signatureSHA512 = digitalSignature.sign(data, keyPair.privateKey, 'sha512')

// 验证时使用相同的哈希算法
const isValidSHA256 = digitalSignature.verify(data, signatureSHA256, keyPair.publicKey, 'sha256')
const isValidSHA384 = digitalSignature.verify(data, signatureSHA384, keyPair.publicKey, 'sha384')
const isValidSHA512 = digitalSignature.verify(data, signatureSHA512, keyPair.publicKey, 'sha512')
```

## 实际应用场景

### 1. 文档签名

```typescript
interface SignedDocument {
  content: string
  signature: string
  signerPublicKey: string
  timestamp: number
  algorithm: string
}

class DocumentSigner {
  private keyPair: any
  
  constructor() {
    this.keyPair = rsa.generateKeyPair(2048)
  }
  
  signDocument(content: string): SignedDocument {
    const timestamp = Date.now()
    const dataToSign = `${content}|${timestamp}`
    const signature = digitalSignature.sign(dataToSign, this.keyPair.privateKey, 'sha256')
    
    return {
      content,
      signature,
      signerPublicKey: this.keyPair.publicKey,
      timestamp,
      algorithm: 'RSA-SHA256'
    }
  }
  
  static verifyDocument(signedDoc: SignedDocument): boolean {
    const dataToVerify = `${signedDoc.content}|${signedDoc.timestamp}`
    return digitalSignature.verify(
      dataToVerify,
      signedDoc.signature,
      signedDoc.signerPublicKey,
      'sha256'
    )
  }
}

// 使用示例
const signer = new DocumentSigner()
const document = signer.signDocument('This is an important contract.')
const isValid = DocumentSigner.verifyDocument(document)
console.log('文档签名验证:', isValid)
```

### 2. API 请求签名

```typescript
interface APIRequest {
  method: string
  url: string
  body: string
  timestamp: number
}

class APIRequestSigner {
  constructor(private privateKey: string) {}
  
  signRequest(request: APIRequest): string {
    const message = this.createSignatureMessage(request)
    return digitalSignature.sign(message, this.privateKey, 'sha256')
  }
  
  private createSignatureMessage(request: APIRequest): string {
    return `${request.method}\n${request.url}\n${request.body}\n${request.timestamp}`
  }
  
  static verifyRequest(request: APIRequest, signature: string, publicKey: string): boolean {
    const message = `${request.method}\n${request.url}\n${request.body}\n${request.timestamp}`
    return digitalSignature.verify(message, signature, publicKey, 'sha256')
  }
}

// 使用示例
const apiSigner = new APIRequestSigner(keyPair.privateKey)
const request: APIRequest = {
  method: 'POST',
  url: '/api/transfer',
  body: JSON.stringify({ amount: 1000, to: 'user123' }),
  timestamp: Date.now()
}

const requestSignature = apiSigner.signRequest(request)
const isRequestValid = APIRequestSigner.verifyRequest(request, requestSignature, keyPair.publicKey)
```

### 3. 软件包完整性验证

```typescript
interface SoftwarePackage {
  name: string
  version: string
  content: string
  signature: string
  publisherPublicKey: string
}

class PackagePublisher {
  constructor(private keyPair: any) {}
  
  publishPackage(name: string, version: string, content: string): SoftwarePackage {
    const packageInfo = `${name}@${version}`
    const dataToSign = `${packageInfo}\n${content}`
    const signature = digitalSignature.sign(dataToSign, this.keyPair.privateKey, 'sha256')
    
    return {
      name,
      version,
      content,
      signature,
      publisherPublicKey: this.keyPair.publicKey
    }
  }
  
  static verifyPackage(pkg: SoftwarePackage): boolean {
    const packageInfo = `${pkg.name}@${pkg.version}`
    const dataToVerify = `${packageInfo}\n${pkg.content}`
    
    return digitalSignature.verify(
      dataToVerify,
      pkg.signature,
      pkg.publisherPublicKey,
      'sha256'
    )
  }
}

// 使用示例
const publisher = new PackagePublisher(rsa.generateKeyPair(2048))
const package = publisher.publishPackage('my-library', '1.0.0', 'library code...')
const isPackageValid = PackagePublisher.verifyPackage(package)
```

### 4. 电子邮件签名

```typescript
interface SignedEmail {
  from: string
  to: string
  subject: string
  body: string
  signature: string
  timestamp: number
}

class EmailSigner {
  constructor(private privateKey: string) {}
  
  signEmail(from: string, to: string, subject: string, body: string): SignedEmail {
    const timestamp = Date.now()
    const emailData = `From: ${from}\nTo: ${to}\nSubject: ${subject}\nTimestamp: ${timestamp}\n\n${body}`
    const signature = digitalSignature.sign(emailData, this.privateKey, 'sha256')
    
    return {
      from,
      to,
      subject,
      body,
      signature,
      timestamp
    }
  }
  
  static verifyEmail(signedEmail: SignedEmail, senderPublicKey: string): boolean {
    const emailData = `From: ${signedEmail.from}\nTo: ${signedEmail.to}\nSubject: ${signedEmail.subject}\nTimestamp: ${signedEmail.timestamp}\n\n${signedEmail.body}`
    
    return digitalSignature.verify(
      emailData,
      signedEmail.signature,
      senderPublicKey,
      'sha256'
    )
  }
}
```

## 批量签名和验证

```typescript
class BatchSigner {
  constructor(private privateKey: string) {}
  
  signMultiple(dataList: string[]): Array<{ data: string; signature: string }> {
    return dataList.map(data => ({
      data,
      signature: digitalSignature.sign(data, this.privateKey, 'sha256')
    }))
  }
  
  static verifyMultiple(
    signedDataList: Array<{ data: string; signature: string }>,
    publicKey: string
  ): boolean[] {
    return signedDataList.map(item =>
      digitalSignature.verify(item.data, item.signature, publicKey, 'sha256')
    )
  }
}

// 使用示例
const batchSigner = new BatchSigner(keyPair.privateKey)
const dataToSign = ['document1', 'document2', 'document3']
const signedData = batchSigner.signMultiple(dataToSign)
const verificationResults = BatchSigner.verifyMultiple(signedData, keyPair.publicKey)
```

## 安全最佳实践

### 1. 密钥管理

```typescript
// 安全的密钥存储示例（概念）
class SecureKeyManager {
  private static encryptPrivateKey(privateKey: string, password: string): string {
    // 使用密码加密私钥
    const encrypted = encrypt.aes(privateKey, password)
    return JSON.stringify(encrypted)
  }
  
  private static decryptPrivateKey(encryptedKey: string, password: string): string {
    // 解密私钥
    const encryptedData = JSON.parse(encryptedKey)
    const decrypted = decrypt.aes(encryptedData, password)
    if (!decrypted.success) {
      throw new Error('Failed to decrypt private key')
    }
    return decrypted.data
  }
  
  static saveKeyPair(keyPair: any, password: string): { publicKey: string; encryptedPrivateKey: string } {
    return {
      publicKey: keyPair.publicKey,
      encryptedPrivateKey: this.encryptPrivateKey(keyPair.privateKey, password)
    }
  }
  
  static loadKeyPair(publicKey: string, encryptedPrivateKey: string, password: string): any {
    return {
      publicKey,
      privateKey: this.decryptPrivateKey(encryptedPrivateKey, password)
    }
  }
}
```

### 2. 时间戳验证

```typescript
class TimestampedSigner {
  private static readonly MAX_AGE = 5 * 60 * 1000 // 5 分钟
  
  static signWithTimestamp(data: string, privateKey: string): { signature: string; timestamp: number } {
    const timestamp = Date.now()
    const dataWithTimestamp = `${data}|${timestamp}`
    const signature = digitalSignature.sign(dataWithTimestamp, privateKey, 'sha256')
    
    return { signature, timestamp }
  }
  
  static verifyWithTimestamp(
    data: string,
    signature: string,
    timestamp: number,
    publicKey: string
  ): { valid: boolean; expired: boolean } {
    const dataWithTimestamp = `${data}|${timestamp}`
    const valid = digitalSignature.verify(dataWithTimestamp, signature, publicKey, 'sha256')
    const expired = Date.now() - timestamp > this.MAX_AGE
    
    return { valid, expired }
  }
}
```

### 3. 签名链

```typescript
interface SignatureChain {
  data: string
  signatures: Array<{
    signature: string
    signerPublicKey: string
    signerName: string
    timestamp: number
  }>
}

class MultiSigner {
  static addSignature(
    chain: SignatureChain,
    signerPrivateKey: string,
    signerPublicKey: string,
    signerName: string
  ): SignatureChain {
    const timestamp = Date.now()
    const dataToSign = `${chain.data}|${JSON.stringify(chain.signatures)}|${timestamp}`
    const signature = digitalSignature.sign(dataToSign, signerPrivateKey, 'sha256')
    
    return {
      ...chain,
      signatures: [
        ...chain.signatures,
        {
          signature,
          signerPublicKey,
          signerName,
          timestamp
        }
      ]
    }
  }
  
  static verifyChain(chain: SignatureChain): boolean[] {
    return chain.signatures.map((sig, index) => {
      const previousSignatures = chain.signatures.slice(0, index)
      const dataToVerify = `${chain.data}|${JSON.stringify(previousSignatures)}|${sig.timestamp}`
      
      return digitalSignature.verify(dataToVerify, sig.signature, sig.signerPublicKey, 'sha256')
    })
  }
}
```

## 性能考虑

### 密钥长度选择

- **1024 位**: 不推荐，安全性不足
- **2048 位**: 推荐用于一般用途
- **3072 位**: 高安全要求
- **4096 位**: 最高安全级别，但性能较慢

### 哈希算法选择

- **SHA-256**: 推荐用于一般用途
- **SHA-384**: 平衡安全性和性能
- **SHA-512**: 最高安全级别

### 批量处理优化

```typescript
// 异步批量签名
async function signBatchAsync(dataList: string[], privateKey: string): Promise<string[]> {
  const batchSize = 10
  const results: string[] = []
  
  for (let i = 0; i < dataList.length; i += batchSize) {
    const batch = dataList.slice(i, i + batchSize)
    const batchPromises = batch.map(data => 
      Promise.resolve(digitalSignature.sign(data, privateKey, 'sha256'))
    )
    
    const batchResults = await Promise.all(batchPromises)
    results.push(...batchResults)
  }
  
  return results
}
```
