# 示例项目启动指南

本指南详细说明如何启动和运行 @ldesign/i18n 的示例项目。

## 前置条件

确保您的系统满足以下要求：

- **Node.js**: >= 16.0.0
- **pnpm**: >= 8.0.0 (推荐) 或 npm >= 8.0.0
- **现代浏览器**: Chrome 90+, Firefox 88+, Safari 14+

## 快速启动

### 1. 构建主项目

在运行示例之前，必须先构建主项目：

```bash
# 进入主项目目录
cd packages/i18n

# 安装依赖
pnpm install

# 构建项目（生成 es/, lib/, dist/, types/ 目录）
pnpm build
```

**验证构建成功：**

```bash
# 检查构建产物
ls -la es/     # ESM 格式
ls -la lib/    # CommonJS 格式
ls -la dist/   # UMD 格式
ls -la types/  # TypeScript 类型定义
```

### 2. 启动 Vanilla JavaScript 示例

```bash
# 进入 vanilla 示例目录
cd examples/vanilla

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 **http://localhost:3000** 启动。

### 3. 启动 Vue 3 示例

```bash
# 进入 Vue 示例目录
cd examples/vue

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

示例将在 **http://localhost:3001** 启动。

## 详细启动步骤

### Vanilla JavaScript 示例

#### 目录结构

```
examples/vanilla/
├── index.html          # 主页面
├── package.json        # 项目配置
├── vite.config.js      # Vite 配置
└── README.md          # 说明文档
```

#### 启动命令

```bash
# 方法1：从主项目根目录
pnpm example:vanilla

# 方法2：直接在示例目录
cd examples/vanilla
pnpm dev

# 方法3：指定端口
cd examples/vanilla
pnpm dev --port 3002
```

#### 功能演示

- ✅ 基础翻译功能
- ✅ 字符串插值
- ✅ 复数处理
- ✅ 嵌套键访问
- ✅ 批量翻译
- ✅ 动态语言切换
- ✅ 语言信息获取

### Vue 3 示例

#### 目录结构

```
examples/vue/
├── src/
│   ├── App.vue        # 主组件
│   └── main.ts        # 入口文件
├── index.html         # HTML 模板
├── package.json       # 项目配置
├── vite.config.ts     # Vite 配置
├── tsconfig.json      # TypeScript 配置
└── README.md         # 说明文档
```

#### 启动命令

```bash
# 方法1：从主项目根目录
pnpm example:vue

# 方法2：直接在示例目录
cd examples/vue
pnpm dev

# 方法3：构建生产版本
cd examples/vue
pnpm build
pnpm preview
```

#### 功能演示

- ✅ Vue 组合式 API (`useI18n`)
- ✅ v-t 指令使用
- ✅ 响应式语言切换
- ✅ 语言切换器组件
- ✅ 条件翻译
- ✅ 批量翻译
- ✅ 全局属性 ($t, $i18n)

## 故障排除

### 常见问题及解决方案

#### 1. 模块找不到错误

**错误信息：**

```
Cannot resolve module '@ldesign/i18n'
```

**解决方案：**

```bash
# 确保主项目已构建
cd packages/i18n
pnpm build

# 检查构建产物
ls -la es/ lib/ dist/ types/

# 重新安装示例依赖
cd examples/vanilla  # 或 examples/vue
rm -rf node_modules
pnpm install
```

#### 2. TypeScript 类型错误

**错误信息：**

```
Cannot find module '@ldesign/i18n/vue' or its corresponding type declarations
```

**解决方案：**

```bash
# 确保类型定义文件存在
ls -la types/vue/index.d.ts

# 重启 TypeScript 服务
# 在 VS Code 中：Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

#### 3. 端口冲突

**错误信息：**

```
Port 3000 is already in use
```

**解决方案：**

```bash
# 方法1：指定其他端口
pnpm dev --port 3002

# 方法2：修改 vite.config.js
# 将 port: 3000 改为其他端口号
```

#### 4. 构建失败

**错误信息：**

```
Build failed with errors
```

**解决方案：**

```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 重新安装
rm -rf node_modules
pnpm install

# 检查 Node.js 版本
node --version  # 应该 >= 16.0.0
```

#### 5. 浏览器兼容性问题

**症状：** 页面空白或 JavaScript 错误

**解决方案：**

- 使用现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)
- 检查浏览器控制台错误信息
- 尝试无痕模式排除扩展干扰

### 调试技巧

#### 1. 启用调试模式

在示例代码中添加调试配置：

```javascript
const i18n = await createI18nWithBuiltinLocales({
  defaultLocale: 'en',
  debug: true, // 启用调试模式
  onLanguageChanged: (locale) => {
    console.log('Language changed to:', locale)
  },
  onLoadError: (locale, error) => {
    console.error('Load error:', locale, error)
  }
})
```

#### 2. 检查网络请求

打开浏览器开发者工具的 Network 标签，检查：

- 静态资源是否正确加载
- 是否有 404 错误
- 响应时间是否正常

#### 3. 查看控制台日志

检查浏览器控制台的错误和警告信息：

```javascript
// 在示例代码中添加日志
console.log('I18n instance:', i18n)
console.log('Current language:', i18n.getCurrentLanguage())
console.log('Available languages:', i18n.getAvailableLanguages())
```

## 自定义配置

### 修改端口

#### Vanilla 示例

```javascript
// examples/vanilla/vite.config.js
export default defineConfig({
  server: {
    port: 3002, // 修改端口
    open: true
  }
})
```

#### Vue 示例

```typescript
// examples/vue/vite.config.ts
export default defineConfig({
  server: {
    port: 3003, // 修改端口
    open: true
  }
})
```

### 添加新功能

#### 在 Vanilla 示例中添加新功能

```javascript
// 在 index.html 中添加新的演示
function demonstrateNewFeature() {
  // 添加自定义翻译逻辑
  const result = i18n.t('custom.key', { param: 'value' })
  document.getElementById('new-feature').textContent = result
}
```

#### 在 Vue 示例中添加新组件

```vue
<!-- 创建新的 Vue 组件 -->
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
const { t } = useI18n()
</script>

<template>
  <div class="new-feature">
    <h3>{{ t('newFeature.title') }}</h3>
    <p>{{ t('newFeature.description') }}</p>
  </div>
</template>
```

## 性能监控

### 监控翻译性能

```javascript
// 添加性能监控
const startTime = performance.now()
const result = i18n.t('some.key')
const endTime = performance.now()
console.log(`Translation took ${endTime - startTime} milliseconds`)

// 监控缓存命中率
console.log('Cache size:', i18n.cache?.size())
console.log('Cache hit rate:', i18n.cache?.getHitRate?.())
```

### 内存使用监控

```javascript
// 监控内存使用
if (performance.memory) {
  console.log('Memory usage:', {
    used: `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`,
    total: `${Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)} MB`,
    limit: `${Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)} MB`
  })
}
```

## 部署指南

### 构建生产版本

#### Vanilla 示例

```bash
cd examples/vanilla
pnpm build
# 产物在 dist/ 目录
```

#### Vue 示例

```bash
cd examples/vue
pnpm build
# 产物在 dist/ 目录
```

### 静态部署

构建完成后，可以将 `dist/` 目录部署到任何静态文件服务器：

- **Nginx**
- **Apache**
- **GitHub Pages**
- **Netlify**
- **Vercel**

## 获取帮助

如果遇到问题，请：

1. **检查控制台错误信息**
2. **确认 Node.js 和 pnpm 版本**
3. **查看项目 README.md**
4. **提交 Issue 到 GitHub 仓库**

---

**快速启动命令总结：**

```bash
# 1. 构建主项目
cd packages/i18n && pnpm install && pnpm build

# 2. 启动 Vanilla 示例
cd examples/vanilla && pnpm install && pnpm dev

# 3. 启动 Vue 示例
cd examples/vue && pnpm install && pnpm dev
```
