# LDesign 构建指南

本文档说明如何构建 LDesign 项目的所有包。

## 📦 项目结构

LDesign 是一个 monorepo 项目，包含以下子项目：

```
ldesign/
├── packages/          # 核心包
│   ├── kit/          # Node.js 工具库（优先级）
│   ├── builder/      # 构建工具（优先级）
│   ├── launcher/     # 启动器（优先级）
│   ├── webcomponent/ # Web Components（特殊）
│   ├── api/          # 标准包
│   ├── cache/        # 标准包
│   └── ...           # 其他标准包
└── library/          # 组件库
    ├── cropper/
    ├── editor/
    ├── flowchart/
    └── ...
```

## 🚀 快速开始

### 一键构建所有项目

```bash
# 使用 pnpm 脚本（推荐）
pnpm build:all

# 或直接运行 TypeScript 脚本
tsx scripts/build-all.ts

# Windows PowerShell
.\scripts\build-all.ps1
```

### 清理后重新构建

```bash
pnpm build:all:clean
```

### 查看详细构建信息

```bash
pnpm build:all:verbose
```

### 模拟运行（不实际构建）

```bash
pnpm build:all:dry
```

## 📋 可用的构建命令

在项目根目录运行以下命令：

| 命令 | 说明 |
|------|------|
| `pnpm build:all` | 构建所有包 |
| `pnpm build:all:clean` | 清理后构建所有包 |
| `pnpm build:all:verbose` | 详细输出模式构建 |
| `pnpm build:all:dry` | 模拟运行，不实际构建 |

## 🏗️ 构建流程

### 1. 优先级包（按顺序构建）

以下包必须优先构建，因为其他包依赖它们：

1. **@ldesign/kit** - Node.js 工具库
   - 构建工具: tsup
   - 产物: `dist/`

2. **@ldesign/builder** - 构建工具
   - 构建工具: tsup
   - 产物: `dist/`

3. **@ldesign/launcher** - 启动器
   - 构建工具: tsup
   - 产物: `dist/`

⚠️ **重要**: 如果任一优先级包构建失败，整个构建会立即终止。

### 2. 特殊包

- **@ldesign/webcomponent** - Web Components
  - 构建工具: Stencil
  - 产物: `dist/`, `loader/`

### 3. 标准 packages

使用 @ldesign/builder 构建的标准包：

- api, cache, color, crypto, device, engine
- http, i18n, router, shared, size, store, template

产物结构：
```
es/           # ESM 格式 + TypeScript 类型
lib/          # CommonJS 格式 + TypeScript 类型
dist/         # UMD 格式（压缩）
```

### 4. Library 项目

library 目录下的组件库项目：

- cropper, editor, flowchart, form, pdf, qrcode

产物结构同标准 packages。

## 🔍 产物验证

构建脚本会自动验证以下产物：

### 优先级包
- ✅ `dist/` 目录存在

### 标准包 & Library 项目
- ✅ `es/` 目录存在（ESM 格式）
- ✅ `lib/` 目录存在（CommonJS 格式）
- ✅ `dist/` 目录存在（UMD 格式）

### webcomponent
- ✅ `dist/` 目录存在
- ✅ `loader/` 目录存在

## 📊 构建报告

构建完成后，脚本会生成详细报告：

```
================================================================================
构建结果汇总
================================================================================

优先级包:
────────────────────────────────────────────────────────────────────────────────
✅ @ldesign/kit
   状态: SUCCESS
   耗时: 12.35s
   产物: 1/1

✅ @ldesign/builder
   状态: SUCCESS
   耗时: 18.72s
   产物: 1/1

...

================================================================================
统计信息
================================================================================
总计包数: 24
✅ 成功: 24
❌ 失败: 0

总耗时: 5m 32s

🎉 所有项目构建成功！
```

## 🛠️ 单独构建某个包

如果只需要构建某个特定的包：

```bash
# 进入包目录
cd packages/api

# 执行构建
pnpm build
```

## 🔧 配置文件

不同类型的包使用不同的配置文件：

### 优先级包（kit, builder, launcher）

配置文件：`tsup.config.ts`

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  // ...
})
```

### 标准包 & Library 项目

配置文件：`.ldesign/builder.config.ts`

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  dts: true,
  sourcemap: true,
  clean: true,
  umd: {
    enabled: true,
    minify: true,
    fileName: 'index.js'
  },
  // ...
})
```

详细配置请参考：[Builder 配置模板](packages/.ldesign-builder-config-template.md)

### webcomponent

配置文件：`stencil.config.ts`

```typescript
import { Config } from '@stencil/core'

export const config: Config = {
  namespace: 'ldesign-webcomponent',
  outputTargets: [
    // ...
  ]
}
```

## 📚 相关文档

- [构建脚本 README](scripts/README.md) - 详细的脚本使用说明
- [快速开始指南](scripts/QUICK_START.md) - 快速上手指南
- [Builder 配置模板](packages/.ldesign-builder-config-template.md) - 标准配置模板
- [Builder 规范化报告](packages/BUILDER_STANDARDIZATION_REPORT.md) - 打包流程规范化说明

## ❓ 常见问题

### tsx 命令未找到？

安装 tsx：

```bash
pnpm add -g tsx
# 或在项目中安装
pnpm add -D tsx
```

### 某个包构建失败？

1. 查看错误信息
2. 使用 `--verbose` 查看详细信息：
   ```bash
   pnpm build:all:verbose
   ```
3. 单独构建该包以获取更多信息：
   ```bash
   cd packages/包名
   pnpm build
   ```

### 产物验证失败？

检查配置文件：
- 标准包：`.ldesign/builder.config.ts`
- 确保 `dts: true` 和 `umd.enabled: true`

### 构建太慢？

- 避免频繁使用 `--clean` 选项
- 使用单独构建而不是全量构建
- 确保系统有足够的资源

### 如何添加新包？

1. 在 `packages/` 或 `library/` 创建新包目录
2. 添加 `package.json` 和构建配置
3. 定义 `build` 脚本
4. 运行 `pnpm build:all` 自动检测并构建

脚本会自动检测新包并加入构建流程。

## 🚨 故障排查

### 依赖问题

```bash
# 重新安装所有依赖
pnpm install

# 清理依赖后重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### 缓存问题

```bash
# 清理所有产物
pnpm build:all:clean

# 手动清理特定包
cd packages/包名
rimraf es lib dist
pnpm build
```

### 类型检查失败

```bash
# 运行类型检查
cd packages/包名
pnpm type-check
```

## 💻 开发工作流

### 日常开发

```bash
# 1. 修改代码
# 2. 构建修改的包
cd packages/modified-package
pnpm build

# 3. 或构建所有依赖该包的项目
pnpm build:all
```

### 发布前

```bash
# 1. 清理后完整构建
pnpm build:all:clean

# 2. 运行测试
pnpm test

# 3. 验证产物
pnpm build:all:verbose
```

### CI/CD

```yaml
# .github/workflows/build.yml
- name: Build all packages
  run: pnpm build:all:clean --verbose
```

## 📈 性能优化

### 并行构建

目前脚本按顺序构建所有包。未来版本可能支持并行构建非依赖包。

### 增量构建

避免使用 `--clean` 选项可以利用增量构建加快速度。

### 缓存

构建工具（tsup、builder、Stencil）都支持缓存。确保不要频繁删除缓存目录。

## 🎯 最佳实践

1. **优先级包失败立即修复** - 因为其他包依赖它们
2. **使用 dry-run 预览** - 在大规模构建前先查看计划
3. **定期清理构建** - 避免缓存导致的问题
4. **验证产物完整性** - 使用 `--verbose` 检查所有产物
5. **配置标准化** - 遵循配置模板，保持一致性

---

**维护者**: LDesign Team  
**最后更新**: 2025-10-11  

有问题？查看 [scripts/README.md](scripts/README.md) 或提交 Issue。
