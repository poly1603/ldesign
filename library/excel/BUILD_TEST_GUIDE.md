# 打包测试指南

## 概述

本项目包含 4 个包，都需要进行打包测试以确保构建正确。

## 包列表

1. **@ldesign/excel-viewer-core** - 核心功能包
2. **@ldesign/excel-viewer-vue** - Vue 3 组件
3. **@ldesign/excel-viewer-react** - React 组件
4. **@ldesign/excel-viewer-lit** - Lit Web Component

## 自动化测试

### 运行测试脚本

```bash
npm run test:build
```

这个脚本会自动：

1. ✅ 清理旧的构建文件
2. ✅ 依次构建所有包
3. ✅ 检查输出文件是否完整
4. ✅ 生成测试报告

### 测试输出示例

```
========================================
开始测试所有包的打包
========================================

📦 正在构建 @ldesign/excel-viewer-core...
  清理旧的构建文件...
  执行构建...
  检查输出文件...
  ✅ 所有输出文件存在
  ✅ @ldesign/excel-viewer-core 构建成功

📦 正在构建 @ldesign/excel-viewer-vue...
  清理旧的构建文件...
  执行构建...
  检查输出文件...
  ✅ 所有输出文件存在
  ✅ @ldesign/excel-viewer-vue 构建成功

... (其他包)

========================================
构建测试总结
========================================

成功: 4
失败: 0
总计: 4

🎉 所有包构建成功！
```

## 手动测试

### 1. 构建所有包

```bash
npm run build
```

### 2. 逐个测试

#### 测试核心包

```bash
npm run build:core
ls -la packages/core/dist/
```

应该看到：
- ✅ index.esm.js
- ✅ index.cjs.js
- ✅ index.umd.js
- ✅ index.d.ts

#### 测试 Vue 包

```bash
npm run build:vue
ls -la packages/vue/dist/
```

应该看到：
- ✅ index.esm.js
- ✅ index.cjs.js
- ✅ index.umd.js
- ✅ index.d.ts

#### 测试 React 包

```bash
npm run build:react
ls -la packages/react/dist/
```

应该看到：
- ✅ index.esm.js
- ✅ index.cjs.js
- ✅ index.umd.js
- ✅ index.d.ts

#### 测试 Lit 包

```bash
npm run build:lit
ls -la packages/lit/dist/
```

应该看到：
- ✅ index.esm.js
- ✅ index.cjs.js
- ✅ index.umd.js
- ✅ index.d.ts

## 验证构建质量

### 1. 检查文件大小

```bash
# 查看所有包的大小
du -sh packages/*/dist/

# 预期大小参考：
# core: ~500KB - 1MB
# vue: ~50KB - 100KB
# react: ~50KB - 100KB
# lit: ~50KB - 100KB
```

### 2. 检查类型定义

```bash
# 检查类型定义文件
cat packages/core/dist/index.d.ts | head -20

# 应该看到导出的类型定义
```

### 3. 测试模块加载

#### 测试 ESM

```javascript
// test-esm.mjs
import { ExcelViewer } from './packages/core/dist/index.esm.js';
console.log('ESM loaded:', typeof ExcelViewer);
```

```bash
node test-esm.mjs
```

#### 测试 CommonJS

```javascript
// test-cjs.cjs
const { ExcelViewer } = require('./packages/core/dist/index.cjs.js');
console.log('CJS loaded:', typeof ExcelViewer);
```

```bash
node test-cjs.cjs
```

#### 测试 UMD (浏览器)

```html
<!-- test-umd.html -->
<!DOCTYPE html>
<html>
<head>
  <title>UMD Test</title>
</head>
<body>
  <script src="packages/core/dist/index.umd.js"></script>
  <script>
    console.log('UMD loaded:', typeof ExcelViewerCore.ExcelViewer);
  </script>
</body>
</html>
```

## 验证示例项目

### 1. 使用构建后的包

修改示例项目的 `vite.config.js`，注释掉 alias：

```javascript
resolve: {
  // 注释掉 alias，使用构建后的包
  // alias: {
  //   '@ldesign/excel-viewer-core': resolve(__dirname, '../../packages/core/src/index.ts'),
  // },
}
```

### 2. 运行示例

```bash
npm run dev:vanilla
npm run dev:vue
npm run dev:react
npm run dev:lit
```

### 3. 构建示例

```bash
npm run build:examples
```

检查构建输出：
```bash
ls -la examples/vanilla/dist/
ls -la examples/vue-demo/dist/
ls -la examples/react-demo/dist/
ls -la examples/lit-demo/dist/
```

## 常见问题

### Q: 构建失败怎么办？

**A:** 检查步骤：

1. 清理缓存
   ```bash
   npm run clean
   rm -rf node_modules/.cache
   ```

2. 重新安装依赖
   ```bash
   rm -rf node_modules
   npm install
   ```

3. 检查 TypeScript 错误
   ```bash
   npm run type-check
   ```

4. 检查 ESLint 错误
   ```bash
   npm run lint
   ```

### Q: 缺少某些输出文件？

**A:** 检查 `rollup.config.js` 配置：

```javascript
output: [
  { file: 'dist/index.esm.js', format: 'esm' },
  { file: 'dist/index.cjs.js', format: 'cjs' },
  { file: 'dist/index.umd.js', format: 'umd' },
]
```

### Q: 类型定义文件不完整？

**A:** 检查 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  }
}
```

### Q: UMD 包在浏览器中无法使用？

**A:** 检查全局变量名配置：

```javascript
// rollup.config.js
output: {
  format: 'umd',
  name: 'ExcelViewerCore', // 确保设置了正确的全局变量名
  globals: {
    xlsx: 'XLSX',
    luckysheet: 'luckysheet'
  }
}
```

## 性能测试

### 1. 构建时间

```bash
time npm run build
```

预期时间：
- 首次构建: 10-30秒
- 增量构建: 5-15秒

### 2. 包大小分析

```bash
# 安装分析工具
npm install -D rollup-plugin-visualizer

# 添加到 rollup.config.js
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  // ...
  visualizer({ filename: 'stats.html' })
]

# 构建后查看 stats.html
```

### 3. Tree Shaking 验证

检查未使用的代码是否被移除：

```bash
# 搜索不应该出现在生产包中的代码
grep -r "console.log" packages/*/dist/*.js
grep -r "debugger" packages/*/dist/*.js
```

## 持续集成

### GitHub Actions 示例

```yaml
# .github/workflows/build-test.yml
name: Build Test

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:build
```

## 发布前检查清单

构建测试完成后，发布前确认：

- [ ] 所有包构建成功
- [ ] 输出文件完整（ESM, CJS, UMD, d.ts）
- [ ] 类型定义正确
- [ ] 示例项目可正常运行
- [ ] 没有 TypeScript 错误
- [ ] 没有 ESLint 错误
- [ ] 包大小合理
- [ ] Source Map 生成正确
- [ ] README 和文档已更新
- [ ] CHANGELOG 已更新
- [ ] 版本号已更新

## 总结

完整的测试流程：

```bash
# 1. 清理
npm run clean

# 2. 安装依赖
npm install

# 3. 类型检查
npm run type-check

# 4. 代码检查
npm run lint

# 5. 构建所有包
npm run build

# 6. 自动化测试
npm run test:build

# 7. 测试示例项目
npm run dev:vue  # 或其他示例

# 8. 构建示例
npm run build:examples
```

全部通过后即可发布！🎉

---

**测试愉快！✨**


