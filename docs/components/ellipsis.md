# Ellipsis 文本省略

智能文本省略组件，提供丰富的交互功能和高级动画效果。支持多种省略模式、富文本展示、复制分享、语音播放等企业级功能。

## 特性

- 🎯 **智能省略** - 支持开头/中间/结尾/智能模式，可保护关键词
- ✨ **富文本支持** - 高亮关键词、自动识别链接、HTML内容渲染
- 🔗 **高级交互** - 复制、分享、语音播放、自定义右键菜单
- 🎭 **动画效果** - 多种动画模式，流畅自然的过渡效果
- ♿ **无障碍** - 完整的ARIA支持、键盘导航、屏幕阅读器友好
- 🎨 **主题定制** - CSS变量系统，支持暗黑模式
- ⚡ **高性能** - 硬件加速、防抖节流、智能重排优化

## 基础用法

默认展示三行，超出则省略并显示"更多"。

<div class="demo-block">
  <ldesign-ellipsis
    content="LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。Ellipsis 组件用于多行文本省略与展开收起的交互，支持自定义行数与按钮文案，在展开时能够智能判断最后一行是否还有剩余空间，用以决定"收起"按钮是同行显示还是换行右对齐显示。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  content="LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库……"
></ldesign-ellipsis>
```

## 智能省略模式

### 中间省略

适合显示长路径、文件名等场景。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    ellipsis-mode="middle"
    content="/Users/john/Documents/Projects/WebDevelopment/ReactApplication/src/components/Dashboard/Analytics/ChartComponent.tsx"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="2"
  ellipsis-mode="middle"
  content="/Users/john/Documents/Projects/..."
></ldesign-ellipsis>
```

### 智能模式（保护关键词）

智能保留指定的关键词，确保重要信息可见。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    ellipsis-mode="smart"
    :keywords='["React", "组件"]'
    content="React 是一个用于构建用户界面的 JavaScript 库。它采用组件化的开发方式，让开发者可以构建可复用的 UI 组件，提高开发效率。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  ellipsis-mode="smart"
  :keywords='["React", "组件"]'
  content="..."
></ldesign-ellipsis>
```

## 富文本功能

### 关键词高亮

自动高亮指定的关键词，支持自定义颜色。

<div class="demo-block">
  <ldesign-ellipsis
    lines="3"
    highlight-text="Vue"
    highlight-color="#42b883"
    content="Vue.js 是一套用于构建用户界面的渐进式框架。与其它大型框架不同的是，Vue 被设计为可以自底向上逐层应用。Vue 的核心库只关注视图层，易于上手，还便于与第三方库或既有项目整合。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  highlight-text="Vue"
  highlight-color="#42b883"
  content="Vue.js 是一套用于构建用户界面的渐进式框架..."
></ldesign-ellipsis>
```

### 自动识别链接

自动将 URL 转换为可点击的链接。

<div class="demo-block">
  <ldesign-ellipsis
    lines="3"
    auto-link="true"
    content="访问 https://vuejs.org 了解更多 Vue.js 信息。查看中文文档：https://cn.vuejs.org/guide/ 快速上手。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  auto-link="true"
  content="访问 https://vuejs.org 了解更多..."
></ldesign-ellipsis>
```

## 高级交互

### 复制和分享

提供一键复制和分享功能。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    enable-copy="true"
    enable-share="true"
    content="这段文本支持复制和分享。展开后可以看到复制和分享按钮。在移动设备上，分享功能会调用系统原生分享面板。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  enable-copy="true"
  enable-share="true"
  content="..."
></ldesign-ellipsis>
```

### 语音播放

将文本转换为语音播放，提升无障碍体验。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    enable-speech="true"
    content="人工智能正在改变我们的生活方式。从智能助手到自动驾驶，AI技术已经渗透到各个领域。点击语音按钮可以听到这段文本的朗读。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  enable-speech="true"
  content="..."
></ldesign-ellipsis>
```

### 自定义右键菜单

<div class="demo-block">
  <ldesign-ellipsis
    id="context-demo"
    lines="2"
    content="右键点击这段文字可以看到自定义菜单。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis id="menu-demo" content="..."></ldesign-ellipsis>

<script>
const el = document.getElementById('menu-demo');
el.contextMenuItems = [
  { label: '复制', action: 'copy', icon: 'copy' },
  { label: '分享', action: 'share', icon: 'share' },
  { label: '翻译', action: 'translate', icon: 'translate' }
];

el.addEventListener('ldesignMenuAction', (e) => {
  console.log('执行操作:', e.detail.action);
});
</script>
```

## 动画效果

提供多种动画模式，让交互更生动。

### 弹性动画

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    animation-mode="bounce"
    transition-duration="500"
    content="这个组件使用了弹性动画效果。展开和收起时会有一个有趣的弹跳效果，让交互体验更加生动活泼。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  animation-mode="bounce"
  transition-duration="500"
  content="..."
></ldesign-ellipsis>
```

### 动画模式对比

| 模式 | 说明 | 效果 |
|---|---|---|
| smooth | 平滑过渡（默认） | 标准缓动曲线 |
| bounce | 弹跳效果 | 结束时有回弹 |
| elastic | 弹性效果 | 更强的回弹感 |
| spring | 弹簧效果 | 自然的物理动画 |

## 辅助功能

### 字数统计

实时显示文本字符数。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    show-count="true"
    content="这段文本会显示字数统计。这个功能在需要限制输入长度或让用户了解内容篇幅时特别有用。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  show-count="true"
  content="..."
></ldesign-ellipsis>
```

### 渐变遮罩

自定义渐变遮罩的宽度和显示。

<div class="demo-block">
  <ldesign-ellipsis
    lines="2"
    show-fade="true"
    fade-width="60%"
    content="渐变遮罩可以让文本截断更自然。你可以调整渐变宽度来获得最佳视觉效果。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  show-fade="true"
  fade-width="60%"
  content="..."
></ldesign-ellipsis>
```

## 响应式配置

根据屏幕宽度自动调整显示行数。

<div class="demo-block">
  <ldesign-ellipsis
    :lines-map="{ sm: 2, md: 3, lg: 4, xl: 5 }"
    content="这个组件会根据屏幕宽度自动调整显示行数。在小屏幕上显示2行，中等屏幕显示3行，大屏幕显示4行，超大屏幕显示5行。响应式设计让内容在不同设备上都有最佳展示效果。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  :lines-map="{ sm: 2, md: 3, lg: 4, xl: 5 }"
  content="..."
></ldesign-ellipsis>
```

## 完整示例

综合运用多种功能的示例。

<div class="demo-block">
  <ldesign-ellipsis
    lines="3"
    ellipsis-mode="smart"
    :keywords='["React", "性能"]'
    enable-copy="true"
    enable-share="true"
    enable-speech="true"
    highlight-text="React"
    highlight-color="#61dafb"
    auto-link="true"
    animation-mode="spring"
    transition-duration="400"
    show-count="true"
    show-fade="true"
    fade-width="45%"
    expand-text="展开全文"
    collapse-text="收起内容"
    content="React 是一个用于构建用户界面的 JavaScript 库。它由 Facebook 开发，采用组件化开发方式，通过虚拟DOM提升性能。了解更多：https://react.dev"
  ></ldesign-ellipsis>
</div>

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| **基础属性** | | | |
| content | 要展示的文本内容 | `string` | - |
| lines | 折叠时显示的行数 | `number` | `3` |
| expand-text | 展开按钮文案 | `string` | `"更多"` |
| collapse-text | 收起按钮文案 | `string` | `"收起"` |
| default-expanded | 是否默认展开 | `boolean` | `false` |
| expanded | 当前是否展开（受控） | `boolean` | - |
| **省略模式** | | | |
| ellipsis-mode | 省略模式 | `'start' \| 'middle' \| 'end' \| 'smart'` | `'end'` |
| keywords | 智能模式下的关键词 | `string[]` | - |
| **交互功能** | | | |
| enable-copy | 启用复制功能 | `boolean` | `false` |
| enable-share | 启用分享功能 | `boolean` | `false` |
| enable-speech | 启用语音播放 | `boolean` | `false` |
| context-menu-items | 自定义右键菜单项 | `MenuItem[]` | - |
| **富文本** | | | |
| enable-html | 支持HTML内容 | `boolean` | `false` |
| highlight-text | 高亮文本 | `string` | - |
| highlight-color | 高亮颜色 | `string` | `"#ff9800"` |
| auto-link | 自动识别链接 | `boolean` | `false` |
| **动画** | | | |
| animation-mode | 动画模式 | `'smooth' \| 'bounce' \| 'elastic' \| 'spring'` | `'smooth'` |
| transition-duration | 动画时长(ms) | `number` | `200` |
| **样式** | | | |
| show-fade | 显示渐变遮罩 | `boolean` | `true` |
| fade-width | 渐变宽度 | `number \| string` | `"40%"` |
| action-class | 按钮自定义类名 | `string` | - |
| action-style | 按钮自定义样式 | `object` | - |
| **辅助** | | | |
| show-count | 显示字数统计 | `boolean` | `false` |
| tooltip-on-collapsed | 折叠时显示tooltip | `boolean` | `false` |
| tooltip-placement | Tooltip位置 | `string` | `"top"` |
| tooltip-max-width | Tooltip最大宽度 | `number` | `320` |
| **响应式** | | | |
| lines-map | 响应式行数配置 | `{sm?: number, md?: number, lg?: number, xl?: number}` | - |
| **无障碍** | | | |
| keyboard-nav | 启用键盘导航 | `boolean` | `true` |
| collapse-on-escape | ESC键收起 | `boolean` | `false` |
| **按钮图标** | | | |
| expand-icon | 展开图标 | `string` | - |
| collapse-icon | 收起图标 | `string` | - |
| **行为控制** | | | |
| action-placement | 收起按钮位置 | `'auto' \| 'inline' \| 'newline'` | `'auto'` |
| inline-gap | 同行间距(px) | `number` | `8` |

### Events

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| ldesignToggle | 展开/收起状态变化 | `{ expanded: boolean }` |
| ldesignTruncateChange | 溢出状态变化 | `{ overflowed: boolean }` |
| ldesignCopy | 复制文本 | `{ text: string, success: boolean }` |
| ldesignShare | 分享文本 | `{ text: string, method: string }` |
| ldesignMenuAction | 菜单操作 | `{ action: string }` |

### Methods

| 方法名 | 说明 | 参数 |
|---|---|---|
| update | 手动刷新组件 | - |

### MenuItem 类型

```typescript
interface MenuItem {
  label: string;    // 菜单项文本
  action: string;   // 操作标识
  icon?: string;    // 图标名称
}
```

### CSS 变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| --ld-ellipsis-bg | 按钮背景色 | `var(--ldesign-bg-color, #fff)` |
| --ld-ellipsis-lines | 显示行数 | `3` |
| --ldesign-brand-color | 品牌主色 | `#1677ff` |
| --ldesign-brand-color-hover | 品牌色悬浮态 | `#4096ff` |
| --ldesign-brand-color-active | 品牌色激活态 | `#0958d9` |
| --ldesign-text-color | 文本颜色 | `#333` |
| --ldesign-text-color-secondary | 次要文本颜色 | `#666` |
| --ldesign-link-color | 链接颜色 | `#1677ff` |
| --ldesign-warning-color-light | 警告色浅色 | `#fffbe6` |

## 主题定制

### 暗黑模式

组件自动适配系统暗黑模式，也可以手动设置：

```css
/* 暗黑模式 */
@media (prefers-color-scheme: dark) {
  ldesign-ellipsis {
    --ld-ellipsis-bg: #1a1a1a;
    --ldesign-text-color: #fff;
  }
}
```

### 自定义主题

```css
ldesign-ellipsis {
  /* 主题色 */
  --ldesign-brand-color: #722ed1;
  --ldesign-brand-color-hover: #9254de;
  --ldesign-brand-color-active: #531dab;
  
  /* 渐变效果 */
  --ld-ellipsis-bg: linear-gradient(90deg, transparent, white);
  
  /* 动画 */
  transition-duration: 300ms;
}
```

## 性能优化

组件内置多项性能优化措施：

- **硬件加速**: 使用 `transform: translateZ(0)` 开启 GPU 加速
- **防抖节流**: resize 和滚动事件使用防抖处理
- **智能重排**: 使用 `contain: layout style` 限制重排范围
- **动态 will-change**: 仅在动画时启用 will-change
- **离屏测量**: 使用离屏节点进行尺寸计算
- **requestAnimationFrame**: 优化动画调度

## 无障碍支持

- ✅ 完整的 ARIA 属性支持（role, aria-expanded, aria-label）
- ✅ 键盘导航（Tab, Enter, Space）
- ✅ 焦点管理和可视化焦点样式
- ✅ 屏幕阅读器友好的语义化标记
- ✅ 语音播放功能
- ✅ 高对比度模式支持

## 浏览器兼容性

| 浏览器 | 版本 |
|---|---|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## 使用场景

- 📰 **新闻摘要** - 新闻列表、文章预览
- 📁 **文件路径** - IDE、文件管理器中的长路径
- 💬 **评论系统** - 用户评论、留言板
- 🛍️ **产品描述** - 电商产品详情、商品介绍
- 📖 **文档系统** - 知识库、FAQ、Wiki
- 📱 **社交动态** - 微博、朋友圈、动态列表
- 💻 **代码展示** - 代码片段、日志输出

## 最佳实践

1. **选择合适的省略模式**
   - 文件路径使用 `middle` 模式
   - 普通文本使用 `end` 模式
   - 包含关键信息的内容使用 `smart` 模式

2. **响应式设计**
   - 使用 `lines-map` 适配不同屏幕
   - 移动端适当减少行数

3. **性能考虑**
   - 大量组件时考虑虚拟滚动
   - 避免频繁更新 content

4. **用户体验**
   - 重要内容启用 `tooltip-on-collapsed`
   - 适当使用动画增强反馈
   - 提供复制、分享等快捷操作

5. **无障碍**
   - 保持默认的键盘导航
   - 为重要内容启用语音播放
   - 确保足够的颜色对比度

## 示例代码

<script setup>
// 设置右键菜单示例
import { onMounted } from 'vue'

onMounted(() => {
  const el = document.getElementById('context-demo')
  if (el) {
    el.contextMenuItems = [
      { label: '复制文本', action: 'copy', icon: 'copy' },
      { label: '分享', action: 'share', icon: 'share' },
      { label: '朗读', action: 'speak', icon: 'sound' }
    ]
    
    el.addEventListener('ldesignMenuAction', (e) => {
      console.log('菜单操作：', e.detail.action)
    })
  }
})
</script>