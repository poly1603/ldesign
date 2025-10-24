# Packages 构建标准

## 标准目录结构

每个package构建后应该包含以下标准目录:

```
packages/[package-name]/
├── src/                  # 源代码
│   ├── index.ts         # 主入口(ESM/CJS)
│   └── index-lib.ts     # UMD专用入口(可选)
├── es/                   # ESM格式产物
│   ├── index.js
│   ├── index.d.ts
│   ├── index.js.map
│   └── ...              # 保留src目录结构
├── lib/                  # CJS格式产物  
│   ├── index.cjs
│   ├── index.d.ts
│   ├── index.cjs.map
│   └── ...              # 保留src目录结构
├── dist/                 # UMD格式产物
│   ├── index.js         # UMD常规版本
│   ├── index.js.map
│   ├── index.min.js     # UMD压缩版本
│   └── index.min.js.map
├── ldesign.config.ts    # 构建配置
└── package.json
```

## 标准配置文件

### ldesign.config.ts

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 强制指定库类型为TypeScript
  libraryType: 'typescript',

  // 主入口文件
  input: 'src/index.ts',

  // 输出配置
  output: {
    format: ['esm', 'cjs', 'umd'],

    // ESM输出 - 保留目录结构
    esm: {
      dir: 'es',
      preserveStructure: true,
    },

    // CJS输出 - 保留目录结构
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },

    // UMD输出 - 打包为单文件
    umd: {
      dir: 'dist',
      name: 'LDesign[PackageName]', // 替换为实际包名
    },
  },

  // 生成TypeScript声明文件
  dts: true,

  // 生成sourcemap
  sourcemap: true,

  // 不压缩(由builder自动处理压缩版本)
  minify: false,

  // 构建前清理
  clean: true,

  // 外部依赖(不打包)
  external: [
    'vue',
    'react',
    'react-dom',
    /^@ldesign\//,
    /^lodash/,
    /^@vue\//,
  ],

  // TypeScript配置
  typescript: {
    declaration: true,
    declarationMap: true,
  },

  // UMD构建配置(顶层，确保被识别)
  umd: {
    enabled: true,
    entry: 'src/index-lib.ts', // 使用UMD专用入口
    name: 'LDesign[PackageName]', // 替换为实际包名
  },
})
```

### package.json

```json
{
  "name": "@ldesign/[package-name]",
  "type": "module",
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts",
  "unpkg": "./dist/index.min.js",
  "jsdelivr": "./dist/index.min.js",
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "files": [
    "es",
    "lib",
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "ldesign-builder build",
    "build:watch": "ldesign-builder build --watch",
    "clean": "rimraf es lib dist"
  }
}
```

## 构建命令

### 标准构建
```bash
pnpm run build
```

### 监听模式
```bash
pnpm run build:watch
```

### 清理产物
```bash
pnpm run clean
```

## 产物验证

构建完成后,验证以下内容:

### 1. 目录存在性
```bash
# 检查三个产物目录都存在
ls es/ lib/ dist/
```

### 2. 文件完整性

**ESM (es/):**
- ✅ `.js` 文件 (ES模块)
- ✅ `.d.ts` 文件 (类型声明)
- ✅ `.js.map` 文件 (sourcemap)

**CJS (lib/):**
- ✅ `.cjs` 文件 (CommonJS模块)
- ✅ `.d.ts` 文件 (类型声明)  
- ✅ `.cjs.map` 文件 (sourcemap)

**UMD (dist/):**
- ✅ `index.js` (UMD常规版本)
- ✅ `index.js.map`
- ✅ `index.min.js` (UMD压缩版本)
- ✅ `index.min.js.map`

### 3. 类型声明
```bash
# 确保类型声明文件存在
ls es/**/*.d.ts lib/**/*.d.ts
```

## 特殊情况处理

### 包含Vue/React组件的包

如果包中包含Vue或React组件,可能需要创建UMD专用入口文件:

**src/index-lib.ts** (UMD专用入口):
```typescript
/**
 * UMD构建专用入口
 * 仅导出核心功能,不包含框架特定集成
 */

// 导出核心功能
export * from './core'
export * from './utils'

// 不导出框架集成
// export * from './vue'  // ❌ 不导出
// export * from './react' // ❌ 不导出
```

### 无法通过Builder生成UMD的情况

如果@ldesign/builder无法生成UMD产物,使用独立rollup配置:

1. 复制 `packages/.template/rollup.umd.config.js` 到包根目录
2. 修改配置中的包名
3. 更新package.json:
```json
{
  "scripts": {
    "build": "ldesign-builder build && rollup -c rollup.umd.config.js",
    "build:umd": "rollup -c rollup.umd.config.js"
  },
  "devDependencies": {
    "rollup": "^latest",
    "rollup-plugin-esbuild": "^latest",
    "@rollup/plugin-node-resolve": "^latest",
    "@rollup/plugin-commonjs": "^latest",
    "@rollup/plugin-terser": "^latest",
    "@rollup/plugin-json": "^latest"
  }
}
```

## 添加新Package

1. 创建包目录: `packages/[package-name]/`
2. 复制标准配置文件
3. 修改package.json中的包名和描述
4. 修改ldesign.config.ts中的UMD名称
5. 编写源代码
6. 运行构建验证
7. 检查产物完整性

## 发布前检查清单

- [ ] 所有产物目录存在 (es/, lib/, dist/)
- [ ] package.json的`files`字段包含所有产物目录
- [ ] package.json的`exports`字段配置正确
- [ ] 类型声明文件完整
- [ ] sourcemap文件存在
- [ ] README.md文档完整
- [ ] LICENSE文件存在
- [ ] 版本号正确

## 常见问题

### Q: 为什么没有生成dist目录?
A: 可能是Builder检测问题,参考"特殊情况处理"使用独立rollup配置。

### Q: 如何修改UMD全局变量名?
A: 在ldesign.config.ts中修改`output.umd.name`和`umd.name`字段。

### Q: 是否需要同时维护src/index.ts和src/index-lib.ts?
A: index-lib.ts是可选的,仅在需要为UMD提供不同导出时创建。

### Q: 构建产物是否需要提交到git?
A: 不需要,产物目录应该在`.gitignore`中排除。

