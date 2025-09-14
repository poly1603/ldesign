# 快速开始

本指南将帮助您快速上手 @ldesign/captcha，在几分钟内集成验证码功能。

## 安装

首先，使用您喜欢的包管理器安装 @ldesign/captcha：

::: code-group

```bash [npm]
npm install @ldesign/captcha
```

```bash [yarn]
yarn add @ldesign/captcha
```

```bash [pnpm]
pnpm add @ldesign/captcha
```

:::

## 基础用法

### 1. 准备 HTML 容器

在您的 HTML 中准备一个容器元素：

```html
<div id="captcha-container"></div>
```

### 2. 创建验证码实例

```javascript
import { SlidePuzzleCaptcha } from '@ldesign/captcha'

const captcha = new SlidePuzzleCaptcha({
  container: document.getElementById('captcha-container'),
  width: 320,
  height: 180,
  onSuccess: (result) => {
    console.log('验证成功:', result)
    // 处理验证成功逻辑
  },
  onFail: (error) => {
    console.log('验证失败:', error)
    // 处理验证失败逻辑
  }
})
```

### 3. 初始化验证码

```javascript
// 初始化验证码
await captcha.init()
```

## 完整示例

这是一个完整的 HTML 页面示例：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>验证码示例</title>
</head>
<body>
  <div id="captcha-container"></div>
  
  <script type="module">
    import { SlidePuzzleCaptcha } from '@ldesign/captcha'
    
    const captcha = new SlidePuzzleCaptcha({
      container: document.getElementById('captcha-container'),
      width: 320,
      height: 180,
      onSuccess: (result) => {
        alert('验证成功！')
        console.log('验证结果:', result)
      },
      onFail: (error) => {
        alert('验证失败，请重试')
        console.log('错误信息:', error)
      },
      onStatusChange: (status) => {
        console.log('状态变化:', status)
      }
    })
    
    // 初始化验证码
    captcha.init().then(() => {
      console.log('验证码初始化完成')
    }).catch((error) => {
      console.error('初始化失败:', error)
    })
  </script>
</body>
</html>
```

## 验证码类型

@ldesign/captcha 支持多种验证码类型：

### 滑动拼图验证

```javascript
import { SlidePuzzleCaptcha } from '@ldesign/captcha'

const slidePuzzle = new SlidePuzzleCaptcha({
  container: element,
  tolerance: 5, // 容错范围
  imageUrl: '/api/captcha/puzzle-image'
})
```

### 按顺序点击文字验证

```javascript
import { ClickTextCaptcha } from '@ldesign/captcha'

const clickText = new ClickTextCaptcha({
  container: element,
  textCount: 4, // 文字数量
  texts: ['春', '夏', '秋', '冬'] // 自定义文字
})
```

### 滑动滑块图片回正验证

```javascript
import { RotateSliderCaptcha } from '@ldesign/captcha'

const rotateSlider = new RotateSliderCaptcha({
  container: element,
  sliderStyle: 'circular', // 'circular' 或 'linear'
  tolerance: 8 // 角度容错范围
})
```

### 点击验证

```javascript
import { ClickCaptcha } from '@ldesign/captcha'

const click = new ClickCaptcha({
  container: element,
  maxClicks: 3, // 最大点击次数
  tolerance: 15 // 点击容错范围
})
```

## 事件处理

验证码支持多种事件，您可以监听这些事件来处理不同的状态：

```javascript
const captcha = new SlidePuzzleCaptcha(config)

// 验证成功
captcha.on('success', (result) => {
  console.log('验证成功:', result)
  // result 包含验证结果、耗时、令牌等信息
})

// 验证失败
captcha.on('fail', (error) => {
  console.log('验证失败:', error)
  // error 包含错误代码、消息、时间戳等信息
})

// 状态变化
captcha.on('statusChange', (status) => {
  console.log('状态变化:', status)
  // 可能的状态：UNINITIALIZED, INITIALIZING, READY, VERIFYING, SUCCESS, FAILED, ERROR
})

// 开始验证
captcha.on('start', () => {
  console.log('开始验证')
})

// 验证进度
captcha.on('progress', (data) => {
  console.log('验证进度:', data)
})

// 重试
captcha.on('retry', () => {
  console.log('重试验证')
})
```

## 方法调用

验证码实例提供了多个方法来控制验证流程：

```javascript
// 初始化验证码
await captcha.init()

// 开始验证（某些类型需要手动开始）
captcha.start()

// 重置验证码
captcha.reset()

// 重试验证
captcha.retry()

// 手动验证（传入验证数据）
const result = await captcha.verify(data)

// 获取当前状态
const status = captcha.getStatus()

// 检查状态
if (captcha.isReady()) {
  // 验证码已准备就绪
}

// 销毁验证码
captcha.destroy()
```

## 配置选项

每个验证码都支持丰富的配置选项：

```javascript
const captcha = new SlidePuzzleCaptcha({
  // 基础配置
  container: element,        // 容器元素
  width: 320,               // 宽度
  height: 180,              // 高度
  disabled: false,          // 是否禁用
  debug: false,             // 调试模式
  
  // 主题配置
  theme: 'default',         // 主题名称
  
  // 事件回调
  onSuccess: (result) => {},
  onFail: (error) => {},
  onStatusChange: (status) => {},
  onRetry: () => {},
  
  // 特定配置（根据验证码类型不同）
  tolerance: 5,             // 容错范围
  imageUrl: '/api/image',   // 图片URL
  // ... 更多配置
})
```

## 样式定制

@ldesign/captcha 使用 CSS 变量来支持样式定制：

```css
:root {
  --captcha-primary-color: #722ED1;
  --captcha-border-color: #d9d9d9;
  --captcha-background-color: #ffffff;
  --captcha-text-color: #333333;
  --captcha-border-radius: 6px;
  --captcha-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

您也可以通过 CSS 类名来自定义样式：

```css
.ldesign-captcha {
  /* 自定义验证码容器样式 */
}

.ldesign-captcha-slide-puzzle {
  /* 自定义滑动拼图样式 */
}
```

## 下一步

现在您已经了解了基础用法，可以继续学习：

- [安装](/guide/installation) - 详细的安装和配置说明
- [验证码类型](/guide/slide-puzzle) - 了解各种验证码类型的详细用法
- [主题定制](/guide/themes) - 学习如何定制主题
- [框架集成](/guide/vue) - 在 Vue、React、Angular 中使用
- [API 参考](/api/) - 完整的 API 文档
