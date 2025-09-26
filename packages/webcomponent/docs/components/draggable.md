# Draggable 拖拽缩放容器

通用的可拖拽/缩放/旋转容器，适用于展示大图或任意自定义内容。支持 PC 与移动端：
- PC：滚轮缩放、鼠标拖拽平移、双击在 1x/2x 之间切换
- 移动端：双指缩放 + 旋转、单指拖拽、松手回弹、橡皮筋阻尼、动量滚动

> 组件标签：`<ldesign-draggable>`（本站已将 ldesign-* 标记为自定义元素，可直接使用）

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

不传 `src` 时，将对插槽内的整体内容进行缩放/拖拽/旋转。

<div class="demo-block" style="height: 320px; border: 1px dashed var(--vp-c-divider);">
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

插槽里也可以放任意图文排版，组件会把它们作为一个整体进行缩放/拖拽。

<div class="demo-block" style="height: 360px; border: 1px dashed var(--vp-c-divider);">
  <ldesign-draggable style="width:100%;height:100%">
    <div style="display:flex;gap:12px;align-items:flex-start;background:var(--vp-c-bg-soft);padding:12px;border-radius:8px;box-shadow:0 1px 8px rgba(0,0,0,.06);">
      <img src="https://picsum.photos/id/1018/960/640" alt="waterfall" style="width:360px;height:220px;object-fit:cover;border-radius:6px;flex:0 0 auto;" />
      <div style="max-width:520px">
        <h3 style="margin:0 0 8px;">山谷瀑布</h3>
        <p style="margin:0 0 6px;opacity:.85;">郁郁葱葱的针叶林间，一条瀑布从峭壁倾泻而下，水雾氤氲。此区域适合用作「图+文」的说明页或讲解页。</p>
        <ul style="margin:6px 0 0 18px;opacity:.85;">
          <li>支持整体缩放、拖拽、旋转</li>
          <li>图片已默认禁用原生拖拽，拖动更顺滑</li>
          <li>文本、链接等依旧可以正常显示</li>
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

> 备注：为避免浏览器原生图片拖拽干扰手势，组件会自动对插槽内的 `<img>` 关闭原生拖拽（-webkit-user-drag: none）与选择；如需让图片本身可点/可交互，可在你的样式中覆盖 pointer-events。

## 交互说明
- PC：
  - 滚轮缩放（以光标为中心）
  - 鼠标按住拖拽平移
  - 双击在 1x 与 2x（可配）之间切换
- 移动端：
  - 双指捏合缩放（以两指中点为枢轴）
  - 双指旋转（可通过 enable-rotate 关闭）
  - 单指拖拽平移
  - 松手后自动回弹到可视边界内；放大后甩动有动量滚动

## 可控示例（按钮控制缩放/重置）

<div class="demo-block" style="border: 1px dashed var(--vp-c-divider); padding: 10px;">
  <div style="height: 320px; position: relative;">
    <ldesign-draggable id="demo-drag-1" src="https://picsum.photos/id/1003/1600/1000" style="width:100%;height:100%"></ldesign-draggable>
  </div>
  <div style="margin-top: 10px; display:flex; gap:8px;">
<button class="vp-button" onclick="document.getElementById('demo-drag-1').zoomTo(2, undefined, undefined, true)">放大到 2x（带动画）</button>
    <button class="vp-button" onclick="document.getElementById('demo-drag-1').reset()">重置</button>
  </div>
</div>

> 提示：在实际工程中，建议通过框架的 ref 获取元素再调用方法。

框架内编程控制示例：

```ts
const el = document.querySelector('ldesign-draggable') as any;
el.zoomTo(2);             // 缩放到 2x
el.setRotate(90);         // 旋转 90°
el.setOffsets(60, -20);   // 平移
el.reset();               // 重置
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

> HTML 中使用短横线写法（如 `wheel-zoom`），TS 中对应驼峰写法（如 `wheelZoom`）。

## 事件（Events）

| 事件 | 说明 | 参数 |
|---|---|---|
| ldesignTransformChange | 变换发生变化（缩放/旋转/位移） | `{ scale, rotate, offsetX, offsetY }` |
| ldesignGestureStart | 手势开始 | `()` |
| ldesignGestureEnd | 手势结束 | `()` |

## 方法（Methods）

```ts
const el = document.querySelector('ldesign-draggable') as any;
el.reset();                        // 重置
el.zoomTo(2, clientX, clientY);    // 缩放到 2x（可指定锚点）
el.setRotate(90);                  // 设置旋转角度（度）
el.setOffsets(100, -40);           // 设置偏移
el.getTransformString();           // 当前 transform 字符串
el.getState();                     // { scale, rotate, offsetX, offsetY }
```

## 注意事项
- 外层容器需设置明确的宽高（例如 100% x 100% 或固定像素）。
- 与弹窗拖拽等外层手势叠加时，注意冲突；必要时关闭外层拖拽或限定在标题栏拖拽。
- 移动端内部已设置 `touch-action: none; overscroll-behavior: contain;` 以避免浏览器默认手势干扰。
