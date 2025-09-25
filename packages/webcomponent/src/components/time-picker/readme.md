# TimePicker 时间选择器

一个简洁的时间选择组件，使用 ldesign-popup 作为弹层，内置小时/分钟/秒三列选择。

- 支持受控/非受控
- 支持确认按钮或即时生效
- 支持步进与是否显示秒

## 用法

```html
<ldesign-time-picker placeholder="选择时间"></ldesign-time-picker>

<!-- 即时生效（不需要点击确定） -->
<ldesign-time-picker confirm="false"></ldesign-time-picker>

<!-- 不显示秒 -->
<ldesign-time-picker show-seconds="false"></ldesign-time-picker>

<!-- 指定初值（非受控） -->
<ldesign-time-picker default-value="09:30:00"></ldesign-time-picker>

<!-- 受控（通过属性更新，监听事件） -->
<ldesign-time-picker id="tp" value="12:00:00"></ldesign-time-picker>
<script>
  const tp = document.getElementById('tp');
  tp.addEventListener('ldesignChange', (e) => console.log('change:', e.detail));
</script>
```
