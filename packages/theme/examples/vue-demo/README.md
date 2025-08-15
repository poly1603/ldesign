# LDesign Theme Vue Demo

这是 LDesign Theme 的 Vue 3 演示项目，展示了主题系统的基本功能。

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录安装依赖
cd packages/theme/examples/vue-demo
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

浏览器会自动打开 http://localhost:3000

## 📁 项目结构

```
vue-demo/
├── src/
│   ├── views/           # 页面组件
│   ├── router/          # 路由配置
│   ├── App.vue          # 根组件
│   ├── main.ts          # 应用入口
│   └── style.css        # 全局样式
├── index.html           # HTML 模板
├── vite.config.ts       # Vite 配置
└── package.json         # 项目配置
```

## 🎨 功能演示

- ✅ 基本主题切换
- ✅ 主题变量系统
- ✅ 响应式设计
- 🚧 装饰元素（开发中）
- 🚧 动画效果（开发中）
- 🚧 Vue 组件（开发中）

## 🛠️ 技术栈

- Vue 3 + TypeScript
- Vite
- Vue Router
- @ldesign/theme

## 📝 开发说明

这是一个简化的演示版本，主要用于验证基本功能。完整的演示功能正在开发中。

当前版本主要展示：

1. 基本的主题切换功能
2. CSS 变量主题系统
3. 响应式布局设计

## 🔧 配置说明

### Vite 配置

项目配置了路径别名，可以直接引用主题包：

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': resolve(__dirname, 'src'),
    '@ldesign/theme': resolve(__dirname, '../../src'),
  },
}
```

### TypeScript 配置

配置了路径映射，支持类型提示：

```json
// tsconfig.json
"paths": {
  "@/*": ["src/*"],
  "@ldesign/theme": ["../../src"],
  "@ldesign/theme/*": ["../../src/*"]
}
```

## 🚀 构建部署

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
