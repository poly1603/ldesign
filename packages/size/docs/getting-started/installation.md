# 安装指南

本指南将帮助你在项目中安装和配置 @ldesign/size。

## 📦 安装

### 使用包管理器安装

我们推荐使用 pnpm，但你也可以使用 npm 或 yarn：

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/size

# 使用 npm
npm install @ldesign/size

# 使用 yarn
yarn add @ldesign/size
```

### CDN 引入

如果你想通过 CDN 使用，可以直接在 HTML 中引入：

```html
<!-- 引入核心库 -->
<script src="https://unpkg.com/@ldesign/size@latest/dist/index.umd.js"></script>

<!-- 如果需要Vue支持 -->
<script src="https://unpkg.com/@ldesign/size@latest/dist/vue.umd.js"></script>
```

## 🔧 环境要求

### 浏览器支持

@ldesign/size 支持所有现代浏览器：

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

### Node.js 版本

如果你在 Node.js 环境中使用（如 SSR），需要：

- Node.js >= 14.0.0

### 框架版本

- Vue.js >= 3.0.0 (如果使用 Vue 功能)
- TypeScript >= 4.0.0 (如果使用 TypeScript)

## ⚙️ 基础配置

### 1. 导入核心功能

```javascript
// ES6 模块
import { globalSizeManager } from '@ldesign/size'

// CommonJS
const { globalSizeManager } = require('@ldesign/size')

// CDN 全局变量
const { globalSizeManager } = window.LDesignSize
```

### 2. 初始化

最简单的初始化方式：

```javascript
import { globalSizeManager } from '@ldesign/size'

// 设置默认模式
globalSizeManager.setMode('medium')

// 开始使用！
console.log('当前模式:', globalSizeManager.getCurrentMode())
```

### 3. 自定义配置

如果需要自定义配置：

```javascript
import { createSizeManager } from '@ldesign/size'

const sizeManager = createSizeManager({
  defaultMode: 'large', // 默认尺寸模式
  prefix: '--my-app', // CSS变量前缀
  styleId: 'my-size-vars', // 样式标签ID
  selector: ':root', // CSS选择器
  autoInject: true, // 自动注入CSS
})
```

## 🎨 样式集成

### CSS 变量

@ldesign/size 会自动生成 CSS 变量，你可以在样式中直接使用：

```css
.my-component {
  font-size: var(--ls-font-size-base);
  padding: var(--ls-spacing-base);
  border-radius: var(--ls-border-radius-base);
}

.my-button {
  height: var(--ls-button-height-medium);
  font-size: var(--ls-font-size-sm);
}
```

### 预设样式

如果你想要一些预设的样式类，可以创建：

```css
/* 响应式字体类 */
.text-xs {
  font-size: var(--ls-font-size-xs);
}
.text-sm {
  font-size: var(--ls-font-size-sm);
}
.text-base {
  font-size: var(--ls-font-size-base);
}
.text-lg {
  font-size: var(--ls-font-size-lg);
}

/* 响应式间距类 */
.p-xs {
  padding: var(--ls-spacing-xs);
}
.p-sm {
  padding: var(--ls-spacing-sm);
}
.p-base {
  padding: var(--ls-spacing-base);
}
.p-lg {
  padding: var(--ls-spacing-lg);
}

/* 响应式组件类 */
.btn {
  height: var(--ls-button-height-medium);
  padding: 0 var(--ls-spacing-base);
  font-size: var(--ls-font-size-sm);
  border-radius: var(--ls-border-radius-base);
}
```

## 🔍 验证安装

创建一个简单的测试页面来验证安装是否成功：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ldesign/size 测试</title>
    <style>
      .test-box {
        padding: var(--ls-spacing-lg);
        font-size: var(--ls-font-size-base);
        border-radius: var(--ls-border-radius-base);
        background: #f0f0f0;
        margin: var(--ls-spacing-base) 0;
      }

      .test-button {
        height: var(--ls-button-height-medium);
        padding: 0 var(--ls-spacing-base);
        font-size: var(--ls-font-size-sm);
        border: none;
        border-radius: var(--ls-border-radius-base);
        background: #1890ff;
        color: white;
        cursor: pointer;
        margin-right: var(--ls-spacing-sm);
      }
    </style>
  </head>
  <body>
    <div class="test-box">
      <h1>@ldesign/size 测试页面</h1>
      <p>当前尺寸模式: <span id="current-mode">loading...</span></p>

      <div>
        <button class="test-button" onclick="setMode('small')">小尺寸</button>
        <button class="test-button" onclick="setMode('medium')">中尺寸</button>
        <button class="test-button" onclick="setMode('large')">大尺寸</button>
        <button class="test-button" onclick="setMode('extra-large')">超大尺寸</button>
      </div>
    </div>

    <script type="module">
      import { globalSizeManager } from '@ldesign/size'

      // 更新显示
      function updateDisplay() {
        document.getElementById('current-mode').textContent = globalSizeManager.getCurrentMode()
      }

      // 设置模式
      window.setMode = mode => {
        globalSizeManager.setMode(mode)
        updateDisplay()
      }

      // 监听变化
      globalSizeManager.onSizeChange(() => {
        updateDisplay()
      })

      // 初始化
      updateDisplay()

      console.log('✅ @ldesign/size 安装成功！')
    </script>
  </body>
</html>
```

如果页面正常显示并且按钮可以切换尺寸，说明安装成功！

## 🚀 下一步

安装完成后，你可以：

1. [学习基础使用](./basic-usage.md) - 了解基本的 API 使用
2. [Vue 集成指南](./vue-integration.md) - 如果你使用 Vue 框架
3. [查看示例项目](../examples/vue-example.md) - 学习完整的使用方式

## ❓ 遇到问题？

如果在安装过程中遇到问题，请查看：

- [常见问题](../troubleshooting/faq.md)
- [兼容性说明](../troubleshooting/compatibility.md)
- [GitHub Issues](https://github.com/ldesign/ldesign/issues)
