# Modal 模态框

用于展示重要信息或进行交互操作，支持拖拽、调整大小、抽屉/底部弹层等变体，并提供多种开合动画。

## 基础用法

<div class="demo-block">
  <ldesign-button id="open-modal-btn" type="primary">打开模态框</ldesign-button>
  <ldesign-modal id="demo-modal" modal-title="标题" centered>
    <div>内容区域</div>
    <div slot="footer">
      <ldesign-button type="secondary" onclick="document.getElementById('demo-modal').close()">取消</ldesign-button>
      <ldesign-button type="primary" onclick="document.getElementById('demo-modal').close()">确定</ldesign-button>
    </div>
  </ldesign-modal>
  <script>
    const btn = document.getElementById('open-modal-btn')
    const modal = document.getElementById('demo-modal')
    btn?.addEventListener('click', () => modal?.show())
  </script>
</div>

```html path=null start=null
<ldesign-button id="open-modal-btn" type="primary">打开模态框</ldesign-button>
<ldesign-modal id="demo-modal" modal-title="标题" centered>
  <div>内容区域</div>
  <div slot="footer">
    <ldesign-button type="secondary" onclick="document.getElementById('demo-modal').close()">取消</ldesign-button>
    <ldesign-button type="primary" onclick="document.getElementById('demo-modal').close()">确定</ldesign-button>
  </div>
</ldesign-modal>
<script>
  const btn = document.getElementById('open-modal-btn')
  const modal = document.getElementById('demo-modal')
  btn?.addEventListener('click', () => modal?.show())
</script>
```

## 动画

通过 `animation` 属性配置开合动画，支持：
- `fade`
- `zoom`
- `slide-down`
- `slide-up`
- `slide-left`
- `slide-right`
- `zoom-origin`（新增）

### 新增：zoom-origin（从点击点放大/缩小）
- 打开时：从最近一次点击位置放大展开。
- 关闭时：朝最近一次点击位置缩小回去。
- 无点击（例如通过 ESC 或编程方式打开/关闭）时，退化为从组件中心缩放。
- 建议用于 `variant="modal"`（标准居中弹窗）。抽屉/底部弹层建议继续使用滑动类动画。

```html path=null start=null
<!-- 从点击点放大展开/关闭缩回 -->
<ldesign-button id="open-modal-origin" type="primary">从点击点展开</ldesign-button>
<ldesign-modal id="modal-origin" modal-title="从点击点展开" animation="zoom-origin" centered>
  <div>试着点击不同位置打开/关闭，观察动画起点变化。</div>
  <div slot="footer">
    <ldesign-button type="secondary" onclick="document.getElementById('modal-origin').close()">取消</ldesign-button>
    <ldesign-button type="primary" onclick="document.getElementById('modal-origin').close()">确定</ldesign-button>
  </div>
</ldesign-modal>
<script>
  const btn2 = document.getElementById('open-modal-origin')
  const modal2 = document.getElementById('modal-origin')
  btn2?.addEventListener('click', () => modal2?.show())
</script>
```

提示与说明：
- 该动画会记录最近一次全局指针按下位置（pointerdown），作为动画的 transform-origin。
- 当打开时会在首帧前计算并设置 transform-origin，避免首帧抖动。
- 当关闭时会再次计算 origin（如点击遮罩或关闭按钮）。若没有最近点击点，则以组件中心为起始点。
- 你可以通过 CSS 覆盖 `--ld-modal-duration` 或 `--ld-modal-anim-ease` 自定义动画时长与缓动。

```css path=null start=null
/* 示例：自定义时长和缓动 */
ldesign-modal[animation="zoom-origin"] {
  --ld-modal-duration: 280ms;
  --ld-modal-anim-ease: cubic-bezier(.2,.8,.2,1);
}
```

## 常用属性摘要（节选）

- `visible: boolean` 是否显示
- `modal-title?: string` 标题
- `size: 'small'|'medium'|'large'|'full'` 尺寸
- `animation: 'fade'|'zoom'|'slide-down'|'slide-up'|'slide-left'|'slide-right'|'zoom-origin'` 动画
- `variant: 'modal'|'drawer-left'|'drawer-right'|'bottom-sheet'` 变体
- `centered: boolean` 居中
- `is-draggable: boolean` 可拖拽
- `resizable: boolean` 可调整大小
- `destroy-on-close: boolean` 关闭时销毁内容

> 更多属性与事件请参考源码注释或后续 API 文档完善。
