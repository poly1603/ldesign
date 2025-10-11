# 🚀 快速开始

## 安装依赖

确保已安装 tsx：

```bash
# 全局安装
pnpm add -g tsx

# 或在项目中安装
pnpm add -D tsx
```

## 基本用法

### 方式一：直接运行 TypeScript 脚本

```bash
# 从项目根目录运行
tsx scripts/build-all.ts
```

### 方式二：使用 PowerShell 包装脚本（Windows）

```powershell
# 从项目根目录运行
.\scripts\build-all.ps1

# 或带参数
.\scripts\build-all.ps1 -Clean -Verbose
```

### 方式三：使用 npm/pnpm 脚本（推荐）

在项目根目录的 `package.json` 中添加：

```json
{
  "scripts": {
    "build:all": "tsx scripts/build-all.ts",
    "build:all:clean": "tsx scripts/build-all.ts --clean",
    "build:all:verbose": "tsx scripts/build-all.ts --verbose",
    "build:all:dry": "tsx scripts/build-all.ts --dry-run"
  }
}
```

然后运行：

```bash
pnpm build:all
pnpm build:all:clean
pnpm build:all:verbose
```

## 常用命令

### 日常开发

```bash
# 构建所有项目
tsx scripts/build-all.ts

# 查看构建计划（不实际构建）
tsx scripts/build-all.ts --dry-run
```

### 完全重建

```bash
# 清理所有产物后重新构建
tsx scripts/build-all.ts --clean
```

### 调试构建问题

```bash
# 详细输出，查看每个步骤
tsx scripts/build-all.ts --verbose

# 清理 + 详细输出
tsx scripts/build-all.ts --clean --verbose
```

## 构建流程说明

### 1. 优先级包（按顺序）

这些包必须先构建，因为其他包依赖它们：

```
1. @ldesign/kit      → 工具库
2. @ldesign/builder  → 构建工具
3. @ldesign/launcher → 启动器
```

如果任一优先级包构建失败，整个构建会立即终止。

### 2. 特殊包

```
@ldesign/webcomponent → 使用 Stencil 构建
```

### 3. 标准 packages

```
api, cache, color, crypto, device, engine, 
http, i18n, router, shared, size, store, template
```

### 4. Library 项目

```
cropper, editor, flowchart, form, pdf, qrcode
```

## 预期产物

不同类型的包有不同的产物结构：

### 优先级包 (kit, builder, launcher)

```
dist/
├── index.js
├── index.cjs
├── index.d.ts
└── ...
```

### 标准包 & Library 项目

```
es/           # ESM 格式
├── index.js
├── index.d.ts
└── ...

lib/          # CommonJS 格式
├── index.cjs
├── index.d.ts
└── ...

dist/         # UMD 格式（压缩）
├── index.js
└── index.js.map
```

### webcomponent

```
dist/         # Stencil 打包产物
└── ...

loader/       # Web Components 加载器
└── ...
```

## 常见问题

### Q: tsx 命令未找到？

**A**: 安装 tsx:

```bash
pnpm add -g tsx
# 或
pnpm add -D tsx
```

### Q: 某个包构建失败？

**A**: 
1. 查看错误信息
2. 进入该包目录单独构建：
   ```bash
   cd packages/包名
   pnpm build
   ```
3. 使用 `--verbose` 查看详细信息

### Q: 如何只构建某些包？

**A**: 目前脚本构建所有包。如需单独构建，请进入对应包目录：

```bash
cd packages/api
pnpm build
```

### Q: 构建太慢？

**A**: 
- 确保没有运行 `--clean`（除非需要）
- 关闭不必要的后台程序
- 考虑增加系统资源

## 输出解读

### 成功输出

```
✅ @ldesign/api 构建成功 (12.35s)
   状态: SUCCESS
   耗时: 12.35s
   产物: 3/3  ← 所有产物都已生成
```

### 失败输出

```
❌ @ldesign/api 构建失败 (5.12s)
   状态: FAILED
   耗时: 5.12s
   产物: 1/3  ← 部分产物未生成
   错误: ...
```

### 警告输出

```
⚠️  @ldesign/api 构建完成但产物不完整 (12.35s)
   状态: SUCCESS
   耗时: 12.35s
   产物: 2/3  ← 缺少某些产物
```

## 进阶用法

### 自定义构建配置

如需修改某个包的构建配置，编辑对应的配置文件：

- 标准包：`packages/包名/.ldesign/builder.config.ts`
- kit/builder/launcher：`packages/包名/tsup.config.ts`
- webcomponent：`packages/webcomponent/stencil.config.ts`

### 添加新包

1. 在 `packages/` 或 `library/` 创建新包
2. 添加 `package.json` 和构建脚本
3. 运行 `tsx scripts/build-all.ts` 自动检测并构建

### 集成 CI/CD

```yaml
# .github/workflows/build.yml
name: Build All Packages

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build all packages
        run: tsx scripts/build-all.ts --clean --verbose
```

## 获取帮助

- 查看详细文档：`scripts/README.md`
- 查看脚本源码：`scripts/build-all.ts`
- 提交 Issue：https://github.com/ldesign/ldesign/issues

---

**提示**: 首次使用建议先运行 `tsx scripts/build-all.ts --dry-run` 查看构建计划！
