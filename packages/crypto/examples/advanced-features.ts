/**
 * 高级功能演示
 * 展示密钥管理系统和安全随机数生成器的使用
 */

import { KeyManager } from '../src/core/key-manager'
import { CSPRNG, random } from '../src/core/csprng'
import { AESEncryptor } from '../src/algorithms/aes'

async function demonstrateKeyManager() {
  console.log('=== 密钥管理系统演示 ===\n')

  // 1. 创建密钥管理器
  const keyManager = new KeyManager({
    type: 'memory',
    encrypted: true,
    kdfAlgorithm: 'pbkdf2',
    autoRotation: false,
  })

  // 2. 初始化主密钥
  console.log('1. 初始化主密钥')
  await keyManager.initializeMasterKey('MySecurePassword123!')
  console.log('主密钥已初始化\n')

  // 3. 生成加密密钥
  console.log('2. 生成加密密钥')
  const encryptionKeyId = await keyManager.generateKey({
    name: 'app-encryption-key',
    algorithm: 'AES',
    purpose: 'encryption',
    keySize: 256,
    tags: ['production', 'api'],
  })
  console.log(`生成加密密钥: ${encryptionKeyId}`)

  // 4. 生成签名密钥
  const signingKeyId = await keyManager.generateKey({
    name: 'app-signing-key',
    algorithm: 'RSA',
    purpose: 'signing',
    keySize: 2048,
    tags: ['production'],
  })
  console.log(`生成签名密钥: ${signingKeyId}\n`)

  // 5. 列出所有密钥
  console.log('3. 列出所有密钥')
  const allKeys = keyManager.listKeys()
  console.log(`密钥总数: ${allKeys.length}`)
  allKeys.forEach(key => {
    console.log(`  - ${key.name} (${key.algorithm}, ${key.purpose})`)
  })
  console.log()

  // 6. 按标签过滤密钥
  console.log('4. 按标签过滤密钥')
  const productionKeys = keyManager.listKeys({ tags: ['production'] })
  console.log(`生产环境密钥: ${productionKeys.length}`)
  productionKeys.forEach(key => {
    console.log(`  - ${key.name}`)
  })
  console.log()

  // 7. 使用密钥加密数据
  console.log('5. 使用密钥加密数据')
  const encryptionKey = await keyManager.getKey(encryptionKeyId, 'encrypt')
  if (encryptionKey) {
    const aes = new AESEncryptor()
    const encrypted = aes.encrypt('Sensitive data', encryptionKey)
    console.log(`加密成功: ${encrypted.success}`)
    console.log(`加密数据长度: ${encrypted.data?.length}`)
  }
  console.log()

  // 8. 密钥轮换
  console.log('6. 密钥轮换')
  const newKeyId = await keyManager.rotateKey(encryptionKeyId)
  console.log(`新密钥 ID: ${newKeyId}`)
  const newKeyInfo = keyManager.listKeys().find(k => k.id === newKeyId)
  console.log(`新密钥版本: ${newKeyInfo?.version}`)
  console.log()

  // 9. 导出密钥
  console.log('7. 导出密钥')
  const exportedRaw = await keyManager.exportKey(newKeyId, 'raw')
  console.log(`原始格式长度: ${exportedRaw.length}`)
  const exportedJWK = await keyManager.exportKey(newKeyId, 'jwk')
  const jwk = JSON.parse(exportedJWK)
  console.log(`JWK 格式: kty=${jwk.kty}, use=${jwk.use}`)
  console.log()

  // 10. 备份和恢复
  console.log('8. 备份和恢复')
  const backup = await keyManager.backup('BackupPassword')
  console.log(`备份大小: ${backup.length} 字符`)
  
  // 创建新管理器并恢复
  const newManager = new KeyManager({ type: 'memory', encrypted: true })
  await newManager.initializeMasterKey('NewPassword')
  const restored = await newManager.restore(backup, 'BackupPassword')
  console.log(`恢复密钥数: ${restored}`)
  console.log()

  // 清理
  keyManager.destroy()
  newManager.destroy()
}

function demonstrateCSPRNG() {
  console.log('=== 安全随机数生成器演示 ===\n')

  // 1. 创建 CSPRNG 实例
  const rng = new CSPRNG({
    entropySource: 'crypto',
    seedLength: 32,
    collectEntropy: true,
    reseedInterval: 1000,
  })

  console.log('1. 生成随机数据')
  
  // 2. 生成随机字节
  const randomBytes = rng.randomBytes(16)
  console.log(`随机字节 (16): ${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`)

  // 3. 生成随机整数
  const randomInt = rng.randomInt(1, 100)
  console.log(`随机整数 (1-100): ${randomInt}`)

  // 4. 生成随机浮点数
  const randomFloat = rng.randomFloat(0, 1)
  console.log(`随机浮点数 (0-1): ${randomFloat.toFixed(6)}`)
  console.log()

  console.log('2. 生成随机字符串')
  
  // 5. 生成随机字符串
  const randomString = rng.randomString(10)
  console.log(`随机字符串: ${randomString}`)

  // 6. 生成随机十六进制
  const randomHex = rng.randomHex(32)
  console.log(`随机十六进制: ${randomHex}`)

  // 7. 生成随机 Base64
  const randomBase64 = rng.randomBase64(24)
  console.log(`随机 Base64: ${randomBase64}`)
  console.log()

  console.log('3. 生成标识符')
  
  // 8. 生成 UUID
  const uuid = rng.randomUUID()
  console.log(`UUID v4: ${uuid}`)

  // 9. 生成安全令牌
  const token = rng.randomToken(32)
  console.log(`安全令牌: ${token}`)
  console.log()

  console.log('4. 数组操作')
  
  // 10. 随机洗牌
  const array = [1, 2, 3, 4, 5]
  const shuffled = rng.shuffle(array)
  console.log(`原数组: [${array.join(', ')}]`)
  console.log(`洗牌后: [${shuffled.join(', ')}]`)

  // 11. 随机选择
  const fruits = ['apple', 'banana', 'orange', 'grape', 'mango']
  const choice = rng.choice(fruits)
  console.log(`随机选择: ${choice}`)

  // 12. 随机采样
  const sample = rng.sample(fruits, 3)
  console.log(`随机采样 (3): [${sample.join(', ')}]`)
  console.log()

  console.log('5. 熵管理')
  
  // 13. 添加额外熵
  rng.addEntropy('user-input-data')
  rng.addEntropy(new Uint8Array([1, 2, 3, 4, 5]))
  
  // 14. 检查熵质量
  const quality = rng.getEntropyQuality()
  console.log(`熵池质量: ${quality.toFixed(1)}%`)

  // 15. 重新播种
  rng.reseed(new Uint8Array(32).fill(42))
  console.log('已重新播种')
  console.log()

  // 清理
  rng.destroy()
}

function demonstrateGlobalRandom() {
  console.log('=== 全局随机函数演示 ===\n')

  console.log('使用便捷函数:')
  
  // 使用全局随机函数
  console.log(`随机字节: ${random.bytes(8).length} bytes`)
  console.log(`随机整数: ${random.int(1, 10)}`)
  console.log(`随机浮点: ${random.float(0, 1).toFixed(4)}`)
  console.log(`随机字符串: ${random.string(8)}`)
  console.log(`随机十六进制: ${random.hex(16)}`)
  console.log(`随机 Base64: ${random.base64(16)}`)
  console.log(`随机 UUID: ${random.uuid()}`)
  console.log(`随机令牌: ${random.token(24)}`)
  
  const numbers = [1, 2, 3, 4, 5]
  console.log(`洗牌: [${random.shuffle(numbers).join(', ')}]`)
  console.log(`选择: ${random.choice(numbers)}`)
  console.log(`采样: [${random.sample(numbers, 2).join(', ')}]`)
  console.log()
}

async function demonstrateIntegration() {
  console.log('=== 集成使用演示 ===\n')

  // 1. 创建密钥管理器
  const keyManager = new KeyManager({
    type: 'memory',
    encrypted: true,
    kdfAlgorithm: 'argon2',
  })

  await keyManager.initializeMasterKey('MasterPassword')

  // 2. 使用 CSPRNG 生成密钥材料
  console.log('1. 使用 CSPRNG 生成密钥材料')
  const keyMaterial = random.hex(64) // 256 位密钥
  
  // 3. 导入密钥到管理器
  const keyId = await keyManager.importKey(keyMaterial, 'raw', {
    name: 'random-generated-key',
    algorithm: 'AES',
    purpose: 'encryption',
    tags: ['auto-generated'],
    permissions: [
      { operation: 'encrypt', allowed: true },
      { operation: 'decrypt', allowed: true },
    ],
  })
  console.log(`导入密钥: ${keyId}`)
  console.log()

  // 4. 生成随机 IV
  console.log('2. 生成随机 IV 和加密')
  const iv = random.hex(32) // 128 位 IV
  const key = await keyManager.getKey(keyId)
  
  if (key) {
    const aes = new AESEncryptor()
    const plaintext = 'Secret message'
    const encrypted = aes.encrypt(plaintext, key, {
      keySize: 256,
      iv: iv,
      mode: 'CBC',
    })
    
    console.log(`加密成功: ${encrypted.success}`)
    console.log(`使用随机 IV: ${iv.substring(0, 16)}...`)
    
    // 解密验证
    const decrypted = aes.decrypt(encrypted.data!, key, {
      keySize: 256,
      iv: iv,
      mode: 'CBC',
    })
    console.log(`解密成功: ${decrypted.success}`)
    console.log(`解密结果: ${decrypted.data}`)
  }
  console.log()

  // 5. 生成会话密钥
  console.log('3. 生成会话密钥')
  const sessionKey = random.token(32)
  const sessionKeyId = await keyManager.importKey(sessionKey, 'raw', {
    name: 'session-key',
    algorithm: 'AES',
    purpose: 'encryption',
    expires: new Date(Date.now() + 3600000), // 1小时后过期
    tags: ['session', 'temporary'],
    permissions: [
      {
        operation: 'encrypt',
        allowed: true,
        conditions: {
          timeWindow: {
            start: new Date(),
            end: new Date(Date.now() + 3600000),
          },
        },
      },
    ],
  })
  console.log(`会话密钥: ${sessionKeyId}`)
  console.log(`密钥将在1小时后过期`)
  console.log()

  // 清理
  keyManager.destroy()
}

async function main() {
  console.log('===================================')
  console.log('    高级加密功能演示')
  console.log('===================================\n')

  try {
    // 密钥管理系统演示
    await demonstrateKeyManager()
    
    // CSPRNG 演示
    demonstrateCSPRNG()
    
    // 全局随机函数演示
    demonstrateGlobalRandom()
    
    // 集成使用演示
    await demonstrateIntegration()
    
    console.log('===================================')
    console.log('    演示完成')
    console.log('===================================')
  } catch (error) {
    console.error('演示出错:', error)
  }
}

// 运行演示
main().catch(console.error)
