---
outline: deep
---

# Ripple 水波纹

点击产生水波纹的视觉反馈组件。将 `<ldesign-ripple />` 放入任意可点击元素内部（建议放最后），即可为该元素增加水波纹效果。

- 轻量、零依赖
- 默认跟随 `currentColor`，也可自定义颜色与不透明度
- 支持居中/非居中、裁剪/不裁剪、固定/自适应半径
- 适配鼠标与触摸设备

## 基础用法

将 `<ldesign-ripple />` 放入任何元素内部即可：

```html
<button class="demo-btn">
  默认按钮
  <ldesign-ripple></ldesign-ripple>
</button>

<ldesign-button type="primary">
  组件内部
  <ldesign-ripple></ldesign-ripple>
</ldesign-button>
```

<div class="demo-container">
  <button class="demo-btn">默认按钮<ldesign-ripple></ldesign-ripple></button>
  <button class="demo-btn demo-primary">主按钮<ldesign-ripple></ldesign-ripple></button>
</div>

## 自定义颜色与透明度

```html
<button class="demo-btn">
  自定义颜色
  <ldesign-ripple color="#1677ff" opacity="0.2"></ldesign-ripple>
</button>
```

<div class="demo-container">
  <button class="demo-btn">自定义颜色<ldesign-ripple color="#1677ff" opacity="0.2"></ldesign-ripple></button>
  <button class="demo-btn demo-danger">危险<ldesign-ripple color="#ff4d4f" opacity="0.25"></ldesign-ripple></button>
</div>

## 居中、固定半径

```html
<button class="demo-btn">
  居中 & 固定半径
  <ldesign-ripple centered radius="40"></ldesign-ripple>
</button>
```

<div class="demo-container">
  <button class="demo-btn">居中固定半径<ldesign-ripple centered radius="40"></ldesign-ripple></button>
</div>

## 不裁剪（unbounded）

当容器想要展示溢出的波纹时，可设置 `unbounded`：

```html
<div class="demo-box unbounded">
  <span>Unbounded</span>
  <ldesign-ripple unbounded></ldesign-ripple>
</div>
```

<div class="demo-container">
  <div class="demo-box unbounded">
    <span>Unbounded</span>
    <ldesign-ripple unbounded></ldesign-ripple>
  </div>
</div>

## 列表项/卡片/图片

```html
<li class="demo-list-item">
  列表项 <ldesign-ripple></ldesign-ripple>
</li>
<div class="demo-card">
  <h4>卡片标题</h4>
  <p>内容区域</p>
  <ldesign-ripple></ldesign-ripple>
</div>
<div class="demo-img">
  <img src="https://picsum.photos/320/160" alt="" />
  <ldesign-ripple></ldesign-ripple>
</div>
```

<div class="demo-grid">
  <ul class="demo-list">
    <li class="demo-list-item">列表项 A<ldesign-ripple></ldesign-ripple></li>
    <li class="demo-list-item">列表项 B<ldesign-ripple></ldesign-ripple></li>
  </ul>
  <div class="demo-card">
    <h4>卡片标题</h4>
    <p>内容区域</p>
    <ldesign-ripple></ldesign-ripple>
  </div>
  <div class="demo-img">
    <img src="https://picsum.photos/320/160" alt="" />
    <ldesign-ripple></ldesign-ripple>
  </div>
</div>

## 触发方式

默认 `trigger="pointerdown"`，你也可以使用 `mousedown` 或 `click`：

```html
<button class="demo-btn">
  点击触发
  <ldesign-ripple trigger="click"></ldesign-ripple>
</button>
```

<!-- 额外花哨效果已移除：为了保证视觉真实与统一，仅保留实心扩散 -->


## API

### 属性（Props）

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| color | 波纹颜色（默认跟随 currentColor） | `string` | - |
| opacity | 不透明度 | `number` | `0.24` |
| duration | 膨胀动画时长(ms) | `number` | `600` |
| fadeOutDuration | 淡出时长(ms) | `number` | `300` |
| radius | 半径，`auto` 自适应或固定像素 | `'auto' \| number` | `auto` |
| centered | 是否居中触发 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| trigger | 触发方式 | `'pointerdown' \| 'mousedown' \| 'click'` | `pointerdown` |
| touchEnabled | 触摸是否生效 | `boolean` | `true` |
| easing | 缓动函数 | `string` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| maxRipples | 同时存在的最大波纹数 | `number` | `8` |
| unbounded | 是否不裁剪边界 | `boolean` | `false` |

## 使用建议

- 建议把 `<ldesign-ripple>` 放在可点击元素的最后一个子节点，这样可以保证层级在最上层。
- 组件会自动为父元素添加 `position: relative; overflow: hidden;` 的标记类（unbounded 时为 visible）。如果你的容器已经有定位和裁剪控制，也可忽略。
- 长列表中，可适当降低 `fadeOutDuration` 和 `opacity` 获得更轻量的观感。

<style>
.demo-container{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0}
.demo-btn{position:relative;padding:10px 16px;border:1px solid var(--vp-c-divider);background:var(--vp-c-bg-soft);border-radius:8px;cursor:pointer}
.demo-primary{background:#1677ff;color:#fff;border-color:#1677ff}
.demo-danger{background:#ff4d4f;color:#fff;border-color:#ff4d4f}
.demo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:8px}
.demo-card{position:relative;padding:12px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg-soft)}
.demo-img{position:relative;border-radius:8px;overflow:hidden}
.demo-img img{display:block;width:100%;height:auto}
.demo-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.demo-list-item{position:relative;padding:10px 12px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg-soft);cursor:pointer}
.demo-box{position:relative;width:180px;height:72px;border:1px dashed var(--vp-c-divider);border-radius:12px;display:flex;align-items:center;justify-content:center}
.demo-box.unbounded{overflow:visible}
</style>
