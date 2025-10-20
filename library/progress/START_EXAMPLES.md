# 🚀 快速启动示例项目

## 一键启动

### 原生 JavaScript 示例
```bash
pnpm dev:vanilla
```
**访问**: http://localhost:3000

### Vue 示例
```bash
pnpm dev:vue
```
**访问**: http://localhost:3001

### React 示例
```bash
pnpm dev:react
```
**访问**: http://localhost:3002

## 首次使用

如果是第一次运行，需要先安装依赖：

```bash
pnpm install
```

## 项目特点

### ✅ 开发体验优化
- **无需构建** - 直接引用源码开发
- **热更新** - 修改代码立即生效
- **独立端口** - 可同时运行多个示例
- **自动打开** - 启动后自动打开浏览器

### ✅ 路径别名配置

所有示例项目都配置了路径别名：

```javascript
// vite.config.js
alias: {
  '@ldesign/progress-core': '../../packages/core/src/index.ts',
  '@ldesign/progress-vue': '../../packages/vue/src/index.ts',
  '@ldesign/progress-react': '../../packages/react/src/index.ts',
}
```

这意味着你可以直接修改源码，无需重新构建！

## 示例内容

### Vanilla 示例包含：
- ✅ 7种进度条类型（全部）
- ✅ 线性进度条（基础、渐变、条纹、缓冲、不确定状态）
- ✅ 圆形进度条（基础、渐变、成功主题）
- ✅ 半圆进度条（带刻度）
- ✅ 仪表盘进度（带指针和色区）
- ✅ 步骤进度条
- ✅ 分段进度条
- ✅ 水波纹进度

### Vue 示例包含：
- ✅ 线性进度条（基础、渐变、条纹）
- ✅ 圆形进度条（3种样式）
- ✅ 交互控制

### React 示例包含：
- ✅ 线性进度条（基础、渐变、条纹）
- ✅ 圆形进度条（3种样式）
- ✅ 交互控制

## 验证功能

启动后请验证：

1. ✅ 页面正常显示
2. ✅ 进度条渲染正确
3. ✅ 点击按钮可以改变进度
4. ✅ 进度变化有平滑动画
5. ✅ 控制台无错误
6. ✅ 修改源码后自动热更新

## 同时启动多个示例

你可以在不同终端同时启动多个示例：

```bash
# 终端 1
pnpm dev:vanilla

# 终端 2
pnpm dev:vue

# 终端 3
pnpm dev:react
```

然后在浏览器中打开：
- http://localhost:3000 (Vanilla)
- http://localhost:3001 (Vue)
- http://localhost:3002 (React)

## 停止服务

在终端中按 `Ctrl+C` 停止开发服务器。

## 遇到问题？

查看 [TEST_EXAMPLES.md](./TEST_EXAMPLES.md) 了解详细的测试和问题排查指南。

---

**准备好了吗？运行以下命令开始：**

```bash
pnpm dev:vue
```

🎉 享受开发吧！


