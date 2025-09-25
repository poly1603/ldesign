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

## 渐变模式

- 编辑角度（滑条 + 数值 + 预设 0/45/90/180）
- 支持多个色标（最多 8），可拖拽/数值修改位置
- 输出示例：`linear-gradient(45deg, rgba(22,119,255,1) 0%, rgba(0,0,0,.35) 100%)`

<div class="demo-container">
  <div style="width: 420px;">
    <ldesign-color-picker-panel modes="gradient" value="linear-gradient(45deg, #1677ff 0%, rgba(0,0,0,.35) 100%)" show-alpha></ldesign-color-picker-panel>
  </div>
</div>

```html
<ldesign-color-picker-panel
  modes="gradient"
  value="linear-gradient(45deg, #1677ff 0%, rgba(0,0,0,.35) 100%)"
  show-alpha
></ldesign-color-picker-panel>
```

## 操作说明

- 线性渐变
  - 角度：slider（0–360）与数字输入、预设 0/45/90/180
- 径向渐变
  - 中心：X/Y slider 与数字输入（0–100%）
  - 形状：circle/ellipse
- stops（色标）
  - 添加/删除：+/- 按钮；聚焦预览条时 Enter 添加、Delete 删除
  - 移动：拖拽；预览条聚焦后 ←/→（Shift×10）微调；遵循 minStopGap（默认 1%）
  - 位置行：slider + 数字输入；支持“反转/均分”
- 格式编辑区：在 SV 下方使用 tabs（HEX/RGB/HSL/HSV）编辑当前颜色（单色）或当前 stop（渐变）

## 径向渐变

支持 `radial-gradient(shape at cx% cy%, …)`：

```html
<ldesign-color-picker-panel modes="gradient" show-alpha value="radial-gradient(circle at 30% 40%, #1677ff 0%, rgba(0,0,0,.25) 100%)"></ldesign-color-picker-panel>
```

- 形状：circle / ellipse
- 中心：X/Y（0–100%）

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
