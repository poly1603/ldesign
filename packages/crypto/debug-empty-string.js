// Debug empty string encryption
const { aes } = require('./dist/index.js')

console.log('Testing empty string encryption...')

const testKey = 'my-secret-key-256-bits-long'

try {
  console.log('\n=== Empty string encryption ===')
  const encrypted = aes.encrypt('', testKey)
  console.log('Encrypted:', JSON.stringify(encrypted, null, 2))
  
  if (encrypted.success) {
    console.log('\n=== Empty string decryption ===')
    const decrypted = aes.decrypt(encrypted.data, testKey, { iv: encrypted.iv })
    console.log('Decrypted:', JSON.stringify(decrypted, null, 2))
    console.log('Data match:', decrypted.data === '')
    console.log('Data length:', decrypted.data.length)
    console.log('Ciphertext length:', encrypted.data.length)
  }
  
} catch (error) {
  console.error('Error:', error)
}
