# Draggable 拖拽缩放容器

高性能的手势交互容器组件，用于承载大图或任意内容，支持 PC 与移动端的全套交互手势。

## 特性

### 基础功能
- 🖱️ **PC 端**：滚轮缩放、鼠标拖拽平移、双击缩放切换
- 📱 **移动端**：双指缩放+旋转、单指拖拽、橡皮筋阻尼、松手回弹、动量滚动
- ⌨️ **键盘操作**：方向键平移、+/- 缩放、R 旋转、0 重置

### 增强功能
- 📐 **网格吸附**：可选的网格对齐功能，精确定位
- 📊 **实时指示器**：显示当前缩放比例和旋转角度
- ↩️ **撤销/重做**：支持操作历史记录
- 🗺️ **缩略图导航**：小地图快速定位
- 📈 **性能监控**：实时 FPS 显示
- 🎯 **预设视角**：快速切换到预定义视图
- 🎨 **平滑边界**：优雅的边界弹性效果

组件标签：`<ldesign-draggable>`

## 基础用法（图片）

> 初始化设置：可通过 `initial-scale`、`initial-offset-x`、`initial-offset-y` 指定初始缩放与位置；缩放会被自动夹在 `min-scale~max-scale` 范围内。

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable src="https://picsum.photos/id/1015/1600/900" style="width:100%;height:100%"></ldesign-draggable>
</div>

```html
<div style="height: 360px; border: 1px dashed #ddd;">
  <ldesign-draggable
    src="https://picsum.photos/id/1015/1600/900"
    style="width:100%;height:100%"
  ></ldesign-draggable>
</div>
```

## 使用插槽包裹自定义内容

你也可以不传 `src`，直接把任意内容放进插槽，组件会对“插槽包裹的整体”进行缩放/拖拽/旋转。

<div class="demo-block" style="height: 340px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable style="width:100%;height:100%">
    <img src="https://picsum.photos/id/1039/1200/800" alt="demo" />
  </ldesign-draggable>
</div>

```html
<ldesign-draggable style="width:100%;height:320px">
  <img src="/imgs/big.jpg" />
</ldesign-draggable>
```

### 图文混排（插槽）

插槽内可以放置图文混排、列表、徽章等任意布局，组件会将它们作为一个整体进行变换。

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable style="width:100%;height:100%">
    <div style="display:flex;gap:12px;align-items:flex-start;background:var(--vp-c-bg-soft);padding:12px;border-radius:8px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
      <img src="https://picsum.photos/id/1018/960/640" alt="waterfall" style="width:360px;height:220px;object-fit:cover;border-radius:6px;flex:0 0 auto;" />
      <div style="max-width:520px">
        <h3 style="margin:0 0 8px;">山谷瀑布</h3>
        <p style="margin:0 0 6px;opacity:.85;">示例：将图片与文本一起放在插槽中，整体缩放与拖拽。</p>
        <ul style="margin:6px 0 0 18px;opacity:.85;">
          <li>支持整体缩放、拖拽、旋转</li>
          <li>图片原生拖拽已禁用，拖动更顺滑</li>
        </ul>
      </div>
    </div>
  </ldesign-draggable>
</div>

```html
<ldesign-draggable style="width:100%;height:360px">
  <div style="display:flex;gap:12px;align-items:flex-start;background:#f7f7f9;padding:12px;border-radius:8px;">
    <img src="/imgs/pic.jpg" style="width:360px;height:220px;object-fit:cover;border-radius:6px;flex:0 0 auto;" />
    <div style="max-width:520px">
      <h3 style="margin:0 0 8px;">标题</h3>
      <p style="margin:0 0 6px;opacity:.85;">这里是一些说明文字，这个整块内容会被作为一个整体缩放与拖拽。</p>
      <ul style="margin:6px 0 0 18px;opacity:.85;">
        <li>支持整体缩放、拖拽、旋转</li>
        <li>图片已默认禁用原生拖拽</li>
      </ul>
    </div>
  </div>
</ldesign-draggable>
```

> 说明：为避免浏览器原生图片拖拽影响体验，组件已对插槽中的 `<img>` 自动关闭原生拖拽与选择；若你需要图片可点击/可交互，可在样式中覆盖 pointer-events。

## 交互说明
- PC：
  - 滚轮缩放（以光标为中心）
  - 按住拖拽平移
  - 双击在 1x 与 2x（可配）之间切换
- 移动：
  - 双指捏合缩放（以两指中点为枢轴）
  - 双指旋转（可通过 enable-rotate 关闭）
  - 单指拖拽平移
  - 松手自动回弹到可视边界内，放大后甩动有动量滚动

### 键盘与滚轮增强
- 滚轮平移：默认开启（wheelPan=true）。当 `wheelZoomRequiresCtrl=true` 时，按住 Ctrl/⌘ 滚轮为缩放，否则为平移。
- 方向键：↑ ↓ ← → 平移（keyPanStep，可配）；按住 Shift 加速，按住 Ctrl/⌘ 减速。
- +/-：缩放；0：重置；R：顺时针 90° 旋转（按住 Shift 逆时针 90°）。
- 旋转吸附：设置 `rotateSnapDeg>0` 时，捏合旋转接近该步进倍数会在 `rotateSnapEpsilon` 范围内吸附。

## 可控示例（按钮控制缩放/重置）

### 内置悬浮工具栏（可选）

开启 `show-controls` 即可显示内置工具栏，支持放大/缩小/重置/旋转/自适应：

<div class="demo-block" style="height: 320px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable src="https://picsum.photos/id/1000/1600/900" style="width:100%;height:100%"
    show-controls controls-position="top-right"
    initial-scale="1.2" initial-offset-x="30" initial-offset-y="-20"
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable
  src="/big.jpg"
  style="width:100%;height:320px"
  show-controls
  controls-position="bottom-right"
  initial-scale="1.2"
  initial-offset-x="30"
  initial-offset-y="-20"
></ldesign-draggable>
```

也可通过具名插槽自定义工具栏（覆盖默认按钮）：

```html
<ldesign-draggable style="width:100%;height:320px">
  <img src="/big.jpg">
  <div slot="controls">
    <button onclick="this.closest('ldesign-draggable').zoomIn()">+</button>
    <button onclick="this.closest('ldesign-draggable').zoomOut()">-</button>
  </div>
</ldesign-draggable>
```

<div class="demo-block" style="border: 1px dashed var(--vp-c-divider); padding: 10px;">
  <div style="height: 320px; position: relative;">
    <ldesign-draggable id="demo-drag-1" src="https://picsum.photos/id/1003/1600/1000" style="width:100%;height:100%"></ldesign-draggable>
  </div>
  <div style="margin-top: 10px; display:flex; gap:8px;">
    <button class="vp-button" onclick="document.getElementById('demo-drag-1').zoomTo(2)">放大到 2x</button>
    <button class="vp-button" onclick="document.getElementById('demo-drag-1').reset()">重置</button>
  </div>
</div>

> 注意：上面按钮脚本仅作演示。实际工程中，建议在框架环境里通过 `ref` 获取元素并调用方法。

框架中以编程方式控制（示意）：

```ts
const el = document.querySelector('ldesign-draggable') as any;
el.zoomTo(2);         // 缩放到 2x
el.setRotate(90);     // 旋转 90 度
el.setOffsets(50, 0); // 右移 50px
el.reset();           // 重置
```

### 滚轮平移 + Ctrl/⌘ 缩放（演示）

当 `wheel-zoom-requires-ctrl` 为 true 时，滚轮默认平移；按住 Ctrl/⌘ 时为缩放：

<div class="demo-block" style="height: 320px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable
    src="https://picsum.photos/id/1021/1600/900"
    style="width:100%;height:100%"
    wheel-pan
    wheel-zoom-requires-ctrl
    show-controls
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable
  src="/imgs/big.jpg"
  style="width:100%;height:320px"
  wheel-pan
  wheel-zoom-requires-ctrl
  show-controls
></ldesign-draggable>
```

### 旋转吸附（演示）

设置 `rotate-snap-deg` 后，捏合旋转会自动吸附到该步进的倍数（阈值由 `rotate-snap-epsilon` 控制）：

<div class="demo-block" style="height: 320px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable
    src="https://picsum.photos/id/1025/1600/900"
    style="width:100%;height:100%"
    rotate-snap-deg="15"
    rotate-snap-epsilon="4"
    show-controls
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable
  src="/imgs/big.jpg"
  style="width:100%;height:320px"
  rotate-snap-deg="15"
  rotate-snap-epsilon="4"
  show-controls
></ldesign-draggable>
```

### 键盘操作（演示）

点击容器使其获得焦点后，尝试使用 ↑ ↓ ← →、+/-、0、R（Shift+R）：

<div class="demo-block" style="height: 300px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable
    src="https://picsum.photos/id/1016/1600/900"
    style="width:100%;height:100%"
    keyboard
    show-controls
  ></ldesign-draggable>
</div>

### Fit 自适应方法（演示）

通过方法快速调整画面填充策略：

<div class="demo-block" style="border: 1px dashed var(--vp-c-divider); padding: 10px;">
  <div style="height: 300px; position: relative;">
    <ldesign-draggable id="demo-fit-1" src="https://picsum.photos/id/1037/1600/900" style="width:100%;height:100%" show-controls></ldesign-draggable>
  </div>
  <div style="margin-top: 10px; display:flex; gap:8px;">
    <button class="vp-button" onclick="document.getElementById('demo-fit-1').fitContain()">Contain</button>
    <button class="vp-button" onclick="document.getElementById('demo-fit-1').fitCover()">Cover</button>
    <button class="vp-button" onclick="document.getElementById('demo-fit-1').reset()">重置</button>
  </div>
</div>

```html
<div>
  <ldesign-draggable id="drag-fit" src="/imgs/big.jpg" style="width:100%;height:300px" show-controls></ldesign-draggable>
  <button onclick="dragFit.fitContain()">Contain</button>
  <button onclick="dragFit.fitCover()">Cover</button>
  <button onclick="dragFit.reset()">重置</button>
</div>
```

## 高级功能演示

### 网格吸附

启用网格吸附功能，拖拽时自动对齐到网格点：

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    src="https://picsum.photos/id/1029/800/600" 
    style="width:100%;height:100%"
    enable-grid
    grid-size="30"
    show-controls
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable 
  src="/imgs/photo.jpg" 
  enable-grid
  grid-size="30"
  show-controls
></ldesign-draggable>
```

### 实时指示器

显示当前缩放比例和旋转角度：

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    src="https://picsum.photos/id/1040/800/600" 
    style="width:100%;height:100%"
    show-indicators
    show-controls
    initial-scale="1.5"
    initial-rotate="15"
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable 
  src="/imgs/photo.jpg" 
  show-indicators
  show-controls
></ldesign-draggable>
```

### 撤销/重做功能

记录操作历史，支持撤销和重做：

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    id="demo-history"
    src="https://picsum.photos/id/1042/800/600" 
    style="width:100%;height:100%"
    enable-history
    max-history="20"
    show-controls
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable 
  src="/imgs/photo.jpg" 
  enable-history
  max-history="20"
  show-controls
></ldesign-draggable>
```

### 缩略图导航

显示小地图帮助定位：

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    src="https://picsum.photos/id/1043/1600/1200" 
    style="width:100%;height:100%"
    show-minimap
    minimap-position="bottom-right"
    show-controls
    initial-scale="2"
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable 
  src="/imgs/large-image.jpg" 
  show-minimap
  minimap-position="bottom-right"
  show-controls
></ldesign-draggable>
```

### 预设视角

快速切换到预定义的视图状态（需要通过 JavaScript 设置）：

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    id="demo-presets"
    src="https://picsum.photos/id/1044/1600/1200" 
    style="width:100%;height:100%"
    show-controls
  ></ldesign-draggable>
</div>

```javascript
// 设置预设视角
const draggable = document.querySelector('ldesign-draggable');
draggable.presetViews = [
  { name: '全景', scale: 1, rotate: 0, offsetX: 0, offsetY: 0 },
  { name: '左上', scale: 2, rotate: 0, offsetX: -100, offsetY: -80 },
  { name: '中心', scale: 2.5, rotate: 0, offsetX: 0, offsetY: 0 },
  { name: '旋转', scale: 1.5, rotate: 45, offsetX: 0, offsetY: 0 }
];
```

### 性能监控

实时显示 FPS 用于性能调试：

<div class="demo-block" style="height: 300px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    src="https://picsum.photos/id/1045/1600/1200" 
    style="width:100%;height:100%"
    show-performance
    show-controls
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable 
  src="/imgs/photo.jpg" 
  show-performance
  show-controls
></ldesign-draggable>
```

### 平滑边界效果

启用边界弹性，提供更自然的边界交互：

<div class="demo-block" style="height: 300px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    src="https://picsum.photos/id/1047/800/600" 
    style="width:100%;height:100%"
    smooth-bounds
    bounds-elasticity="0.2"
    show-controls
    initial-scale="0.8"
  ></ldesign-draggable>
</div>

```html
<ldesign-draggable 
  src="/imgs/photo.jpg" 
  smooth-bounds
  bounds-elasticity="0.2"
  show-controls
></ldesign-draggable>
```

### 综合示例

所有高级功能的综合展示：

<div class="demo-block" style="height: 400px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable 
    id="demo-all"
    src="https://picsum.photos/id/1049/2000/1500" 
    style="width:100%;height:100%"
    enable-grid
    grid-size="25"
    show-indicators
    enable-history
    show-minimap
    minimap-position="top-right"
    smooth-bounds
    bounds-elasticity="0.15"
    show-controls
    controls-position="bottom-left"
  ></ldesign-draggable>
</div>

```html
<!-- 综合功能示例 -->
<ldesign-draggable 
  src="/imgs/large-photo.jpg" 
  enable-grid
  grid-size="25"
  show-indicators
  enable-history
  show-minimap
  minimap-position="top-right"
  smooth-bounds
  bounds-elasticity="0.15"
  show-controls
  controls-position="bottom-left"
></ldesign-draggable>
```

## 属性（Props）

### 基础属性

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| src | 图片地址（可选；不传时使用插槽） | string | - |
| alt | 图片替代文本 | string | - |
| initial-scale | 初始缩放 | number | 1 |
| initial-rotate | 初始角度（度） | number | 0 |
| initial-offset-x | 初始 X 偏移 | number | 0 |
| initial-offset-y | 初始 Y 偏移 | number | 0 |

### 控制栏配置

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| show-controls | 显示内置悬浮工具栏 | boolean | false |
| controls-position | 工具栏位置 | 'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' | 'top-right' |

### 缩放配置

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| min-scale | 最小缩放 | number | 0.25 |
| max-scale | 最大缩放 | number | 4 |
| zoom-step | 缩放步进（滚轮/按钮） | number | 0.1 |
| wheel-zoom | 是否启用滚轮缩放（PC） | boolean | true |
| wheel-zoom-requires-ctrl | 需要按住 Ctrl/⌘ 才执行滚轮缩放 | boolean | false |
| wheel-pan | 允许使用滚轮进行平移 | boolean | true |
| double-tap-zoom | 双击目标缩放 | number | 2 |
| allow-double-tap | 是否启用双击缩放 | boolean | true |

### 旋转配置

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| enable-rotate | 移动端是否允许旋转 | boolean | true |
| rotate-snap-deg | 旋转吸附角度步进（度） | number | 0 |
| rotate-snap-epsilon | 吸附阈值（度） | number | 3 |

### 键盘交互

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| keyboard | 是否启用键盘交互 | boolean | true |
| key-pan-step | 方向键平移基础步长（px） | number | 40 |
| key-pan-fast-multiplier | 按住 Shift 时的平移倍速 | number | 3 |

### 高级功能

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| enable-grid | 是否启用网格吸附 | boolean | false |
| grid-size | 网格大小（像素） | number | 20 |
| show-indicators | 显示缩放/旋转指示器 | boolean | false |
| enable-history | 启用撤销/重做功能 | boolean | false |
| max-history | 历史记录最大数量 | number | 20 |
| show-performance | 显示性能监控（FPS） | boolean | false |
| show-minimap | 显示缩略图导航 | boolean | false |
| minimap-position | 缩略图位置 | 'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left' | 'bottom-right' |
| smooth-bounds | 启用平滑边界效果 | boolean | true |
| bounds-elasticity | 边界弹性系数 | number | 0.15 |
| preset-views | 预设视角配置 | Array<{name, scale, rotate, offsetX, offsetY}> | - |

### 其他配置

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| enable-momentum | 是否启用松手动量滚动 | boolean | true |
| disable-context-menu | 是否禁用右键菜单 | boolean | true |

> HTML 中使用短横线写法（如 `wheel-zoom`），JS/TS 中对应驼峰写法（如 `wheelZoom`）。

## 事件（Events）

| 事件 | 说明 | 参数 |
|---|---|---|
| ldesignTransformChange | 变换发生变化（缩放/旋转/位移） | `{ scale, rotate, offsetX, offsetY }` |
| ldesignGestureStart | 手势开始 | `()` |
| ldesignGestureEnd | 手势结束 | `()` |
| ldesignHistoryChange | 历史状态变化 | `{ canUndo, canRedo }` |

## 方法（Methods）

### 基础方法

```ts
// 获取元素（在框架中建议用 ref）
const el = document.querySelector('ldesign-draggable') as any;

// 重置和状态管理
el.reset();                       // 重置到初始状态
el.getState();                    // 获取当前状态 { scale, rotate, offsetX, offsetY }
el.getTransformString();          // 获取当前 transform 字符串
```

### 缩放控制

```ts
el.zoomTo(2, clientX, clientY);   // 缩放到指定倍数（可指定锚点）
el.zoomIn(step?);                 // 放大一步
el.zoomOut(step?);                // 缩小一步
el.fitContain();                  // 适配容器（完全显示）
el.fitCover();                    // 填充容器（充满）
```

### 旋转控制

```ts
el.setRotate(90);                 // 设置旋转角度（度）
el.rotateBy(90);                  // 相对旋转指定角度
```

### 平移控制

```ts
el.setOffsets(100, -40);          // 设置绝对偏移
el.panBy(50, 0);                  // 相对平移
el.panTo(0, 0);                   // 平移到指定位置
```

### 高级方法

```ts
// 历史记录
el.undo();                        // 撤销上一步操作
el.redo();                        // 重做下一步操作

// 预设视角
el.goToPresetView(0);             // 切换到预设视角（按索引）

// 功能开关
el.toggleGrid();                  // 切换网格显示
el.toggleIndicators();            // 切换指示器显示
el.toggleMinimap();               // 切换缩略图导航
```

## 使用建议

### 性能优化

1. **图片优化**：
   - 使用适当分辨率的图片，避免加载过大的原图
   - 考虑使用渐进式加载或缩略图预览

2. **功能选择**：
   - 根据实际需求启用功能，避免不必要的性能开销
   - 性能监控（`show-performance`）仅在开发调试时使用

3. **移动端优化**：
   - 合理设置 `bounds-elasticity` 以平衡体验和性能
   - 大图场景下可适当降低 `max-scale` 限制

### 最佳实践

1. **容器尺寸**：组件容器应设置明确的宽高
2. **手势冲突**：与其他可拖拽组件配合时，注意处理手势冲突
3. **无障碍**：组件已内置 ARIA 属性，可通过 `alt` 提供图片描述
4. **响应式**：组件会自动适应容器尺寸变化

### 浏览器兼容性

- 现代浏览器（Chrome, Firefox, Safari, Edge）
- iOS Safari 10+
- Android Chrome 80+
- 支持 PointerEvents API 的浏览器

### 常见问题

**Q: 移动端滚动冲突？**  
A: 组件已设置 `touch-action: none` 和 `overscroll-behavior: contain` 避免冲突。

**Q: 如何限制拖拽范围？**  
A: 组件会自动计算边界，通过 `smooth-bounds` 和 `bounds-elasticity` 控制边界行为。

**Q: 支持触摸板手势吗？**  
A: 完全支持，包括双指缩放、平移等触摸板手势。
