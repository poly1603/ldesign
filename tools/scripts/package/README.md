# 📦 LDesign 包创建工具

一个强大的自动化工具，用于快速创建符合 LDesign 规范的新包。

## 🚀 快速开始

### 基本用法

```bash
# 创建基础包
npx tsx tools/package/create-package.ts my-package

# 创建Vue集成包
npx tsx tools/package/create-package.ts my-vue-package --vue

# 创建带自定义描述的包
npx tsx tools/package/create-package.ts my-package --description "我的自定义包"
```

### 命令行选项

| 选项            | 描述                                     | 默认值                     |
| --------------- | ---------------------------------------- | -------------------------- |
| `--vue`         | 创建 Vue 集成包，包含 Vue 插件和组件支持 | `false`                    |
| `--description` | 包的描述信息                             | `"LDesign {包名} package"` |

## 📁 生成的包结构

### 基础包结构

```
my-package/
├── src/
│   ├── index.ts          # 主入口文件
│   ├── types/
│   │   └── index.ts      # 类型定义
│   └── utils/
│       └── index.ts      # 工具函数
├── __tests__/            # 单元测试
├── e2e/                  # E2E测试
├── docs/                 # 文档
├── examples/             # 示例代码
├── package.json          # 包配置
├── tsconfig.json         # TypeScript配置
├── rollup.config.js      # 构建配置
├── vitest.config.ts      # 测试配置
├── playwright.config.ts  # E2E测试配置
├── eslint.config.js      # 代码规范配置
└── README.md             # 说明文档
```

### Vue 包额外结构

Vue 包在基础结构上增加：

```
my-vue-package/
├── src/
│   ├── core/
│   │   └── index.ts      # 核心类和逻辑
│   └── vue/
│       └── index.ts      # Vue插件集成
└── ...
```

## 🔧 生成的配置

### package.json 特性

- ✅ **完整的脚本命令** - 构建、测试、开发、部署等
- ✅ **多格式输出** - ESM、CommonJS、UMD、类型定义
- ✅ **现代化配置** - 支持 Tree Shaking、Source Map
- ✅ **质量工具** - ESLint、Prettier、Size Limit
- ✅ **自动化部署** - 内置部署脚本

### 构建配置

- **ESM 格式** (`es/`) - 现代浏览器和打包工具
- **CommonJS 格式** (`lib/`) - Node.js 兼容
- **UMD 格式** (`dist/`) - 浏览器直接使用
- **类型定义** (`types/`) - TypeScript 支持

### 开发工具

- **TypeScript** - 严格类型检查
- **Vitest** - 快速单元测试
- **Playwright** - 可靠的 E2E 测试
- **ESLint** - 代码质量检查
- **Size Limit** - 包大小监控

## 🎯 使用示例

### 创建工具包

```bash
# 创建一个工具包
npx tsx tools/package/create-package.ts utils --description "通用工具函数库"

cd packages/utils
pnpm install
pnpm dev
```

### 创建 Vue 组件包

```bash
# 创建Vue组件包
npx tsx tools/package/create-package.ts button --vue --description "按钮组件"

cd packages/button
pnpm install
pnpm dev
```

### 创建业务包

```bash
# 创建业务逻辑包
npx tsx tools/package/create-package.ts auth --description "认证授权模块"

cd packages/auth
pnpm install
pnpm build
pnpm test
```

## 📝 开发流程

### 1. 创建包

```bash
npx tsx tools/package/create-package.ts my-package --vue
```

### 2. 安装依赖

```bash
cd packages/my-package
pnpm install
```

### 3. 开发

```bash
# 开发模式（监听文件变化）
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

### 4. 测试

```bash
# 单元测试
pnpm test

# E2E测试
pnpm test:e2e

# 测试覆盖率
pnpm test:coverage
```

### 5. 发布

```bash
# 构建并发布
pnpm deploy

# 发布Beta版本
pnpm deploy:beta

# 干运行（不实际发布）
pnpm deploy:dry-run
```

## 🔍 生成的代码模板

### 基础包模板

```typescript
// src/index.ts
export * from './types'
export * from './utils'

// Main functionality
export function myPackage() {
  console.log('My Package Description')
}

export default {
  myPackage,
}
```

### Vue 包模板

```typescript
// src/core/index.ts
// src/vue/index.ts
import type { App } from 'vue'

export class MyVuePackage {
  private options: MyVuePackageOptions

  constructor(options: MyVuePackageOptions = {}) {
    this.options = options
  }

  public init(): void {
    console.log('MyVuePackage initialized')
  }
}

export function install(app: App, options?: MyVuePackageOptions) {
  // Vue 插件安装逻辑
}

export default {
  install,
}
```

## ⚡ 高级特性

### 自动化配置

- **统一的构建配置** - 基于共享的 rollup 配置
- **一致的代码规范** - 统一的 ESLint 和 Prettier 配置
- **标准化测试** - 预配置的测试环境
- **自动化部署** - 内置的发布流程

### 质量保证

- **TypeScript 严格模式** - 确保类型安全
- **100%测试覆盖率目标** - 预配置测试工具
- **代码质量检查** - ESLint 规则
- **包大小监控** - Size Limit 配置

### 开发体验

- **热重载开发** - 文件变化自动重新构建
- **智能提示** - 完整的 TypeScript 类型定义
- **调试支持** - Source Map 配置
- **文档生成** - VitePress 文档模板

## 🛠️ 自定义和扩展

### 修改模板

模板文件位于 `tools/templates/` 目录：

- `package-template.json` - package.json 模板
- 其他配置文件模板在 `createBasicFiles` 函数中定义

### 添加新的包类型

可以在 `create-package.ts` 中添加新的模板类型：

```typescript
export interface CreatePackageOptions {
  vue?: boolean
  template?: 'basic' | 'vue' | 'node' | 'react' // 添加新类型
  // ...
}
```

### 自定义构建配置

每个包都有独立的 `rollup.config.js`，可以根据需要自定义。

## 🎉 最佳实践

1. **命名规范** - 使用 kebab-case 命名包
2. **描述清晰** - 提供有意义的包描述
3. **测试优先** - 创建包后立即编写测试
4. **文档完善** - 更新 README 和 API 文档
5. **版本管理** - 遵循语义化版本规范

## 🔧 故障排除

### 常见问题

**Q: 创建的包无法构建？** A: 确保所有依赖都已安装，运行 `pnpm install`

**Q: TypeScript 类型错误？** A: 检查 `tsconfig.json` 配置，确保路径映射正确

**Q: 测试无法运行？** A: 确保测试文件在 `__tests__` 目录中，文件名以 `.test.ts` 结尾

**Q: 构建产物不正确？** A: 检查 `rollup.config.js` 配置，确保入口文件路径正确

### 获取帮助

- 查看现有包的实现作为参考
- 检查构建日志中的错误信息
- 确保 Node.js 和 pnpm 版本符合要求

---

🎯 **目标**: 让创建新包变得简单、快速、标准化！
