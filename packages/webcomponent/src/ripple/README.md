# LRipple 水波纹组件

一个高性能、可配置的 Material Design 风格水波纹效果 Web Component 组件。

## ✨ 特性

- 🎯 **多种触发方式** - 支持 click、mousedown、pointerdown 等多种触发方式
- 🎨 **丰富的配置选项** - 颜色、透明度、动画时长、缓动函数等完全可配置
- ⚡ **高性能** - 使用 GPU 加速，transform3d 优化，支持 will-change
- 📱 **响应式支持** - 完美支持触摸设备，自动适配移动端
- ♿ **无障碍支持** - 支持 prefers-reduced-motion，尊重用户偏好
- 🔧 **灵活的 API** - 提供丰富的 JavaScript API，支持动态控制
- 🎭 **多种使用场景** - 按钮、卡片、列表项、图片等各种元素都可使用

## 📦 安装

### 直接使用

```html
<script type="module">
  import './ripple.js';
</script>
```

### NPM 安装

```bash
npm install @ldesign/ripple
```

```javascript
import '@ldesign/ripple';
// 或
import { LRipple } from '@ldesign/ripple';
```

## 🚀 快速开始

### 基础用法

```html
<button class="btn">
  <l-ripple></l-ripple>
  点击我
</button>
```

### 自定义配置

```html
<button class="btn">
  <l-ripple 
    ripple-color="#667eea"
    ripple-opacity="0.3"
    ripple-duration="800"
    ripple-centered="true">
  </l-ripple>
  自定义波纹
</button>
```

## 📋 配置选项

### HTML 属性

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `ripple-color` | string | `currentColor` | 波纹颜色 |
| `ripple-opacity` | number | `0.24` | 波纹透明度（0-1） |
| `ripple-duration` | number | `600` | 波纹扩散持续时间（毫秒） |
| `ripple-fade-out-duration` | number | `300` | 波纹消失持续时间（毫秒） |
| `ripple-radius` | number \| 'auto' | `auto` | 波纹半径，'auto' 表示自动计算 |
| `ripple-centered` | boolean | `false` | 是否始终从中心开始扩散 |
| `ripple-disabled` | boolean | `false` | 是否禁用波纹效果 |
| `ripple-trigger` | string | `pointerdown` | 触发方式：'click' \| 'mousedown' \| 'pointerdown' |
| `ripple-touch-enabled` | boolean | `true` | 是否在触摸设备上启用 |
| `ripple-easing` | string | `cubic-bezier(0.4, 0, 0.2, 1)` | 动画缓动函数 |
| `ripple-max-ripples` | number | `10` | 最大同时存在的波纹数量 |
| `ripple-unbounded` | boolean | `false` | 波纹是否可以超出容器边界 |

### JavaScript API

#### 方法

```javascript
const ripple = document.querySelector('l-ripple');

// 手动触发波纹
ripple.trigger(x, y); // x, y 为可选的坐标位置

// 更新配置
ripple.updateOptions({
  color: '#667eea',
  duration: 600,
  opacity: 0.3
});

// 启用波纹
ripple.enable();

// 禁用波纹
ripple.disable();

// 销毁组件
ripple.destroy();
```

#### 事件

```javascript
// 波纹开始
element.addEventListener('rippleStart', (e) => {
  console.log('Ripple started at:', e.detail.x, e.detail.y);
});

// 波纹结束
element.addEventListener('rippleEnd', () => {
  console.log('Ripple ended');
});
```

## 🎨 使用示例

### 按钮

```html
<!-- 主要按钮 -->
<button class="btn btn-primary">
  <l-ripple></l-ripple>
  Primary Button
</button>

<!-- 图标按钮 -->
<button class="icon-btn">
  <l-ripple ripple-centered="true"></l-ripple>
  ❤️
</button>

<!-- FAB 按钮 -->
<button class="fab">
  <l-ripple ripple-color="rgba(255, 255, 255, 0.3)"></l-ripple>
  +
</button>
```

### 卡片

```html
<div class="card">
  <l-ripple ripple-color="#667eea" ripple-opacity="0.1"></l-ripple>
  <h3>Card Title</h3>
  <p>Card content goes here...</p>
</div>
```

### 列表项

```html
<ul class="list">
  <li class="list-item">
    <l-ripple></l-ripple>
    <span>List Item 1</span>
  </li>
  <li class="list-item">
    <l-ripple></l-ripple>
    <span>List Item 2</span>
  </li>
</ul>
```

### 图片容器

```html
<div class="image-container">
  <l-ripple ripple-color="rgba(255, 255, 255, 0.3)"></l-ripple>
  <img src="image.jpg" alt="Image">
</div>
```

## 🎯 高级用法

### 动态控制

```javascript
// 获取组件实例
const ripple = document.querySelector('#my-ripple');

// 根据用户偏好动态更新主题
function setDarkTheme() {
  ripple.updateOptions({
    color: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.2
  });
}

function setLightTheme() {
  ripple.updateOptions({
    color: 'rgba(0, 0, 0, 0.12)',
    opacity: 0.24
  });
}
```

### 条件触发

```javascript
const button = document.querySelector('#my-button');
const ripple = button.querySelector('l-ripple');

// 根据条件启用/禁用
if (userCanInteract) {
  ripple.enable();
} else {
  ripple.disable();
}
```

### 自定义动画

```html
<button class="btn">
  <l-ripple 
    ripple-duration="1200"
    ripple-easing="cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    ripple-fade-out-duration="400">
  </l-ripple>
  弹性动画
</button>
```

## 🎨 样式定制

组件使用 CSS 变量进行样式控制，您可以通过 CSS 自定义样式：

```css
/* 自定义容器样式 */
.l-ripple {
  /* 您的自定义样式 */
}

/* 自定义波纹元素样式 */
.l-ripple__element {
  /* 您的自定义样式 */
}

/* 高性能模式 */
.l-ripple--performance {
  /* GPU 加速优化 */
}
```

## ⚡ 性能优化

1. **GPU 加速** - 使用 `transform3d` 和 `will-change` 优化渲染性能
2. **防抖控制** - 限制最大波纹数量，避免性能问题
3. **智能清理** - 自动清理完成的波纹动画
4. **按需渲染** - 仅在需要时创建 DOM 元素
5. **事件优化** - 使用 passive 监听器，优化滚动性能

## 🌐 浏览器兼容性

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Chrome Android 88+
- Safari iOS 14+

支持所有现代浏览器的最新两个版本。

## 📝 注意事项

1. 父元素需要设置 `position: relative`（组件会自动添加）
2. 父元素需要设置 `overflow: hidden`（组件会自动添加）
3. 确保波纹组件是父元素的直接子元素
4. 在禁用状态的元素上，波纹效果会自动禁用

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [在线演示](./example.html)
- [源代码](./ripple.ts)
- [类型定义](./types.ts)