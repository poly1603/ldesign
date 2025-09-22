// Debug integration test issue
import { aes, base64 } from './src/index.js'

console.log('Testing integration issue...')

const testData = 'Hello, Integration!'
const testKey = 'my-secret-key-256-bits-long'

try {
  console.log('\n=== Step 1: AES encryption ===')
  const encrypted = aes.encrypt(testData, testKey, { keySize: 256 })
  console.log('Encrypted:', JSON.stringify(encrypted, null, 2))
  
  if (!encrypted.success) {
    console.error('Encryption failed!')
    process.exit(1)
  }
  
  console.log('\n=== Step 2: Base64 encode ===')
  const encoded = base64.encode(encrypted.data)
  console.log('Encoded:', encoded)
  
  console.log('\n=== Step 3: Base64 decode ===')
  const decoded = base64.decode(encoded)
  console.log('Decoded:', decoded)
  console.log('Decoded === encrypted.data:', decoded === encrypted.data)
  
  console.log('\n=== Step 4: AES decrypt ===')
  const decrypted = aes.decrypt(decoded, testKey, { keySize: 256 })
  console.log('Decrypted:', JSON.stringify(decrypted, null, 2))
  
  if (decrypted.success) {
    console.log('SUCCESS: Decryption worked!')
    console.log('Data match:', decrypted.data === testData)
  } else {
    console.log('FAILED: Decryption failed!')
    console.log('Error:', decrypted.error)
  }
  
} catch (error) {
  console.error('Error:', error)
}
