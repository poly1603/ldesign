# SSL 证书管理

SSL 模块提供了 SSL 证书生成、验证和管理工具，支持自签名证书、证书签名请求和证书链验证。

## 导入方式

```typescript
// 完整导入
import { SSLManager, SSLUtils } from '@ldesign/kit'

// 按需导入
import { SSLManager } from '@ldesign/kit/ssl'

// 单独导入
import { SSLManager, SSLUtils } from '@ldesign/kit'
```

## SSLManager

SSL 管理器类，提供完整的 SSL 证书管理功能。

### 创建实例

#### `new SSLManager(options?: SSLOptions)`

创建 SSL 管理器实例。

```typescript
// 默认配置
const sslManager = new SSLManager()

// 自定义配置
const sslManager = new SSLManager({
  keySize: 2048, // 密钥长度
  algorithm: 'rsa', // 算法类型
  validityDays: 365, // 有效期（天）
  country: 'CN', // 国家
  state: 'Beijing', // 省份
  city: 'Beijing', // 城市
  organization: 'My Org', // 组织
  unit: 'IT Department', // 部门
})
```

### 密钥对生成

#### `generateKeyPair(algorithm?: KeyAlgorithm, keySize?: number): Promise<KeyPair>`

生成密钥对。

```typescript
// 生成 RSA 密钥对
const rsaKeyPair = await sslManager.generateKeyPair('rsa', 2048)

// 生成 EC 密钥对
const ecKeyPair = await sslManager.generateKeyPair('ec', 256)

// 生成 Ed25519 密钥对
const ed25519KeyPair = await sslManager.generateKeyPair('ed25519')

console.log('私钥:', rsaKeyPair.privateKey)
console.log('公钥:', rsaKeyPair.publicKey)
```

### 证书生成

#### `generateSelfSignedCertificate(keyPair: KeyPair, request: CertificateRequest): Promise<string>`

生成自签名证书。

```typescript
const keyPair = await sslManager.generateKeyPair('rsa', 2048)

const certificate = await sslManager.generateSelfSignedCertificate(keyPair, {
  commonName: 'localhost',
  organization: 'My Company',
  organizationalUnit: 'IT Department',
  country: 'CN',
  state: 'Beijing',
  city: 'Beijing',
  validityDays: 365,
  extensions: {
    subjectAltName: ['DNS:localhost', 'DNS:*.example.com', 'IP:127.0.0.1', 'IP:::1'],
    keyUsage: ['digitalSignature', 'keyEncipherment'],
    extKeyUsage: ['serverAuth', 'clientAuth'],
  },
})

console.log('自签名证书:', certificate)
```

#### `generateCSR(keyPair: KeyPair, request: CertificateRequest): Promise<string>`

生成证书签名请求。

```typescript
const keyPair = await sslManager.generateKeyPair('rsa', 2048)

const csr = await sslManager.generateCSR(keyPair, {
  commonName: 'www.example.com',
  organization: 'Example Corp',
  organizationalUnit: 'IT',
  country: 'US',
  state: 'California',
  city: 'San Francisco',
  extensions: {
    subjectAltName: ['DNS:www.example.com', 'DNS:example.com', 'DNS:api.example.com'],
  },
})

console.log('证书签名请求:', csr)
```

#### `signCertificate(csr: string, caCert: string, caKey: string, options?: SignOptions): Promise<string>`

签名证书。

```typescript
const signedCert = await sslManager.signCertificate(csr, caCertificate, caPrivateKey, {
  validityDays: 90,
  serialNumber: '123456789',
  extensions: {
    basicConstraints: { ca: false },
    keyUsage: ['digitalSignature', 'keyEncipherment'],
    extKeyUsage: ['serverAuth'],
  },
})

console.log('已签名证书:', signedCert)
```

### 证书验证

#### `verifyCertificate(certificate: string, options?: VerifyOptions): Promise<SSLValidationResult>`

验证证书。

```typescript
const validationResult = await sslManager.verifyCertificate(certificate, {
  checkExpiry: true,
  checkChain: true,
  trustedCAs: [caCertificate],
  hostname: 'www.example.com',
})

if (validationResult.valid) {
  console.log('证书验证通过')
} else {
  console.log('证书验证失败:')
  validationResult.errors.forEach(error => {
    console.log(`- ${error}`)
  })
}
```

#### `verifyCertificateChain(certificates: string[]): Promise<ChainValidationResult>`

验证证书链。

```typescript
const chainResult = await sslManager.verifyCertificateChain([
  leafCertificate,
  intermediateCertificate,
  rootCertificate,
])

if (chainResult.valid) {
  console.log('证书链验证通过')
  console.log('信任路径:', chainResult.trustPath)
} else {
  console.log('证书链验证失败:', chainResult.error)
}
```

### 证书解析

#### `parseCertificate(certificate: string): CertificateInfo`

解析证书信息。

```typescript
const certInfo = sslManager.parseCertificate(certificate)

console.log('证书信息:')
console.log('- 主题:', certInfo.subject)
console.log('- 颁发者:', certInfo.issuer)
console.log('- 序列号:', certInfo.serialNumber)
console.log('- 有效期从:', certInfo.validFrom)
console.log('- 有效期到:', certInfo.validTo)
console.log('- 公钥算法:', certInfo.publicKeyAlgorithm)
console.log('- 签名算法:', certInfo.signatureAlgorithm)
console.log('- 扩展:', certInfo.extensions)
```

#### `extractPublicKey(certificate: string): string`

从证书中提取公钥。

```typescript
const publicKey = sslManager.extractPublicKey(certificate)
console.log('公钥:', publicKey)
```

### 证书格式转换

#### `convertFormat(certificate: string, fromFormat: CertFormat, toFormat: CertFormat): Promise<string>`

转换证书格式。

```typescript
// PEM 转 DER
const derCert = await sslManager.convertFormat(pemCertificate, 'pem', 'der')

// DER 转 PEM
const pemCert = await sslManager.convertFormat(derCertificate, 'der', 'pem')

// PEM 转 PKCS12
const p12Cert = await sslManager.convertFormat(pemCertificate, 'pem', 'pkcs12')
```

## SSLUtils

SSL 工具函数类，提供常用的 SSL 操作工具。

### 快速操作

#### `generateQuickCertificate(options: QuickCertOptions): Promise<CertificateBundle>`

快速生成证书。

```typescript
const certBundle = await SSLUtils.generateQuickCertificate({
  commonName: 'localhost',
  organization: 'Development',
  validityDays: 365,
  keySize: 2048,
  algorithm: 'rsa',
})

console.log('私钥:', certBundle.privateKey)
console.log('证书:', certBundle.certificate)
console.log('公钥:', certBundle.publicKey)
```

#### `generateDevelopmentCertificate(domains: string[]): Promise<CertificateBundle>`

生成开发用证书。

```typescript
const devCert = await SSLUtils.generateDevelopmentCertificate([
  'localhost',
  '127.0.0.1',
  '*.local.dev',
])

// 保存证书文件
await FileSystem.writeFile('./dev-cert.pem', devCert.certificate)
await FileSystem.writeFile('./dev-key.pem', devCert.privateKey)
```

### 验证工具

#### `validateDomainMatch(certificate: string, domain: string): boolean`

验证域名匹配。

```typescript
const isMatch = SSLUtils.validateDomainMatch(certificate, 'www.example.com')
console.log('域名匹配:', isMatch)

// 支持通配符
const wildcardMatch = SSLUtils.validateDomainMatch(certificate, 'api.example.com')
```

#### `checkCertificateExpiry(certificate: string): ExpiryInfo`

检查证书过期信息。

```typescript
const expiryInfo = SSLUtils.checkCertificateExpiry(certificate)

console.log('是否过期:', expiryInfo.expired)
console.log('过期时间:', expiryInfo.expiryDate)
console.log('剩余天数:', expiryInfo.daysRemaining)
console.log('即将过期:', expiryInfo.expiringSoon) // 30天内
```

#### `analyzeCertificateStrength(certificate: string): StrengthAnalysis`

分析证书强度。

```typescript
const strength = SSLUtils.analyzeCertificateStrength(certificate)

console.log('整体评级:', strength.overall) // A+, A, B, C, D, F
console.log('密钥强度:', strength.keyStrength) // 密钥长度评分
console.log('算法强度:', strength.algorithmStrength) // 算法安全性评分
console.log('配置评分:', strength.configScore) // 配置安全性评分
console.log('建议:', strength.recommendations) // 改进建议
```

### 证书链工具

#### `buildCertificateChain(certificates: string[]): string[]`

构建证书链。

```typescript
const orderedChain = SSLUtils.buildCertificateChain([
  rootCertificate,
  leafCertificate,
  intermediateCertificate,
])

console.log('正确的证书链顺序:', orderedChain)
```

#### `findMissingIntermediates(leafCert: string, rootCerts: string[]): Promise<string[]>`

查找缺失的中间证书。

```typescript
const missingCerts = await SSLUtils.findMissingIntermediates(leafCertificate, [rootCertificate])

console.log('缺失的中间证书:', missingCerts)
```

## 实际应用示例

### HTTPS 开发服务器

```typescript
class HTTPSDevServer {
  private sslManager = new SSLManager()

  async createDevCertificate() {
    console.log('🔐 生成开发用 SSL 证书...')

    const certBundle = await SSLUtils.generateDevelopmentCertificate([
      'localhost',
      '127.0.0.1',
      '*.local.dev',
      'dev.myapp.com',
    ])

    // 保存证书文件
    await FileSystem.ensureDir('./certs')
    await FileSystem.writeFile('./certs/dev-cert.pem', certBundle.certificate)
    await FileSystem.writeFile('./certs/dev-key.pem', certBundle.privateKey)

    console.log('✅ 开发证书已生成并保存到 ./certs/')

    return certBundle
  }

  async startServer() {
    const certBundle = await this.createDevCertificate()

    const https = require('https')
    const express = require('express')

    const app = express()

    app.get('/', (req, res) => {
      res.json({ message: 'HTTPS 开发服务器运行中', secure: true })
    })

    const server = https.createServer(
      {
        cert: certBundle.certificate,
        key: certBundle.privateKey,
      },
      app
    )

    server.listen(3443, () => {
      console.log('🚀 HTTPS 开发服务器启动在 https://localhost:3443')
      console.log('⚠️  注意: 这是自签名证书，浏览器会显示安全警告')
    })

    return server
  }
}
```

### 证书监控工具

```typescript
class CertificateMonitor {
  private sslManager = new SSLManager()

  async monitorCertificates(certificates: string[]) {
    console.log('🔍 开始监控证书状态...')

    for (const certPath of certificates) {
      try {
        const certificate = await FileSystem.readFile(certPath)
        await this.checkCertificate(certificate, certPath)
      } catch (error) {
        console.error(`❌ 读取证书失败 ${certPath}:`, error.message)
      }
    }
  }

  private async checkCertificate(certificate: string, path: string) {
    const certInfo = this.sslManager.parseCertificate(certificate)
    const expiryInfo = SSLUtils.checkCertificateExpiry(certificate)
    const strength = SSLUtils.analyzeCertificateStrength(certificate)

    console.log(`\n📋 证书: ${path}`)
    console.log(`   主题: ${certInfo.subject.commonName}`)
    console.log(`   颁发者: ${certInfo.issuer.commonName}`)
    console.log(`   有效期: ${certInfo.validFrom} - ${certInfo.validTo}`)

    if (expiryInfo.expired) {
      console.log(`   ❌ 状态: 已过期`)
    } else if (expiryInfo.expiringSoon) {
      console.log(`   ⚠️  状态: 即将过期 (${expiryInfo.daysRemaining} 天)`)
    } else {
      console.log(`   ✅ 状态: 有效 (${expiryInfo.daysRemaining} 天)`)
    }

    console.log(`   🔒 安全评级: ${strength.overall}`)

    if (strength.recommendations.length > 0) {
      console.log(`   💡 建议:`)
      strength.recommendations.forEach(rec => {
        console.log(`      - ${rec}`)
      })
    }

    // 验证证书
    const validation = await this.sslManager.verifyCertificate(certificate)
    if (!validation.valid) {
      console.log(`   ❌ 验证失败:`)
      validation.errors.forEach(error => {
        console.log(`      - ${error}`)
      })
    }
  }

  async setupExpiryAlerts(certificates: string[], alertDays: number = 30) {
    const expiringCerts = []

    for (const certPath of certificates) {
      try {
        const certificate = await FileSystem.readFile(certPath)
        const expiryInfo = SSLUtils.checkCertificateExpiry(certificate)

        if (expiryInfo.daysRemaining <= alertDays && !expiryInfo.expired) {
          expiringCerts.push({
            path: certPath,
            daysRemaining: expiryInfo.daysRemaining,
            expiryDate: expiryInfo.expiryDate,
          })
        }
      } catch (error) {
        console.error(`检查证书失败 ${certPath}:`, error.message)
      }
    }

    if (expiringCerts.length > 0) {
      console.log(`⚠️  发现 ${expiringCerts.length} 个即将过期的证书:`)
      expiringCerts.forEach(cert => {
        console.log(`   ${cert.path}: ${cert.daysRemaining} 天后过期`)
      })

      // 发送通知
      await this.sendExpiryNotification(expiringCerts)
    }
  }

  private async sendExpiryNotification(expiringCerts: any[]) {
    // 实现通知逻辑（邮件、Slack 等）
    console.log('📧 发送过期提醒通知...')
  }
}
```

### 证书自动续期工具

```typescript
class CertificateRenewal {
  private sslManager = new SSLManager()

  async autoRenewCertificates(config: RenewalConfig[]) {
    console.log('🔄 开始自动续期证书...')

    for (const certConfig of config) {
      try {
        await this.renewCertificate(certConfig)
      } catch (error) {
        console.error(`续期失败 ${certConfig.name}:`, error.message)
      }
    }
  }

  private async renewCertificate(config: RenewalConfig) {
    const certificate = await FileSystem.readFile(config.certPath)
    const expiryInfo = SSLUtils.checkCertificateExpiry(certificate)

    // 检查是否需要续期
    if (expiryInfo.daysRemaining > config.renewBeforeDays) {
      console.log(`✅ ${config.name}: 无需续期 (${expiryInfo.daysRemaining} 天)`)
      return
    }

    console.log(`🔄 ${config.name}: 开始续期...`)

    if (config.type === 'self-signed') {
      await this.renewSelfSigned(config)
    } else if (config.type === 'acme') {
      await this.renewACME(config)
    } else if (config.type === 'ca') {
      await this.renewWithCA(config)
    }

    console.log(`✅ ${config.name}: 续期完成`)
  }

  private async renewSelfSigned(config: RenewalConfig) {
    // 生成新的自签名证书
    const keyPair = await this.sslManager.generateKeyPair('rsa', 2048)
    const certificate = await this.sslManager.generateSelfSignedCertificate(keyPair, {
      commonName: config.commonName,
      organization: config.organization,
      validityDays: config.validityDays || 365,
      extensions: config.extensions,
    })

    // 备份旧证书
    await this.backupOldCertificate(config)

    // 保存新证书
    await FileSystem.writeFile(config.certPath, certificate)
    await FileSystem.writeFile(config.keyPath, keyPair.privateKey)

    // 重启相关服务
    if (config.restartCommand) {
      await this.executeCommand(config.restartCommand)
    }
  }

  private async renewACME(config: RenewalConfig) {
    // 实现 ACME 协议续期逻辑
    console.log('使用 ACME 协议续期...')
  }

  private async renewWithCA(config: RenewalConfig) {
    // 实现 CA 签名续期逻辑
    console.log('使用 CA 签名续期...')
  }

  private async backupOldCertificate(config: RenewalConfig) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = `${config.certPath}.backup.${timestamp}`
    await FileSystem.copy(config.certPath, backupPath)
    console.log(`📦 旧证书已备份到: ${backupPath}`)
  }

  private async executeCommand(command: string) {
    console.log(`🔧 执行命令: ${command}`)
    // 实现命令执行逻辑
  }
}
```

## 类型定义

```typescript
interface SSLOptions {
  keySize?: number
  algorithm?: KeyAlgorithm
  validityDays?: number
  country?: string
  state?: string
  city?: string
  organization?: string
  unit?: string
}

interface KeyPair {
  privateKey: string
  publicKey: string
}

interface CertificateRequest {
  commonName: string
  organization?: string
  organizationalUnit?: string
  country?: string
  state?: string
  city?: string
  validityDays?: number
  extensions?: CertificateExtensions
}

interface CertificateInfo {
  subject: {
    commonName: string
    organization?: string
    country?: string
  }
  issuer: {
    commonName: string
    organization?: string
    country?: string
  }
  serialNumber: string
  validFrom: Date
  validTo: Date
  publicKeyAlgorithm: string
  signatureAlgorithm: string
  extensions: CertificateExtensions
}

interface SSLValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

interface ExpiryInfo {
  expired: boolean
  expiryDate: Date
  daysRemaining: number
  expiringSoon: boolean
}

interface StrengthAnalysis {
  overall: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F'
  keyStrength: number
  algorithmStrength: number
  configScore: number
  recommendations: string[]
}

type KeyAlgorithm = 'rsa' | 'ec' | 'ed25519'
type CertFormat = 'pem' | 'der' | 'pkcs12'
```

## 错误处理

```typescript
try {
  const certificate = await sslManager.generateSelfSignedCertificate(keyPair, request)
} catch (error) {
  if (error.code === 'INVALID_KEY') {
    console.log('密钥格式无效')
  } else if (error.code === 'INVALID_REQUEST') {
    console.log('证书请求参数无效')
  } else {
    console.error('生成证书失败:', error.message)
  }
}
```

## 最佳实践

1. **密钥安全**: 妥善保管私钥，使用强密码保护
2. **证书监控**: 定期检查证书过期时间
3. **自动续期**: 设置自动续期机制
4. **备份策略**: 定期备份证书和私钥
5. **安全配置**: 使用强加密算法和足够的密钥长度

## 示例应用

查看 [使用示例](/examples/ssl-management) 了解更多 SSL 证书管理的实际应用场景。
