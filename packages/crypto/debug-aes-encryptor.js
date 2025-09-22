// Debug AESEncryptor class issues
import { AESEncryptor } from './src/algorithms/aes.js'

console.log('Testing AESEncryptor class...')

const testData = 'Hello, World!'
const testKey = 'my-secret-key-256-bits-long'

const encryptor = new AESEncryptor()

try {
  // Test basic encryption/decryption
  console.log('\n=== Basic Test ===')
  const encrypted = encryptor.encrypt(testData, testKey)
  console.log('Encrypted:', JSON.stringify(encrypted, null, 2))
  
  if (encrypted.success) {
    const decrypted = encryptor.decrypt(encrypted, testKey)
    console.log('Decrypted:', JSON.stringify(decrypted, null, 2))
    console.log('Match:', decrypted.data === testData)
  }
  
  // Test with specific options
  console.log('\n=== Test with IV ===')
  const options = {
    keySize: 256,
    mode: 'CBC',
    iv: '1234567890abcdef1234567890abcdef' // 32 hex chars = 16 bytes
  }
  
  const encrypted2 = encryptor.encrypt(testData, testKey, options)
  console.log('Encrypted with IV:', JSON.stringify(encrypted2, null, 2))
  
  if (encrypted2.success) {
    const decrypted2 = encryptor.decrypt(encrypted2, testKey, options)
    console.log('Decrypted with IV:', JSON.stringify(decrypted2, null, 2))
    console.log('Match:', decrypted2.data === testData)
  }
  
} catch (error) {
  console.error('Error:', error)
}
