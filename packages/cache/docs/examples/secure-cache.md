# 安全缓存示例

本文档展示如何使用 @ldesign/cache 的安全功能来保护敏感数据。

## 基础加密缓存

### 用户认证信息缓存

```typescript
import { createCache } from '@ldesign/cache'

// 创建安全缓存实例
const secureCache = createCache({
  engines: ['localStorage', 'memory'],
  strategy: 'security',
  security: {
    encryption: {
      enabled: true,
      algorithm: 'AES-GCM',
      keyDerivation: {
        algorithm: 'PBKDF2',
        iterations: 100000,
        salt: 'user-auth-salt-2024',
      },
    },
    obfuscation: {
      enabled: true,
      algorithm: 'hash',
    },
    integrity: {
      enabled: true,
      algorithm: 'SHA-256',
    },
  },
  debug: false,
})

// 存储用户认证信息
async function storeUserAuth(token: string, refreshToken: string) {
  try {
    await secureCache.set('auth:token', token, {
      ttl: 15 * 60 * 1000, // 15分钟
      encrypt: true,
    })
    
    await secureCache.set('auth:refresh', refreshToken, {
      ttl: 7 * 24 * 60 * 60 * 1000, // 7天
      encrypt: true,
    })
    
    console.log('认证信息已安全存储')
  } catch (error) {
    console.error('存储认证信息失败:', error)
  }
}

// 获取用户认证信息
async function getUserAuth() {
  try {
    const token = await secureCache.get<string>('auth:token')
    const refreshToken = await secureCache.get<string>('auth:refresh')
    
    return { token, refreshToken }
  } catch (error) {
    console.error('获取认证信息失败:', error)
    return { token: null, refreshToken: null }
  }
}

// 清除认证信息
async function clearUserAuth() {
  try {
    await secureCache.remove('auth:token')
    await secureCache.remove('auth:refresh')
    console.log('认证信息已清除')
  } catch (error) {
    console.error('清除认证信息失败:', error)
  }
}
```

## 敏感用户数据缓存

### 个人信息保护

```typescript
interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  idCard: string
}

class SecureUserProfileCache {
  private cache = createCache({
    engines: ['localStorage'],
    security: {
      encryption: {
        enabled: true,
        algorithm: 'AES-GCM',
        keyDerivation: {
          algorithm: 'PBKDF2',
          iterations: 150000,
          salt: 'user-profile-salt-2024',
        },
      },
      obfuscation: {
        enabled: true,
        algorithm: 'custom',
        customObfuscate: (key: string) => {
          // 自定义混淆算法
          return btoa(key.split('').reverse().join(''))
        },
        customDeobfuscate: (key: string) => {
          return atob(key).split('').reverse().join('')
        },
      },
    },
  })

  async storeProfile(userId: string, profile: UserProfile): Promise<void> {
    try {
      // 分别存储不同敏感级别的数据
      await this.cache.set(`profile:basic:${userId}`, {
        id: profile.id,
        name: profile.name,
      }, {
        ttl: 24 * 60 * 60 * 1000, // 24小时
        encrypt: false, // 基础信息不加密
      })

      await this.cache.set(`profile:contact:${userId}`, {
        email: profile.email,
        phone: profile.phone,
      }, {
        ttl: 12 * 60 * 60 * 1000, // 12小时
        encrypt: true, // 联系信息加密
      })

      await this.cache.set(`profile:sensitive:${userId}`, {
        address: profile.address,
        idCard: profile.idCard,
      }, {
        ttl: 6 * 60 * 60 * 1000, // 6小时
        encrypt: true, // 敏感信息加密
      })

      console.log('用户资料已安全存储')
    } catch (error) {
      console.error('存储用户资料失败:', error)
      throw error
    }
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const [basic, contact, sensitive] = await Promise.all([
        this.cache.get(`profile:basic:${userId}`),
        this.cache.get(`profile:contact:${userId}`),
        this.cache.get(`profile:sensitive:${userId}`),
      ])

      if (!basic) return null

      return {
        ...basic,
        ...contact,
        ...sensitive,
      } as UserProfile
    } catch (error) {
      console.error('获取用户资料失败:', error)
      return null
    }
  }

  async clearProfile(userId: string): Promise<void> {
    try {
      await Promise.all([
        this.cache.remove(`profile:basic:${userId}`),
        this.cache.remove(`profile:contact:${userId}`),
        this.cache.remove(`profile:sensitive:${userId}`),
      ])
      console.log('用户资料已清除')
    } catch (error) {
      console.error('清除用户资料失败:', error)
    }
  }
}

// 使用示例
const profileCache = new SecureUserProfileCache()

async function example() {
  const userId = 'user123'
  const profile: UserProfile = {
    id: userId,
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    address: '北京市朝阳区xxx街道',
    idCard: '110101199001011234',
  }

  // 存储
  await profileCache.storeProfile(userId, profile)

  // 获取
  const cachedProfile = await profileCache.getProfile(userId)
  console.log('缓存的用户资料:', cachedProfile)

  // 清除
  await profileCache.clearProfile(userId)
}
```

## 支付信息安全缓存

### 支付令牌管理

```typescript
interface PaymentToken {
  token: string
  expiresAt: number
  cardLast4: string
  cardType: string
}

class SecurePaymentCache {
  private cache = createCache({
    engines: ['sessionStorage'], // 仅会话级存储
    security: {
      encryption: {
        enabled: true,
        algorithm: 'AES-GCM',
        keyDerivation: {
          algorithm: 'PBKDF2',
          iterations: 200000, // 更高的迭代次数
          salt: 'payment-security-salt-2024',
        },
      },
      obfuscation: {
        enabled: true,
        algorithm: 'hash',
      },
      integrity: {
        enabled: true,
        algorithm: 'SHA-512', // 更强的哈希算法
      },
    },
  })

  async storePaymentToken(userId: string, token: PaymentToken): Promise<void> {
    try {
      const key = `payment:token:${userId}`
      
      // 验证令牌有效期
      if (token.expiresAt <= Date.now()) {
        throw new Error('支付令牌已过期')
      }

      await this.cache.set(key, token, {
        ttl: Math.min(token.expiresAt - Date.now(), 30 * 60 * 1000), // 最多30分钟
        encrypt: true,
      })

      console.log('支付令牌已安全存储')
    } catch (error) {
      console.error('存储支付令牌失败:', error)
      throw error
    }
  }

  async getPaymentToken(userId: string): Promise<PaymentToken | null> {
    try {
      const key = `payment:token:${userId}`
      const token = await this.cache.get<PaymentToken>(key)

      if (token && token.expiresAt <= Date.now()) {
        // 令牌已过期，删除
        await this.cache.remove(key)
        return null
      }

      return token
    } catch (error) {
      console.error('获取支付令牌失败:', error)
      return null
    }
  }

  async clearPaymentToken(userId: string): Promise<void> {
    try {
      await this.cache.remove(`payment:token:${userId}`)
      console.log('支付令牌已清除')
    } catch (error) {
      console.error('清除支付令牌失败:', error)
    }
  }

  async clearAllPaymentTokens(): Promise<void> {
    try {
      const keys = await this.cache.keys()
      const paymentKeys = keys.filter(key => key.startsWith('payment:token:'))
      
      await Promise.all(paymentKeys.map(key => this.cache.remove(key)))
      console.log('所有支付令牌已清除')
    } catch (error) {
      console.error('清除所有支付令牌失败:', error)
    }
  }
}
```

## 多级安全策略

### 根据数据敏感度分级存储

```typescript
enum SecurityLevel {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  SECRET = 'secret',
}

class MultiLevelSecureCache {
  private caches: Map<SecurityLevel, any> = new Map()

  constructor() {
    // 公开级别 - 无加密
    this.caches.set(SecurityLevel.PUBLIC, createCache({
      engines: ['localStorage', 'memory'],
      strategy: 'performance',
    }))

    // 内部级别 - 基础混淆
    this.caches.set(SecurityLevel.INTERNAL, createCache({
      engines: ['localStorage', 'memory'],
      security: {
        obfuscation: {
          enabled: true,
          algorithm: 'base64',
        },
      },
    }))

    // 机密级别 - 加密 + 混淆
    this.caches.set(SecurityLevel.CONFIDENTIAL, createCache({
      engines: ['sessionStorage', 'memory'],
      security: {
        encryption: {
          enabled: true,
          algorithm: 'AES-GCM',
          keyDerivation: {
            algorithm: 'PBKDF2',
            iterations: 100000,
            salt: 'confidential-salt-2024',
          },
        },
        obfuscation: {
          enabled: true,
          algorithm: 'hash',
        },
      },
    }))

    // 绝密级别 - 强加密 + 完整性验证
    this.caches.set(SecurityLevel.SECRET, createCache({
      engines: ['memory'], // 仅内存存储
      security: {
        encryption: {
          enabled: true,
          algorithm: 'AES-GCM',
          keyDerivation: {
            algorithm: 'PBKDF2',
            iterations: 200000,
            salt: 'secret-salt-2024',
          },
        },
        obfuscation: {
          enabled: true,
          algorithm: 'hash',
        },
        integrity: {
          enabled: true,
          algorithm: 'SHA-512',
        },
      },
    }))
  }

  async set(
    level: SecurityLevel,
    key: string,
    value: any,
    options?: { ttl?: number }
  ): Promise<void> {
    const cache = this.caches.get(level)
    if (!cache) {
      throw new Error(`不支持的安全级别: ${level}`)
    }

    // 根据安全级别设置不同的TTL
    const ttlMap = {
      [SecurityLevel.PUBLIC]: 24 * 60 * 60 * 1000, // 24小时
      [SecurityLevel.INTERNAL]: 12 * 60 * 60 * 1000, // 12小时
      [SecurityLevel.CONFIDENTIAL]: 6 * 60 * 60 * 1000, // 6小时
      [SecurityLevel.SECRET]: 30 * 60 * 1000, // 30分钟
    }

    await cache.set(key, value, {
      ttl: options?.ttl || ttlMap[level],
      encrypt: level !== SecurityLevel.PUBLIC,
    })
  }

  async get<T>(level: SecurityLevel, key: string): Promise<T | null> {
    const cache = this.caches.get(level)
    if (!cache) {
      throw new Error(`不支持的安全级别: ${level}`)
    }

    return await cache.get<T>(key)
  }

  async remove(level: SecurityLevel, key: string): Promise<void> {
    const cache = this.caches.get(level)
    if (!cache) {
      throw new Error(`不支持的安全级别: ${level}`)
    }

    await cache.remove(key)
  }

  async clearLevel(level: SecurityLevel): Promise<void> {
    const cache = this.caches.get(level)
    if (!cache) {
      throw new Error(`不支持的安全级别: ${level}`)
    }

    await cache.clear()
  }

  async clearAll(): Promise<void> {
    await Promise.all(
      Array.from(this.caches.values()).map(cache => cache.clear())
    )
  }
}

// 使用示例
const secureCache = new MultiLevelSecureCache()

async function securityExample() {
  // 公开数据
  await secureCache.set(SecurityLevel.PUBLIC, 'app:config', {
    theme: 'dark',
    language: 'zh-CN',
  })

  // 内部数据
  await secureCache.set(SecurityLevel.INTERNAL, 'user:preferences', {
    notifications: true,
    autoSave: false,
  })

  // 机密数据
  await secureCache.set(SecurityLevel.CONFIDENTIAL, 'user:profile', {
    email: 'user@example.com',
    phone: '13800138000',
  })

  // 绝密数据
  await secureCache.set(SecurityLevel.SECRET, 'auth:session', {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshToken: 'refresh_token_here',
  })

  // 获取数据
  const config = await secureCache.get(SecurityLevel.PUBLIC, 'app:config')
  const session = await secureCache.get(SecurityLevel.SECRET, 'auth:session')

  console.log('配置:', config)
  console.log('会话:', session)
}
```

## 安全最佳实践

### 1. 密钥管理

```typescript
// 不要硬编码密钥
const BAD_EXAMPLE = createCache({
  security: {
    encryption: {
      keyDerivation: {
        salt: 'hardcoded-salt', // ❌ 不要这样做
      },
    },
  },
})

// 使用环境变量或动态生成
const GOOD_EXAMPLE = createCache({
  security: {
    encryption: {
      keyDerivation: {
        salt: process.env.CACHE_SALT || generateRandomSalt(), // ✅ 推荐做法
      },
    },
  },
})

function generateRandomSalt(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
```

### 2. 数据分类

```typescript
// 根据数据敏感度选择合适的安全级别
const dataClassification = {
  // 公开数据：UI配置、主题设置等
  public: ['ui:theme', 'app:language', 'display:settings'],
  
  // 内部数据：用户偏好、应用状态等
  internal: ['user:preferences', 'app:state', 'ui:layout'],
  
  // 机密数据：个人信息、联系方式等
  confidential: ['user:profile', 'user:contacts', 'user:history'],
  
  // 绝密数据：认证信息、支付数据等
  secret: ['auth:tokens', 'payment:info', 'security:keys'],
}
```

### 3. 定期清理

```typescript
// 定期清理敏感数据
setInterval(async () => {
  try {
    // 清理过期的敏感数据
    await secureCache.clearLevel(SecurityLevel.SECRET)
    console.log('敏感数据已清理')
  } catch (error) {
    console.error('清理敏感数据失败:', error)
  }
}, 30 * 60 * 1000) // 每30分钟清理一次

// 页面卸载时清理
window.addEventListener('beforeunload', async () => {
  await secureCache.clearLevel(SecurityLevel.SECRET)
})
```

这些示例展示了如何使用 @ldesign/cache 的安全功能来保护不同级别的敏感数据，确保数据在客户端的安全存储。
