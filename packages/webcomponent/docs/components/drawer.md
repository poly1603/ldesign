# Drawer 抽屉

抽屉用于在不打断当前流程的情况下，承载并展示额外内容（如导航、表单、详情等）。

## 特性

- 🎨 **四个方向** - 支持从上下左右任意方向弹出
- 📐 **可调整大小** - 支持鼠标和触摸拖拽调整大小
- 🧲 **吸附效果** - 自动吸附到预设位置
- 🎯 **阻尼效果** - 平滑的拖拽体验
- 📱 **移动端手势** - 支持滑动关闭
- ⌨️ **键盘导航** - 完整的键盘操作支持
- 🎭 **圆角样式** - 可自定义圆角大小
- 🔘 **自定义按钮** - 灵活配置底部操作按钮
- 🎬 **动画控制** - 可配置动画时长和效果
- 📦 **状态保留** - 可选择关闭后保留状态

## 基础用法

通过设置 `visible` 属性控制抽屉显示与隐藏。可以结合按钮事件来切换。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-basic">打开抽屉</button>
  </div>

  <ldesign-drawer id="drawer-basic" drawer-title="基础抽屉">
    <p>这里是抽屉的内容区域。可放置表单、文本、列表等。</p>
    <p>抽屉组件提供了丰富的配置选项，可以满足各种使用场景。</p>
  </ldesign-drawer>
</div>

```html
<button id="open-drawer-basic">打开抽屉</button>

<ldesign-drawer id="drawer-basic" drawer-title="基础抽屉">
  <p>这里是抽屉的内容区域。可放置表单、文本、列表等。</p>
</ldesign-drawer>

<script>
  const openBtn = document.getElementById('open-drawer-basic')
  const drawer = document.getElementById('drawer-basic')
  openBtn.addEventListener('click', () => {
    drawer.setAttribute('visible', '') // 设置可见
  })
  drawer.addEventListener('ldesignClose', () => {
    console.log('抽屉关闭')
  })
</script>
```


## 位置 placement

通过 `placement` 指定抽屉出现的位置，支持 `left`、`right`、`top`、`bottom`。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-left">左侧</button>
    <button id="open-drawer-right">右侧</button>
    <button id="open-drawer-top">顶部</button>
    <button id="open-drawer-bottom">底部</button>
  </div>

  <ldesign-drawer id="drawer-left" placement="left" title="左侧抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-right" placement="right" title="右侧抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-top" placement="top" title="顶部抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-bottom" placement="bottom" title="底部抽屉"></ldesign-drawer>
</div>

```html
<button id="open-drawer-left">左侧</button>
<button id="open-drawer-right">右侧</button>
<button id="open-drawer-top">顶部</button>
<button id="open-drawer-bottom">底部</button>

<ldesign-drawer id="drawer-left" placement="left" drawer-title="左侧抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-right" placement="right" drawer-title="右侧抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-top" placement="top" drawer-title="顶部抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-bottom" placement="bottom" drawer-title="底部抽屉"></ldesign-drawer>

<script>
  const ids = ['left', 'right', 'top', 'bottom']
  ids.forEach((pos) => {
    const btn = document.getElementById(`open-drawer-${pos}`)
    const el = document.getElementById(`drawer-${pos}`)
    btn.addEventListener('click', () => el.setAttribute('visible', ''))
  })
</script>
```


## 尺寸 size

通过 `size` 属性设置抽屉面板的尺寸：
- 当 `placement` 为 `left`/`right` 时，`size` 表示宽度
- 当 `placement` 为 `top`/`bottom` 时，`size` 表示高度

支持数字（单位 px）或任意 CSS 长度（如 `50%`、`30rem`）。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-wide">宽 600px</button>
    <button id="open-drawer-half">宽 50%</button>
  </div>

  <ldesign-drawer id="drawer-wide" placement="right" size="600" title="600px 宽抽屉"></ldesign-drawer>
  <ldesign-drawer id="drawer-half" placement="right" size="50%" title="50% 宽抽屉"></ldesign-drawer>
</div>

```html
<button id="open-drawer-wide">宽 600px</button>
<button id="open-drawer-half">宽 50%</button>

<ldesign-drawer id="drawer-wide" placement="right" size="600" drawer-title="600px 宽抽屉"></ldesign-drawer>
<ldesign-drawer id="drawer-half" placement="right" size="50%" drawer-title="50% 宽抽屉"></ldesign-drawer>

<script>
  document.getElementById('open-drawer-wide').addEventListener('click', () => {
    document.getElementById('drawer-wide').setAttribute('visible', '')
  })
  document.getElementById('open-drawer-half').addEventListener('click', () => {
    document.getElementById('drawer-half').setAttribute('visible', '')
  })
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const pairs = [
    ['open-drawer-basic', 'drawer-basic'],
    ['open-drawer-left', 'drawer-left'],
    ['open-drawer-right', 'drawer-right'],
    ['open-drawer-top', 'drawer-top'],
    ['open-drawer-bottom', 'drawer-bottom'],
    ['open-drawer-wide', 'drawer-wide'],
    ['open-drawer-half', 'drawer-half'],
    ['open-drawer-in-container', 'drawer-in-container'],
    ['open-drawer-level1', 'drawer-level1'],
    ['open-drawer-level2', 'drawer-level2'],
    ['open-drawer-rounded', 'drawer-rounded'],
    ['open-drawer-resizable', 'drawer-resizable'],
    ['open-drawer-snap', 'drawer-snap'],
    ['open-drawer-footer', 'drawer-footer'],
    ['open-drawer-mobile', 'drawer-mobile'],
    ['open-drawer-animated', 'drawer-animated'],
    ['open-drawer-form', 'drawer-form'],
  ]

  pairs.forEach(([btnId, elId]) => {
    const btn = document.getElementById(btnId)
    const el = document.getElementById(elId)
    if (btn && el) {
      const handler = () => el.setAttribute('visible', '')
      btn.addEventListener('click', handler)
      // 兼容 ldesign-button 触发的自定义点击事件
      btn.addEventListener('ldesignClick', handler)
    }
  })

  // 初始化吸附点示例
  const snapDrawer = document.getElementById('drawer-snap')
  if (snapDrawer) {
    snapDrawer.snapPoints = [
      { value: '25%', label: '紧凑模式' },
      { value: '50%', label: '标准模式' },
      { value: '75%', label: '宽松模式' }
    ]
    snapDrawer.snapThreshold = 50
  }

  // 初始化底部按钮示例
  const footerDrawer = document.getElementById('drawer-footer')
  if (footerDrawer) {
    footerDrawer.footerButtons = [
      {
        text: '取消',
        type: 'default',
        onClick: () => footerDrawer.visible = false
      },
      {
        text: '保存',
        type: 'primary',
        onClick: async () => {
          const buttons = footerDrawer.footerButtons
          buttons[1].loading = true
          footerDrawer.footerButtons = [...buttons]
          await new Promise(resolve => setTimeout(resolve, 2000))
          buttons[1].loading = false
          footerDrawer.footerButtons = [...buttons]
          footerDrawer.visible = false
        }
      }
    ]
  }

  // 初始化表单示例
  const formDrawer = document.getElementById('drawer-form')
  if (formDrawer) {
    formDrawer.footerButtons = [
      {
        text: '重置',
        type: 'default',
        onClick: () => {
          const inputs = formDrawer.querySelectorAll('input, textarea')
          inputs.forEach(input => input.value = '')
        }
      },
      {
        text: '提交',
        type: 'primary',
        onClick: () => {
          alert('表单已提交！')
          formDrawer.visible = false
        }
      }
    ]
  }

  // 确保容器模式在运行时生效：直接设置元素属性为 HTMLElement
  const container = document.getElementById('drawer-demo-container');
  const drawerInContainer = document.getElementById('drawer-in-container');
  if (container && drawerInContainer) {
    if (window.customElements && window.customElements.whenDefined) {
      window.customElements.whenDefined('ldesign-drawer').then(() => {
        // 组件升级完成后再设置，保证被内部 Watch 到
        drawerInContainer.getContainer = container;
      });
    } else {
      drawerInContainer.getContainer = container;
    }
  }
})
</script>

## 圆角样式

通过 `rounded` 属性启用圆角，`border-radius` 属性自定义圆角大小。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-rounded">打开圆角抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-rounded" 
    drawer-title="圆角抽屉"
    rounded="true"
    border-radius="16px"
    placement="right">
    <p>这是一个带有圆角的抽屉，让界面看起来更加柔和优雅。</p>
    <p>圆角大小可以通过 border-radius 属性自定义。</p>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="圆角抽屉"
  rounded="true"
  border-radius="16px">
  <p>圆角抽屉内容</p>
</ldesign-drawer>
```

## 可调整大小

通过 `resizable` 属性启用调整大小功能，支持鼠标和触摸拖拽。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-resizable">打开可调整大小的抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-resizable" 
    drawer-title="可调整大小"
    resizable="true"
    show-resize-hint="true"
    min-size="200"
    max-size="80%"
    placement="right">
    <p>拖动抽屉边缘可以调整大小。</p>
    <p>特性：</p>
    <ul>
      <li>• 最小宽度：200px</li>
      <li>• 最大宽度：80%</li>
      <li>• 显示尺寸提示</li>
      <li>• 支持键盘快捷键：Ctrl + 方向键</li>
    </ul>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="可调整大小"
  resizable="true"
  show-resize-hint="true"
  min-size="200"
  max-size="80%">
  <p>可调整大小的内容</p>
</ldesign-drawer>
```

## 吸附点

配置吸附点，在调整大小时自动吸附到预设位置。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-snap">打开带吸附点的抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-snap" 
    drawer-title="吸附效果演示"
    resizable="true"
    placement="right">
    <p>拖动调整大小时会自动吸附到：</p>
    <ul>
      <li>• 25% - 紧凑模式</li>
      <li>• 50% - 标准模式</li>
      <li>• 75% - 宽松模式</li>
    </ul>
    <p>接近吸附点时会显示提示。</p>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="吸附效果"
  resizable="true"
  :snap-points="[
    { value: '25%', label: '紧凑模式' },
    { value: '50%', label: '标准模式' },
    { value: '75%', label: '宽松模式' }
  ]"
  snap-threshold="50">
  <p>带吸附点的内容</p>
</ldesign-drawer>

<script>
  // 配置吸附点
  const drawer = document.getElementById('drawer-snap')
  drawer.snapPoints = [
    { value: '25%', label: '紧凑模式' },
    { value: '50%', label: '标准模式' },
    { value: '75%', label: '宽松模式' }
  ]
</script>
```

## 自定义底部按钮

通过 `footerButtons` 属性配置底部操作按钮。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-footer">打开带底部按钮的抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-footer" 
    drawer-title="表单操作"
    footer-border="true">
    <div style="padding: 20px;">
      <p>这是表单内容区域</p>
      <input type="text" placeholder="输入内容" style="width: 100%; padding: 8px; margin: 10px 0;">
    </div>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="表单操作"
  footer-border="true">
  <div>表单内容</div>
</ldesign-drawer>

<script>
  const drawer = document.getElementById('drawer-footer')
  drawer.footerButtons = [
    {
      text: '取消',
      type: 'default',
      onClick: () => drawer.visible = false
    },
    {
      text: '保存',
      type: 'primary',
      onClick: async () => {
        // 设置加载状态
        drawer.footerButtons[1].loading = true
        // 模拟异步操作
        await new Promise(resolve => setTimeout(resolve, 2000))
        drawer.footerButtons[1].loading = false
        drawer.visible = false
      }
    }
  ]
</script>
```

## 移动端手势

在移动端支持滑动关闭手势。请确保页面包含正确的视口元标签：

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-mobile">打开支持手势的抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-mobile" 
    drawer-title="移动端手势"
    swipe-to-close="true"
    swipe-threshold="0.3"
    placement="right">
    <p>在移动端可以通过滑动关闭此抽屉。</p>
    <p>特性：</p>
    <ul>
      <li>• 支持触摸滑动关闭</li>
      <li>• 可配置滑动阈值</li>
      <li>• 带阻尼效果</li>
      <li>• 自动适配移动端</li>
    </ul>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="移动端手势"
  swipe-to-close="true"
  swipe-threshold="0.3"
  damping="true"
  damping-factor="0.5">
  <p>支持手势操作</p>
</ldesign-drawer>
```

## 动画配置

可以自定义动画时长和效果。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-animated">慢速动画抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-animated" 
    drawer-title="动画效果"
    animation="true"
    animation-duration="600"
    placement="right">
    <p>这个抽屉的动画时长为 600ms，比默认的 300ms 更慢。</p>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="动画效果"
  animation="true"
  animation-duration="600">
  <p>自定义动画时长</p>
</ldesign-drawer>
```

## 完整表单示例

结合多个功能的完整表单示例。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-form">打开表单抽屉</button>
  </div>

  <ldesign-drawer 
    id="drawer-form" 
    drawer-title="用户信息"
    size="500"
    rounded="true"
    resizable="true"
    footer-border="true">
    <div style="padding: 20px;">
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px;">姓名</label>
        <input type="text" placeholder="请输入姓名" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px;">邮箱</label>
        <input type="email" placeholder="请输入邮箱" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px;">描述</label>
        <textarea placeholder="请输入描述" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-height: 100px;"></textarea>
      </div>
    </div>
  </ldesign-drawer>
</div>

```html
<ldesign-drawer 
  drawer-title="用户信息"
  size="500"
  rounded="true"
  resizable="true"
  footer-border="true">
  <!-- 表单内容 -->
</ldesign-drawer>
```

## 在指定容器中打开

<style scoped>
.drawer-container-box {
  position: relative;
  width: 520px;
  height: 280px;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
</style>

通过 `getContainer` 属性可以将抽屉挂载到指定的容器元素内。建议为容器设置 `position: relative`，以便抽屉使用绝对定位正确铺满容器。

<div class="demo-container">
  <div class="drawer-container-box" id="drawer-demo-container">
    <span>容器区域（在这里打开抽屉）</span>
  </div>

  <div class="demo-row">
    <button id="open-drawer-in-container">在容器中打开抽屉</button>
  </div>

  <ldesign-drawer
    id="drawer-in-container"
    drawer-title="容器内抽屉"
    placement="right"
    get-container="#drawer-demo-container"
  >
    <p>此抽屉挂载在指定容器内，遮罩与面板均限定在容器区域内。</p>
  </ldesign-drawer>
</div>

```html
<div id="drawer-demo-container" style="position: relative; width: 520px; height: 280px; border: 1px dashed #d1d5db;"></div>

<button id="open-drawer-in-container">在容器中打开抽屉</button>

<ldesign-drawer
  id="drawer-in-container"
  drawer-title="容器内抽屉"
  get-container="#drawer-demo-container"
>
  <p>此抽屉挂载在指定容器内，遮罩与面板均限定在容器区域内。</p>
</ldesign-drawer>

<script>
  document.getElementById('open-drawer-in-container').addEventListener('click', () => {
    document.getElementById('drawer-in-container').setAttribute('visible', '')
  })
</script>
```

## 多层抽屉

多层抽屉默认按打开顺序自动叠加层级，仅栈顶抽屉响应 ESC 与遮罩点击关闭。

<div class="demo-container">
  <div class="demo-row">
    <button id="open-drawer-level1">打开一级抽屉</button>
  </div>

  <ldesign-drawer id="drawer-level1" drawer-title="一级抽屉" placement="right">
    <p>这是一级抽屉内容。</p>

    <div class="demo-row">
      <ldesign-button id="open-drawer-level2" type="primary">打开二级抽屉</ldesign-button>
    </div>
  </ldesign-drawer>

  <ldesign-drawer id="drawer-level2" drawer-title="二级抽屉" placement="right">
    <p>这是二级抽屉内容。</p>
  </ldesign-drawer>
</div>

```html
<button id="open-drawer-level1">打开一级抽屉</button>

<ldesign-drawer id="drawer-level1" drawer-title="一级抽屉">
  <p>这是一级抽屉内容。</p>
  <ldesign-button id="open-drawer-level2" type="primary">打开二级抽屉</ldesign-button>
</ldesign-drawer>

<ldesign-drawer id="drawer-level2" drawer-title="二级抽屉">
  <p>这是二级抽屉内容。</p>
</ldesign-drawer>

<script>
  document.getElementById('open-drawer-level1').addEventListener('click', () => {
    document.getElementById('drawer-level1').setAttribute('visible', '')
  })
  document.getElementById('open-drawer-level2').addEventListener('click', () => {
    document.getElementById('drawer-level2').setAttribute('visible', '')
  })
</script>
```

## 遮罩与关闭

- 通过 `mask` 控制是否显示遮罩层（默认显示）
- 通过 `maskClosable` 控制是否允许点击遮罩关闭（默认允许）
- 通过 `closeOnEsc` 控制是否允许 ESC 键关闭（默认允许）
- 通过 `closable` 控制是否显示右上角关闭按钮（默认显示）
- 通过 `swipeToClose` 控制移动端是否支持滑动关闭（默认开启）

```html
<ldesign-drawer
  title="自定义关闭行为"
  :mask="false"
  :mask-closable="false"
  :close-on-esc="false"
  :closable="false"
></ldesign-drawer>
```

## 自定义头部与底部

- 通过 `slot="header"` 自定义头部内容
- 通过 `slot="footer"` 自定义底部内容

```html
<ldesign-drawer visible>
  <div slot="header">
    <strong>自定义标题</strong>
  </div>
  <div>主体内容</div>
  <div slot="footer">
    <ldesign-button type="primary">确定</ldesign-button>
  </div>
</ldesign-drawer>
```

## 键盘快捷键

抽屉组件支持丰富的键盘操作：

| 快捷键 | 功能 |
|------|------|
| `ESC` | 关闭抽屉（closeOnEsc 为 true 时） |
| `Tab` | 在抽屉内循环切换焦点 |
| `Shift + Tab` | 反向切换焦点 |
| `Ctrl + ←/→` | 调整左右抽屉宽度（resizable 为 true 时） |
| `Ctrl + ↑/↓` | 调整上下抽屉高度（resizable 为 true 时） |
| `Ctrl + Shift + 方向键` | 快速调整大小（步长更大） |

## 事件

抽屉组件提供了丰富的事件用于监听状态变化：

- `ldesignVisibleChange`: 抽屉显示状态变化时触发
- `ldesignClose`: 调用关闭行为时触发
- `ldesignSizeChange`: 尺寸变化时触发（调整大小时）
- `ldesignResizeStart`: 开始调整大小时触发
- `ldesignResizeEnd`: 结束调整大小时触发
- `ldesignSnapToPoint`: 吸附到预设点时触发

```html
<ldesign-drawer id="drawer-events" drawer-title="事件示例"></ldesign-drawer>

<script>
  const el = document.getElementById('drawer-events')
  el.addEventListener('ldesignVisibleChange', (e) => {
    console.log('visible:', e.detail)
  })
  el.addEventListener('ldesignClose', () => {
    console.log('closed')
  })
</script>
```

## 样式变量（全局 Token）

Drawer 与 Modal / Popup 共享 Overlay 令牌，用于统一浮层体验：

- `--ld-overlay-z-index`：浮层层级（所有遮罩/浮层统一）
- `--ld-overlay-backdrop`：遮罩背景色（含透明度）
- `--ld-overlay-duration`、`--ld-overlay-ease`：遮罩与面板动效时长/缓动

系统开启“减少动态效果”时，会自动禁用相关过渡与动画（`@media (prefers-reduced-motion: reduce)`）。

示例（全局覆写）：

```css
:root {
  --ld-overlay-backdrop: rgba(0, 0, 0, 0.5);
  --ld-overlay-duration: 250ms;
  --ld-overlay-ease: cubic-bezier(.2,.8,.2,1);
}
```

更多可覆盖项与说明，参见“设计 / Tokens”文档。

## API

### 属性

#### 基础属性

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `visible` | `boolean` | `false` | 是否显示抽屉 |
| `placement` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | 抽屉出现位置 |
| `size` | `number \| string` | `360` | 面板尺寸：left/right 对应宽度，top/bottom 对应高度；数字为 px |
| `mask` | `boolean` | `true` | 是否显示遮罩层 |
| `maskClosable` | `boolean` | `true` | 点击遮罩是否关闭 |
| `closeOnEsc` | `boolean` | `true` | 是否允许 ESC 关闭 |
| `closable` | `boolean` | `true` | 是否显示右上角关闭按钮 |
| `drawerTitle` | `string` | `-` | 标题文本（可用 header 插槽自定义） |
| `zIndex` | `number` | `1000` | 层级 |
| `getContainer` | `string \| HTMLElement` | `-` | 指定挂载容器（选择器或元素） |

#### 样式属性

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `rounded` | `boolean` | `false` | 是否启用圆角样式 |
| `borderRadius` | `string` | `'12px'` | 圆角大小（CSS 值） |
| `footerBorder` | `boolean` | `true` | 是否显示底部分割线 |

#### 调整大小

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `resizable` | `boolean` | `false` | 是否可调整大小 |
| `minSize` | `number \| string` | `200` | 最小尺寸（像素或百分比） |
| `maxSize` | `number \| string` | `'80%'` | 最大尺寸（像素或百分比） |
| `showResizeHint` | `boolean` | `true` | 是否显示调整大小的尺寸提示 |

#### 吸附效果

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `snapPoints` | `SnapPoint[]` | `[]` | 吸附点配置（{ value: string/number, label?: string }） |
| `snapThreshold` | `number` | `50` | 吸附阈值（像素） |
| `damping` | `boolean` | `true` | 是否启用阻尼效果 |
| `dampingFactor` | `number` | `0.5` | 阻尼系数（0-1） |

#### 移动端支持

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `swipeToClose` | `boolean` | `true` | 是否在移动端启用手势关闭 |
| `swipeThreshold` | `number` | `0.3` | 手势关闭的阈值（百分比） |

#### 交互增强

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `keyboardNavigation` | `boolean` | `true` | 是否启用键盘导航 |
| `autoFocus` | `boolean` | `true` | 打开时自动聚焦到第一个可交互元素 |
| `animation` | `boolean` | `true` | 是否显示进入/退出动画 |
| `animationDuration` | `number` | `300` | 动画持续时间（毫秒） |
| `preserveState` | `boolean` | `false` | 关闭时是否保留状态（如尺寸） |

#### 底部按钮

| 属性名 | 类型 | 默认值 | 说明 |
|------|------|------|------|
| `footerButtons` | `DrawerButton[]` | `[]` | 自定义底部按钮配置 |

`DrawerButton` 类型定义：

```typescript
interface DrawerButton {
  text: string                                         // 按钮文本
  type?: 'primary' | 'default' | 'danger' | 'success' | 'warning'  // 按钮类型
  onClick?: () => void | Promise<void>                 // 点击事件
  disabled?: boolean                                   // 是否禁用
  loading?: boolean                                    // 是否加载中
}
```

### 事件

| 事件名 | 说明 | 回调参数 |
|------|------|------|
| `ldesignVisibleChange` | 抽屉显示状态变化 | `(visible: boolean)` |
| `ldesignClose` | 关闭时触发 | `()` |
| `ldesignSizeChange` | 尺寸变化时触发 | `({ size: number \| string, placement: DrawerPlacement })` |
| `ldesignResizeStart` | 开始调整大小时触发 | `()` |
| `ldesignResizeEnd` | 结束调整大小时触发 | `({ size: number \| string })` |
| `ldesignSnapToPoint` | 吸附到预设点时触发 | `(SnapPoint)` |

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|------|------|------|------|
| `show()` | 显示抽屉 | `emit?: boolean` | `Promise<void>` |
| `hide()` | 隐藏抽屉 | - | `Promise<void>` |
| `close()` | 关闭抽屉（触发 close 事件） | - | `Promise<void>` |

### 插槽

| 插槽名 | 说明 |
|------|------|
| 默认 | 抽屉主体内容 |
| `header` | 自定义头部内容 |
| `footer` | 自定义底部内容（优先级高于 footerButtons） |
