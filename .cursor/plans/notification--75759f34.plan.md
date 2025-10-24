<!-- 75759f34-c699-4e73-a5b0-06df34ef4d59 af9b3f85-eab8-448f-b885-6fb31e2dba4a -->
# @ldesign/notification 包优化和完善计划

## 发现的问题

### 1. **样式导入路径问题**

- 示例中使用 `@ldesign/notification/styles` 但 package.json exports 未定义此路径
- 应改为 `@ldesign/notification/es/index.css` 或在 exports 中添加 `/styles` 别名

### 2. **Vite 配置缺少 alias 和 optimizeDeps**

- Vue/React 示例的 vite.config.js 缺少对本地包的别名配置
- 没有配置 `optimizeDeps.exclude` 排除本地工作区包
- 缺少 `host: true` 配置用于网络访问

### 3. **React 示例缺少 host 配置**

- react-example/vite.config.js 缺少 `host: true` 配置

### 4. **package.json exports 优化**

- 添加 `/styles` 导出别名简化样式引用
- 确保所有导出路径清晰明确

### 5. **tsconfig.json 配置问题**

- `outDir` 设置为 `dist` 但实际输出到 `es`/`lib`/`dist`
- 应该移除 outDir 或设置为更合适的值

### 6. **vanilla-js 示例样式导入**

- 使用了不存在的导出路径

### 7. **缺少 .npmignore 文件**

- 应添加 .npmignore 避免发布示例和文档文件

## 优化方案

### 1. 更新 package.json exports

```json
"./styles": "./es/index.css",
```

### 2. 优化 Vue 示例 vite.config.js

- 添加路径别名指向本地源码
- 添加 optimizeDeps 配置
- 确保 host: true

### 3. 优化 React 示例 vite.config.js

- 添加路径别名
- 添加 optimizeDeps 配置
- 添加 host: true

### 4. 优化 Vanilla JS 示例 vite.config.js

- 添加路径别名
- 添加 optimizeDeps 配置
- 添加 host: true

### 5. 修复 tsconfig.json

- 移除或修正 outDir 配置
- 添加 lib 配置

### 6. 添加 .npmignore 文件

排除：

- examples/
- 各种 .md 文档（除 README.md 和 LICENSE）
- 开发配置文件
- 测试文件

### 7. 优化 rollup.umd.config.js

- 确保 postcss 配置正确
- 确保 CSS 正确提取

### 8. 验证所有示例能正常启动

- 测试 vue-example 能启动和打包
- 测试 react-example 能启动和打包
- 测试 vanilla-js 能启动和打包

## 实施步骤

1. 更新 package.json exports 添加 `/styles` 别名
2. 更新所有示例的 vite.config.js 添加别名和优化配置
3. 修复 tsconfig.json 配置
4. 添加 .npmignore 文件
5. 更新示例中的样式导入语句（可选，保持兼容性）
6. 验证所有配置正确性

## 预期结果

- ✅ 所有示例能正常启动（pnpm dev）
- ✅ 所有示例能正常打包（pnpm build）
- ✅ 样式导入路径统一且清晰
- ✅ 开发体验优化（热更新、别名）
- ✅ npm 发布配置完善
- ✅ 配置文件标准化

### To-dos

- [ ] 更新 package.json exports 添加 /styles 别名
- [ ] 优化所有示例的 vite.config.js 添加 alias、optimizeDeps 和 host 配置
- [ ] 修复 tsconfig.json 的 outDir 配置
- [ ] 添加 .npmignore 文件排除不必要的发布内容
- [ ] 验证所有三个示例（vue/react/vanilla-js）能正常启动和打包