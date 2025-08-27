# @ldesign/crypto Vue 3 示例

这是一个完整的 Vue 3 应用示例，展示了如何在 Vue 项目中使用 `@ldesign/crypto` 加密库的所有核心功能，
包括 Composition API Hooks 和 Vue 插件的使用。

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

### 预览生产版本

```bash
pnpm preview
```

## 📋 功能特性

### 🔐 Vue 3 深度集成

- **Composition API Hooks**: `useCrypto`、`useHash`、`useSignature`
- **Vue 插件**: 全局注册加密功能
- **响应式状态管理**: 自动追踪加密状态
- **TypeScript 支持**: 完整的类型安全

### 🔑 加密算法支持

- **对称加密**: AES、DES、3DES、Blowfish
- **非对称加密**: RSA 密钥对生成和加密
- **哈希算法**: MD5、SHA 系列、HMAC
- **编码算法**: Base64、Hex

## 🎯 使用示例

### 1. 使用 Vue 插件

```typescript
import { CryptoPlugin } from '@ldesign/crypto/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装加密插件
app.use(CryptoPlugin, {
  defaultAlgorithm: 'AES',
  enableCache: true,
  debug: true,
})

app.mount('#app')
```

```vue
<!-- 在组件中使用全局 API -->
<script setup lang="ts">
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const $crypto = instance?.appContext.config.globalProperties.$crypto

function handleEncrypt() {
  const result = $crypto.aes.encrypt('Hello, Vue!', 'my-secret-key')
  console.log(result)
}
</script>

<template>
  <div>
    <button @click="handleEncrypt">
      加密数据
    </button>
  </div>
</template>
```

### 2. 使用 Composition API Hooks

```vue
<script setup lang="ts">
import { useCrypto } from '@ldesign/crypto/vue'
import { ref } from 'vue'

// 使用加密 Hook
const { encryptAES, decryptAES, isEncrypting, isDecrypting, lastError, clearError } = useCrypto()

// 响应式数据
const plaintext = ref('Hello, Vue 3!')
const secretKey = ref('my-secret-key')
const encryptedData = ref('')
const decryptedData = ref('')

// 加密处理
async function handleEncrypt() {
  try {
    const result = await encryptAES(plaintext.value, secretKey.value, {
      keySize: 256,
      mode: 'CBC',
    })
    encryptedData.value = result
  }
  catch (error) {
    console.error('加密失败:', error)
  }
}

// 解密处理
async function handleDecrypt() {
  try {
    const result = await decryptAES(encryptedData.value, secretKey.value, {
      keySize: 256,
      mode: 'CBC',
    })
    decryptedData.value = result
  }
  catch (error) {
    console.error('解密失败:', error)
  }
}
</script>

<template>
  <div class="crypto-demo">
    <div class="input-section">
      <input v-model="plaintext" placeholder="输入要加密的文本">
      <input v-model="secretKey" placeholder="输入密钥">
      <button :disabled="isEncrypting" @click="handleEncrypt">
        {{ isEncrypting ? '加密中...' : '加密' }}
      </button>
    </div>

    <div v-if="encryptedData" class="result-section">
      <h3>加密结果</h3>
      <p>{{ encryptedData }}</p>
      <button :disabled="isDecrypting" @click="handleDecrypt">
        {{ isDecrypting ? '解密中...' : '解密' }}
      </button>
    </div>

    <div v-if="decryptedData" class="decrypted-section">
      <h3>解密结果</h3>
      <p>{{ decryptedData }}</p>
    </div>

    <div v-if="lastError" class="error-section">
      <p class="error">
        {{ lastError }}
      </p>
      <button @click="clearError">
        清除错误
      </button>
    </div>
  </div>
</template>
```

### 3. 使用哈希 Hook

```vue
<script setup lang="ts">
import { useHash } from '@ldesign/crypto/vue'
import { ref } from 'vue'

// 使用哈希 Hook
const { md5, sha1, sha256, sha384, sha512, isHashing, lastError, clearError } = useHash()

// 响应式数据
const inputData = ref('Hello, Hash!')
const selectedAlgorithm = ref('sha256')
const hashResult = ref('')

// 计算哈希
async function calculateHash() {
  try {
    let result: string

    switch (selectedAlgorithm.value) {
      case 'md5':
        result = await md5(inputData.value)
        break
      case 'sha1':
        result = await sha1(inputData.value)
        break
      case 'sha256':
        result = await sha256(inputData.value)
        break
      case 'sha384':
        result = await sha384(inputData.value)
        break
      case 'sha512':
        result = await sha512(inputData.value)
        break
      default:
        result = await sha256(inputData.value)
    }

    hashResult.value = result
  }
  catch (error) {
    console.error('哈希计算失败:', error)
  }
}

// 复制到剪贴板
async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(hashResult.value)
    alert('已复制到剪贴板')
  }
  catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<template>
  <div class="hash-demo">
    <div class="input-section">
      <textarea v-model="inputData" placeholder="输入要哈希的数据" />
      <select v-model="selectedAlgorithm">
        <option value="md5">
          MD5
        </option>
        <option value="sha1">
          SHA1
        </option>
        <option value="sha256">
          SHA256
        </option>
        <option value="sha384">
          SHA384
        </option>
        <option value="sha512">
          SHA512
        </option>
      </select>
      <button :disabled="isHashing" @click="calculateHash">
        {{ isHashing ? '计算中...' : '计算哈希' }}
      </button>
    </div>

    <div v-if="hashResult" class="result-section">
      <h3>哈希结果 ({{ selectedAlgorithm.toUpperCase() }})</h3>
      <p class="hash-value">
        {{ hashResult }}
      </p>
      <button @click="copyToClipboard">
        复制到剪贴板
      </button>
    </div>
  </div>
</template>
```

## 🏗️ 项目结构

```
src/
├── App.vue              # 主应用组件
├── main.ts              # 应用入口，插件注册
├── components/          # 可复用组件
│   ├── CryptoDemo.vue   # 加密演示组件
│   ├── HashDemo.vue     # 哈希演示组件
│   ├── RSADemo.vue      # RSA 演示组件
│   └── PerformanceStats.vue # 性能统计组件
├── composables/         # 自定义 Composables
│   ├── useCryptoDemo.ts # 加密演示逻辑
│   └── useClipboard.ts  # 剪贴板工具
└── styles/              # 样式文件
    └── main.css
```

## 🔧 技术栈

- **Vue 3**: 现代 Vue 框架，Composition API
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速的构建工具
- **@ldesign/crypto**: 加密库及 Vue 适配器

## 📖 API 文档

### useCrypto Hook

```typescript
const {
  // AES 加密
  encryptAES,
  decryptAES,

  // RSA 加密
  encryptRSA,
  decryptRSA,
  generateRSAKeyPair,

  // 编码
  encodeBase64,
  decodeBase64,
  encodeHex,
  decodeHex,

  // 密钥生成
  generateKey,
  generateSalt,
  generateIV,

  // 状态
  isEncrypting,
  isDecrypting,
  lastError,
  lastResult,

  // 操作
  clearError,
  reset,
} = useCrypto()
```

### useHash Hook

```typescript
const {
  // 哈希算法
  md5,
  sha1,
  sha224,
  sha256,
  sha384,
  sha512,

  // HMAC 算法
  hmacMd5,
  hmacSha1,
  hmacSha256,
  hmacSha384,
  hmacSha512,

  // 验证
  verify,
  verifyHmac,

  // 批量操作
  hashMultiple,

  // 状态
  isHashing,
  lastError,
  lastResult,

  // 操作
  clearError,
  reset,
} = useHash()
```

### useSignature Hook

```typescript
const {
  // 数字签名
  sign,
  verify,
  generateKeyPair,

  // 状态
  isSigning,
  isVerifying,
  lastError,
  lastSignature,

  // 操作
  clearError,
  reset,
} = useSignature()
```

## 🎨 界面特性

- **响应式设计**: 适配桌面和移动设备
- **实时状态**: 显示加密/解密进度
- **错误处理**: 友好的错误提示和恢复
- **性能监控**: 实时显示操作性能
- **主题支持**: 支持明暗主题切换

## 🔒 安全最佳实践

1. **密钥管理**: 使用环境变量存储敏感密钥
2. **状态清理**: 及时清理敏感数据
3. **错误处理**: 不在错误信息中暴露敏感信息
4. **算法选择**: 优先使用现代安全算法

## 🐛 故障排除

### 常见问题

**Q: Hook 返回 undefined** A: 确保在 `setup()` 函数内部调用 Hook

**Q: 插件注册失败** A: 检查插件导入路径是否正确：`@ldesign/crypto/vue`

**Q: TypeScript 类型错误** A: 确保安装了正确的类型定义，重启 TypeScript 服务

## 📝 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件
