# BackTop 返回顶部

用于快速返回页面或指定容器顶部的辅助按钮，支持自定义滚动动画速度。

## 基础用法（页面根滚动）

当页面滚动超过一定距离（默认 200px）时，会显示一个返回顶部的圆形按钮，点击即可平滑回到页面顶部。

<div class="demo-container" style="height: 300px;">
  <p>向下滚动页面查看右下角的返回顶部按钮。</p>
  <div style="height: 1200px; background: linear-gradient(#fff, #fafafa);"></div>

  <!-- 默认针对 window 滚动 -->
  <ldesign-backtop></ldesign-backtop>
</div>

```html
<!-- 默认针对 window 滚动 -->
<ldesign-backtop></ldesign-backtop>
```

## 指定容器内滚动回到顶部

通过 `target` 指定滚动容器（CSS 选择器）。当容器内滚动超过一定距离时，按钮显示并在点击后仅滚动该容器回到顶部。

<div class="demo-container">
  <div id="backtop-scroll" style="height: 260px; overflow: auto; border:1px solid #ddd; padding: 12px; position: relative;">
    <div style="height: 1000px;">
      <p>这是一个可滚动的容器，向下滚动后右下角将出现返回顶部按钮。</p>
      <p>按钮放在文档任意位置均可，只要 target 指向该容器即可。</p>
    </div>
    <!-- 放在容器内部或外部均可，这里放在内部以便示例直观 -->
    <ldesign-backtop target="#backtop-scroll"></ldesign-backtop>
  </div>
</div>

```html
<div id="backtop-scroll" style="height: 260px; overflow: auto; border:1px solid #ddd; padding: 12px; position: relative;">
  <div style="height: 1000px;"></div>
  <ldesign-backtop target="#backtop-scroll"></ldesign-backtop>
</div>
```

## 自定义滚动速度（容器内滚动）

通过 `speed` 设置滚动动画速度（像素/秒）。值越大滚动越快。动画总时长 = 当前滚动距离 / speed。以下示例均在指定容器内滚动回到顶部。

<div class="demo-container">
  <div id="backtop-speed" style="height: 260px; overflow: auto; border:1px solid #ddd; padding: 12px; position: relative;">
    <div style="height: 1200px;"></div>
    <!-- 更快（2000 px/s） -->
    <ldesign-backtop target="#backtop-speed" speed="2000" style="right: 96px;"></ldesign-backtop>
    <!-- 默认（1200 px/s） -->
    <ldesign-backtop target="#backtop-speed"></ldesign-backtop>
    <!-- 更慢（600 px/s） -->
    <ldesign-backtop target="#backtop-speed" speed="600" style="right: 152px;"></ldesign-backtop>
  </div>
</div>

```html
<div id="backtop-speed" style="height: 260px; overflow: auto; border:1px solid #ddd; padding: 12px; position: relative;">
  <div style="height: 1200px;"></div>
  <!-- 更快（2000 px/s） -->
  <ldesign-backtop target="#backtop-speed" speed="2000"></ldesign-backtop>
  <!-- 默认（1200 px/s） -->
  <ldesign-backtop target="#backtop-speed"></ldesign-backtop>
  <!-- 更慢（600 px/s） -->
  <ldesign-backtop target="#backtop-speed" speed="600"></ldesign-backtop>
</div>
```

## 自定义内容（容器内滚动）

通过默认插槽自定义按钮内容，例如放置文字或自定义图标。以下示例在容器内滚动回到顶部。

<div class="demo-container">
  <div id="backtop-custom" style="height: 260px; overflow: auto; border:1px solid #ddd; padding: 12px; position: relative;">
    <div style="height: 1200px;"></div>
    <ldesign-backtop target="#backtop-custom">
      <span style="font-size: 12px;line-height: 1;">Top</span>
    </ldesign-backtop>
  </div>
</div>

```html
<div id="backtop-custom" style="height: 260px; overflow: auto; border:1px solid #ddd; padding: 12px; position: relative;">
  <div style="height: 1200px;"></div>
  <ldesign-backtop target="#backtop-custom">
    <span>Top</span>
  </ldesign-backtop>
</div>
```

## API

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| target | 指定滚动容器（CSS 选择器）；未匹配到则回退到 window | `string` | `-` |
| speed | 滚动动画速度（像素/秒）；≤0 时立即滚至顶部 | `number` | `1200` |
| visibility-height | 按钮出现的阈值（px）；小于该值时按钮隐藏 | `number` | `200` |

### 插槽

- 默认插槽：自定义按钮内容（默认显示一个向上箭头图标）

### 无障碍

- 具备 `role="button"` 与 `aria-label="回到顶部"`
- 键盘焦点可达（Tab）
