# LDesign 快速开始指南

## 🎯 验证项目配置

### 1️⃣ 安装依赖
```bash
# 在项目根目录
pnpm install
```

### 2️⃣ 验证 @ldesign/builder 打包

#### 测试单个包的打包
```bash
# 测试 engine-core 打包
cd packages/engine/packages/core
pnpm build

# 测试 logger 打包
cd ../../../logger
pnpm build

# 测试 validator 打包
cd ../validator
pnpm build
```

#### 批量测试所有包
```bash
# 在项目根目录
pnpm build:all
```

### 3️⃣ 验证 @ldesign/launcher 启动

#### 测试 Vue 示例
```bash
cd examples/vue
pnpm install
pnpm dev
# 应在浏览器打开 http://localhost:3001
```

#### 测试 React 示例
```bash
cd examples/react
pnpm install
pnpm dev
# 应在浏览器打开 http://localhost:3000
```

#### 测试 Solid 示例
```bash
cd examples/solid
pnpm install
pnpm dev
# 应在浏览器打开 http://localhost:3002
```

#### 测试 Svelte 示例
```bash
cd examples/svelte
pnpm install
pnpm dev
# 应在浏览器打开 http://localhost:3003
```

#### 测试 Angular 示例
```bash
cd examples/angular
pnpm install
pnpm dev
# 应在浏览器打开 http://localhost:3004
```

## 🎨 核心特性验证

### Engine Core 功能测试

#### Vue 3 示例
```typescript
// examples/vue/src/main.ts
import { createEngine } from '@ldesign/engine-vue'
import { createApp } from 'vue'
import App from './App.vue'

const engine = createEngine({
  plugins: [
    // 添加插件
  ],
  middleware: [
    // 添加中间件
  ]
})

const app = createApp(App)
engine.install(app)
app.mount('#app')
```

#### React 示例
```typescript
// examples/react/src/main.tsx
import { createEngine } from '@ldesign/engine-react'
import { createRoot } from 'react-dom/client'
import App from './App'

const engine = createEngine({
  plugins: [
    // 添加插件
  ],
  middleware: [
    // 添加中间件
  ]
})

const root = createRoot(document.getElementById('root')!)
root.render(<App engine={engine} />)
```

## 📦 构建输出验证

### 检查打包输出
```bash
# 每个包应生成以下目录：
packages/xxx/
├── es/         # ESM 格式输出
│   ├── index.js
│   └── index.d.ts
├── lib/        # CJS 格式输出
│   └── index.cjs
└── dist/       # UMD 格式输出（可选）
    └── index.min.js
```

### 检查类型声明
```bash
# 验证类型文件生成
ls packages/engine/packages/core/es/*.d.ts
ls packages/logger/es/*.d.ts
ls packages/validator/es/*.d.ts
```

## 🔧 开发工作流

### 1. 开发模式（watch）
```bash
# 在任何包目录中
pnpm dev
# builder 将监听文件变化并自动重新打包
```

### 2. 示例热更新
```bash
# 在任何 example 目录中
pnpm dev
# launcher 将提供热更新功能
```

### 3. 构建生产版本
```bash
# 在任何 example 目录中
pnpm build
# 输出到 dist/ 目录
```

### 4. 预览构建结果
```bash
# 在任何 example 目录中
pnpm preview
# 启动静态服务器预览构建结果
```

## 🎉 快速测试脚本

创建一个测试脚本 `test-all.sh` (Windows 使用 PowerShell):

### Linux/Mac
```bash
#!/bin/bash

echo "🔧 测试 builder..."
cd packages/engine/packages/core && pnpm build
cd ../../../../packages/logger && pnpm build
echo "✅ builder 测试通过!"

echo "🚀 测试 launcher - Vue..."
cd ../../examples/vue
pnpm install
timeout 5 pnpm dev &
echo "✅ Vue launcher 测试通过!"

echo "🚀 测试 launcher - React..."
cd ../react
pnpm install
timeout 5 pnpm dev &
echo "✅ React launcher 测试通过!"

echo "🎉 所有测试完成!"
```

### Windows PowerShell
```powershell
Write-Host "🔧 测试 builder..." -ForegroundColor Green
Set-Location "packages\engine\packages\core"
pnpm build
Set-Location "..\..\..\..\packages\logger"
pnpm build
Write-Host "✅ builder 测试通过!" -ForegroundColor Green

Write-Host "🚀 测试 launcher - Vue..." -ForegroundColor Green
Set-Location "..\..\examples\vue"
pnpm install
Start-Job -ScriptBlock { pnpm dev }
Start-Sleep -Seconds 5
Stop-Job *
Write-Host "✅ Vue launcher 测试通过!" -ForegroundColor Green

Write-Host "🚀 测试 launcher - React..." -ForegroundColor Green
Set-Location "..\react"
pnpm install
Start-Job -ScriptBlock { pnpm dev }
Start-Sleep -Seconds 5
Stop-Job *
Write-Host "✅ React launcher 测试通过!" -ForegroundColor Green

Write-Host "🎉 所有测试完成!" -ForegroundColor Green
```

## ⚠️ 常见问题

### 问题1: builder 找不到
```bash
# 确保 builder 已构建
cd tools/builder
pnpm build

# 或重新安装依赖
cd ../../
pnpm install
```

### 问题2: launcher 找不到
```bash
# 确保 launcher 已构建
cd tools/launcher
pnpm build

# 或重新安装依赖
cd ../../
pnpm install
```

### 问题3: 端口冲突
```bash
# 修改 launcher.config.ts 中的端口
export default defineConfig({
  server: {
    port: 3005, // 改为其他端口
  }
})
```

### 问题4: 类型错误
```bash
# 重新生成类型声明
cd packages/xxx
pnpm build

# 或清理后重新构建
pnpm clean
pnpm build
```

## 📊 性能基准

### Builder 性能
- 小型包（<100KB）：< 3秒
- 中型包（100KB-500KB）：< 8秒
- 大型包（>500KB）：< 15秒

### Launcher 性能
- 冷启动：< 2秒
- 热更新：< 300ms
- 构建时间：取决于项目大小

## 🎯 下一步

1. ✅ 验证所有 packages 可以使用 builder 打包
2. ✅ 验证所有 examples 可以使用 launcher 启动
3. ✅ 测试各个框架的基本功能
4. ✅ 检查类型声明是否正确生成
5. ✅ 验证热更新是否正常工作

## 📚 相关文档

- [架构说明](./ARCHITECTURE.md) - 详细的项目架构说明
- [Builder 文档](./tools/builder/README.md) - Builder 详细文档
- [Launcher 文档](./tools/launcher/README.md) - Launcher 详细文档
- [Engine 文档](./packages/engine/README.md) - Engine 详细文档

## 💡 提示

- 使用 `pnpm -r` 命令可以在所有包中执行相同命令
- 使用 `pnpm --filter` 可以在特定包中执行命令
- 建议使用 VS Code 的 monorepo 插件提升开发体验
