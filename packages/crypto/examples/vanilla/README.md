# @ldesign/crypto Vanilla JS 示例

这是一个纯 JavaScript 示例，展示了如何在原生 Web 环境中使用 `@ldesign/crypto` 加密库。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:5173` 启动。

### 构建生产版本

```bash
pnpm build
```

## 📋 功能特性

### 🔐 完整的加密功能

- **对称加密**: AES、DES、3DES、Blowfish
- **非对称加密**: RSA 密钥对生成和加密
- **哈希算法**: MD5、SHA 系列、HMAC
- **编码算法**: Base64、Hex

### 🌐 浏览器兼容性

- **现代浏览器**: Chrome、Firefox、Safari、Edge
- **ES6+ 支持**: 使用现代 JavaScript 特性
- **模块化**: ES6 模块导入/导出

## 🎯 使用示例

### 1. 基本导入和使用

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LDesign Crypto 演示</title>
  </head>
  <body>
    <div id="app">
      <h1>🔐 LDesign Crypto 演示</h1>

      <!-- 加密演示 -->
      <section class="crypto-section">
        <h2>AES 加密演示</h2>
        <div class="form-group">
          <label>明文:</label>
          <input type="text" id="plaintext" value="Hello, World!" />
        </div>
        <div class="form-group">
          <label>密钥:</label>
          <input type="text" id="secretKey" value="my-secret-key" />
        </div>
        <button onclick="encryptData()">加密</button>
        <button onclick="decryptData()">解密</button>

        <div class="result">
          <h3>结果:</h3>
          <pre id="result"></pre>
        </div>
      </section>

      <!-- 哈希演示 -->
      <section class="hash-section">
        <h2>哈希算法演示</h2>
        <div class="form-group">
          <label>输入数据:</label>
          <input type="text" id="hashInput" value="Hello, Hash!" />
        </div>
        <div class="form-group">
          <label>算法:</label>
          <select id="hashAlgorithm">
            <option value="md5">MD5</option>
            <option value="sha1">SHA1</option>
            <option value="sha256" selected>SHA256</option>
            <option value="sha384">SHA384</option>
            <option value="sha512">SHA512</option>
          </select>
        </div>
        <button onclick="calculateHash()">计算哈希</button>

        <div class="result">
          <h3>哈希值:</h3>
          <pre id="hashResult"></pre>
        </div>
      </section>
    </div>

    <script type="module" src="./main.js"></script>
  </body>
</html>
```

### 2. JavaScript 实现

```javascript
// main.js
import { aes, hash, keyGenerator, rsa } from '@ldesign/crypto'

// 全局变量存储加密结果
let encryptedData = ''

// AES 加密函数
window.encryptData = async function () {
  try {
    const plaintext = document.getElementById('plaintext').value
    const secretKey = document.getElementById('secretKey').value

    if (!plaintext || !secretKey) {
      alert('请输入明文和密钥')
      return
    }

    // 使用 AES 加密
    const result = aes.encrypt(plaintext, secretKey, {
      keySize: 256,
      mode: 'CBC',
    })

    if (result.success) {
      encryptedData = result.data
      document.getElementById('result').textContent = `加密成功:\n${result.data}\n\nIV: ${
        result.iv || 'N/A'
      }`
    }
    else {
      document.getElementById('result').textContent = `加密失败: ${result.error}`
    }
  }
  catch (error) {
    document.getElementById('result').textContent = `加密错误: ${error.message}`
  }
}

// AES 解密函数
window.decryptData = async function () {
  try {
    const secretKey = document.getElementById('secretKey').value

    if (!encryptedData || !secretKey) {
      alert('请先加密数据并确保密钥正确')
      return
    }

    // 使用 AES 解密
    const result = aes.decrypt(encryptedData, secretKey, {
      keySize: 256,
      mode: 'CBC',
    })

    if (result.success) {
      document.getElementById('result').textContent = `解密成功:\n${result.data}`
    }
    else {
      document.getElementById('result').textContent = `解密失败: ${result.error}`
    }
  }
  catch (error) {
    document.getElementById('result').textContent = `解密错误: ${error.message}`
  }
}

// 哈希计算函数
window.calculateHash = async function () {
  try {
    const input = document.getElementById('hashInput').value
    const algorithm = document.getElementById('hashAlgorithm').value

    if (!input) {
      alert('请输入要哈希的数据')
      return
    }

    let result

    // 根据选择的算法计算哈希
    switch (algorithm) {
      case 'md5':
        result = hash.md5(input)
        break
      case 'sha1':
        result = hash.sha1(input)
        break
      case 'sha256':
        result = hash.sha256(input)
        break
      case 'sha384':
        result = hash.sha384(input)
        break
      case 'sha512':
        result = hash.sha512(input)
        break
      default:
        result = hash.sha256(input)
    }

    document.getElementById(
      'hashResult'
    ).textContent = `${algorithm.toUpperCase()} 哈希值:\n${result}`
  }
  catch (error) {
    document.getElementById('hashResult').textContent = `哈希计算错误: ${error.message}`
  }
}

// RSA 密钥对生成演示
window.generateRSAKeys = async function () {
  try {
    const keyPair = keyGenerator.generateRSAKeyPair(2048)

    console.log('RSA 密钥对生成成功:')
    console.log('公钥:', keyPair.publicKey)
    console.log('私钥:', keyPair.privateKey)

    // 测试 RSA 加密解密
    const testMessage = 'Hello, RSA!'
    const encrypted = rsa.encrypt(testMessage, keyPair.publicKey)
    const decrypted = rsa.decrypt(encrypted, keyPair.privateKey)

    console.log('RSA 加密测试:')
    console.log('原文:', testMessage)
    console.log('密文:', encrypted)
    console.log('解密:', decrypted)
  }
  catch (error) {
    console.error('RSA 操作错误:', error)
  }
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔐 LDesign Crypto 演示页面已加载')
  console.log('可用功能:')
  console.log('- encryptData(): AES 加密')
  console.log('- decryptData(): AES 解密')
  console.log('- calculateHash(): 哈希计算')
  console.log('- generateRSAKeys(): RSA 密钥对生成')

  // 自动生成 RSA 密钥对演示
  generateRSAKeys()
})
```

## 🏗️ 项目结构

```
vanilla/
├── index.html           # 主页面
├── main.js              # 主要逻辑
├── style.css            # 样式文件
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── README.md            # 说明文档
```

## 🔧 技术栈

- **Vanilla JavaScript**: 纯 JavaScript，无框架依赖
- **ES6 Modules**: 现代模块化开发
- **Vite**: 快速的开发和构建工具
- **@ldesign/crypto**: 加密库

## 📖 API 使用指南

### 加密 API

```javascript
import { aes, des, rsa } from '@ldesign/crypto'

// AES 加密
const aesResult = aes.encrypt('data', 'key', { keySize: 256 })

// DES 加密
const desResult = des.encrypt('data', 'key')

// RSA 加密
const rsaResult = rsa.encrypt('data', publicKey)
```

### 哈希 API

```javascript
import { hash, hmac } from '@ldesign/crypto'

// 基本哈希
const sha256Hash = hash.sha256('data')
const md5Hash = hash.md5('data')

// HMAC
const hmacValue = hmac.sha256('data', 'secret-key')
```

### 编码 API

```javascript
import { base64, hex } from '@ldesign/crypto'

// Base64 编码
const encoded = base64.encode('Hello, World!')
const decoded = base64.decode(encoded)

// Hex 编码
const hexEncoded = hex.encode('Hello, World!')
const hexDecoded = hex.decode(hexEncoded)
```

## 🎨 样式定制

```css
/* style.css */
.crypto-section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.form-group {
  margin: 10px 0;
}

.form-group label {
  display: inline-block;
  width: 100px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 300px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px 20px;
  margin: 5px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
}

.result pre {
  white-space: pre-wrap;
  word-break: break-all;
}
```

## 🔒 安全注意事项

1. **密钥安全**: 不要在客户端硬编码敏感密钥
2. **HTTPS**: 在生产环境中使用 HTTPS
3. **输入验证**: 验证所有用户输入
4. **错误处理**: 不要在错误信息中暴露敏感信息

## 📝 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件
