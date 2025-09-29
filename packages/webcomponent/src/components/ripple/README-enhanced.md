# Ripple 水波纹组件 - 增强版

一个功能强大、高度可定制的 Material Design 风格水波纹组件，为任何交互元素添加精美的视觉反馈效果。

## ✨ 特性

### 核心功能
- 🎨 **多种效果变体**: default, light, strong, pulse, gradient
- 🌈 **完全自定义**: 颜色、透明度、大小、速度、方向
- 🎯 **灵活触发**: pointer/mouse/click/keyboard
- 📱 **跨平台**: 完美兼容触摸和鼠标设备
- ⚡ **高性能**: CSS 动画 + 硬件加速
- ♿ **无障碍**: 完整的键盘导航和 ARIA 支持

### 高级特性
- 🌊 **多层波纹**: 创建复杂的层叠效果
- ✨ **发光效果**: 动态光晕增强视觉冲击
- 🎵 **声音反馈**: 可选的音频反馈
- 📳 **振动反馈**: 移动设备触觉反馈
- 🌙 **暗色模式**: 自动适应系统主题
- ⏱️ **节流控制**: 防止过度触发

## 🚀 快速开始

### 基本使用

```html
<!-- 在任意元素内部添加 ripple 组件 -->
<button class="btn">
  点击我
  <ldesign-ripple />
</button>

<!-- 自定义颜色 -->
<div class="card">
  卡片内容
  <ldesign-ripple color="#2196F3" />
</div>
```

### 高级用法

```html
<!-- 脉冲效果 + 多层 + 发光 -->
<button class="primary-btn">
  魔法按钮
  <ldesign-ripple 
    variant="pulse"
    multi-layer
    glow
    glow-intensity="0.8"
    color="#9c27b0"
  />
</button>

<!-- 向内收缩效果 -->
<button class="delete-btn">
  删除
  <ldesign-ripple 
    direction="inward"
    color="#f44336"
    haptic
  />
</button>

<!-- 双向波纹 + 声音反馈 -->
<button class="action-btn">
  执行
  <ldesign-ripple 
    direction="both"
    sound
    sound-volume="0.2"
  />
</button>
```

## 📚 API 参考

### 基础属性

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `color` | string | currentColor | 波纹颜色 |
| `opacity` | number | 0.24 | 波纹不透明度 (0-1) |
| `duration` | number | 600 | 扩散动画时长(ms) |
| `fadeOutDuration` | number | 300 | 淡出动画时长(ms) |
| `radius` | 'auto' \| number | 'auto' | 波纹半径 |
| `centered` | boolean | false | 是否总从中心触发 |
| `disabled` | boolean | false | 是否禁用 |
| `trigger` | 'pointerdown' \| 'mousedown' \| 'click' | 'pointerdown' | 触发方式 |
| `touchEnabled` | boolean | true | 是否启用触摸设备 |
| `easing` | string | cubic-bezier(0.4, 0, 0.2, 1) | 缓动函数 |
| `maxRipples` | number | 8 | 同时存在的最大波纹数 |
| `unbounded` | boolean | false | 波纹是否超出容器 |

### 样式变体

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `variant` | 'default' \| 'light' \| 'strong' \| 'pulse' \| 'gradient' | 'default' | 波纹效果类型 |
| `size` | 'small' \| 'medium' \| 'large' \| 'extra-large' | 'medium' | 波纹大小模式 |
| `direction` | 'outward' \| 'inward' \| 'both' | 'outward' | 波纹扩散方向 |
| `className` | string | - | 自定义 CSS 类名 |

### 增强功能

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `multiLayer` | boolean | false | 启用多层波纹效果 |
| `layerDelay` | number | 120 | 多层波纹间延迟(ms) |
| `glow` | boolean | false | 启用发光效果 |
| `glowIntensity` | number | 0.5 | 发光强度 (0-1) |
| `haptic` | boolean | false | 启用振动反馈 |
| `hapticIntensity` | number | 5 | 振动强度 (1-10) |
| `sound` | boolean | false | 启用声音反馈 |
| `soundVolume` | number | 0.1 | 声音音量 (0-1) |
| `throttle` | number | 0 | 最小触发间隔(ms) |
| `keyboardEnabled` | boolean | true | 启用键盘触发 |

## 🎨 样式变体说明

### default
标准的实心扩散效果，适用于大多数场景。

### light
轻柔的淡化效果，适合细微的交互反馈。

### strong
强烈的视觉冲击，适合重要操作。

### pulse
脉冲式的韵律效果，适合音乐/节奏相关场景。

### gradient
渐变淡出效果，更加柔和自然。

## 🌐 CSS 变量

通过 CSS 变量实现全局样式定制：

```css
:root {
  /* 基础变量 */
  --ld-ripple-default-color: currentColor;
  --ld-ripple-default-opacity: 0.24;
  --ld-ripple-light-opacity: 0.12;
  --ld-ripple-strong-opacity: 0.36;
  --ld-ripple-duration: 600ms;
  --ld-ripple-easing: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* 特效变量 */
  --ld-ripple-glow-color: rgba(255, 255, 255, 0.3);
  --ld-ripple-glow-blur: 12px;
  --ld-ripple-glow-intensity: 0.5;
  --ld-ripple-ring-width: 3px;
  
  /* 层级变量 */
  --ld-ripple-z-index: 999;
}

/* 暗色模式自动适应 */
@media (prefers-color-scheme: dark) {
  :root {
    --ld-ripple-default-opacity: 0.16;
    --ld-ripple-glow-color: rgba(255, 255, 255, 0.15);
  }
}
```

## 💡 使用场景示例

### 基础按钮
```html
<button class="btn btn-primary">
  确定
  <ldesign-ripple color="white" />
</button>
```

### FAB 浮动按钮
```html
<button class="fab">
  <svg><!-- icon --></svg>
  <ldesign-ripple 
    centered
    variant="light"
    multi-layer
  />
</button>
```

### 列表项
```html
<li class="list-item">
  <span>列表内容</span>
  <ldesign-ripple 
    variant="light"
    size="large"
  />
</li>
```

### 卡片
```html
<div class="card interactive">
  <h3>卡片标题</h3>
  <p>卡片内容</p>
  <ldesign-ripple 
    variant="gradient"
    duration="800"
  />
</div>
```

### 图标按钮
```html
<button class="icon-btn">
  <svg><!-- icon --></svg>
  <ldesign-ripple 
    unbounded
    centered
    size="small"
  />
</button>
```

## 🏆 最佳实践

1. **性能优化**
   - 对于频繁触发的元素，设置 `throttle` 属性
   - 限制 `maxRipples` 数量避免内存泄漏
   - 大量列表项使用 `variant="light"` 减少渲染压力

2. **无障碍**
   - 始终保持 `keyboardEnabled` 为 `true`
   - 确保父元素有适当的 `role` 和 `tabindex`
   - 为重要操作启用 `haptic` 反馈

3. **视觉一致性**
   - 在同一应用中保持相同的 `variant` 和 `duration`
   - 使用 CSS 变量统一管理颜色和透明度
   - 考虑暗色模式的适配

4. **移动端体验**
   - 移动设备上启用 `haptic` 增强触觉反馈
   - 使用 `size="large"` 适应触摸目标
   - 避免过于复杂的动画影响性能

## 🔧 故障排查

| 问题 | 可能原因 | 解决方案 |
|------|---------|----------|
| 波纹不显示 | 父元素没有 `position: relative` | 组件会自动添加，检查是否被覆盖 |
| 波纹被裁剪 | 父元素 `overflow: hidden` | 使用 `unbounded` 属性 |
| 性能问题 | 波纹数量过多 | 设置 `maxRipples` 和 `throttle` |
| 声音不播放 | 浏览器策略限制 | 需要用户交互后才能播放 |
| 振动不工作 | 设备不支持 | 检查 `navigator.vibrate` 支持 |

## 🛠️ 浏览器兼容性

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- iOS Safari 14+
- Android Chrome 88+

## 📝 许可

MIT