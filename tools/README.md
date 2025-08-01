# 🛠️ LDesign 开发工具

这个目录包含了 LDesign 项目的所有开发工具和配置文件，按功能组织，使用 TypeScript 编写，支持 ESM 模块格式。

## 📁 目录结构

```
tools/
├── build/                  # 🏗️ 构建相关工具
│   ├── rollup.config.base.ts    # Rollup 基础配置
│   └── tsconfig.base.json       # TypeScript 基础配置
├── test/                   # 🧪 测试相关工具
│   ├── vitest.config.base.ts    # Vitest 基础配置
│   └── playwright.config.base.ts # Playwright 基础配置
├── package/                # 📦 包管理工具
│   ├── create-package.ts        # 创建新包工具
│   └── standardize-packages.ts  # 标准化包配置工具
├── release/                # 🚀 发布相关工具
│   └── version-manager.ts       # 版本管理和发布工具
├── templates/              # 📋 模板文件
│   └── package-template.json    # 包配置模板
└── README.md              # 📚 本文档
```

## 🏗️ 构建工具 (build/)

### rollup.config.base.ts

统一的 Rollup 构建配置，支持多种输出格式。

**功能特性：**

- 🎯 多格式输出：ESM、CJS、UMD
- 📦 保持模块结构
- 🔧 TypeScript 支持
- 🌟 Vue 集成支持
- 📝 自动生成类型定义

**使用方法：**

```typescript
import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ['vue'],
  globalName: 'LDesignPackage',
  globals: { vue: 'Vue' },
  vue: true
})
```

**参数说明：**

- `packageDir`: 包目录路径（默认：当前目录）
- `external`: 外部依赖数组
- `globalName`: UMD 全局变量名
- `globals`: UMD 全局变量映射
- `vue`: 是否启用 Vue 支持

### tsconfig.base.json

TypeScript 基础配置，所有包都应该继承此配置。

**特性：**

- 🎯 ES2020 目标
- 📦 ESNext 模块
- 🔧 严格模式
- 📝 声明文件生成
- 🌟 Vue JSX 支持

## 🧪 测试工具 (test/)

### vitest.config.base.ts

统一的 Vitest 测试配置。

**功能特性：**

- 🌐 多环境支持：jsdom、happy-dom、node
- 🌟 Vue 组件测试
- 📊 代码覆盖率
- 🔧 自定义设置文件
- 📝 TypeScript 支持

**使用方法：**

```typescript
import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'jsdom',
  setupFiles: ['tests/setup.ts']
})
```

**参数说明：**

- `packageDir`: 包目录路径
- `vue`: 是否启用 Vue 支持
- `environment`: 测试环境
- `setupFiles`: 设置文件数组
- `alias`: 路径别名配置
- `coverage`: 覆盖率配置

### playwright.config.base.ts

统一的 Playwright E2E 测试配置。

**功能特性：**

- 🌐 多浏览器支持
- 📱 移动端测试
- 🎥 视频录制
- 📸 截图功能
- 🔄 自动重试

**使用方法：**

```typescript
import { createPlaywrightConfig } from '../../tools/test/playwright.config.base'

export default createPlaywrightConfig({
  webServer: {
    command: 'pnpm dev',
    port: 5173
  }
})
```

**参数说明：**

- `testDir`: 测试目录
- `baseURL`: 基础 URL
- `webServer`: 开发服务器配置
- `projects`: 测试项目（浏览器）
- `retries`: 重试次数
- `workers`: 并发数

## 📦 包管理工具 (package/)

### create-package.ts

创建新包的工具，自动生成标准化的包结构。

**使用方法：**

```bash
# 创建基础包
tsx tools/package/create-package.ts my-package --description "我的包"

# 创建 Vue 包
tsx tools/package/create-package.ts my-vue-package --vue --description "我的Vue包"
```

**功能特性：**

- 📁 自动创建目录结构
- 📝 生成配置文件
- 🌟 Vue 集成支持
- 📚 自动生成文档
- 🔧 标准化脚本

**参数说明：**

- `packageName`: 包名（必需）
- `--vue`: 创建 Vue 包
- `--description`: 包描述
- `--template`: 模板类型

### standardize-packages.ts

标准化所有包的配置文件。

**使用方法：**

```bash
# 标准化所有包
tsx tools/package/standardize-packages.ts

# 标准化特定包
tsx tools/package/standardize-packages.ts engine
```

**功能特性：**

- 🔧 统一配置文件
- 📁 确保目录结构
- 📝 标准化脚本
- 🔄 批量处理

## 🚀 发布工具 (release/)

### version-manager.ts

版本管理和发布工具。

**使用方法：**

```bash
# 正式发布
tsx tools/release/version-manager.ts

# Beta 发布
tsx tools/release/version-manager.ts beta

# Alpha 发布
tsx tools/release/version-manager.ts alpha

# 干运行模式
tsx tools/release/version-manager.ts --dry-run

# 跳过测试
tsx tools/release/version-manager.ts --skip-tests
```

**功能特性：**

- 🔍 工作目录检查
- 🧪 自动测试
- 🏗️ 自动构建
- 📦 版本管理
- 🚀 自动发布
- 🔄 Git 操作

**参数说明：**

- `stable`: 正式发布（默认）
- `beta`: Beta 发布
- `alpha`: Alpha 发布
- `--skip-tests`: 跳过测试
- `--skip-build`: 跳过构建
- `--dry-run`: 干运行模式

## 📋 模板文件 (templates/)

### package-template.json

新包的 package.json 模板文件。

**模板变量：**

- `{{PACKAGE_NAME}}`: 包名
- `{{PACKAGE_DESCRIPTION}}`: 包描述
- `{{AUTHOR}}`: 作者
- `{{LICENSE}}`: 许可证

## 🚀 快速开始

### 1. 创建新包

```bash
tsx tools/package/create-package.ts my-package --vue --description "我的新包"
```

### 2. 标准化配置

```bash
tsx tools/package/standardize-packages.ts
```

### 3. 发布包

```bash
# 添加变更集
pnpm changeset

# 发布
tsx tools/release/version-manager.ts
```

## 🔧 依赖关系

所有工具都依赖以下核心包：

- `tsx`: TypeScript 执行器
- `@rollup/plugin-*`: Rollup 插件
- `vitest`: 测试框架
- `@playwright/test`: E2E 测试
- `@changesets/cli`: 版本管理

## 📝 开发规范

1. **TypeScript 优先**: 所有工具使用 TypeScript 编写
2. **ESM 模块**: 使用 ES 模块格式
3. **类型安全**: 提供完整的类型定义
4. **错误处理**: 完善的错误处理和日志
5. **文档完整**: 详细的使用说明和示例

## 🤝 贡献指南

1. 遵循现有的代码风格
2. 添加适当的类型定义
3. 编写测试用例
4. 更新相关文档
5. 确保向后兼容性

## 📄 许可证

MIT © LDesign Team
