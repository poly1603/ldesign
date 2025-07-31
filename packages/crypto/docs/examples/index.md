# 示例概览

这里提供了 @ldesign/crypto 的完整使用示例，包括交互式演示和实际应用场景。

## 🔐 基础加密示例

### [AES 对称加密](./aes.md)
- AES-128/192/256 加密演示
- 不同加密模式（CBC、ECB、CFB、OFB、CTR）
- 自定义 IV 和密钥生成
- 交互式加密/解密工具

### [RSA 非对称加密](./rsa.md)
- RSA 密钥对生成
- 公钥加密，私钥解密
- 不同密钥长度演示
- 交互式 RSA 工具

### [哈希算法](./hash.md)
- MD5、SHA-1、SHA-224、SHA-256、SHA-384、SHA-512
- 批量哈希计算
- 哈希验证功能
- 交互式哈希计算器

### [数字签名](./signature.md)
- RSA 数字签名生成
- 签名验证功能
- 不同哈希算法的签名
- 交互式签名工具

## 🎯 Vue 3 集成示例

### [Composition API](./vue-composables.md)
- useCrypto Hook 演示
- useHash Hook 演示
- useSignature Hook 演示
- 响应式状态管理

### [插件使用](./vue-plugin.md)
- 全局属性访问
- 依赖注入使用
- 配置选项演示
- 组件封装示例

### [表单加密](./vue-form.md)
- 表单数据加密
- 实时加密预览
- 错误处理演示
- 用户体验优化

### [文件处理](./vue-file.md)
- 文件内容加密
- 文件哈希计算
- 批量文件处理
- 进度显示

## 🚀 实际应用示例

### [用户认证](./authentication.md)
- 密码哈希存储
- 登录验证流程
- JWT 令牌签名
- 会话管理

### [数据传输](./data-transfer.md)
- API 请求签名
- 数据完整性验证
- 端到端加密
- 安全传输协议

### [本地存储](./local-storage.md)
- 敏感数据加密存储
- 配置文件保护
- 缓存数据安全
- 跨标签页数据共享

### [API 安全](./api-security.md)
- 请求签名验证
- 防重放攻击
- 时间戳验证
- 权限控制

## 📱 交互式演示

每个示例页面都包含：

- **实时代码编辑器**: 可以修改代码并立即看到结果
- **参数调整面板**: 调整算法参数和选项
- **结果展示区域**: 清晰显示加密、解密、哈希结果
- **性能指标**: 显示操作耗时和数据大小
- **错误处理**: 展示错误信息和处理方式

## 🛠️ 使用说明

### 如何使用交互式示例

1. **选择示例**: 点击上方链接进入具体示例页面
2. **输入数据**: 在输入框中输入要处理的数据
3. **调整参数**: 根据需要调整算法参数
4. **执行操作**: 点击相应按钮执行加密、解密等操作
5. **查看结果**: 在结果区域查看处理结果
6. **复制代码**: 复制示例代码到你的项目中使用

### 代码复制

每个示例都提供了完整的代码，可以直接复制到你的项目中：

```typescript
// 示例代码会显示在这样的代码块中
import { encrypt, decrypt } from '@ldesign/crypto'

const data = 'Hello, World!'
const key = 'my-secret-key'

const encrypted = encrypt.aes(data, key)
const decrypted = decrypt.aes(encrypted, key)

console.log('原始数据:', data)
console.log('加密结果:', encrypted.data)
console.log('解密结果:', decrypted.data)
```

### 在线测试

所有示例都可以在线测试，无需安装任何软件：

- ✅ 实时执行代码
- ✅ 即时查看结果
- ✅ 参数动态调整
- ✅ 错误信息提示
- ✅ 性能数据显示

## 📚 学习路径

### 初学者路径

1. 从 [AES 加密示例](./aes.md) 开始，了解基本的对称加密
2. 学习 [哈希算法示例](./hash.md)，理解数据完整性验证
3. 尝试 [Base64 编码示例](./encoding.md)，掌握数据编码转换
4. 进入 [Vue 3 集成示例](./vue-composables.md)，学习框架集成

### 进阶路径

1. 学习 [RSA 加密示例](./rsa.md)，理解非对称加密
2. 掌握 [数字签名示例](./signature.md)，了解身份验证
3. 研究 [实际应用示例](./authentication.md)，学习最佳实践
4. 探索 [高级用法](./api-security.md)，掌握安全开发

### 专业路径

1. 深入 [安全最佳实践](../guide/security.md)
2. 学习 [性能优化技巧](../guide/performance.md)
3. 掌握 [错误处理策略](../guide/error-handling.md)
4. 了解 [部署和维护](../guide/deployment.md)

## 🔗 相关资源

- [API 文档](../api/) - 完整的 API 参考
- [快速开始](../guide/quick-start.md) - 5分钟上手指南
- [最佳实践](../guide/best-practices.md) - 开发建议
- [常见问题](../guide/faq.md) - 问题解答

## 💡 提示

- 所有示例都经过测试，可以直接使用
- 建议按顺序学习，从简单到复杂
- 每个示例都有详细的注释说明
- 遇到问题可以查看错误处理部分
- 可以修改示例代码进行实验
