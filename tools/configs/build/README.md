# 📦 Rollup 构建配置

这个目录包含了项目的 Rollup 构建配置，提供了统一的构建标准和简洁的配置模板。

## 🏗️ 文件结构

```
tools/configs/build/
├── rollup.config.base.js      # 基础配置，包含所有核心逻辑
├── rollup.config.template.js  # 配置模板，提供简洁的预设
└── README.md                  # 使用指南
```

## 🚀 快速开始

### 1. Vue 组件包（推荐）

适用于 Vue 组件库，自动排除 UMD 构建以避免代码分割问题：

```javascript
// packages/your-vue-package/rollup.config.js
import { createVueConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createVueConfig(import.meta.url, {
  globalName: 'YourPackageName',
  globals: {
    'vue': 'Vue'
  }
})
```

### 2. 基础工具包

适用于大多数工具包和库，构建 ES 和 CJS 格式：

```javascript
// packages/your-package/rollup.config.js
import { createBasicConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createBasicConfig(import.meta.url, {
  external: ['lodash', 'axios'],
  globalName: 'YourPackageName'
})
```

### 3. 完整包配置

需要在浏览器中直接使用的包，包含 ES、CJS 和 UMD 格式：

```javascript
// packages/your-browser-package/rollup.config.js
import { createFullConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createFullConfig(import.meta.url, {
  globalName: 'YourPackageName',
  globals: {
    'lodash': '_'
  }
})
```

### 4. 现代项目工具包

只需要 ES 模块的现代项目：

```javascript
// packages/your-modern-package/rollup.config.js
import { createModernConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createModernConfig(import.meta.url)
```

### 5. Node.js 专用包

只构建 CommonJS 格式：

```javascript
// packages/your-node-package/rollup.config.js
import { createNodeConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createNodeConfig(import.meta.url, {
  external: ['fs', 'path', 'child_process']
})
```

## ⚙️ 配置选项

所有模板都支持以下配置选项：

```javascript
{
  // 外部依赖（不会被打包）
  external: ['vue', 'lodash'],
  
  // UMD 全局变量名
  globalName: 'YourPackageName',
  
  // UMD 全局变量映射
  globals: {
    'vue': 'Vue',
    'lodash': '_'
  },
  
  // 是否启用 Vue 支持
  vue: true,
  
  // 构建格式
  formats: ['es', 'cjs', 'umd'],
  
  // 是否包含 UMD 构建
  includeUmd: true
}
```

## 🎯 构建输出

每种配置会生成以下文件：

### ES 模块 (`es/` 目录)
- 保持源码目录结构
- 支持 Tree Shaking
- 现代项目首选

### CommonJS (`lib/` 目录)
- Node.js 兼容
- 保持源码目录结构
- 传统项目支持

### UMD (`dist/` 目录)
- 浏览器直接使用
- 包含压缩版本
- 全局变量访问

### TypeScript 声明 (`types/` 和 `dist/`)
- 完整类型支持
- IDE 智能提示
- 类型安全

## 🔧 高级用法

### 自定义配置

如果预设模板不满足需求，可以使用自定义配置：

```javascript
import { createCustomConfig } from '../../tools/configs/build/rollup.config.template.js'

export default createCustomConfig(import.meta.url, {
  formats: ['es'], // 只构建 ES 模块
  external: ['vue', 'react'], // 同时支持 Vue 和 React
  vue: true,
  // 其他自定义选项...
})
```

### 直接使用基础配置

需要完全控制时，可以直接使用基础配置：

```javascript
import { createRollupConfig } from '../../tools/configs/build/rollup.config.base.js'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default createRollupConfig({
  packageDir: __dirname,
  // 完全自定义的配置...
})
```

## ✨ 特性

- ✅ **零配置**: 开箱即用的预设模板
- ✅ **TypeScript**: 完整的类型支持
- ✅ **Vue 支持**: 自动处理 Vue SFC
- ✅ **代码分割**: 智能的模块分割
- ✅ **Tree Shaking**: 支持摇树优化
- ✅ **Source Maps**: 调试友好
- ✅ **压缩优化**: 生产环境优化
- ✅ **警告过滤**: 清洁的构建输出

## 🚨 注意事项

1. **Vue 包建议使用 `createVueConfig`**，它会自动排除 UMD 构建以避免代码分割问题
2. **外部依赖要正确配置**，避免将第三方库打包进来
3. **UMD 全局变量名要唯一**，避免命名冲突
4. **构建前确保 TypeScript 编译通过**

## 📚 示例

查看 `packages/template/rollup.config.js` 了解实际使用示例。

---

如有问题或建议，请提交 Issue 或 PR！
