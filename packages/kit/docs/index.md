---
layout: home

hero:
  name: '@ldesign/kit'
  text: '现代 Node.js 工具包'
  tagline: 功能完整的 TypeScript 工具库，提供现代 Node.js 开发所需的各种工具模块
  image:
    src: /logo.svg
    alt: LDesign Kit
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/ldesign/kit

features:
  - icon: 🛠️
    title: 工具函数集合
    details: 提供字符串、数字、日期、对象、数组等常用工具函数，提高开发效率
  - icon: 📁
    title: 文件系统操作
    details: 完整的文件和目录操作 API，支持文件监听和权限管理
  - icon: 🚀
    title: 高性能缓存
    details: 多层缓存系统，支持内存缓存、文件缓存和智能驱逐策略
  - icon: ✅
    title: 数据验证
    details: 灵活的验证规则引擎，支持同步和异步验证
  - icon: 🔧
    title: Git 操作
    details: 完整的 Git 仓库管理功能，支持分支操作和远程同步
  - icon: 📦
    title: 包管理
    details: NPM 包管理工具，支持依赖管理和脚本执行
  - icon: 🔐
    title: SSL 证书
    details: SSL 证书生成、验证和管理工具
  - icon: 💻
    title: CLI 工具
    details: 命令行工具开发框架，支持参数解析和输出格式化
  - icon: 🎯
    title: 交互界面
    details: 用户交互和系统通知功能
  - icon: ⚡
    title: 性能监控
    details: 性能测试和监控工具，支持基准测试和性能分析
  - icon: 🔥
    title: 配置热更新
    details: 智能配置管理系统，支持热重载、缓存和依赖追踪
  - icon: 🎨
    title: SVG IconFont
    details: SVG 到 IconFont 转换工具，支持多种字体格式和样式生成
  - icon: 🛠️
    title: 系统工具
    details: 丰富的系统信息获取、文件操作和网络请求工具
  - icon: 🔒
    title: 类型安全
    details: 100% TypeScript 支持，提供完整的类型定义
  - icon: 🌐
    title: 跨平台
    details: 支持 Windows、macOS 和 Linux 平台
---

## 为什么选择 @ldesign/kit？

### 🎯 功能完整

提供11个核心模块，涵盖现代 Node.js 开发的各个方面，无需引入多个第三方库。

### 🚀 开箱即用

简洁的 API 设计，丰富的使用示例，让您快速上手并提高开发效率。

### 🔒 类型安全

100% TypeScript 编写，提供完整的类型定义，减少运行时错误。

### 📦 模块化设计

支持按需导入，只打包您需要的功能，保持应用体积最小。

### 🧪 测试覆盖

完整的测试套件，确保代码质量和稳定性。

### 📚 文档完善

详细的 API 文档、使用示例和最佳实践指南。

## 快速预览

```typescript
import { StringUtils, FileSystem, CacheManager, Validator } from '@ldesign/kit'

// 字符串处理
const slug = StringUtils.slugify('Hello World!') // 'hello-world'

// 文件操作
await FileSystem.writeFile('./config.json', JSON.stringify(config))
const content = await FileSystem.readFile('./config.json')

// 缓存管理
const cache = CacheManager.create()
await cache.set('user:123', userData, 3600) // 1小时缓存
const user = await cache.get('user:123')

// 数据验证
const validator = Validator.create()
validator.addRule('email', ValidationRules.email())
const result = await validator.validate({ email: 'user@example.com' })
```

## 立即开始

<div class="tip custom-block" style="padding-top: 8px">

只需要几分钟，您就可以开始使用 @ldesign/kit 提升您的开发效率。

</div>

```bash
# 安装
npm install @ldesign/kit
# 或
yarn add @ldesign/kit
# 或
pnpm add @ldesign/kit
```

```typescript
// 开始使用
import { StringUtils } from '@ldesign/kit'

console.log(StringUtils.camelCase('hello-world')) // 'helloWorld'
```

## 社区支持

- 💬 [GitHub Discussions](https://github.com/ldesign/kit/discussions) - 提问和讨论
- 🐛 [GitHub Issues](https://github.com/ldesign/kit/issues) - 报告问题
- 📖 [更新日志](https://github.com/ldesign/kit/blob/main/CHANGELOG.md) - 查看版本更新

## 许可证

[MIT License](https://github.com/ldesign/kit/blob/main/LICENSE) © 2024 LDesign Team
