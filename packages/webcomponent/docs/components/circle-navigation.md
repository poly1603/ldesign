# CircleNavigation 圆形导航

将子元素均匀分布在一个圆周上，支持自定义圆的宽高、起始角度与顺/逆时针排列，并提供圆心插槽。

- 尺寸控制：width / height（数值按 px 处理，也可传 px/%/rem 字符串）
- 排列控制：start-angle、clockwise
- 边缘留白：padding，避免项目紧贴容器边缘
- 圆心插槽：slot="center"

## 基础用法

<div class="demo-container">
  <ldesign-circle-navigation width="300" height="300" start-angle="-90" padding="12">
    <button class="as-dot">A</button>
    <button class="as-dot">B</button>
    <button class="as-dot">C</button>
    <button class="as-dot">D</button>
    <div slot="center" class="as-dot">+</div>
  </ldesign-circle-navigation>
</div>

```html
<ldesign-circle-navigation width="300" height="300" start-angle="-90" padding="12">
  <button class="as-dot">A</button>
  <button class="as-dot">B</button>
  <button class="as-dot">C</button>
  <button class="as-dot">D</button>
  <div slot="center" class="as-dot">+</div>
</ldesign-circle-navigation>
```

提示：示例中的 .as-dot 是演示类名（圆形按钮外观），实际项目中可替换为自定义样式。

## 自定义尺寸（宽高）

- 仅传 width：height 将等于 width，形成正圆
- 同时传入 width 与 height：将形成椭圆轨道。布局规则：两端固定（左右端），剩余项在上半弧与下半弧均匀分布。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-circle-navigation width="220">
      <button class="as-dot">1</button>
      <button class="as-dot">2</button>
      <button class="as-dot">3</button>
      <button class="as-dot">4</button>
      <div slot="center" class="as-dot">OK</div>
    </ldesign-circle-navigation>
    <ldesign-circle-navigation width="280" height="200" padding="10">
      <button class="as-dot">A</button>
      <button class="as-dot">B</button>
      <button class="as-dot">C</button>
      <button class="as-dot">D</button>
      <button class="as-dot">E</button>
      <div slot="center" class="as-dot">Go</div>
    </ldesign-circle-navigation>
  </div>
</div>

```html
<ldesign-circle-navigation width="220">
  <button class="as-dot">1</button>
  <button class="as-dot">2</button>
  <button class="as-dot">3</button>
  <button class="as-dot">4</button>
  <div slot="center" class="as-dot">OK</div>
</ldesign-circle-navigation>

<ldesign-circle-navigation width="280" height="200" padding="10">
  <button class="as-dot">A</button>
  <button class="as-dot">B</button>
  <button class="as-dot">C</button>
  <button class="as-dot">D</button>
  <button class="as-dot">E</button>
  <div slot="center" class="as-dot">Go</div>
</ldesign-circle-navigation>
```

## 起始角与顺/逆时针

- start-angle：起始角（度），默认 -90（第一个元素在正上方）
- clockwise：是否顺时针，默认 true

<div class="demo-container">
  <div class="demo-row">
    <ldesign-circle-navigation width="260" start-angle="0">
      <button class="as-dot">0°</button>
      <button class="as-dot">1</button>
      <button class="as-dot">2</button>
      <button class="as-dot">3</button>
    </ldesign-circle-navigation>
    <ldesign-circle-navigation width="260" start-angle="-90" clockwise="false">
      <button class="as-dot">逆时针</button>
      <button class="as-dot">1</button>
      <button class="as-dot">2</button>
      <button class="as-dot">3</button>
      <button class="as-dot">4</button>
    </ldesign-circle-navigation>
  </div>
</div>

```html
<ldesign-circle-navigation width="260" start-angle="0">
  <button class="as-dot">0°</button>
  <button class="as-dot">1</button>
  <button class="as-dot">2</button>
  <button class="as-dot">3</button>
</ldesign-circle-navigation>

<!-- 注意：在原生 HTML 中布尔属性使用 "clockwise="false""，不要使用冒号语法 -->
<ldesign-circle-navigation width="260" start-angle="-90" clockwise="false">
  <button class="as-dot">逆时针</button>
  <button class="as-dot">1</button>
  <button class="as-dot">2</button>
  <button class="as-dot">3</button>
  <button class="as-dot">4</button>
</ldesign-circle-navigation>
```

## 圆心插槽（center）

将圆心作为功能主键或展示区域：

<div class="demo-container">
  <ldesign-circle-navigation width="300">
    <button class="as-dot">1</button>
    <button class="as-dot">2</button>
    <button class="as-dot">3</button>
    <button class="as-dot">4</button>
    <button class="as-dot">5</button>
    <div slot="center" class="as-dot" style="width:56px;height:56px;">中心</div>
  </ldesign-circle-navigation>
</div>

```html
<ldesign-circle-navigation width="300">
  <button class="as-dot">1</button>
  <button class="as-dot">2</button>
  <button class="as-dot">3</button>
  <button class="as-dot">4</button>
  <button class="as-dot">5</button>
  <div slot="center" class="as-dot" style="width:56px;height:56px;">中心</div>
</ldesign-circle-navigation>
```

## 透视（近大远小）

- 开启 `perspective` 以启用近大远小
- `front-angle` 指定“最近”的角度（默认 90，底部最近）；`min-scale`/`max-scale` 控制缩放范围
- 想要 3D 透视：设置 `z-depth` 为正数，同时可用 `perspective-distance` 控制 CSS 透视距离、`perspective-origin` 控制透视原点

<div class="demo-container">
  <div class="demo-row">
    <ldesign-circle-navigation width="320" height="220" perspective front-angle="90" min-scale="0.8" max-scale="1.3">
      <button class="as-dot">1</button>
      <button class="as-dot">2</button>
      <button class="as-dot">3</button>
      <button class="as-dot">4</button>
      <button class="as-dot">5</button>
      <button class="as-dot">6</button>
      <div slot="center" class="as-dot">中心</div>
    </ldesign-circle-navigation>
  </div>
</div>

```html
<ldesign-circle-navigation
  width="320"
  height="220"
  perspective
  front-angle="90"
  min-scale="0.8"
  max-scale="1.3"
  z-depth="80"
  perspective-distance="700"
  perspective-origin="50% 50%"
>
  <button class="as-dot">1</button>
  <button class="as-dot">2</button>
  <button class="as-dot">3</button>
  <button class="as-dot">4</button>
  <button class="as-dot">5</button>
  <button class="as-dot">6</button>
  <div slot="center" class="as-dot">中心</div>
</ldesign-circle-navigation>
```

## 可访问性（A11y）

- 根元素为 nav[role="navigation"]
- 可通过 aria-label 指定导航名称

```html
<ldesign-circle-navigation aria-label="Circular actions">
  ...
</ldesign-circle-navigation>
```

## 属性（Props）

- width: number | string = 240 — 宽度（数值按 px 处理，或传入带单位字符串）
- height?: number | string — 高度；未传时与 width 相同。width ≠ height 时为椭圆轨道（两端固定，余量均分到两段弧）
- ellipseAxis: 'auto' | 'x' | 'y' — 椭圆端点轴。x=左右为端点（默认），y=上下为端点，auto 会根据宽高自动选择。
- startAngle: number = -90 — 起始角（度）。-90 表示第一个在正上方（正圆时生效）
- clockwise: boolean = true — 是否顺时针排列
- padding: number = 8 — 与容器边缘的留白（px）
- ellipseSpacing: 'angle' | 'arc' — 椭圆半弧内的均分策略：angle 按角度均分（更接近视觉均匀），arc 按弧长均分（几何严格）。默认 angle。
- perspective: boolean — 近大远小；frontAngle、minScale、maxScale 控制参数（见上文）
- zDepth: number — 3D 透视的 Z 轴偏移幅度（px），>0 生效
- perspectiveDistance: number — CSS perspective 距离（px），用于 3D 透视
- perspectiveOrigin?: string — 透视原点（例如 '50% 50%'、'center 80%'）
- showTrack: boolean — 是否显示虚线轨道
- aria-label — 无障碍名称（写在组件标签上）

## 样式（示例 .as-dot）

下方为文档演示所用的圆形按钮样式，业务可按需替换：

```css
.as-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--ld-color-primary, #1677ff);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}
```
