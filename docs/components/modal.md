# Modal 模态框

功能丰富的模态框组件，支持多种主题、动画效果、拖拽、调整大小等高级功能。

## 基本用法

<div class="demo-block">
  <ldesign-button id="basic-modal-btn" type="primary">打开基础模态框</ldesign-button>
  <ldesign-modal id="basic-modal" modal-title="基础模态框" centered>
    <p>这是一个基础的模态框内容。</p>
  </ldesign-modal>
  <script>
    document.getElementById('basic-modal-btn')?.addEventListener('click', () => {
      document.getElementById('basic-modal')?.show()
    })
  </script>
</div>

```html
<ldesign-button id="basic-modal-btn" type="primary">打开基础模态框</ldesign-button>
<ldesign-modal id="basic-modal" modal-title="基础模态框" centered>
  <p>这是一个基础的模态框内容。</p>
</ldesign-modal>
```

## 主题样式

Modal 组件提供了多种预设主题，满足不同场景需求。

<div class="demo-block">
  <div class="demo-row">
    <ldesign-button id="theme-light-btn">浅色主题</ldesign-button>
    <ldesign-button id="theme-dark-btn">深色主题</ldesign-button>
    <ldesign-button id="theme-glass-btn">玻璃态</ldesign-button>
    <ldesign-button id="theme-gradient-btn">渐变主题</ldesign-button>
    <ldesign-button id="theme-neumorphism-btn">新拟态</ldesign-button>
  </div>
  
  <ldesign-modal id="theme-light" modal-title="浅色主题" theme="light" centered>
    <p>默认的浅色主题模态框</p>
  </ldesign-modal>
  
  <ldesign-modal id="theme-dark" modal-title="深色主题" theme="dark" centered>
    <p>深色主题，适合夜间模式</p>
  </ldesign-modal>
  
  <ldesign-modal id="theme-glass" modal-title="玻璃态效果" theme="glass" blur-background="true" centered>
    <p>毛玻璃效果，背景模糊半透明</p>
  </ldesign-modal>
  
  <ldesign-modal id="theme-gradient" modal-title="渐变主题" theme="gradient" centered>
    <p>使用渐变背景的模态框</p>
  </ldesign-modal>
  
  <ldesign-modal id="theme-neumorphism" modal-title="新拟态" theme="neumorphism" centered>
    <p>新拟态风格，柔和的阴影效果</p>
  </ldesign-modal>
  
  <script>
    ['light', 'dark', 'glass', 'gradient', 'neumorphism'].forEach(theme => {
      document.getElementById(`theme-${theme}-btn`)?.addEventListener('click', () => {
        document.getElementById(`theme-${theme}`)?.show()
      })
    })
  </script>
</div>

## 动画效果

支持多种动画效果，让模态框的出现和消失更加生动。

<div class="demo-block">
  <div class="demo-row">
    <ldesign-button id="anim-fade-btn" size="small">淡入淡出</ldesign-button>
    <ldesign-button id="anim-zoom-btn" size="small">缩放</ldesign-button>
    <ldesign-button id="anim-slide-btn" size="small">滑动</ldesign-button>
    <ldesign-button id="anim-bounce-btn" size="small">弹跳</ldesign-button>
    <ldesign-button id="anim-rotate-btn" size="small">旋转</ldesign-button>
    <ldesign-button id="anim-blur-btn" size="small">模糊</ldesign-button>
    <ldesign-button id="anim-origin-btn" size="small">从点击处展开</ldesign-button>
  </div>
  
  <ldesign-modal id="anim-fade" modal-title="淡入淡出" animation="fade" centered>
    <p>最简单的淡入淡出效果</p>
  </ldesign-modal>
  
  <ldesign-modal id="anim-zoom" modal-title="缩放动画" animation="zoom" centered>
    <p>从中心点缩放进入</p>
  </ldesign-modal>
  
  <ldesign-modal id="anim-slide" modal-title="滑动效果" animation="slide-down" centered>
    <p>从上方滑入</p>
  </ldesign-modal>
  
  <ldesign-modal id="anim-bounce" modal-title="弹跳动画" animation="bounce" centered>
    <p>富有弹性的进入效果</p>
  </ldesign-modal>
  
  <ldesign-modal id="anim-rotate" modal-title="旋转动画" animation="rotate" centered>
    <p>旋转进入的效果</p>
  </ldesign-modal>
  
  <ldesign-modal id="anim-blur" modal-title="模糊效果" animation="blur" centered>
    <p>模糊渐入效果</p>
  </ldesign-modal>
  
  <ldesign-modal id="anim-origin" modal-title="从点击处展开" animation="zoom-origin" centered>
    <p>从点击位置展开的效果，点击不同位置试试看</p>
  </ldesign-modal>
  
  <script>
    const anims = ['fade', 'zoom', 'slide', 'bounce', 'rotate', 'blur', 'origin'];
    anims.forEach(anim => {
      document.getElementById(`anim-${anim}-btn`)?.addEventListener('click', () => {
        document.getElementById(`anim-${anim}`)?.show()
      })
    })
  </script>
</div>

## 交互功能

### 拖拽和调整大小

<div class="demo-block">
  <ldesign-button id="draggable-btn" type="primary">可拖拽模态框</ldesign-button>
  <ldesign-button id="resizable-btn" type="primary">可调整大小</ldesign-button>
  <ldesign-button id="both-btn" type="primary">拖拽+调整大小</ldesign-button>
  
  <ldesign-modal id="draggable-modal" modal-title="可拖拽" is-draggable="true">
    <p>拖拽标题栏可以移动这个模态框</p>
  </ldesign-modal>
  
  <ldesign-modal id="resizable-modal" modal-title="可调整大小" resizable="true" centered>
    <p>拖拽边缘或角落可以调整大小</p>
  </ldesign-modal>
  
  <ldesign-modal id="both-modal" modal-title="完整交互" is-draggable="true" resizable="true" maximizable="true">
    <p>这个模态框支持：</p>
    <ul>
      <li>拖拽移动（拖拽标题栏）</li>
      <li>调整大小（拖拽边缘）</li>
      <li>最大化（点击最大化按钮或双击标题栏）</li>
    </ul>
  </ldesign-modal>
  
  <script>
    ['draggable', 'resizable', 'both'].forEach(type => {
      document.getElementById(`${type}-btn`)?.addEventListener('click', () => {
        document.getElementById(`${type}-modal`)?.show()
      })
    })
  </script>
</div>

## 变体类型

除了标准模态框，还支持抽屉和底部弹层变体。

<div class="demo-block">
  <div class="demo-row">
    <ldesign-button id="drawer-left-btn">左侧抽屉</ldesign-button>
    <ldesign-button id="drawer-right-btn">右侧抽屉</ldesign-button>
    <ldesign-button id="bottom-sheet-btn">底部弹层</ldesign-button>
  </div>
  
  <ldesign-modal 
    id="drawer-left" 
    modal-title="左侧抽屉" 
    variant="drawer-left"
    drawer-swipe-to-close="true">
    <p>从左侧滑出的抽屉，支持滑动关闭</p>
    <p>向左滑动可以关闭抽屉</p>
  </ldesign-modal>
  
  <ldesign-modal 
    id="drawer-right" 
    modal-title="右侧抽屉" 
    variant="drawer-right"
    drawer-swipe-to-close="true">
    <p>从右侧滑出的抽屉</p>
    <p>向右滑动可以关闭抽屉</p>
  </ldesign-modal>
  
  <ldesign-modal 
    id="bottom-sheet" 
    modal-title="底部弹层" 
    variant="bottom-sheet"
    avoid-keyboard="true">
    <p>从底部弹出的面板</p>
    <p>在移动端会自动避让软键盘</p>
    <input type="text" placeholder="输入框会避让软键盘" style="width: 100%; padding: 8px; margin-top: 10px;" />
  </ldesign-modal>
  
  <script>
    ['drawer-left', 'drawer-right', 'bottom-sheet'].forEach(variant => {
      document.getElementById(`${variant}-btn`)?.addEventListener('click', () => {
        document.getElementById(variant)?.show()
      })
    })
  </script>
</div>

## 向导模式

使用向导模式创建分步操作流程。

<div class="demo-block">
  <ldesign-button id="wizard-btn" type="primary">打开向导</ldesign-button>
  
  <ldesign-modal 
    id="wizard-modal" 
    modal-title="设置向导" 
    wizard="true"
    centered
    size="large">
    <div slot="step-0">
      <h3>步骤 1：基本信息</h3>
      <p>请填写基本信息</p>
      <input type="text" placeholder="姓名" style="width: 100%; padding: 8px; margin: 10px 0;" />
      <input type="email" placeholder="邮箱" style="width: 100%; padding: 8px; margin: 10px 0;" />
    </div>
    <div slot="step-1">
      <h3>步骤 2：选择计划</h3>
      <p>选择适合您的计划</p>
      <label style="display: block; margin: 10px 0;">
        <input type="radio" name="plan" /> 基础版
      </label>
      <label style="display: block; margin: 10px 0;">
        <input type="radio" name="plan" /> 专业版
      </label>
      <label style="display: block; margin: 10px 0;">
        <input type="radio" name="plan" /> 企业版
      </label>
    </div>
    <div slot="step-2">
      <h3>步骤 3：确认信息</h3>
      <p>请确认您的选择</p>
      <p>设置完成后，您可以随时在设置中修改这些选项。</p>
    </div>
  </ldesign-modal>
  
  <script>
    const wizardModal = document.getElementById('wizard-modal');
    if (wizardModal) {
      wizardModal.steps = ['基本信息', '选择计划', '确认信息'];
      document.getElementById('wizard-btn')?.addEventListener('click', () => {
        wizardModal.show();
      });
    }
  </script>
</div>

## 尺寸

提供多种预设尺寸，也支持自定义宽高。

<div class="demo-block">
  <div class="demo-row">
    <ldesign-button id="size-small-btn" size="small">小尺寸</ldesign-button>
    <ldesign-button id="size-medium-btn" size="small">中等尺寸</ldesign-button>
    <ldesign-button id="size-large-btn" size="small">大尺寸</ldesign-button>
    <ldesign-button id="size-full-btn" size="small">全屏</ldesign-button>
    <ldesign-button id="size-auto-btn" size="small">自适应</ldesign-button>
  </div>
  
  <ldesign-modal id="size-small" modal-title="小尺寸" size="small" centered>
    <p>小尺寸模态框，宽度 400px</p>
  </ldesign-modal>
  
  <ldesign-modal id="size-medium" modal-title="中等尺寸" size="medium" centered>
    <p>中等尺寸模态框，宽度 600px</p>
  </ldesign-modal>
  
  <ldesign-modal id="size-large" modal-title="大尺寸" size="large" centered>
    <p>大尺寸模态框，宽度 800px</p>
  </ldesign-modal>
  
  <ldesign-modal id="size-full" modal-title="全屏模态框" size="full">
    <p>铺满整个屏幕的模态框</p>
  </ldesign-modal>
  
  <ldesign-modal id="size-auto" modal-title="自适应尺寸" size="auto" centered>
    <p>根据内容自动调整宽度的模态框</p>
    <p>最小宽度 400px，最大不超过屏幕宽度</p>
  </ldesign-modal>
  
  <script>
    ['small', 'medium', 'large', 'full', 'auto'].forEach(size => {
      document.getElementById(`size-${size}-btn`)?.addEventListener('click', () => {
        document.getElementById(`size-${size}`)?.show()
      })
    })
  </script>
</div>

## API

### 属性 Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| visible | 是否显示 | `boolean` | `false` |
| modal-title | 标题 | `string` | - |
| size | 尺寸 | `'small' \| 'medium' \| 'large' \| 'full' \| 'auto'` | `'medium'` |
| animation | 动画效果 | `ModalAnimation` | `'zoom'` |
| theme | 主题样式 | `'light' \| 'dark' \| 'glass' \| 'gradient' \| 'neumorphism'` | `'light'` |
| variant | 变体类型 | `'modal' \| 'drawer-left' \| 'drawer-right' \| 'bottom-sheet'` | `'modal'` |
| centered | 是否居中显示 | `boolean` | `false` |
| closable | 是否显示关闭按钮 | `boolean` | `true` |
| mask | 是否显示遮罩层 | `boolean` | `true` |
| mask-closable | 点击遮罩层是否关闭 | `boolean` | `true` |
| keyboard | 按ESC键是否关闭 | `boolean` | `true` |
| is-draggable | 是否可拖拽 | `boolean` | `false` |
| resizable | 是否可调整大小 | `boolean` | `false` |
| maximizable | 是否可最大化 | `boolean` | `false` |
| width | 自定义宽度 | `number \| string` | - |
| height | 自定义高度 | `number \| string` | - |
| top | 距离顶部的距离 | `number \| string` | - |
| z-index | 层级 | `number` | `1000` |
| destroy-on-close | 关闭时是否销毁子元素 | `boolean` | `false` |
| wizard | 向导模式 | `boolean` | `false` |
| steps | 向导步骤标题 | `string[]` | - |
| current-step | 当前步骤 | `number` | `0` |
| loading | 加载状态 | `boolean` | `false` |
| loading-text | 加载文字 | `string` | `'加载中...'` |
| show-progress | 显示进度指示器 | `boolean` | `false` |
| progress | 当前进度(0-100) | `number` | `0` |

### 动画类型 ModalAnimation

支持以下动画效果：
- `fade` - 淡入淡出
- `zoom` - 缩放
- `slide-down` - 从上滑入
- `slide-up` - 从下滑入
- `slide-left` - 从左滑入
- `slide-right` - 从右滑入
- `zoom-origin` - 从点击位置缩放
- `elastic` - 弹性效果
- `wobble` - 摇摆效果
- `flip` - 翻转效果
- `bounce` - 弹跳效果
- `rotate` - 旋转效果
- `blur` - 模糊效果

### 更多属性

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| ok-text | 确认按钮文字 | `string` | `'确定'` |
| cancel-text | 取消按钮文字 | `string` | `'取消'` |
| ok-type | 确认按钮类型 | `ButtonType` | `'primary'` |
| cancel-type | 取消按钮类型 | `ButtonType` | `'secondary'` |
| ok-loading | 确认按钮加载状态 | `boolean` | `false` |
| ok-disabled | 确认按钮禁用状态 | `boolean` | `false` |
| dark-mode | 深色模式 | `boolean` | `false` |
| auto-detect-dark-mode | 自动检测深色模式 | `boolean` | `true` |
| blur-background | 模糊背景 | `boolean` | `false` |
| blur-amount | 模糊程度 | `number` | `10` |
| show-header-divider | 显示头部分割线 | `boolean` | `true` |
| show-footer-divider | 显示底部分割线 | `boolean` | `true` |
| show-shadow | 显示阴影 | `boolean` | `true` |
| custom-class | 自定义类名 | `string` | - |
| footer-align | 底部按钮对齐 | `'left' \| 'center' \| 'right' \| 'space-between'` | `'right'` |
| drawer-swipe-to-close | 抽屉滑动关闭 | `boolean` | `true` |
| avoid-keyboard | 软键盘避让 | `boolean` | `true` |
| enable-gestures | 启用手势操作 | `boolean` | `true` |

### 事件 Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldesignVisibleChange | 显示状态变化 | `(visible: boolean)` |
| ldesignClose | 关闭时触发 | `()` |
| ldesignOk | 确认时触发 | `()` |
| ldesignStepChange | 步骤变化(向导模式) | `(step: number)` |

### 方法 Methods

| 方法名 | 说明 | 参数 |
|--------|------|------|
| show() | 显示模态框 | - |
| hide() | 隐藏模态框 | - |
| close() | 关闭模态框 | - |
| maximize() | 最大化 | - |
| restore() | 恢复 | - |
| toggleMaximize() | 切换最大化 | - |

### 插槽 Slots

| 插槽名 | 说明 |
|--------|------|
| default | 默认内容 |
| footer | 自定义底部 |
| close-icon | 关闭图标 |
| maximize-icon | 最大化图标 |
| step-{n} | 向导步骤内容 |

## 主题定制

可通过 CSS 变量定制样式：

```css
.ldesign-modal {
  --modal-bg: #ffffff;
  --modal-border: #e5e7eb;
  --modal-text: #1f2937;
  --modal-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.2);
  --modal-radius: 12px;
  --modal-backdrop-blur: blur(5px);
  --ld-modal-duration: 300ms;
  --ld-modal-ease: cubic-bezier(0.25, 0.8, 0.25, 1);
}
```

## 无障碍性

Modal 组件遵循 WAI-ARIA 规范：
- 使用 `role="dialog"` 和 `aria-modal="true"`
- 支持键盘导航（Tab、Shift+Tab、ESC）
- 焦点管理和焦点圈定
- 适当的 ARIA 标签和描述

## 手势操作

在移动端支持以下手势：
- **双指缩放**：缩小到80%以下自动关闭
- **边缘滑动**：抽屉类型支持从边缘滑动打开和关闭
- **拖拽关闭**：底部弹层支持向下拖拽关闭

## 注意事项

1. 使用 `destroy-on-close` 时，关闭后会销毁内部元素状态
2. 拖拽和调整大小功能在移动端有专门的触摸优化
3. 深色模式会自动检测系统设置，也可手动控制
4. 模态框堆叠时会自动管理层级和焦点
5. `zoom-origin` 动画仅在 `modal` 变体下有效，抽屉和底部弹层会自动回退到 `zoom`

<style>
.demo-block {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 20px;
}
.demo-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>