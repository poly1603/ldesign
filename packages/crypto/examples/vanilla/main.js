import {
  base64,
  decrypt,
  digitalSignature,
  encrypt,
  hash,
  hmac,
  keyGenerator,
  rsa,
} from '@ldesign/crypto'

// 全局状态
let currentRSAKeyPair = null
let currentHMACValue = null

// 工具函数
function showElement(id) {
  document.getElementById(id).style.display = 'block'
}

function hideElement(id) {
  document.getElementById(id).style.display = 'none'
}

function showError(containerId, message) {
  const errorElement = document.getElementById(containerId)
  errorElement.textContent = message
  showElement(containerId)
}

function hideError(containerId) {
  hideElement(containerId)
}

function setLoading(buttonId, loading) {
  const button = document.getElementById(buttonId)
  button.disabled = loading
  if (loading) {
    button.dataset.originalText = button.textContent
    button.textContent = '处理中...'
  }
  else {
    button.textContent = button.dataset.originalText || button.textContent
  }
}

// AES 加密功能
function initAESHandlers() {
  const encryptBtn = document.getElementById('aes-encrypt-btn')
  const decryptBtn = document.getElementById('aes-decrypt-btn')
  const generateKeyBtn = document.getElementById('aes-generate-key-btn')

  encryptBtn.addEventListener('click', async () => {
    try {
      setLoading('aes-encrypt-btn', true)
      hideError('aes-error')
      hideElement('aes-decrypted-result')

      const data = document.getElementById('aes-data').value
      const key = document.getElementById('aes-key').value
      const keySize = Number.parseInt(
        document.getElementById('aes-key-size').value,
      )
      const mode = document.getElementById('aes-mode').value

      if (!data.trim()) {
        throw new Error('请输入要加密的数据')
      }
      if (!key.trim()) {
        throw new Error('请输入密钥')
      }

      const options = { keySize, mode }
      const result = encrypt.aes(data, key, options)

      document.getElementById('aes-encrypted-data').textContent = result.data
      document.getElementById('aes-algorithm').textContent = result.algorithm
      document.getElementById('aes-iv').textContent = result.iv
      showElement('aes-encrypted-result')
    }
    catch (error) {
      showError('aes-error', error.message)
    }
    finally {
      setLoading('aes-encrypt-btn', false)
    }
  })

  decryptBtn.addEventListener('click', async () => {
    try {
      setLoading('aes-decrypt-btn', true)
      hideError('aes-error')

      const encryptedData
        = document.getElementById('aes-encrypted-data').textContent
      const key = document.getElementById('aes-key').value
      const keySize = Number.parseInt(
        document.getElementById('aes-key-size').value,
      )
      const mode = document.getElementById('aes-mode').value
      const iv = document.getElementById('aes-iv').textContent

      if (!encryptedData) {
        throw new Error('请先进行加密操作')
      }
      if (!key.trim()) {
        throw new Error('请输入密钥')
      }

      const options = { keySize, mode, iv }
      const result = decrypt.aes(encryptedData, key, options)

      if (!result.success) {
        throw new Error(result.error || '解密失败')
      }

      document.getElementById('aes-decrypted-data').textContent = result.data
      showElement('aes-decrypted-result')
    }
    catch (error) {
      showError('aes-error', error.message)
    }
    finally {
      setLoading('aes-decrypt-btn', false)
    }
  })

  generateKeyBtn.addEventListener('click', async () => {
    try {
      setLoading('aes-generate-key-btn', true)

      const keySize = Number.parseInt(
        document.getElementById('aes-key-size').value,
      )
      const keyLength = keySize / 8 // 转换为字节
      const generatedKey = keyGenerator.generateKey(keyLength)

      document.getElementById('aes-key').value = generatedKey
    }
    catch (error) {
      showError('aes-error', error.message)
    }
    finally {
      setLoading('aes-generate-key-btn', false)
    }
  })
}

// RSA 加密功能
function initRSAHandlers() {
  const generateKeypairBtn = document.getElementById('rsa-generate-keypair-btn')
  const encryptBtn = document.getElementById('rsa-encrypt-btn')
  const decryptBtn = document.getElementById('rsa-decrypt-btn')
  const signBtn = document.getElementById('rsa-sign-btn')
  const verifyBtn = document.getElementById('rsa-verify-btn')

  generateKeypairBtn.addEventListener('click', async () => {
    try {
      setLoading('rsa-generate-keypair-btn', true)
      hideError('rsa-error')

      const keySize = Number.parseInt(
        document.getElementById('rsa-key-size').value,
      )
      currentRSAKeyPair = rsa.generateKeyPair(keySize)

      document.getElementById('rsa-public-key').value
        = currentRSAKeyPair.publicKey
      document.getElementById('rsa-private-key').value
        = currentRSAKeyPair.privateKey
      showElement('rsa-keypair-result')

      // 启用其他按钮
      encryptBtn.disabled = false
      decryptBtn.disabled = false
      signBtn.disabled = false
      verifyBtn.disabled = false
    }
    catch (error) {
      showError('rsa-error', error.message)
    }
    finally {
      setLoading('rsa-generate-keypair-btn', false)
    }
  })

  encryptBtn.addEventListener('click', async () => {
    try {
      setLoading('rsa-encrypt-btn', true)
      hideError('rsa-error')
      hideElement('rsa-decrypted-result')

      const data = document.getElementById('rsa-data').value
      if (!data.trim()) {
        throw new Error('请输入要加密的数据')
      }
      if (!currentRSAKeyPair) {
        throw new Error('请先生成RSA密钥对')
      }

      const result = encrypt.rsa(data, currentRSAKeyPair.publicKey)
      document.getElementById('rsa-encrypted-data').textContent = result.data
      showElement('rsa-encrypted-result')
    }
    catch (error) {
      showError('rsa-error', error.message)
    }
    finally {
      setLoading('rsa-encrypt-btn', false)
    }
  })

  decryptBtn.addEventListener('click', async () => {
    try {
      setLoading('rsa-decrypt-btn', true)
      hideError('rsa-error')

      const encryptedData
        = document.getElementById('rsa-encrypted-data').textContent
      if (!encryptedData) {
        throw new Error('请先进行RSA加密操作')
      }
      if (!currentRSAKeyPair) {
        throw new Error('请先生成RSA密钥对')
      }

      const result = decrypt.rsa(encryptedData, currentRSAKeyPair.privateKey)
      if (!result.success) {
        throw new Error(result.error || 'RSA解密失败')
      }

      document.getElementById('rsa-decrypted-data').textContent = result.data
      showElement('rsa-decrypted-result')
    }
    catch (error) {
      showError('rsa-error', error.message)
    }
    finally {
      setLoading('rsa-decrypt-btn', false)
    }
  })

  signBtn.addEventListener('click', async () => {
    try {
      setLoading('rsa-sign-btn', true)
      hideError('rsa-error')

      const data = document.getElementById('rsa-data').value
      if (!data.trim()) {
        throw new Error('请输入要签名的数据')
      }
      if (!currentRSAKeyPair) {
        throw new Error('请先生成RSA密钥对')
      }

      const signature = digitalSignature.sign(
        data,
        currentRSAKeyPair.privateKey,
      )
      document.getElementById('rsa-signature-data').textContent = signature
      showElement('rsa-signature-result')
    }
    catch (error) {
      showError('rsa-error', error.message)
    }
    finally {
      setLoading('rsa-sign-btn', false)
    }
  })

  verifyBtn.addEventListener('click', async () => {
    try {
      setLoading('rsa-verify-btn', true)
      hideError('rsa-error')

      const data = document.getElementById('rsa-data').value
      const signature
        = document.getElementById('rsa-signature-data').textContent

      if (!data.trim()) {
        throw new Error('请输入要验证的数据')
      }
      if (!signature) {
        throw new Error('请先进行数字签名操作')
      }
      if (!currentRSAKeyPair) {
        throw new Error('请先生成RSA密钥对')
      }

      const isValid = digitalSignature.verify(
        data,
        signature,
        currentRSAKeyPair.publicKey,
      )
      document.getElementById('rsa-verify-data').textContent = isValid
        ? '✅ 签名验证成功'
        : '❌ 签名验证失败'
      showElement('rsa-verify-result')
    }
    catch (error) {
      showError('rsa-error', error.message)
    }
    finally {
      setLoading('rsa-verify-btn', false)
    }
  })
}

// 哈希算法功能
function initHashHandlers() {
  const hashBtn = document.getElementById('hash-btn')
  const hashAllBtn = document.getElementById('hash-all-btn')

  hashBtn.addEventListener('click', async () => {
    try {
      setLoading('hash-btn', true)
      hideError('hash-error')
      hideElement('hash-all-result')

      const data = document.getElementById('hash-data').value
      const algorithm = document.getElementById('hash-algorithm').value
      const encoding = document.getElementById('hash-encoding').value

      if (!data.trim()) {
        throw new Error('请输入要哈希的数据')
      }

      const options = { encoding }
      let result

      switch (algorithm) {
        case 'MD5':
          result = hash.md5(data, options)
          break
        case 'SHA1':
          result = hash.sha1(data, options)
          break
        case 'SHA224':
          result = hash.sha224(data, options)
          break
        case 'SHA256':
          result = hash.sha256(data, options)
          break
        case 'SHA384':
          result = hash.sha384(data, options)
          break
        case 'SHA512':
          result = hash.sha512(data, options)
          break
        default:
          throw new Error('不支持的哈希算法')
      }

      document.getElementById('hash-value').textContent = result
      document.getElementById('hash-algorithm-used').textContent = algorithm
      document.getElementById('hash-encoding-used').textContent = encoding
      showElement('hash-result')
    }
    catch (error) {
      showError('hash-error', error.message)
    }
    finally {
      setLoading('hash-btn', false)
    }
  })

  hashAllBtn.addEventListener('click', async () => {
    try {
      setLoading('hash-all-btn', true)
      hideError('hash-error')
      hideElement('hash-result')

      const data = document.getElementById('hash-data').value
      const encoding = document.getElementById('hash-encoding').value

      if (!data.trim()) {
        throw new Error('请输入要哈希的数据')
      }

      const options = { encoding }
      const algorithms = ['MD5', 'SHA1', 'SHA224', 'SHA256', 'SHA384', 'SHA512']
      const results = []

      for (const algorithm of algorithms) {
        let result
        switch (algorithm) {
          case 'MD5':
            result = hash.md5(data, options)
            break
          case 'SHA1':
            result = hash.sha1(data, options)
            break
          case 'SHA224':
            result = hash.sha224(data, options)
            break
          case 'SHA256':
            result = hash.sha256(data, options)
            break
          case 'SHA384':
            result = hash.sha384(data, options)
            break
          case 'SHA512':
            result = hash.sha512(data, options)
            break
        }
        results.push(`<div><strong>${algorithm}:</strong> ${result}</div>`)
      }

      document.getElementById('hash-all-values').innerHTML = results.join('')
      showElement('hash-all-result')
    }
    catch (error) {
      showError('hash-error', error.message)
    }
    finally {
      setLoading('hash-all-btn', false)
    }
  })
}

// HMAC 功能
function initHMACHandlers() {
  const hmacBtn = document.getElementById('hmac-btn')
  const hmacVerifyBtn = document.getElementById('hmac-verify-btn')
  const hmacGenerateKeyBtn = document.getElementById('hmac-generate-key-btn')

  hmacBtn.addEventListener('click', async () => {
    try {
      setLoading('hmac-btn', true)
      hideError('hmac-error')
      hideElement('hmac-verify-result')

      const data = document.getElementById('hmac-data').value
      const key = document.getElementById('hmac-key').value
      const algorithm = document.getElementById('hmac-algorithm').value

      if (!data.trim()) {
        throw new Error('请输入消息')
      }
      if (!key.trim()) {
        throw new Error('请输入HMAC密钥')
      }

      let result
      switch (algorithm) {
        case 'MD5':
          result = hmac.md5(data, key)
          break
        case 'SHA1':
          result = hmac.sha1(data, key)
          break
        case 'SHA256':
          result = hmac.sha256(data, key)
          break
        case 'SHA384':
          result = hmac.sha384(data, key)
          break
        case 'SHA512':
          result = hmac.sha512(data, key)
          break
        default:
          throw new Error('不支持的HMAC算法')
      }

      currentHMACValue = result
      document.getElementById('hmac-value').textContent = result
      document.getElementById(
        'hmac-algorithm-used',
      ).textContent = `HMAC-${algorithm}`
      showElement('hmac-result')
    }
    catch (error) {
      showError('hmac-error', error.message)
    }
    finally {
      setLoading('hmac-btn', false)
    }
  })

  hmacVerifyBtn.addEventListener('click', async () => {
    try {
      setLoading('hmac-verify-btn', true)
      hideError('hmac-error')

      const data = document.getElementById('hmac-data').value
      const key = document.getElementById('hmac-key').value
      const algorithm = document.getElementById('hmac-algorithm').value

      if (!data.trim()) {
        throw new Error('请输入消息')
      }
      if (!key.trim()) {
        throw new Error('请输入HMAC密钥')
      }
      if (!currentHMACValue) {
        throw new Error('请先计算HMAC值')
      }

      let isValid
      switch (algorithm) {
        case 'MD5':
          isValid = hmac.verify(data, key, currentHMACValue, 'MD5')
          break
        case 'SHA1':
          isValid = hmac.verify(data, key, currentHMACValue, 'SHA1')
          break
        case 'SHA256':
          isValid = hmac.verify(data, key, currentHMACValue, 'SHA256')
          break
        case 'SHA384':
          isValid = hmac.verify(data, key, currentHMACValue, 'SHA384')
          break
        case 'SHA512':
          isValid = hmac.verify(data, key, currentHMACValue, 'SHA512')
          break
        default:
          throw new Error('不支持的HMAC算法')
      }

      document.getElementById('hmac-verify-value').textContent = isValid
        ? '✅ HMAC验证成功'
        : '❌ HMAC验证失败'
      showElement('hmac-verify-result')
    }
    catch (error) {
      showError('hmac-error', error.message)
    }
    finally {
      setLoading('hmac-verify-btn', false)
    }
  })

  hmacGenerateKeyBtn.addEventListener('click', async () => {
    try {
      setLoading('hmac-generate-key-btn', true)

      const generatedKey = keyGenerator.generateKey(32)
      document.getElementById('hmac-key').value = generatedKey
    }
    catch (error) {
      showError('hmac-error', error.message)
    }
    finally {
      setLoading('hmac-generate-key-btn', false)
    }
  })
}

// Base64 编码功能
function initBase64Handlers() {
  const encodeBtn = document.getElementById('base64-encode-btn')
  const decodeBtn = document.getElementById('base64-decode-btn')
  const urlEncodeBtn = document.getElementById('base64-url-encode-btn')
  const urlDecodeBtn = document.getElementById('base64-url-decode-btn')

  encodeBtn.addEventListener('click', async () => {
    try {
      setLoading('base64-encode-btn', true)
      hideError('base64-error')
      hideElement('base64-decoded-result')

      const data = document.getElementById('base64-data').value
      if (!data.trim()) {
        throw new Error('请输入要编码的数据')
      }

      const result = base64.encode(data)
      document.getElementById('base64-encoded-data').textContent = result
      showElement('base64-encoded-result')
    }
    catch (error) {
      showError('base64-error', error.message)
    }
    finally {
      setLoading('base64-encode-btn', false)
    }
  })

  decodeBtn.addEventListener('click', async () => {
    try {
      setLoading('base64-decode-btn', true)
      hideError('base64-error')

      const encodedData = document.getElementById(
        'base64-encoded-data',
      ).textContent
      if (!encodedData) {
        throw new Error('请先进行Base64编码操作')
      }

      const result = base64.decode(encodedData)
      document.getElementById('base64-decoded-data').textContent = result
      showElement('base64-decoded-result')
    }
    catch (error) {
      showError('base64-error', error.message)
    }
    finally {
      setLoading('base64-decode-btn', false)
    }
  })

  urlEncodeBtn.addEventListener('click', async () => {
    try {
      setLoading('base64-url-encode-btn', true)
      hideError('base64-error')
      hideElement('base64-decoded-result')

      const data = document.getElementById('base64-data').value
      if (!data.trim()) {
        throw new Error('请输入要编码的数据')
      }

      const result = base64.encodeUrl(data)
      document.getElementById('base64-encoded-data').textContent = result
      showElement('base64-encoded-result')
    }
    catch (error) {
      showError('base64-error', error.message)
    }
    finally {
      setLoading('base64-url-encode-btn', false)
    }
  })

  urlDecodeBtn.addEventListener('click', async () => {
    try {
      setLoading('base64-url-decode-btn', true)
      hideError('base64-error')

      const encodedData = document.getElementById(
        'base64-encoded-data',
      ).textContent
      if (!encodedData) {
        throw new Error('请先进行Base64编码操作')
      }

      const result = base64.decodeUrl(encodedData)
      document.getElementById('base64-decoded-data').textContent = result
      showElement('base64-decoded-result')
    }
    catch (error) {
      showError('base64-error', error.message)
    }
    finally {
      setLoading('base64-url-decode-btn', false)
    }
  })
}

// 密钥生成功能
function initKeyGenerationHandlers() {
  const generateKeyBtn = document.getElementById('generate-key-btn')
  const generateSaltBtn = document.getElementById('generate-salt-btn')
  const generateIVBtn = document.getElementById('generate-iv-btn')
  const generateAllBtn = document.getElementById('generate-all-btn')

  generateKeyBtn.addEventListener('click', async () => {
    try {
      setLoading('generate-key-btn', true)
      hideError('key-gen-error')

      const length = Number.parseInt(
        document.getElementById('key-length').value,
      )
      if (length < 1 || length > 128) {
        throw new Error('密钥长度必须在1-128字节之间')
      }

      const key = keyGenerator.generateKey(length)
      document.getElementById('key-value').textContent = key
      showElement('generated-key')
    }
    catch (error) {
      showError('key-gen-error', error.message)
    }
    finally {
      setLoading('generate-key-btn', false)
    }
  })

  generateSaltBtn.addEventListener('click', async () => {
    try {
      setLoading('generate-salt-btn', true)
      hideError('key-gen-error')

      const length = Number.parseInt(
        document.getElementById('salt-length').value,
      )
      if (length < 1 || length > 64) {
        throw new Error('盐值长度必须在1-64字节之间')
      }

      const salt = keyGenerator.generateSalt(length)
      document.getElementById('salt-value').textContent = salt
      showElement('generated-salt')
    }
    catch (error) {
      showError('key-gen-error', error.message)
    }
    finally {
      setLoading('generate-salt-btn', false)
    }
  })

  generateIVBtn.addEventListener('click', async () => {
    try {
      setLoading('generate-iv-btn', true)
      hideError('key-gen-error')

      const length = Number.parseInt(document.getElementById('iv-length').value)
      if (length < 1 || length > 32) {
        throw new Error('IV长度必须在1-32字节之间')
      }

      const iv = keyGenerator.generateIV(length)
      document.getElementById('iv-value').textContent = iv
      showElement('generated-iv')
    }
    catch (error) {
      showError('key-gen-error', error.message)
    }
    finally {
      setLoading('generate-iv-btn', false)
    }
  })

  generateAllBtn.addEventListener('click', async () => {
    try {
      setLoading('generate-all-btn', true)
      hideError('key-gen-error')

      const keyLength = Number.parseInt(
        document.getElementById('key-length').value,
      )
      const saltLength = Number.parseInt(
        document.getElementById('salt-length').value,
      )
      const ivLength = Number.parseInt(
        document.getElementById('iv-length').value,
      )

      if (keyLength < 1 || keyLength > 128) {
        throw new Error('密钥长度必须在1-128字节之间')
      }
      if (saltLength < 1 || saltLength > 64) {
        throw new Error('盐值长度必须在1-64字节之间')
      }
      if (ivLength < 1 || ivLength > 32) {
        throw new Error('IV长度必须在1-32字节之间')
      }

      const key = keyGenerator.generateKey(keyLength)
      const salt = keyGenerator.generateSalt(saltLength)
      const iv = keyGenerator.generateIV(ivLength)

      document.getElementById('key-value').textContent = key
      document.getElementById('salt-value').textContent = salt
      document.getElementById('iv-value').textContent = iv

      showElement('generated-key')
      showElement('generated-salt')
      showElement('generated-iv')
    }
    catch (error) {
      showError('key-gen-error', error.message)
    }
    finally {
      setLoading('generate-all-btn', false)
    }
  })
}

// 初始化所有处理函数
function init() {
  initAESHandlers()
  initRSAHandlers()
  initHashHandlers()
  initHMACHandlers()
  initBase64Handlers()
  initKeyGenerationHandlers()

  console.log('@ldesign/crypto 示例已加载完成')
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init)
