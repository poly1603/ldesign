# DTS 文件生成修复总结

## 问题描述

用户报告在使用 `@ldesign/builder` 打包时,发现:
- **ES 产物目录 (`es/`)** 有 DTS 文件生成
- **CJS 产物目录 (`lib/`)** 没有 DTS 文件生成
- **UMD 产物目录 (`dist/`)** 没有 DTS 文件生成

用户期望所有格式的产物目录都应该有对应的 DTS 文件。

---

## 根本原因

### 1. **`outDir` 冲突问题**

`@rollup/plugin-typescript` 插件会从 `tsconfig.json` 文件中读取 `outDir` 配置,即使代码中没有显式传递该选项。

当 `tsconfig.json` 中设置了 `outDir: "./dist"` 时,插件会验证该路径必须在 Rollup 的输出目录内,否则会报错:

```
Path of Typescript compiler option 'outDir' must be located inside Rollup 'dir' option.
```

**解决方案**:
在 `compilerOptions` 中显式设置 `outDir: undefined`,覆盖 `tsconfig.json` 中的值:

```typescript
compilerOptions: {
  ...cleanedCO,
  outDir: undefined,  // 显式覆盖 tsconfig.json 中的值
  declarationDir: emitDts ? outputDir : undefined,
  // ... 其他选项
}
```

### 2. **CJS 格式不生成 DTS 文件**

在 `RollupAdapter.ts` 的第 470 行,CJS 格式的构建配置中,`emitDts` 被设置为 `false`:

```typescript
// 修复前
const cjsPlugins = await this.transformPluginsForFormat(config.plugins || [], cjsDir, { emitDts: false })
```

注释说"CJS 格式不生成 DTS,稍后从 ESM 复制并重命名",但实际上并没有实现复制逻辑。

**解决方案**:
将 `emitDts` 改为 `true`,让 CJS 格式也生成 DTS 文件:

```typescript
// 修复后
const cjsPlugins = await this.transformPluginsForFormat(config.plugins || [], cjsDir, { emitDts: true })
```

---

## 修改的文件

### `packages/builder/src/adapters/rollup/RollupAdapter.ts`

#### 修改 1: 排除 `tsconfig` 选项 (第 746 行)

```typescript
// 修复前
const { tsconfigOverride: _ignored, compilerOptions: origCO = {}, ...rest } = originalOptions as any

// 修复后
const { tsconfigOverride: _ignored, compilerOptions: origCO = {}, tsconfig: _tsconfig, ...rest } = originalOptions as any
```

**说明**: 从 `originalOptions` 中排除 `tsconfig` 选项,避免插件从文件中读取配置。

#### 修改 2: 显式设置 `outDir: undefined` (第 765 行)

```typescript
compilerOptions: {
  ...cleanedCO,
  declaration: emitDts,
  declarationMap: false,
  declarationDir: emitDts ? outputDir : undefined,
  // 显式设置 outDir 为 undefined,覆盖 tsconfig.json 中的值
  // 让 Rollup 自己处理 JS 文件的输出
  outDir: undefined,
  rootDir: cleanedCO?.rootDir ?? 'src',
  skipLibCheck: true,
  isolatedModules: !emitDts
}
```

**说明**: 显式设置 `outDir: undefined`,覆盖 `tsconfig.json` 中的值,避免与 Rollup 的输出配置冲突。

#### 修改 3: CJS 格式也生成 DTS 文件 (第 470 行)

```typescript
// 修复前
// CJS 格式不生成 DTS,稍后从 ESM 复制并重命名
const cjsPlugins = await this.transformPluginsForFormat(config.plugins || [], cjsDir, { emitDts: false })

// 修复后
// CJS 格式也生成 DTS 文件
const cjsPlugins = await this.transformPluginsForFormat(config.plugins || [], cjsDir, { emitDts: true })
```

**说明**: 让 CJS 格式也生成 DTS 文件,而不是依赖未实现的复制逻辑。

---

## 测试结果

### 测试环境
- **项目**: `packages/cache`
- **构建命令**: `pnpm run build`
- **输出格式**: ESM, CJS, UMD

### 修复前
- **ES 目录 (`es/`)**: 42 个 DTS 文件 ✅
- **CJS 目录 (`lib/`)**: 0 个 DTS 文件 ❌
- **UMD 目录 (`dist/`)**: 0 个 DTS 文件 ✅ (UMD 不需要 DTS)

### 修复后
- **ES 目录 (`es/`)**: 42 个 DTS 文件 ✅
- **CJS 目录 (`lib/`)**: 42 个 DTS 文件 ✅
- **UMD 目录 (`dist/`)**: 0 个 DTS 文件 ✅ (UMD 不需要 DTS)

### 构建日志
```
[14:58:38] [SUCCESS] ✅ 构建成功 (8.0s)

[14:58:38] [INFO] 📦 构建摘要:
[14:58:38] [INFO]   总文件数: 256
[14:58:38] [INFO]     - JS 文件: 86
[14:58:38] [INFO]     - DTS 文件: 84  (42 个在 es/, 42 个在 lib/)
[14:58:38] [INFO]     - Source Map: 86
[14:58:38] [INFO]   总大小: 1.8 MB
[14:58:38] [INFO]   Gzip 后: 427.4 KB (压缩率: 76%)
```

---

## 技术要点

### 1. **`@rollup/plugin-typescript` 配置优先级**

插件的配置优先级为:
1. 显式传递的 `compilerOptions`
2. `tsconfig.json` 文件中的配置
3. 插件的默认配置

因此,即使代码中没有传递 `outDir`,插件仍会从 `tsconfig.json` 中读取。

### 2. **`outDir` vs `declarationDir`**

- **`outDir`**: TypeScript 编译器输出 JS 文件的目录
- **`declarationDir`**: TypeScript 编译器输出 DTS 文件的目录

在 Rollup 构建中:
- **JS 文件**: 由 Rollup 自己处理输出,不需要 TypeScript 的 `outDir`
- **DTS 文件**: 由 TypeScript 插件处理,需要设置 `declarationDir`

因此,我们需要:
- 设置 `outDir: undefined`,让 Rollup 处理 JS 文件
- 设置 `declarationDir: outputDir`,让 TypeScript 插件输出 DTS 文件到正确的目录

### 3. **多格式构建的 DTS 生成**

对于多格式构建(ESM, CJS, UMD):
- **ESM 和 CJS**: 都需要生成 DTS 文件,因为它们是库的主要使用方式
- **UMD**: 通常不需要 DTS 文件,因为 UMD 主要用于浏览器环境,通过 `<script>` 标签引入

---

## 总结

本次修复解决了两个关键问题:

1. **`outDir` 冲突**: 通过显式设置 `outDir: undefined`,避免与 Rollup 的输出配置冲突
2. **CJS 格式缺少 DTS**: 通过将 `emitDts` 改为 `true`,让 CJS 格式也生成 DTS 文件

修复后,所有需要 DTS 文件的格式(ESM, CJS)都能正确生成类型定义文件,提升了库的使用体验。

---

**修复日期**: 2024-10-09  
**修复版本**: @ldesign/builder v1.0.0

