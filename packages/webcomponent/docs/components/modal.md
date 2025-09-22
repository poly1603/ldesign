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
