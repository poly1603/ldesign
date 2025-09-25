# ColorPickerPanel 颜色选择面板

纯面板组件，不包含弹出层与触发器。适合作为内嵌控件，或配合 `<ldesign-popup>` 使用。

- 标签名：`<ldesign-color-picker-panel>`
- 面板会自动铺满父容器宽度，SV 区域会随容器自适应尺寸
- 若开启 `show-history` 但暂无历史记录，面板不会渲染“最近使用颜色”区

## 基础用法

<div class="demo-container">
  <div style="width: 360px;">
    <ldesign-color-picker-panel value="#1677ff" show-alpha></ldesign-color-picker-panel>
  </div>
</div>

```html
<div style="width: 360px;">
  <ldesign-color-picker-panel value="#1677ff" show-alpha></ldesign-color-picker-panel>
</div>
```

## 与 Popup 组合

<div class="demo-container">
  <ldesign-popup trigger="click" placement="bottom-start" width="380">
    <button slot="trigger" class="vp-raw" style="padding:4px 8px;border:1px solid #ddd;border-radius:6px;">打开面板</button>
    <ldesign-color-picker-panel value="#1677ff" show-alpha></ldesign-color-picker-panel>
  </ldesign-popup>
</div>

```html
<ldesign-popup trigger="click" placement="bottom-start" width="380">
  <button slot="trigger">打开面板</button>
  <ldesign-color-picker-panel value="#1677ff" show-alpha></ldesign-color-picker-panel>
</ldesign-popup>
```

## API

见 ColorPicker 的面板相关属性：`value`、`format`、`show-alpha`、`show-preset`、`show-history`、`presets`、`recent-max`、`size`、`disabled`。
