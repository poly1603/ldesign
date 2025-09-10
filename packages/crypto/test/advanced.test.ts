import { describe, it, expect } from 'vitest'
import { 
  pbkdf2, 
  argon2, 
  scrypt, 
  kdfManager 
} from '../src/algorithms/kdf'
import { 
  streamCipher, 
  fileEncryptor 
} from '../src/core/stream'
import { 
  passwordStrengthChecker,
  PasswordStrength
} from '../src/utils/password-strength'
import { RandomUtils } from '../src/utils'

describe('Advanced Crypto Features', () => {
  describe('Key Derivation Functions (KDF)', () => {
    it('should derive key using PBKDF2', () => {
      const password = 'mySecretPassword'
      const result = pbkdf2.derive(password, { iterations: 1000 })
      
      expect(result).toBeDefined()
      expect(result.key).toBeTruthy()
      expect(result.salt).toBeTruthy()
      expect(result.algorithm).toBe('PBKDF2-SHA256')
      expect(result.parameters.iterations).toBe(1000)
    })

    it('should verify PBKDF2 password', () => {
      const password = 'testPassword'
      const result = pbkdf2.derive(password, { iterations: 1000 })
      
      const isValid = pbkdf2.verify(password, result.key, result.salt, { iterations: 1000 })
      const isInvalid = pbkdf2.verify('wrongPassword', result.key, result.salt, { iterations: 1000 })
      
      expect(isValid).toBe(true)
      expect(isInvalid).toBe(false)
    })

    it('should derive key using Argon2', () => {
      const password = 'mySecretPassword'
      const result = argon2.derive(password, { 
        timeCost: 2,
        memoryCost: 1024,
        parallelism: 1 
      })
      
      expect(result).toBeDefined()
      expect(result.key).toBeTruthy()
      expect(result.salt).toBeTruthy()
      expect(result.algorithm).toBe('Argon2id')
      expect(result.parameters.timeCost).toBe(2)
    })

    it('should derive key using scrypt', () => {
      const password = 'mySecretPassword'
      const result = scrypt.derive(password, { 
        iterations: 1024,
        memoryCost: 8,
        parallelism: 1 
      })
      
      expect(result).toBeDefined()
      expect(result.key).toBeTruthy()
      expect(result.salt).toBeTruthy()
      expect(result.algorithm).toBe('scrypt')
    })

    it('should use KDF manager to derive keys', () => {
      const password = 'testPassword'
      
      const pbkdf2Result = kdfManager.derive(password, 'pbkdf2')
      const argon2Result = kdfManager.derive(password, 'argon2')
      const scryptResult = kdfManager.derive(password, 'scrypt')
      
      expect(pbkdf2Result.algorithm).toBe('PBKDF2-SHA256')
      expect(argon2Result.algorithm).toBe('Argon2id')
      expect(scryptResult.algorithm).toBe('scrypt')
    })

    it('should get recommended parameters', () => {
      const lowParams = pbkdf2.getRecommendedParameters('low')
      const mediumParams = pbkdf2.getRecommendedParameters('medium')
      const highParams = pbkdf2.getRecommendedParameters('high')
      
      expect(lowParams.iterations).toBeLessThan(mediumParams.iterations!)
      expect(mediumParams.iterations).toBeLessThan(highParams.iterations!)
      expect(lowParams.keyLength).toBeLessThan(highParams.keyLength!)
    })
  })

  describe('Stream Cipher', () => {
    it('should encrypt and decrypt large data', async () => {
      const key = 'my-secret-key-32-characters-long'
      const largeData = new Uint8Array(1024 * 100) // 100KB
      for (let i = 0; i < largeData.length; i++) {
        largeData[i] = i % 256
      }
      
      const encrypted = await streamCipher.encryptLargeData(largeData, key)
      expect(encrypted.data).toBeDefined()
      expect(encrypted.metadata.iv).toBeTruthy()
      expect(encrypted.metadata.originalSize).toBe(largeData.length)
      
      const decrypted = await streamCipher.decryptLargeData(
        encrypted.data, 
        key, 
        encrypted.metadata.iv
      )
      
      const decryptedArray = new Uint8Array(decrypted)
      expect(decryptedArray.length).toBeGreaterThan(0)
    })

    it('should handle progress callback', async () => {
      const key = 'my-secret-key-32-characters-long'
      const data = new Uint8Array(1024 * 10) // 10KB
      let progressCalled = false
      let lastProgress = 0
      
      await streamCipher.encryptLargeData(data, key, {
        chunkSize: 1024, // 1KB chunks
        onProgress: (progress) => {
          progressCalled = true
          expect(progress).toBeGreaterThanOrEqual(lastProgress)
          expect(progress).toBeLessThanOrEqual(1)
          lastProgress = progress
        }
      })
      
      expect(progressCalled).toBe(true)
      expect(lastProgress).toBe(1)
    })
  })

  describe('Password Strength Checker', () => {
    it('should analyze weak passwords', () => {
      const analysis = passwordStrengthChecker.analyze('123456')
      
      expect(analysis.strength).toBe(PasswordStrength.VeryWeak)
      expect(analysis.score).toBeLessThan(20)
      expect(analysis.isCommon).toBe(true)
      expect(analysis.issues.length).toBeGreaterThan(0)
      expect(analysis.suggestions.length).toBeGreaterThan(0)
    })

    it('should analyze strong passwords', () => {
      const analysis = passwordStrengthChecker.analyze('MyS3cur3P@ssw0rd!2024')
      
      expect(analysis.strength).toBeGreaterThanOrEqual(PasswordStrength.Good)
      expect(analysis.score).toBeGreaterThan(60)
      expect(analysis.characterTypes.lowercase).toBe(true)
      expect(analysis.characterTypes.uppercase).toBe(true)
      expect(analysis.characterTypes.numbers).toBe(true)
      expect(analysis.characterTypes.symbols).toBe(true)
    })

    it('should detect password patterns', () => {
      const keyboardPattern = passwordStrengthChecker.analyze('qwerty123')
      const sequence = passwordStrengthChecker.analyze('abcdef789')
      const repeats = passwordStrengthChecker.analyze('aaa111bbb')
      
      expect(keyboardPattern.hasKeyboardPattern).toBe(true)
      expect(sequence.hasSequence).toBe(true)
      expect(repeats.hasRepeats).toBe(true)
    })

    it('should calculate entropy correctly', () => {
      const simple = passwordStrengthChecker.analyze('password')
      const complex = passwordStrengthChecker.analyze('P@ssw0rd!123')
      
      expect(complex.entropy).toBeGreaterThan(simple.entropy)
    })

    it('should estimate crack time', () => {
      const weak = passwordStrengthChecker.analyze('123456')
      const strong = passwordStrengthChecker.analyze('MyV3ryL0ngP@ssw0rd!2024#Secure')
      
      expect(weak.crackTime.offline).toMatch(/秒|分钟|立即/)
      expect(strong.crackTime.offline).not.toMatch(/立即/)
    })

    it('should generate strong passwords', () => {
      const password = passwordStrengthChecker.generateStrongPassword({
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true
      })
      
      expect(password.length).toBe(20)
      
      const analysis = passwordStrengthChecker.analyze(password)
      expect(analysis.strength).toBeGreaterThanOrEqual(PasswordStrength.Good)
    })

    it('should generate passphrases', () => {
      const passphrase = passwordStrengthChecker.generatePassphrase({
        wordCount: 5,
        separator: '-',
        capitalize: true,
        includeNumbers: true
      })
      
      expect(passphrase).toMatch(/-/)
      expect(passphrase.split('-').length).toBeGreaterThanOrEqual(5)
    })

    it('should provide strength descriptions and colors', () => {
      const veryWeak = passwordStrengthChecker.getStrengthDescription(PasswordStrength.VeryWeak)
      const veryStrong = passwordStrengthChecker.getStrengthDescription(PasswordStrength.VeryStrong)
      
      expect(veryWeak).toBe('非常弱')
      expect(veryStrong).toBe('非常强')
      
      const weakColor = passwordStrengthChecker.getStrengthColor(PasswordStrength.VeryWeak)
      const strongColor = passwordStrengthChecker.getStrengthColor(PasswordStrength.VeryStrong)
      
      expect(weakColor).toMatch(/#[0-9a-f]{6}/i)
      expect(strongColor).toMatch(/#[0-9a-f]{6}/i)
    })
  })

  describe('Integration Tests', () => {
    it('should work with KDF and encryption together', async () => {
      const password = 'userPassword123!'
      const plaintext = 'Sensitive data to encrypt'
      
      // Derive key from password
      const kdfResult = pbkdf2.derive(password, {
        iterations: 10000,
        keyLength: 32
      })
      
      // Use derived key for encryption
      const key = kdfResult.key.substring(0, 32) // Use first 32 chars as key
      
      // Encrypt data
      const largeData = new TextEncoder().encode(plaintext)
      const encrypted = await streamCipher.encryptLargeData(largeData, key)
      
      // Decrypt data
      const decrypted = await streamCipher.decryptLargeData(
        encrypted.data,
        key,
        encrypted.metadata.iv
      )
      
      const decryptedText = new TextDecoder().decode(decrypted)
      expect(decryptedText).toContain(plaintext)
    })

    it('should validate password strength before KDF', () => {
      const weakPassword = 'weak'
      const strongPassword = 'MyStr0ng!P@ssw0rd#2024'
      
      // Check password strength
      const weakAnalysis = passwordStrengthChecker.analyze(weakPassword)
      const strongAnalysis = passwordStrengthChecker.analyze(strongPassword)
      
      expect(weakAnalysis.strength).toBeLessThan(PasswordStrength.Fair)
      expect(strongAnalysis.strength).toBeGreaterThanOrEqual(PasswordStrength.Good)
      
      // Only use strong password for KDF
      if (strongAnalysis.strength >= PasswordStrength.Good) {
        const kdfResult = argon2.derive(strongPassword, {
          timeCost: 3,
          memoryCost: 4096,
          parallelism: 1
        })
        
        expect(kdfResult.key).toBeTruthy()
      }
    })

    it('should benchmark KDF algorithms', async () => {
      const password = 'benchmarkPassword'
      
      // This test is marked as potentially slow
      const pbkdf2Bench = await kdfManager.benchmark('pbkdf2', password)
      
      expect(pbkdf2Bench).toBeDefined()
      expect(pbkdf2Bench.length).toBe(3) // low, medium, high
      
      // Check that higher security levels take more time
      const lowTime = pbkdf2Bench.find(b => b.algorithm.includes('low'))?.timeMs || 0
      const highTime = pbkdf2Bench.find(b => b.algorithm.includes('high'))?.timeMs || 0
      
      expect(highTime).toBeGreaterThan(lowTime)
    })
  })
})
