# Image 图片

用于展示图片，支持懒加载、占位/回退、响应式图片，以及点击预览（缩放/拖拽/ESC 关闭）。

## 基础用法（默认宽度 100%）

<div class="demo-block">
  <ldesign-image
    src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=900&q=80&auto=format&fit=crop"
    width="360"
    height="220"
    radius="8"
    fit="cover"
    alt="风景"
  />
</div>

```html
<ldesign-image
  src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=900&q=80&auto=format&fit=crop"
  width="360"
  height="220"
  radius="8"
  fit="cover"
  alt="风景"
/>
```

## 保持比例占位（未设置高度）

当未设置高度时，建议提供 ratio（如 16/9），以便在图片未加载前就用相同比例占位，避免布局抖动；若不提供，组件会在图片加载完成后根据 naturalWidth/naturalHeight 自动套用比例。

<div class="demo-block">
  <ldesign-image
    src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&q=80&w=1200"
    ratio="16/9"
    fit="cover"
    alt="示例：16/9"
  />
</div>

```html
<ldesign-image
  src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&q=80&w=1200"
  ratio="16/9"
  fit="cover"
  alt="示例：16/9"
/>
```

## 懒加载

- 组件默认启用懒加载（`lazy`）。
- 使用 `IntersectionObserver + 原生 loading="lazy"` 双保险策略。
- 可通过 `intersection-root-margin` 设置预加载阈值（默认 `200px`）。

<div class="demo-block">
  <ldesign-image
    src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=80&auto=format&fit=crop"
    width="100%"
    height="240"
    fit="cover"
    lazy
    intersection-root-margin="300px"
  />
</div>

```html
<ldesign-image
  src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1200&q=80&auto=format&fit=crop"
  width="100%"
  height="240"
  fit="cover"
  lazy
  intersection-root-margin="300px"
/>
```

## 占位图与回退图

- `placeholder`：自定义占位图（优先级高于骨架）。
- 未提供占位图时，默认渲染骨架+加载旋转器，可通过 `placeholder-color` 自定义底色。
- `fallback`：加载失败时使用的回退图。

<div class="demo-block">
<ldesign-image
    src="https://example.invalid/not-found.jpg"
    placeholder="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&q=20&w=80&h=60&fit=crop&blur=50"
    fallback="https://images.unsplash.com/photo-1517816428104-797678c7cf0d?auto=format&q=80&w=480&fit=crop"
    width="320"
    height="200"
    fit="contain"
  />
</div>

```html
<ldesign-image
  src="https://example.invalid/not-found.jpg"
  placeholder="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&q=20&w=80&h=60&fit=crop&blur=50"
  fallback="https://images.unsplash.com/photo-1517816428104-797678c7cf0d?auto=format&q=80&w=480&fit=crop"
  width="320"
  height="200"
  fit="contain"
/>
```

## 响应式图片（srcset / sizes）

通过 `srcset` 与 `sizes` 适配不同屏幕宽度，节省带宽与提升清晰度。

```html
<ldesign-image
  src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&q=80&w=1200"
  srcset="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&q=80&w=480 480w, https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&q=80&w=800 800w, https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&q=80&w=1200 1200w"
  sizes="(max-width: 600px) 480px, (max-width: 900px) 800px, 1200px"
  width="100%"
  height="260"
  fit="cover"
/>
```

## 裁剪与定位

- 通过 `fit` 控制裁剪策略：`fill/contain/cover/none/scale-down`。
- 通过 `position` 控制对齐方式（对应 `object-position`，如：`center center`、`top left`、`50% 50%`）。

```html
<ldesign-image src="/images/city.jpg" width="260" height="160" fit="contain" />
<ldesign-image src="/images/city.jpg" width="260" height="160" fit="cover" position="top center" />
```

## 填充模式（fit）

通过 fit 控制裁剪策略：fill/contain/cover/none/scale-down。

<div class="demo-block">
  <ldesign-image src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&q=80&w=1000" ratio="4/3" fit="contain" style="max-width:280px"></ldesign-image>
  <span style="display:inline-block;width:12px;"></span>
  <ldesign-image src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&q=80&w=1000" ratio="4/3" fit="cover" style="max-width:280px"></ldesign-image>
</div>

```html
<ldesign-image src="..." ratio="4/3" fit="contain"></ldesign-image>
<ldesign-image src="..." ratio="4/3" fit="cover"></ldesign-image>
```

## 形状（shape）

- square（默认）、rounded、circle

<div class="demo-block">
  <ldesign-image src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&q=80&w=800" ratio="1/1" shape="square" style="max-width:160px"></ldesign-image>
  <span style="display:inline-block;width:12px;"></span>
  <ldesign-image src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&q=80&w=800" ratio="1/1" shape="rounded" style="max-width:160px"></ldesign-image>
  <span style="display:inline-block;width:12px;"></span>
  <ldesign-image src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&q=80&w=800" ratio="1/1" shape="circle" style="max-width:160px"></ldesign-image>
</div>

```html
<ldesign-image src="..." ratio="1/1" shape="square"></ldesign-image>
<ldesign-image src="..." ratio="1/1" shape="rounded"></ldesign-image>
<ldesign-image src="..." ratio="1/1" shape="circle"></ldesign-image>
```

## 图集样式（ImageGroup）

使用 ldesign-image-group 快速构建图片宫格：

<div class="demo-block">
  <ldesign-image-group columns="4" gap="8" shape="rounded">
    <ldesign-image src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&q=80&w=600" ratio="1/1"></ldesign-image>
    <ldesign-image src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&q=80&w=600" ratio="1/1"></ldesign-image>
    <ldesign-image src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&q=80&w=600" ratio="1/1"></ldesign-image>
    <ldesign-image src="https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&q=80&w=600" ratio="1/1"></ldesign-image>
  </ldesign-image-group>
</div>

```html
<ldesign-image-group columns="4" gap="8" shape="rounded">
  <ldesign-image src="..." ratio="1/1"></ldesign-image>
  ...
</ldesign-image-group>
```

## 预览（点击放大）

- 设置 `preview` 开启预览；点击图片在屏幕中央放大展示。
- 预览支持：滚轮缩放、双击切换 1x/2x、拖拽移动、ESC 关闭。
- 通过 `preview-src` 指定高清图（不传则使用 `src`）。

<div class="demo-block">
  <ldesign-image
    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop"
    width="280"
    height="180"
    fit="cover"
    radius="6"
    preview
  />
</div>

```html
<ldesign-image
  src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80&auto=format&fit=crop"
  width="280"
  height="180"
  fit="cover"
  radius="6"
  preview
/>
```

## 无障碍与可用性

- 使用 `alt` 为图片提供文本描述。
- 预览层支持键盘 ESC 关闭，按钮具备 aria-label。

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| src | 图片地址 | string | - |
| alt | 替代文本 | string | - |
| img-title | 标题（用于 img 的 title 属性） | string | - |
| width | 宽度（number 自动补 px / string 原样） | number/string | - |
| height | 高度（number 自动补 px / string 原样） | number/string | - |
| radius | 圆角（number 自动补 px / string 原样） | number/string | - |
| fit | 裁剪策略，对应 object-fit | 'fill'/'contain'/'cover'/'none'/'scale-down' | 'cover' |
| position | 对齐，对应 object-position | string | 'center center' |
| ratio | 未设高度时用于占位和计算最终高度的宽高比（如 16/9 或 1.777） | string/number | - |
| lazy | 是否懒加载 | boolean | true |
| intersection-root-margin | 懒加载 IO rootMargin 阈值 | string | '200px' |
| decoding | HTMLImageElement.decoding | 'auto'/'async'/'sync' | 'auto' |
| crossorigin | 跨域 | 'anonymous'/'use-credentials' | - |
| referrer-policy | 引荐策略 | string | - |
| srcset | 响应式图片 | string | - |
| sizes | 响应式尺寸 | string | - |
| placeholder | 自定义占位图 URL | string | - |
| placeholder-color | 骨架底色（无自定义占位图时） | string | '#f5f5f5' |
| show-loading | 是否展示骨架 | boolean | true |
| fallback | 失败时回退图 URL | string | - |
| show-error | 是否展示错误占位层 | boolean | true |
| preview | 是否启用预览 | boolean | false |
| preview-src | 预览用高清图 | string | - |
| preview-backdrop | 预览遮罩主题 | 'dark'/'light' | 'dark' |
| zoomable | 预览是否可缩放 | boolean | true |

## 高级格式：AVIF / WebP

通过 sources 属性（JSON 字符串）为 <code>&lt;picture&gt;</code> 添加多源，浏览器将优先选择支持的格式。

<div class="demo-block">
  <ldesign-image
    sources='[{"type":"image/avif","srcset":"https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=60&w=800&fm=avif 800w"},{"type":"image/webp","srcset":"https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=70&w=800&fm=webp 800w"}]'
    src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&q=80&w=800"
    ratio="4/3"
    fit="cover"
  />
</div>

```html
<ldesign-image
  sources='[{"type":"image/avif","srcset":"... 800w"},{"type":"image/webp","srcset":"... 800w"}]'
  src="fallback.jpg"
  ratio="4/3"
  fit="cover"
/>
```

## GIF：默认显示第一帧，点击播放

为避免 CLS，建议提供 gifPreviewSrc（第一帧静态图）与 ratio。

<div class="demo-block">
  <ldesign-image
    src="https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif"
    gif-play-on-click
    gif-preview-src="https://media.giphy.com/media/Ju7l5y9osyymQ/giphy-downsized-large.gif"
    ratio="1/1"
    fit="cover"
    shape="rounded"
  />
</div>

```html
<ldesign-image
  src="https://.../some.gif"
  gif-play-on-click
  gif-preview-src="https://.../first-frame.jpg"
  ratio="1/1"
/>
```

## 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignLoad | 图片加载成功 | `{ width: number; height: number; src: string }` |
| ldesignError | 图片加载失败 | `{ src: string; error: string }` |
| ldesignPreviewOpen | 预览打开 | `void` |
| ldesignPreviewClose | 预览关闭 | `void` |
