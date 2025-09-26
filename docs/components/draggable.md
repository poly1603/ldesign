# Draggable 拖拽缩放容器

用于承载大图或任意内容的手势交互容器，支持 PC 与移动端：
- PC：滚轮缩放、鼠标拖拽平移、双击 1x/2x 切换
- 移动：双指缩放 + 旋转、单指拖拽、橡皮筋阻尼、松手回弹、动量滚动

组件标签：`<ldesign-draggable>`

## 基础用法（图片）

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

## 可控示例（按钮控制缩放/重置）

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

## 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| src | 图片地址（可选；不传时使用插槽） | string | - |
| alt | 图片替代文本 | string | - |
| wheel-zoom | 是否启用滚轮缩放（PC） | boolean | true |
| zoom-step | 滚轮缩放步进 | number | 0.1 |
| min-scale | 最小缩放 | number | 0.25 |
| max-scale | 最大缩放 | number | 4 |
| enable-rotate | 移动端是否允许旋转 | boolean | true |
| double-tap-zoom | 双击/双指双击目标缩放 | number | 2 |
| initial-scale | 初始缩放 | number | 1 |
| initial-rotate | 初始角度（度） | number | 0 |
| initial-offset-x | 初始 X 偏移 | number | 0 |
| initial-offset-y | 初始 Y 偏移 | number | 0 |

> HTML 中使用短横线写法（如 `wheel-zoom`），JS/TS 中对应驼峰写法（如 `wheelZoom`）。

## 事件（Events）

| 事件 | 说明 | 参数 |
|---|---|---|
| ldesignTransformChange | 变换发生变化（缩放/旋转/位移） | `{ scale, rotate, offsetX, offsetY }` |
| ldesignGestureStart | 手势开始 | `()` |
| ldesignGestureEnd | 手势结束 | `()` |

## 方法（Methods）

```ts
// 获取元素（在框架中建议用 ref）
const el = document.querySelector('ldesign-draggable') as any;

el.reset();                    // 重置到 1x、角度 0、偏移 0
el.zoomTo(2, clientX, clientY); // 缩放到 2x（可指定锚点坐标）
el.setRotate(90);              // 设置旋转角度（度）
el.setOffsets(100, -40);       // 设置偏移
el.getTransformString();       // 获取当前 transform 字符串
el.getState();                 // { scale, rotate, offsetX, offsetY }
```

## 注意事项
- 组件容器（外层）应设置明确的宽高（例如以父容器百分比或固定像素）。
- 与其它可拖拽容器叠加使用时，注意手势冲突（例如弹窗拖拽），必要时关闭外层拖拽或仅允许标题栏拖拽。
- 在 iOS Safari 等移动端浏览器中，组件内部已设置 `touch-action: none; overscroll-behavior: contain;` 以避免系统手势干扰。
