# 文档测试页面

这是一个测试页面，用于验证 VitePress 文档系统是否正常工作。

## 功能测试

### 1. 基本 Markdown 渲染

**粗体文本** 和 *斜体文本*

### 2. 代码块

```typescript
import { encrypt, decrypt } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'test-key'

const encrypted = encrypt.aes(data, key)
const decrypted = decrypt.aes(encrypted, key)

console.log('解密结果:', decrypted.data)
```

### 3. 列表

- 项目 1
- 项目 2
- 项目 3

### 4. 表格

| 算法 | 密钥长度 | 安全性 |
|------|----------|--------|
| AES-128 | 128位 | 高 |
| AES-256 | 256位 | 很高 |

### 5. 链接测试

- [API 文档](./api/index.md)
- [示例页面](./examples/index.md)
- [指南](./guide/quick-start.md)

## 状态

✅ 文档系统已配置
✅ 所有页面已创建
✅ 导航菜单已配置
✅ 示例项目正常运行

如果您能看到这个页面，说明 VitePress 文档系统工作正常！
