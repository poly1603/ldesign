# 🚀 快速启动指南

恭喜！@ldesign/cropper 项目已经配置完成，可以立即使用。

## ✅ 已完成配置

- ✅ TypeScript 配置
- ✅ Vite 构建配置
- ✅ 多框架入口点（Vue/React/Angular/Vanilla）
- ✅ 示例项目配置
- ✅ VitePress 文档配置
- ✅ 测试环境配置
- ✅ Git 配置
- ✅ NPM 发布配置

## 📋 启动步骤

### 1️⃣ 安装依赖

```bash
cd D:\WorkBench\ldesign\library\cropper
npm install
```

### 2️⃣ 构建项目（可选）

```bash
npm run build
```

这会在 `dist/` 目录生成以下文件：
- `index.js` / `index.cjs` - 核心库
- `vue.js` / `vue.cjs` - Vue 适配器
- `react.js` / `react.cjs` - React 适配器
- `angular.js` / `angular.cjs` - Angular 适配器
- `style.css` - 样式文件
- `*.d.ts` - TypeScript 类型声明

### 3️⃣ 运行示例项目

```bash
cd examples/vite-demo
npm install
npm run dev
```

然后打开浏览器访问：**http://localhost:5173**

### 4️⃣ 查看文档

回到项目根目录：

```bash
cd ../..
npm run docs:dev
```

然后打开浏览器访问：**http://localhost:5173**

## 🎯 快速测试

### 最快方式 - 直接运行示例

```bash
# 在项目根目录
cd examples/vite-demo
npm install
npm run dev
```

示例项目已配置了本地开发别名，会自动使用源代码，无需构建。

## 📦 可用命令

### 主项目命令

```bash
npm run build         # 构建库
npm run dev           # 开发模式（目前用于测试）
npm run preview       # 预览构建结果
npm test              # 运行测试
npm run test:ui       # 测试 UI
npm run docs:dev      # 启动文档开发服务器
npm run docs:build    # 构建文档
npm run docs:preview  # 预览文档构建
```

### 示例项目命令

```bash
cd examples/vite-demo
npm run dev           # 启动开发服务器
npm run build         # 构建示例
npm run preview       # 预览构建
```

## 🎨 示例功能

示例项目包含以下功能演示：

1. **图片上传** - 从文件选择图片
2. **加载示例图片** - 加载预设图片
3. **宽高比控制** - 自由/1:1/16:9/4:3
4. **查看模式** - 4种不同视图模式
5. **拖拽模式** - 裁剪/移动/无
6. **图片变换**
   - 左旋转/右旋转
   - 水平翻转/垂直翻转
   - 重置
7. **导出功能**
   - 获取裁剪图片
   - 下载裁剪结果
8. **实时数据** - 显示裁剪数据

## 📚 文档结构

文档包含以下部分：

- **首页** - 项目介绍和快速开始
- **指南**
  - Getting Started - 入门指南
  - Installation - 安装说明
  - Basic Usage - 基本用法
  - Configuration - 配置详解
  - Vanilla JS - 原生JS使用
  - Vue 3 - Vue集成
  - React - React集成
  - Angular - Angular集成
- **API**
  - Cropper - 核心API
  - Options - 配置选项
- **示例**
  - 各种使用场景示例

## 🛠️ 开发工作流

### 修改源代码

1. 编辑 `src/` 下的文件
2. 示例项目会自动热更新（无需构建）
3. 如需测试构建版本，运行 `npm run build`

### 修改文档

1. 编辑 `docs/` 下的 Markdown 文件
2. 文档服务器会自动更新

### 添加测试

1. 在 `__tests__/` 目录添加测试文件
2. 运行 `npm test` 查看结果

## 🌐 浏览器支持

- Chrome (最新)
- Firefox (最新)
- Safari (最新)
- Edge (最新)
- iOS Safari
- Chrome Mobile

## 📱 设备支持

- ✅ 桌面（鼠标操作）
- ✅ 平板（触摸操作）
- ✅ 手机（触摸+手势）
- ✅ 双指缩放
- ✅ 触摸拖拽

## 🎓 学习资源

1. **README.md** - 项目概述
2. **SETUP.md** - 详细设置指南
3. **PROJECT_SUMMARY.md** - 项目架构说明
4. **CONTRIBUTING.md** - 贡献指南
5. **在线文档** - 完整API文档

## ⚡ 性能优化

项目已配置以下优化：

- ✅ Tree-shaking（按需引入）
- ✅ TypeScript 类型检查
- ✅ CSS 代码分割
- ✅ RequestAnimationFrame 动画优化
- ✅ 事件防抖/节流

## 🔍 故障排除

### 端口被占用

如果默认端口 5173 被占用，Vite 会自动使用下一个可用端口。

### 依赖安装失败

尝试清除缓存：

```bash
rm -rf node_modules package-lock.json
npm install
```

### 构建失败

检查 TypeScript 错误：

```bash
npx tsc --noEmit
```

### 示例无法加载图片

示例使用 Unsplash API，确保网络连接正常。

## 📦 发布准备

项目已准备好发布到 npm：

```bash
# 登录 npm
npm login

# 发布
npm publish --access public
```

## 🎉 下一步

1. ✅ 运行示例查看效果
2. ✅ 阅读文档了解API
3. ✅ 尝试修改源代码
4. ✅ 添加自己的功能
5. ✅ 编写测试用例
6. ✅ 准备发布

## 💡 提示

- 示例项目已配置开发别名，修改源代码会立即生效
- 文档支持热更新，编辑即可预览
- 所有配置文件都已优化，可直接使用
- TypeScript 提供完整类型支持

## 🎊 开始体验

```bash
cd examples/vite-demo
npm install
npm run dev
```

**立即打开浏览器体验强大的图片裁剪功能！**

---

需要帮助？查看详细文档或提交 Issue。
