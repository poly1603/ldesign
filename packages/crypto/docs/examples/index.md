# 示例概览

本章节提供了  @ldesign/crypto  的完整示例代码，涵盖了所有主要功能和常见使用场景。

## 快速导航

### 对称加密算法

-  [AES 加密](./aes.md) - 高级加密标准，支持  128/192/256  位密钥
-  [DES 加密](./des.md) - 数据加密标准（不推荐用于生产）
-  [TripleDES 加密](./tripledes.md) - 三重  DES  加密
-  [Blowfish 加密](./blowfish.md) - Blowfish  对称加密算法

### 非对称加密算法

-  [RSA 加密](./rsa.md) - RSA  公钥加密算法，支持密钥生成、加密、解密和签名

### 哈希与验证

-  [哈希函数](./hash.md) - MD5、SHA1、SHA256、SHA384、SHA512  等哈希算法
-  [数字签名](./signature.md) - RSA  数字签名的生成与验证

### 编码转换

-  [编码工具](./encoding.md) - Base64、Hex  等编码方式

## 示例特点

每个示例都包含：

-  **基础用法**：最简单的使用方式
-  **完整示例**：包含错误处理的完整代码
-  **实际场景**：真实世界的应用案例
-  **最佳实践**：安全性建议和性能优化
-  **代码注释**：详细的中文注释

## 开始使用

建议按照以下顺序学习：

1.  从  [编码工具](./encoding.md)  开始，了解基本的数据转换
2.  学习  [哈希函数](./hash.md)，理解数据摘要和完整性验证
3.  掌握  [AES 加密](./aes.md)，这是最常用的对称加密算法
4.  了解  [RSA 加密](./rsa.md)  和  [数字签名](./signature.md)，掌握非对称加密
5.  根据需要学习其他加密算法

## 在线试用

每个示例都可以直接在你的项目中运行。安装库后：

```bash
npm install @ldesign/crypto
```

然后复制示例代码到你的项目中即可。

## 获取帮助

-  查看  [API 文档](/api/) 了解详细的  API  参考
-  访问  [GitHub Issues](https://github.com/ldesign/crypto/issues)  报告问题
-  阅读  [安全建议](/guide/security.md)  了解安全最佳实践

## 贡献示例

如果你有好的示例想要分享，欢迎提交  Pull  Request！
