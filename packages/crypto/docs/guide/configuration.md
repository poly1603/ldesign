# 自定义配置

@ldesign/crypto 提供了灵活的配置选项，允许您根据项目需求自定义加密行为。

## 全局配置

### 基本配置

```typescript
import { setGlobalConfig } from '@ldesign/crypto'

// 设置全局默认配置
setGlobalConfig({
  // AES 配置
  aes: {
    keySize: 256,           // 默认密钥长度
    mode: 'CBC',            // 默认加密模式
    padding: 'Pkcs7',       // 填充方式
    encoding: 'hex'         // 输出编码
  },
  
  // RSA 配置
  rsa: {
    keySize: 2048,          // 默认密钥长度
    keyFormat: 'pem',       // 密钥格式
    padding: 'OAEP',        // 填充方式
    hashAlgorithm: 'SHA256' // 哈希算法
  },
  
  // 哈希配置
  hash: {
    algorithm: 'SHA256',    // 默认哈希算法
    encoding: 'hex',        // 输出编码
    iterations: 1000        // PBKDF2 迭代次数
  },
  
  // 编码配置
  encoding: {
    charset: 'utf8',        // 字符编码
    urlSafe: false          // Base64 URL 安全模式
  }
})
```

### 环境特定配置

```typescript
// config/crypto.ts
const baseConfig = {
  aes: {
    keySize: 256,
    mode: 'CBC'
  },
  rsa: {
    keySize: 2048,
    keyFormat: 'pem'
  }
}

export const cryptoConfigs = {
  development: {
    ...baseConfig,
    // 开发环境：优化性能
    aes: {
      ...baseConfig.aes,
      keySize: 128  // 使用较小的密钥提高开发速度
    },
    debug: true,
    strictValidation: false
  },
  
  production: {
    ...baseConfig,
    // 生产环境：最高安全性
    aes: {
      ...baseConfig.aes,
      keySize: 256
    },
    rsa: {
      ...baseConfig.rsa,
      keySize: 4096  // 使用更大的密钥
    },
    debug: false,
    strictValidation: true
  },
  
  test: {
    ...baseConfig,
    // 测试环境：快速执行
    aes: {
      ...baseConfig.aes,
      keySize: 128
    },
    debug: false,
    strictValidation: true
  }
}

// 根据环境加载配置
const env = process.env.NODE_ENV || 'development'
export const currentConfig = cryptoConfigs[env]
```

### 动态配置

```typescript
import { getGlobalConfig, updateGlobalConfig } from '@ldesign/crypto'

// 获取当前配置
const currentConfig = getGlobalConfig()
console.log('当前配置:', currentConfig)

// 动态更新配置
updateGlobalConfig({
  aes: {
    keySize: 192  // 只更新 AES 密钥长度
  }
})

// 重置为默认配置
import { resetGlobalConfig } from '@ldesign/crypto'
resetGlobalConfig()
```

## 算法特定配置

### AES 配置选项

```typescript
import { encrypt } from '@ldesign/crypto'

// 方式1：通过选项参数配置
const encrypted = encrypt.aes(data, key, {
  keySize: 256,           // 密钥长度：128, 192, 256
  mode: 'CBC',            // 加密模式：CBC, ECB, CFB, OFB, CTR
  padding: 'Pkcs7',       // 填充方式：Pkcs7, NoPadding
  iv: 'custom-iv',        // 自定义初始化向量
  encoding: 'base64'      // 输出编码：hex, base64
})

// 方式2：创建配置对象
const aesConfig = {
  keySize: 256,
  mode: 'GCM',            // 认证加密模式
  tagLength: 128,         // GCM 标签长度
  additionalData: 'metadata'  // 附加认证数据
}

const encrypted = encrypt.aes(data, key, aesConfig)
```

### RSA 配置选项

```typescript
import { rsa } from '@ldesign/crypto'

// 密钥生成配置
const keyPair = rsa.generateKeyPair(2048, {
  keyFormat: 'pem',       // 密钥格式：pem, der
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
    cipher: 'aes256',     // 私钥加密算法
    passphrase: 'secret'  // 私钥密码
  }
})

// 加密配置
const encrypted = encrypt.rsa(data, publicKey, {
  padding: 'OAEP',        // 填充方式：OAEP, PKCS1
  hashAlgorithm: 'SHA256', // 哈希算法
  mgf: 'MGF1',            // 掩码生成函数
  saltLength: 32          // 盐值长度
})
```

### 哈希配置选项

```typescript
import { hash } from '@ldesign/crypto'

// 基本哈希配置
const hashValue = hash.sha256(data, {
  encoding: 'hex',        // 输出编码：hex, base64, binary
  iterations: 1,          // 迭代次数
  salt: 'custom-salt'     // 自定义盐值
})

// PBKDF2 配置
const derivedKey = hash.pbkdf2(password, salt, {
  iterations: 10000,      // 迭代次数
  keyLength: 32,          // 输出密钥长度
  hashAlgorithm: 'SHA256' // 哈希算法
})

// Scrypt 配置
const scryptKey = hash.scrypt(password, salt, {
  N: 16384,               // CPU/内存成本参数
  r: 8,                   // 块大小参数
  p: 1,                   // 并行化参数
  keyLength: 32           // 输出密钥长度
})
```

## Vue 3 插件配置

### 插件安装配置

```typescript
// main.ts
import { createApp } from 'vue'
import { CryptoPlugin } from '@ldesign/crypto/vue'

const app = createApp(App)

app.use(CryptoPlugin, {
  // 全局属性名称
  globalPropertyName: '$crypto',
  
  // 是否注册全局组合式函数
  registerComposables: true,
  
  // 是否启用开发工具支持
  devtools: process.env.NODE_ENV === 'development',
  
  // 自定义配置
  config: {
    // 默认算法参数
    defaultAESKeySize: 256,
    defaultRSAKeySize: 2048,
    defaultHashAlgorithm: 'SHA256',
    defaultEncoding: 'hex',
    
    // 性能配置
    enableCache: true,
    cacheSize: 100,
    enableWorker: true,
    
    // 安全配置
    strictMode: true,
    validateInputs: true,
    clearMemoryOnError: true,
    
    // 调试配置
    enableLogs: process.env.NODE_ENV === 'development',
    logLevel: 'info'
  }
})
```

### Composable 配置

```typescript
// 使用自定义配置的 composable
import { useCrypto } from '@ldesign/crypto/vue'

const crypto = useCrypto({
  // 自动重试配置
  autoRetry: true,
  retryCount: 3,
  retryDelay: 1000,
  
  // 缓存配置
  enableCache: true,
  cacheTimeout: 300000, // 5分钟
  
  // 错误处理配置
  throwOnError: false,
  logErrors: true,
  
  // 性能配置
  enableWorker: false,
  batchSize: 10
})
```

## 高级配置

### 自定义算法实现

```typescript
import { registerAlgorithm } from '@ldesign/crypto'

// 注册自定义算法
registerAlgorithm('CUSTOM_AES', {
  encrypt: (data, key, options) => {
    // 自定义加密实现
    return customEncrypt(data, key, options)
  },
  
  decrypt: (encryptedData, key, options) => {
    // 自定义解密实现
    return customDecrypt(encryptedData, key, options)
  },
  
  generateKey: (keySize) => {
    // 自定义密钥生成
    return customGenerateKey(keySize)
  }
})

// 使用自定义算法
const encrypted = encrypt.custom('CUSTOM_AES', data, key)
```

### 中间件配置

```typescript
import { addMiddleware } from '@ldesign/crypto'

// 添加加密前中间件
addMiddleware('beforeEncrypt', (data, key, options) => {
  console.log('准备加密:', data.length, '字节')
  
  // 数据预处理
  if (options.compress) {
    data = compress(data)
  }
  
  // 密钥验证
  if (!validateKey(key)) {
    throw new Error('无效的密钥')
  }
  
  return { data, key, options }
})

// 添加加密后中间件
addMiddleware('afterEncrypt', (result, originalData, key, options) => {
  console.log('加密完成:', result.algorithm)
  
  // 结果后处理
  if (options.addChecksum) {
    result.checksum = calculateChecksum(result.data)
  }
  
  return result
})
```

### 性能配置

```typescript
import { setPerformanceConfig } from '@ldesign/crypto'

setPerformanceConfig({
  // Web Worker 配置
  worker: {
    enabled: true,
    maxWorkers: navigator.hardwareConcurrency || 4,
    taskTimeout: 30000,
    workerScript: '/crypto-worker.js'
  },
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    ttl: 300000,        // 5分钟
    strategy: 'lru'     // LRU 策略
  },
  
  // 批处理配置
  batch: {
    enabled: true,
    maxBatchSize: 100,
    batchTimeout: 1000  // 1秒
  },
  
  // 内存管理
  memory: {
    autoCleanup: true,
    cleanupInterval: 60000,  // 1分钟
    maxMemoryUsage: 100 * 1024 * 1024  // 100MB
  }
})
```

## 配置验证

### 配置验证器

```typescript
import { validateConfig } from '@ldesign/crypto'

const config = {
  aes: {
    keySize: 256,
    mode: 'CBC'
  },
  rsa: {
    keySize: 2048
  }
}

// 验证配置
const validation = validateConfig(config)

if (!validation.valid) {
  console.error('配置错误:', validation.errors)
  // 处理配置错误
}
```

### 自定义验证规则

```typescript
import { addConfigValidator } from '@ldesign/crypto'

// 添加自定义验证规则
addConfigValidator('aes.keySize', (value) => {
  const validSizes = [128, 192, 256]
  if (!validSizes.includes(value)) {
    return `AES 密钥长度必须是 ${validSizes.join(', ')} 之一`
  }
  return null
})

addConfigValidator('rsa.keySize', (value) => {
  if (value < 1024) {
    return 'RSA 密钥长度不能小于 1024 位'
  }
  if (value % 8 !== 0) {
    return 'RSA 密钥长度必须是 8 的倍数'
  }
  return null
})
```

## 配置文件管理

### 配置文件结构

```typescript
// crypto.config.ts
export default {
  // 基础配置
  base: {
    aes: { keySize: 256, mode: 'CBC' },
    rsa: { keySize: 2048, keyFormat: 'pem' },
    hash: { algorithm: 'SHA256', encoding: 'hex' }
  },
  
  // 环境覆盖
  environments: {
    development: {
      aes: { keySize: 128 },
      debug: true
    },
    production: {
      rsa: { keySize: 4096 },
      strictMode: true
    }
  },
  
  // 功能特定配置
  features: {
    vue: {
      globalPropertyName: '$crypto',
      registerComposables: true
    },
    performance: {
      enableCache: true,
      enableWorker: true
    }
  }
}
```

### 配置加载器

```typescript
// utils/configLoader.ts
import defaultConfig from '../crypto.config'

export class ConfigLoader {
  private config: any
  
  constructor() {
    this.config = this.loadConfig()
  }
  
  private loadConfig() {
    const env = process.env.NODE_ENV || 'development'
    const envConfig = defaultConfig.environments[env] || {}
    
    return {
      ...defaultConfig.base,
      ...envConfig,
      ...defaultConfig.features
    }
  }
  
  get(path: string, defaultValue?: any) {
    return this.getNestedValue(this.config, path, defaultValue)
  }
  
  set(path: string, value: any) {
    this.setNestedValue(this.config, path, value)
  }
  
  private getNestedValue(obj: any, path: string, defaultValue?: any) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue
    }, obj)
  }
  
  private setNestedValue(obj: any, path: string, value: any) {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }
}

// 使用配置加载器
const configLoader = new ConfigLoader()
const aesKeySize = configLoader.get('aes.keySize', 256)
```

通过这些配置选项，您可以根据项目需求灵活地自定义 @ldesign/crypto 的行为，确保在不同环境和场景下都能获得最佳的性能和安全性。
