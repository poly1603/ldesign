# 🚀 快速开始

欢迎使用 Vite Launcher！这个指南将帮你在 5 分钟内创建你的第一个项目。

## 📦 安装

::: tip 💡 推荐使用 PNPM
我们推荐使用 [PNPM](https://pnpm.io/) 作为包管理器，它速度更快，占用空间更小。当然，NPM 和 Yarn 也完全没问题！
:::

::: code-group

```bash [PNPM (推荐)]
# 全局安装
pnpm add -g @ldesign/launcher

# 或者直接使用（无需安装）
pnpm create @ldesign/launcher my-awesome-app
```

```bash [NPM]
# 全局安装
npm install -g @ldesign/launcher

# 或者直接使用
npm create @ldesign/launcher my-awesome-app
```

```bash [Yarn]
# 全局安装
yarn global add @ldesign/launcher

# 或者直接使用
yarn create @ldesign/launcher my-awesome-app
```

:::

## 🎯 创建你的第一个项目

### 方式一：交互式创建（推荐）

```bash
# 🎨 启动交互式创建向导
vite-launcher create my-awesome-app

# 🤖 AI 会问你几个问题：
# ❓ 选择项目类型: Vue 3, React, TypeScript...
# ❓ 是否使用 TypeScript: 是/否
# ❓ 选择包管理器: npm, yarn, pnpm
# ❓ 是否立即安装依赖: 是/否
```

### 方式二：命令行参数

```bash
# 🚀 Vue 3 + TypeScript 项目
vite-launcher create my-vue-app --template vue3 --typescript

# ⚛️ React + TypeScript 项目  
vite-launcher create my-react-app --template react --typescript

# 🔷 纯 TypeScript 项目
vite-launcher create my-ts-app --template vanilla-ts

# 🌟 Lit Web Components 项目
vite-launcher create my-lit-app --template lit
```

### 方式三：编程方式使用

```typescript
import { createProject, startDev } from '@ldesign/launcher'

// 🎨 创建项目
await createProject('./my-app', 'vue3', {
  force: true,        // 覆盖已存在的目录
  installDeps: true,  // 自动安装依赖
  packageManager: 'pnpm' // 指定包管理器
})

// ⚡ 启动开发服务器
const server = await startDev('./my-app', {
  port: 3000,
  open: true,
  host: 'localhost'
})

console.log('🎉 开发服务器已启动！')
```

## 🎊 启动开发服务器

创建完项目后，让我们启动开发服务器：

```bash
# 📁 进入项目目录
cd my-awesome-app

# ⚡ 启动开发服务器
npm run dev

# 🎯 或者使用 Vite Launcher
vite-launcher dev
```

::: info 🌟 开发服务器特性
- **⚡ 闪电般的热重载**: 修改代码后瞬间看到效果
- **🔍 智能错误提示**: 友好的错误信息和解决建议  
- **📱 移动端适配**: 自动生成移动端访问链接
- **🌐 网络访问**: 局域网内其他设备可以访问
:::

你会看到类似这样的输出：

```bash
🎉 开发服务器已启动！

  ➜  本地地址:   http://localhost:3000/
  ➜  网络地址:   http://192.168.1.100:3000/
  ➜  移动端:     http://192.168.1.100:3000/

💡 按 Ctrl+C 停止服务器
🔍 按 o + Enter 在浏览器中打开
📱 按 r + Enter 重启服务器
```

## 🏗️ 构建项目

当你的项目开发完成，准备部署时：

```bash
# 🔨 构建生产版本
npm run build

# 🎯 或者使用 Vite Launcher
vite-launcher build

# 📊 构建并生成分析报告
vite-launcher build --analyze
```

构建完成后，你会看到详细的构建报告：

```bash
📊 构建分析结果
==================================================
📁 总文件数: 12
📦 总大小: 2.1 MB
🗜️  压缩后: 890 KB (压缩率: 58%)
⏱️  构建耗时: 3.2s

📈 文件统计:
  • 入口文件: 1
  • 代码块: 3  
  • 模块数: 25
  • 资源文件: 8

📋 最大的文件:
  1. vendor.js: 1.2 MB (chunk)
  2. main.js: 450 KB (entry)
  3. style.css: 120 KB (asset)
  4. logo.png: 89 KB (asset)
  5. app.js: 67 KB (chunk)

💡 优化建议:
  • 建议启用 Gzip 压缩以减少传输大小
  • 考虑代码分割来减少首屏加载时间
  • 1个大图片文件建议优化或使用 WebP 格式
```

## 🔍 预览构建结果

在部署之前，你可以本地预览构建后的项目：

```bash
# 👀 预览构建结果
npm run preview

# 🎯 或者使用 Vite Launcher
vite-launcher preview

# 🚀 在指定端口预览
vite-launcher preview --port 4000
```

## 🎨 项目结构

Vite Launcher 创建的项目具有清晰的结构：

```
my-awesome-app/
├── 📁 public/           # 静态资源
│   ├── 🖼️ favicon.ico
│   └── 🎨 logo.svg
├── 📁 src/             # 源代码
│   ├── 📁 assets/      # 项目资源
│   ├── 📁 components/  # Vue/React 组件
│   ├── 🎯 main.ts      # 入口文件
│   └── 🧩 App.vue      # 根组件
├── 📋 index.html       # HTML 模板
├── 📦 package.json     # 项目配置
├── ⚙️ vite.config.ts   # Vite 配置
└── 🔧 tsconfig.json    # TypeScript 配置
```

::: details 📂 文件说明
- **`src/main.ts`**: 应用程序的入口点，负责创建和挂载应用
- **`src/App.vue`**: Vue 应用的根组件，或 React 的主组件
- **`src/components/`**: 存放可复用组件的目录
- **`src/assets/`**: 存放图片、字体等静态资源
- **`public/`**: 直接复制到构建输出的静态文件
- **`vite.config.ts`**: Vite 的配置文件，可以自定义构建行为
:::

## 🎯 下一步

恭喜！🎉 你已经成功创建并运行了你的第一个 Vite Launcher 项目。现在你可以：

::: tip 🚀 继续你的开发之旅
- 📚 [探索更多功能](/guide/creating-projects) - 了解如何创建不同类型的项目
- 🔧 [学习配置选项](/config/) - 自定义你的开发环境
- 💡 [查看实际示例](/examples/) - 学习最佳实践
- 🛠️ [了解构建优化](/guide/build-analysis) - 让你的应用更快更小
:::

### 📚 推荐阅读

1. **[创建项目详解](/guide/creating-projects)** - 深入了解各种项目模板
2. **[开发服务器配置](/guide/dev-server)** - 优化你的开发体验  
3. **[构建和部署](/guide/building)** - 准备生产环境
4. **[性能优化技巧](/guide/performance)** - 让应用飞起来

### 🆘 需要帮助？

如果遇到任何问题，不要犹豫：

- 🐛 [报告 Bug](https://github.com/ldesign/packages/issues)
- 💬 [加入讨论](https://github.com/ldesign/packages/discussions)  
- 📖 [查看 FAQ](/faq)
- 📧 [联系我们](mailto:support@ldesign.dev)

::: warning 💡 小贴士
记住，最好的学习方式就是实践！尝试修改代码，看看会发生什么。Vite Launcher 的热重载会让你立即看到变化的效果。
:::

---

准备好深入了解 Vite Launcher 的更多功能了吗？让我们继续探索吧！🚀