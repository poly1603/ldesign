# Scrollbar 自定义滚动条

可包裹任意内容，提供垂直/水平/双向的自定义滚动条，支持拖拽拇指、点击轨道跳转、悬浮/常显两种显示方式，并可通过 CSS 变量或插槽完全自定义样式。

- 组件：`<ldesign-scrollbar>`
- 方向：`direction="vertical|horizontal|both"`，默认 `both`
- 样式：`type="bar|track"`，`track` 会显示轨道背景
- 显示：`always` 是否常显
- 事件：`ldesignScroll`

## 基础用法（纵向）

<div class="demo-container" style="height: 220px;">
  <ldesign-scrollbar type="track" always style="height: 100%;">
    <div style="height: 600px; padding: 12px; background:#f0f6ff;">Content</div>
  </ldesign-scrollbar>
</div>

```html
<ldesign-scrollbar type="track" always style="height: 220px;">
  <div style="height: 600px; padding: 12px;">Content</div>
</ldesign-scrollbar>
```

## 横向滚动

<div class="demo-container" style="width: 420px;">
  <ldesign-scrollbar direction="horizontal" style="width: 100%; white-space: nowrap;">
    <div style="display:inline-block;width:1000px;height:120px;background:#eef2ff"></div>
  </ldesign-scrollbar>
</div>

```html
<ldesign-scrollbar direction="horizontal" style="width: 420px; white-space: nowrap;">
  <div style="display:inline-block;width:1000px;height:120px"></div>
</ldesign-scrollbar>
```

## 双向滚动（大画布）

<div class="demo-container" style="height: 240px;">
  <ldesign-scrollbar direction="both" style="height: 100%;">
    <div style="width: 1200px; height: 800px; background: repeating-linear-gradient(45deg,#fafafa,#fafafa 12px,#f0f0f0 12px,#f0f0f0 24px);"></div>
  </ldesign-scrollbar>
</div>

```html
<ldesign-scrollbar direction="both" style="height: 240px;">
  <div style="width: 1200px; height: 800px;"></div>
</ldesign-scrollbar>
```

## 显示轨道与常显

<div class="demo-container" style="height: 180px;">
  <ldesign-scrollbar type="track" always style="height:100%;">
    <div style="height: 500px;"></div>
  </ldesign-scrollbar>
</div>

```html
<ldesign-scrollbar type="track" always style="height: 180px;">
  <div style="height: 500px"></div>
</ldesign-scrollbar>
```

## 位置（左侧/顶部）

<div class="demo-container" style="height: 160px;">
  <ldesign-scrollbar type="track" v-position="left" h-position="top" direction="both" style="height:100%;">
    <div style="width: 800px; height: 400px;"></div>
  </ldesign-scrollbar>
</div>

```html
<ldesign-scrollbar type="track" v-position="left" h-position="top" direction="both" style="height:160px">
  <div style="width: 800px; height: 400px;"></div>
</ldesign-scrollbar>
```

## 滚动 API 示例

```html
<ldesign-scrollbar id="sb-api" type="track" style="height: 180px">
  <div style="height: 600px"></div>
</ldesign-scrollbar>
<div class="demo-row">
  <ldesign-button id="to-bottom" size="small">滚到底部</ldesign-button>
  <ldesign-button id="to-top" size="small">回到顶部</ldesign-button>
</div>
<script>
  const sb = document.getElementById('sb-api');
  document.getElementById('to-bottom')?.addEventListener('click', () => sb?.scrollToBottom());
  document.getElementById('to-top')?.addEventListener('click', () => sb?.scrollToTop());
</script>
```

## 边缘事件

```html
<ldesign-scrollbar id="sb-edge" type="track" style="height: 160px">
  <div style="height: 500px"></div>
</ldesign-scrollbar>
<script>
  document.getElementById('sb-edge')?.addEventListener('ldesignReach', (e) => console.log('reach:', e.detail));
</script>
```

## 完全自定义样式

方式一：覆盖 CSS 变量（推荐）

```html
<ldesign-scrollbar
  style="--ld-scrollbar-size: 10px; --ld-scrollbar-thumb-bg:#5e2aa7; --ld-scrollbar-track-bg: rgba(94,42,167,.15); height: 200px;"
  type="track"
>
  <div style="height: 600px"></div>
</ldesign-scrollbar>
```

方式二：自定义拇指内容（保持尺寸由组件控制）

```html
<ldesign-scrollbar type="track" style="height: 200px">
  <div style="height: 600px"></div>
  <div slot="v-thumb" style="width:100%;height:100%;border-radius:6px;background:linear-gradient(#bbb,#999)"></div>
</ldesign-scrollbar>
```

## 事件

```html
<ldesign-scrollbar id="sb" style="height:200px"><div style="height:600px"></div></ldesign-scrollbar>
<script>
  const sb = document.getElementById('sb');
  sb?.addEventListener('ldesignScroll', (e) => {
    console.log('scroll detail:', e.detail);
  });
  sb?.addEventListener('ldesignReach', (e) => {
    console.log('reach edge:', e.detail);
  });
</script>
```

## API

### 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 外观：仅显示拇指或带轨道 | `'bar' \| 'track'` | `bar` |
| direction | 方向 | `'vertical' \| 'horizontal' \| 'both'` | `both` |
| vPosition | 垂直条位置 | `'right' \| 'left'` | `right` |
| hPosition | 水平条位置 | `'bottom' \| 'top'` | `bottom` |
| rtl | RTL 方向（影响水平滚动计算） | `boolean` | `false` |
| smooth | 平滑滚动 | `boolean` | `false` |
| layout | 布局：`overlay` 叠加或 `space` 预留空间 | `'overlay' \| 'space'` | `overlay` |
| shadows | 是否显示阴影指示 | `boolean` | `false` |
| showButtons | 是否显示四向微调按钮 | `boolean` | `false` |
| stickyTop / stickyBottom | sticky 头/尾偏移（像素） | `number` | `0` |
| always | 是否常显 | `boolean` | `false` |
| thumbMinSize | 最小拇指尺寸（像素） | `number` | `24` |
| initialScrollTop/Left | 初始滚动位置 | `number` | - |
| disabled | 是否禁用交互 | `boolean` | `false` |
| dragScroll | 是否启用拖拽滚动 | `boolean` | `false` |
| dragScrollTrigger | 拖拽触发 | `'middle' \| 'left-alt' \| 'left'` | `middle` |
| snapSelector | 吸附选择器 | `string` | - |
| snapMode | 吸附模式 | `'start' \| 'center' \| 'end'` | `start` |
| snapDelay | 停止后触发吸附的延时（ms） | `number` | `120` |
| snapEnabled | 是否启用吸附 | `boolean` | `true` |
| syncGroup | 同步滚动组名 | `string` | - |
| syncAxis | 同步轴向 | `'vertical' \| 'horizontal' \| 'both'` | `both` |
| syncEnabled | 是否启用同步 | `boolean` | `true` |
| syncThrottle | 同步节流间隔（ms） | `number` | `32` |

### 方法（Methods）

- scrollToPos(options: ScrollToOptions)
- scrollByDelta(options: ScrollToOptions)
- scrollToTop()/scrollToBottom()/scrollToLeft()/scrollToRight()
- getMetrics(): `{ scrollTop, scrollLeft, clientWidth, clientHeight, scrollWidth, scrollHeight }`
- setCssVars(vars: Record<string,string|number>): 动态设置 CSS 变量（名称可带或不带 `--` 前缀；数值会自动加 `px`）

#### 动态设置样式变量示例

```html
<ldesign-scrollbar id="sb-style" type="track" style="height: 180px">
  <div style="height: 500px"></div>
</ldesign-scrollbar>
<ldesign-button id="skin" size="small">切换皮肤</ldesign-button>
<script>
  const sb = document.getElementById('sb-style');
  let flag = false;
  document.getElementById('skin')?.addEventListener('click', async () => {
    flag = !flag;
    await sb?.setCssVars({
      '--ld-scrollbar-size': flag ? 10 : 8,
      '--ld-scrollbar-thumb-bg': flag ? '#1677ff' : 'rgba(0,0,0,.35)',
      '--ld-scrollbar-track-bg': flag ? 'rgba(22,119,255,.15)' : 'rgba(0,0,0,.08)'
    });
  });
</script>
```

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignScroll | 内容滚动时触发 | `{ scrollTop, scrollLeft, clientWidth, clientHeight, scrollWidth, scrollHeight }` |
| ldesignReach | 当滚动触达边缘时触发 | `{ edge: 'top'|'bottom'|'left'|'right' }` |
| ldesignScrollStart | 开始滚动时触发 | `void` |
| ldesignScrollEnd | 停止滚动时触发 | `void` |

### CSS 变量

- `--ld-scrollbar-size` 条宽度/高度
- `--ld-scrollbar-radius` 圆角
- `--ld-scrollbar-offset` 与容器边缘的间距
- `--ld-scrollbar-thumb-bg` 拇指颜色
- `--ld-scrollbar-thumb-hover-bg` 拇指悬浮颜色
- `--ld-scrollbar-track-bg` 轨道颜色（type=track 时有效）

## 综合 Demo（space + shadows + sticky + 按钮）

```html
<ldesign-scrollbar type="track" layout="space" show-buttons shadows style="height: 220px; --ld-sticky-top: 48px;">
  <div style="height: 800px; padding-top: 48px; background: linear-gradient(#fafafa, #f0f0f0);">
    <div style="position: sticky; top: 0; height: 48px; background:#fff; border-bottom:1px solid #eee; display:flex;align-items:center;padding:0 8px;">Sticky Header</div>
    <div style="padding:8px">内容区</div>
  </div>
</ldesign-scrollbar>
```

## 布局与阴影

- layout="space"：为滚动条预留空间，避免遮挡内容。
- shadows：开启四边渐变阴影，提示可滚动方向。

```html
<ldesign-scrollbar type="track" layout="space" shadows style="height: 200px">
  <div style="height: 600px"></div>
</ldesign-scrollbar>
```

## 原生滚动条模式

当希望使用系统原生滚动条（例如便于鼠标中键快速滚动、辅助技术或平台适配）时，可以开启 native：

```html
<ldesign-scrollbar native style="height: 200px">
  <div style="height: 600px"></div>
</ldesign-scrollbar>
```

## 嵌套滚动与传播

在嵌套滚动容器时，默认会尽量阻止内部滚动影响外层。你可以通过 `wheel-propagation` 开启滚轮事件冒泡（当内部还能继续滚动时也允许向外层传递）。

### 嵌套 Demo（内层启用 wheel-propagation + smooth + 吸附 + 同步）

```html
<!-- 外层容器（同组 gsync，与第二个外层同步） -->
<ldesign-scrollbar id="outer1" type="track" sync-group="gsync" style="height: 260px; padding:8px; background:#fafafa;">
  <div style="height: 640px; padding: 8px;">
    <div style="margin-bottom: 8px; color:#666">外层 A（含内层）</div>
    <ldesign-scrollbar id="inner1" direction="both" type="track" wheel-propagation smooth snap-selector=".snap-item" snap-mode="center" style="height: 160px; background:#fff;">
      <div style="width: 1200px; height: 480px;">
        <div class="snap-item" style="width:200px;height:160px;display:inline-block;background:#f6f6f6;margin-right:8px"></div>
        <div class="snap-item" style="width:200px;height:160px;display:inline-block;background:#ebebeb;margin-right:8px"></div>
        <div class="snap-item" style="width:200px;height:160px;display:inline-block;background:#dcdcdc;margin-right:8px"></div>
      </div>
    </ldesign-scrollbar>
  </div>
</ldesign-scrollbar>

<!-- 第二个外层，和 outer1 同步（观察同步效果） -->
<ldesign-scrollbar id="outer2" type="track" sync-group="gsync" sync-axis="vertical" style="height: 260px; padding:8px; background:#fafafa;">
  <div style="height: 640px; padding: 8px;">另一个外层，同步观察区</div>
</ldesign-scrollbar>
```

## 键盘与拖拽

- 默认支持方向键/PageUp/PageDown/Home/End 控制滚动；可通过 `keyboard="false"` 关闭。
- 拖拽滚动：设置 `drag-scroll`，触发方式可配置 `drag-scroll-trigger="middle|left-alt|left"`。
