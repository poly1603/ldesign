# @ldesign/crypto React 示例

这是一个完整的 React 应用示例，展示了如何在 React 项目中使用 `@ldesign/crypto` 加密库的所有核心功能
。

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

### 🔐 对称加密算法

- **AES**: 支持 128/192/256 位密钥，CBC/ECB/CFB/OFB 模式
- **DES**: 经典 DES 加密算法
- **3DES**: 三重 DES 加密，更高安全性
- **Blowfish**: 快速的块加密算法

### 🔑 非对称加密算法

- **RSA**: 支持密钥对生成、公钥加密、私钥解密
- **数字签名**: RSA 数字签名和验证

### 🔍 哈希算法

- **MD5**: 快速哈希（不推荐用于安全场景）
- **SHA-1**: 标准哈希算法
- **SHA-256**: 推荐的安全哈希算法
- **SHA-384/512**: 更高强度的哈希算法
- **HMAC**: 基于哈希的消息认证码

### 📝 编码算法

- **Base64**: 标准 Base64 编码/解码
- **Hex**: 十六进制编码/解码

## 🎯 使用示例

### 基本加密解密

```typescript
import { aes } from '@ldesign/crypto'

// AES 加密
const encrypted = aes.encrypt('Hello, World!', 'my-secret-key', {
  keySize: 256,
  mode: 'CBC',
})

// AES 解密
const decrypted = aes.decrypt(encrypted, 'my-secret-key', {
  keySize: 256,
  mode: 'CBC',
})

console.log(decrypted.data) // "Hello, World!"
```

### RSA 加密

```typescript
import { keyGenerator, rsa } from '@ldesign/crypto'

// 生成 RSA 密钥对
const keyPair = keyGenerator.generateRSAKeyPair(2048)

// 使用公钥加密
const encrypted = rsa.encrypt('Secret message', keyPair.publicKey)

// 使用私钥解密
const decrypted = rsa.decrypt(encrypted, keyPair.privateKey)
```

### 哈希计算

```typescript
import { hash, hmac } from '@ldesign/crypto'

// 计算 SHA-256 哈希
const hashResult = hash.sha256('Hello, World!')

// 计算 HMAC
const hmacResult = hmac.generate('Hello, World!', 'secret-key', 'SHA256')
```

## 🏗️ 项目结构

```
src/
├── App.tsx              # 主应用组件
├── main.tsx             # 应用入口
├── components/          # 可复用组件
│   ├── AlgorithmSelector.tsx
│   ├── CryptoDemo.tsx
│   ├── HashDemo.tsx
│   └── PerformanceStats.tsx
├── hooks/               # 自定义 Hooks
│   ├── useCrypto.ts
│   └── usePerformance.ts
├── utils/               # 工具函数
│   └── clipboard.ts
└── styles/              # 样式文件
    └── App.css
```

## 🔧 技术栈

- **React 18**: 现代 React 框架
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速的构建工具
- **@ldesign/crypto**: 加密库

## 📖 API 文档

### 加密算法选项

#### AES 选项

```typescript
interface AESOptions {
  mode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' // 加密模式
  keySize?: 128 | 192 | 256 // 密钥长度
  iv?: string // 初始化向量
}
```

#### RSA 选项

```typescript
interface RSAOptions {
  keyFormat?: 'pkcs1' | 'pkcs8' // 密钥格式
  keySize?: 1024 | 2048 | 4096 // 密钥长度
  padding?: 'OAEP' | 'PKCS1' // 填充方式
}
```

### 结果类型

```typescript
interface EncryptResult {
  success: boolean
  data: string
  algorithm: string
  iv?: string
  error?: string
}

interface DecryptResult {
  success: boolean
  data: string
  algorithm: string
  error?: string
}
```

## 🎨 界面特性

- **响应式设计**: 适配桌面和移动设备
- **实时预览**: 即时显示加密/解密结果
- **算法切换**: 轻松切换不同的加密算法
- **参数配置**: 可视化配置算法参数
- **性能统计**: 显示操作性能指标
- **错误处理**: 友好的错误提示

## 🔒 安全注意事项

1. **密钥管理**: 在生产环境中，请使用安全的密钥管理系统
2. **随机数生成**: 确保使用加密安全的随机数生成器
3. **算法选择**: 推荐使用 AES-256 和 SHA-256 等现代算法
4. **数据验证**: 始终验证解密后的数据完整性

## 🐛 故障排除

### 常见问题

**Q: 加密失败，提示密钥错误** A: 检查密钥长度是否符合算法要求，AES-256 需要 32 字节密钥

**Q: RSA 加密失败** A: 确保使用正确格式的 PEM 密钥，并检查密钥长度

**Q: 解密结果为空** A: 验证加密和解密使用相同的算法参数和密钥

## 📝 许可证

MIT License - 详见 [LICENSE](../../LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请访问 [GitHub Issues](https://github.com/ldesign/crypto/issues)
