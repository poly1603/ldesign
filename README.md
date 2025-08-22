# 🎨 LDesign - 让前端开发变得优雅而高效

[![CI](https://github.com/ldesign/ldesign/workflows/CI/badge.svg)](https://github.com/ldesign/ldesign/actions)
[![codecov](https://codecov.io/gh/ldesign/ldesign/branch/main/graph/badge.svg)](https://codecov.io/gh/ldesign/ldesign)
[![npm version](https://badge.fury.io/js/@ldesign%2Fengine.svg)](https://badge.fury.io/js/@ldesign%2Fengine)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Test Coverage](https://img.shields.io/badge/Test%20Coverage-91.7%25-brightgreen.svg)](./coverage)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)

> 🌟 **一个让开发者爱不释手的 Vue3 生态系统！**

欢迎来到 LDesign 的世界！这不仅仅是一个前端框架，更是一个充满魔法的开发体验。我们用 Vue3 的力量
，TypeScript 的严谨，以及一颗追求完美的心，为你打造了这个现代化的前端开发引擎。

🎯 **为什么选择 LDesign？** 因为我们相信，优秀的代码应该像诗一样优雅，像音乐一样和谐！

## 🏆 项目荣誉榜

🎉 **我们的成绩单闪闪发光！**

- 🎯 **测试覆盖率**: 91.7% - 比大多数开源项目都要高！
- 💎 **TypeScript 覆盖率**: 100% - 我们对 `any` 类型说不！
- 🔧 **代码质量**: 修复了 8172 个 ESLint 问题 - 强迫症患者的福音
- 🚀 **构建状态**: 16 个包全部构建成功 - 零失败率！
- ⚡ **Vue TSX 支持**: 完整的 JSX/TSX 支持 - 让 React 开发者也能无缝切换
- 📦 **生态完整**: 从核心引擎到工具库，应有尽有

## ✨ 超能力特性

> 每一个特性都是我们精心雕琢的艺术品！

### 🎯 **类型安全 - 告别运行时惊喜**

- 100% TypeScript 覆盖率，让 bug 无处遁形
- 智能类型推导，IDE 提示比你想象的更聪明

### 🚀 **性能怪兽 - 快到让你怀疑人生**

- 极致优化的构建流程，打包速度飞起
- 运行时性能调优，用户体验丝般顺滑

### 🔌 **插件化架构 - 像搭积木一样简单**

- 灵活的插件系统，想要什么功能就插什么
- 热插拔支持，开发过程中随时调整

### 🌍 **跨框架兼容 - 一套代码，多端运行**

- Vue 3 原生支持，拥抱组合式 API
- 原生 JavaScript 兼容，老项目也能用

### 📦 **模块化设计 - 按需取用，绿色环保**

- Tree-shaking 友好，只打包你用到的代码
- 包体积优化，让你的应用轻装上阵

## 📦 豪华全家桶

> 🎁 **16 个精心打造的包，每一个都是精品！**

### 🏗️ **核心架构**

| 包名                                 | 状态 | 描述        | 亮点               |
| ------------------------------------ | ---- | ----------- | ------------------ |
| [@ldesign/engine](./packages/engine) | ✅   | 🚀 核心引擎 | 插件化架构的心脏   |
| [@ldesign/api](./packages/api)       | ✅   | 🔌 API 管理 | 让接口调用变得优雅 |

### 🎨 **UI 与交互**

| 包名                                       | 状态 | 描述          | 亮点               |
| ------------------------------------------ | ---- | ------------- | ------------------ |
| [@ldesign/color](./packages/color)         | ✅   | 🌈 颜色魔法师 | 让色彩搭配不再困难 |
| [@ldesign/form](./packages/form)           | ✅   | 📝 表单大师   | 动态表单，验证无忧 |
| [@ldesign/watermark](./packages/watermark) | ✅   | 🔒 水印守护者 | 保护你的内容版权   |

### 🛠️ **工具利器**

| 包名                                 | 状态 | 描述          | 亮点               |
| ------------------------------------ | ---- | ------------- | ------------------ |
| [@ldesign/crypto](./packages/crypto) | ✅   | 🔐 加密专家   | 数据安全的守护神   |
| [@ldesign/device](./packages/device) | ✅   | 📱 设备侦探   | 精准识别用户设备   |
| [@ldesign/http](./packages/http)     | ✅   | 🌐 网络使者   | HTTP 请求的艺术    |
| [@ldesign/cache](./packages/cache)   | ✅   | 💾 缓存大师   | 让应用飞速响应     |
| [@ldesign/size](./packages/size)     | ✅   | 📏 尺寸计算器 | 响应式布局的好帮手 |

### 🌍 **国际化与路由**

| 包名                                 | 状态 | 描述          | 亮点               |
| ------------------------------------ | ---- | ------------- | ------------------ |
| [@ldesign/i18n](./packages/i18n)     | ✅   | 🌐 多语言专家 | 让你的应用走向世界 |
| [@ldesign/router](./packages/router) | ✅   | 🗺️ 路由导航   | 页面跳转的指南针   |

### 🏪 **状态与模板**

| 包名                                     | 状态 | 描述        | 亮点               |
| ---------------------------------------- | ---- | ----------- | ------------------ |
| [@ldesign/store](./packages/store)       | ✅   | 🏪 状态管家 | 数据流管理专家     |
| [@ldesign/template](./packages/template) | ✅   | 📄 模板引擎 | 动态内容生成器     |
| [@ldesign/theme](./packages/theme)       | ✅   | 🎨 主题切换 | 一键换肤，用户喜欢 |

### 🚀 **示例应用**

| 包名                           | 状态 | 描述        | 亮点               |
| ------------------------------ | ---- | ----------- | ------------------ |
| [@ldesign/app](./packages/app) | 🚧   | 🎯 完整示例 | 双环境开发模式演示 |

## 🚀 三分钟上手指南

> 💡 **别担心，我们让复杂的事情变得简单！**

### 📋 准备工作

确保你的开发环境满足以下要求（相信我，这些都是好东西）：

- **Node.js** >= 18.0.0 🟢 （现代 JavaScript 的基石）
- **pnpm** >= 8.0.0 ⚡ （比 npm 快 3 倍的包管理器）

### 📦 一键安装

```bash
# 🎯 想要什么就装什么，按需选择
npm install @ldesign/engine    # 核心引擎，必备！
npm install @ldesign/color     # 颜色魔法师
npm install @ldesign/crypto    # 加密专家

# 🚀 推荐使用 pnpm（速度飞起）
pnpm add @ldesign/engine @ldesign/color @ldesign/crypto

# 🎁 或者一次性体验全家桶
pnpm add @ldesign/engine @ldesign/color @ldesign/crypto @ldesign/http @ldesign/i18n
```

### 💡 Hello World 时刻

```typescript
// 🚀 核心引擎 - 让你的应用拥有超能力
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'

const app = createApp({})
const engine = createEngine({
  config: {
    appName: 'My Awesome App',
    version: '1.0.0',
    // 更多配置等你探索...
  },
})

app.use(engine)
// 🎉 恭喜！你的应用现在拥有了插件化能力
```

```typescript
// 🌈 颜色工具 - 让设计师爱上你的代码
import { ColorManager } from '@ldesign/color'

const colorManager = new ColorManager()
colorManager.setPrimaryColor('#1890ff')
const colors = colorManager.generateColorScale()
// 🎨 一键生成完整的色彩体系，设计师会感谢你的
```

```typescript
// 🔐 加密工具 - 数据安全的守护神
import { encrypt, decrypt } from '@ldesign/crypto'

const secret = encrypt('我的小秘密', 'my-secret-key')
const revealed = decrypt(secret, 'my-secret-key')
// 🛡️ 你的数据现在比银行金库还安全
```

### 🛠️ 开发者专区

> 🎯 **想要贡献代码？我们为你准备了最舒适的开发环境！**

```bash
# 🎬 第一步：把项目带回家
git clone https://github.com/ldesign/ldesign.git
cd ldesign

# 📦 第二步：安装依赖（喝杯咖啡的时间）
pnpm install

# 🚀 第三步：启动开发模式（见证魔法的时刻）
pnpm dev

# 🏗️ 构建所有包（打包你的杰作）
pnpm build

# 🧪 运行测试（确保一切完美）
pnpm test

# 🎭 E2E 测试（模拟真实用户操作）
pnpm test:e2e

# 🔍 代码检查（强迫症患者的福音）
pnpm lint

# 🎯 类型检查（TypeScript 的严格模式）
pnpm type-check

# 📚 启动文档服务器（分享你的智慧）
pnpm docs:dev

# 🎨 体验 app 项目的双环境开发模式
cd packages/app && pnpm dev:compare
# 🌟 同时启动构建模式(3001)和源码模式(3002)
```

## 📁 项目架构一览

> 🏗️ **井然有序的代码组织，让每个文件都有自己的家！**

```
ldesign/                        # 🏠 我们的大家庭
├── packages/                   # 📦 16个精品包的聚集地
│   ├── engine/                # 🚀 核心引擎 - 整个生态的心脏
│   ├── api/                   # 🔌 API管理 - 接口调用的艺术
│   ├── color/                 # 🎨 颜色魔法师 - 让世界更colorful
│   ├── crypto/                # 🔐 加密专家 - 数据安全守护神
│   ├── device/                # 📱 设备侦探 - 精准识别用户设备
│   ├── form/                  # 📝 表单大师 - 动态表单的艺术
│   ├── http/                  # 🌐 网络使者 - HTTP请求的优雅封装
│   ├── i18n/                  # 🌍 多语言专家 - 让应用走向世界
│   ├── router/                # 🗺️ 路由导航 - 页面跳转指南针
│   ├── store/                 # 🏪 状态管家 - 数据流管理专家
│   ├── template/              # 📄 模板引擎 - 动态内容生成器
│   ├── watermark/             # 🔒 水印守护者 - 版权保护专家
│   ├── cache/                 # 💾 缓存大师 - 让应用飞速响应
│   ├── size/                  # 📏 尺寸计算器 - 响应式布局好帮手
│   ├── theme/                 # 🎨 主题切换 - 一键换肤用户喜欢
│   └── app/                   # 🎯 完整示例 - 双环境开发演示
├── tools/                     # 🛠️ 开发工具箱 - 提升效率的神器
│   ├── configs/              # ⚙️ 统一配置 - 标准化的力量
│   ├── scripts/              # 📜 自动化脚本 - 让机器干重活
│   └── utils/                # 🔧 工具函数 - 开发者的瑞士军刀
├── .github/workflows/         # 🔄 CI/CD流水线 - 自动化部署
├── docs/                      # 📚 项目文档 - 知识的宝库
└── e2e/                       # 🧪 端到端测试 - 质量保证
```

### 📦 标准包结构

每个包都遵循我们精心设计的目录结构（强迫症患者的福音）：

```
packages/[package-name]/
├── src/                       # 📝 源代码 - 智慧的结晶
│   ├── index.ts              # 🚪 入口文件 - 欢迎来到这个包
│   ├── types/                # 🏷️ 类型定义 - TypeScript的严谨
│   └── utils/                # 🔧 工具函数 - 复用的艺术
├── examples/                  # 🎯 示例项目 - 最好的学习材料
├── docs/                      # 📖 VitePress文档 - 详细的使用指南
├── summary/                   # 📋 项目总结 - 设计理念和架构说明
├── __tests__/                 # 🧪 测试文件 - 质量的保证
├── dist/                      # 📦 构建产物 - 最终的成果
├── package.json              # 📄 包配置 - 包的身份证
├── README.md                 # 📚 说明文档 - 第一印象很重要
├── tsconfig.json             # ⚙️ TS配置 - 类型检查的规则
├── vite.config.ts            # ⚡ Vite配置 - 现代化构建工具
└── vitest.config.ts          # 🧪 测试配置 - 测试环境的设置
```

## 🛠️ 开发工具链

> 🎯 **完整的标准化工具链，让开发变得轻松愉快！**

### 📦 包管理神器

```bash
# 🎨 创建新包（一键生成标准结构）
pnpm tools:create-package my-awesome-package --vue --description "我的超棒包"

# ⚙️ 标准化所有包配置（强迫症患者的福音）
pnpm tools:standardize

# 🔍 验证包配置一致性（确保团队协作无忧）
node tools/verify-standardization.js
```

### 🚀 构建与发布

```bash
# 🏗️ 构建所有包（一键打包全家桶）
pnpm build

# 📦 智能发布管理
pnpm tools:release

# 🌐 多平台部署
pnpm deploy              # 全平台一键部署
pnpm deploy:npm          # 专注 npm 发布
pnpm deploy:docs         # 文档站点部署
```

### 🧪 测试与质量保证

```bash
# 🎯 全面测试套件
pnpm test:run            # 运行所有测试
pnpm test:coverage       # 生成覆盖率报告
pnpm test:e2e           # 端到端测试

# 🔍 代码质量检查
pnpm lint               # ESLint 检查
pnpm type-check         # TypeScript 类型检查
```

## 🛠️ 技术栈

### 🏗️ 核心技术

- **Vue 3** 🟢 - 渐进式框架，组合式 API 的魅力
- **TypeScript** 💙 - 类型安全，开发体验升级
- **Vite 6+** ⚡ - 极速构建，热更新如丝般顺滑
- **pnpm** 📦 - 高效包管理，磁盘空间节省专家

### 🧪 测试工具

- **Vitest** 🧪 - 现代化单元测试框架
- **Playwright** 🎭 - 跨浏览器 E2E 测试
- **@vue/test-utils** 🔧 - Vue 组件测试利器

### 📚 文档工具

- **VitePress** 📖 - 静态站点生成器
- **TypeDoc** 📝 - API 文档自动生成

### 🔧 开发工具

- **ESLint** 🔍 - 代码质量守护者
- **Prettier** 💅 - 代码格式化专家
- **Husky** 🐕 - Git hooks 管理

## 🤝 加入我们

> 💡 **开源的力量来自于每一个贡献者！**

### 🚀 快速贡献指南

1. **🍴 Fork 项目** - 把项目带回家
2. **🌿 创建分支** - `git checkout -b feature/amazing-feature`
3. **📦 安装依赖** - `pnpm install`
4. **💻 开始开发** - `pnpm dev`
5. **🧪 运行测试** - `pnpm test`
6. **📝 提交代码** - `git commit -m "feat: add amazing feature"`
7. **🚀 创建 PR** - 让我们一起让项目变得更好！

### 📋 贡献规范

- 🎯 **提交规范**: 遵循 [Conventional Commits](https://conventionalcommits.org/)
- 🧪 **测试覆盖**: 确保测试覆盖率 > 85%
- 📝 **文档完善**: 为新功能编写清晰的文档
- 🔍 **代码质量**: 通过所有 ESLint 和 TypeScript 检查

## 🌟 特别感谢

感谢所有为 LDesign 贡献代码、提出建议、报告问题的开发者们！

## 📄 开源协议

MIT © [LDesign Team](https://github.com/ldesign)

---

<div align="center">
  <h3>🎉 让我们一起创造更美好的前端世界！</h3>
  <sub>Built with ❤️ by the LDesign team</sub>
  <br><br>
  <a href="https://github.com/ldesign/ldesign">⭐ 给我们一个 Star</a> ·
  <a href="https://github.com/ldesign/ldesign/issues">🐛 报告问题</a> ·
  <a href="https://github.com/ldesign/ldesign/discussions">💬 参与讨论</a>
</div>
