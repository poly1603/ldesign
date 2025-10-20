# Vite 配置和使用指南

## 项目结构

所有示例项目都已配置 Vite 开发服务器，支持热更新和快速开发。

```
examples/
├── vanilla/          # 原生 JS 示例 (端口: 3000)
│   ├── index.html
│   ├── main.js
│   ├── package.json
│   └── vite.config.js
├── vue-demo/         # Vue 3 示例 (端口: 3001)
│   ├── index.html
│   ├── main.js
│   ├── App.vue
│   ├── package.json
│   └── vite.config.js
├── react-demo/       # React 示例 (端口: 3002)
│   ├── index.html
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── package.json
│   └── vite.config.js
└── lit-demo/         # Lit 示例 (端口: 3003)
    ├── index.html
    ├── main.js
    ├── package.json
    └── vite.config.js
```

## Alias 配置

每个示例项目都配置了 alias，直接引用源代码而不是构建后的文件，便于开发调试。

### Vanilla 示例
```javascript
// vite.config.js
resolve: {
  alias: {
    '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  },
}
```

### Vue 示例
```javascript
// vite.config.js
resolve: {
  alias: {
    '@ldesign/excel-viewer-vue': resolve(__dirname, '../../packages/vue/src/index.ts'),
    '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  },
}
```

### React 示例
```javascript
// vite.config.js
resolve: {
  alias: {
    '@ldesign/excel-viewer-react': resolve(__dirname, '../../packages/react/src/index.ts'),
    '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  },
}
```

### Lit 示例
```javascript
// vite.config.js
resolve: {
  alias: {
    '@ldesign/excel-viewer-lit': resolve(__dirname, '../../packages/lit/src/index.ts'),
    '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  },
}
```

## 快速开始

### 1. 安装依赖

```bash
# 在项目根目录安装所有依赖
npm install

# 安装示例项目依赖
cd examples/vanilla && npm install
cd ../vue-demo && npm install
cd ../react-demo && npm install
cd ../lit-demo && npm install
```

### 2. 运行开发服务器

#### 方式一：从根目录运行

```bash
# 运行原生 JS 示例 (http://localhost:3000)
npm run dev:vanilla

# 运行 Vue 示例 (http://localhost:3001)
npm run dev:vue

# 运行 React 示例 (http://localhost:3002)
npm run dev:react

# 运行 Lit 示例 (http://localhost:3003)
npm run dev:lit
```

#### 方式二：进入示例目录运行

```bash
# 原生 JS 示例
cd examples/vanilla
npm run dev

# Vue 示例
cd examples/vue-demo
npm run dev

# React 示例
cd examples/react-demo
npm run dev

# Lit 示例
cd examples/lit-demo
npm run dev
```

### 3. 构建示例项目

```bash
# 构建所有示例
npm run build:examples

# 或者构建单个示例
npm run build:example:vanilla
npm run build:example:vue
npm run build:example:react
npm run build:example:lit
```

## 测试包的打包

### 测试所有包的构建

```bash
# 运行自动化测试脚本
npm run test:build
```

这个脚本会：
1. 清理旧的构建文件
2. 依次构建所有包（core, vue, react, lit）
3. 检查每个包的输出文件是否正确生成
4. 输出详细的构建报告

### 手动构建包

```bash
# 构建所有包
npm run build

# 构建单个包
npm run build:core
npm run build:vue
npm run build:react
npm run build:lit
```

### 验证构建输出

每个包应该生成以下文件：

```
packages/[package-name]/dist/
├── index.esm.js      # ES Module 格式
├── index.cjs.js      # CommonJS 格式
├── index.umd.js      # UMD 格式
└── index.d.ts        # TypeScript 类型定义
```

## 开发工作流

### 推荐工作流

1. **修改源代码**
   ```bash
   # 编辑 packages/core/src/ 或其他包的源代码
   ```

2. **启动开发服务器**
   ```bash
   # 启动对应的示例项目
   npm run dev:vanilla
   # 或 npm run dev:vue / dev:react / dev:lit
   ```

3. **实时预览**
   - Vite 会自动热更新
   - 修改源代码后浏览器自动刷新
   - 无需重新构建

4. **测试功能**
   - 在浏览器中测试新功能
   - 使用开发者工具调试

5. **构建和验证**
   ```bash
   # 构建包
   npm run build
   
   # 测试构建
   npm run test:build
   ```

### 调试技巧

1. **使用浏览器开发者工具**
   - 源代码会通过 Source Map 映射
   - 可以直接在 TypeScript 源码中打断点

2. **查看热更新日志**
   - Vite 会在控制台显示更新信息
   - 如果更新失败会显示错误

3. **清理缓存**
   ```bash
   # 清理 Vite 缓存
   rm -rf node_modules/.vite
   
   # 清理所有构建文件
   npm run clean
   ```

## 端口配置

每个示例项目使用不同的端口，避免冲突：

- Vanilla JS: `http://localhost:3000`
- Vue 3: `http://localhost:3001`
- React: `http://localhost:3002`
- Lit: `http://localhost:3003`

可以在各自的 `vite.config.js` 中修改端口：

```javascript
server: {
  port: 3000,  // 修改为你需要的端口
  open: true,  // 自动打开浏览器
}
```

## 常见问题

### Q: 为什么要使用 alias？

A: 使用 alias 可以：
- 直接引用源代码，无需构建
- 支持热更新，修改源码立即生效
- 便于调试，可以在源码中打断点
- 加快开发速度

### Q: 如何切换使用构建后的包？

A: 修改 `vite.config.js`，移除 alias 配置：

```javascript
// 注释掉或删除 alias 配置
resolve: {
  // alias: {
  //   '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  // },
}
```

然后确保已经构建了包：
```bash
npm run build
```

### Q: 热更新不生效怎么办？

A: 尝试以下方法：
1. 重启 Vite 开发服务器
2. 清理缓存：`rm -rf node_modules/.vite`
3. 检查 alias 配置是否正确
4. 确保文件保存成功

### Q: 构建失败怎么办？

A: 检查以下内容：
1. 确保依赖已安装：`npm install`
2. 检查 TypeScript 类型错误：`npm run type-check`
3. 检查 ESLint 错误：`npm run lint`
4. 查看详细的构建日志

### Q: 如何添加新的示例？

A: 步骤：
1. 在 `examples/` 下创建新目录
2. 创建 `package.json` 和 `vite.config.js`
3. 配置 alias 指向源代码
4. 在根目录 `package.json` 添加对应的 npm scripts

## 性能优化

### 开发环境优化

1. **使用 alias 引用源码**
   - 避免打包依赖
   - 加快启动速度

2. **启用 Vite 缓存**
   - Vite 会自动缓存依赖
   - 重新启动时更快

3. **按需加载**
   - 只启动需要的示例项目
   - 减少内存占用

### 生产构建优化

1. **代码分割**
   ```javascript
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           'vendor': ['vue', 'react', 'react-dom'],
         }
       }
     }
   }
   ```

2. **压缩优化**
   ```javascript
   build: {
     minify: 'terser',
     terserOptions: {
       compress: {
         drop_console: true,
       }
     }
   }
   ```

## 脚本说明

### 开发脚本

- `npm run dev:vanilla` - 运行原生 JS 示例
- `npm run dev:vue` - 运行 Vue 示例
- `npm run dev:react` - 运行 React 示例
- `npm run dev:lit` - 运行 Lit 示例

### 构建脚本

- `npm run build` - 构建所有包
- `npm run build:core` - 构建核心包
- `npm run build:vue` - 构建 Vue 包
- `npm run build:react` - 构建 React 包
- `npm run build:lit` - 构建 Lit 包
- `npm run build:examples` - 构建所有示例
- `npm run build:example:vanilla` - 构建原生 JS 示例
- `npm run build:example:vue` - 构建 Vue 示例
- `npm run build:example:react` - 构建 React 示例
- `npm run build:example:lit` - 构建 Lit 示例

### 测试脚本

- `npm run test:build` - 测试所有包的构建
- `npm run lint` - 代码检查
- `npm run type-check` - 类型检查

### 清理脚本

- `npm run clean` - 清理所有构建文件

## 总结

使用 Vite 配置后的优势：

✅ **快速启动** - 无需构建，秒级启动  
✅ **热更新** - 修改代码即时生效  
✅ **源码调试** - 直接调试 TypeScript 源码  
✅ **多项目支持** - 同时运行多个示例  
✅ **类型检查** - 实时 TypeScript 类型提示  
✅ **统一配置** - 所有示例使用相同的配置模式  

开始开发：
```bash
npm install
npm run dev:vue  # 或其他示例
```

开始构建：
```bash
npm run build
npm run test:build
```

---

**Happy Coding! 🚀**


