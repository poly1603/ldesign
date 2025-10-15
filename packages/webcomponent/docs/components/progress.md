#  Progress  进度条

组件标签：`<ldesign-progress>`

支持线形、环形、仪表盘、分段步骤、尺寸、状态、渐变、缺口角度、自定义文本等。全新升级支持  **不确定状态动画**、**百分比过渡动画**、**阴影发光效果**、**事件回调**  等强大功能。

##  基础用法（线形）

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:10px;min-width:340px;">
	<ldesign-progress  percent="30"></ldesign-progress>
	<ldesign-progress  percent="60"  status="active"></ldesign-progress>
	<ldesign-progress  percent="100"  status="success"></ldesign-progress>
	<ldesign-progress  percent="60"  status="exception"></ldesign-progress>
</div>

```html
<ldesign-progress  percent="30"></ldesign-progress>
<ldesign-progress  percent="60"  status="active"></ldesign-progress>
<ldesign-progress  percent="100"  status="success"></ldesign-progress>
<ldesign-progress  percent="60"  status="exception"></ldesign-progress>
```

##  🆕  不确定状态（Indeterminate）

当无法确定具体进度时，使用不确定状态显示循环动画。

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:16px;min-width:340px;">
	<ldesign-progress  indeterminate></ldesign-progress>
	<ldesign-progress  indeterminate  stroke-color="#f59e0b"></ldesign-progress>
</div>

```html
<ldesign-progress  indeterminate></ldesign-progress>
<ldesign-progress  indeterminate  stroke-color="#f59e0b"></ldesign-progress>
```

##  🆕  百分比动画过渡

启用  `animate`  属性，百分比变化时会平滑过渡。

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:14px;">
	<input  id="animated-slider"  type="range"  min="0"  max="100"  value="50"  style="width:300px;">
	<div  style="display:flex;flex-direction:column;gap:10px;min-width:340px;">
		<ldesign-progress  class="animated-progress"  percent="50"  animate></ldesign-progress>
		<ldesign-progress  class="animated-progress"  percent="50"  animate  status="active"></ldesign-progress>
	</div>
	<div  style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
		<ldesign-progress  class="animated-progress"  type="circle"  width="120"  percent="50"  animate></ldesign-progress>
		<ldesign-progress  class="animated-progress"  type="dashboard"  width="140"  percent="50"  animate></ldesign-progress>
	</div>
</div>

```html
<ldesign-progress  percent="50"  animate></ldesign-progress>
<ldesign-progress  type="circle"  percent="50"  animate></ldesign-progress>
```

##  🆕  阴影和发光效果

增强视觉效果，让进度条更有质感。

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:16px;">
	<div  style="display:flex;flex-direction:column;gap:10px;min-width:340px;">
		<ldesign-progress  percent="70"  shadow  stroke-color="#3b82f6"></ldesign-progress>
		<ldesign-progress  percent="70"  glow  stroke-color="#f59e0b"></ldesign-progress>
		<ldesign-progress  percent="70"  shadow  glow  stroke-color="#ec4899"></ldesign-progress>
	</div>
	<div  style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
		<ldesign-progress  type="circle"  width="120"  percent="75"  shadow  gradient-from="#5cc3ff"  gradient-to="#1677ff"></ldesign-progress>
		<ldesign-progress  type="circle"  width="120"  percent="75"  glow  gradient-from="#ffd16a"  gradient-to="#f59e0b"></ldesign-progress>
	</div>
</div>

```html
<!--  阴影效果  -->
<ldesign-progress  percent="70"  shadow  stroke-color="#3b82f6"></ldesign-progress>

<!--  发光效果  -->
<ldesign-progress  percent="70"  glow  stroke-color="#f59e0b"></ldesign-progress>

<!--  组合效果  -->
<ldesign-progress  percent="70"  shadow  glow  stroke-color="#ec4899"></ldesign-progress>
```

##  🆕  脉冲动画

为进度条添加脉冲动画效果，吸引注意力。

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:16px;">
	<ldesign-progress  percent="60"  pulse  stroke-color="#8b5cf6"></ldesign-progress>
	<div  style="display:flex;gap:24px;align-items:center;">
		<ldesign-progress  type="circle"  width="120"  percent="75"  pulse  gradient-from="#a78bfa"  gradient-to="#8b5cf6"></ldesign-progress>
	</div>
</div>

```html
<ldesign-progress  percent="60"  pulse  stroke-color="#8b5cf6"></ldesign-progress>
<ldesign-progress  type="circle"  percent="75"  pulse></ldesign-progress>
```

##  🆕  事件监听

监听进度变化和完成事件。

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:14px;">
	<input  id="event-slider"  type="range"  min="0"  max="100"  value="30"  style="width:300px;">
	<ldesign-progress  id="event-progress"  percent="30"></ldesign-progress>
	<div  id="event-log"  style="padding:12px;background:#f5f5f5;border-radius:6px;font-size:13px;font-family:monospace;min-height:60px;"></div>
</div>

```html
<ldesign-progress  id="my-progress"  percent="30"></ldesign-progress>
<script>
const  progress  =  document.getElementById('my-progress');

//  监听百分比变化
progress.addEventListener('percentChange',  (e)  =>  {
	console.log('进度变化:',  e.detail);
});

//  监听完成事件
progress.addEventListener('complete',  ()  =>  {
	console.log('进度完成！');
});
</script>
```

##  🆕  环形不确定状态

环形进度条也支持不确定状态。

<div  class="demo-container"  style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
	<ldesign-progress  type="circle"  width="120"  indeterminate></ldesign-progress>
	<ldesign-progress  type="circle"  width="120"  indeterminate  stroke-color="#10b981"></ldesign-progress>
	<ldesign-progress  type="dashboard"  width="140"  indeterminate  stroke-color="#f59e0b"></ldesign-progress>
</div>

```html
<ldesign-progress  type="circle"  indeterminate></ldesign-progress>
<ldesign-progress  type="dashboard"  indeterminate  stroke-color="#f59e0b"></ldesign-progress>
```

###  条内文本  /  左侧文本  /  底部图标

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:12px;min-width:520px;">
	<ldesign-progress  percent="0"    info-position="inside"  trail-color="#eee"  stroke-color="#ddd"></ldesign-progress>
	<ldesign-progress  percent="10"  info-position="inside"  stroke-color="#3b82f6"></ldesign-progress>
	<ldesign-progress  percent="50"  info-position="inside"  stroke-color="#b7e588"></ldesign-progress>
	<ldesign-progress  percent="60"  info-position="inside"  stroke-color="#07183a"></ldesign-progress>
	<ldesign-progress  percent="100"  info-position="inside"  stroke-color="#64c029"></ldesign-progress>

	<ldesign-progress  percent="60"  info-position="left"  stroke-color="#3b82f6"></ldesign-progress>
	<ldesign-progress  percent="100"  status="success"  info-position="bottom"  stroke-color="#64c029"></ldesign-progress>
</div>

```html
<ldesign-progress  percent="10"  info-position="inside"  stroke-color="#3b82f6"></ldesign-progress>
<ldesign-progress  percent="60"  info-position="left"  stroke-color="#3b82f6"></ldesign-progress>
<ldesign-progress  percent="100"  status="success"  info-position="bottom"></ldesign-progress>
```

##  小型进度条

更紧凑的展示，适合狭窄区域。

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:10px;min-width:260px;">
	<ldesign-progress  size="small"  percent="30"></ldesign-progress>
	<ldesign-progress  size="small"  percent="50"  status="active"></ldesign-progress>
	<ldesign-progress  size="small"  percent="60"  status="exception"></ldesign-progress>
	<ldesign-progress  size="small"  percent="100"  status="success"></ldesign-progress>
</div>

```html
<ldesign-progress  size="small"  percent="30"></ldesign-progress>
<ldesign-progress  size="small"  percent="50"  status="active"></ldesign-progress>
<ldesign-progress  size="small"  percent="60"  status="exception"></ldesign-progress>
<ldesign-progress  size="small"  percent="100"  status="success"></ldesign-progress>
```

##  尺寸（线形与圆形）

<div  class="demo-container"  style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:center;">
	<div  style="display:flex;flex-direction:column;gap:10px;">
		<ldesign-progress  size="small"  percent="50"></ldesign-progress>
		<ldesign-progress  size="medium"  percent="50"></ldesign-progress>
		<ldesign-progress  size="large"  percent="50"></ldesign-progress>
	</div>
	<div  style="display:flex;gap:16px;align-items:center;">
		<ldesign-progress  type="circle"  width="72"  percent="50"></ldesign-progress>
		<ldesign-progress  type="circle"  width="48"  percent="50"></ldesign-progress>
		<ldesign-progress  type="circle"  width="24"  percent="50"></ldesign-progress>
	</div>
</div>

```html
<!--  线形三种尺寸  -->
<ldesign-progress  size="small"  percent="50"></ldesign-progress>
<ldesign-progress  size="medium"  percent="50"></ldesign-progress>
<ldesign-progress  size="large"  percent="50"></ldesign-progress>

<!--  圆形不同直径  -->
<ldesign-progress  type="circle"  width="72"  percent="50"></ldesign-progress>
<ldesign-progress  type="circle"  width="48"  percent="50"></ldesign-progress>
<ldesign-progress  type="circle"  width="24"  percent="50"></ldesign-progress>
```

##  响应式进度圈（小于等于  20  隐藏内文）

当圆直径  `width  <=  20`  时，内部文本自动隐藏。可以配合  Tooltip  展示信息。

<div  class="demo-container"  style="display:flex;gap:16px;align-items:center;">
	<ldesign-progress  type="circle"  width="20"  percent="50"></ldesign-progress>
	<ldesign-tooltip  content="50%">
		<ldesign-progress  type="circle"  width="16"  percent="50"></ldesign-progress>
	</ldesign-tooltip>
</div>

```html
<ldesign-progress  type="circle"  width="20"  percent="50"></ldesign-progress>
<ldesign-tooltip  content="50%">
	<ldesign-progress  type="circle"  width="16"  percent="50"></ldesign-progress>
</ldesign-tooltip>
```

##  环形步骤进度图（分段）

通过  `circle-steps`  和  `circle-step-gap-degree`  实现带缺口的分段环。

<div  class="demo-container"  style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
	<ldesign-progress  type="circle"  width="180"  percent="50"  circle-steps="8"  circle-step-gap-degree="3"></ldesign-progress>
	<ldesign-progress  type="circle"  width="180"  percent="100"  status="success"  circle-steps="6"  circle-step-gap-degree="4"  stroke-color="#52c41a"></ldesign-progress>
	<ldesign-progress  type="circle"  width="180"  percent="75"  circle-steps="12"  circle-step-gap-degree="2"  shadow  gradient-from="#ec4899"  gradient-to="#8b5cf6"></ldesign-progress>
</div>

```html
<ldesign-progress  type="circle"  width="180"  percent="50"  circle-steps="8"  circle-step-gap-degree="3"></ldesign-progress>
<ldesign-progress  type="circle"  width="180"  percent="100"  status="success"  circle-steps="6"  circle-step-gap-degree="4"></ldesign-progress>
```

##  自定义进度条渐变色（圆形）

<div  class="demo-container"  style="display:flex;gap:20px;flex-wrap:wrap;align-items:center;">
	<ldesign-progress  type="circle"  width="120"  percent="90"  gradient-from="#5cc3ff"  gradient-to="#1677ff"></ldesign-progress>
	<ldesign-progress  type="circle"  width="120"  percent="93"  gradient-from="#ffd16a"  gradient-to="#f59e0b"></ldesign-progress>
	<ldesign-progress  type="circle"  width="120"  percent="90"  gradient-from="#7dd3fc"  gradient-to="#22c55e"></ldesign-progress>
	<ldesign-progress  type="circle"  width="120"  percent="93"  gradient-from="#fca5a5"  gradient-to="#f43f5e"></ldesign-progress>
</div>

```html
<ldesign-progress  type="circle"  width="120"  percent="90"  gradient-from="#5cc3ff"  gradient-to="#1677ff"></ldesign-progress>
<ldesign-progress  type="circle"  width="120"  percent="93"  gradient-from="#ffd16a"  gradient-to="#f59e0b"></ldesign-progress>
<ldesign-progress  type="circle"  width="120"  percent="90"  gradient-from="#7dd3fc"  gradient-to="#22c55e"></ldesign-progress>
<ldesign-progress  type="circle"  width="120"  percent="93"  gradient-from="#fca5a5"  gradient-to="#f43f5e"></ldesign-progress>
```

>  线形也可以把  `stroke-color`  直接设置为  CSS  `linear-gradient(...)`。

##  步骤进度条（分段显示）

###  细分小块（迷你显示）
<div  class="demo-container"  style="display:flex;gap:40px;align-items:center;">
	<div  style="display:flex;align-items:center;gap:8px;">
		<div  style="width:120px;">
			<ldesign-progress  type="steps"  steps="3"  percent="50"></ldesign-progress>
		</div>
		<span>50%</span>
	</div>
	<div  style="display:flex;align-items:center;gap:8px;">
		<div  style="width:90px;">
			<ldesign-progress  type="steps"  steps="3"  percent="50"></ldesign-progress>
		</div>
		<span>50%</span>
	</div>
	<div  style="display:flex;align-items:center;gap:8px;">
		<div  style="width:72px;">
			<ldesign-progress  type="steps"  steps="3"  percent="50"></ldesign-progress>
		</div>
		<span>50%</span>
	</div>
</div>

###  普通分段

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:10px;min-width:360px;">
	<ldesign-progress  type="steps"  steps="8"  percent="10"></ldesign-progress>
	<ldesign-progress  type="steps"  steps="8"  percent="60"></ldesign-progress>
	<ldesign-progress  type="steps"  steps="8"  percent="60"  success-percent="30"></ldesign-progress>
	<ldesign-progress  type="steps"  steps="8"  percent="75"  shadow></ldesign-progress>
</div>

```html
<ldesign-progress  type="steps"  steps="8"  percent="10"></ldesign-progress>
<ldesign-progress  type="steps"  steps="8"  percent="60"></ldesign-progress>
<ldesign-progress  type="steps"  steps="8"  percent="60"  success-percent="30"></ldesign-progress>
```

##  圆形  /  仪表盘

<div  class="demo-container"  style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:center;">
	<div  style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
		<ldesign-progress  type="circle"  percent="50"  width="120"></ldesign-progress>
		<ldesign-progress  type="circle"  percent="50"  width="64"></ldesign-progress>
		<ldesign-progress  type="circle"  percent="50"  width="24"></ldesign-progress>
	</div>
	<div  style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
		<ldesign-progress  type="dashboard"  percent="75"  width="160"></ldesign-progress>
		<ldesign-progress  type="dashboard"  percent="75"  width="160"  gap-degree="120"></ldesign-progress>
	</div>
</div>

```html
<ldesign-progress  type="circle"  percent="50"  width="120"></ldesign-progress>
<ldesign-progress  type="circle"  percent="50"  width="64"></ldesign-progress>
<ldesign-progress  type="circle"  percent="50"  width="24"></ldesign-progress>

<ldesign-progress  type="dashboard"  percent="75"  width="160"></ldesign-progress>
<ldesign-progress  type="dashboard"  percent="75"  width="160"  gap-degree="120"></ldesign-progress>
```

##  自定义  count（滑块联动）

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:14px;">
	<input  id="pg-count"  type="range"  min="0"  max="100"  value="50"  style="width:260px;">
	<div  style="display:flex;flex-direction:column;gap:10px;min-width:320px;">
		<ldesign-progress  data-bind-percent="group1"  percent="50"></ldesign-progress>
		<ldesign-progress  data-bind-percent="group1"  percent="50"  status="active"></ldesign-progress>
	</div>
	<div  style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
		<ldesign-progress  data-bind-percent="group1"  type="circle"  width="120"  percent="50"></ldesign-progress>
		<ldesign-progress  data-bind-percent="group1"  type="dashboard"  width="160"  percent="50"></ldesign-progress>
	</div>
</div>

```html
<input  id="pg-count"  type="range"  min="0"  max="100"  value="50">
<ldesign-progress  data-bind-percent="group1"  percent="50"></ldesign-progress>
<ldesign-progress  data-bind-percent="group1"  percent="50"  status="active"></ldesign-progress>
<ldesign-progress  data-bind-percent="group1"  type="circle"  width="120"  percent="50"></ldesign-progress>
<ldesign-progress  data-bind-percent="group1"  type="dashboard"  width="160"  percent="50"></ldesign-progress>
<script>
const  slider  =  document.getElementById('pg-count');
slider?.addEventListener('input',  ()  =>  {
	const  val  =  Number(slider.value);
	document.querySelectorAll('[data-bind-percent="group1"]').forEach(el  =>  el.percent  =  val);
});
</script>
```

##  Custom  gap（缺口角度滑块）

<div  class="demo-container"  style="display:flex;flex-direction:column;gap:14px;">
	<input  id="pg-gap"  type="range"  min="0"  max="300"  value="75"  style="width:260px;">
	<div  style="display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
		<ldesign-progress  data-gap-target  type="dashboard"  width="160"  percent="50"  gap-degree="75"></ldesign-progress>
		<ldesign-progress  data-gap-target  type="circle"  width="140"  percent="50"  gap-degree="0"></ldesign-progress>
	</div>
</div>

```html
<input  id="pg-gap"  type="range"  min="0"  max="300"  value="75">
<ldesign-progress  data-gap-target  type="dashboard"  width="160"  percent="50"  gap-degree="75"></ldesign-progress>
<ldesign-progress  data-gap-target  type="circle"  width="140"  percent="50"  gap-degree="0"></ldesign-progress>
<script>
const  gap  =  document.getElementById('pg-gap');
const  applyGap  =  ()  =>  {
	const  v  =  Number(gap.value);
	document.querySelectorAll('[data-gap-target]').forEach((el)  =>  el.setAttribute('gap-degree',  String(v)));
};
['input','change'].forEach(ev  =>  gap?.addEventListener(ev,  applyGap));
applyGap();
</script>
```

##  半圆进度条（semicircle）

使用  `type="semicircle"`  可快速得到半圆，`semi-position`  控制方向。

<div  class="demo-container"  style="display:flex;gap:24px;align-items:flex-end;flex-wrap:wrap;">
	<ldesign-progress  type="semicircle"  width="200"  percent="50"  semi-position="top"></ldesign-progress>
	<ldesign-progress  type="semicircle"  width="200"  percent="75"  semi-position="bottom"  stroke-color="#52c41a"></ldesign-progress>
	<ldesign-progress  type="semicircle"  width="200"  percent="85"  semi-position="top"  shadow  gradient-from="#a78bfa"  gradient-to="#8b5cf6"></ldesign-progress>
</div>

```html
<ldesign-progress  type="semicircle"  width="200"  percent="50"  semi-position="top"></ldesign-progress>
<ldesign-progress  type="semicircle"  width="200"  percent="75"  semi-position="bottom"  stroke-color="#52c41a"></ldesign-progress>
```

##  端点样式（stroke-linecap）

仅对圆形/仪表盘有效。

<div  class="demo-container"  style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
	<ldesign-progress  type="circle"  width="100"  percent="50"  stroke-linecap="round"></ldesign-progress>
	<ldesign-progress  type="circle"  width="100"  percent="50"  stroke-linecap="square"></ldesign-progress>
	<ldesign-progress  type="circle"  width="100"  percent="50"  stroke-linecap="butt"></ldesign-progress>
</div>

```html
<ldesign-progress  type="circle"  width="100"  percent="50"  stroke-linecap="round"></ldesign-progress>
<ldesign-progress  type="circle"  width="100"  percent="50"  stroke-linecap="square"></ldesign-progress>
<ldesign-progress  type="circle"  width="100"  percent="50"  stroke-linecap="butt"></ldesign-progress>
```

##  自定义文字格式

使用  `format`  指定文字格式。

<div  class="demo-container"  style="display:flex;gap:24px;align-items:center;flex-wrap:wrap;">
	<ldesign-progress  type="circle"  width="160"  percent="75"  format="{percent}  Days"></ldesign-progress>
	<ldesign-progress  type="circle"  width="160"  percent="100"  status="success"  format="Done"></ldesign-progress>
	<ldesign-progress  type="circle"  width="160"  percent="88"  format="{percent}/100"  gradient-from="#ec4899"  gradient-to="#8b5cf6"></ldesign-progress>
</div>

```html
<ldesign-progress  type="circle"  width="160"  percent="75"  format="{percent}  Days"></ldesign-progress>
<ldesign-progress  type="circle"  width="160"  percent="100"  status="success"  format="Done"></ldesign-progress>
```

##  分段进度（successPercent  +  circle  成功段）

<div  class="demo-container"  style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:center;">
	<div  style="display:flex;flex-direction:column;gap:10px;">
		<ldesign-progress  percent="60"  success-percent="30"></ldesign-progress>
		<ldesign-progress  percent="90"  success-percent="60"  status="active"></ldesign-progress>
	</div>
	<div  style="display:flex;gap:20px;align-items:center;flex-wrap:wrap;">
		<ldesign-progress  type="circle"  width="140"  percent="93"  success-percent="60"></ldesign-progress>
		<ldesign-progress  type="dashboard"  width="160"  percent="60"  success-percent="30"></ldesign-progress>
	</div>
</div>

```html
<ldesign-progress  percent="60"  success-percent="30"></ldesign-progress>
<ldesign-progress  percent="90"  success-percent="60"  status="active"></ldesign-progress>
<ldesign-progress  type="circle"  width="140"  percent="93"  success-percent="60"></ldesign-progress>
<ldesign-progress  type="dashboard"  width="160"  percent="60"  success-percent="30"></ldesign-progress>
```

##  API

###  Properties

|  属性  |  说明  |  类型  |  默认值  |
|  ---  |  ---  |  ---  |  ---  |
|  `type`  |  类型：line/circle/dashboard/steps/semicircle  |  `string`  |  `'line'`  |
|  `percent`  |  百分比  (0-100)  |  `number`  |  `0`  |
|  `status`  |  状态：normal/active/success/exception  |  `string`  |  `'normal'`  |
|  `size`  |  尺寸：small/medium/large  |  `string`  |  `'medium'`  |
|  `strokeColor`  |  进度条颜色  |  `string`  |  -  |
|  `trailColor`  |  轨道颜色  |  `string`  |  -  |
|  `strokeWidth`  |  线宽（line  为高度，circle  为描边宽度）  |  `number`  |  -  |
|  `showInfo`  |  是否显示信息文本  |  `boolean`  |  `true`  |
|  `format`  |  文本格式化，{percent}  为占位符  |  `string`  |  `'{percent}%'`  |
|  `infoPosition`  |  线形文本位置：right/left/inside/bottom  |  `string`  |  `'right'`  |
|  `successPercent`  |  成功进度  (0-100)  |  `number`  |  -  |
|  `successColor`  |  成功颜色  |  `string`  |  -  |
|  `width`  |  圆形外径  (px)  |  `number`  |  `120`  |
|  `strokeLinecap`  |  端点样式：round/square/butt  |  `string`  |  `'round'`  |
|  `gradientFrom`  |  渐变起始色  |  `string`  |  -  |
|  `gradientTo`  |  渐变结束色  |  `string`  |  -  |
|  `gradientDirection`  |  渐变方向：horizontal/vertical/diagonal  |  `string`  |  `'horizontal'`  |
|  `gapDegree`  |  仪表盘缺口角度  (0-360)  |  `number`  |  -  |
|  `gapPosition`  |  缺口位置：top/right/bottom/left  |  `string`  |  `'top'`  |
|  `semiPosition`  |  半圆位置：top/bottom  |  `string`  |  `'top'`  |
|  `steps`  |  步骤数  |  `number`  |  -  |
|  `stepsGap`  |  步骤间隙  (px)  |  `number`  |  `2`  |
|  `stepsRadius`  |  步骤圆角  |  `number`  |  `100`  |
|  `circleSteps`  |  圆形分段数  |  `number`  |  -  |
|  `circleStepGapDegree`  |  圆形分段间隔角度  |  `number`  |  `2`  |
|  `striped`  |  条纹动画  |  `boolean`  |  `true`  |
|  🆕  `indeterminate`  |  不确定状态（循环动画）  |  `boolean`  |  `false`  |
|  🆕  `animate`  |  启用百分比过渡动画  |  `boolean`  |  `false`  |
|  🆕  `shadow`  |  阴影效果  |  `boolean`  |  `false`  |
|  🆕  `glow`  |  发光效果  |  `boolean`  |  `false`  |
|  🆕  `pulse`  |  脉冲动画  |  `boolean`  |  `false`  |

###  Events

|  事件名  |  说明  |  回调参数  |
|  ---  |  ---  |  ---  |
|  🆕  `percentChange`  |  百分比变化时触发  |  `(percent:  number)`  |
|  🆕  `complete`  |  进度达到  100%  时触发  |  `()`  |

###  Slots

|  插槽名  |  说明  |
|  ---  |  ---  |
|  🆕  `circle-content`  |  圆形进度条内部自定义内容  |

##  性能优化说明

本次升级包含以下性能优化：

1.  **缓存计算结果**：gradientId  在组件加载时生成一次，避免每次  render  重复创建
2.  **减少  DOM  操作**：优化了样式对象的创建和更新逻辑
3.  **过渡动画优化**：使用  requestAnimationFrame  实现流畅的百分比动画
4.  **内存管理**：在组件卸载时清理动画帧，防止内存泄漏
5.  **CSS  过渡优化**：使用  GPU  加速的  CSS  属性，提升动画性能

<script  setup>
import  {  onMounted  }  from  'vue'

onMounted(()  =>  {
	//  1.  动画滑块控制
	const  animatedSlider  =  document.getElementById('animated-slider')
	if  (animatedSlider)  {
		animatedSlider.addEventListener('input',  ()  =>  {
			const  val  =  Number(animatedSlider.value)
			document.querySelectorAll('.animated-progress').forEach(el  =>  {
				el.percent  =  val
			})
		})
	}

	//  2.  事件日志
	const  eventSlider  =  document.getElementById('event-slider')
	const  eventProgress  =  document.getElementById('event-progress')
	const  eventLog  =  document.getElementById('event-log')

	if  (eventSlider  &&  eventProgress  &&  eventLog)  {
		let  logs  =  []
		const  addLog  =  (msg)  =>  {
			logs.unshift(`[${new  Date().toLocaleTimeString()}]  ${msg}`)
			if  (logs.length  >  3)  logs  =  logs.slice(0,  3)
			eventLog.textContent  =  logs.join('\n')
		}

		eventProgress.addEventListener('percentChange',  (e)  =>  {
			addLog(`进度变化:  ${e.detail}%`)
		})

		eventProgress.addEventListener('complete',  ()  =>  {
			addLog('🎉  进度完成！')
		})

		eventSlider.addEventListener('input',  ()  =>  {
			eventProgress.percent  =  Number(eventSlider.value)
		})
	}

	//  3.  进度联动（pg-count）
	const  pgCountSlider  =  document.getElementById('pg-count')
	if  (pgCountSlider)  {
		const  updatePercent  =  ()  =>  {
			const  val  =  Number(pgCountSlider.value)
			document.querySelectorAll('[data-bind-percent="group1"]').forEach(el  =>  {
				el.percent  =  val
			})
		}
		pgCountSlider.addEventListener('input',  updatePercent)
		updatePercent()
	}

	//  4.  缺口角度控制（pg-gap）
	const  pgGapSlider  =  document.getElementById('pg-gap')
	if  (pgGapSlider)  {
		const  applyGap  =  ()  =>  {
			const  v  =  Number(pgGapSlider.value)
			document.querySelectorAll('[data-gap-target]').forEach((el)  =>  {
				el.setAttribute('gap-degree',  String(v))
			})
		}
		;['input',  'change'].forEach(ev  =>  pgGapSlider.addEventListener(ev,  applyGap))
		applyGap()
	}
})
</script>

<style>
.demo-container{padding:8px  0}
</style>
