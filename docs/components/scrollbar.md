# Scrollbar 自定义滚动条

封装任意内容，提供垂直/水平/双向的自定义滚动条。支持：
- 拇指拖拽、轨道点击跳转
- 悬浮显示 / 常显（always）
- 轨道样式（type=track）
- CSS 变量与插槽实现完全定制

## 示例

```html
<ldesign-scrollbar type="track" style="height: 220px; --ld-scrollbar-thumb-bg:#5e2aa7;">
  <div style="height: 600px"></div>
</ldesign-scrollbar>
```

## API（简）

- type: 'bar' | 'track' = 'bar'
- direction: 'vertical' | 'horizontal' | 'both' = 'both'
- always: boolean = false
- thumbMinSize: number = 24
- disabled: boolean = false

事件：
- ldesignScroll(detail: { scrollTop, scrollLeft, clientWidth, clientHeight, scrollWidth, scrollHeight })
