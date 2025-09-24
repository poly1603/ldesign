# Affix 固钉

将元素固定在页面（或指定滚动容器）顶部。常用于吸顶工具条、操作条等场景。

## 基础用法

<div class="demo-container">
  <ldesign-affix>
    <ldesign-button type="primary">固定在顶部</ldesign-button>
  </ldesign-affix>
</div>

```html
<ldesign-affix>
  <ldesign-button type="primary">固定在顶部</ldesign-button>
</ldesign-affix>
```

## 自定义偏移

当内容到达距离顶端一定偏移量时开始吸顶。

<div class="demo-container">
  <ldesign-affix offset="80">
    <div style="background:#fff;padding:8px 16px;border:1px solid #eee;">吸顶条（80px）</div>
  </ldesign-affix>
</div>

```html
<ldesign-affix offset="80">
  <div style="background:#fff;padding:8px 16px;border:1px solid #eee;">吸顶条（80px）</div>
</ldesign-affix>
```

## 指定滚动容器（在容器内部吸附）

通过 `target` 指定滚动容器（CSS 选择器）。

<div class="demo-container">
  <div id="affix-scroll" style="height:240px; overflow:auto; border:1px solid #ddd; padding: 12px;">
    <div style="height:1000px;">
      <ldesign-affix target="#affix-scroll" offset="12" within-target>
        <ldesign-button type="secondary">跟随容器吸顶</ldesign-button>
      </ldesign-affix>
      <p>容器内的长内容……</p>
    </div>
  </div>
</div>

```html
<div id="affix-scroll" style="height:240px; overflow:auto; border:1px solid #ddd;">
  <div style="height:1000px; padding: 12px;">
    <ldesign-affix target="#affix-scroll" offset="12" within-target>
      <ldesign-button type="secondary">跟随容器吸顶</ldesign-button>
    </ldesign-affix>
  </div>
</div>
```

## 监听状态变化

吸附状态变化会触发 `ldesignAffixChange` 事件。

```html
<ldesign-affix id="affix" offset="0">
  <ldesign-button>工具条</ldesign-button>
</ldesign-affix>

<script>
  const el = document.getElementById('affix');
  el.addEventListener('ldesignAffixChange', (e) => {
    console.log('affixed:', e.detail);
  });
</script>
```

## 与按钮组合

<div class="demo-container">
  <ldesign-affix offset="0">
    <div style="display:flex; gap:8px; background:#fff; border:1px solid #eee; padding:8px 12px;">
      <ldesign-button type="primary">保存</ldesign-button>
      <ldesign-button type="secondary">取消</ldesign-button>
    </div>
  </ldesign-affix>
</div>

```html
<ldesign-affix offset="0">
  <div style="display:flex; gap:8px; background:#fff; border:1px solid #eee; padding:8px 12px;">
    <ldesign-button type="primary">保存</ldesign-button>
    <ldesign-button type="secondary">取消</ldesign-button>
  </div>
</ldesign-affix>
```

## API

### 属性

| 名称 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| offset | 距离顶部的吸附偏移量（px） | `number` | `0` |
| target | 滚动容器（CSS 选择器），未匹配到则回退到 `window` | `string` | `-` |
| z-index | 固定时的层级 | `number` | `1000` |
| within-target | 是否在指定滚动容器内部吸附（position: sticky） | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignAffixChange | 吸附状态变化 | `(affixed: boolean)` |

> 注意
> - 组件在吸附时会给内部内容设置 `position: fixed` 并同步 `width/left/top/z-index`。
> - 会自动添加占位高度，避免页面跳动。
> - 当窗口或容器尺寸变化时，会自动重新计算位置与宽度。
