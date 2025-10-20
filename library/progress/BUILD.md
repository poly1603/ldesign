# 构建指南

## 环境要求

- Node.js >= 18
- pnpm >= 8

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 构建所有包

```bash
# 构建所有包
pnpm build

# 或使用构建脚本（包含测试）
pnpm build:all

# Windows
scripts\build-all.bat

# Linux/Mac
chmod +x scripts/build-all.sh
./scripts/build-all.sh
```

### 3. 构建单个包

```bash
# 构建核心包
pnpm build:core

# 构建 Vue 包
pnpm build:vue

# 构建 React 包
pnpm build:react

# 构建 Lit 包
pnpm build:lit
```

### 4. 测试构建

```bash
pnpm test:build
```

## 开发模式

### 启动示例项目

```bash
# 原生 JavaScript 示例（使用源码，带 Vite）
pnpm dev:vanilla

# Vue 示例（使用源码，带 Vite）
pnpm dev:vue

# React 示例（使用源码，带 Vite）
pnpm dev:react
```

示例项目使用 Vite 配置的路径别名，直接引用源码，无需构建即可开发。

### 开发所有包

```bash
# 启动所有包的 watch 模式
pnpm dev
```

## 构建产物

### 核心包 (@ldesign/progress-core)

```
packages/core/dist/
├── index.js          # CommonJS 格式
├── index.esm.js      # ESM 格式
├── index.umd.js      # UMD 格式
├── index.d.ts        # TypeScript 类型定义
├── index.css         # CSS 样式
└── *.map             # Source Maps
```

### Vue 包 (@ldesign/progress-vue)

```
packages/vue/dist/
├── index.js          # CommonJS 格式
├── index.esm.js      # ESM 格式
├── index.d.ts        # TypeScript 类型定义
└── *.map             # Source Maps
```

### React 包 (@ldesign/progress-react)

```
packages/react/dist/
├── index.js          # CommonJS 格式
├── index.esm.js      # ESM 格式
├── index.d.ts        # TypeScript 类型定义
└── *.map             # Source Maps
```

### Lit 包 (@ldesign/progress-lit)

```
packages/lit/dist/
├── index.js          # CommonJS 格式
├── index.esm.js      # ESM 格式
├── index.d.ts        # TypeScript 类型定义
└── *.map             # Source Maps
```

## 清理构建

```bash
# 清理所有构建产物
pnpm clean
```

## 构建流程

### 1. 核心包构建

核心包使用 Rollup 构建：

```bash
cd packages/core
pnpm build
```

构建步骤：
1. TypeScript 编译
2. 生成类型定义
3. 打包 ESM/CJS/UMD 格式
4. 处理 CSS
5. 代码压缩
6. 生成 Source Map

### 2. 框架包构建

框架包依赖核心包：

```bash
# 必须先构建核心包
pnpm build:core

# 然后构建框架包
pnpm build:vue
pnpm build:react
pnpm build:lit
```

或一次性构建所有：

```bash
pnpm build
```

## 构建验证

运行构建测试脚本：

```bash
pnpm test:build
```

该脚本会检查：
- ✅ 所有必要的文件是否存在
- ✅ 文件大小是否正常（非空）
- ✅ 输出文件大小统计

## 常见问题

### Q: 构建失败怎么办？

1. 清理并重新安装依赖：
```bash
pnpm clean
pnpm install
```

2. 按顺序构建：
```bash
pnpm build:core
pnpm build:vue
pnpm build:react
pnpm build:lit
```

### Q: 如何在开发时使用未构建的代码？

示例项目已配置 Vite 别名，直接引用源码：

```javascript
// vite.config.js
resolve: {
  alias: {
    '@ldesign/progress-core': resolve(__dirname, '../../packages/core/src/index.ts'),
    '@ldesign/progress-vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
  },
}
```

### Q: 如何调试构建问题？

1. 查看详细的构建输出
2. 检查 TypeScript 编译错误
3. 检查 Rollup 配置
4. 运行 `pnpm test:build` 查看详细信息

### Q: 构建速度慢怎么办？

1. 使用单个包构建而不是全部构建
2. 开发时使用 `pnpm dev` 的 watch 模式
3. 示例项目开发时不需要构建，直接使用源码

## 发布流程

准备发布到 NPM：

1. 确保所有包已构建：
```bash
pnpm build:all
```

2. 更新版本号：
```bash
# 在各个包的 package.json 中更新版本
```

3. 发布包：
```bash
cd packages/core
npm publish

cd ../vue
npm publish

cd ../react
npm publish

cd ../lit
npm publish
```

或使用 lerna/changesets 等工具进行统一发布。

## 持续集成

建议在 CI/CD 中添加：

```yaml
# .github/workflows/build.yml
- name: Install dependencies
  run: pnpm install

- name: Build all packages
  run: pnpm build:all

- name: Test build
  run: pnpm test:build
```

## 性能优化

### 构建性能

- 使用 Rollup 的并行构建
- 启用缓存
- 仅构建必要的格式

### 产物大小

- 启用代码压缩
- Tree-shaking
- 移除注释
- 使用生产环境构建

## 故障排除

### TypeScript 错误

```bash
# 检查类型
pnpm --filter @ldesign/progress-core exec tsc --noEmit
```

### 依赖问题

```bash
# 重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 构建缓存

```bash
# 清理所有缓存
pnpm clean
rm -rf packages/*/dist
```


