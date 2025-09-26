# Progress 进度条

组件标签：`<ldesign-progress>`

支持线形、环形、仪表盘、分段步骤、尺寸、状态、渐变、缺口角度、自定义文本等。下面的示例覆盖了你提供截图中的所有样式。可直接复制代码到任意 HTML 页面体验。

## 基础用法（线形）

<div class="demo-container" style="display:flex;flex-direction:column;gap:10px;min-width:340px;">
  <ldesign-progress percent="30"></ldesign-progress>
  <ldesign-progress percent="60" status="active"></ldesign-progress>
  <ldesign-progress percent="100" status="success"></ldesign-progress>
  <ldesign-progress percent="60" status="exception"></ldesign-progress>
</div>

```html
<ldesign-progress percent="30"></ldesign-progress>
<ldesign-progress percent="60" status="active"></ldesign-progress>
<ldesign-progress percent="100" status="success"></ldesign-progress>
<ldesign-progress percent="60" status="exception"></ldesign-progress>
```

### 条内文本 / 左侧文本 / 底部图标

<div class="demo-container" style="display:flex;flex-direction:column;gap:12px;min-width:520px;">
  <ldesign-progress percent="0"  info-position="inside" trail-color="#eee" stroke-color="#ddd"></ldesign-progress>
  <ldesign-progress percent="10" info-position="inside" stroke-color="#3b82f6"></ldesign-progress>
  <ldesign-progress percent="50" info-position="inside" stroke-color="#b7e588"></ldesign-progress>
  <ldesign-progress percent="60" info-position="inside" stroke-color="#07183a"></ldesign-progress>
  <ldesign-progress percent="100" info-position="inside" stroke-color="#64c029"></ldesign-progress>

  <ldesign-progress percent="60" info-position="left" stroke-color="#3b82f6"></ldesign-progress>
  <ldesign-progress percent="100" status="success" info-position="bottom" stroke-color="#64c029"></ldesign-progress>
</div>

```html
<ldesign-progress percent="0"  info-position="inside" trail-color="#eee" stroke-color="#ddd"></ldesign-progress>
<ldesign-progress percent="10" info-position="inside" stroke-color="#3b82f6"></ldesign-progress>
<ldesign-progress percent="50" info-position="inside" stroke-color="#b7e588"></ldesign-progress>
<ldesign-progress percent="60" info-position="inside" stroke-color="#07183a"></ldesign-progress>
<ldesign-progress percent="100" info-position="inside" stroke-color="#64c029"></ldesign-progress>

<ldesign-progress percent="60" info-position="left" stroke-color="#3b82f6"></ldesign-progress>
<ldesign-progress percent="100" status="success" info-position="bottom" stroke-color="#64c029"></ldesign-progress>
```

<div class="demo-container" style="display:flex;flex-direction:column;gap:10px;min-width:340px;">
  <ldesign-progress percent="30"></ldesign-progress>
  <ldesign-progress percent="60" status="active"></ldesign-progress>
  <ldesign-progress percent="100" status="success"></ldesign-progress>
  <ldesign-progress percent="60" status="exception"></ldesign-progress>
</div>

```html
<ldesign-progress percent="30"></ldesign-progress>
<ldesign-progress percent="60" status="active"></ldesign-progress>
<ldesign-progress percent="100" status="success"></ldesign-progress>
<ldesign-progress percent="60" status="exception"></ldesign-progress>
```

## 小型进度条

更紧凑的展示，适合狭窄区域。

<div class="demo-container" style="display:flex;flex-direction:column;gap:10px;min-width:260px;">
  <ldesign-progress size="small" percent="30"></ldesign-progress>
  <ldesign-progress size="small" percent="50" status="active"></ldesign-progress>
  <ldesign-progress size="small" percent="60" status="exception"></ldesign-progress>
  <ldesign-progress size="small" percent="100" status="success"></ldesign-progress>
</div>

```html
<ldesign-progress size="small" percent="30"></ldesign-progress>
<ldesign-progress size="small" percent="50" status="active"></ldesign-progress>
<ldesign-progress size="small" percent="60" status="exception"></ldesign-progress>
<ldesign-progress size="small" percent="100" status="success"></ldesign-progress>
```

## 0% 与 100%

<div class="demo-container" style="display:flex;flex-direction:column;gap:10px;min-width:340px;">
  <ldesign-progress percent="0"></ldesign-progress>
  <ldesign-progress percent="100" status="success"></ldesign-progress>
</div>

```html
<ldesign-progress percent="0"></ldesign-progress>
<ldesign-progress percent="100" status="success"></ldesign-progress>
```

## 尺寸（线形与圆形）

<div class="demo-container" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:center;">
  <div style="display:flex;flex-direction:column;gap:10px;">
    <ldesign-progress size="small" percent="50"></ldesign-progress>
    <ldesign-progress size="medium" percent="50"></ldesign-progress>
    <ldesign-progress size="large" percent="50"></ldesign-progress>
  </div>
  <div style="display:flex;gap:16px;align-items:center;">
    <ldesign-progress type="circle" width="72" percent="50"></ldesign-progress>
    <ldesign-progress type="circle" width="48" percent="50"></ldesign-progress>
    <ldesign-progress type="circle" width="24" percent="50"></ldesign-progress>
  </div>
</div>

```html
<!-- 线形三种尺寸 -->
<ldesign-progress size="small" percent="50"></ldesign-progress>
<ldesign-progress size="medium" percent="50"></ldesign-progress>
<ldesign-progress size="large" percent="50"></ldesign-progress>

<!-- 圆形不同直径 -->
<ldesign-progress type="circle" width="72" percent="50"></ldesign-progress>
<ldesign-progress type="circle" width="48" percent="50"></ldesign-progress>
<ldesign-progress type="circle" width="24" percent="50"></ldesign-progress>
```

## 响应式进度圈（小于等于 20 隐藏内文）

当圆直径 `width <= 20` 时，内部文本自动隐藏。可以配合 Tooltip 展示信息。

<div class="demo-container" style="display:flex;gap:16px;align-items:center;">
  <ldesign-progress type="circle" width="20" percent="50"></ldesign-progress>
  <ldesign-tooltip content="50%">
    <ldesign-progress type="circle" width="16" percent="50"></ldesign-progress>
  </ldesign-tooltip>
</div>

```html
<ldesign-progress type="circle" width="20" percent="50"></ldesign-progress>
<ldesign-tooltip content="50%">
  <ldesign-progress type="circle" width="16" percent="50"></ldesign-progress>
</ldesign-tooltip>
```

## 环形步骤进度图（分段）

通过 `circle-steps` 和 `circle-step-gap-degree` 实现带缺口的分段环。

<div class="demo-container" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
  <ldesign-progress type="circle" width="180" percent="50" circle-steps="8" circle-step-gap-degree="3"></ldesign-progress>
  <ldesign-progress type="circle" width="180" percent="100" status="success" circle-steps="6" circle-step-gap-degree="4" stroke-color="#52c41a"></ldesign-progress>
</div>

```html
<ldesign-progress type="circle" width="180" percent="50" circle-steps="8" circle-step-gap-degree="3"></ldesign-progress>
<ldesign-progress type="circle" width="180" percent="100" status="success" circle-steps="6" circle-step-gap-degree="4" stroke-color="#52c41a"></ldesign-progress>
```

## 自定义进度条渐变色（圆形）

<div class="demo-container" style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
  <ldesign-progress type="circle" width="120" percent="90" gradient-from="#5cc3ff" gradient-to="#1677ff"></ldesign-progress>
  <ldesign-progress type="circle" width="120" percent="93" gradient-from="#ffd16a" gradient-to="#f59e0b"></ldesign-progress>
  <ldesign-progress type="circle" width="120" percent="90" gradient-from="#7dd3fc" gradient-to="#22c55e"></ldesign-progress>
  <ldesign-progress type="circle" width="120" percent="93" gradient-from="#fca5a5" gradient-to="#f43f5e"></ldesign-progress>
</div>

```html
<ldesign-progress type="circle" width="120" percent="90" gradient-from="#5cc3ff" gradient-to="#1677ff"></ldesign-progress>
<ldesign-progress type="circle" width="120" percent="93" gradient-from="#ffd16a" gradient-to="#f59e0b"></ldesign-progress>
<ldesign-progress type="circle" width="120" percent="90" gradient-from="#7dd3fc" gradient-to="#22c55e"></ldesign-progress>
<ldesign-progress type="circle" width="120" percent="93" gradient-from="#fca5a5" gradient-to="#f43f5e"></ldesign-progress>
```

> 线形也可以把 `stroke-color` 直接设置为 CSS `linear-gradient(...)`。

## 步骤进度条（分段显示）

### 细分小块（迷你显示）
<div class="demo-container" style="display:flex;gap:40px;align-items:center;">
  <div style="display:flex;align-items:center;gap:8px;">
    <div style="width:120px;">
      <ldesign-progress type="steps" steps="3" percent="50"></ldesign-progress>
    </div>
    <span>50%</span>
  </div>
  <div style="display:flex;align-items:center;gap:8px;">
    <div style="width:90px;">
      <ldesign-progress type="steps" steps="3" percent="50"></ldesign-progress>
    </div>
    <span>50%</span>
  </div>
  <div style="display:flex;align-items:center;gap:8px;">
    <div style="width:72px;">
      <ldesign-progress type="steps" steps="3" percent="50"></ldesign-progress>
    </div>
    <span>50%</span>
  </div>
</div>

### 普通分段

<div class="demo-container" style="display:flex;flex-direction:column;gap:10px;min-width:360px;">
  <ldesign-progress type="steps" steps="8" percent="10"></ldesign-progress>
  <ldesign-progress type="steps" steps="8" percent="60"></ldesign-progress>
  <ldesign-progress type="steps" steps="8" percent="60" success-percent="30"></ldesign-progress>
</div>

```html
<ldesign-progress type="steps" steps="8" percent="10"></ldesign-progress>
<ldesign-progress type="steps" steps="8" percent="60"></ldesign-progress>
<ldesign-progress type="steps" steps="8" percent="60" success-percent="30"></ldesign-progress>
```

## 圆形 / 仪表盘

<div class="demo-container" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:center;">
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
    <ldesign-progress type="circle" percent="50" width="120"></ldesign-progress>
    <ldesign-progress type="circle" percent="50" width="64"></ldesign-progress>
    <ldesign-progress type="circle" percent="50" width="24"></ldesign-progress>
  </div>
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
    <ldesign-progress type="dashboard" percent="75" width="160"></ldesign-progress>
    <ldesign-progress type="dashboard" percent="75" width="160" gap-degree="120"></ldesign-progress>
  </div>
</div>

```html
<ldesign-progress type="circle" percent="50" width="120"></ldesign-progress>
<ldesign-progress type="circle" percent="50" width="64"></ldesign-progress>
<ldesign-progress type="circle" percent="50" width="24"></ldesign-progress>

<ldesign-progress type="dashboard" percent="75" width="160"></ldesign-progress>
<ldesign-progress type="dashboard" percent="75" width="160" gap-degree="120"></ldesign-progress>
```

## 自定义 count（滑块联动）

<div class="demo-container" style="display:flex;flex-direction:column;gap:14px;">
  <input id="pg-count" type="range" min="0" max="100" value="50" style="width:260px;">
  <div style="display:flex;flex-direction:column;gap:10px;min-width:320px;">
    <ldesign-progress data-bind-percent="group1" percent="50"></ldesign-progress>
    <ldesign-progress data-bind-percent="group1" percent="50" status="active"></ldesign-progress>
  </div>
  <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
    <ldesign-progress data-bind-percent="group1" type="circle" width="120" percent="50"></ldesign-progress>
    <ldesign-progress data-bind-percent="group1" type="dashboard" width="160" percent="50"></ldesign-progress>
  </div>
</div>

```html
<input id="pg-count" type="range" min="0" max="100" value="50">
<ldesign-progress data-bind-percent="group1" percent="50"></ldesign-progress>
<ldesign-progress data-bind-percent="group1" percent="50" status="active"></ldesign-progress>
<ldesign-progress data-bind-percent="group1" type="circle" width="120" percent="50"></ldesign-progress>
<ldesign-progress data-bind-percent="group1" type="dashboard" width="160" percent="50"></ldesign-progress>
<script>
const slider = document.getElementById('pg-count');
slider?.addEventListener('input', () => {
  const val = Number(slider.value);
  document.querySelectorAll('[data-bind-percent="group1"]').forEach(el => el.percent = val);
});
</script>
```

## Custom gap（缺口角度滑块）

<div class="demo-container" style="display:flex;flex-direction:column;gap:14px;">
  <input id="pg-gap" type="range" min="0" max="300" value="75" style="width:260px;">
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
    <ldesign-progress data-gap-target type="dashboard" width="160" percent="50" gap-degree="75"></ldesign-progress>
    <ldesign-progress data-gap-target type="circle" width="140" percent="50" gap-degree="0"></ldesign-progress>
  </div>
</div>

```html
<input id="pg-gap" type="range" min="0" max="300" value="75">
<ldesign-progress data-gap-target type="dashboard" width="160" percent="50" gap-degree="75"></ldesign-progress>
<ldesign-progress data-gap-target type="circle" width="140" percent="50" gap-degree="0"></ldesign-progress>
<script>
const gap = document.getElementById('pg-gap');
const applyGap = () => {
  const v = Number(gap.value);
  document.querySelectorAll('[data-gap-target]').forEach((el) => el.setAttribute('gap-degree', String(v)));
};
['input','change'].forEach(ev => gap?.addEventListener(ev, applyGap));
applyGap();
</script>
```

## 半圆进度条（semicircle）

使用 `type="semicircle"` 可快速得到半圆，`semi-position` 控制方向。

<div class="demo-container" style="display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap;">
  <ldesign-progress type="semicircle" width="200" percent="50" semi-position="top"></ldesign-progress>
  <ldesign-progress type="semicircle" width="200" percent="75" semi-position="bottom" stroke-color="#52c41a"></ldesign-progress>
</div>

```html
<ldesign-progress type="semicircle" width="200" percent="50" semi-position="top"></ldesign-progress>
<ldesign-progress type="semicircle" width="200" percent="75" semi-position="bottom" stroke-color="#52c41a"></ldesign-progress>
```

## 端点样式（stroke-linecap）

仅对圆形/仪表盘有效。

<div class="demo-container" style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
  <ldesign-progress type="circle" width="100" percent="50" stroke-linecap="round"></ldesign-progress>
  <ldesign-progress type="circle" width="100" percent="50" stroke-linecap="square"></ldesign-progress>
  <ldesign-progress type="circle" width="100" percent="50" stroke-linecap="butt"></ldesign-progress>
</div>

```html
<ldesign-progress type="circle" width="100" percent="50" stroke-linecap="round"></ldesign-progress>
<ldesign-progress type="circle" width="100" percent="50" stroke-linecap="square"></ldesign-progress>
<ldesign-progress type="circle" width="100" percent="50" stroke-linecap="butt"></ldesign-progress>
```

## 自定义文字格式

使用 `format` 指定文字格式。

<div class="demo-container" style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
  <ldesign-progress type="circle" width="160" percent="75" format="{percent} Days"></ldesign-progress>
  <ldesign-progress type="circle" width="160" percent="100" status="success" format="Done"></ldesign-progress>
</div>

```html
<ldesign-progress type="circle" width="160" percent="75" format="{percent} Days"></ldesign-progress>
<ldesign-progress type="circle" width="160" percent="100" status="success" format="Done"></ldesign-progress>
```

## 分段进度（successPercent + circle 成功段）

<div class="demo-container" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:center;">
  <div style="display:flex;flex-direction:column;gap:10px;">
    <ldesign-progress percent="60" success-percent="30"></ldesign-progress>
    <ldesign-progress percent="90" success-percent="60" status="active"></ldesign-progress>
  </div>
  <div style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
    <ldesign-progress type="circle" width="140" percent="93" success-percent="60"></ldesign-progress>
    <ldesign-progress type="dashboard" width="160" percent="60" success-percent="30"></ldesign-progress>
  </div>
</div>

```html
<ldesign-progress percent="60" success-percent="30"></ldesign-progress>
<ldesign-progress percent="90" success-percent="60" status="active"></ldesign-progress>
<ldesign-progress type="circle" width="140" percent="93" success-percent="60"></ldesign-progress>
<ldesign-progress type="dashboard" width="160" percent="60" success-percent="30"></ldesign-progress>
```

## API（不变）

见页面底部表格。其余属性与注意事项同上文。

<style>
.demo-container{padding:8px 0}
</style>
