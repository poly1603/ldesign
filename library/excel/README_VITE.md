# Vite 配置完成说明

## ✅ 已完成的工作

### 1. 所有示例项目配置 Vite

#### 原生 JavaScript 示例 (examples/vanilla)
- ✅ 创建 `package.json`
- ✅ 创建 `vite.config.js` (端口: 3000)
- ✅ 配置 alias 指向核心包源码
- ✅ 创建 `main.js` 入口文件

#### Vue 3 示例 (examples/vue-demo)
- ✅ 创建 `package.json`
- ✅ 创建 `vite.config.js` (端口: 3001)
- ✅ 配置 Vue 插件
- ✅ 配置 alias 指向 Vue 和核心包源码
- ✅ 创建 `index.html` 和 `main.js`

#### React 示例 (examples/react-demo)
- ✅ 创建 `package.json`
- ✅ 创建 `vite.config.js` (端口: 3002)
- ✅ 配置 React 插件
- ✅ 配置 alias 指向 React 和核心包源码
- ✅ 创建 `index.html` 和 `main.tsx`

#### Lit 示例 (examples/lit-demo)
- ✅ 创建 `package.json`
- ✅ 创建 `vite.config.js` (端口: 3003)
- ✅ 配置 alias 指向 Lit 和核心包源码
- ✅ 创建 `main.js` 入口文件

### 2. Alias 配置详情

每个示例项目都配置了完整的 alias，直接引用源代码：

```javascript
// 示例：Vue 项目的 alias 配置
resolve: {
  alias: {
    '@ldesign/excel-viewer-vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
    '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  },
}
```

**优势：**
- 🚀 无需构建，直接引用源码
- 🔥 热更新，修改代码即时生效
- 🐛 便于调试，可在源码打断点
- ⚡ 加快开发速度

### 3. NPM Scripts 增强

在根目录 `package.json` 添加了多个便捷脚本：

#### 开发脚本
```bash
npm run dev:vanilla   # 运行原生 JS 示例
npm run dev:vue       # 运行 Vue 示例
npm run dev:react     # 运行 React 示例
npm run dev:lit       # 运行 Lit 示例
```

#### 构建脚本
```bash
npm run build:examples           # 构建所有示例
npm run build:example:vanilla    # 构建原生 JS 示例
npm run build:example:vue        # 构建 Vue 示例
npm run build:example:react      # 构建 React 示例
npm run build:example:lit        # 构建 Lit 示例
```

#### 测试脚本
```bash
npm run test:build    # 自动化测试所有包的构建
```

### 4. 自动化测试脚本

创建了 `scripts/test-build.js`，功能：
- ✅ 自动清理旧的构建文件
- ✅ 依次构建所有包（core, vue, react, lit）
- ✅ 验证每个包的输出文件
- ✅ 生成详细的测试报告
- ✅ 彩色输出，清晰易读

### 5. 完整文档

创建了三个详细文档：

1. **VITE_SETUP.md** - Vite 配置和使用指南
   - 项目结构说明
   - Alias 配置详解
   - 快速开始指南
   - 开发工作流
   - 常见问题解答

2. **BUILD_TEST_GUIDE.md** - 打包测试指南
   - 自动化测试说明
   - 手动测试步骤
   - 构建质量验证
   - 性能测试方法
   - 发布前检查清单

3. **README_VITE.md** - 本文件
   - 完成工作总结
   - 快速使用指南

## 🚀 快速开始

### 第一次使用

```bash
# 1. 安装根目录依赖
npm install

# 2. 安装示例项目依赖
cd examples/vanilla && npm install
cd ../vue-demo && npm install
cd ../react-demo && npm install
cd ../lit-demo && npm install
cd ../..

# 3. 运行示例（选择一个）
npm run dev:vue
# 或 npm run dev:vanilla / dev:react / dev:lit
```

### 日常开发

```bash
# 启动开发服务器（自动打开浏览器）
npm run dev:vue

# 修改源代码
# packages/core/src/viewer.ts
# packages/vue/src/ExcelViewer.vue

# 浏览器会自动热更新！
```

### 测试打包

```bash
# 自动化测试所有包的构建
npm run test:build

# 或手动构建
npm run build

# 验证输出
ls -la packages/core/dist/
ls -la packages/vue/dist/
ls -la packages/react/dist/
ls -la packages/lit/dist/
```

## 📂 项目结构

```
excel/
├── packages/
│   ├── core/              # 核心包
│   │   ├── src/          # 源代码
│   │   └── dist/         # 构建输出
│   ├── vue/              # Vue 组件
│   ├── react/            # React 组件
│   └── lit/              # Lit 组件
├── examples/
│   ├── vanilla/          # 原生 JS 示例 (Vite)
│   │   ├── vite.config.js
│   │   ├── main.js
│   │   └── package.json
│   ├── vue-demo/         # Vue 示例 (Vite)
│   │   ├── vite.config.js
│   │   ├── main.js
│   │   └── package.json
│   ├── react-demo/       # React 示例 (Vite)
│   │   ├── vite.config.js
│   │   ├── main.tsx
│   │   └── package.json
│   └── lit-demo/         # Lit 示例 (Vite)
│       ├── vite.config.js
│       ├── main.js
│       └── package.json
├── scripts/
│   └── test-build.js     # 自动化测试脚本
├── VITE_SETUP.md         # Vite 配置指南
├── BUILD_TEST_GUIDE.md   # 打包测试指南
└── README_VITE.md        # 本文件
```

## 🎯 核心功能

### Alias 配置

**作用：** 直接引用源代码，无需构建

```javascript
// 在示例项目中
import { ExcelViewer } from '@ldesign/excel-viewer-vue';

// 实际引用
// ../../packages/vue/src/index.ts
```

### 热更新

**效果：** 修改源码后浏览器自动刷新

```bash
# 启动开发服务器
npm run dev:vue

# 修改文件
vim packages/core/src/viewer.ts

# 浏览器自动刷新！✨
```

### 端口分配

每个示例使用不同端口，可同时运行：

- Vanilla: http://localhost:3000
- Vue: http://localhost:3001
- React: http://localhost:3002
- Lit: http://localhost:3003

## 📝 常用命令

### 开发命令

```bash
# 启动开发服务器
npm run dev:vue          # Vue 示例
npm run dev:react        # React 示例
npm run dev:vanilla      # 原生 JS 示例
npm run dev:lit          # Lit 示例
```

### 构建命令

```bash
# 构建包
npm run build            # 所有包
npm run build:core       # 核心包
npm run build:vue        # Vue 包
npm run build:react      # React 包
npm run build:lit        # Lit 包

# 构建示例
npm run build:examples   # 所有示例
```

### 测试命令

```bash
# 自动化测试
npm run test:build       # 测试所有包的构建

# 代码检查
npm run lint             # ESLint
npm run type-check       # TypeScript 类型检查

# 清理
npm run clean            # 清理构建文件
```

## ✨ 使用示例

### 开发新功能

```bash
# 1. 启动 Vue 示例
npm run dev:vue

# 2. 修改核心代码
vim packages/core/src/viewer.ts

# 3. 浏览器自动刷新，查看效果

# 4. 修改 Vue 组件
vim packages/vue/src/ExcelViewer.vue

# 5. 再次自动刷新
```

### 测试打包

```bash
# 1. 运行自动化测试
npm run test:build

# 输出示例：
# ========================================
# 开始测试所有包的打包
# ========================================
# 
# 📦 正在构建 @ldesign/excel-viewer-core...
#   ✅ 所有输出文件存在
#   ✅ @ldesign/excel-viewer-core 构建成功
# 
# ... (其他包)
# 
# 🎉 所有包构建成功！
```

### 构建示例项目

```bash
# 1. 构建所有示例
npm run build:examples

# 2. 查看输出
ls -la examples/vanilla/dist/
ls -la examples/vue-demo/dist/
ls -la examples/react-demo/dist/
ls -la examples/lit-demo/dist/

# 3. 预览构建结果
cd examples/vue-demo && npm run preview
```

## 🎓 学习资源

- **Vite 配置详解**: [VITE_SETUP.md](VITE_SETUP.md)
- **打包测试指南**: [BUILD_TEST_GUIDE.md](BUILD_TEST_GUIDE.md)
- **项目文档**: [docs/](docs/)
- **API 文档**: [docs/API.md](docs/API.md)
- **使用指南**: [docs/GUIDE.md](docs/GUIDE.md)

## 🐛 常见问题

### Q: 热更新不生效？

```bash
# 重启开发服务器
# 清理缓存
rm -rf node_modules/.vite
```

### Q: 找不到模块？

```bash
# 检查 alias 配置
# 确保依赖已安装
npm install
```

### Q: 构建失败？

```bash
# 检查类型错误
npm run type-check

# 检查代码规范
npm run lint

# 清理后重新构建
npm run clean
npm run build
```

## 🎉 总结

所有示例项目已完整配置 Vite，包括：

✅ 完整的 Vite 配置  
✅ Alias 映射源代码  
✅ 热更新支持  
✅ 便捷的 NPM Scripts  
✅ 自动化测试脚本  
✅ 详细的文档说明  

**现在可以开始愉快地开发了！** 🚀

---

**更新时间**: 2025-01-20  
**文档版本**: 1.0.0


