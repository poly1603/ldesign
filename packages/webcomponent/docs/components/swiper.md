---
outline: deep
---

# Swiper 轮播图

功能强大的轮播图组件，支持自动播放、循环、导航按钮、分页圆点、拖拽切换、键盘控制、垂直方向以及多列显示等能力。

- 受控/非受控两种用法（value / default-value）
- 自动播放、悬浮暂停、交互后是否停止
- 循环播放
- 导航按钮与分页圆点
- 触摸与鼠标拖拽
- 键盘控制（左右或上下方向键）
- 水平/垂直方向
- 每屏多项显示（slides-per-view）与间距（space-between）

## 基础用法

<div class="demo-container" style="height: 220px">
  <ldesign-swiper style="width:100%;height:100%" default-value="0">
    <ldesign-swiper-slide>Slide 1</ldesign-swiper-slide>
    <ldesign-swiper-slide>Slide 2</ldesign-swiper-slide>
    <ldesign-swiper-slide>Slide 3</ldesign-swiper-slide>
  </ldesign-swiper>
</div>

```html
<!-- 固定高度用于展示 -->
<div style="height:220px">
  <ldesign-swiper style="width:100%;height:100%" default-value="0">
    <ldesign-swiper-slide>Slide 1</ldesign-swiper-slide>
    <ldesign-swiper-slide>Slide 2</ldesign-swiper-slide>
    <ldesign-swiper-slide>Slide 3</ldesign-swiper-slide>
  </ldesign-swiper>
</div>
```

## 自动播放 + 悬浮暂停

<div class="demo-container" style="height: 180px">
  <ldesign-swiper style="width:100%;height:100%" autoplay autoplay-delay="1500" pause-on-hover>
    <ldesign-swiper-slide>Auto 1</ldesign-swiper-slide>
    <ldesign-swiper-slide>Auto 2</ldesign-swiper-slide>
    <ldesign-swiper-slide>Auto 3</ldesign-swiper-slide>
  </ldesign-swiper>
</div>

```html
<div style="height:180px">
  <ldesign-swiper style="width:100%;height:100%" autoplay autoplay-delay="1500" pause-on-hover>
    <ldesign-swiper-slide>Auto 1</ldesign-swiper-slide>
    <ldesign-swiper-slide>Auto 2</ldesign-swiper-slide>
    <ldesign-swiper-slide>Auto 3</ldesign-swiper-slide>
  </ldesign-swiper>
</div>
```

> 说明：设置 disable-on-interaction 时，用户交互后将停止自动播放。

## 循环、导航、分页

<div class="demo-container" style="height: 180px">
  <ldesign-swiper style="width:100%;height:100%" loop navigation pagination>
    <ldesign-swiper-slide>A</ldesign-swiper-slide>
    <ldesign-swiper-slide>B</ldesign-swiper-slide>
    <ldesign-swiper-slide>C</ldesign-swiper-slide>
    <ldesign-swiper-slide>D</ldesign-swiper-slide>
  </ldesign-swiper>
</div>

```html
<div style="height:180px">
  <ldesign-swiper style="width:100%;height:100%" loop navigation pagination>
    <ldesign-swiper-slide>A</ldesign-swiper-slide>
    <ldesign-swiper-slide>B</ldesign-swiper-slide>
    <ldesign-swiper-slide>C</ldesign-swiper-slide>
    <ldesign-swiper-slide>D</ldesign-swiper-slide>
  </ldesign-swiper>
</div>
```

## 垂直方向

<div class="demo-container" style="height: 240px">
  <ldesign-swiper style="width:100%;height:100%" direction="vertical" pagination>
    <ldesign-swiper-slide>Top</ldesign-swiper-slide>
    <ldesign-swiper-slide>Middle</ldesign-swiper-slide>
    <ldesign-swiper-slide>Bottom</ldesign-swiper-slide>
  </ldesign-swiper>
</div>

```html
<div style="height:240px">
  <ldesign-swiper style="width:100%;height:100%" direction="vertical" pagination>
    <ldesign-swiper-slide>Top</ldesign-swiper-slide>
    <ldesign-swiper-slide>Middle</ldesign-swiper-slide>
    <ldesign-swiper-slide>Bottom</ldesign-swiper-slide>
  </ldesign-swiper>
</div>
```

## 多列显示与间距（slides-per-view + space-between）

<div class="demo-container" style="height: 180px">
  <ldesign-swiper style="width:100%;height:100%" slides-per-view="3" space-between="12" pagination>
    <ldesign-swiper-slide>1</ldesign-swiper-slide>
    <ldesign-swiper-slide>2</ldesign-swiper-slide>
    <ldesign-swiper-slide>3</ldesign-swiper-slide>
    <ldesign-swiper-slide>4</ldesign-swiper-slide>
    <ldesign-swiper-slide>5</ldesign-swiper-slide>
  </ldesign-swiper>
</div>

```html
<div style="height:180px">
  <ldesign-swiper style="width:100%;height:100%" slides-per-view="3" space-between="12" pagination>
    <ldesign-swiper-slide>1</ldesign-swiper-slide>
    <ldesign-swiper-slide>2</ldesign-swiper-slide>
    <ldesign-swiper-slide>3</ldesign-swiper-slide>
    <ldesign-swiper-slide>4</ldesign-swiper-slide>
    <ldesign-swiper-slide>5</ldesign-swiper-slide>
  </ldesign-swiper>
</div>
```

## 受控用法（value + 事件）

<div class="demo-container" id="swiper-ctrl-box" style="height: 200px">
  <div class="demo-row" style="margin-bottom: 8px; align-items:center">
    <ldesign-button id="swiper-prev">上一页</ldesign-button>
    <ldesign-button id="swiper-next" type="secondary">下一页</ldesign-button>
    <div>当前：<strong id="swiper-cur">0</strong></div>
  </div>
  <ldesign-swiper id="swiper-ctrl" style="width:100%;height:140px" value="0" pagination navigation>
    <ldesign-swiper-slide>X</ldesign-swiper-slide>
    <ldesign-swiper-slide>Y</ldesign-swiper-slide>
    <ldesign-swiper-slide>Z</ldesign-swiper-slide>
  </ldesign-swiper>
</div>

```html
<div>
  <button id="prev">上一页</button>
  <button id="next">下一页</button>
  <span>当前：<strong id="cur">0</strong></span>
</div>
<div style="height:160px">
  <ldesign-swiper id="sw" value="0" pagination navigation>
    <ldesign-swiper-slide>X</ldesign-swiper-slide>
    <ldesign-swiper-slide>Y</ldesign-swiper-slide>
    <ldesign-swiper-slide>Z</ldesign-swiper-slide>
  </ldesign-swiper>
</div>
```

```js
const sw = document.getElementById('sw');
document.getElementById('prev').addEventListener('click', () => sw?.prev?.());
document.getElementById('next').addEventListener('click', () => sw?.next?.());
sw?.addEventListener?.('ldesignChange', (e) => {
  const n = e.detail;
  if (sw) sw.value = n; // 回写受控值
  const cur = document.getElementById('cur');
  if (cur) cur.textContent = String(n);
});
```

## API 一览

```text
[Props]
- value?: number 当前索引（受控）
- default-value?: number 默认索引（非受控）
- loop?: boolean = false 是否循环
- autoplay?: boolean = false 是否自动播放
- autoplay-delay?: number = 3000 自动播放间隔（毫秒）
- pause-on-hover?: boolean = true 悬浮暂停
- disable-on-interaction?: boolean = true 用户交互后停止自动播放
- speed?: number = 300 过渡时长（毫秒）
- direction?: 'horizontal' | 'vertical' = 'horizontal' 方向
- slides-per-view?: number = 1 每屏显示数量
- space-between?: number = 0 每项之间的像素间距
- navigation?: boolean = true 是否显示前进/后退按钮
- pagination?: boolean = true 是否显示分页圆点
- keyboard?: boolean = false 是否启用键盘控制
- allow-touch-move?: boolean = true 是否允许触摸/鼠标拖拽
- draggable?: boolean = true 是否允许鼠标拖拽（PC）
- threshold?: number = 50 触发切换的拖拽阈值
- grab-cursor?: boolean = true 拖拽时光标样式

[Events]
- ldesignChange(detail: number) 当前索引变化事件

[Methods]
- next(): Promise<void> 切到下一页
- prev(): Promise<void> 切到上一页
- slideTo(index: number, opts?: { immediate?: boolean }): Promise<void> 跳到指定页
- update(): Promise<void> 手动强制更新尺寸与布局（容器尺寸变化、slot 变化后可调用）

Tips: 组件高度由外层容器决定，通常给 Swiper 或其容器设置一个固定高度即可看到效果。
```
