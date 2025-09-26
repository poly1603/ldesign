# ldesign-time-picker

基于 ldesign-picker + ldesign-popup/ldesign-drawer 的时间选择器。
- PC：使用 Popup
- 平板/手机：使用 Drawer（md=1024 为默认分界，可通过 breakpoints 调整）
- 三列：小时/分钟/秒（可通过 show-seconds 关闭秒列），支持 steps 步进

示例：

```html
<ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>
<ldesign-time-picker overlay="drawer"></ldesign-time-picker>
<ldesign-time-picker steps='[1,5,5]' panel-height="216" visible-items="5"></ldesign-time-picker>
```
