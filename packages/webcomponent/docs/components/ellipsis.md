# Ellipsis 文本省略

用于展示较长文本的多行省略与展开/收起交互。

- 折叠：按指定行数显示，超出省略，并在右下角显示“更多”
- 展开：若最后一行还有空间，“收起”放在最后一行最右侧；否则换到下一行右对齐
- 兼容 PC 与移动端，按钮具备合适的点击热区

## 基础用法

默认展示 3 行，超出则省略并显示“更多”。

<div class="demo-container">
  <ldesign-ellipsis
    content="LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。Ellipsis 组件用于多行文本省略与展开收起的交互，支持自定义行数与按钮文案，在展开时能够智能判断最后一行是否还有剩余空间，从而决定“收起”按钮是同行显示还是换行右对齐显示。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  content="LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库……"
></ldesign-ellipsis>
```

## 指定行数

通过 `lines` 指定折叠时显示的行数。

<div class="demo-container">
  <ldesign-ellipsis
    lines="2"
    content="两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis lines="2" content="两行省略示例……"></ldesign-ellipsis>
```

## 自定义按钮文案

使用 `expand-text` 和 `collapse-text` 修改“更多/收起”的文案。

<div class="demo-container">
  <ldesign-ellipsis
    lines="3"
    expand-text="更多内容"
    collapse-text="收起内容"
    content="你可以根据产品语言自定义按钮文案，例如“展开详情/收起详情”，以贴合上下文。两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  expand-text="更多内容"
  collapse-text="收起内容"
  content="……"
></ldesign-ellipsis>
```

## 直接书写文本

不传 `content` 时，组件会读取标签内的纯文本作为内容。

<div class="demo-container">
  <ldesign-ellipsis lines="3">
    你也可以把文本直接写在标签内容里，组件会自动读取并进行省略与展开处理。两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。两行省略示例：当内容超过两行时，将在右下角出现“更多”按钮，点击后展开全部内容，再次点击“收起”可返回折叠状态。
  </ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis lines="3">
  直接写在标签内的纯文本也可以被读取并省略/展开。
</ldesign-ellipsis>
```

## 受控模式

通过 `expanded` 属性控制展开/收起，并监听 `ldesignToggle` 事件获取状态变化。

```html
<ldesign-ellipsis id="el1" content="可受控的省略文本" expanded="true"></ldesign-ellipsis>
<script>
  const el = document.getElementById('el1');
  el.addEventListener('ldesignToggle', (e) => {
    console.log('expanded =', e.detail.expanded);
    // 根据业务逻辑也可再设置 el.expanded 形成完全受控
  });
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| content | 要展示的纯文本内容；不传时将读取标签内的纯文本 | `string` | - |
| lines | 折叠时显示的行数 | `number` | `3` |
| expand-text | 折叠态右下角按钮文案 | `string` | `"更多"` |
| collapse-text | 展开态“收起”按钮文案 | `string` | `"收起"` |
| default-expanded | 是否默认展开（非受控初始态） | `boolean` | `false` |
| expanded | 当前是否展开（受控） | `boolean` | - |

### Events

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| ldesignToggle | 展开/收起状态变化时触发 | `detail: { expanded: boolean }` |

### CSS 变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| --ld-ellipsis-bg | “更多/收起”按钮背后的底色，用于遮住文本或渐变 | `var(--ldesign-bg-color, #fff)` |

示例：

```css
ldesign-ellipsis {
  --ld-ellipsis-bg: transparent; /* 根据容器背景调整，避免色差 */
}
```

## 进阶用法

### 双击切换展开/收起

通过 `double-click-toggle` 属性启用双击文本切换功能，提供更便捷的交互方式。

<div class="demo-container">
  <ldesign-ellipsis
    lines="3"
    double-click-toggle
    content="双击这段文本可以切换展开和收起状态。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。双击这段文本可以切换展开和收起状态。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  double-click-toggle
  content="双击这段文本可以切换展开和收起状态……"
></ldesign-ellipsis>
```

### 滚动到视图

展开或收起时自动滚动到组件顶部，特别适用于长列表或卡片场景。

<div class="demo-container">
  <ldesign-ellipsis
    lines="3"
    scroll-into-view-on-expand
    scroll-into-view-on-collapse
    content="展开或收起时会自动滚动到组件顶部，便于用户查看内容。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。展开或收起时会自动滚动到组件顶部。双击这段文本可以切换展开和收起状态。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  scroll-into-view-on-expand
  scroll-into-view-on-collapse
  content="展开或收起时会自动滚动到组件顶部……"
></ldesign-ellipsis>
```

### 自动收起

设置 `auto-collapse-delay` 属性，展开后经过指定时间自动收起（单位：毫秒）。

<div class="demo-container">
  <ldesign-ellipsis
    lines="3"
    auto-collapse-delay="5000"
    content="点击展开后，5秒钟会自动收起。这对于需要自动隐藏详细信息的场景非常有用。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  auto-collapse-delay="5000"
  content="点击展开后，5秒钟会自动收起……"
></ldesign-ellipsis>
```

### 增强按钮悬浮效果

通过 `enhanced-hover` 属性启用更明显的按钮悬浮效果，包括阴影、位移和缩放动画。

<div class="demo-container">
  <ldesign-ellipsis
    lines="3"
    enhanced-hover
    content="悬停在按钮上查看增强的视觉反馈效果。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  enhanced-hover
  content="悬停在按钮上查看增强的视觉反馈效果……"
></ldesign-ellipsis>
```

### 自定义渐变颜色

通过 `fade-colors` 属性自定义渐变遮罩的颜色，适应不同的背景色。

<div class="demo-container" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px;">
  <ldesign-ellipsis
    lines="3"
    fade-colors="rgba(102, 126, 234, 0) 0%, rgba(102, 126, 234, 0.3) 30%, rgba(102, 126, 234, 0.7) 60%, rgba(102, 126, 234, 1) 85%"
    content="在渐变背景上使用自定义颜色的渐变遮罩。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。双击这段文本可以切换展开和收起状态。"
    style="color: white; --ld-ellipsis-bg: rgba(102, 126, 234, 1); --ldesign-brand-color: #ffd700;"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  fade-colors="rgba(102, 126, 234, 0) 0%, rgba(102, 126, 234, 0.3) 30%, rgba(102, 126, 234, 0.7) 60%, rgba(102, 126, 234, 1) 85%"
  content="在渐变背景上使用自定义颜色的渐变遮罩……"
  style="color: white; --ld-ellipsis-bg: rgba(102, 126, 234, 1);"
></ldesign-ellipsis>
```

### 行为控制：强制同行/换行与间距

- action-placement
  - `auto`：默认（根据测量自动决定）
  - `inline`：强制将“收起”同行右置
  - `newline`：强制换行右对齐
- inline-gap：同行时文本与“收起”的空隙

```html
<!-- 强制同行右置，和文本留 12px 间距 -->
<ldesign-ellipsis
  content="……"
  expanded
  action-placement="inline"
  inline-gap="12"
></ldesign-ellipsis>

<!-- 强制换行右对齐 -->
<ldesign-ellipsis
  content="……"
  expanded
  action-placement="newline"
></ldesign-ellipsis>
```

### 视觉控制：渐变开关与宽度

- show-fade：是否显示折叠态渐变
- fade-width：渐变宽度，如 `40%` 或 `120`

```html
<ldesign-ellipsis
  lines="3"
  content="……"
  show-fade="false"
></ldesign-ellipsis>

<ldesign-ellipsis
  lines="3"
  content="……"
  fade-width="120"
></ldesign-ellipsis>
```

### 悬浮全文（折叠态）

- tooltip-on-collapsed：折叠且溢出时启用 Tooltip 展示全文
- tooltip-placement / tooltip-max-width：位置与最大宽度

```html
<ldesign-ellipsis
  lines="2"
  content="很长很长很长的文本……"
  tooltip-on-collapsed
  tooltip-placement="top"
  tooltip-max-width="360"
></ldesign-ellipsis>
```

### 动画与可访问性

- transition-duration：展开/收起高度动画时长（ms）
- collapse-on-escape：展开时按 Esc 自动收起

```html
<ldesign-ellipsis
  lines="3"
  content="……"
  transition-duration="260"
  collapse-on-escape
></ldesign-ellipsis>
```

### 响应式行数

- lines-map：按屏宽切换行数（内置断点：sm<576, md<768, lg<992, xl>=1200）

```html
<ldesign-ellipsis
  content="……"
  :lines-map="{ sm: 2, md: 3, lg: 4, xl: 5 }"
></ldesign-ellipsis>
```

注意：VitePress 的 HTML 示例中不支持直接写对象语法，实际项目中可用框架动态绑定或在自定义脚本中通过 JS 设置：

```html
<ldesign-ellipsis id="r1" content="……"></ldesign-ellipsis>
<script>
  const el = document.getElementById('r1');
  el.linesMap = { sm: 2, md: 3, lg: 4, xl: 5 };
</script>
```

### 图标与按钮定制

- expand-icon / collapse-icon：为按钮添加图标
- action-class / action-style：自定义按钮 class 和内联样式

```html
<ldesign-ellipsis
  content="……"
  expand-icon="chevron-down"
  collapse-icon="chevron-up"
  action-class="my-ellipsis-action"
  >
</ldesign-ellipsis>

<style>
  .my-ellipsis-action { color: #7c3aed; }
</style>
```

### 方法与事件

- update()：手动强制重新测量
- ldesignTruncateChange：溢出状态变化时触发（detail: { overflowed: boolean }）

```html
<ldesign-ellipsis id="el-up" content="……"></ldesign-ellipsis>
<ldesign-button id="btn-up" size="small">强制刷新</ldesign-button>
<script>
  const el = document.getElementById('el-up');
  document.getElementById('btn-up').addEventListener('click', () => el.update());
  el.addEventListener('ldesignTruncateChange', (e) => console.log('overflowed:', e.detail.overflowed));
</script>
```

### Props（扩展）

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| action-placement | 行为：auto/inline/newline | `'auto' \| 'inline' \| 'newline'` | `'auto'` |
| inline-gap | 同行时文本与“收起”的间距 | `number` | `8` |
| show-fade | 折叠态是否显示渐变遮罩 | `boolean` | `true` |
| fade-width | 渐变遮罩宽度 | `number \| string` | `'40%'` |
| fade-colors | 自定义渐变遮罩颜色（CSS 渐变色彩定义） | `string` | - |
| tooltip-on-collapsed | 折叠且溢出时用 Tooltip 展示全文 | `boolean` | `false` |
| tooltip-placement | Tooltip 位置 | `string` | `'top'` |
| tooltip-max-width | Tooltip 最大宽度 | `number` | `320` |
| transition-duration | 展开/收起高度动画时长（ms） | `number` | `200` |
| collapse-on-escape | 展开态按 Esc 收起 | `boolean` | `false` |
| double-click-toggle | 双击文本切换展开/收起 | `boolean` | `false` |
| scroll-into-view-on-expand | 展开时滚动到组件顶部 | `boolean` | `false` |
| scroll-into-view-on-collapse | 收起时滚动到组件顶部 | `boolean` | `false` |
| use-transform-animation | 使用 transform 动画而非 max-height（性能更好） | `boolean` | `true` |
| enhanced-hover | 按钮悬浮效果增强 | `boolean` | `true` |
| auto-collapse-delay | 自动折叠延迟（毫秒，0为不自动折叠） | `number` | `0` |
| lines-map | 响应式行数映射 | `{ sm?: number; md?: number; lg?: number; xl?: number }` | - |
| expand-icon | “更多”按钮图标 | `string` | - |
| collapse-icon | “收起”按钮图标 | `string` | - |
| action-class | 自定义按钮类名 | `string` | - |
| action-style | 自定义按钮样式 | `Record<string, string | number>` | - |

### Methods（新增）

| 方法名 | 说明 | 参数 |
|---|---|---|
| update | 强制重新测量 | - |

### Events（新增）

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| ldesignTruncateChange | 溢出状态变化 | `detail: { overflowed: boolean }` |

## 使用建议

- 当前组件针对纯文本设计；若需支持富文本（带标签）并保持同行放置“收起”，可在具体场景下扩展测量逻辑后使用。
- 对极端长单词/URL 已启用 `overflow-wrap:anywhere; word-break:break-word`，一般能较好断行。如需更强约束，可在外层增加 `max-width` 并结合 `hyphens:auto`。
- 若在透明或图片背景上使用，请通过 `--ld-ellipsis-bg` 和 `fade-colors` 调整背景衔接，避免遮罩/按钮底色与背景不一致。
- 增强悬浮效果（`enhanced-hover`）默认开启，提供更好的视觉反馈，如需简约样式可设为 `false`。
- 双击切换功能适合移动端和触摸屏场景，但请注意与文本选择交互的冲突。
- 自动收起功能适用于临时展示详情的场景，如通知消息、提示条等。

## 何时使用

- 内容较长，需要控制首屏信息密度；
- 列表卡片、信息摘要、评论/评价条目等需要有限展示；
- 移动端页面空间紧张的描述区域；
- 需要“展开/收起”而不是跳转到“详情页”的场景。

## 设计与交互细节

- 折叠：默认多行省略，右下角出现“更多”。可关闭渐变遮罩（`show-fade=false`）或自定义渐变颜色（`fade-colors`）。
- 展开：
  - 若最后一行仍有空间，则“收起”会同行右侧显示；
  - 若最后一行刚好铺满，则“收起”另起一行并右对齐；
  - 可用 `action-placement` 强制同行或换行，`inline-gap` 控制同行空隙。
- 交互增强：
  - 支持双击文本切换展开/收起（`double-click-toggle`）；
  - 支持展开/收起时自动滚动到视图（`scroll-into-view-on-*`）；
  - 支持自动收起延迟（`auto-collapse-delay`）。
- 视觉优化：
  - 渐变遮罩采用更自然的多段式过渡，与按钮背景更好融合；
  - 按钮增强悬浮效果（`enhanced-hover`）默认开启，包括阴影、位移和图标动画；
  - 按钮左侧增加了柔和阴影，使渐变过渡更加平滑。
- 可访问性：
  - “更多/收起”使用原生 `<button>`，默认可聚焦与键盘操作；
  - 设置 `collapse-on-escape` 后，展开时按 Esc 可快速收起。
- 主题：
  - 使用品牌色系 `--ldesign-brand-color*`，遵循全局主题；
  - 可通过 `--ld-ellipsis-bg` 定制按钮底色与遮罩底色。

## 浏览器兼容性

- 多行省略基于 `-webkit-line-clamp` 与 `display:-webkit-box`，在 Chromium/Edge/Safari 中表现可靠；
- Firefox 近年也有较好的兼容，但旧版本可能存在差异；
- 建议以“现代浏览器”为目标；在较老环境中建议回退为简化策略（如仅显示固定高度+渐变+更多按钮）。

## 性能与注意事项

- 组件内部通过 `ResizeObserver` 与一次离屏测量来判断是否溢出与同行/换行放置“收起”，在初始化和尺寸变化时触发；
- 如容器或字体频繁变化，可酒情调用 `update()` 主动刷新；
- `tooltip-on-collapsed` 会创建 Tooltip（hover 触发），在密集列表中请评估交互与性能；
- 动画优化：
  - 默认使用 `max-height` 过渡，并启用了 `will-change` 和 `transform: translateZ(0)` 进行硬件加速；
  - 渐变遮罩和按钮都使用了优化的 `cubic-bezier` 缓动函数，动画更加流畅；
  - 复杂嵌套时如有抖动可将 `transition-duration` 设为 0 关闭动画。
- 双击功能会阻止文本选中，如需支持文本复制，请不要启用 `double-click-toggle`。

## 常见问题（FAQ）

1. 为什么我在某些浏览器里看不到多行省略？
   - 请确认目标浏览器对 `-webkit-line-clamp` 的兼容性；旧版 Firefox 可能不支持或存在差异。
2. 我想在透明背景或图片背景上使用，但遮罩边缘有色差怎么办？
   - 使用 CSS 变量 `--ld-ellipsis-bg` 与容器背景一致，例如 `transparent` 或具体色值。
3. 富文本如何处理？
   - 当前组件面向纯文本。富文本（含标签）会改变行高/宽度的测量，导致同行放置的“收起”不稳定。建议在具体业务中进行自定义测量或仅开启换行放置（`action-placement="newline"`）。
4. 如何国际化“更多/收起”？
   - 通过 `expand-text` 与 `collapse-text` 传入目标语言文案；也可在页面级别统一管理并批量设置。
5. 列表中成百上千个 Ellipsis 会有性能问题吗？
   - 常规场景无明显问题；如大量动态变化（虚拟列表、频繁 resize），建议在可见时再初始化，或手动批量 `update()` 控制测量时机。

## 更多示例

### 综合示例：所有新功能

结合多个新功能的综合示例：双击切换、自动滚动、增强悬浮效果和自定义动画。

<div class="demo-container">
  <ldesign-ellipsis
    lines="3"
    double-click-toggle
    scroll-into-view-on-expand
    scroll-into-view-on-collapse
    enhanced-hover
    transition-duration="300"
    expand-icon="chevron-down"
    collapse-icon="chevron-up"
    content="这是一个综合示例，展示了所有新功能。你可以双击文本来切换展开/收起状态，也可以点击按钮。展开或收起时会自动滚动到组件顶部。按钮具有增强的悬浮效果，包括阴影、位移和图标缩放动画。LDesign 是一套基于 Stencil 构建的现代 Web Components 组件库，提供跨框架、低侵入、渐进式增强的 UI 能力。组件支持响应式设计、主题定制、无障碍访问等特性。"
  ></ldesign-ellipsis>
</div>

```html
<ldesign-ellipsis
  lines="3"
  double-click-toggle
  scroll-into-view-on-expand
  scroll-into-view-on-collapse
  enhanced-hover
  transition-duration="300"
  expand-icon="chevron-down"
  collapse-icon="chevron-up"
  content="这是一个综合示例……"
></ldesign-ellipsis>
```

### 卡片场景（指定宽度）

```html
<div style="width: 360px; border: 1px solid #eee; border-radius: 8px; padding: 12px;">
  <h4 style="margin: 0 0 8px;">卡片标题</h4>
  <ldesign-ellipsis
    lines="3"
    content="在卡片中展示一段较长的描述文本，超出三行后使用更多/收起控制展示空间，并在需要时提供 Tooltip 悬浮查看全文的方式。"
    tooltip-on-collapsed
  ></ldesign-ellipsis>
</div>
```

### 与滚动容器/Scrollbar 配合

```html
<ldesign-scrollbar style="height: 200px;">
  <div style="padding: 12px;">
    <ldesign-ellipsis lines="2" content="滚动容器中的长文本……" tooltip-on-collapsed></ldesign-ellipsis>
    <ldesign-ellipsis lines="3" content="另一段长文本……"></ldesign-ellipsis>
  </div>
</ldesign-scrollbar>
```

---
