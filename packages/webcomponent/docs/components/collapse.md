---
outline: deep
---

# Collapse 折叠面板

用于将内容区域折叠/展开的容器组件，支持手风琴模式、受控/非受控、懒渲染与销毁、键盘可访问和高度动画。

## 核心特性

- 🎨 **丰富的视觉样式** - 多种尺寸、主题色彩、圆角和阴影效果
- 🚀 **高性能动画** - 流畅的高度过渡动画（0px ↔ scrollHeight ↔ auto）
- 🎯 **灵活的状态控制** - 受控/非受控模式、展开/收起全部操作
- 🎵 **手风琴模式** - 同层级仅允许展开一个面板
- 🎭 **自定义图标** - 支持自定义展开/收起图标，动画控制
- 📦 **性能优化** - 懒渲染与收起销毁，加载状态和空状态处理
- 🔧 **高级功能** - 嵌套支持、自定义动画时长和缓动函数
- ♿ **无障碍支持** - 完整的ARIA属性、键盘导航（方向键、Home/End）
- 🎪 **事件系统** - 展开前/收起前钩子，可取消操作

> 组件标签：`<ldesign-collapse>` 与 `<ldesign-collapse-panel>`。

## 基础用法

最简单的折叠面板，点击标题展开/收起内容。

<div class="demo-container">
  <ldesign-collapse>
    <ldesign-collapse-panel name="a" header="标题 A">A 内容</ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="标题 B">B 内容</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse>
  <ldesign-collapse-panel name="a" header="标题 A">A 内容</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="标题 B">B 内容</ldesign-collapse-panel>
</ldesign-collapse>
```

## 默认展开

<div class="demo-container">
  <ldesign-collapse default-value='["a"]'>
    <ldesign-collapse-panel name="a" header="A">内容 A</ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="B">内容 B</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse default-value='["a"]'>
  <ldesign-collapse-panel name="a" header="A">内容 A</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="B">内容 B</ldesign-collapse-panel>
</ldesign-collapse>
```

## 手风琴模式

<div class="demo-container">
  <ldesign-collapse accordion>
    <ldesign-collapse-panel name="1" header="面板 1">内容 1</ldesign-collapse-panel>
    <ldesign-collapse-panel name="2" header="面板 2">内容 2</ldesign-collapse-panel>
    <ldesign-collapse-panel name="3" header="面板 3">内容 3</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse accordion>
  <ldesign-collapse-panel name="1" header="面板 1">内容 1</ldesign-collapse-panel>
  <ldesign-collapse-panel name="2" header="面板 2">内容 2</ldesign-collapse-panel>
  <ldesign-collapse-panel name="3" header="面板 3">内容 3</ldesign-collapse-panel>
</ldesign-collapse>
```

## 受控用法

<div class="demo-container" id="col-ctrl-wrap">
  <div class="demo-row">
    <ldesign-button id="col-ctrl-toggle">切换 X</ldesign-button>
    <span style="color: var(--vp-c-text-2);">当前展开：<strong id="col-ctrl-open">["x"]</strong></span>
  </div>
  <ldesign-collapse id="col-ctrl" value='["x"]'>
    <ldesign-collapse-panel name="x" header="X">面板 X</ldesign-collapse-panel>
    <ldesign-collapse-panel name="y" header="Y">面板 Y</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-button id="toggle">切换 X</ldesign-button>
<ldesign-collapse id="ctrl" value='["x"]'>
  <ldesign-collapse-panel name="x" header="X">面板 X</ldesign-collapse-panel>
  <ldesign-collapse-panel name="y" header="Y">面板 Y</ldesign-collapse-panel>
</ldesign-collapse>
<script>
  const group = document.getElementById('ctrl');
  const btn = document.getElementById('toggle');
  btn.addEventListener('click', () => {
    const cur = group.value || [];
    group.value = cur.includes('x') ? cur.filter(v => v !== 'x') : [...cur, 'x'];
  });
</script>
```

## 自定义头部与额外区域，图标与位置

<div class="demo-container">
  <ldesign-collapse expand-icon-placement="right">
    <ldesign-collapse-panel name="a" header="右侧图标" expand-icon="chevron-right">
      内容 A
    </ldesign-collapse-panel>
    <ldesign-collapse-panel name="b">
      <span slot="header">自定义头部</span>
      <span slot="extra">额外信息</span>
      内容 B
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse expand-icon-placement="right">
  <ldesign-collapse-panel name="a" header="右侧图标" expand-icon="chevron-right">内容</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b">
    <span slot="header">自定义头部</span>
    <span slot="extra">额外信息</span>
    内容
  </ldesign-collapse-panel>
</ldesign-collapse>
```

## 懒渲染与收起销毁

- `lazy`：首次展开时才渲染，之后保持渲染。
- `destroy-on-close`：收起后销毁内容（优先级高于 lazy）。

为便于直观看到差异，下面的 Live 示例会统计“内容节点被创建的次数”。

<div class="demo-container" id="col-live-wrap">
  <div class="demo-row">
    <ldesign-button id="col-open-a">打开 懒渲染</ldesign-button>
    <ldesign-button id="col-close-a" type="secondary">收起 懒渲染</ldesign-button>
    <ldesign-button id="col-open-b">打开 收起销毁</ldesign-button>
    <ldesign-button id="col-close-b" type="secondary">收起 收起销毁</ldesign-button>
  </div>

  <div class="demo-row" style="color: var(--vp-c-text-2);">
    懒渲染 创建次数：<strong id="col-a-count">0</strong>
    <span style="margin-left:16px;">当前存在：<strong id="col-a-exist">否</strong></span>
  </div>
  <div class="demo-row" style="color: var(--vp-c-text-2);">
    收起销毁 创建次数：<strong id="col-b-count">0</strong>
    <span style="margin-left:16px;">当前存在：<strong id="col-b-exist">否</strong></span>
  </div>

  <ldesign-collapse id="col-live">
    <ldesign-collapse-panel name="a" header="懒渲染" lazy>
      <div id="col-a-content" style="padding: 6px 0;">内容在首次展开时才渲染。</div>
    </ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="收起销毁" destroy-on-close>
      <div id="col-b-content" style="padding: 6px 0;">每次收起都会销毁内容。</div>
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse>
  <ldesign-collapse-panel name="a" header="懒渲染" lazy>
    <div id="col-a-content">内容在首次展开时才渲染。</div>
  </ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="收起销毁" destroy-on-close>
    <div id="col-b-content">每次收起都会销毁内容。</div>
  </ldesign-collapse-panel>
</ldesign-collapse>
```


## 禁用

<div class="demo-container">
  <ldesign-collapse>
    <ldesign-collapse-panel name="a" header="可用">内容</ldesign-collapse-panel>
    <ldesign-collapse-panel name="b" header="禁用项" disabled>内容</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse>
  <ldesign-collapse-panel name="a" header="可用">内容</ldesign-collapse-panel>
  <ldesign-collapse-panel name="b" header="禁用项" disabled>内容</ldesign-collapse-panel>
</ldesign-collapse>
```

## 尺寸变体

提供三种尺寸：`small`、`medium`（默认）、`large`。

<div class="demo-container">
  <div class="demo-row">
    <h4>Small</h4>
    <ldesign-collapse size="small">
      <ldesign-collapse-panel header="小尺寸标题">小尺寸内容区域</ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>Medium（默认）</h4>
    <ldesign-collapse size="medium">
      <ldesign-collapse-panel header="中等尺寸标题">中等尺寸内容区域</ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>Large</h4>
    <ldesign-collapse size="large">
      <ldesign-collapse-panel header="大尺寸标题">大尺寸内容区域</ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse size="small">...</ldesign-collapse>
<ldesign-collapse size="medium">...</ldesign-collapse>
<ldesign-collapse size="large">...</ldesign-collapse>
```

## 主题色彩

提供多种主题色彩，让折叠面板更加生动。

<div class="demo-container" style="display:flex; gap:16px; flex-wrap:wrap;">
  <div style="flex:1; min-width:300px;">
    <h4>Primary</h4>
    <ldesign-collapse theme="primary" default-value='["1"]'>
      <ldesign-collapse-panel name="1" header="主要">Primary 主题内容</ldesign-collapse-panel>
      <ldesign-collapse-panel name="2" header="更多">更多内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:300px;">
    <h4>Success</h4>
    <ldesign-collapse theme="success" default-value='["1"]'>
      <ldesign-collapse-panel name="1" header="成功">Success 主题内容</ldesign-collapse-panel>
      <ldesign-collapse-panel name="2" header="更多">更多内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:300px;">
    <h4>Warning</h4>
    <ldesign-collapse theme="warning" default-value='["1"]'>
      <ldesign-collapse-panel name="1" header="警告">Warning 主题内容</ldesign-collapse-panel>
      <ldesign-collapse-panel name="2" header="更多">更多内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:300px;">
    <h4>Danger</h4>
    <ldesign-collapse theme="danger" default-value='["1"]'>
      <ldesign-collapse-panel name="1" header="危险">Danger 主题内容</ldesign-collapse-panel>
      <ldesign-collapse-panel name="2" header="更多">更多内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse theme="primary">...</ldesign-collapse>
<ldesign-collapse theme="success">...</ldesign-collapse>
<ldesign-collapse theme="warning">...</ldesign-collapse>
<ldesign-collapse theme="danger">...</ldesign-collapse>
```

## 阴影和圆角

通过 `shadow` 和 `rounded` 属性自定义外观。

<div class="demo-container" style="display:flex; gap:16px; flex-wrap:wrap;">
  <div style="flex:1; min-width:300px;">
    <h4>带阴影</h4>
    <ldesign-collapse shadow>
      <ldesign-collapse-panel header="阴影效果">鼠标悬停查看阴影变化</ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:300px;">
    <h4>大圆角</h4>
    <ldesign-collapse rounded="large">
      <ldesign-collapse-panel header="大圆角">圆角半径 12px</ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:300px;">
    <h4>无圆角</h4>
    <ldesign-collapse rounded="none">
      <ldesign-collapse-panel header="直角">无圆角样式</ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse shadow>...</ldesign-collapse>
<ldesign-collapse rounded="large">...</ldesign-collapse>
<ldesign-collapse rounded="none">...</ldesign-collapse>
```

## 自定义图标

支持自定义展开/收起图标，隐藏图标等。

<div class="demo-container">
  <div class="demo-row">
    <h4>自定义图标</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel 
        header="自定义展开图标" 
        expand-icon="plus"
        collapsed-icon="plus"
        expanded-icon="minus">
        使用加减号作为展开/收起图标
      </ldesign-collapse-panel>
      <ldesign-collapse-panel 
        header="使用其他图标" 
        expand-icon="caret-right">
        使用三角箭头图标
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>隐藏图标</h4>
    <ldesign-collapse show-expand-icon="false">
      <ldesign-collapse-panel header="无图标面板 1">没有展开图标的面板</ldesign-collapse-panel>
      <ldesign-collapse-panel header="无图标面板 2">点击整个标题区域展开</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<!-- 自定义图标 -->
<ldesign-collapse-panel 
  expand-icon="plus"
  collapsed-icon="plus"
  expanded-icon="minus">
</ldesign-collapse-panel>

<!-- 隐藏图标 -->
<ldesign-collapse show-expand-icon="false">
  ...
</ldesign-collapse>
```

## 加载和空状态

支持显示加载状态和空内容提示。

<div class="demo-container" id="loading-demo">
  <div class="demo-row">
    <ldesign-button id="toggle-loading">切换加载状态</ldesign-button>
  </div>
  <ldesign-collapse default-value='["loading", "empty"]'>
    <ldesign-collapse-panel name="loading" header="加载状态" id="loading-panel">
      这是正常内容
    </ldesign-collapse-panel>
    <ldesign-collapse-panel name="empty" header="空状态" empty-text="暂无数据">
      <!-- 没有内容时会显示空状态 -->
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse-panel loading header="加载中">
  内容
</ldesign-collapse-panel>

<ldesign-collapse-panel empty-text="暂无数据">
  <!-- 空内容 -->
</ldesign-collapse-panel>
```

## 🎨 高级动画系统

### 动画预设

提供多种动画曲线预设，打造不同的视觉体验。

<div class="demo-container">
  <div class="demo-row">
    <h4>弹性动画（Spring）</h4>
    <ldesign-collapse animation-duration="400">
      <ldesign-collapse-panel header="弹性效果" animation-preset="spring" icon-rotation="180">
        🎉 具有弹簧效果的动画，让展开更加生动活泼
      </ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2" animation-preset="spring">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>反弹动画（Bounce）</h4>
    <ldesign-collapse animation-duration="500">
      <ldesign-collapse-panel header="反弹效果" animation-preset="bounce" reverse-icon-rotation>
        🎈 带有轻微反弹的动画效果
      </ldesign-collapse-panel>
      <ldesign-collapse-panel header="面板 2" animation-preset="bounce">内容 2</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>平滑动画（Smooth）</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="平滑效果" animation-preset="smooth" animation-duration="600">
        🌊 极其平滑的过渡效果
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse-panel 
  animation-preset="spring"
  animation-duration="400"
  icon-rotation="180">
</ldesign-collapse-panel>
```

### 内容动画

内容区域支持多种渐显效果。

<div class="demo-container">
  <div class="demo-row">
    <h4>淡入效果（Fade）</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="淡入" content-animation="fade">
        🌅 内容渐变显示
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>滑入效果（Slide）</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="滑入" content-animation="slide">
        🎿 内容从上方滑入
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>缩放效果（Scale）</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="缩放" content-animation="scale">
        🔍 内容缩放进入
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>组合效果（Slide + Fade）</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="组合" content-animation="slide-fade" content-fade-delay="150">
        ✨ 滑入 + 淡入的组合效果
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse-panel 
  content-animation="slide-fade"
  content-fade-delay="150">
</ldesign-collapse-panel>
```

### 图标旋转动画

<div class="demo-container">
  <div class="demo-row">
    <h4>90° 旋转（默认）</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="标准旋转" icon-rotation="90">
        图标旋转 90 度
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>180° 旋转</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="翻转" icon-rotation="180" expand-icon="chevron-down">
        图标翻转 180 度
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div class="demo-row">
    <h4>反向旋转</h4>
    <ldesign-collapse>
      <ldesign-collapse-panel header="反向" reverse-icon-rotation icon-rotation="90">
        图标反向旋转
      </ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

## 📦 使用场景

### 卡片模式

适合用于卡片式布局。

<div class="demo-container">
  <ldesign-collapse card-style>
    <ldesign-collapse-panel header="卡片 1">
      <p>🎴 每个面板都是独立的卡片</p>
    </ldesign-collapse-panel>
    <ldesign-collapse-panel header="卡片 2">
      <p>🌈 鼠标悬停有阴影效果</p>
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse card-style>
  ...
</ldesign-collapse>
```

### 紧凑模式和分离模式

<div class="demo-container" style="display:flex; gap:16px; flex-wrap:wrap;">
  <div style="flex:1; min-width:300px;">
    <h4>紧凑模式</h4>
    <ldesign-collapse mode="compact">
      <ldesign-collapse-panel header="紧凑 1">内边距更小</ldesign-collapse-panel>
      <ldesign-collapse-panel header="紧凑 2">适合空间有限的场景</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:300px;">
    <h4>分离模式</h4>
    <ldesign-collapse mode="separated">
      <ldesign-collapse-panel header="分离 1">每个面板独立</ldesign-collapse-panel>
      <ldesign-collapse-panel header="分离 2">有间距分隔</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

### 搜索过滤

支持关键词搜索和高亮。

<div class="demo-container" id="search-demo">
  <div class="demo-row">
    <input 
      id="search-input" 
      type="text" 
      placeholder="输入搜索关键词..." 
      style="padding: 8px 12px; border: 1px solid #d9d9d9; border-radius: 4px; width: 300px;"
    />
  </div>
  <ldesign-collapse id="search-collapse">
    <ldesign-collapse-panel header="JavaScript 基础">
      JavaScript 是一种动态类型、弱类型、基于原型的语言
    </ldesign-collapse-panel>
    <ldesign-collapse-panel header="TypeScript 进阶">
      TypeScript 是 JavaScript 的超集，添加了类型系统
    </ldesign-collapse-panel>
    <ldesign-collapse-panel header="React 框架">
      React 是用于构建用户界面的 JavaScript 库
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```javascript
const collapse = document.getElementById('search-collapse');
const input = document.getElementById('search-input');

input.addEventListener('input', (e) => {
  collapse.searchKeyword = e.target.value;
});
```

### 嵌套折叠面板

支持多层嵌套，自动处理缩进。

<div class="demo-container">
  <ldesign-collapse>
    <ldesign-collapse-panel header="第一层">
      <p>第一层内容</p>
      <ldesign-collapse>
        <ldesign-collapse-panel header="第二层 - A">
          <p>第二层内容 A</p>
          <ldesign-collapse>
            <ldesign-collapse-panel header="第三层">
              第三层内容
            </ldesign-collapse-panel>
          </ldesign-collapse>
        </ldesign-collapse-panel>
        <ldesign-collapse-panel header="第二层 - B">
          第二层内容 B
        </ldesign-collapse-panel>
      </ldesign-collapse>
    </ldesign-collapse-panel>
    <ldesign-collapse-panel header="另一个第一层">
      第一层内容
    </ldesign-collapse-panel>
  </ldesign-collapse>
</div>

### 拖拽排序 🆕

支持拖拽重新排序面板。

<div class="demo-container">
  <ldesign-collapse sortable>
    <ldesign-collapse-panel header="🎯 可拖拽 1">拖动标题区域排序</ldesign-collapse-panel>
    <ldesign-collapse-panel header="🎉 可拖拽 2">支持拖放排序</ldesign-collapse-panel>
    <ldesign-collapse-panel header="🎆 可拖拽 3">自由调整顺序</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```html
<ldesign-collapse sortable>
  ...
</ldesign-collapse>
```

## 展开/收起全部

通过方法控制全部面板的展开和收起。

<div class="demo-container" id="expand-all-demo">
  <div class="demo-row">
    <ldesign-button id="expand-all">展开全部</ldesign-button>
    <ldesign-button id="collapse-all">收起全部</ldesign-button>
  </div>
  <ldesign-collapse id="collapse-all-demo">
    <ldesign-collapse-panel name="1" header="面板 1">内容 1</ldesign-collapse-panel>
    <ldesign-collapse-panel name="2" header="面板 2">内容 2</ldesign-collapse-panel>
    <ldesign-collapse-panel name="3" header="面板 3">内容 3</ldesign-collapse-panel>
    <ldesign-collapse-panel name="4" header="面板 4（禁用）" disabled>内容 4</ldesign-collapse-panel>
  </ldesign-collapse>
</div>

```javascript
const collapse = document.querySelector('ldesign-collapse');
// 展开全部（不包括禁用项）
collapse.expandAll();
// 收起全部
collapse.collapseAll();
```

## 幽灵与边框

<div class="demo-container" style="display:flex; gap:16px; flex-wrap:wrap;">
  <div style="flex:1; min-width:260px;">
    <div style="margin-bottom:8px;color:var(--vp-c-text-2)">ghost</div>
    <ldesign-collapse ghost>
      <ldesign-collapse-panel header="无背景（ghost）">内容</ldesign-collapse-panel>
      <ldesign-collapse-panel header="更多">内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
  <div style="flex:1; min-width:260px;">
    <div style="margin-bottom:8px;color:var(--vp-c-text-2)">bordered</div>
    <ldesign-collapse bordered>
      <ldesign-collapse-panel header="带边框">内容</ldesign-collapse-panel>
      <ldesign-collapse-panel header="更多">内容</ldesign-collapse-panel>
    </ldesign-collapse>
  </div>
</div>

```html
<ldesign-collapse ghost>
  <ldesign-collapse-panel header="无背景（ghost）">内容</ldesign-collapse-panel>
</ldesign-collapse>

<ldesign-collapse bordered>
  <ldesign-collapse-panel header="带边框">内容</ldesign-collapse-panel>
</ldesign-collapse>
```

## 事件系统

支持多种事件，包括展开/收起前的钩子事件（可取消操作）。

<div class="demo-container" id="col-evt-wrap">
  <ldesign-collapse id="col-evt">
    <ldesign-collapse-panel name="1" header="面板 1（可取消展开）">内容 1</ldesign-collapse-panel>
    <ldesign-collapse-panel name="2" header="面板 2">内容 2</ldesign-collapse-panel>
  </ldesign-collapse>
  <div class="demo-row" style="margin-top:8px;">
    <label style="color: var(--vp-c-text-2);">
      <input type="checkbox" id="prevent-expand" /> 阻止面板 1 展开
    </label>
  </div>
  <div class="demo-row" style="color: var(--vp-c-text-2);">
    change: <code id="col-evt-change">[]</code>
  </div>
  <div class="demo-row" style="color: var(--vp-c-text-2);">
    toggle: <code id="col-evt-toggle">-</code>
  </div>
  <div class="demo-row" style="color: var(--vp-c-text-2);">
    最近事件: <code id="col-evt-recent">-</code>
  </div>
</div>

```javascript
const collapse = document.getElementById('collapse');

// 展开前事件（可取消）
collapse.addEventListener('ldesignBeforeExpand', e => {
  console.log('即将展开:', e.detail.name);
  // 调用 cancel 可以阻止展开
  if (shouldPrevent) {
    e.detail.cancel();
  }
});

// 收起前事件（可取消）
collapse.addEventListener('ldesignBeforeCollapse', e => {
  console.log('即将收起:', e.detail.name);
});

// 展开项变化
collapse.addEventListener('ldesignChange', e => {
  console.log('展开项:', e.detail);
});

// 单项切换
collapse.addEventListener('ldesignToggle', e => {
  console.log('切换:', e.detail);
});

// 展开全部完成
collapse.addEventListener('ldesignExpandAll', e => {
  console.log('已展开:', e.detail);
});

// 收起全部完成
collapse.addEventListener('ldesignCollapseAll', e => {
  console.log('已收起全部');
});
```

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  // 懒渲染 / 收起销毁 Live 示例
  const host = document.getElementById('col-live') as any
  if (host && !host.__inited_live) {
    host.__inited_live = true

    const btnOpenA = document.getElementById('col-open-a')
    const btnCloseA = document.getElementById('col-close-a')
    const btnOpenB = document.getElementById('col-open-b')
    const btnCloseB = document.getElementById('col-close-b')
    const aCountEl = document.getElementById('col-a-count')
    const bCountEl = document.getElementById('col-b-count')
    const aExistEl = document.getElementById('col-a-exist')
    const bExistEl = document.getElementById('col-b-exist')

    let aCount = 0
    let bCount = 0
    let aPresent = false
    let bPresent = false

    const update = () => {
      const aNow = !!document.getElementById('col-a-content')
      const bNow = !!document.getElementById('col-b-content')
      if (aNow && !aPresent) { aCount++; if (aCountEl) aCountEl.textContent = String(aCount) }
      if (bNow && !bPresent) { bCount++; if (bCountEl) bCountEl.textContent = String(bCount) }
      aPresent = aNow; bPresent = bNow
      if (aExistEl) aExistEl.textContent = aNow ? '是' : '否'
      if (bExistEl) bExistEl.textContent = bNow ? '是' : '否'
    }

    const obs = new MutationObserver(update)
    obs.observe(host, { subtree: true, childList: true })
    update()

    const getOpen = () => Array.isArray(host.value) ? [ ...host.value ] : []
    const setOpen = (keys: string[]) => { host.value = keys }

    btnOpenA?.addEventListener('click', () => setOpen(Array.from(new Set([...getOpen(), 'a']))))
    btnCloseA?.addEventListener('click', () => setOpen(getOpen().filter(k => k !== 'a')))
    btnOpenB?.addEventListener('click', () => setOpen(Array.from(new Set([...getOpen(), 'b']))))
    btnCloseB?.addEventListener('click', () => setOpen(getOpen().filter(k => k !== 'b')))
  }

  // 受控 demo
  const group = document.getElementById('col-ctrl') as any
  const btn = document.getElementById('col-ctrl-toggle')
  const open = document.getElementById('col-ctrl-open')
  if (group && btn && open && !group.__inited_ctrl) {
    group.__inited_ctrl = true
    btn.addEventListener('click', () => {
      const cur = group.value || []
      const next = cur.includes('x') ? cur.filter((v: string) => v !== 'x') : [...cur, 'x']
      group.value = next
      open.textContent = JSON.stringify(next)
    })
    group.addEventListener('ldesignChange', (e: any) => open.textContent = JSON.stringify(e.detail || []))
  }

  // 事件 demo - 增强版
  const c = document.getElementById('col-evt') as any
  const ch = document.getElementById('col-evt-change')
  const tg = document.getElementById('col-evt-toggle')
  const recent = document.getElementById('col-evt-recent')
  const preventCheckbox = document.getElementById('prevent-expand') as HTMLInputElement
  
  if (c && ch && tg && recent && !(c as any).__inited_evt) {
    c.__inited_evt = true
    
    c.addEventListener('ldesignChange', (e: any) => {
      ch!.textContent = JSON.stringify(e.detail || [])
    })
    
    c.addEventListener('ldesignToggle', (e: any) => {
      tg!.textContent = JSON.stringify(e.detail || {})
    })
    
    c.addEventListener('ldesignBeforeExpand', (e: any) => {
      recent!.textContent = `beforeExpand: ${e.detail.name}`
      if (preventCheckbox?.checked && e.detail.name === '1') {
        e.detail.cancel()
        recent!.textContent = `beforeExpand: ${e.detail.name} (已取消)`
      }
    })
    
    c.addEventListener('ldesignBeforeCollapse', (e: any) => {
      recent!.textContent = `beforeCollapse: ${e.detail.name}`
    })
    
    c.addEventListener('ldesignExpandAll', (e: any) => {
      recent!.textContent = `expandAll: ${JSON.stringify(e.detail)}`
    })
    
    c.addEventListener('ldesignCollapseAll', () => {
      recent!.textContent = 'collapseAll'
    })
  }
  
  // 加载状态 demo
  const loadingBtn = document.getElementById('toggle-loading')
  const loadingPanel = document.getElementById('loading-panel') as any
  if (loadingBtn && loadingPanel && !loadingBtn.hasAttribute('data-inited')) {
    loadingBtn.setAttribute('data-inited', 'true')
    let isLoading = false
    
    loadingBtn.addEventListener('click', () => {
      isLoading = !isLoading
      loadingPanel.loading = isLoading
    })
  }
  
  // 展开/收起全部 demo
  const expandAllBtn = document.getElementById('expand-all')
  const collapseAllBtn = document.getElementById('collapse-all')
  const collapseAllDemo = document.getElementById('collapse-all-demo') as any
  
  if (expandAllBtn && collapseAllBtn && collapseAllDemo && !expandAllBtn.hasAttribute('data-inited')) {
    expandAllBtn.setAttribute('data-inited', 'true')
    
    expandAllBtn.addEventListener('click', () => {
      collapseAllDemo.expandAll()
    })
    
    collapseAllBtn.addEventListener('click', () => {
      collapseAllDemo.collapseAll()
    })
  }
  
  // 搜索过滤 demo
  const searchInput = document.getElementById('search-input') as HTMLInputElement
  const searchCollapse = document.getElementById('search-collapse') as any
  
  if (searchInput && searchCollapse && !searchInput.hasAttribute('data-inited')) {
    searchInput.setAttribute('data-inited', 'true')
    
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      searchCollapse.searchKeyword = target.value
    })
  }
})
</script>

## 无障碍（A11y）

- 🔑 **键盘导航**：Enter/Space 展开收起，ArrowUp/ArrowDown 切换焦点，Home/End 跳转首尾
- 🎤 **屏幕阅读器**：完整 ARIA 属性（aria-expanded, aria-controls, aria-labelledby）
- 💡 **视觉反馈**：清晰的焦点样式和状态指示
- ⚙️ **动画偏好**：遵循 prefers-reduced-motion，自动禁用动画

## API

### ldesign-collapse

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| **基础属性** | | | |
| value | `string[]` | - | 受控展开项，需配合事件写回 |
| default-value | `string[]` | `[]` | 非受控默认展开项 |
| accordion | `boolean` | `false` | 手风琴模式，同层级仅保留一个展开 |
| disabled | `boolean` | `false` | 整体禁用（子面板不可交互） |
| **视觉属性** | | | |
| size | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸变体 |
| theme | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 主题色彩 |
| bordered | `boolean` | `true` | 是否带边框 |
| ghost | `boolean` | `false` | 幽灵模式（背景透明，仅分隔线） |
| shadow | `boolean` | `false` | 显示阴影效果 |
| rounded | `'none' \| 'small' \| 'medium' \| 'large'` | `'medium'` | 圆角大小 |
| **图标属性** | | | |
| expand-icon-placement | `'left' \| 'right'` | `'left'` | 展开图标位置 |
| show-expand-icon | `boolean` | `true` | 是否显示展开图标 |
| **动画属性** | | | |
| animation-duration | `number` | `200` | 动画持续时间（毫秒） |
| animation-easing | `string` | `'ease'` | 动画缓动函数 |
| **高级属性** | | | |
| nesting-indent | `number` | `20` | 嵌套缩进宽度（像素） |
| keyboard-navigation | `boolean` | `true` | 启用键盘导航 |

#### 事件

| 事件 | 说明 | detail 类型 |
|---|---|---|
| ldesignChange | 展开项变化 | `string[]` |
| ldesignToggle | 单项切换 | `{ name: string; open: boolean; openKeys: string[] }` |
| ldesignBeforeExpand | 展开前（可取消） | `{ name: string; cancel: () => void }` |
| ldesignBeforeCollapse | 收起前（可取消） | `{ name: string; cancel: () => void }` |
| ldesignExpandAll | 全部展开完成 | `string[]` |
| ldesignCollapseAll | 全部收起完成 | `void` |

#### 方法

| 方法 | 说明 | 参数 | 返回值 |
|---|---|---|---|
| expandAll() | 展开全部面板（不包括禁用项） | - | `void` |
| collapseAll() | 收起全部面板 | - | `void` |
| togglePanel(name) | 切换指定面板 | `name: string` | `void` |
| getOpenPanels() | 获取当前展开的面板 | - | `string[]` |

### ldesign-collapse-panel

#### 属性

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| **基础属性** | | | |
| name | `string` | - | 面板唯一标识（未设置将按顺序自动补齐） |
| header | `string` | - | 头部文本（可用 `slot="header"` 覆盖） |
| extra | `string` | - | 右侧附加区域（可用 `slot="extra"` 覆盖） |
| disabled | `boolean` | `false` | 禁用当前面板 |
| **图标属性** | | | |
| expand-icon | `string` | `'chevron-right'` | 展开图标名称 |
| collapsed-icon | `string` | - | 折叠状态图标（优先级高于 expand-icon） |
| expanded-icon | `string` | - | 展开状态图标（优先级高于 expand-icon） |
| expand-icon-placement | `'left' \| 'right'` | `'left'` | 图标位置（可覆盖父级） |
| **性能属性** | | | |
| lazy | `boolean` | `false` | 首次展开才渲染 |
| destroy-on-close | `boolean` | `false` | 收起后销毁内容（优先于 lazy） |
| **状态属性** | | | |
| loading | `boolean` | `false` | 加载状态 |
| empty-text | `string` | - | 空内容提示文本 |
| **样式属性** | | | |
| header-background | `string` | - | 头部背景色 |
| content-padding | `string` | - | 内容区内边距 |
| show-divider | `boolean` | `true` | 显示分隔线 |

#### 插槽

| 插槽 | 说明 |
|---|---|
| default | 面板内容 |
| header | 自定义头部 |
| extra | 头部右侧额外内容 |

## 完整示例

```html
<!-- 综合示例 -->
<ldesign-collapse 
  size="large"
  theme="primary"
  shadow
  rounded="large"
  animation-duration="300"
  default-value='["panel1"]'
>
  <ldesign-collapse-panel 
    name="panel1"
    header="高级面板"
    expand-icon="plus"
    collapsed-icon="plus"
    expanded-icon="minus"
    header-background="#f0f8ff"
    content-padding="20px 30px"
  >
    <div slot="extra">
      <ldesign-badge count="3">
        <ldesign-icon name="bell" />
      </ldesign-badge>
    </div>
    丰富的内容区域
  </ldesign-collapse-panel>
</ldesign-collapse>
```
