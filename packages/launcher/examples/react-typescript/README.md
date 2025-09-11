# React + TypeScript 示例项目

这是一个使用 LDesign Launcher 构建的 React + TypeScript 示例项目。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 类型检查
npm run type-check
```

## 📦 特性

- ⚡ **快速热更新** - 基于 Vite 的极速热更新
- 📘 **TypeScript** - 完整的类型安全支持
- 🎨 **CSS 模块化** - 支持 CSS Modules 和 SCSS
- 🔧 **智能插件** - 自动检测和配置 React 插件
- 📱 **响应式设计** - 现代化的响应式布局
- ⚙️ **ESBuild** - 极速构建和压缩

## 🛠️ 配置说明

### launcher.config.ts

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### 关键配置

- **server.port**: 开发服务器端口 (默认: 3000)
- **build.outDir**: 构建输出目录 (默认: dist)
- **resolve.alias**: 路径别名配置
- **css.modules**: CSS 模块化配置
- **optimizeDeps**: 依赖预构建优化

## 📁 项目结构

```
react-typescript/
├── src/
│   ├── App.tsx         # 主应用组件
│   ├── App.css         # 应用样式
│   ├── main.tsx        # 入口文件
│   └── index.css       # 全局样式
├── launcher.config.ts  # Launcher 配置
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── index.html          # HTML 模板
```

## 🎯 开发指南

1. **组件开发**: 在 `src/` 目录下创建新的 React 组件
2. **样式管理**: 支持普通 CSS、CSS Modules 和 SCSS
3. **类型安全**: 充分利用 TypeScript 的类型检查
4. **热更新**: 修改代码后自动刷新页面
5. **路径别名**: 使用 `@/` 作为 `src/` 的别名

## 📚 相关文档

- [LDesign Launcher 文档](../../docs/)
- [React 官方文档](https://react.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)
- [Vite 文档](https://vitejs.dev/)
