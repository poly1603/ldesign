# ImageViewer 图片预览器

用于在独立的全屏遮罩中浏览图片，支持多图切换、缩放、拖拽、旋转、下载与键盘操作。适合配合缩略图、图片列表、图文详情等场景。

> 组件标签：`<ldesign-image-viewer>`（已在 Vue 配置中标为自定义元素，可直接在 VitePress 示例中使用）

## 基础用法

最简单的用法是给组件传入图片数组，并控制 `visible` 显隐。

<div class="demo-block">
  <ldesign-button id="iv-open-basic">打开预览</ldesign-button>
  <ldesign-image-viewer id="iv-basic"></ldesign-image-viewer>
</div>

```html
<ldesign-button id="iv-open-basic">打开预览</ldesign-button>
<ldesign-image-viewer id="iv-basic"></ldesign-image-viewer>
<script>
  const v = document.getElementById('iv-basic');
  v.images = [
    { src: 'https://picsum.photos/seed/100/1600/1100', thumbnail: 'https://picsum.photos/seed/100/200/140' },
    { src: 'https://picsum.photos/seed/101/1600/1100', thumbnail: 'https://picsum.photos/seed/101/200/140' },
    { src: 'https://picsum.photos/seed/102/1600/1100', thumbnail: 'https://picsum.photos/seed/102/200/140' }
  ];
  document.getElementById('iv-open-basic').onclick = () => { v.visible = true; };
</script>
```

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  // 基础用法
  const vBasic = document.getElementById('iv-basic')
  if (vBasic && !vBasic.__inited) {
    vBasic.__inited = true
    vBasic.images = [
      { src: 'https://picsum.photos/seed/100/1600/1100', thumbnail: 'https://picsum.photos/seed/100/200/140' },
      { src: 'https://picsum.photos/seed/101/1600/1100', thumbnail: 'https://picsum.photos/seed/101/200/140' },
      { src: 'https://picsum.photos/seed/102/1600/1100', thumbnail: 'https://picsum.photos/seed/102/200/140' }
    ]
  }
  const btnBasic = document.getElementById('iv-open-basic')
  const onBasic = () => (vBasic && (vBasic.visible = true))
  btnBasic && btnBasic.addEventListener('click', onBasic)

  // JSON 打开
  const vJson = document.getElementById('iv-json')
  const btnJson = document.getElementById('iv-open-json')
  const onJson = () => (vJson && (vJson.visible = true))
  btnJson && btnJson.addEventListener('click', onJson)

  // 与图片列表联动
  const vLinked = document.getElementById('iv-linked')
  if (vLinked) {
    vLinked.images = [
      'https://picsum.photos/seed/11/1400/1000',
      'https://picsum.photos/seed/12/1400/1000',
      'https://picsum.photos/seed/13/1400/1000',
      'https://picsum.photos/seed/14/1400/1000'
    ]
  }
  const gallery = document.getElementById('iv-gallery')
  const onGallery = (e) => {
    const t = e.target.closest('img')
    if (!t || !vLinked) return
    vLinked.startIndex = Number(t.getAttribute('data-idx') || 0)
    vLinked.visible = true
  }
  gallery && gallery.addEventListener('click', onGallery)

  // 交互示例
  const vOps = document.getElementById('iv-ops')
  if (vOps) {
    vOps.images = [
      'https://picsum.photos/seed/21/1600/1000',
      'https://picsum.photos/seed/22/1600/1000'
    ]
  }
  const btnOps = document.getElementById('iv-open-ops')
  const onOps = () => (vOps && (vOps.visible = true))
  btnOps && btnOps.addEventListener('click', onOps)

  // 主题与缩略图
  const vLight = document.getElementById('iv-light')
  const vNoThumbs = document.getElementById('iv-nothumbs')
  const vModal = document.getElementById('iv-modal')
  const vModalAny = document.getElementById('iv-modal-any')
  const themeImgs = [
    { src: 'https://picsum.photos/seed/31/1400/1000', title: '图 31', description: '小窗模式也支持标题与描述' },
    { src: 'https://picsum.photos/seed/32/1400/1000', title: '图 32' },
    { src: 'https://picsum.photos/seed/33/1400/1000', title: '图 33' }
  ]
  if (vLight) vLight.images = themeImgs
  if (vNoThumbs) vNoThumbs.images = themeImgs
  if (vModal) {
    vModal.images = themeImgs
    // 保险起见，直接通过属性赋值，避免静态属性未正确生效导致仍为 overlay
    vModal.viewerMode = 'modal'
    vModal.panelWidth = '900px'
    vModal.panelHeight = '640px'
  }
  if (vModalAny) {
    vModalAny.images = themeImgs
    vModalAny.viewerMode = 'modal'
    vModalAny.panelDraggable = 'anywhere'
    vModalAny.viewerTitle = '图片预览（可任意拖动）'
    vModalAny.panelWidth = '900px'
    vModalAny.panelHeight = '640px'
  }
  const b1 = document.getElementById('iv-open-light')
  const b2 = document.getElementById('iv-open-no-thumbs')
  const b3 = document.getElementById('iv-open-modal')
  const b4 = document.getElementById('iv-open-modal-any')
  const o1 = () => (vLight && (vLight.visible = true))
  const o2 = () => (vNoThumbs && (vNoThumbs.visible = true))
  const o3 = () => (vModal && (vModal.visible = true))
  const o4 = () => (vModalAny && (vModalAny.visible = true))
  b1 && b1.addEventListener('click', o1)
  b2 && b2.addEventListener('click', o2)
  b3 && b3.addEventListener('click', o3)
  b4 && b4.addEventListener('click', o4)

  // 动画测试
  const animImages = [
    { src: 'https://picsum.photos/seed/41/1600/1100', thumbnail: 'https://picsum.photos/seed/41/200/140', title: '测试动画效果', description: '点击左上角关闭按钮查看关闭动画' }
  ]
  const animViewers = ['fade', 'zoom', 'slide-up', 'mixed']
  animViewers.forEach(id => {
    const v = document.getElementById('iv-' + id)
    if (v) v.images = animImages
  })
  
  const btnFade = document.getElementById('iv-anim-fade')
  const btnZoom = document.getElementById('iv-anim-zoom')
  const btnSlideUp = document.getElementById('iv-anim-slide-up')
  const btnMixed = document.getElementById('iv-anim-mixed')
  
  const onFade = () => { const v = document.getElementById('iv-fade'); v && (v.visible = true) }
  const onZoom = () => { const v = document.getElementById('iv-zoom'); v && (v.visible = true) }
  const onSlideUp = () => { const v = document.getElementById('iv-slide-up'); v && (v.visible = true) }
  const onMixed = () => { const v = document.getElementById('iv-mixed'); v && (v.visible = true) }
  
  btnFade && btnFade.addEventListener('click', onFade)
  btnZoom && btnZoom.addEventListener('click', onZoom)
  btnSlideUp && btnSlideUp.addEventListener('click', onSlideUp)
  btnMixed && btnMixed.addEventListener('click', onMixed)
  
  // Caption测试
  const capImages = [
    { src: 'https://picsum.photos/seed/51/1600/1100', thumbnail: 'https://picsum.photos/seed/51/200/140', title: '标题示例', description: '这是一段描述文字，用于测试不同位置的Caption显示效果' },
    { src: 'https://picsum.photos/seed/52/1600/1100', thumbnail: 'https://picsum.photos/seed/52/200/140', title: '第二张图', description: '可以切换图片查看效果' }
  ]
  const capViewers = ['bottom', 'top', 'inside']
  capViewers.forEach(id => {
    const v = document.getElementById('iv-' + id)
    if (v) v.images = capImages
  })
  
  const btnCapBottom = document.getElementById('iv-cap-bottom')
  const btnCapTop = document.getElementById('iv-cap-top')
  const btnCapInside = document.getElementById('iv-cap-inside')
  
  const onCapBottom = () => { const v = document.getElementById('iv-bottom'); v && (v.visible = true) }
  const onCapTop = () => { const v = document.getElementById('iv-top'); v && (v.visible = true) }
  const onCapInside = () => { const v = document.getElementById('iv-inside'); v && (v.visible = true) }
  
  btnCapBottom && btnCapBottom.addEventListener('click', onCapBottom)
  btnCapTop && btnCapTop.addEventListener('click', onCapTop)
  btnCapInside && btnCapInside.addEventListener('click', onCapInside)

  onBeforeUnmount(() => {
    btnBasic && btnBasic.removeEventListener('click', onBasic)
    btnJson && btnJson.removeEventListener('click', onJson)
    gallery && gallery.removeEventListener('click', onGallery)
    btnOps && btnOps.removeEventListener('click', onOps)
    b1 && b1.removeEventListener('click', o1)
    b2 && b2.removeEventListener('click', o2)
    b3 && b3.removeEventListener('click', o3)
    b4 && b4.removeEventListener('click', o4)
    btnFade && btnFade.removeEventListener('click', onFade)
    btnZoom && btnZoom.removeEventListener('click', onZoom)
    btnSlideUp && btnSlideUp.removeEventListener('click', onSlideUp)
    btnMixed && btnMixed.removeEventListener('click', onMixed)
    btnCapBottom && btnCapBottom.removeEventListener('click', onCapBottom)
    btnCapTop && btnCapTop.removeEventListener('click', onCapTop)
    btnCapInside && btnCapInside.removeEventListener('click', onCapInside)
  })
})
</script>

## 通过属性传入 JSON

也可以直接在标签上用 `images` 属性传入 JSON 字符串，配合 `start-index` 指定打开的图片序号。

<div class="demo-block">
  <ldesign-button id="iv-open-json">打开（JSON）</ldesign-button>
  <ldesign-image-viewer
    id="iv-json"
    :images="'[' +
      JSON.stringify({src:'https://picsum.photos/seed/1/1600/1100',thumbnail:'https://picsum.photos/seed/1/200/140'}) + ',' +
      JSON.stringify({src:'https://picsum.photos/seed/2/1600/1100',thumbnail:'https://picsum.photos/seed/2/200/140'}) + ',' +
      JSON.stringify({src:'https://picsum.photos/seed/3/1600/1100',thumbnail:'https://picsum.photos/seed/3/200/140'}) + ']'"
    start-index="1"
  />
</div>

```html
<ldesign-image-viewer
  images='[
    {"src":"/a.jpg","thumbnail":"/a-thumb.jpg"},
    {"src":"/b.jpg","thumbnail":"/b-thumb.jpg"}
  ]'
  start-index="1"
/>
```


## 与图片列表联动

在图集中点击某张图片，打开预览器并定位到对应索引。

<div class="demo-block">
  <div id="iv-gallery" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:720px">
    <img data-idx="0" src="https://picsum.photos/seed/11/260/160" style="width:100%;border-radius:6px;cursor:pointer">
    <img data-idx="1" src="https://picsum.photos/seed/12/260/160" style="width:100%;border-radius:6px;cursor:pointer">
    <img data-idx="2" src="https://picsum.photos/seed/13/260/160" style="width:100%;border-radius:6px;cursor:pointer">
    <img data-idx="3" src="https://picsum.photos/seed/14/260/160" style="width:100%;border-radius:6px;cursor:pointer">
  </div>
  <ldesign-image-viewer id="iv-linked"></ldesign-image-viewer>
</div>

```html
<!-- 小图点击打开大图预览 -->
<div id="gallery">
  <img data-idx="0" src="/thumbs/1.jpg">
  <img data-idx="1" src="/thumbs/2.jpg">
  ...
</div>
<ldesign-image-viewer id="viewer"></ldesign-image-viewer>
<script>
  const viewer = document.getElementById('viewer');
  viewer.images = [ '/large/1.jpg', '/large/2.jpg', '/large/3.jpg' ];
  document.getElementById('gallery').addEventListener('click', e => {
    const t = e.target.closest('img');
    if (!t) return;
    viewer.startIndex = Number(t.dataset.idx || 0);
    viewer.visible = true;
  });
</script>
```


## 工具栏与交互

- 滚轮缩放（`wheel-zoom`）、双击 1x/2x 切换
- 拖拽平移（按住图片拖动）
- 旋转（左旋/右旋）、重置、下载当前图
- 键盘：Esc 关闭、←/→ 切换、+/- 缩放、0 重置

<div class="demo-block">
  <ldesign-button id="iv-open-ops">打开（交互）</ldesign-button>
  <ldesign-image-viewer id="iv-ops" :wheel-zoom="true" :zoom-step="0.2" :min-scale="0.25" :max-scale="4"></ldesign-image-viewer>
</div>


## 主题与缩略图

可以切换暗/亮背景；也可以隐藏顶部缩略图条。

<div class="demo-block">
  <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
    <ldesign-button id="iv-open-light" type="outline">亮色背景</ldesign-button>
    <ldesign-button id="iv-open-no-thumbs" type="outline">无缩略图</ldesign-button>
    <ldesign-button id="iv-open-modal" type="primary">小窗（Modal）</ldesign-button>
    <ldesign-button id="iv-open-modal-any" type="primary">小窗（任意拖动）</ldesign-button>
  </div>
  <ldesign-image-viewer id="iv-light" backdrop="light"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-nothumbs" :show-thumbnails="false"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-modal" viewer-mode="modal" panel-width="900px" panel-height="640px" transition="fade-zoom"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-modal-any" viewer-mode="modal" panel-width="900px" panel-height="640px" panel-draggable="anywhere" viewer-title="图片预览（可任意拖动）" transition="fade-zoom"></ldesign-image-viewer>
</div>


## 动画效果

支持6种打开/关闭动画效果，可独立配置。

<div class="demo-block">
  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    <ldesign-button id="iv-anim-fade">Fade</ldesign-button>
    <ldesign-button id="iv-anim-zoom">Zoom</ldesign-button>
    <ldesign-button id="iv-anim-slide-up">Slide Up</ldesign-button>
    <ldesign-button id="iv-anim-mixed">Mixed</ldesign-button>
  </div>
  <ldesign-image-viewer id="iv-fade" open-animation="fade" close-animation="fade"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-zoom" open-animation="zoom"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-slide-up" open-animation="slide-up"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-mixed" open-animation="slide-up" close-animation="fade" open-duration="400" close-duration="200"></ldesign-image-viewer>
</div>

```html
<ldesign-image-viewer open-animation="slide-up" close-animation="fade" open-duration="400"></ldesign-image-viewer>
```

## Caption位置

支持4种标题与描述显示位置。

<div class="demo-block">
  <div style="display:flex;gap:12px;flex-wrap:wrap;">
    <ldesign-button id="iv-cap-bottom">Bottom</ldesign-button>
    <ldesign-button id="iv-cap-top">Top</ldesign-button>
    <ldesign-button id="iv-cap-inside">Inside Bottom</ldesign-button>
  </div>
  <ldesign-image-viewer id="iv-bottom" caption-position="bottom"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-top" caption-position="top"></ldesign-image-viewer>
  <ldesign-image-viewer id="iv-inside" caption-position="inside-bottom"></ldesign-image-viewer>
</div>

```html
<ldesign-image-viewer caption-position="inside-bottom"></ldesign-image-viewer>
```

## 事件

- `ldesignVisibleChange`: 显隐变化
- `ldesignOpen`: 打开时触发
- `ldesignClose`: 关闭时触发
- `ldesignChange`: 切换图片后触发，参数 `{ index }`

```html
<ldesign-image-viewer id="viewer"></ldesign-image-viewer>
<script>
  const v = document.getElementById('viewer')
  v.addEventListener('ldesignChange', (e) => console.log('index=', e.detail.index))
</script>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| visible | 是否显示 | boolean | false |
| images | 图片数组或 JSON 字符串（见下） | (string | { src; alt?; thumbnail?; name? })[] \\ string | - |
| start-index | 初始索引 | number | 0 |
| loop | 是否循环切换 | boolean | true |
| mask-closable | 点击遮罩是否关闭 | boolean | true |
| keyboard | 是否启用键盘快捷键 | boolean | true |
| show-thumbnails | 是否显示顶部缩略图条 | boolean | true |
| backdrop | 背景主题 | 'dark' | 'light' | 'dark' |
| z-index | 遮罩层级 | number | 1000 |
| wheel-zoom | 是否开启动作滚轮缩放 | boolean | true |
| zoom-step | 缩放步进 | number | 0.1 |
| min-scale / max-scale | 最小/最大缩放 | number | 0.25 / 4 |

ImageItem 结构：`{ src: string; alt?: string; thumbnail?: string; name?: string }`

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignVisibleChange | 显隐变化 | `boolean` |
| ldesignOpen | 打开 | `void` |
| ldesignClose | 关闭 | `void` |
| ldesignChange | 当前索引变化 | `{ index: number }` |

## 常见问题

- 下载失败？多数浏览器允许 a[download] 跨域下载，但仍受图片服务器 CORS/Content-Disposition 策略影响。
- 大图显示模糊？请使用更高分辨率的图片，或根据显示尺寸控制压缩质量。
- 页面滚动被锁住？组件打开时会锁定 body 滚动，关闭自动恢复；多层弹窗也能正确计数恢复。
