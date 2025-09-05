# @ldesign/builder 示例项目

这个目录包含了使用 @ldesign/builder 构建不同类型项目的完整示例，展示了各种库类型的最佳实践和配置方法。

## 📁 示例列表

### 1. TypeScript 工具库 (`typescript-utils/`)

展示如何构建纯 TypeScript 工具库，包含：
- 完整的类型定义和接口
- 工具函数和类的导出
- 常量和枚举定义
- ESM/CJS 双格式输出
- 自动生成 TypeScript 声明文件

**特性：**
- ✅ TypeScript 严格模式
- ✅ 完整类型声明文件
- ✅ 多格式输出 (ESM/CJS)
- ✅ Source Map 支持
- ✅ Tree Shaking 优化

**包含内容：**
- 用户管理器类 (`UserManager`)
- 事件发射器 (`EventEmitter`)
- 工具函数 (验证、格式化、防抖节流等)
- 完整的类型定义

**运行示例：**
```bash
cd typescript-utils
pnpm install
pnpm build
```

### 2. Vue 3 组件库 (`vue3-components/`)

展示如何构建 Vue 3 组件库，包含：
- Vue 3 SFC 单文件组件
- TypeScript + Composition API
- 样式提取和压缩
- 组件类型定义导出
- 插件式安装支持

**特性：**
- ✅ Vue 3 SFC 完整支持
- ✅ TypeScript 集成
- ✅ CSS 样式自动提取
- ✅ 组件 Props/Emits 类型定义
- ✅ 插件安装方式 (`app.use()`)

**包含组件：**
- Button 按钮组件 (多种类型、尺寸、状态)
- Input 输入框组件 (验证、清空、密码显示)
- Card 卡片组件 (标题、内容、操作区域)

**运行示例：**
```bash
cd vue3-components
pnpm install
pnpm build
```

### 3. React 组件库 (`react-components/`)

展示如何构建 React 组件库，包含：
- React 函数组件 + TypeScript
- forwardRef 和 Hooks 使用
- CSS 样式模块化
- 完整的 Props 类型定义

**特性：**
- ✅ React 18+ 支持
- ✅ TypeScript 严格类型检查
- ✅ forwardRef 引用转发
- ✅ CSS 样式提取
- ✅ 完整的 Props 接口定义

**包含组件：**
- Button 按钮组件 (变体、尺寸、加载状态)
- Input 输入框组件 (标签、验证、前后缀)

**运行示例：**
```bash
cd react-components
pnpm install
pnpm build
```

### 4. CSS/Less 样式库 (`style-library/`)

展示如何构建完整的样式库，包含：
- Less 预处理器支持
- 设计系统变量定义
- 通用 Mixins 和工具类
- 组件样式和原子化 CSS

**特性：**
- ✅ Less 预处理器
- ✅ 设计系统变量
- ✅ 响应式 Mixins
- ✅ 原子化工具类
- ✅ 组件样式库

**包含内容：**
- 完整的设计系统变量 (颜色、尺寸、间距等)
- 通用 Mixins (布局、动画、响应式等)
- 组件样式 (按钮、输入框等)
- 工具类 (间距、文本、布局等)

**运行示例：**
```bash
cd style-library
pnpm install
pnpm build
```

### 5. 混合类型库 (`mixed-library/`)

展示如何构建包含多种文件类型的复杂库，包含：
- TypeScript 工具函数模块
- DOM 组件类 (原生 JavaScript)
- Less 样式文件
- 完整的类型定义

**特性：**
- ✅ 多种文件类型混合
- ✅ 模块化架构设计
- ✅ TypeScript + Less 集成
- ✅ DOM 操作组件
- ✅ 完整的 API 设计

**包含模块：**
- 工具函数模块 (字符串、数字、日期、验证、存储)
- 组件模块 (Toast、Modal、Loading)
- 样式模块 (组件样式和动画)

**运行示例：**
```bash
cd mixed-library
pnpm install
pnpm build
```

## 🚀 快速开始

### 1. 环境准备

确保你的开发环境满足以下要求：

```bash
# Node.js 版本
node --version  # >= 16.0.0

# 包管理器
pnpm --version  # 推荐使用 pnpm
```

### 2. 克隆项目

```bash
# 克隆整个项目
git clone https://github.com/ldesign/builder.git
cd builder/packages/builder/examples

# 或者只下载示例目录
# 下载后进入 examples 目录
```

### 3. 安装依赖

```bash
# 在项目根目录安装所有依赖
cd ../../../  # 回到项目根目录
pnpm install

# 或者在单个示例中安装
cd packages/builder/examples/typescript-utils
pnpm install
```

### 4. 运行示例

选择一个示例项目开始：

```bash
# TypeScript 工具库
cd typescript-utils
pnpm build
pnpm dev    # 监听模式

# Vue 3 组件库
cd vue3-components
pnpm build
pnpm analyze  # 分析构建结果

# React 组件库
cd react-components
pnpm build

# 样式库
cd style-library
pnpm build

# 混合类型库
cd mixed-library
pnpm build
```

## 📖 学习路径

### 🔰 初学者路径

1. **从 TypeScript 工具库开始** (`typescript-utils/`)
   - 了解基础的构建配置
   - 学习 `ldesign.config.ts` 的作用
   - 理解输出格式和类型声明

2. **查看配置文件对比**
   - 对比不同示例的配置差异
   - 理解 `libraryType` 的作用
   - 学习各种配置选项

3. **运行构建命令**
   - 执行 `pnpm build` 观察输出
   - 查看 `dist/` 目录的生成文件
   - 理解不同格式的用途

### 🚀 进阶用户路径

1. **Vue/React 组件库** (`vue3-components/`, `react-components/`)
   - 学习框架特定的配置
   - 理解样式提取和处理
   - 掌握组件类型定义

2. **样式库构建** (`style-library/`)
   - 学习 Less/Sass 预处理
   - 理解设计系统架构
   - 掌握样式优化技巧

3. **自定义配置实验**
   - 修改配置文件观察变化
   - 尝试不同的输出格式
   - 实验性能优化选项

### 🎯 高级用户路径

1. **混合类型库** (`mixed-library/`)
   - 理解复杂项目架构
   - 学习模块化设计
   - 掌握多文件类型处理

2. **创建自定义示例**
   - 基于现有示例创建新项目
   - 集成第三方库和工具
   - 优化构建性能

3. **扩展和定制**
   - 开发自定义插件
   - 创建项目模板
   - 集成 CI/CD 流程

## ⚙️ 配置说明

### 基础配置结构

所有示例都使用统一的配置文件结构：

```typescript
// ldesign.config.ts
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true
  },

  // 库类型（自动应用相应策略）
  libraryType: 'typescript', // 或 'vue3', 'style', 'mixed'

  // 打包器选择
  bundler: 'rollup', // 或 'rolldown'
})
```

### 库类型对比

| 库类型 | 适用场景 | 主要特性 | 示例项目 |
|--------|----------|----------|----------|
| `typescript` | 纯 TS/JS 库 | 类型声明、Tree Shaking | `typescript-utils` |
| `vue3` | Vue 3 组件库 | SFC 编译、样式提取 | `vue3-components` |
| `style` | 样式库 | 预处理器、压缩 | `style-library` |
| `mixed` | 复杂混合库 | 多文件类型支持 | `mixed-library` |

### 高级配置选项

```typescript
export default defineConfig({
  // ... 基础配置

  // TypeScript 配置
  typescript: {
    declaration: true,
    declarationDir: 'dist',
    target: 'ES2020'
  },

  // 样式配置
  style: {
    extract: true,
    minimize: true,
    autoprefixer: true
  },

  // 性能配置
  performance: {
    treeshaking: true,
    minify: true,
    bundleAnalyzer: false
  },

  // 外部依赖
  external: ['vue', 'react'],

  // 全局变量
  globals: {
    vue: 'Vue',
    react: 'React'
  }
})
```

## 📊 构建输出说明

### 文件结构

构建完成后，每个示例都会在 `dist/` 目录生成相应文件：

#### TypeScript 库输出
```
dist/
├── index.js          # ESM 格式
├── index.cjs         # CJS 格式
├── index.d.ts        # TypeScript 声明文件
├── index.js.map      # ESM Source Map
└── index.cjs.map     # CJS Source Map
```

#### Vue/React 组件库输出
```
dist/
├── index.js          # ESM 格式
├── index.cjs         # CJS 格式
├── index.d.ts        # TypeScript 声明文件
├── style.css         # 提取的样式文件
├── index.js.map      # ESM Source Map
├── index.cjs.map     # CJS Source Map
└── style.css.map     # CSS Source Map
```

#### 样式库输出
```
dist/
├── index.css         # 编译后的 CSS
├── components.css    # 组件样式
├── utilities.css     # 工具类样式
├── variables.css     # CSS 变量
└── index.css.map     # CSS Source Map
```

### package.json 配置

每个示例的 `package.json` 都配置了正确的导出字段：

```json
{
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./style": "./dist/style.css"
  }
}
```

## 🛠️ 开发工具和命令

### 通用命令

每个示例都提供了以下 npm scripts：

```json
{
  "scripts": {
    "build": "ldesign-builder build",      // 构建项目
    "dev": "ldesign-builder watch",        // 监听模式
    "clean": "ldesign-builder clean",      // 清理输出
    "analyze": "ldesign-builder analyze"   // 分析构建结果
  }
}
```

### 调试技巧

1. **使用监听模式**
   ```bash
   pnpm dev
   # 文件变化时自动重新构建
   ```

2. **查看构建分析**
   ```bash
   pnpm analyze
   # 分析包大小和依赖关系
   ```

3. **检查输出文件**
   ```bash
   # 查看生成的文件
   ls -la dist/

   # 检查文件内容
   cat dist/index.js
   ```

4. **使用 Source Map**
   - 在浏览器开发者工具中调试原始代码
   - 支持断点调试和错误追踪

## 🤝 贡献指南

### 添加新示例

1. **创建项目目录**
   ```bash
   mkdir packages/builder/examples/your-example
   cd packages/builder/examples/your-example
   ```

2. **添加必要文件**
   - `package.json` - 项目配置
   - `ldesign.config.ts` - 构建配置
   - `tsconfig.json` - TypeScript 配置（如需要）
   - `src/` - 源代码目录
   - `README.md` - 项目说明

3. **更新文档**
   - 在本 README 中添加新示例说明
   - 提供清晰的使用指南

### 改进现有示例

1. **Fork 项目**
2. **创建功能分支**
3. **提交改进**
4. **发起 Pull Request**

### 代码规范

- 使用 TypeScript 编写代码
- 遵循项目的 ESLint 配置
- 添加适当的注释和文档
- 确保所有示例都能成功构建

## 📚 相关资源

- [完整文档](../docs/index.md)
- [API 参考](../docs/api.md)
- [配置指南](../docs/configuration.md)
- [GitHub 仓库](https://github.com/ldesign/builder)
- [更新日志](../CHANGELOG.md)

## ❓ 常见问题

### Q: 如何选择合适的库类型？

A: 根据项目内容选择：
- `typescript` - 纯 TypeScript/JavaScript 库
- `vue3` - Vue 3 组件库
- `style` - 样式库
- `mixed` - 混合类型项目

### Q: 如何自定义构建配置？

A: 修改 `ldesign.config.ts` 文件，参考[配置文档](../docs/configuration.md)。

### Q: 如何处理外部依赖？

A: 在配置中使用 `external` 字段排除不需要打包的依赖：

```typescript
export default defineConfig({
  external: ['vue', 'react', 'lodash']
})
```

### Q: 如何优化构建性能？

A: 启用性能优化选项：

```typescript
export default defineConfig({
  performance: {
    treeshaking: true,
    minify: true,
    bundleAnalyzer: true  // 分析包大小
  }
})
```

### Q: 如何添加自定义插件？

A: 在配置中添加插件：

```typescript
export default defineConfig({
  plugins: [
    // 自定义插件
  ]
})
```

### Q: 构建失败怎么办？

A: 检查以下几点：
1. 确保所有依赖已安装
2. 检查 TypeScript 配置
3. 查看错误日志
4. 验证入口文件路径
5. 检查外部依赖配置

## 📄 许可证

[MIT License](https://github.com/ldesign/builder/blob/main/LICENSE)
```
