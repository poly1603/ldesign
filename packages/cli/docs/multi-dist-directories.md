# 多产物目录支持

## 概述

构建产物分析器现在支持智能检测和分析多个产物目录（如 `dist`、`es`、`lib` 等），而不仅仅是单一的 `dist` 目录。

## 功能特性

### 1. 智能检测产物目录

分析器会从多个来源检测产物目录：

#### a) package.json 配置
- **入口字段**：`main`、`module`、`types`、`unpkg`、`jsdelivr`、`browser`
- **exports 字段**：递归提取所有导出路径
- **files 字段**：识别构建产物目录（自动排除源码和文档目录）

示例 package.json：
```json
{
  "name": "@ldesign/shared",
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "files": ["dist", "es", "lib"]
}
```

从上述配置中，分析器会检测到：`lib`、`es`、`dist` 三个产物目录。

#### b) 常见目录名称
如果 package.json 中没有明确配置，会尝试检测以下常见目录：
- `dist`
- `es`
- `lib`
- `esm`
- `cjs`
- `build`
- `output`

### 2. 独立分析每个产物目录

每个产物目录都会获得独立的统计信息：

```typescript
interface DistDirectoryInfo {
  name: string              // 目录名称
  path: string              // 完整路径
  exists: boolean           // 是否存在
  totalFiles: number        // 文件数量
  totalSize: number         // 总大小
  totalDirectories: number  // 子目录数量
  fileTypes: FileType[]     // 文件类型分布
  fileTree: FileInfo[]      // 文件树
  largestFiles: FileInfo[]  // 最大文件 Top 10
}
```

### 3. 汇总统计

分析结果包含：
- **各产物目录的独立统计**
- **所有产物目录的汇总统计**（总文件数、总大小、合并的文件类型分布等）

### 4. 可视化展示

在产物分析页面中，会展示：
- 产物目录卡片：展示每个产物目录的统计信息
- 大小占比条形图：可视化各目录的大小比例
- 主要文件类型：显示每个目录的主要文件类型

## API

### analyzeBuild()

分析项目的构建产物：

```typescript
const analysis = analyzeBuild('/path/to/project')

console.log(analysis.distDirectories)
// [
//   { name: 'lib', exists: true, totalFiles: 194, totalSize: 712345, ... },
//   { name: 'es', exists: true, totalFiles: 194, totalSize: 655432, ... },
//   { name: 'dist', exists: true, totalFiles: 4, totalSize: 2088765, ... }
// ]

console.log(analysis.totalFiles)  // 392 (所有目录的总和)
console.log(analysis.totalSize)   // 3456542 (所有目录的总和)
```

### getBuildSummary()

获取轻量级的产物摘要：

```typescript
const summary = getBuildSummary('/path/to/project')

console.log(summary)
// {
//   exists: true,
//   size: 3456542,
//   files: 392,
//   distPath: '/path/to/project/lib',  // 主目录（第一个）
//   distDirectories: ['lib', 'es', 'dist']
// }
```

## 实际案例

### 单产物目录项目 (@ldesign/builder)
```
产物目录: dist
- 文件数: 542
- 总大小: 35.03 MB
- 目录数: 26
```

### 多产物目录项目 (@ldesign/shared)
```
产物目录: lib, es, dist (3个)

lib:
- 文件数: 194
- 总大小: 0.68 MB
- 目录数: 7

es:
- 文件数: 194
- 总大小: 0.64 MB
- 目录数: 7

dist:
- 文件数: 4
- 总大小: 1.99 MB
- 目录数: 1

总计:
- 文件数: 392
- 总大小: 3.31 MB
- 目录数: 15
```

## 兼容性

- **向后兼容**：保留了 `distPath` 和 `distExists` 字段，指向第一个检测到的产物目录
- **增强功能**：新增 `distDirectories` 数组，包含所有产物目录的详细信息
- **前端UI**：当检测到多个产物目录时，自动显示产物目录卡片

## 排除规则

以下目录和文件会被自动排除：
- 源码目录：`src`
- 测试目录：`test`、`tests`、`__tests__`
- 文档目录：`docs`、`examples`
- 脚本目录：`scripts`、`.github`
- 其他：`node_modules`、`README.md`、`LICENSE`、`package.json`、`tsconfig.json`
- 任何带扩展名的文件（如 `.md`、`.json` 等）

## 总结

这个改进使得构建产物分析更加智能和全面，特别适合：
- **组件库项目**：通常有 `es`、`lib`、`dist` 等多种格式
- **多格式输出**：同时输出 ESM、CJS、UMD 等格式
- **TypeScript 项目**：类型定义和代码可能在不同目录

通过智能检测 package.json 配置，分析器能够自动识别所有产物目录，无需手动配置。