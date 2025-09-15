# @ldesign/component

基于 Vue 3 + TypeScript + Vite 的现代化组件库，遵循 TDesign 设计规范。

## 特性

- 🚀 **现代化技术栈**：Vue 3 + TypeScript + Vite + ESM
- 🎨 **设计系统**：遵循 TDesign 设计规范，支持主题定制
- 📦 **按需引入**：支持 Tree Shaking，减少打包体积
- 🛠️ **开发体验**：完整的 TypeScript 类型支持
- 🧪 **质量保证**：基于 Vitest 的完整测试覆盖

## 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/component

# 使用 npm
npm install @ldesign/component

# 使用 yarn
yarn add @ldesign/component
```

### 使用

```typescript
// 全量引入
import { createApp } from 'vue'
import LDesignComponent from '@ldesign/component'
import '@ldesign/component/styles'

const app = createApp(App)
app.use(LDesignComponent)

// 按需引入
import { LButton, LInput } from '@ldesign/component'
```

## 开发

本包由 monorepo 管理，文档位于 `docs/`，组件源码位于 `src/`。

- 构建：`pnpm --dir packages/component run build:prod`
- 开发：`pnpm --dir packages/component run start`
- 文档开发：`pnpm --dir packages/component run docs:dev`
- 测试：`pnpm --dir packages/component run test`

## 文档

详细使用说明请参阅：
- [在线文档](https://ldesign.github.io/component)
- [组件文档](./docs/components/)
- [设计规范](./docs/design/)

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 许可证

MIT License

