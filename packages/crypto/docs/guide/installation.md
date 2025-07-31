# 安装

## 包管理器安装

推荐使用包管理器安装 @ldesign/crypto：

::: code-group

```bash [pnpm]
pnpm add @ldesign/crypto
```

```bash [npm]
npm install @ldesign/crypto
```

```bash [yarn]
yarn add @ldesign/crypto
```

:::

## CDN 引入

如果你不使用包管理器，也可以通过 CDN 直接引入：

### UMD 格式

```html
<!-- 开发版本 -->
<script src="https://unpkg.com/@ldesign/crypto/dist/index.js"></script>

<!-- 生产版本（压缩） -->
<script src="https://unpkg.com/@ldesign/crypto/dist/index.min.js"></script>
```

使用 UMD 格式时，库会暴露为全局变量 `LDesignCrypto`：

```html
<script>
  const { encrypt, decrypt, hash } = LDesignCrypto
  
  const encrypted = encrypt.aes('Hello World', 'secret-key')
  console.log(encrypted)
</script>
```

### ESM 格式

```html
<script type="module">
  import { encrypt, decrypt, hash } from 'https://unpkg.com/@ldesign/crypto/es/index.js'
  
  const encrypted = encrypt.aes('Hello World', 'secret-key')
  console.log(encrypted)
</script>
```

## Vue 3 项目安装

如果你在 Vue 3 项目中使用，建议同时安装 Vue 3：

```bash
pnpm add vue @ldesign/crypto
```

## 依赖说明

@ldesign/crypto 依赖以下库：

- `crypto-js`: 提供基础的加密算法实现
- `node-forge`: 提供 RSA 加密和数字签名功能
- `tslib`: TypeScript 运行时库

这些依赖会自动安装，无需手动处理。

## 可选依赖

- `vue`: 仅在使用 Vue 3 集成功能时需要

## 环境要求

### 浏览器环境

- 现代浏览器（支持 ES2020）
- 支持 Web Crypto API（用于安全随机数生成）

### Node.js 环境

- Node.js ≥ 16.0.0
- 支持 ESM 和 CommonJS

## 验证安装

安装完成后，可以通过以下代码验证是否安装成功：

### Node.js 环境

```javascript
// ESM
import { encrypt, decrypt, hash } from '@ldesign/crypto'

// CommonJS
const { encrypt, decrypt, hash } = require('@ldesign/crypto')

// 测试基本功能
const encrypted = encrypt.aes('Hello World', 'test-key')
const decrypted = decrypt.aes(encrypted, 'test-key')

console.log('Original:', 'Hello World')
console.log('Encrypted:', encrypted.data)
console.log('Decrypted:', decrypted.data)
console.log('Success:', decrypted.data === 'Hello World')
```

### 浏览器环境

```html
<!DOCTYPE html>
<html>
<head>
    <title>Crypto Test</title>
</head>
<body>
    <script type="module">
        import { encrypt, decrypt, hash } from '@ldesign/crypto'
        
        // 测试基本功能
        const encrypted = encrypt.aes('Hello World', 'test-key')
        const decrypted = decrypt.aes(encrypted, 'test-key')
        
        console.log('Original:', 'Hello World')
        console.log('Encrypted:', encrypted.data)
        console.log('Decrypted:', decrypted.data)
        console.log('Success:', decrypted.data === 'Hello World')
    </script>
</body>
</html>
```

### Vue 3 环境

```vue
<template>
  <div>
    <h1>Crypto Test</h1>
    <p>Original: {{ original }}</p>
    <p>Encrypted: {{ encrypted }}</p>
    <p>Decrypted: {{ decrypted }}</p>
    <p>Success: {{ success }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCrypto } from '@ldesign/crypto/vue'

const { encryptAES, decryptAES } = useCrypto()

const original = ref('Hello World')
const encrypted = ref('')
const decrypted = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    const encryptResult = await encryptAES(original.value, 'test-key')
    encrypted.value = encryptResult.data
    
    const decryptResult = await decryptAES(encryptResult, 'test-key')
    decrypted.value = decryptResult.data
    
    success.value = decryptResult.data === original.value
  } catch (error) {
    console.error('Test failed:', error)
  }
})
</script>
```

## 构建工具配置

### Vite

Vite 开箱即用，无需额外配置。

### Webpack

如果使用 Webpack，可能需要配置 polyfill：

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer")
    }
  }
}
```

### Rollup

```javascript
// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs()
  ]
}
```

## 故障排除

### 常见问题

1. **模块解析错误**
   - 确保使用正确的导入路径
   - 检查构建工具配置

2. **类型错误**
   - 确保安装了 TypeScript 类型定义
   - 检查 tsconfig.json 配置

3. **运行时错误**
   - 检查浏览器兼容性
   - 确保依赖正确安装

### 获取帮助

如果遇到安装问题，可以：

- 查看 [GitHub Issues](https://github.com/ldesign/crypto/issues)
- 提交新的 Issue
- 参与 [GitHub Discussions](https://github.com/ldesign/crypto/discussions)

## 下一步

安装完成后，继续阅读：

- [快速开始](./quick-start) - 学习基本用法
- [加密算法](./encryption) - 了解支持的加密算法
- [Vue 3 集成](./vue-composables) - 在 Vue 项目中使用
