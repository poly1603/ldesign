# 安装

## 系统要求

- Node.js >= 16.0.0
- 支持 ES 模块的现代浏览器
- TypeScript >= 4.5.0（如果使用 TypeScript）

## 包管理器安装

使用你喜欢的包管理器安装 @ldesign/crypto：

:::: code-group
```bash [pnpm]
pnpm add @ldesign/crypto
```

```bash [npm]
npm install @ldesign/crypto
```

```bash [yarn]
yarn add @ldesign/crypto
```
::::

## Vue 3 项目

如果你在 Vue 3 项目中使用，Vue 已经是 peer dependency，确保安装了 Vue 3：

```bash
pnpm add vue@^3.3.0 @ldesign/crypto
```

## CDN 引入

你也可以通过 CDN 直接在浏览器中使用：

```html
<!-- 使用 unpkg -->
<script src="https://unpkg.com/@ldesign/crypto@latest/dist/index.min.js"></script>

<!-- 使用 jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@ldesign/crypto@latest/dist/index.min.js"></script>
```

通过 CDN 引入后，库会挂载到全局变量 `LDesignCrypto` 上：

```html
<script>
 // 使用全局变量
 const encrypted = LDesignCrypto.aes.encrypt('Hello', 'key')
 console.log(encrypted)
</script>
```

## 验证安装

创建一个简单的测试文件来验证安装：

```typescript
import { aes } from '@ldesign/crypto'

const encrypted = aes.encrypt('Hello World', 'secret-key')
console.log('加密成功:', encrypted.success)
console.log('加密数据:', encrypted.data)

const decrypted = aes.decrypt(encrypted, 'secret-key')
console.log('解密成功:', decrypted.success)
console.log('原始数据:', decrypted.data)
```

如果能正常运行并输出结果，说明安装成功！

## TypeScript 配置

如果你使用 TypeScript，建议在 `tsconfig.json` 中配置以下选项：

```json
{
 "compilerOptions": {
  "module": "ESNext",
  "moduleResolution": "bundler",
  "resolveJsonModule": true,
  "types": ["node"]
 }
}
```

## 导入方式

### 命名导入（推荐）

```typescript
import { aes, rsa, hash, encoding } from '@ldesign/crypto'
```

### 命名空间导入

```typescript
import * as crypto from '@ldesign/crypto'

crypto.aes.encrypt('data', 'key')
```

### 默认导入

```typescript
import LDesignCrypto from '@ldesign/crypto'

LDesignCrypto.aes.encrypt('data', 'key')
```

### 子路径导入

```typescript
// 仅导入算法模块
import { aes } from '@ldesign/crypto/algorithms'

// 仅导入核心功能
import { encrypt, decrypt } from '@ldesign/crypto/core'

// 导入 Vue 适配器
import { useCrypto } from '@ldesign/crypto/vue'

// 导入工具函数
import { RandomUtils } from '@ldesign/crypto/utils'
```

## 下一步

- [快速开始](/guide/quick-start) - 学习基础用法
- [加密](/guide/encryption) - 了解加密功能
- [Vue 集成](/guide/vue-plugin) - 在 Vue 3 中使用
