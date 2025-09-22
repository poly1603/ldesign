const { aes } = require('./dist/index.js')

console.log('Testing AES encryption/decryption...')

const testData = 'Hello, AES Encryption!'
const testKey = 'my-secret-key-256-bits-long'

console.log('Input data:', testData)
console.log('Key:', testKey)

// Test encryption
const encrypted = aes.encrypt(testData, testKey)
console.log('Encryption result:', JSON.stringify(encrypted, null, 2))

if (encrypted.success) {
  // Test decryption
  const decrypted = aes.decrypt(encrypted.data, testKey)
  console.log('Decryption result:', JSON.stringify(decrypted, null, 2))
  
  // Test decryption with full object
  const decrypted2 = aes.decrypt(encrypted, testKey)
  console.log('Decryption with full object:', JSON.stringify(decrypted2, null, 2))
} else {
  console.log('Encryption failed!')
}
