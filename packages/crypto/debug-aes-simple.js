// Simple AES debug script using direct imports
import CryptoJS from 'crypto-js'

console.log('Testing AES with CryptoJS directly...')

const testData = 'Hello, AES Encryption!'
const testKey = 'my-secret-key-256-bits-long'

console.log('Input data:', testData)
console.log('Key:', testKey)

// Test direct CryptoJS encryption/decryption
try {
  // Encrypt with CryptoJS
  const encrypted = CryptoJS.AES.encrypt(testData, testKey)
  console.log('CryptoJS encrypted:', encrypted.toString())
  
  // Decrypt with CryptoJS
  const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), testKey)
  const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
  console.log('CryptoJS decrypted:', decryptedString)
  console.log('CryptoJS sigBytes:', decrypted.sigBytes)
  
  console.log('Direct CryptoJS test:', decryptedString === testData ? 'PASS' : 'FAIL')
} catch (error) {
  console.error('CryptoJS error:', error)
}

// Test with key derivation (PBKDF2)
try {
  console.log('\nTesting with PBKDF2 key derivation...')
  
  const salt = CryptoJS.lib.WordArray.random(128/8)
  const key = CryptoJS.PBKDF2(testKey, salt, {
    keySize: 256/32,
    iterations: 1000
  })
  
  const iv = CryptoJS.lib.WordArray.random(128/8)
  
  const encrypted = CryptoJS.AES.encrypt(testData, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  
  console.log('PBKDF2 encrypted:', encrypted.toString())
  
  const decrypted = CryptoJS.AES.decrypt(encrypted.toString(), key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  
  const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
  console.log('PBKDF2 decrypted:', decryptedString)
  console.log('PBKDF2 sigBytes:', decrypted.sigBytes)
  
  console.log('PBKDF2 test:', decryptedString === testData ? 'PASS' : 'FAIL')
} catch (error) {
  console.error('PBKDF2 error:', error)
}
