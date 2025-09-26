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
    <button class="vp-button" onclick="document.getElementById('demo-drag-1').zoomTo(2)">放大到 2x</button>
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
