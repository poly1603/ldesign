# @ldesign/i18n 示例项目

本目录包含了 @ldesign/i18n 的使用示例，展示了如何在不同环境中集成和使用多语言功能。

## 📁 目录结构

```
examples/
├── vanilla/          # 原生 JavaScript 示例
│   ├── index.html   # 示例页面
│   ├── package.json # 项目配置
│   └── vite.config.js # Vite 配置
└── vue/             # Vue 3 示例
    ├── src/
    │   ├── App.vue  # 主组件
    │   └── main.ts  # 入口文件
    ├── index.html   # HTML 模板
    ├── package.json # 项目配置
    ├── vite.config.ts # Vite 配置
    └── tsconfig.json # TypeScript 配置
```

## 🚀 快速开始

### 前置条件

确保您已经构建了主项目：

```bash
# 在项目根目录
cd packages/i18n
pnpm install
pnpm build
```

### 运行 Vanilla JavaScript 示例

```bash
# 进入 vanilla 示例目录
cd examples/vanilla

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 http://localhost:3000 启动，展示以下功能：

- 基础翻译
- 字符串插值
- 复数处理
- 嵌套键访问
- 批量翻译
- 语言切换
- 语言信息获取

### 运行 Vue 3 示例

```bash
# 进入 Vue 示例目录
cd examples/vue

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 http://localhost:3001 启动，展示以下功能：

- Vue 组合式 API 使用
- v-t 指令
- 响应式语言切换
- 条件翻译
- 批量翻译
- 语言切换器组件

## 📚 示例功能说明

### Vanilla JavaScript 示例特性

1. **基础翻译**：展示简单的键值翻译
2. **插值翻译**：展示带参数的字符串插值
3. **复数处理**：展示不同数量下的复数形式
4. **嵌套键**：展示点分隔的嵌套键访问
5. **批量翻译**：展示一次性翻译多个键
6. **语言信息**：展示当前语言和可用语言信息
7. **动态切换**：展示运行时语言切换

### Vue 3 示例特性

1. **组合式 API**：使用 `useI18n()` 钩子
2. **模板指令**：使用 `v-t` 指令进行模板翻译
3. **响应式切换**：语言切换时自动更新界面
4. **语言切换器**：使用 `useLanguageSwitcher()` 钩子
5. **条件翻译**：使用 `useConditionalTranslation()` 钩子
6. **批量翻译**：使用 `useBatchTranslation()` 钩子
7. **全局属性**：在模板中使用 `$t` 函数

## 🔧 自定义配置

### 修改端口

如果需要修改开发服务器端口，可以编辑对应的 `vite.config.js` 或 `vite.config.ts` 文件：

```javascript
// vanilla/vite.config.js
export default defineConfig({
  server: {
    port: 3000, // 修改为您想要的端口
    open: true
  }
})
```

```typescript
// vue/vite.config.ts
export default defineConfig({
  server: {
    port: 3001, // 修改为您想要的端口
    open: true
  }
})
```

### 添加新的语言

要添加新的语言支持，请参考主项目的语言包结构，在 `src/locales/` 目录下添加新的语言文件。

## 📝 构建生产版本

### Vanilla JavaScript 示例

```bash
cd examples/vanilla
pnpm build
```

构建产物将输出到 `dist/` 目录。

### Vue 3 示例

```bash
cd examples/vue
pnpm build
```

构建产物将输出到 `dist/` 目录，包含类型检查。

## 🐛 故障排除

### 常见问题

1. **模块找不到错误**
   - 确保已经构建了主项目：`cd packages/i18n && pnpm build`
   - 检查 vite.config 中的 alias 配置是否正确

2. **类型错误**
   - 确保 TypeScript 配置正确
   - 运行 `pnpm type-check` 检查类型问题

3. **端口冲突**
   - 修改 vite.config 中的端口配置
   - 或者使用 `pnpm dev --port 3002` 指定端口

### 获取帮助

如果遇到问题，请：

1. 检查控制台错误信息
2. 确认依赖安装正确
3. 查看主项目的 README.md 文档
4. 提交 Issue 到项目仓库
