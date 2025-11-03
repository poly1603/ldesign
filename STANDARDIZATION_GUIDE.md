# LDesign 应用引擎标准化实施指南

## 📋 概述

本指南帮助你将 LDesign 项目标准化，确保：
- 所有 `packages/` 使用 `@ldesign/builder` 打包
- 所有 `examples/` 使用 `@ldesign/launcher` 运行
- 统一的配置规范和命名约定

## 🎯 标准化目标

### 1. 核心架构
- ✅ `packages/engine/packages/core` - 框架无关的核心引擎
- ✅ `packages/engine/packages/{framework}` - 各框架适配器
- ✅ 所有功能包支持多框架（router, store, i18n 等）

### 2. 工具链统一
- ✅ 所有包使用 `@ldesign/builder` 打包
- ✅ 所有示例使用 `@ldesign/launcher` 运行
- ✅ 统一的配置文件格式

## 📦 Package 标准化

### 配置文件：`builder.config.ts`

每个 package 都应该有标准的 `builder.config.ts`：

```bash
# 复制模板
cp .templates/builder.config.template.ts packages/your-package/builder.config.ts
```

### Package.json 标准 Scripts

```json
{
  "scripts": {
    "build": "ldesign-builder build -f esm,cjs,umd,dts",
    "dev": "ldesign-builder build -f esm,cjs,umd,dts --watch",
    "clean": "rimraf es lib dist"
  }
}
```

### Package.json 标准 Exports

```json
{
  "exports": {
    ".": {
      "types": "./es/index.d.ts",
      "import": "./es/index.js",
      "require": "./lib/index.cjs"
    }
  },
  "main": "./lib/index.cjs",
  "module": "./es/index.js",
  "types": "./es/index.d.ts"
}
```

### 目录结构

```
packages/your-package/
├── src/                    # 源代码
│   ├── index.ts           # 入口文件
│   └── ...
├── builder.config.ts      # 构建配置
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Example 标准化

### 配置文件：`launcher.config.ts`

每个 example 都应该有标准的 `launcher.config.ts`：

```bash
# 复制模板
cp .templates/launcher.config.template.ts examples/your-example/launcher.config.ts
```

修改 framework 字段为对应框架：
```typescript
export default defineConfig({
  framework: 'vue', // 或 'react', 'angular', 'svelte', 'solid' 等
  // ...
})
```

### Package.json 标准 Scripts

```json
{
  "scripts": {
    "dev": "launcher dev",
    "build": "launcher build",
    "preview": "launcher preview"
  }
}
```

### 目录结构

```
examples/your-framework/
├── src/                   # 源代码
│   ├── main.ts           # 入口文件
│   ├── App.vue           # 根组件
│   └── ...
├── public/               # 静态资源
├── index.html            # HTML 模板
├── launcher.config.ts    # 启动器配置
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 批量迁移脚本

### 1. 为所有 Packages 添加标准配置

创建脚本 `scripts/standardize-packages.ts`：

```typescript
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'

async function standardizePackages() {
  const packages = await glob('packages/*/package.json')
  
  for (const pkgPath of packages) {
    const pkgDir = path.dirname(pkgPath)
    const configPath = path.join(pkgDir, 'builder.config.ts')
    
    // 如果没有 builder.config.ts，复制模板
    if (!fs.existsSync(configPath)) {
      await fs.copy(
        '.templates/builder.config.template.ts',
        configPath
      )
      console.log(`✅ 已创建: ${configPath}`)
    }
    
    // 更新 package.json scripts
    const pkg = await fs.readJSON(pkgPath)
    pkg.scripts = pkg.scripts || {}
    pkg.scripts.build = 'ldesign-builder build -f esm,cjs,umd,dts'
    pkg.scripts.dev = 'ldesign-builder build -f esm,cjs,umd,dts --watch'
    
    // 添加 devDependencies
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.devDependencies['@ldesign/builder'] = 'workspace:*'
    
    await fs.writeJSON(pkgPath, pkg, { spaces: 2 })
    console.log(`✅ 已更新: ${pkgPath}`)
  }
}

standardizePackages()
```

运行：
```bash
pnpm tsx scripts/standardize-packages.ts
```

### 2. 为所有 Examples 添加标准配置

创建脚本 `scripts/standardize-examples.ts`：

```typescript
import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'

const FRAMEWORK_MAP = {
  'vue': 'vue',
  'react': 'react',
  'angular': 'angular',
  'svelte': 'svelte',
  'solid': 'solid'
}

async function standardizeExamples() {
  const examples = await glob('examples/*/package.json')
  
  for (const pkgPath of examples) {
    const pkgDir = path.dirname(pkgPath)
    const exampleName = path.basename(pkgDir)
    const configPath = path.join(pkgDir, 'launcher.config.ts')
    
    // 如果没有 launcher.config.ts，创建
    if (!fs.existsSync(configPath)) {
      const framework = FRAMEWORK_MAP[exampleName] || 'vue'
      const config = `import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  framework: '${framework}',
  entry: 'src/main.ts',
  server: {
    port: 3000,
    open: true
  }
})
`
      await fs.writeFile(configPath, config)
      console.log(`✅ 已创建: ${configPath}`)
    }
    
    // 更新 package.json scripts
    const pkg = await fs.readJSON(pkgPath)
    pkg.scripts = pkg.scripts || {}
    pkg.scripts.dev = 'launcher dev'
    pkg.scripts.build = 'launcher build'
    pkg.scripts.preview = 'launcher preview'
    
    // 添加 dependencies
    pkg.dependencies = pkg.dependencies || {}
    pkg.dependencies['@ldesign/launcher'] = 'workspace:*'
    
    await fs.writeJSON(pkgPath, pkg, { spaces: 2 })
    console.log(`✅ 已更新: ${pkgPath}`)
  }
}

standardizeExamples()
```

运行：
```bash
pnpm tsx scripts/standardize-examples.ts
```

## ✅ 验证标准化

### 1. 验证 Package 构建

```bash
# 测试单个包
cd packages/your-package
pnpm build

# 测试所有包
pnpm --filter "./packages/*" build
```

### 2. 验证 Example 运行

```bash
# 测试单个示例
cd examples/vue
pnpm dev

# 测试构建
pnpm build
pnpm preview
```

### 3. 自动化检查脚本

创建 `scripts/check-standards.ts`：

```typescript
import fs from 'fs-extra'
import { glob } from 'glob'

async function checkStandards() {
  let allPass = true
  
  // 检查 packages
  console.log('📦 检查 Packages...')
  const packages = await glob('packages/*/package.json')
  for (const pkgPath of packages) {
    const pkgDir = path.dirname(pkgPath)
    const hasBuilderConfig = fs.existsSync(path.join(pkgDir, 'builder.config.ts'))
    const pkg = await fs.readJSON(pkgPath)
    const hasBuildScript = pkg.scripts?.build?.includes('ldesign-builder')
    
    if (!hasBuilderConfig || !hasBuildScript) {
      console.log(`❌ ${pkgPath} 缺少标准配置`)
      allPass = false
    } else {
      console.log(`✅ ${pkgPath}`)
    }
  }
  
  // 检查 examples
  console.log('\n🚀 检查 Examples...')
  const examples = await glob('examples/*/package.json')
  for (const pkgPath of examples) {
    const pkgDir = path.dirname(pkgPath)
    const hasLauncherConfig = fs.existsSync(path.join(pkgDir, 'launcher.config.ts'))
    const pkg = await fs.readJSON(pkgPath)
    const hasDevScript = pkg.scripts?.dev === 'launcher dev'
    
    if (!hasLauncherConfig || !hasDevScript) {
      console.log(`❌ ${pkgPath} 缺少标准配置`)
      allPass = false
    } else {
      console.log(`✅ ${pkgPath}`)
    }
  }
  
  if (allPass) {
    console.log('\n🎉 所有项目都符合标准！')
  } else {
    console.log('\n⚠️  有项目需要标准化')
    process.exit(1)
  }
}

checkStandards()
```

运行检查：
```bash
pnpm tsx scripts/check-standards.ts
```

## 📊 进度追踪

创建 `STANDARDIZATION_PROGRESS.md`：

```markdown
# 标准化进度

## Packages (XX/XX)

### Engine
- [x] @ldesign/engine-core
- [x] @ldesign/engine-vue
- [x] @ldesign/engine-react
- [ ] @ldesign/engine-angular
- [ ] ...

### Router
- [x] @ldesign/router-core
- [x] @ldesign/router-vue
- [ ] @ldesign/router-react
- [ ] ...

### 其他
- [ ] @ldesign/store
- [ ] @ldesign/i18n
- [ ] ...

## Examples (XX/XX)

- [x] examples/vue
- [x] examples/react
- [ ] examples/angular
- [ ] examples/svelte
- [ ] examples/solid
```

## 🎯 最佳实践

### 1. 新建 Package

使用脚手架创建标准化的包：

```bash
pnpm create:package --name your-package --framework vue
```

这会自动生成：
- 标准目录结构
- `builder.config.ts`
- 正确的 `package.json`

### 2. 新建 Example

使用脚手架创建标准化的示例：

```bash
pnpm create:example --framework vue
```

这会自动生成：
- 标准目录结构
- `launcher.config.ts`
- 正确的 `package.json`

### 3. CI/CD 集成

在 `.github/workflows/ci.yml` 中添加标准检查：

```yaml
name: CI

on: [push, pull_request]

jobs:
  check-standards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Check standards
        run: pnpm tsx scripts/check-standards.ts
      
      - name: Build all packages
        run: pnpm --filter "./packages/*" build
      
      - name: Build all examples
        run: pnpm --filter "./examples/*" build
```

## 🔗 相关链接

- [Builder 文档](./tools/builder/README.md)
- [Launcher 文档](./tools/launcher/README.md)
- [架构设计](./ARCHITECTURE.md)
- [贡献指南](./CONTRIBUTING.md)
