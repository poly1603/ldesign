// Debug AES integration issues
const { aes, base64 } = require('./dist/index.js')

console.log('Testing AES integration issues...')

const testData = 'Hello, Integration!'
const testKey = 'my-secret-key-256-bits-long'

try {
  console.log('\n=== Test 1: Basic AES encryption/decryption ===')
  const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
  console.log('Encrypted:', JSON.stringify(encrypted, null, 2))
  
  if (encrypted.success) {
    const decrypted = aes.decrypt(encrypted.data, testKey, { keySize: 256 })
    console.log('Decrypted:', JSON.stringify(decrypted, null, 2))
    console.log('Match:', decrypted.data === testData)
  }
  
  console.log('\n=== Test 2: AES + Base64 encoding ===')
  const encrypted2 = aes.encrypt(testData, testKey, { keySize: 256 })
  console.log('Encrypted2:', JSON.stringify(encrypted2, null, 2))
  
  if (encrypted2.success) {
    // Base64 encode
    const encoded = base64.encode(encrypted2.data)
    console.log('Encoded:', encoded)
    
    // Base64 decode
    const decoded = base64.decode(encoded)
    console.log('Decoded:', decoded)
    
    // AES decrypt
    const decrypted2 = aes.decrypt(decoded, testKey, { keySize: 256 })
    console.log('Decrypted2:', JSON.stringify(decrypted2, null, 2))
    console.log('Match:', decrypted2.data === testData)
  }
  
} catch (error) {
  console.error('Error:', error)
}
