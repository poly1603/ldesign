# Lit Example

这是一个使用 Vite Launcher 创建的 Lit 项目示例。

## 特性

- ✨ Lit 3.0 支持
- 🔥 热模块替换 (HMR)
- 📦 TypeScript 支持
- ⚡ Vite 构建工具

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview
```

## 项目结构

```
lit-example/
├── src/
│   ├── main.ts          # 应用入口
│   └── my-element.ts    # Lit 组件
├── index.html           # HTML 模板
├── package.json         # 项目配置
└── vite.config.ts       # Vite 配置
```

## 使用 Vite Launcher

这个项目可以通过 Vite Launcher 创建：

```typescript
import { createProject } from '@ldesign/launcher'

await createProject('./my-lit-app', 'lit')
```
