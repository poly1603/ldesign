# Modal 模态框

模态对话框，在浮层中显示内容，用于用户处理事务，不会跳转页面。

## 基础用法

最简单的模态框用法。

<div class="demo-container">
  <ldesign-button id="basic-modal-btn">打开模态框</ldesign-button>
  <ldesign-modal id="basic-modal" modal-title="基础模态框">
    <p>这是一个基础的模态框内容。</p>
    <p>你可以在这里放置任何内容。</p>
  </ldesign-modal>
</div>

<script setup>
import { onMounted, onUnmounted } from 'vue'
// 仅引入轻量级 API 模块，避免将整个 src（含 TSX）打进文档构建
import { alertModal, confirmModal, promptModal } from '../../src/components/modal/modal-api'

let eventListeners = []

// 添加事件监听器的辅助函数
function addEventListenerSafe(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler)
    eventListeners.push({ element, event, handler })
  }
}

// 清理所有事件监听器
function cleanupEventListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler)
  })
  eventListeners = []
}

onMounted(() => {
  // 清理之前的事件监听器（防止重复绑定）
  cleanupEventListeners()

  // 快捷 API 示例
  const alertBtn = document.getElementById('quick-alert-btn')
  const confirmBtn = document.getElementById('quick-confirm-btn')
  const confirmWarnBtn = document.getElementById('quick-confirm-warn-btn')
  const promptBtn = document.getElementById('quick-prompt-btn')
  const promptValidateBtn = document.getElementById('quick-prompt-validate-btn')

  if (alertBtn) {
    addEventListenerSafe(alertBtn, 'click', async () => {
      await alertModal({ title: '提示', content: '这是一个 Alert 消息。', status: 'info' })
    })
  }

  if (confirmBtn) {
    addEventListenerSafe(confirmBtn, 'click', async () => {
      const ok = await confirmModal({
        title: '确认操作',
        content: '确定要执行该操作吗？',
        status: 'info',
        okText: '确定',
        cancelText: '取消'
      })
      console.log('confirm result:', ok)
    })
  }

  if (confirmWarnBtn) {
    addEventListenerSafe(confirmWarnBtn, 'click', async () => {
      const ok = await confirmModal({
        title: '危险操作',
        content: '此操作不可恢复，是否继续？',
        status: 'warning',
        okText: '继续',
        cancelText: '取消'
      })
      console.log('confirm warning result:', ok)
    })
  }

  if (promptBtn) {
    addEventListenerSafe(promptBtn, 'click', async () => {
      const val = await promptModal({
        title: '输入名称',
        status: 'info',
        input: { placeholder: '请输入名称…', defaultValue: '' }
      })
      console.log('prompt result:', val)
    })
  }

  if (promptValidateBtn) {
    addEventListenerSafe(promptValidateBtn, 'click', async () => {
      const val = await promptModal({
        title: '输入仓库名称',
        status: 'warning',
        input: { placeholder: '例如: org/repo' },
        validate: async (v) => {
          await new Promise(r => setTimeout(r, 300))
          if (!v) return '名称不能为空'
          if (!/^[-\w]+\/[-\w]+$/.test(v)) return '格式需为 org/repo'
          return true
        }
      })
      console.log('prompt validate result:', val)
    })
  }

  // 基础用法
  const basicBtn = document.getElementById('basic-modal-btn')
  const basicModal = document.getElementById('basic-modal')

  if (basicBtn && basicModal) {
    addEventListenerSafe(basicBtn, 'click', () => {
      basicModal.visible = true
    })

    addEventListenerSafe(basicModal, 'ldesignClose', () => {
      basicModal.visible = false
    })
  }

  // 不同尺寸
  const sizeButtons = [
    { btnId: 'small-modal-btn', modalId: 'small-modal' },
    { btnId: 'medium-modal-btn', modalId: 'medium-modal' },
    { btnId: 'large-modal-btn', modalId: 'large-modal' },
    { btnId: 'full-modal-btn', modalId: 'full-modal' }
  ]

  sizeButtons.forEach(({ btnId, modalId }) => {
    const btn = document.getElementById(btnId)
    const modal = document.getElementById(modalId)

    if (btn && modal) {
      addEventListenerSafe(btn, 'click', () => {
        modal.visible = true
      })

      addEventListenerSafe(modal, 'ldesignClose', () => {
        modal.visible = false
      })
    }
  })

  // 自定义底部
  const customFooterBtn = document.getElementById('custom-footer-btn')
  const customFooterModal = document.getElementById('custom-footer-modal')

  if (customFooterBtn && customFooterModal) {
    addEventListenerSafe(customFooterBtn, 'click', () => {
      customFooterModal.visible = true
    })

    addEventListenerSafe(customFooterModal, 'ldesignClose', () => {
      customFooterModal.visible = false
    })

    // 自定义底部按钮事件
    const cancelBtn = document.getElementById('custom-cancel-btn')
    const saveBtn = document.getElementById('custom-save-btn')
    const deleteBtn = document.getElementById('custom-delete-btn')

    if (cancelBtn) {
      addEventListenerSafe(cancelBtn, 'click', () => {
        customFooterModal.visible = false
      })
    }

    if (saveBtn) {
      addEventListenerSafe(saveBtn, 'click', () => {
        alert('保存成功！')
        customFooterModal.visible = false
      })
    }

    if (deleteBtn) {
      addEventListenerSafe(deleteBtn, 'click', () => {
        if (confirm('确定要删除吗？')) {
          alert('删除成功！')
          customFooterModal.visible = false
        }
      })
    }
  }

  // 居中显示
  const centeredBtn = document.getElementById('centered-modal-btn')
  const centeredModal = document.getElementById('centered-modal')

  if (centeredBtn && centeredModal) {
    addEventListenerSafe(centeredBtn, 'click', () => {
      centeredModal.visible = true
    })

    addEventListenerSafe(centeredModal, 'ldesignClose', () => {
      centeredModal.visible = false
    })
  }

  // 无标题栏
  const noHeaderBtn = document.getElementById('no-header-btn')
  const noHeaderModal = document.getElementById('no-header-modal')
  const noHeaderOkBtn = document.getElementById('no-header-ok-btn')

  if (noHeaderBtn && noHeaderModal) {
    addEventListenerSafe(noHeaderBtn, 'click', () => {
      noHeaderModal.visible = true
    })
  }

  if (noHeaderOkBtn) {
    addEventListenerSafe(noHeaderOkBtn, 'click', () => {
      noHeaderModal.visible = false
    })
  }

  // 禁用遮罩关闭
  const noMaskCloseBtn = document.getElementById('no-mask-close-btn')
  const noMaskCloseModal = document.getElementById('no-mask-close-modal')

  if (noMaskCloseBtn && noMaskCloseModal) {
    addEventListenerSafe(noMaskCloseBtn, 'click', () => {
      noMaskCloseModal.visible = true
    })

    addEventListenerSafe(noMaskCloseModal, 'ldesignClose', () => {
      noMaskCloseModal.visible = false
    })
  }

  // 动画效果
  const animationButtons = [
    { id: 'fade-btn', modalId: 'fade-modal' },
    { id: 'zoom-btn', modalId: 'zoom-modal' },
    { id: 'zoom-origin-btn', modalId: 'zoom-origin-modal' },
    { id: 'slide-down-btn', modalId: 'slide-down-modal' },
    { id: 'slide-up-btn', modalId: 'slide-up-modal' },
    { id: 'slide-left-btn', modalId: 'slide-left-modal' },
    { id: 'slide-right-btn', modalId: 'slide-right-modal' }
  ]

  animationButtons.forEach(({ id, modalId }) => {
    const btn = document.getElementById(id)
    const modal = document.getElementById(modalId)

    if (btn && modal) {
      addEventListenerSafe(btn, 'click', () => {
        modal.visible = true
      })

      addEventListenerSafe(modal, 'ldesignClose', () => {
        modal.visible = false
      })
    }
  })

  // 最大化功能
  const maximizableBtn = document.getElementById('maximizable-btn')
  const maximizableModal = document.getElementById('maximizable-modal')

  if (maximizableBtn && maximizableModal) {
    addEventListenerSafe(maximizableBtn, 'click', () => {
      maximizableModal.visible = true
    })

    addEventListenerSafe(maximizableModal, 'ldesignClose', () => {
      maximizableModal.visible = false
    })
  }

  // 拖拽功能
  const draggableBtn = document.getElementById('draggable-btn')
  const draggableModal = document.getElementById('draggable-modal')

  if (draggableBtn && draggableModal) {
    addEventListenerSafe(draggableBtn, 'click', () => {
      draggableModal.visible = true
    })

    addEventListenerSafe(draggableModal, 'ldesignClose', () => {
      draggableModal.visible = false
    })
  }

  // 调整大小功能
  const resizableBtn = document.getElementById('resizable-btn')
  const resizableModal = document.getElementById('resizable-modal')

  if (resizableBtn && resizableModal) {
    addEventListenerSafe(resizableBtn, 'click', () => {
      resizableModal.visible = true
    })

    addEventListenerSafe(resizableModal, 'ldesignClose', () => {
      resizableModal.visible = false
    })
  }

  // 高级功能
  const advancedBtn = document.getElementById('advanced-btn')
  const advancedModal = document.getElementById('advanced-modal')

  if (advancedBtn && advancedModal) {
    addEventListenerSafe(advancedBtn, 'click', () => {
      advancedModal.visible = true
    })

    addEventListenerSafe(advancedModal, 'ldesignClose', () => {
      advancedModal.visible = false
    })
  }

  // 变体：抽屉与底部弹层
  const bindOpen = (btnId, modalId) => {
    const b = document.getElementById(btnId)
    const m = document.getElementById(modalId)
    if (b && m) addEventListenerSafe(b, 'click', () => (m.visible = true))
  }
  bindOpen('drawer-left-btn', 'drawer-left')
  bindOpen('drawer-right-btn', 'drawer-right')
  bindOpen('bottom-sheet-btn', 'bottom-sheet')
})

onUnmounted(() => {
  cleanupEventListeners()
})
</script>

```html
<ldesign-button id="basic-modal-btn">打开模态框</ldesign-button>
<ldesign-modal id="basic-modal" modal-title="基础模态框">
  <p>这是一个基础的模态框内容。</p>
  <p>你可以在这里放置任何内容。</p>
</ldesign-modal>

<script>
const btn = document.getElementById('basic-modal-btn')
const modal = document.getElementById('basic-modal')

btn.addEventListener('click', () => {
  modal.visible = true
})

modal.addEventListener('ldesignClose', () => {
  modal.visible = false
})
</script>
```

## 快捷 API：Alert / Confirm / Prompt（支持状态与校验） / PromptForm（表单）

使用内置的便捷函数，无需手动写 DOM，就能快速调用模态框。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="quick-alert-btn">Alert</ldesign-button>
    <ldesign-button id="quick-confirm-btn" type="outline">Confirm</ldesign-button>
    <ldesign-button id="quick-confirm-warn-btn" type="danger">Confirm 警告</ldesign-button>
    <ldesign-button id="quick-prompt-btn" type="primary">Prompt</ldesign-button>
    <ldesign-button id="quick-prompt-validate-btn" type="primary">Prompt 校验</ldesign-button>
  </div>
</div>

```ts
import { alertModal, confirmModal, promptModal, promptPassword, promptForm } from 'ldesign-webcomponent'

await alertModal({ title: '提示', content: '这是一个 Alert 消息。', status: 'info' })

const ok = await confirmModal({
  title: '危险操作',
  content: '此操作不可恢复，是否继续？',
  status: 'warning',
  okText: '继续',
  cancelText: '取消'
})

const value = await promptModal({
  title: '输入仓库名称',
  status: 'warning',
  input: { placeholder: '例如: org/repo' },
  validate: (v) => {
    if (!v) return '名称不能为空'
    if (!/^[-\\w]+\\/[-\\w]+$/.test(v)) return '格式需为 org/repo'
    return true
  }
})

const pwd = await promptPassword({ title: '请输入密码', content: '密码将用于确认操作' })

const form = await promptForm({
  title: '创建仓库',
  fields: [
    { name: 'org', label: '组织', required: true },
    { name: 'repo', label: '仓库名', required: true, pattern: '^[a-z0-9_-]+$' },
    { name: 'private', label: '私有仓库', type: 'checkbox', value: true },
    { name: 'desc', label: '描述', type: 'textarea', rows: 3 }
  ],
  validate: (values) => {
    if (!values.org || !values.repo) return '请填写组织与仓库名'
    return true
  }
})
```

## 进阶功能

### 异步确认与关闭拦截

- 使用 `preOk` 在点击“确定”时执行异步校验，返回 `false` 阻止关闭。
- 使用 `beforeClose(reason)` 可以拦截任意关闭来源：`'ok'|'close'|'mask'|'esc'|'api'`。

```html
<ldesign-button id="preok-btn" type="primary">异步确认</ldesign-button>
<ldesign-modal id="preok-modal" modal-title="异步确认示例">
  <p>点击“确定”后 1 秒校验通过再关闭。</p>
</ldesign-modal>

<script>
const btn = document.getElementById('preok-btn')
const modal = document.getElementById('preok-modal')
btn.addEventListener('click', () => { modal.visible = true })
modal.preOk = async () => {
  modal.okLoading = true
  await new Promise(r => setTimeout(r, 1000))
  modal.okLoading = false
  return true
}
modal.beforeClose = (reason) => {
  // 例：禁止遮罩关闭
  if (reason === 'mask') return false
  return true
}
</script>
```

### 键盘与焦点 / 向导（Wizard）

- Enter 触发确定，Esc 关闭（受 `keyboard` 控制）。
- `trapFocus` 将 Tab 焦点圈定在弹窗内；`initialFocus` 指定打开后聚焦的元素选择器。

```html
<!-- 焦点示例 -->
<ldesign-modal modal-title="焦点示例" trap-focus initial-focus="input">
  <input placeholder="打开后自动聚焦" />
</ldesign-modal>

<!-- 向导示例：通过命名插槽 step-0/step-1/... 提供分步内容 -->
<ldesign-modal id="wizard" modal-title="创建向导" wizard>
  <div slot="step-0">第一步内容</div>
  <div slot="step-1">第二步内容</div>
  <div slot="step-2">第三步内容</div>
</ldesign-modal>

<script>
const w = document.getElementById('wizard')
// 提供步骤标题（JS 赋值）
w.steps = ['基本信息', '详细设置', '完成']
// 打开
w.visible = true
</script>
```

### 尺寸与动画参数、双击标题最大化

- 通过 `min-width`、`min-height`、`max-width`、`max-height` 约束可调大小范围。
- 通过 CSS 变量自定义动画：`--ld-modal-duration`（默认 0.3s）、`--ld-modal-ease`（默认 cubic-bezier(0.4,0,0.2,1)）、`--ld-modal-anim-ease`（默认 ease）。
- 启用 `maximizable` 后，双击标题栏可在“最大化/恢复”之间切换。

```html
<ldesign-modal modal-title="边界示例" resizable min-width="360" min-height="200" max-width="1000" max-height="700" maximizable
  style="--ld-modal-duration: 220ms; --ld-modal-ease: cubic-bezier(.2,.8,.2,1);">
  <p>拖拽边缘/角落调整大小，双击标题最大化/恢复。</p>
</ldesign-modal>
```

### 自定义挂载容器与多弹层栈（可传元素或选择器）

- `get-container` 指定 CSS 选择器，把弹窗节点挂到对应容器下（默认 body）。
- 多弹层时仅栈顶响应 ESC，后开的在上。

```html
<div id="portal"></div>
<ldesign-button id="open-in-portal">在容器中打开</ldesign-button>
<ldesign-modal id="portal-modal" modal-title="容器示例" get-container="#portal">
  <p>我被挂载到 #portal 容器下。</p>
</ldesign-modal>

<script>
  const btn = document.getElementById('open-in-portal')
  const m = document.getElementById('portal-modal')
  btn.addEventListener('click', () => m.visible = true)
</script>
```

## 样式变量（全局 Token）

Modal / Drawer / Popup 共享一组 Overlay 令牌；Modal 还提供专属令牌以便统一定制：

- Overlay：`--ld-overlay-z-index`、`--ld-overlay-backdrop`、`--ld-overlay-duration`、`--ld-overlay-ease`
- Modal：`--ld-modal-radius`、`--ld-modal-shadow`、`--ld-modal-title-font-size`、`--ld-modal-title-line-height`、`--ld-modal-header-padding`、`--ld-modal-body-padding`、`--ld-modal-footer-padding`、`--ld-modal-footer-bottom`、`--ld-modal-action-gap`、`--ld-modal-btn-gap`、`--ld-modal-body-font-size`、`--ld-modal-body-line-height`、`--ld-modal-duration`、`--ld-modal-ease`、`--ld-modal-anim-ease`、`--ld-modal-width-small|medium|large`、`--ld-modal-screen-padding`

示例：

```css
:root {
  /* 覆盖全局遮罩与动效 */
  --ld-overlay-backdrop: rgba(0,0,0,0.5);
  --ld-overlay-duration: 250ms;
  --ld-overlay-ease: cubic-bezier(.2,.8,.2,1);

  /* 调整 Modal 观感 */
  --ld-modal-radius: 10px;
  --ld-modal-title-font-size: 18px;
  --ld-modal-action-gap: 10px;
}
@media (max-width: 600px) {
  :root {
    --ld-modal-radius: 12px;
    --ld-modal-duration: 220ms;
  }
}
```

辅助特性：若系统启用了“减少动态效果”，组件会自动禁用过渡与动画（`@media (prefers-reduced-motion: reduce)`）。

## 变体：抽屉与底部弹层

### 移动端/平板自动切换

- 新增：`open-on-edge-swipe` 与 `edge-swipe-width`，在 destroy-on-close=false 时，允许在屏幕边缘滑动直接打开抽屉。

通过 `variant-at` 与 `breakpoints` 指定不同屏宽下的变体。例如：小屏 bottom-sheet，中屏 drawer，桌面 modal。

```html
<ldesign-modal
  id="responsive"
  modal-title="响应式变体"
  variant="modal"
  variant-at='{ "xs": "bottom-sheet", "sm": "drawer-right", "md": "drawer-right", "lg": "modal" }'
  breakpoints='{ "xs": 480, "sm": 768, "md": 1024, "lg": 1280 }'
  animation="slide-up"
>
  <p style="padding:12px 16px">不同屏宽自动切换展示形态。</p>
</ldesign-modal>
```

> 注：底部弹层已不支持通过拖拽改变高度。若需不同高度，请通过 `height` 属性或自定义样式设置。

### 软键盘避让

#### 移动端 Token（可覆盖的 CSS 变量）

- 尺寸与间距
  - `--ld-modal-radius`：圆角（默认桌面 8px，移动 12px）
  - `--ld-modal-header-padding` / `--ld-modal-body-padding` / `--ld-modal-footer-padding`
  - `--ld-modal-footer-bottom`：底部安全区 padding，最终 `padding-bottom: max(env(safe-area-inset-bottom), var(--ld-modal-footer-bottom))`
  - `--ld-modal-action-gap`：头部/底部按钮间距
- 字号与行高
  - `--ld-modal-title-font-size`
  - `--ld-modal-body-font-size` / `--ld-modal-body-line-height`
  - 预设：`--ld-modal-text-sm|md|lg`（14px/15px/17px）
- 动画
  - `--ld-modal-duration`、`--ld-modal-ease`、`--ld-modal-anim-ease`

默认在 `@media (max-width: 768px)` 下启用移动端预设，可按需在页面中覆盖。

快捷 API 在小屏幕（≤768px）下默认以 bottom‑sheet 形式展示，不支持拖拽改变高度。

默认开启 `avoid-keyboard`，在移动端键盘弹出时 bottom-sheet 会自动抬高，避免被遮挡。

- 通过 `variant` 切换不同展示形态：`'modal' | 'drawer-left' | 'drawer-right' | 'bottom-sheet'`
- 建议配合 `animation` 使用：
  - drawer-left -> `slide-right`，drawer-right -> `slide-left`
  - bottom-sheet -> `slide-up`（不支持拖拽改变高度）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="drawer-left-btn">左侧抽屉</ldesign-button>
    <ldesign-button id="drawer-right-btn">右侧抽屉</ldesign-button>
    <ldesign-button id="bottom-sheet-btn">底部弹层</ldesign-button>
  </div>
  <ldesign-modal id="drawer-left" modal-title="左侧抽屉" variant="drawer-left" animation="slide-right">
    <p style="padding: 12px 16px">抽屉内容。</p>
  </ldesign-modal>
  <ldesign-modal id="drawer-right" modal-title="右侧抽屉" variant="drawer-right" animation="slide-left">
    <p style="padding: 12px 16px">抽屉内容。</p>
  </ldesign-modal>
  <ldesign-modal id="bottom-sheet" modal-title="底部弹层" variant="bottom-sheet" animation="slide-up">
    <p style="padding: 12px 16px">底部弹层内容。</p>
  </ldesign-modal>
</div>


## 不同尺寸

提供了四种尺寸：`small`、`medium`、`large`、`full`。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-button id="small-modal-btn">小尺寸</ldesign-button>
    <ldesign-button id="medium-modal-btn">中尺寸</ldesign-button>
    <ldesign-button id="large-modal-btn">大尺寸</ldesign-button>
    <ldesign-button id="full-modal-btn">全屏</ldesign-button>
  </div>
  
  <ldesign-modal id="small-modal" modal-title="小尺寸模态框" size="small">
    <p>这是一个小尺寸的模态框。</p>
  </ldesign-modal>
  
  <ldesign-modal id="medium-modal" modal-title="中尺寸模态框" size="medium">
    <p>这是一个中尺寸的模态框（默认）。</p>
  </ldesign-modal>
  
  <ldesign-modal id="large-modal" modal-title="大尺寸模态框" size="large">
    <p>这是一个大尺寸的模态框。</p>
  </ldesign-modal>
  
  <ldesign-modal id="full-modal" modal-title="全屏模态框" size="full">
    <p>这是一个全屏的模态框。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal size="small" modal-title="小尺寸模态框">
  <p>这是一个小尺寸的模态框。</p>
</ldesign-modal>

<ldesign-modal size="medium" modal-title="中尺寸模态框">
  <p>这是一个中尺寸的模态框（默认）。</p>
</ldesign-modal>

<ldesign-modal size="large" modal-title="大尺寸模态框">
  <p>这是一个大尺寸的模态框。</p>
</ldesign-modal>

<ldesign-modal size="full" modal-title="全屏模态框">
  <p>这是一个全屏的模态框。</p>
</ldesign-modal>
```

## 自定义底部

通过 `footer` 插槽可以自定义底部内容。

<div class="demo-container">
  <ldesign-button id="custom-footer-btn">自定义底部</ldesign-button>
  <ldesign-modal id="custom-footer-modal" modal-title="自定义底部">
    <p>这是模态框的内容。</p>
    <div slot="footer">
      <ldesign-button type="outline" id="custom-cancel-btn">取消</ldesign-button>
      <ldesign-button type="primary" id="custom-save-btn">保存</ldesign-button>
      <ldesign-button type="danger" id="custom-delete-btn">删除</ldesign-button>
    </div>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="自定义底部">
  <p>这是模态框的内容。</p>
  <div slot="footer">
    <ldesign-button type="outline">取消</ldesign-button>
    <ldesign-button type="primary">保存</ldesign-button>
    <ldesign-button type="danger">删除</ldesign-button>
  </div>
</ldesign-modal>
```

## 居中显示

通过 `centered` 属性可以让模态框垂直居中显示。

<div class="demo-container">
  <ldesign-button id="centered-modal-btn">居中显示</ldesign-button>
  <ldesign-modal id="centered-modal" modal-title="居中模态框" centered>
    <p>这是一个垂直居中的模态框。</p>
    <p>无论内容多少，都会在屏幕中央显示。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="居中模态框" centered>
  <p>这是一个垂直居中的模态框。</p>
  <p>无论内容多少，都会在屏幕中央显示。</p>
</ldesign-modal>
```

## 无标题栏

不设置 `modal-title` 且 `closable` 为 `false` 时，不显示标题栏。

<div class="demo-container">
  <ldesign-button id="no-header-btn">无标题栏</ldesign-button>
  <ldesign-modal id="no-header-modal" closable="false">
    <div style="padding: 20px; text-align: center;">
      <ldesign-icon name="check-circle" size="large" color="#10b981" style="margin-bottom: 16px;"></ldesign-icon>
      <h3 style="margin: 0 0 8px 0;">操作成功</h3>
      <p style="margin: 0 0 20px 0; color: #6b7280;">您的操作已经成功完成。</p>
      <ldesign-button type="primary" id="no-header-ok-btn">确定</ldesign-button>
    </div>
  </ldesign-modal>
</div>

```html
<ldesign-modal closable="false">
  <div style="padding: 20px; text-align: center;">
    <ldesign-icon name="check-circle" size="large" color="#10b981"></ldesign-icon>
    <h3>操作成功</h3>
    <p>您的操作已经成功完成。</p>
    <ldesign-button type="primary">确定</ldesign-button>
  </div>
</ldesign-modal>
```

## 禁用遮罩关闭

通过 `mask-closable` 属性控制点击遮罩是否关闭模态框。

<div class="demo-container">
  <ldesign-button id="no-mask-close-btn">禁用遮罩关闭</ldesign-button>
  <ldesign-modal id="no-mask-close-modal" modal-title="禁用遮罩关闭" mask-closable="false">
    <p>点击遮罩层不会关闭这个模态框。</p>
    <p>只能通过关闭按钮或底部按钮关闭。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="禁用遮罩关闭" mask-closable="false">
  <p>点击遮罩层不会关闭这个模态框。</p>
  <p>只能通过关闭按钮或底部按钮关闭。</p>
</ldesign-modal>
```

## 动画效果

Modal 支持多种动画效果，通过 `animation` 属性设置。

<div class="demo-container">
  <ldesign-button id="fade-btn">淡入淡出</ldesign-button>
  <ldesign-button id="zoom-btn">缩放动画</ldesign-button>
  <ldesign-button id="zoom-origin-btn">从点击点展开</ldesign-button>
  <ldesign-button id="slide-down-btn">向下滑动</ldesign-button>
  <ldesign-button id="slide-up-btn">向上滑动</ldesign-button>
  <ldesign-button id="slide-left-btn">向左滑动</ldesign-button>
  <ldesign-button id="slide-right-btn">向右滑动</ldesign-button>

  <ldesign-modal id="fade-modal" modal-title="淡入淡出效果" animation="fade">
    <p>这是淡入淡出动画效果。</p>
  </ldesign-modal>

  <ldesign-modal id="zoom-modal" modal-title="缩放动画效果" animation="zoom">
    <p>这是缩放动画效果（默认）。</p>
  </ldesign-modal>

  <ldesign-modal id="zoom-origin-modal" modal-title="从点击点展开/缩回" animation="zoom-origin" centered>
    <p>点击不同位置打开/关闭，观察动画从最近的点击点放大/缩回。</p>
  </ldesign-modal>

  <ldesign-modal id="slide-down-modal" modal-title="向下滑动效果" animation="slide-down">
    <p>这是向下滑动动画效果。</p>
  </ldesign-modal>

  <ldesign-modal id="slide-up-modal" modal-title="向上滑动效果" animation="slide-up">
    <p>这是向上滑动动画效果。</p>
  </ldesign-modal>

  <ldesign-modal id="slide-left-modal" modal-title="向左滑动效果" animation="slide-left">
    <p>这是向左滑动动画效果。</p>
  </ldesign-modal>

  <ldesign-modal id="slide-right-modal" modal-title="向右滑动效果" animation="slide-right">
    <p>这是向右滑动动画效果。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="淡入淡出效果" animation="fade">
  <p>这是淡入淡出动画效果。</p>
</ldesign-modal>

<ldesign-modal modal-title="缩放动画效果" animation="zoom">
  <p>这是缩放动画效果（默认）。</p>
</ldesign-modal>

<ldesign-modal modal-title="向下滑动效果" animation="slide-down">
  <p>这是向下滑动动画效果。</p>
</ldesign-modal>

<ldesign-modal modal-title="向上滑动效果" animation="slide-up">
  <p>这是向上滑动动画效果。</p>
</ldesign-modal>

<ldesign-modal modal-title="向左滑动效果" animation="slide-left">
  <p>这是向左滑动动画效果。</p>
</ldesign-modal>

<ldesign-modal modal-title="向右滑动效果" animation="slide-right">
  <p>这是向右滑动动画效果。</p>
</ldesign-modal>
```

## 最大化功能

通过 `maximizable` 属性启用最大化功能，用户可以点击最大化按钮将模态框全屏显示。

<div class="demo-container">
  <ldesign-button id="maximizable-btn">可最大化模态框</ldesign-button>
  <ldesign-modal id="maximizable-modal" modal-title="可最大化模态框" maximizable>
    <p>这个模态框支持最大化功能。</p>
    <p>点击标题栏右侧的最大化按钮可以全屏显示。</p>
    <p>再次点击可以恢复原始大小。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="可最大化模态框" maximizable>
  <p>这个模态框支持最大化功能。</p>
  <p>点击标题栏右侧的最大化按钮可以全屏显示。</p>
  <p>再次点击可以恢复原始大小。</p>
</ldesign-modal>
```

## 拖拽功能

通过 `is-draggable` 属性启用拖拽功能，用户可以通过拖拽标题栏来移动模态框位置。

<div class="demo-container">
  <ldesign-button id="draggable-btn">可拖拽模态框</ldesign-button>
  <ldesign-modal id="draggable-modal" modal-title="可拖拽模态框" is-draggable>
    <p>这个模态框支持拖拽功能。</p>
    <p>你可以通过拖拽标题栏来移动模态框的位置。</p>
    <p>拖拽时鼠标会变成移动图标。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="可拖拽模态框" is-draggable>
  <p>这个模态框支持拖拽功能。</p>
  <p>你可以通过拖拽标题栏来移动模态框的位置。</p>
  <p>拖拽时鼠标会变成移动图标。</p>
</ldesign-modal>
```

## 调整大小功能

通过 `resizable` 属性启用调整大小功能，用户可以通过拖拽边缘和角落来调整模态框大小。

<div class="demo-container">
  <ldesign-button id="resizable-btn">可调整大小模态框</ldesign-button>
  <ldesign-modal id="resizable-modal" modal-title="可调整大小模态框" resizable>
    <p>这个模态框支持调整大小功能。</p>
    <p>你可以通过拖拽模态框的边缘和角落来调整大小。</p>
    <p>鼠标悬停在边缘时会显示调整大小的光标。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal modal-title="可调整大小模态框" resizable>
  <p>这个模态框支持调整大小功能。</p>
  <p>你可以通过拖拽模态框的边缘和角落来调整大小。</p>
  <p>鼠标悬停在边缘时会显示调整大小的光标。</p>
</ldesign-modal>
```

## 综合功能

可以同时启用多种功能，创建功能丰富的模态框。

<div class="demo-container">
  <ldesign-button id="advanced-btn">高级功能模态框</ldesign-button>
  <ldesign-modal id="advanced-modal" modal-title="高级功能模态框" maximizable is-draggable resizable animation="slide-down">
    <p>这个模态框同时支持：</p>
    <ul>
      <li>最大化和恢复功能</li>
      <li>拖拽移动位置</li>
      <li>调整大小</li>
      <li>自定义动画效果</li>
    </ul>
    <p>你可以尝试各种交互操作。</p>
  </ldesign-modal>
</div>

```html
<ldesign-modal
  modal-title="高级功能模态框"
  maximizable
  is-draggable
  resizable
  animation="slide-down"
>
  <p>这个模态框同时支持：</p>
  <ul>
    <li>最大化和恢复功能</li>
    <li>拖拽移动位置</li>
    <li>调整大小</li>
    <li>自定义动画效果</li>
  </ul>
  <p>你可以尝试各种交互操作。</p>
</ldesign-modal>
```

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示模态框 |
| `modal-title` | `string` | - | 模态框标题 |
| `size` | `'small' \| 'medium' \| 'large' \| 'full'` | `'medium'` | 模态框尺寸 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `mask` | `boolean` | `true` | 是否显示遮罩层 |
| `mask-closable` | `boolean` | `true` | 点击遮罩层是否关闭 |
| `keyboard` | `boolean` | `true` | 按ESC键是否关闭 |
| `centered` | `boolean` | `false` | 是否居中显示 |
| `is-draggable` | `boolean` | `false` | 是否可拖拽 |
| `resizable` | `boolean` | `false` | 是否可调整大小 |
| `width` | `number \| string` | - | 自定义宽度 |
| `height` | `number \| string` | - | 自定义高度 |
| `top` | `number \| string` | - | 距离顶部的距离 |
| `z-index` | `number` | `1000` | z-index |
| `destroy-on-close` | `boolean` | `false` | 是否销毁子元素 |
| `animation` | `'fade' \| 'zoom' \| 'zoom-origin' \| 'slide-down' \| 'slide-up' \| 'slide-left' \| 'slide-right'` | `'zoom'` | 动画效果类型（`zoom-origin` 将从最近一次点击点作为起始点，非 modal 变体会回退为 `zoom`） |
| `maximizable` | `boolean` | `false` | 是否可最大化 |

### 事件

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignVisibleChange` | 显示状态变化时触发 | `(visible: boolean)` |
| `ldesignClose` | 关闭时触发 | - |
| `ldesignOk` | 点击确定按钮时触发 | - |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `default` | 模态框内容 |
| `footer` | 底部内容 |

### 方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| `show()` | 显示模态框 | - |
| `hide()` | 隐藏模态框 | - |
| `close()` | 关闭模态框 | - |
| `maximize()` | 最大化模态框 | - |
| `restore()` | 恢复模态框 | - |
| `toggleMaximize()` | 切换最大化状态 | - |

## 设计指南

### 何时使用

- 需要用户处理事务，又不希望跳转页面以致打断工作流程时
- 需要在当前任务流中插入临时任务，创建或预览新内容时

### 最佳实践

1. **合理使用**：避免过度使用模态框，不要在模态框中再打开模态框
2. **明确目的**：模态框应该有明确的目的和操作结果
3. **提供关闭方式**：始终提供明确的关闭方式
4. **响应式设计**：确保在不同设备上都有良好的体验

### 无障碍

- 支持键盘导航（ESC关闭、Tab切换）
- 提供适当的 ARIA 属性
- 支持屏幕阅读器
- 模态框打开时焦点管理
