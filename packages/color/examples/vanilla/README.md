# Vanilla JavaScript 示例

这是一个使用纯 JavaScript 和 HTML 的 @ldesign/color 示例项目，展示了框架无关的主题管理功能。

## 功能特性

### 🎨 主题管理
- 预设主题切换（10个内置主题）
- 亮色/暗色模式切换
- 随机主题选择
- 系统主题检测和同步

### 🌈 颜色生成
- 从主色调自动生成配套颜色
- 实时颜色预览
- 点击复制颜色值

### 📊 色阶展示
- 完整的 10 级色阶可视化
- 支持亮色和暗色模式
- 交互式色阶预览

### 🛠️ 自定义主题
- 创建自定义主题
- 支持亮色和暗色模式配置
- 实时预览效果

### ⚡ 性能监控
- 显示性能统计信息
- 闲时处理状态
- 缓存使用情况

## 运行示例

### 安装依赖

```bash
# 在 packages/color 目录下
pnpm install

# 或者在项目根目录下
pnpm install
```

### 启动开发服务器

```bash
# 在 examples/vanilla 目录下
pnpm dev

# 或者在 packages/color 目录下
pnpm example:vanilla
```

访问 http://localhost:3001 查看示例。

### 构建生产版本

```bash
pnpm build
```

## 项目结构

```
vanilla/
├── src/
│   ├── main.js          # 主要逻辑
│   └── styles.css       # 样式文件
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── README.md           # 说明文档
```

## 核心功能演示

### 1. 主题切换

```javascript
// 切换到绿色主题
await themeManager.setTheme('green')

// 切换到暗色模式
await themeManager.setMode('dark')

// 同时设置主题和模式
await themeManager.setTheme('purple', 'dark')
```

### 2. 颜色生成

```javascript
import { generateColorConfig } from '@ldesign/color'

// 从主色调生成完整颜色配置
const colors = generateColorConfig('#1890ff')
console.log(colors)
// {
//   primary: '#1890ff',
//   success: '#52c41a',
//   warning: '#faad14',
//   danger: '#ff4d4f',
//   gray: '#8c8c8c'
// }
```

### 3. 系统主题检测

```javascript
import { getSystemTheme, watchSystemTheme } from '@ldesign/color'

// 获取当前系统主题
const systemTheme = getSystemTheme() // 'light' | 'dark'

// 监听系统主题变化
const unwatch = watchSystemTheme((mode) => {
  console.log('系统主题变化:', mode)
  themeManager.setMode(mode)
})
```

### 4. 自定义主题

```javascript
import { createCustomTheme } from '@ldesign/color'

// 创建自定义主题
const customTheme = createCustomTheme('my-theme', '#ff6b35', {
  displayName: '我的主题',
  description: '自定义橙色主题',
  darkPrimaryColor: '#e55a2b'
})

// 注册主题
themeManager.registerTheme(customTheme)

// 应用主题
await themeManager.setTheme('my-theme')
```

## 样式使用

示例中使用了 CSS 自定义属性来应用主题颜色：

```css
/* 基础颜色 */
.element {
  background: var(--color-primary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

/* 语义化颜色 */
.success-button {
  background: var(--color-success);
}

.danger-button {
  background: var(--color-danger);
}

/* 色阶颜色 */
.light-bg {
  background: var(--color-primary-1);
}

.hover-effect:hover {
  background: var(--color-primary-hover);
}
```

## 性能优化

示例展示了多种性能优化技术：

### 闲时处理
```javascript
const themeManager = await createThemeManagerWithPresets({
  idleProcessing: true // 启用闲时处理
})

// 预生成所有主题
await themeManager.preGenerateAllThemes()
```

### 缓存配置
```javascript
const themeManager = await createThemeManagerWithPresets({
  cache: {
    maxSize: 50, // 最大缓存数量
    defaultTTL: 3600000 // 缓存过期时间
  }
})
```

## 浏览器兼容性

- Chrome >= 60
- Firefox >= 55
- Safari >= 12
- Edge >= 79

## 调试技巧

1. **查看生成的 CSS 变量**：
   ```javascript
   const theme = themeManager.getGeneratedTheme('default')
   console.log(theme.light.cssVariables)
   ```

2. **监听主题变化**：
   ```javascript
   themeManager.on('theme-changed', (data) => {
     console.log('主题变化:', data)
   })
   ```

3. **检查性能统计**：
   ```javascript
   console.log('主题数量:', themeManager.getThemeNames().length)
   console.log('当前主题:', themeManager.getCurrentTheme())
   ```

## 常见问题

### Q: 为什么主题切换没有效果？
A: 确保 CSS 中使用了正确的 CSS 变量名，并且主题管理器已经正确初始化。

### Q: 如何自定义 CSS 变量前缀？
A: 在创建主题管理器时设置 `cssPrefix` 选项：
```javascript
const themeManager = await createThemeManagerWithPresets({
  cssPrefix: '--my-app-color'
})
```

### Q: 如何在服务端渲染中使用？
A: 核心功能支持 SSR，但需要在客户端激活系统主题检测等浏览器特性。

## 相关链接

- [主项目文档](../../README.md)
- [API 参考](../../docs/api/)
- [Vue 3 示例](../vue/)
- [GitHub 仓库](https://github.com/ldesign/color)
