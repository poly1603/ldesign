# ldesign-popconfirm

基于 Popup 的二次封装，用于在操作前进行二次确认。通常与“删除”“退出”“危险操作”等按钮配合使用。

## 使用示例

- 基本用法（点击触发）
```html path=null start=null
<ldesign-popconfirm popconfirm-title="确定删除该条记录吗？" description="删除后无法恢复">
  <ldesign-button slot="trigger" type="danger">删除</ldesign-button>
</ldesign-popconfirm>
```

- 自定义图标/按钮文案
```html path=null start=null
<ldesign-popconfirm popconfirm-title="发布到线上？" icon="send" ok-text="发布" cancel-text="稍后">
  <ldesign-button slot="trigger" type="primary">发布</ldesign-button>
</ldesign-popconfirm>
```

- 受控显示（trigger="manual"）
```html path=null start=null
<ldesign-popconfirm id="pc" trigger="manual" visible>
  <ldesign-button slot="trigger">打开</ldesign-button>
  <span slot="title">危险操作</span>
  真的要这么做吗？
</ldesign-popconfirm>
<script>
  const pc = document.getElementById('pc');
  // 关闭
  pc.addEventListener('ldesignConfirm', () => pc.visible = false);
  pc.addEventListener('ldesignCancel', () => pc.visible = false);
</script>
```

> 下方为自动生成的属性与事件文档，构建后会自动更新。

<!-- Auto Generated Below -->

