# Drawer 抽屉

抽屉组件是一个从屏幕边缘滑出的面板，常用于显示导航菜单、表单、详情信息等内容。支持多方向滑出、尺寸调整、动画效果、移动端手势等丰富功能。

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

  // 绑定四个方向的按钮
  const openLeftDrawerBtn = document.getElementById('openLeftDrawerBtn')
  const openRightDrawerBtn = document.getElementById('openRightDrawerBtn')
  const openTopDrawerBtn = document.getElementById('openTopDrawerBtn')
  const openBottomDrawerBtn = document.getElementById('openBottomDrawerBtn')

  addEventListenerSafe(openLeftDrawerBtn, 'click', () => {
    const drawer = document.getElementById('leftDrawer')
    if (drawer) drawer.visible = true
  })

  addEventListenerSafe(openRightDrawerBtn, 'click', () => {
    const drawer = document.getElementById('rightDrawer')
    if (drawer) drawer.visible = true
  })

  addEventListenerSafe(openTopDrawerBtn, 'click', () => {
    const drawer = document.getElementById('topDrawer')
    if (drawer) drawer.visible = true
  })

  addEventListenerSafe(openBottomDrawerBtn, 'click', () => {
    const drawer = document.getElementById('bottomDrawer')
    if (drawer) drawer.visible = true
  })

  // 绑定所有带有 open-drawer-btn 类的按钮
  document.querySelectorAll('.open-drawer-btn').forEach(btn => {
    addEventListenerSafe(btn, 'click', () => {
      const drawerId = btn.getAttribute('data-drawer')
      if (drawerId) {
        const drawer = document.getElementById(drawerId)
        if (drawer) {
          drawer.visible = true
        }
      }
    })
  })

  // 绑定锚点定位按钮
  const anchorBtn = document.getElementById('anchorBtn')
  addEventListenerSafe(anchorBtn, 'click', () => {
    const drawer = document.getElementById('anchorDrawer')
    if (drawer) drawer.visible = true
  })

  const cursorAnchorBtn = document.getElementById('cursorAnchorBtn')
  addEventListenerSafe(cursorAnchorBtn, 'contextmenu', (e) => {
    e.preventDefault()
    const drawer = document.getElementById('cursorDrawer')
    if (drawer) drawer.visible = true
  })

  // 绑定锚点部分遮罩按钮（使用 setTimeout 确保元素已加载）
  setTimeout(() => {
    const anchorPartialBtn1 = document.getElementById('anchorPartialBtn1')
    const anchorPartialBtn2 = document.getElementById('anchorPartialBtn2')
    const anchorPartialBtn3 = document.getElementById('anchorPartialBtn3')
    const anchorPartialBtn4 = document.getElementById('anchorPartialBtn4')

    console.log('Anchor partial buttons:', {
      btn1: anchorPartialBtn1,
      btn2: anchorPartialBtn2,
      btn3: anchorPartialBtn3,
      btn4: anchorPartialBtn4
    })

    addEventListenerSafe(anchorPartialBtn1, 'click', function() {
      console.log('Button 1 clicked!')
      const drawer = document.getElementById('anchorPartialDrawerBottom')
      console.log('Drawer bottom:', drawer)
      if (drawer) {
        drawer.anchorElement = this
        drawer.open()
      }
    })

    addEventListenerSafe(anchorPartialBtn2, 'click', function() {
      console.log('Button 2 clicked!')
      const drawer = document.getElementById('anchorPartialDrawerTop')
      console.log('Drawer top:', drawer)
      if (drawer) {
        drawer.anchorElement = this
        drawer.open()
      }
    })

    addEventListenerSafe(anchorPartialBtn3, 'click', function() {
      console.log('Button 3 clicked!')
      const drawer = document.getElementById('anchorPartialDrawerLeft')
      console.log('Drawer left:', drawer)
      if (drawer) {
        drawer.anchorElement = this
        drawer.open()
      }
    })

    addEventListenerSafe(anchorPartialBtn4, 'click', function() {
      console.log('Button 4 clicked!')
      const drawer = document.getElementById('anchorPartialDrawerRight')
      console.log('Drawer right:', drawer)
      if (drawer) {
        drawer.anchorElement = this
        drawer.open()
      }
    })
  }, 500)

  // 加载示例
  const loadDataBtn = document.getElementById('loadDataBtn')
  const loadDataHandler = async function() {
    const loadingDrawer = document.getElementById('loadingDrawer')
    const content = document.getElementById('drawerContent')
    const btn = this
    
    // 禁用按钮
    btn.disabled = true
    btn.textContent = '加载中...'
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 更新内容
    content.innerHTML = '<div style="padding: 20px;"><p style="color: #52c41a;">✓ 数据加载成功！</p><p>这是加载完成后的内容。</p><button id="loadDataBtn" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">重新加载</button></div>'
    
    // 重新绑定事件
    const newBtn = document.getElementById('loadDataBtn')
    if (newBtn) {
      addEventListenerSafe(newBtn, 'click', loadDataHandler)
    }
  }
  addEventListenerSafe(loadDataBtn, 'click', loadDataHandler)

  // 详情按钮
  const showUserDetailBtn = document.getElementById('showUserDetailBtn')
  addEventListenerSafe(showUserDetailBtn, 'click', () => {
    const drawer = document.getElementById('detailDrawer')
    if (drawer) drawer.visible = true
  })

  // 表单按钮
  const formCancelBtn = document.getElementById('formCancelBtn')
  const formSubmitBtn = document.getElementById('formSubmitBtn')
  
  if (formCancelBtn) {
    // 将 cancelUserForm 函数暴露到 window
    window.cancelUserForm = () => {
      const form = document.getElementById('userForm')
      const drawer = document.getElementById('userFormDrawer')
      if (form && drawer) {
        if (confirm('确定取消？表单数据将丢失。')) {
          form.reset()
          drawer.visible = false
        }
      }
    }
  }
  
  if (formSubmitBtn) {
    // 将 submitUserForm 函数暴露到 window
    window.submitUserForm = () => {
      const form = document.getElementById('userForm')
      const drawer = document.getElementById('userFormDrawer')
      if (form && drawer) {
        if (form.checkValidity()) {
          const formData = new FormData(form)
          console.log('表单数据：', Object.fromEntries(formData))
          alert('用户创建成功！')
          drawer.visible = false
          form.reset()
        } else {
          form.reportValidity()
        }
      }
    }
  }

  // 设置面板按钮
  const resetSettingsBtn = document.getElementById('resetSettingsBtn')
  const cancelSettingsBtn = document.getElementById('cancelSettingsBtn')
  const saveSettingsBtn = document.getElementById('saveSettingsBtn')
  
  addEventListenerSafe(resetSettingsBtn, 'click', () => {
    alert('重置成功')
  })
  
  addEventListenerSafe(cancelSettingsBtn, 'click', () => {
    const drawer = document.getElementById('settingsDrawer')
    if (drawer) drawer.visible = false
  })
  
  addEventListenerSafe(saveSettingsBtn, 'click', () => {
    alert('保存成功')
    const drawer = document.getElementById('settingsDrawer')
    if (drawer) drawer.visible = false
  })

  // 监听所有抽屉的关闭事件
  document.querySelectorAll('ldesign-drawer').forEach(drawer => {
    addEventListenerSafe(drawer, 'drawerClose', (e) => {
      console.log(`抽屉 ${drawer.id} 已关闭，原因：`, e.detail?.reason)
    })
    
    addEventListenerSafe(drawer, 'drawerOpen', () => {
      console.log(`抽屉 ${drawer.id} 已打开`)
      
      // 处理焦点捕获抽屉的自动聚焦
      if (drawer.id === 'focusTrapDrawer') {
        setTimeout(() => {
          const input = drawer.querySelector('#focusInput1')
          if (input) {
            input.focus()
            console.log('自动聚焦到输入框')
          }
        }, 100)
      }
    })
  })
})

onUnmounted(() => {
  cleanupEventListeners()
})
</script>

## 核心特性

- 🎯 **多方向支持** - 从上、下、左、右四个方向滑出
- 📏 **灵活尺寸** - 预设尺寸（xs/sm/md/lg/xl）、自定义像素值或百分比
- 🎨 **丰富动画** - 多种动画效果和自定义动画时长
- 🎭 **主题定制** - 支持亮色/暗色主题及完整的 CSS 变量定制
- ♿ **无障碍支持** - 完整的键盘导航、焦点管理和 ARIA 属性
- 📱 **移动端优化** - 触摸手势、滑动关闭、响应式设计
- 🎪 **锚点定位** - 支持相对于触发元素或光标位置定位
- 🔧 **可调整大小** - 拖拽调整尺寸，支持吸附点
- ⚡ **性能优化** - GPU 加速、懒加载、虚拟滚动等性能优化

## 基础用法

### 简单示例

最简单的抽屉，通过设置 `visible` 属性控制显示/隐藏。

```html
<!-- HTML -->
<button id="openDrawerBtn">打开抽屉</button>

<ldesign-drawer 
  id="basicDrawer"
  drawer-title="基础抽屉"
  placement="right"
  visible="false">
  <div style="padding: 20px;">
    <p>这是抽屉的内容。</p>
    <p>您可以在这里放置任何内容，比如表单、列表、详情信息等。</p>
  </div>
</ldesign-drawer>
```

```javascript
// JavaScript
const openBtn = document.getElementById('openDrawerBtn');
const drawer = document.getElementById('basicDrawer');

openBtn.addEventListener('click', () => {
  drawer.visible = true;
  // 或者使用 API 方法
  // drawer.open();
});

// 监听打开事件
drawer.addEventListener('drawerOpen', () => {
  console.log('抽屉已打开');
});

// 监听关闭事件
drawer.addEventListener('drawerClose', (e) => {
  console.log('抽屉已关闭，原因：', e.detail.reason);
});
```

### 四个方向

抽屉可以从屏幕的四个方向滑出，通过 `placement` 属性控制。

<div class="demo-container">
  <div class="demo-row">
    <button id="openLeftDrawerBtn">从左侧打开</button>
    <button id="openRightDrawerBtn">从右侧打开</button>
    <button id="openTopDrawerBtn">从顶部打开</button>
    <button id="openBottomDrawerBtn">从底部打开</button>
  </div>
</div>

```html
<!-- 左侧抽屉 -->
<ldesign-drawer 
  id="leftDrawer"
  placement="left" 
  drawer-title="左侧抽屉">
  <p>从左侧滑出的抽屉，适合用于导航菜单。</p>
</ldesign-drawer>

<!-- 右侧抽屉（默认） -->
<ldesign-drawer 
  id="rightDrawer"
  placement="right" 
  drawer-title="右侧抽屉">
  <p>从右侧滑出的抽屉，适合用于设置面板、详情信息。</p>
</ldesign-drawer>

<!-- 顶部抽屉 -->
<ldesign-drawer 
  id="topDrawer"
  placement="top" 
  drawer-title="顶部抽屉">
  <p>从顶部滑出的抽屉，适合用于通知、消息面板。</p>
</ldesign-drawer>

<!-- 底部抽屉 -->
<ldesign-drawer 
  id="bottomDrawer"
  placement="bottom" 
  drawer-title="底部抽屉">
  <p>从底部滑出的抽屉，适合用于操作面板、选项卡。</p>
</ldesign-drawer>
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="leftDrawer" placement="left" drawer-title="左侧抽屉" animation="true">
  <div style="padding: 20px;">
    <p>从左侧滑出的抽屉，适合用于导航菜单。</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="rightDrawer" placement="right" drawer-title="右侧抽屉" animation="true">
  <div style="padding: 20px;">
    <p>从右侧滑出的抽屉，适合用于设置面板、详情信息。</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="topDrawer" placement="top" drawer-title="顶部抽屉" animation="true">
  <div style="padding: 20px;">
    <p>从顶部滑出的抽屉，适合用于通知、消息面板。</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="bottomDrawer" placement="bottom" drawer-title="底部抽屉" animation="true">
  <div style="padding: 20px;">
    <p>从底部滑出的抽屉，适合用于操作面板、选项卡。</p>
  </div>
</ldesign-drawer>

```


### 尺寸配置

支持预设尺寸、像素值、百分比等多种尺寸设置方式。

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">预设尺寸：</span>
    <button class="open-drawer-btn" data-drawer="xsDrawer">XS (200px)</button>
    <button class="open-drawer-btn" data-drawer="smDrawer">SM (300px)</button>
    <button class="open-drawer-btn" data-drawer="mdDrawer">MD (400px)</button>
    <button class="open-drawer-btn" data-drawer="lgDrawer">LG (600px)</button>
    <button class="open-drawer-btn" data-drawer="xlDrawer">XL (800px)</button>
  </div>
  <div class="demo-row">
    <span class="demo-label">自定义：</span>
    <button class="open-drawer-btn" data-drawer="customPxDrawer">固定宽度 500px</button>
    <button class="open-drawer-btn" data-drawer="customPercentDrawer">百分比 60%</button>
    <button class="open-drawer-btn" data-drawer="fullscreenDrawer">全屏模式</button>
  </div>
</div>

```html
<!-- 预设尺寸 -->
<ldesign-drawer id="xsDrawer" size="xs" drawer-title="XS 尺寸">200px 宽度</ldesign-drawer>
<ldesign-drawer id="smDrawer" size="sm" drawer-title="SM 尺寸">300px 宽度</ldesign-drawer>
<ldesign-drawer id="mdDrawer" size="md" drawer-title="MD 尺寸">默认 400px 宽度</ldesign-drawer>
<ldesign-drawer id="lgDrawer" size="lg" drawer-title="LG 尺寸">600px 宽度</ldesign-drawer>
<ldesign-drawer id="xlDrawer" size="xl" drawer-title="XL 尺寸">800px 宽度</ldesign-drawer>

<!-- 自定义尺寸 -->
<ldesign-drawer id="customPxDrawer" size="500px" drawer-title="自定义像素">
  固定 500px 宽度
</ldesign-drawer>

<ldesign-drawer id="customPercentDrawer" size="60%" drawer-title="自定义百分比">
  占屏幕 60% 宽度
</ldesign-drawer>

<!-- 全屏模式 -->
<ldesign-drawer id="fullscreenDrawer" fullscreen="true" drawer-title="全屏模式">
  全屏显示，适合于复杂表单或详细内容
</ldesign-drawer>
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="xsDrawer" size="xs" drawer-title="XS 尺寸" animation="true">
  <div style="padding: 20px;">200px 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="smDrawer" size="sm" drawer-title="SM 尺寸" animation="true">
  <div style="padding: 20px;">300px 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="mdDrawer" size="md" drawer-title="MD 尺寸" animation="true">
  <div style="padding: 20px;">默认 400px 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="lgDrawer" size="lg" drawer-title="LG 尺寸" animation="true">
  <div style="padding: 20px;">600px 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="xlDrawer" size="xl" drawer-title="XL 尺寸" animation="true">
  <div style="padding: 20px;">800px 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="customPxDrawer" size="500px" drawer-title="自定义像素" animation="true">
  <div style="padding: 20px;">固定 500px 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="customPercentDrawer" size="60%" drawer-title="自定义百分比" animation="true">
  <div style="padding: 20px;">占屏幕 60% 宽度</div>
</ldesign-drawer>

<ldesign-drawer id="fullscreenDrawer" fullscreen="true" drawer-title="全屏模式" animation="true">
  <div style="padding: 20px;">全屏显示，适合于复杂表单或详细内容</div>
</ldesign-drawer>

## 高级功能

### 动画效果

抽屉支持多种动画配置，可以自定义动画时长和缓动函数。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="defaultAnimation">默认动画 (300ms)</button>
    <button class="open-drawer-btn" data-drawer="noAnimation">禁用动画</button>
    <button class="open-drawer-btn" data-drawer="fastAnimation">快速动画 (150ms)</button>
    <button class="open-drawer-btn" data-drawer="slowAnimation">缓慢动画 (600ms)</button>
    <button class="open-drawer-btn" data-drawer="easingAnimation">缓动函数</button>
  </div>
</div>

```html
<!-- 默认动画，300ms -->
<ldesign-drawer 
  id="defaultAnimation"
  drawer-title="默认动画"
  animation="true">
  默认动画效果，300ms
</ldesign-drawer>

<!-- 禁用动画 -->
<ldesign-drawer 
  id="noAnimation"
  drawer-title="禁用动画"
  animation="false">
  立即显示，无动画效果
</ldesign-drawer>

<!-- 快速动画 -->
<ldesign-drawer 
  id="fastAnimation"
  drawer-title="快速动画"
  animation-duration="150">
  150ms 快速动画
</ldesign-drawer>

<!-- 缓慢动画 -->
<ldesign-drawer 
  id="slowAnimation"
  drawer-title="缓慢动画"
  animation-duration="600">
  600ms 缓慢动画
</ldesign-drawer>

<!-- 自定义缓动函数 -->
<ldesign-drawer 
  id="easingAnimation"
  drawer-title="缓动动画"
  animation-duration="400"
  animation-easing="ease-out">
  ease-out 缓动效果
</ldesign-drawer>
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="defaultAnimation" drawer-title="默认动画" animation="true">
  <div style="padding: 20px;">默认动画效果，300ms</div>
</ldesign-drawer>

<ldesign-drawer id="noAnimation" drawer-title="禁用动画" animation="false">
  <div style="padding: 20px;">立即显示，无动画效果</div>
</ldesign-drawer>

<ldesign-drawer id="fastAnimation" drawer-title="快速动画" animation-duration="150">
  <div style="padding: 20px;">150ms 快速动画</div>
</ldesign-drawer>

<ldesign-drawer id="slowAnimation" drawer-title="缓慢动画" animation-duration="600">
  <div style="padding: 20px;">600ms 缓慢动画</div>
</ldesign-drawer>

<ldesign-drawer id="easingAnimation" drawer-title="缓动动画" animation-duration="400" animation-easing="ease-out">
  <div style="padding: 20px;">ease-out 缓动效果</div>
</ldesign-drawer>

### 遮罩层配置

控制遮罩层的显社和交互行为。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="maskDrawer">带遮罩，可点击关闭</button>
    <button class="open-drawer-btn" data-drawer="noMaskCloseDrawer">带遮罩，不可点击关闭</button>
    <button class="open-drawer-btn" data-drawer="noMaskDrawer">无遮罩</button>
  </div>
</div>

```html
<!-- 默认：显示遮罩，点击关闭 -->
<ldesign-drawer 
  id="maskDrawer"
  drawer-title="带遮罩抽屉"
  mask="true" 
  mask-closable="true">
  点击遮罩可以关闭抽屉
</ldesign-drawer>

<!-- 点击遮罩不关闭 -->
<ldesign-drawer 
  id="noMaskCloseDrawer"
  drawer-title="点击遮罩不关闭"
  mask="true" 
  mask-closable="false">
  点击遮罩不会关闭，需要点击关闭按钮
</ldesign-drawer>

<!-- 不显示遮罩 -->
<ldesign-drawer 
  id="noMaskDrawer"
  drawer-title="无遮罩抽屉"
  mask="false">
  不显示遮罩层
</ldesign-drawer>
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="maskDrawer" drawer-title="带遮罩抽屉" mask="true" mask-closable="true" animation="true">
  <div style="padding: 20px;">点击遮罩可以关闭抽屉</div>
</ldesign-drawer>

<ldesign-drawer id="noMaskCloseDrawer" drawer-title="点击遮罩不关闭" mask="true" mask-closable="false" animation="true">
  <div style="padding: 20px;">点击遮罩不会关闭，需要点击关闭按钮</div>
</ldesign-drawer>

<ldesign-drawer id="noMaskDrawer" drawer-title="无遮罩抽屉" mask="false" animation="true">
  <div style="padding: 20px;">不显示遮罩层</div>
</ldesign-drawer>

### 键盘交互

支持 ESC 键关闭、焦点管理等键盘交互功能。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="escDrawer">ESC 键关闭</button>
    <button class="open-drawer-btn" data-drawer="focusTrapDrawer">焦点捕获</button>
    <button class="open-drawer-btn" data-drawer="restoreFocusDrawer">恢复焦点</button>
  </div>
</div>

```html
<!-- ESC 键关闭 -->
<ldesign-drawer 
  id="escDrawer"
  drawer-title="ESC 键关闭"
  close-on-esc="true">
  按 ESC 键可以关闭抽屉
</ldesign-drawer>

<!-- 焦点捕获 -->
<ldesign-drawer 
  id="focusTrapDrawer"
  drawer-title="焦点捕获"
  focus-trap="true"
  auto-focus="true">
  <form>
    <input type="text" placeholder="自动获取焦点">
    <input type="text" placeholder="Tab 切换焦点">
    <button type="submit">提交</button>
  </form>
</ldesign-drawer>

<!-- 恢复焦点 -->
<ldesign-drawer 
  id="restoreFocusDrawer"
  drawer-title="恢复焦点"
  restore-focus="true">
  关闭后恢复之前的焦点
</ldesign-drawer>
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="escDrawer" drawer-title="ESC 键关闭" close-on-esc="true" animation="true">
  <div style="padding: 20px;">
    <p>按 ESC 键可以关闭抽屉</p>
    <p style="color: #666; font-size: 14px;">提示：打开后按 ESC 键试试</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="focusTrapDrawer" drawer-title="焦点捕获" focus-trap="true" auto-focus="true" animation="true">
  <form style="padding: 20px;">
    <div style="margin-bottom: 16px;">
      <input id="focusInput1" type="text" placeholder="自动获取焦点" style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 16px;">
      <input type="text" placeholder="Tab 切换焦点" style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
    </div>
    <button type="submit" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">提交</button>
  </form>
</ldesign-drawer>

<ldesign-drawer id="restoreFocusDrawer" drawer-title="恢复焦点" restore-focus="true" animation="true">
  <div style="padding: 20px;">关闭后恢复之前的焦点</div>
</ldesign-drawer>

### 头部配置

自定义头部内容和样式。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="subtitleDrawer">带副标题</button>
    <button class="open-drawer-btn" data-drawer="iconDrawer">带图标</button>
    <button class="open-drawer-btn" data-drawer="backDrawer">带返回按钮</button>
    <button class="open-drawer-btn" data-drawer="customHeaderDrawer">自定义头部</button>
    <button class="open-drawer-btn" data-drawer="stickyHeaderDrawer">头部吸顶</button>
  </div>
</div>

```html
<!-- 带副标题 -->
<ldesign-drawer 
  id="subtitleDrawer"
  drawer-title="主标题"
  subtitle="这是一个副标题说明">
  内容区域
</ldesign-drawer>

<!-- 带图标 -->
<ldesign-drawer 
  id="iconDrawer"
  drawer-title="设置"
  icon="⚙️">
  带图标的头部
</ldesign-drawer>

<!-- 带返回按钮 -->
<ldesign-drawer 
  id="backDrawer"
  drawer-title="详情页面"
  show-back="true">
  显示返回按钮
</ldesign-drawer>

<!-- 自定义头部内容 -->
<ldesign-drawer id="customHeaderDrawer">
  <div slot="header">
    <h2 style="margin: 0; color: #1890ff;">完全自定义头部</h2>
    <p style="margin: 5px 0 0 0; color: #666;">自定义的头部内容</p>
  </div>
  <div slot="extra">
    <button>自定义按钮</button>
  </div>
  内容区域
</ldesign-drawer>

<!-- 头部吸顶 -->
<ldesign-drawer 
  id="stickyHeaderDrawer"
  drawer-title="吸顶头部"
  header-sticky="true">
  <div style="height: 2000px;">
    长内容，头部会吸顶
  </div>
</ldesign-drawer>
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="subtitleDrawer" drawer-title="主标题" subtitle="这是一个副标题说明" animation="true">
  <div style="padding: 20px;">内容区域</div>
</ldesign-drawer>

<ldesign-drawer id="iconDrawer" drawer-title="设置" icon="⚙️" animation="true">
  <div style="padding: 20px;">带图标的头部</div>
</ldesign-drawer>

<ldesign-drawer id="backDrawer" drawer-title="详情页面" show-back="true" animation="true">
  <div style="padding: 20px;">显示返回按钮</div>
</ldesign-drawer>

<ldesign-drawer id="customHeaderDrawer" drawer-title="自定义头部" animation="true">
  <div slot="header" style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
    <h2 style="margin: 0; font-size: 24px; font-weight: 600;">完全自定义头部</h2>
    <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">自定义的头部内容，支持渐变背景、自定义样式</p>
  </div>
  <div slot="extra">
    <button style="padding: 8px 16px; border: 1px solid #667eea; background: white; color: #667eea; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.3s;" onmouseover="this.style.background='#667eea'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#667eea'">操作</button>
  </div>
  <div style="padding: 20px;">
    <p>内容区域</p>
    <p style="color: #666;">这里展示了如何创建一个美观的自定义头部。</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="stickyHeaderDrawer" drawer-title="吸顶头部" header-sticky="true" animation="true">
  <div style="padding: 20px; height: 2000px;">
    <p>长内容，头部会吸顶</p>
    <p style="margin-top: 1000px;">滚动看看头部是否吸顶</p>
  </div>
</ldesign-drawer>

### 底部按钮

配置底部按钮以及对齐方式。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="footerDrawer">底部按钮</button>
  </div>
</div>

```html
<ldesign-drawer 
  id="footerDrawer"
  drawer-title="带底部按钮">
  <div>表单内容</div>
  <div slot="footer">
    <button onclick="document.getElementById('footerDrawer').close()">取消</button>
    <button style="margin-left: 10px;" onclick="alert('保存成功')">确定</button>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
// 通过 JavaScript 配置底部按钮
const drawer = document.getElementById('footerDrawer');
drawer.footerButtons = [
  {
    text: '取消',
    type: 'default',
    onClick: () => drawer.close()
  },
  {
    text: '确定',
    type: 'primary',
    onClick: async () => {
      // 执行保存操作
      console.log('保存...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      drawer.close();
    }
  }
];

// 设置对齐方式
drawer.footerAlign = 'right'; // 'left' | 'center' | 'right' | 'space-between'
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="footerDrawer" drawer-title="带底部按钮" animation="true">
  <div style="padding: 20px;">
    <p>表单内容</p>
    <p>这是一个带有底部按钮的抽屉示例</p>
  </div>
  <div slot="footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 16px;">
    <button onclick="document.getElementById('footerDrawer').visible = false" style="padding: 8px 16px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer;">取消</button>
    <button onclick="alert('保存成功'); document.getElementById('footerDrawer').visible = false" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">确定</button>
  </div>
</ldesign-drawer>

### 可调整大小

支持拖拽调整抽屉大小，设置最小/最大尺寸。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="resizableDrawer">可调整大小</button>
    <button class="open-drawer-btn" data-drawer="snapDrawer">带吸附点</button>
  </div>
</div>

```html
<!-- 基础可调整大小 -->
<ldesign-drawer 
  id="resizableDrawer"
  drawer-title="可调整大小"
  resizable="true"
  min-size="200px"
  max-size="800px">
  拖动边缘可以调整大小
</ldesign-drawer>

<!-- 带吸附点 -->
<ldesign-drawer 
  id="snapDrawer"
  drawer-title="吸附调整"
  resizable="true"
  snap-threshold="30"
  show-size-hint="true">
  拖动时会吸附到预设大小
</ldesign-drawer>
```

```javascript path=null start=null
// 设置吸附点
const snapDrawer = document.getElementById('snapDrawer');
snapDrawer.snapPoints = [
  { value: 300, label: '小' },
  { value: 500, label: '中' },
  { value: 700, label: '大' }
];

// 监听尺寸变化
snapDrawer.addEventListener('drawerResize', (e) => {
  console.log('新尺寸：', e.detail);
});
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="resizableDrawer" drawer-title="可调整大小" resizable="true" min-size="200px" max-size="800px" animation="true">
  <div style="padding: 20px;">
    <p>拖动边缘可以调整大小</p>
    <p style="color: #666; font-size: 14px;">提示：鼠标移到抽屉边缘会出现调整光标</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="snapDrawer" drawer-title="吸附调整" resizable="true" snap-threshold="30" show-size-hint="true" animation="true">
  <div style="padding: 20px;">拖动时会吸附到预设大小</div>
</ldesign-drawer>

### 移动端支持

移动端优化，支持滑动关闭和触摸手势。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="swipeDrawer">滑动关闭</button>
    <button class="open-drawer-btn" data-drawer="mobileFullscreenDrawer">移动端全屏</button>
    <button class="open-drawer-btn" data-drawer="swipeTriggerDrawer">指定滑动区域</button>
  </div>
</div>

```html
<!-- 滑动关闭 -->
<ldesign-drawer 
  id="swipeDrawer"
  drawer-title="滑动关闭"
  placement="bottom"
  swipe-to-close="true"
  swipe-threshold="0.3">
  向下滑动可以关闭抽屉
</ldesign-drawer>

<!-- 移动端全屏 -->
<ldesign-drawer 
  id="mobileFullscreenDrawer"
  drawer-title="移动端全屏"
  fullscreen="true"
  swipe-to-close="true">
  移动设备上全屏显示
</ldesign-drawer>

<!-- 指定滑动区域 -->
<ldesign-drawer 
  id="swipeTriggerDrawer"
  drawer-title="指定滑动区域"
  swipe-to-close="true"
  swipe-trigger-area="edge">
  只有从边缘滑动才能关闭
</ldesign-drawer>
```

```javascript path=null start=null
// 监听滑动进度
const swipeDrawer = document.getElementById('swipeDrawer');
swipeDrawer.addEventListener('drawerSwipe', (e) => {
  const progress = e.detail.progress;
  console.log(`滑动进度: ${(progress * 100).toFixed(0)}%`);
});
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="swipeDrawer" drawer-title="滑动关闭" placement="bottom" swipe-to-close="true" swipe-threshold="0.3" animation="true">
  <div style="padding: 20px;">
    <p>向下滑动可以关闭抽屉</p>
    <p style="color: #666; font-size: 14px;">提示：在移动设备上向下滑动试试</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="mobileFullscreenDrawer" drawer-title="移动端全屏" fullscreen="true" swipe-to-close="true" animation="true">
  <div style="padding: 20px;">
    <p>移动设备上全屏显示，完全铺满整个屏幕</p>
    <p style="color: #666; font-size: 14px;">提示：全屏模式下无圆角、无边距，完全对齐屏幕边缘</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="swipeTriggerDrawer" drawer-title="指定滑动区域" swipe-to-close="true" swipe-trigger-area="edge" animation="true">
  <div style="padding: 20px;">
    <p>只有从边缘滑动才能关闭</p>
    <p style="color: #999; font-size: 13px; margin-top: 10px;">提示：请在抽屉边缘 20px 内滑动</p>
  </div>
</ldesign-drawer>

<!-- 移动端实际应用示例的抽屉 -->
<ldesign-drawer id="mobileBottomDrawer" drawer-title="选项列表" placement="bottom" swipe-to-close="true" swipe-trigger-area="anywhere" swipe-threshold="0.3" animation="true">
  <div style="padding: 20px;">
    <p>在任何位置滑动都可以关闭</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="mobileRightDrawer" drawer-title="详情查看" placement="right" swipe-to-close="true" swipe-trigger-area="header" swipe-threshold="0.3" animation="true">
  <div>
    <p style="padding: 20px;">只有在头部区域滑动才能关闭，内容区可以滚动</p>
    <div style="height: 1000px; background: linear-gradient(to bottom, #f0f0f0, #ffffff); padding: 20px;">
      <h4>长内容区域</h4>
      <p>这里是可滚动的内容区域</p>
      <p>向下滚动查看更多...</p>
    </div>
  </div>
</ldesign-drawer>

<ldesign-drawer id="mobileLeftDrawer" drawer-title="导航菜单" placement="left" swipe-to-close="true" swipe-trigger-area="edge" swipe-threshold="0.25" animation="true">
  <nav style="padding-top: 10px;">
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 14px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">🏠 首页</li>
      <li style="padding: 14px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">💻 产品</li>
      <li style="padding: 14px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">🛠️ 服务</li>
      <li style="padding: 14px 20px; border-bottom: 1px solid #f0f0f0; cursor: pointer;">ℹ️ 关于</li>
    </ul>
  </nav>
</ldesign-drawer>

<ldesign-drawer id="mobileOptimizedDrawer" drawer-title="实际应用示例" placement="bottom" swipe-to-close="true" animation="true">
  <div style="padding: 20px;">
    <h4 style="margin-top: 0; color: #333;">移动端优化特性：</h4>
    <ul style="line-height: 1.8; color: #555;">
      <li>✅ 自动限制尺寸，不超出屏幕</li>
      <li>✅ 支持安全区域（齐屏适配）</li>
      <li>✅ 流畅的滑动关闭动画</li>
      <li>✅ 触摸优化，无点击延迟</li>
      <li>✅ GPU 加速，动画更平滑</li>
    </ul>
    <p style="margin-top: 20px; color: #999; font-size: 14px;">提示：在移动设备上测试效果更佳！</p>
  </div>
</ldesign-drawer>

### 锚点定位

支持相对于特定元素或光标位置弹出抽屉。

<div class="demo-container">
  <div class="demo-row">
    <button id="anchorBtn">相对元素定位</button>
    <button id="cursorAnchorBtn">光标定位（右键菜单）</button>
  </div>
</div>

```html
<!-- 相对于元素定位 -->
<button id="anchorBtn">点击打开</button>

<ldesign-drawer 
  id="anchorDrawer"
  drawer-title="锚点定位"
  anchor-mode="element"
  anchor-element="#anchorBtn"
  placement="bottom"
  anchor-align="start"
  size="300px">
  从按钮下方弹出
</ldesign-drawer>

<!-- 相对于光标定位 -->
<ldesign-drawer 
  id="cursorDrawer"
  drawer-title="光标定位"
  anchor-mode="cursor"
  placement="right"
  size="350px">
  从点击位置弹出
</ldesign-drawer>
```

```javascript path=null start=null
// 绑定按钮事件
document.getElementById('anchorBtn').addEventListener('click', () => {
  document.getElementById('anchorDrawer').open();
});

// 右键菜单示例
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const cursorDrawer = document.getElementById('cursorDrawer');
  cursorDrawer.open();
});
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="anchorDrawer" drawer-title="锚点定位" placement="right" size="300px" animation="true">
  <div style="padding: 20px;">
    <p>相对于按钮元素定位</p>
    <p style="color: #666; font-size: 14px;">注：锚点定位功能需要组件支持</p>
  </div>
</ldesign-drawer>

<ldesign-drawer id="cursorDrawer" drawer-title="光标定位" placement="right" size="350px" animation="true">
  <div style="padding: 20px;">
    <p>从点击位置弹出（右键菜单示例）</p>
    <p style="color: #666; font-size: 14px;">注：光标定位功能需要组件支持</p>
  </div>
</ldesign-drawer>

### 锚点定位 - 部分遮罩展开

这是一个高级的锚点定位功能，抽屉会从触发按钮的位置向指定方向展开，**只在展开方向显示遮罩**，未展开的区域保持可交互。这种模式非常适合下拉菜单、筛选器等场景。

<div class="demo-container">
  <div class="demo-row">
    <button id="anchorPartialBtn1" style="margin: 5px;">向下展开 ▼</button>
    <button id="anchorPartialBtn2" style="margin: 5px;">向上展开 ▲</button>
    <button id="anchorPartialBtn3" style="margin: 5px;">向左展开 ◀</button>
    <button id="anchorPartialBtn4" style="margin: 5px;">向右展开 ▶</button>
  </div>
</div>

#### 核心特性

- 🎯 **精确锚定** - 抽屉从触发按钮位置展开
- 🎭 **部分遮罩** - 只在展开方向显示遮罩，其他区域可正常交互
- 🔄 **四向支持** - 支持向上、下、左、右四个方向展开
- 📱 **响应式** - 自动适配屏幕边界，防止溢出
- ⚡ **流畅动画** - 平滑的展开和收起动画效果

#### 基础用法

```html
<!-- 触发按钮 -->
<button id="filterButton">筛选 ▼</button>

<!-- 锚点抽屉 -->
<ldesign-drawer 
  id="filterDrawer"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="筛选选项"
  size="300px">
  <div style="padding: 20px;">
    <p>筛选内容...</p>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
// JavaScript 绑定
const button = document.getElementById('filterButton');
const drawer = document.getElementById('filterDrawer');

button.addEventListener('click', function() {
  // 动态设置锚点元素为当前按钮
  drawer.anchorElement = this;
  drawer.open();
});
```

#### 四个方向示例

```html
<!-- 向下展开（最常用，类似下拉菜单） -->
<button id="btn-bottom">向下展开 ▼</button>
<ldesign-drawer 
  id="drawer-bottom"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向下展开"
  size="400px">
  <div style="padding: 20px;">
    <p>从按钮下方展开，只在下方区域有遮罩</p>
  </div>
</ldesign-drawer>

<!-- 向上展开 -->
<button id="btn-top">向上展开 ▲</button>
<ldesign-drawer 
  id="drawer-top"
  placement="top"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向上展开"
  size="400px">
  <div style="padding: 20px;">
    <p>从按钮上方展开，只在上方区域有遮罩</p>
  </div>
</ldesign-drawer>

<!-- 向左展开 -->
<button id="btn-left">向左展开 ◀</button>
<ldesign-drawer 
  id="drawer-left"
  placement="left"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向左展开"
  size="350px">
  <div style="padding: 20px;">
    <p>从按钮左侧展开，只在左侧区域有遮罩</p>
  </div>
</ldesign-drawer>

<!-- 向右展开 -->
<button id="btn-right">向右展开 ▶</button>
<ldesign-drawer 
  id="drawer-right"
  placement="right"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向右展开"
  size="350px">
  <div style="padding: 20px;">
    <p>从按钮右侧展开，只在右侧区域有遮罩</p>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
// 绑定所有按钮
const buttons = [
  { btnId: 'btn-bottom', drawerId: 'drawer-bottom' },
  { btnId: 'btn-top', drawerId: 'drawer-top' },
  { btnId: 'btn-left', drawerId: 'drawer-left' },
  { btnId: 'btn-right', drawerId: 'drawer-right' }
];

buttons.forEach(({ btnId, drawerId }) => {
  const button = document.getElementById(btnId);
  const drawer = document.getElementById(drawerId);
  
  button.addEventListener('click', function() {
    drawer.anchorElement = this;
    drawer.open();
  });
});
```

#### 实际应用场景

##### 1. 电商筛选下拉菜单

```html
<!-- 筛选栏 -->
<div class="filter-bar">
  <button id="filter-category" class="filter-btn">
    全部商品 ▼
  </button>
  <button id="filter-sort" class="filter-btn">
    默认排序 ▼
  </button>
  <button id="filter-price" class="filter-btn">
    价格筛选 ▼
  </button>
</div>

<!-- 分类筛选抽屉 -->
<ldesign-drawer 
  id="drawer-category"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="商品分类"
  size="auto">
  <div style="padding: 20px;">
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
      <button style="padding: 10px;">全部商品</button>
      <button style="padding: 10px;">新款商品</button>
      <button style="padding: 10px;">活动商品</button>
    </div>
  </div>
</ldesign-drawer>

<!-- 排序筛选抽屉 -->
<ldesign-drawer 
  id="drawer-sort"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="排序方式"
  size="auto">
  <div style="padding: 20px;">
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="padding: 12px; cursor: pointer;">默认排序</li>
      <li style="padding: 12px; cursor: pointer;">价格从低到高</li>
      <li style="padding: 12px; cursor: pointer;">价格从高到低</li>
      <li style="padding: 12px; cursor: pointer;">销量排序</li>
    </ul>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
// 绑定筛选按钮
const filters = ['category', 'sort', 'price'];
filters.forEach(filter => {
  const btn = document.getElementById(`filter-${filter}`);
  const drawer = document.getElementById(`drawer-${filter}`);
  
  btn.addEventListener('click', function() {
    drawer.anchorElement = this;
    drawer.open();
  });
});
```

##### 2. 浮动购物车按钮

```html
<!-- 固定定位的购物车按钮 -->
<button id="cart-button" style="
  position: fixed;
  top: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #ff6b6b;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 24px;
">
  🛒
</button>

<!-- 购物车抽屉 -->
<ldesign-drawer 
  id="drawer-cart"
  placement="right"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="购物车"
  size="400px">
  <div style="padding: 20px;">
    <h3>我的购物车</h3>
    <p>购物车是空的</p>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
const cartButton = document.getElementById('cart-button');
const cartDrawer = document.getElementById('drawer-cart');

cartButton.addEventListener('click', function() {
  cartDrawer.anchorElement = this;
  cartDrawer.open();
});
```

#### 关键属性说明

| 属性 | 说明 | 类型 | 默认值 | 示例 |
|------|------|------|--------|------|
| `anchor-mode` | 锚点模式，必须设为 `"element"` | `string` | `'disabled'` | `'element'` |
| `anchor-element` | 锚点元素，指定触发按钮 | `string \| HTMLElement` | `null` | `'#myButton'` 或 DOM 元素 |
| `anchor-mask-partial` | 启用部分遮罩 | `boolean` | `false` | `true` |
| `placement` | 展开方向 | `string` | `'right'` | `'top'` / `'bottom'` / `'left'` / `'right'` |
| `size` | 抽屉尺寸 | `string` | `'md'` | `'300px'` / `'50%'` / `'auto'` |

#### 工作原理

1. **锚点定位计算**：抽屉根据锚点元素（触发按钮）的位置和尺寸，计算自己应该出现的位置
2. **方向展开**：根据 `placement` 属性，从锚点元素向指定方向展开
3. **部分遮罩**：只在展开方向创建遮罩层，遮罩范围为：
   - `bottom`：从按钮底部到屏幕底部
   - `top`：从屏幕顶部到按钮顶部
   - `left`：从屏幕左侧到按钮左侧
   - `right`：从按钮右侧到屏幕右侧
4. **边界检测**：自动检测屏幕边界，确保抽屉不会溢出可视区域

#### 最佳实践

```javascript path=null start=null
// ✅ 推荐：动态绑定锚点元素
button.addEventListener('click', function() {
  drawer.anchorElement = this; // 使用 this 引用当前按钮
  drawer.open();
});

// ✅ 推荐：使用 size="auto" 让抽屉根据内容自适应
<ldesign-drawer size="auto" ...>

// ✅ 推荐：向下展开时，使用较小的动画时长
<ldesign-drawer animation-duration="200" ...>

// ❌ 不推荐：使用选择器字符串（静态绑定）
<ldesign-drawer anchor-element="#button1" ...>
// 这种方式在多个按钮共用一个抽屉时会有问题
```

#### 完整示例

完整的交互演示请参考：[demo/drawer-anchor-partial-mask.html](../../../demo/drawer-anchor-partial-mask.html)

该示例包含：
- 四个方向的基础展开示例
- 四方向布局示例
- 实际应用场景（电商筛选、购物车）
- 完整的交互逻辑和样式

#### 注意事项

⚠️ **重要提示**：

1. 必须同时设置 `anchor-mode="element"` 和 `anchor-mask-partial="true"` 才能启用部分遮罩功能
2. 推荐使用 JavaScript 动态设置 `anchorElement` 属性，而不是静态的选择器字符串
3. 部分遮罩只在锚点模式下生效，普通抽屉模式下会显示全屏遮罩
4. 抽屉会自动处理边界溢出，确保始终在可视区域内
5. 移动端建议使用 `swipe-to-close="true"` 支持手势关闭

### 加载状态

展示加载中状态，适用于异步数据加载。

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="loadingDrawer">加载示例</button>
  </div>
</div>

```html
<ldesign-drawer 
  id="loadingDrawer"
  drawer-title="加载示例"
  loading="false"
  loading-text="数据加载中...">
  <div id="drawerContent">内容区域</div>
</ldesign-drawer>
```

```javascript path=null start=null
const loadingDrawer = document.getElementById('loadingDrawer');
const content = document.getElementById('drawerContent');

// 打开时加载数据
loadingDrawer.addEventListener('drawerOpen', async () => {
  // 显示加载状态
  await loadingDrawer.showLoading('正在加载数据...');
  
  // 模拟异步加载
  const data = await fetchData();
  
  // 更新内容
  content.innerHTML = data;
  
  // 隐藏加载状态
  await loadingDrawer.hideLoading();
});

function fetchData() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('<p>加载完成的数据</p>');
    }, 2000);
  });
}
```

<!-- 实际渲染的抽屉元素 -->
<ldesign-drawer id="loadingDrawer" drawer-title="加载示例" loading="false" loading-text="数据加载中...">
  <div id="drawerContent" style="padding: 20px;">
    <p>点击下方按钮加载数据</p>
    <button id="loadDataBtn" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">加载数据</button>
  </div>
</ldesign-drawer>


## 实际应用示例

<div class="demo-container">
  <div class="demo-row">
    <button class="open-drawer-btn" data-drawer="userFormDrawer" style="padding: 10px 20px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">表单编辑</button>
    <button id="showUserDetailBtn" style="padding: 10px 20px; background: #52c41a; color: white; border: none; border-radius: 4px; cursor: pointer;">详情查看</button>
    <button class="open-drawer-btn" data-drawer="menuDrawer" style="padding: 10px 20px; background: #722ed1; color: white; border: none; border-radius: 4px; cursor: pointer;">导航菜单</button>
    <button class="open-drawer-btn" data-drawer="settingsDrawer" style="padding: 10px 20px; background: #fa8c16; color: white; border: none; border-radius: 4px; cursor: pointer;">设置面板</button>
  </div>
</div>

### 表单编辑抽屉

常用于编辑表单、创建新项目等场景。

```html
<button id="createUserBtn">创建用户</button>

<ldesign-drawer 
  id="userFormDrawer"
  drawer-title="创建新用户"
  subtitle="填写用户基本信息"
  placement="right"
  size="md"
  close-on-esc="true">
  
  <form id="userForm" style="padding: 20px;">
    <div style="margin-bottom: 16px;">
      <label>用户名：</label>
      <input type="text" name="username" required style="width: 100%; padding: 8px;">
    </div>
    
    <div style="margin-bottom: 16px;">
      <label>邮箱：</label>
      <input type="email" name="email" required style="width: 100%; padding: 8px;">
    </div>
    
    <div style="margin-bottom: 16px;">
      <label>角色：</label>
      <select name="role" style="width: 100%; padding: 8px;">
        <option value="user">普通用户</option>
        <option value="admin">管理员</option>
      </select>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label>
        <input type="checkbox" name="active" checked>
        启用账户
      </label>
    </div>
  </form>
  
  <div slot="footer" style="display: flex; justify-content: flex-end; gap: 10px;">
    <button id="cancelBtn" style="padding: 8px 16px;">取消</button>
    <button id="submitBtn" style="padding: 8px 16px; background: #1890ff; color: white; border: none;">确定</button>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
const createBtn = document.getElementById('createUserBtn');
const drawer = document.getElementById('userFormDrawer');
const form = document.getElementById('userForm');
const cancelBtn = document.getElementById('cancelBtn');
const submitBtn = document.getElementById('submitBtn');

// 打开抽屉
createBtn.addEventListener('click', () => {
  drawer.open();
});

// 取消按钮
cancelBtn.addEventListener('click', () => {
  if (confirm('确认放弃已填写的内容？')) {
    form.reset();
    drawer.close();
  }
});

// 提交表单
submitBtn.addEventListener('click', async () => {
  if (!form.checkValidity()) {
    alert('请填写完整信息');
    return;
  }
  
  // 显示加载状态
  submitBtn.disabled = true;
  submitBtn.textContent = '提交中...';
  
  try {
    // 模拟 API 请求
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    alert('创建成功！');
    form.reset();
    drawer.close();
  } catch (error) {
    alert('创建失败：' + error.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = '确定';
  }
});

// 关闭前确认
drawer.addEventListener('drawerBeforeClose', (e) => {
  const hasData = Array.from(new FormData(form).values()).some(v => v);
  if (hasData && e.detail.reason !== 'button') {
    if (!confirm('表单有未保存的内容，确认关闭？')) {
      e.preventDefault();
    }
  }
});
```

### 详情查看抽屉

展示详细信息、用户资料等内容。

```html
<ldesign-drawer 
  id="detailDrawer"
  drawer-title="用户详情"
  placement="right"
  size="lg"
  loading="false"
  loading-text="加载中...">
  
  <div id="userDetail" style="padding: 20px;"></div>
  
  <div slot="extra">
    <button id="editUserBtn">编辑</button>
    <button id="deleteUserBtn" style="margin-left: 10px; color: red;">删除</button>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
const detailDrawer = document.getElementById('detailDrawer');
const userDetail = document.getElementById('userDetail');
let currentUserId = null;

// 打开用户详情
async function showUserDetail(userId) {
  currentUserId = userId;
  detailDrawer.open();
  
  // 显示加载状态
  await detailDrawer.showLoading();
  
  try {
    const response = await fetch(`/api/users/${userId}`);
    const user = await response.json();
    
    // 渲染用户信息
    userDetail.innerHTML = `
      <div style="margin-bottom: 20px;">
        <img src="${user.avatar}" style="width: 80px; height: 80px; border-radius: 50%;">
      </div>
      <h3>${user.name}</h3>
      <p><strong>邮箱：</strong>${user.email}</p>
      <p><strong>手机：</strong>${user.phone}</p>
      <p><strong>角色：</strong>${user.role}</p>
      <p><strong>注册时间：</strong>${new Date(user.createdAt).toLocaleString()}</p>
      <p><strong>状态：</strong><span style="color: ${user.active ? 'green' : 'red'}">${user.active ? '活跃' : '禁用'}</span></p>
    `;
  } catch (error) {
    userDetail.innerHTML = `<p style="color: red;">加载失败：${error.message}</p>`;
  } finally {
    await detailDrawer.hideLoading();
  }
}

// 编辑按钮
document.getElementById('editUserBtn').addEventListener('click', () => {
  detailDrawer.close();
  // 打开编辑抽屉
  openEditDrawer(currentUserId);
});

// 删除按钮
document.getElementById('deleteUserBtn').addEventListener('click', async () => {
  if (confirm('确认删除该用户？')) {
    try {
      await fetch(`/api/users/${currentUserId}`, { method: 'DELETE' });
      alert('删除成功');
      detailDrawer.close();
      // 刷新列表
      refreshUserList();
    } catch (error) {
      alert('删除失败：' + error.message);
    }
  }
});
```

### 导航菜单抽屉

侧边导航菜单，常用于移动端。

```html
<button id="menuBtn">☰ 菜单</button>

<ldesign-drawer 
  id="navDrawer"
  placement="left"
  size="sm"
  mask="true"
  mask-closable="true"
  swipe-to-close="true">
  
  <nav style="padding: 20px;">
    <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
      <img src="logo.png" alt="Logo" style="height: 40px;">
    </div>
    
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="margin-bottom: 10px;">
        <a href="#home" style="display: block; padding: 12px; text-decoration: none; color: #333;">
          🏠 首页
        </a>
      </li>
      <li style="margin-bottom: 10px;">
        <a href="#products" style="display: block; padding: 12px; text-decoration: none; color: #333;">
          📚 产品
        </a>
      </li>
      <li style="margin-bottom: 10px;">
        <a href="#about" style="display: block; padding: 12px; text-decoration: none; color: #333;">
          ℹ️ 关于我们
        </a>
      </li>
      <li style="margin-bottom: 10px;">
        <a href="#contact" style="display: block; padding: 12px; text-decoration: none; color: #333;">
          ✉️ 联系我们
        </a>
      </li>
    </ul>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <button style="width: 100%; padding: 12px; background: #1890ff; color: white; border: none;">
        登录
      </button>
    </div>
  </nav>
</ldesign-drawer>
```

```javascript path=null start=null
const menuBtn = document.getElementById('menuBtn');
const navDrawer = document.getElementById('navDrawer');

menuBtn.addEventListener('click', () => {
  navDrawer.open();
});

// 点击链接关闭抽屉
navDrawer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    navDrawer.close();
    
    // 等待抽屉关闭后导航
    navDrawer.addEventListener('drawerClose', () => {
      window.location.hash = href;
    }, { once: true });
  });
});
```

### 设置面板

应用设置、主题切换等配置面板。

```html
<ldesign-drawer 
  id="settingsDrawer"
  drawer-title="设置"
  icon="⚙️"
  placement="right"
  size="md">
  
  <div style="padding: 20px;">
    <section style="margin-bottom: 30px;">
      <h4>外观</h4>
      <div style="margin-bottom: 16px;">
        <label>
          主题模式：
          <select id="themeSelect" style="margin-left: 10px; padding: 6px;">
            <option value="light">亮色</option>
            <option value="dark">暗色</option>
            <option value="auto">自动</option>
          </select>
        </label>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label>
          字体大小：
          <input type="range" id="fontSizeRange" min="12" max="20" value="14" style="margin-left: 10px;">
          <span id="fontSizeValue">14px</span>
        </label>
      </div>
    </section>
    
    <section style="margin-bottom: 30px;">
      <h4>通知</h4>
      <div style="margin-bottom: 16px;">
        <label>
          <input type="checkbox" id="emailNotif" checked>
          邮件通知
        </label>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label>
          <input type="checkbox" id="pushNotif" checked>
          推送通知
        </label>
      </div>
    </section>
    
    <section>
      <h4>隐私</h4>
      <div style="margin-bottom: 16px;">
        <label>
          <input type="checkbox" id="shareData">
          允许数据共享
        </label>
      </div>
    </section>
  </div>
  
  <div slot="footer" style="display: flex; justify-content: space-between; padding: 16px;">
    <button id="resetBtn">重置</button>
    <div>
      <button id="cancelSettingsBtn" style="margin-right: 10px;">取消</button>
      <button id="saveSettingsBtn" style="background: #1890ff; color: white; border: none; padding: 8px 16px;">保存</button>
    </div>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
const settingsDrawer = document.getElementById('settingsDrawer');
let originalSettings = {};

// 加载设置
settingsDrawer.addEventListener('drawerOpen', () => {
  const settings = loadSettings();
  originalSettings = { ...settings };
  
  document.getElementById('themeSelect').value = settings.theme;
  document.getElementById('fontSizeRange').value = settings.fontSize;
  document.getElementById('fontSizeValue').textContent = settings.fontSize + 'px';
  document.getElementById('emailNotif').checked = settings.emailNotif;
  document.getElementById('pushNotif').checked = settings.pushNotif;
  document.getElementById('shareData').checked = settings.shareData;
});

// 字体大小滑块
document.getElementById('fontSizeRange').addEventListener('input', (e) => {
  document.getElementById('fontSizeValue').textContent = e.target.value + 'px';
});

// 重置按钮
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('确认重置所有设置？')) {
    resetSettings();
    settingsDrawer.close();
  }
});

// 取消按钮
document.getElementById('cancelSettingsBtn').addEventListener('click', () => {
  settingsDrawer.close();
});

// 保存按钮
document.getElementById('saveSettingsBtn').addEventListener('click', () => {
  const settings = {
    theme: document.getElementById('themeSelect').value,
    fontSize: document.getElementById('fontSizeRange').value,
    emailNotif: document.getElementById('emailNotif').checked,
    pushNotif: document.getElementById('pushNotif').checked,
    shareData: document.getElementById('shareData').checked
  };
  
  saveSettings(settings);
  applySettings(settings);
  settingsDrawer.close();
});

function loadSettings() {
  return JSON.parse(localStorage.getItem('appSettings') || '{}');
}

function saveSettings(settings) {
  localStorage.setItem('appSettings', JSON.stringify(settings));
}

function applySettings(settings) {
  document.body.style.fontSize = settings.fontSize + 'px';
  document.body.className = 'theme-' + settings.theme;
  // ... 应用其他设置
}
```

## JavaScript API

### 实例方法

```javascript path=null start=null
const drawer = document.getElementById('myDrawer');

// 打开抽屉
await drawer.open();

// 关闭抽屉
await drawer.close('api'); // 可选原因：'mask' | 'escape' | 'button' | 'swipe' | 'api'

// 切换显示状态
await drawer.toggle();

// 最小化
await drawer.minimize();

// 最大化
await drawer.maximize();

// 恢复大小
await drawer.restore();

// 调整尺寸
await drawer.resize('500px');

// 吸附到指定点
await drawer.snapTo({ value: 600, label: '中' });

// 显示加载状态
await drawer.showLoading('加载中...');

// 隐藏加载状态
await drawer.hideLoading();

// 获取当前状态
const state = await drawer.getState(); // 'closed' | 'opening' | 'open' | 'closing' | 'minimized' | 'maximized'

// 获取当前尺寸
const size = await drawer.getSize(); // { drawerWidth: number, drawerHeight: number }
```

### 事件监听

```javascript path=null start=null
const drawer = document.getElementById('myDrawer');

// 打开前触发
drawer.addEventListener('drawerBeforeOpen', (e) => {
  console.log('即将打开');
  // 可以在这里做预处理
});

// 打开后触发
drawer.addEventListener('drawerOpen', (e) => {
  console.log('已打开');
});

// 关闭前触发
drawer.addEventListener('drawerBeforeClose', (e) => {
  console.log('即将关闭，原因：', e.detail.reason);
  // 可以阻止关闭
  if (hasUnsavedChanges()) {
    e.preventDefault();
  }
});

// 关闭后触发
drawer.addEventListener('drawerClose', (e) => {
  console.log('已关闭，原因：', e.detail.reason);
});

// 状态变化
drawer.addEventListener('drawerStateChange', (e) => {
  console.log('状态变化：', e.detail.state);
});

// 尺寸变化
drawer.addEventListener('drawerResize', (e) => {
  console.log('尺寸：', e.detail.drawerWidth, 'x', e.detail.drawerHeight);
});

// 滑动进度
drawer.addEventListener('drawerSwipe', (e) => {
  console.log('滑动进度：', e.detail.progress);
});
```

## 完整属性表

### 基础属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `visible` | 是否显示 | `boolean` | `false` | `true` / `false` |
| `placement` | 抽屉位置 | `string` | `'right'` | `'left'` / `'right'` / `'top'` / `'bottom'` |
| `size` | 抽屉尺寸 | `string \| number` | `'md'` | `'xs'` / `'sm'` / `'md'` / `'lg'` / `'xl'` / 像素值 / 百分比 |
| `fullscreen` | 是否全屏 | `boolean` | `false` | `true` / `false` |
| `drawer-title` | 标题 | `string` | `''` | 任意字符串 |
| `subtitle` | 副标题 | `string` | `''` | 任意字符串 |
| `icon` | 标题图标 | `string` | `''` | 任意字符串 |
| `show-back` | 显示返回按钮 | `boolean` | `false` | `true` / `false` |
| `closable` | 显示关闭按钮 | `boolean` | `true` | `true` / `false` |
| `custom-class` | 自定义类名 | `string` | `''` | 任意类名 |
| `theme` | 主题 | `string` | `'light'` | `'light'` / `'dark'` / `'auto'` / `'custom'` |
| `level` | 抽屉层级 | `string` | `'normal'` | `'normal'` / `'high'` / `'top'` / `'modal'` |
| `z-index` | 层级 | `number` | `1000` | 任意数字 |
| `padding` | 内边距 | `string \| boolean` | `true` | `true` / `false` / CSS 值 |

### 遮罩层属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `mask` | 显示遮罩 | `boolean` | `true` | `true` / `false` |
| `mask-closable` | 点击遮罩关闭 | `boolean` | `true` | `true` / `false` |
| `mask-class` | 遮罩类名 | `string` | `''` | 任意类名 |

### 动画属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `animation` | 启用动画 | `boolean` | `true` | `true` / `false` |
| `animation-type` | 动画类型 | `string` | `'slide'` | `'slide'` / `'fade'` / `'zoom'` |
| `animation-duration` | 动画时长(ms) | `number` | `300` | 任意数字 |
| `animation-easing` | 缓动函数 | `string` | `'ease-in-out'` | `'linear'` / `'ease'` / `'ease-in'` / `'ease-out'` / `'ease-in-out'` |

### 键盘与无障碍

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `close-on-esc` | ESC键关闭 | `boolean` | `true` | `true` / `false` |
| `lock-scroll` | 锁定页面滚动 | `boolean` | `true` | `true` / `false` |
| `focus-trap` | 焦点捕获 | `boolean` | `true` | `true` / `false` |
| `auto-focus` | 自动聚焦 | `boolean` | `true` | `true` / `false` |
| `restore-focus` | 恢复焦点 | `boolean` | `true` | `true` / `false` |
| `aria-label-text` | ARIA 标签 | `string` | `''` | 任意字符串 |

### 调整大小属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `resizable` | 可调整大小 | `boolean` | `false` | `true` / `false` |
| `min-size` | 最小尺寸 | `string \| number` | `200` | 像素值 / 百分比 |
| `max-size` | 最大尺寸 | `string \| number` | `'90%'` | 像素值 / 百分比 |
| `snap-points` | 吸附点数组 | `SnapPoint[]` | `[]` | 吸附点对象数组 |
| `snap-threshold` | 吸附阈值 | `number` | `30` | 任意数字 |
| `show-size-hint` | 显示尺寸提示 | `boolean` | `true` | `true` / `false` |

### 移动端属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `swipe-to-close` | 滑动关闭 | `boolean` | `false` | `true` / `false` |
| `swipe-threshold` | 滑动阈值 | `number` | `0.3` | 0-1 之间 |
| `swipe-trigger-area` | 滑动触发区域 | `string` | `'edge'` | `'anywhere'` / `'handle'` / `'header'` / `'edge'` |

### 锚点定位属性

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `anchor-mode` | 锚点模式 | `string` | `'disabled'` | `'disabled'` / `'element'` / `'cursor'` / `'custom'` |
| `anchor-element` | 锚点元素 | `string \| HTMLElement` | `null` | 选择器或元素对象 |
| `anchor-align` | 对齐方式 | `string` | `'start'` | `'start'` / `'center'` / `'end'` / `'auto'` |
| `anchor-offset` | 偏移量 | `object` | `{ x: 0, y: 0 }` | `{ x: number, y: number }` |
| `anchor-flip` | 自动翻转 | `boolean` | `true` | `true` / `false` |
| `anchor-constrain` | 限制在边界内 | `boolean` | `true` | `true` / `false` |
| `anchor-boundary` | 边界限制 | `string` | `'viewport'` | `'viewport'` / `'scrollParent'` / 选择器 |
| `anchor-follow-scroll` | 跟随滚动 | `boolean` | `true` | `true` / `false` |
| `anchor-auto-update` | 自动更新位置 | `boolean` | `true` | `true` / `false` |
| `anchor-mask-partial` | 部分遮罩 | `boolean` | `true` | `true` / `false` |

### 头部与底部

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `header-border` | 头部边框 | `boolean` | `true` | `true` / `false` |
| `header-sticky` | 头部吸顶 | `boolean` | `false` | `true` / `false` |
| `footer-buttons` | 底部按钮 | `DrawerButton[]` | `[]` | 按钮配置数组 |
| `footer-align` | 底部对齐 | `string` | `'right'` | `'left'` / `'center'` / `'right'` / `'space-between'` |
| `footer-border` | 底部边框 | `boolean` | `true` | `true` / `false` |

### 加载与特殊状态

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `loading` | 加载状态 | `boolean` | `false` | `true` / `false` |
| `loading-text` | 加载文字 | `string` | `'加载中...'` | 任意字符串 |
| `fullscreenable` | 可全屏切换 | `boolean` | `false` | `true` / `false` |
| `minimizable` | 可最小化 | `boolean` | `false` | `true` / `false` |
| `maximizable` | 可最大化 | `boolean` | `false` | `true` / `false` |
| `destroy-on-close` | 关闭时销毁 | `boolean` | `false` | `true` / `false` |

### 性能优化

| 属性 | 说明 | 类型 | 默认值 | 可选值 |
|------|------|------|--------|--------|
| `use-transform` | 使用 transform | `boolean` | `true` | `true` / `false` |
| `gpu-acceleration` | GPU 加速 | `boolean` | `true` | `true` / `false` |
| `virtual-scroll` | 虚拟滚动 | `boolean` | `false` | `true` / `false` |
| `lazy-load` | 懒加载 | `boolean` | `false` | `true` / `false` |
| `css-contain` | CSS 包含 | `boolean` | `true` | `true` / `false` |

## 公开方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| `open()` | 打开抽屉 | - | `Promise<void>` |
| `close(reason?)` | 关闭抽屉 | `reason?: CloseReason` | `Promise<void>` |
| `toggle()` | 切换状态 | - | `Promise<void>` |
| `minimize()` | 最小化抽屉 | - | `Promise<void>` |
| `maximize()` | 最大化抽屉 | - | `Promise<void>` |
| `restore()` | 恢复大小 | - | `Promise<void>` |
| `resize(size)` | 调整尺寸 | `size: string \| number` | `Promise<void>` |
| `snapTo(point)` | 吸附到指定点 | `point: SnapPoint` | `Promise<void>` |
| `showLoading(text?)` | 显示加载状态 | `text?: string` | `Promise<void>` |
| `hideLoading()` | 隐藏加载状态 | - | `Promise<void>` |
| `getState()` | 获取当前状态 | - | `Promise<DrawerState>` |
| `getSize()` | 获取当前尺寸 | - | `Promise<{drawerWidth: number, drawerHeight: number}>` |

## 事件

| 事件名 | 说明 | 回调参数 | 触发时机 |
|--------|------|----------|----------|
| `drawerBeforeOpen` | 打开前触发 | - | 即将打开抽屉时 |
| `drawerOpen` | 打开后触发 | - | 抽屉完全打开后 |
| `drawerBeforeClose` | 关闭前触发 | `{ reason: CloseReason }` | 即将关闭抽屉时，可阻止 |
| `drawerClose` | 关闭后触发 | `{ reason: CloseReason }` | 抽屉完全关闭后 |
| `drawerStateChange` | 状态变化 | `{ state: DrawerState }` | 抽屉状态变化时 |
| `drawerResize` | 尺寸变化 | `{ drawerWidth: number, drawerHeight: number }` | 抽屉尺寸改变时 |
| `drawerSwipe` | 滑动进度 | `{ progress: number }` | 滑动关闭过程中 |

## 插槽

| 插槽名 | 说明 | 使用示例 |
|--------|------|----------|
| `default` | 默认内容插槽 | `<ldesign-drawer>内容</ldesign-drawer>` |
| `header` | 自定义头部 | `<div slot="header">自定义头部</div>` |
| `footer` | 自定义底部 | `<div slot="footer">自定义底部</div>` |
| `extra` | 头部右侧额外内容 | `<div slot="extra"><button>按钮</button></div>` |
| `loading` | 自定义加载内容 | `<div slot="loading">加载中...</div>` |

## CSS 变量

抽屉组件提供了丰富的 CSS 变量，可以轻松定制样式。

```css
ldesign-drawer {
  /* === 颜色系统 === */
  --drawer-bg-color: #ffffff;                    /* 背景颜色 */
  --drawer-text-color: #333333;                  /* 文字颜色 */
  --drawer-border-color: #e5e5e5;                /* 边框颜色 */
  --drawer-header-bg: #fafafa;                   /* 头部背景 */
  --drawer-header-text: #000000;                 /* 头部文字 */
  --drawer-footer-bg: #ffffff;                   /* 底部背景 */
  --drawer-mask-bg: rgba(0, 0, 0, 0.45);         /* 遮罩颜色 */
  
  /* === 尺寸 === */
  --drawer-header-height: 56px;                  /* 头部高度 */
  --drawer-footer-height: auto;                  /* 底部高度 */
  --drawer-padding: 24px;                        /* 内边距 */
  --drawer-header-padding: 16px 24px;            /* 头部内边距 */
  --drawer-footer-padding: 16px 24px;            /* 底部内边距 */
  
  /* === 动画 === */
  --drawer-animation-duration: 300ms;            /* 动画时长 */
  --drawer-animation-easing: ease-in-out;        /* 缓动函数 */
  
  /* === 圆角 === */
  --drawer-border-radius: 0;                     /* 圆角大小 */
  --drawer-header-radius: 0;                     /* 头部圆角 */
  
  /* === 阴影 === */
  --drawer-shadow: 0 3px 14px rgba(0, 0, 0, 0.12);  /* 阴影效果 */
  
  /* === 字体 === */
  --drawer-title-size: 18px;                     /* 标题字号 */
  --drawer-title-weight: 600;                    /* 标题字重 */
  --drawer-subtitle-size: 14px;                  /* 副标题字号 */
  --drawer-subtitle-color: #666666;              /* 副标题颜色 */
  
  /* === 其他 === */
  --drawer-z-index: 1000;                        /* 层级 */
  --drawer-transition: all 0.3s;                 /* 过渡效果 */
}
```

### 主题示例

```css
/* 暗色主题 */
ldesign-drawer[theme="dark"] {
  --drawer-bg-color: #1f1f1f;
  --drawer-text-color: #ffffff;
  --drawer-border-color: #333333;
  --drawer-header-bg: #2a2a2a;
  --drawer-header-text: #ffffff;
  --drawer-subtitle-color: #999999;
}

/* 渐变背景 */
.gradient-drawer {
  --drawer-bg-color: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --drawer-text-color: #ffffff;
  --drawer-header-bg: transparent;
  --drawer-header-text: #ffffff;
}

/* 毛玻璃效果 */
.blur-drawer {
  --drawer-bg-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 圆角抽屉 */
.rounded-drawer {
  --drawer-border-radius: 12px;
  --drawer-header-radius: 12px 12px 0 0;
}
```

## 主题定制

### 暗色主题

```css
ldesign-drawer[theme="dark"] {
  --drawer-bg-color: #1f1f1f;
  --drawer-text-color: #ffffff;
  --drawer-border-color: #333333;
  --drawer-header-bg: #2a2a2a;
}
```

### 自定义样式

```css
.custom-drawer {
  --drawer-bg-color: linear-gradient(to bottom, #667eea, #764ba2);
  --drawer-text-color: white;
}

.borderless-drawer {
  --drawer-border-color: transparent;
  --drawer-shadow: none;
}

.blur-drawer {
  backdrop-filter: blur(10px);
  --drawer-bg-color: rgba(255, 255, 255, 0.8);
}
```

## 常见问题

### 如何在打开抽屉时传递数据

```javascript
const drawer = document.getElementById('myDrawer');
drawer.data = { userId: 123 };
drawer.open();

drawer.addEventListener('drawerOpen', (e) => {
  console.log(drawer.data); // { userId: 123 }
});
```

### 如何阻止抽屉关闭

```javascript
drawer.addEventListener('drawerBeforeClose', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault();
    if (confirm('有未保存的更改，确定要关闭吗？')) {
      drawer.close();
    }
  }
});
```

### 如何实现抽屉联动

```javascript
drawer1.addEventListener('drawerClose', () => {
  drawer2.open();
});
```

### 自定义动画效果

```css
ldesign-drawer {
  --drawer-animation-duration: 500ms;
  --drawer-animation-easing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## 浏览器兼容性

| 浏览器 | 版本 |
|--------|------|
| Chrome | 60+ |
| Firefox | 60+ |
| Safari | 12+ |
| Edge | 79+ |
| iOS Safari | 12+ |
| Android Chrome | 60+ |

<!-- ========== 实际应用示例的抽屉元素 ========== -->

<!-- 表单编辑抽屉 -->
<ldesign-drawer id="userFormDrawer" drawer-title="创建新用户" subtitle="填写用户基本信息" placement="right" size="md" close-on-esc="true">
  <form id="userForm" style="padding: 20px;">
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 4px;">用户名：</label>
      <input type="text" name="username" required style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 4px;">邮箱：</label>
      <input type="email" name="email" required style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
    </div>
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 4px;">角色：</label>
      <select name="role" style="width: 100%; padding: 8px; border: 1px solid #d9d9d9; border-radius: 4px;">
        <option value="user">普通用户</option>
        <option value="admin">管理员</option>
      </select>
    </div>
    <div style="margin-bottom: 16px;">
      <label>
        <input type="checkbox" name="active" checked>
        启用账户
      </label>
    </div>
  </form>
  <div slot="footer" style="display: flex; justify-content: flex-end; gap: 10px; padding: 16px; border-top: 1px solid #f0f0f0;">
    <button id="formCancelBtn" onclick="cancelUserForm()" style="padding: 8px 16px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer;">取消</button>
    <button id="formSubmitBtn" onclick="submitUserForm()" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">确定</button>
  </div>
</ldesign-drawer>

<!-- 详情查看抽屉 -->
<ldesign-drawer id="detailDrawer" drawer-title="用户详情" placement="right" size="lg" loading="false" loading-text="加载中...">
  <div id="userDetail" style="padding: 20px;">
    <div style="margin-bottom: 20px;">
      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" style="width: 80px; height: 80px; border-radius: 50%;">
    </div>
    <h3>张三</h3>
    <p><strong>邮箱：</strong>zhangsan@example.com</p>
    <p><strong>手机：</strong>138****8888</p>
    <p><strong>角色：</strong>管理员</p>
    <p><strong>注册时间：</strong>2024-01-01</p>
    <p><strong>状态：</strong><span style="color: green">活跃</span></p>
  </div>
  <div slot="extra">
    <button onclick="alert('编辑功能')" style="padding: 6px 12px; margin-right: 8px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer;">编辑</button>
    <button onclick="if(confirm('确认删除？')) alert('删除成功')" style="padding: 6px 12px; color: #ff4d4f; border: 1px solid #ff4d4f; background: white; border-radius: 4px; cursor: pointer;">删除</button>
  </div>
</ldesign-drawer>

<!-- 导航菜单抽屉 -->
<ldesign-drawer id="menuDrawer" placement="left" size="sm" drawer-title="导航菜单">
  <nav style="padding: 20px;">
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="margin-bottom: 10px;">
        <a href="#home" style="display: block; padding: 12px; text-decoration: none; color: #333; border-radius: 4px;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
          🏠 首页
        </a>
      </li>
      <li style="margin-bottom: 10px;">
        <a href="#products" style="display: block; padding: 12px; text-decoration: none; color: #333; border-radius: 4px;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
          📚 产品
        </a>
      </li>
      <li style="margin-bottom: 10px;">
        <a href="#about" style="display: block; padding: 12px; text-decoration: none; color: #333; border-radius: 4px;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
          ℹ️ 关于我们
        </a>
      </li>
      <li style="margin-bottom: 10px;">
        <a href="#contact" style="display: block; padding: 12px; text-decoration: none; color: #333; border-radius: 4px;" onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='transparent'">
          ✉️ 联系我们
        </a>
      </li>
    </ul>
  </nav>
</ldesign-drawer>

<!-- 设置面板抽屉 -->
<ldesign-drawer id="settingsDrawer" drawer-title="设置" icon="⚙️" placement="right" size="md">
  <div style="padding: 20px;">
    <section style="margin-bottom: 30px;">
      <h4>外观</h4>
      <div style="margin-bottom: 16px;">
        <label>
          主题模式：
          <select style="margin-left: 10px; padding: 6px;">
            <option value="light">亮色</option>
            <option value="dark">暗色</option>
            <option value="auto">自动</option>
          </select>
        </label>
      </div>
      <div style="margin-bottom: 16px;">
        <label>
          字体大小：
          <input type="range" min="12" max="20" value="14" style="margin-left: 10px;">
          <span>14px</span>
        </label>
      </div>
    </section>
    <section style="margin-bottom: 30px;">
      <h4>通知</h4>
      <div style="margin-bottom: 16px;">
        <label>
          <input type="checkbox" checked>
          邮件通知
        </label>
      </div>
      <div style="margin-bottom: 16px;">
        <label>
          <input type="checkbox" checked>
          推送通知
        </label>
      </div>
    </section>
    <section>
      <h4>隐私</h4>
      <div style="margin-bottom: 16px;">
        <label>
          <input type="checkbox">
          允许数据共享
        </label>
      </div>
    </section>
  </div>
  <div slot="footer" style="display: flex; justify-content: space-between; padding: 16px; border-top: 1px solid #f0f0f0;">
    <button id="resetSettingsBtn" style="padding: 8px 16px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer;">重置</button>
    <div>
      <button id="cancelSettingsBtn" style="padding: 8px 16px; margin-right: 10px; border: 1px solid #d9d9d9; background: white; border-radius: 4px; cursor: pointer;">取消</button>
      <button id="saveSettingsBtn" style="padding: 8px 16px; background: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">保存</button>
    </div>
  </div>
</ldesign-drawer>

<!-- 锚点部分遮罩演示抽屉 -->
<ldesign-drawer 
  id="anchorPartialDrawerBottom"
  placement="bottom"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向下展开"
  size="300px"
  animation="true">
  <div style="padding: 20px;">
    <h4 style="margin-top: 0;">🎯 向下展开的抽屉</h4>
    <p>这个抽屉从按钮<strong>下方</strong>展开，只在下方区域有遮罩。</p>
    <div style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin-top: 12px;">
      <p style="margin: 0; color: #1976d2; font-size: 14px;"><strong>提示：</strong>注意按钮上方的区域是透明的，可以点击。</p>
    </div>
  </div>
</ldesign-drawer>

<ldesign-drawer 
  id="anchorPartialDrawerTop"
  placement="top"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向上展开"
  size="300px"
  animation="true">
  <div style="padding: 20px;">
    <h4 style="margin-top: 0;">⬆️ 向上展开的抽屉</h4>
    <p>这个抽屉从按钮<strong>上方</strong>展开，只在上方区域有遮罩。</p>
    <div style="background: #fff3e0; padding: 12px; border-radius: 6px; margin-top: 12px;">
      <p style="margin: 0; color: #e65100; font-size: 14px;"><strong>提示：</strong>按钮下方的区域仍然可以交互。</p>
    </div>
  </div>
</ldesign-drawer>

<ldesign-drawer 
  id="anchorPartialDrawerLeft"
  placement="left"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向左展开"
  size="320px"
  animation="true">
  <div style="padding: 20px;">
    <h4 style="margin-top: 0;">⬅️ 向左展开的拽屉</h4>
    <p>这个拽屉从按钮<strong>左侧</strong>展开，只在左侧区域有遮罩。</p>
    <div style="background: #f3e5f5; padding: 12px; border-radius: 6px; margin-top: 12px;">
      <p style="margin: 0; color: #6a1b9a; font-size: 14px;"><strong>提示：</strong>按钮右侧区域保持可交互。</p>
    </div>
  </div>
</ldesign-drawer>

<ldesign-drawer 
  id="anchorPartialDrawerRight"
  placement="right"
  anchor-mode="element"
  anchor-mask-partial="true"
  drawer-title="向右展开"
  size="320px"
  animation="true">
  <div style="padding: 20px;">
    <h4 style="margin-top: 0;">➡️ 向右展开的拽屉</h4>
    <p>这个拽屉从按钮<strong>右侧</strong>展开，只在右侧区域有遮罩。</p>
    <div style="background: #e8f5e9; padding: 12px; border-radius: 6px; margin-top: 12px;">
      <p style="margin: 0; color: #2e7d32; font-size: 14px;"><strong>提示：</strong>按钮左侧区域保持可交互。</p>
    </div>
  </div>
</ldesign-drawer>

## 最佳实践

### 1. 尺寸选择指南

根据不同的使用场景选择合适的尺寸：

| 场景 | 推荐尺寸 | 说明 |
|------|--------|------|
| 导航菜单 | `sm` (300px) | 简洁的导航链接列表 |
| 表单编辑 | `md` (400px) - `lg` (600px) | 一般表单字段 |
| 复杂表单 | `lg` (600px) - `xl` (800px) | 多段落、多分组表单 |
| 详情查看 | `lg` (600px) - `xl` (800px) | 丰富的内容展示 |
| 设置面板 | `md` (400px) - `lg` (600px) | 配置选项 |
| 移动端 | `80%` - `100%` | 或使用 `fullscreen` |

### 2. 交互设计原则

```javascript path=null start=null
// ✅ 好的实践：提供多种关闭方式
const drawer = document.getElementById('myDrawer');
drawer.closable = true;           // 显示关闭按钮
drawer.closeOnEsc = true;         // ESC 键关闭
drawer.maskClosable = true;       // 点击遮罩关闭

// ✅ 好的实践：重要操作确认
drawer.addEventListener('drawerBeforeClose', (e) => {
  if (hasUnsavedChanges() && e.detail.reason !== 'button') {
    if (!confirm('有未保存的更改，确认关闭？')) {
      e.preventDefault(); // 阻止关闭
    }
  }
});

// ❌ 不好的实践：强制锁定抽屉
drawer.closable = false;
drawer.closeOnEsc = false;
drawer.maskClosable = false;
// 这会让用户感到困扰
```

### 3. 性能优化建议

```html
<!-- ✅ 大量内容时启用销毁模式 -->
<ldesign-drawer destroy-on-close="true">
  <!-- 复杂内容 -->
</ldesign-drawer>

<!-- ✅ 启用性能优化 -->
<ldesign-drawer 
  gpu-acceleration="true"
  use-transform="true"
  css-contain="true">
  <!-- 内容 -->
</ldesign-drawer>

<!-- ✅ 懒加载大量数据 -->
<ldesign-drawer id="dataDrawer" lazy-load="true">
  <!-- 打开时才加载数据 -->
</ldesign-drawer>
```

```javascript path=null start=null
const dataDrawer = document.getElementById('dataDrawer');

dataDrawer.addEventListener('drawerOpen', async () => {
  await dataDrawer.showLoading();
  const data = await fetchLargeDataset();
  renderData(data);
  await dataDrawer.hideLoading();
});
```

### 4. 无障碍支持

```html
<!-- ✅ 提供明确的标签和描述 -->
<ldesign-drawer 
  drawer-title="用户资料编辑"
  subtitle="修改个人信息"
  aria-label-text="编辑用户个人资料的对话框"
  focus-trap="true"
  auto-focus="true"
  restore-focus="true">
  <form aria-label="用户信息表单">
    <label for="username">用户名：</label>
    <input id="username" type="text" required>
  </form>
</ldesign-drawer>
```

### 5. 移动端适配

```html
<!-- ✅ 移动端优化：底部抽屉 -->
<ldesign-drawer 
  id="mobileBottomDrawer"
  placement="bottom"
  drawer-title="选项列表"
  swipe-to-close="true"
  swipe-trigger-area="anywhere"
  swipe-threshold="0.3">
  <!-- 移动端内容 -->
</ldesign-drawer>

<!-- ✅ 移动端右侧抽屉：在头部滑动关闭 -->
<ldesign-drawer 
  id="mobileRightDrawer"
  placement="right"
  drawer-title="详情查看"
  swipe-to-close="true"
  swipe-trigger-area="header"
  swipe-threshold="0.3">
  <div>
    <p>只有在头部区域滑动才能关闭，内容区可以滚动</p>
    <div style="height: 1000px; background: linear-gradient(to bottom, #f0f0f0, #ffffff);">
      长内容区域
    </div>
  </div>
</ldesign-drawer>

<!-- ✅ 移动端左侧抽屉：从边缘滑动关闭 -->
<ldesign-drawer 
  id="mobileLeftDrawer"
  placement="left"
  drawer-title="导航菜单"
  swipe-to-close="true"
  swipe-trigger-area="edge"
  swipe-threshold="0.25">
  <nav>
    <ul style="list-style: none; padding: 0;">
      <li style="padding: 12px; border-bottom: 1px solid #f0f0f0;">首页</li>
      <li style="padding: 12px; border-bottom: 1px solid #f0f0f0;">产品</li>
      <li style="padding: 12px; border-bottom: 1px solid #f0f0f0;">服务</li>
      <li style="padding: 12px; border-bottom: 1px solid #f0f0f0;">关于</li>
    </ul>
  </nav>
</ldesign-drawer>

<!-- ✅ 移动端尺寸优化：确保不超出屏幕 -->
<ldesign-drawer 
  id="mobileOptimizedDrawer"
  placement="bottom"
  drawer-title="实际应用示例"
  swipe-to-close="true">
  <div style="padding: 20px;">
    <h4>移动端优化特性：</h4>
    <ul>
      <li>✅ 自动限制尺寸，不超出屏幕</li>
      <li>✅ 支持安全区域（齐屏适配）</li>
      <li>✅ 流畅的滑动关闭动画</li>
      <li>✅ 触摸优化，无点击延迟</li>
      <li>✅ GPU 加速，动画更平滑</li>
    </ul>
  </div>
</ldesign-drawer>
```

```javascript path=null start=null
// 移动端滑动区域说明：
// - 'anywhere': 在抽屉任何位置滑动都可以关闭（适合无滚动内容）
// - 'header': 只有在头部滑动才能关闭（适合有滚动内容）
// - 'edge': 只有从边缘 20px 内滑动才能关闭（最精确）
// - 'handle': 只有在滑动手柄上滑动才能关闭（需要显示手柄）

// 监听滑动进度
const drawer = document.getElementById('mobileBottomDrawer');
drawer.addEventListener('drawerSwipe', (e) => {
  console.log(`滑动进度: ${(e.detail.progress * 100).toFixed(0)}%`);
});
```

```css
/* 响应式设计 */
@media (max-width: 768px) {
  ldesign-drawer {
    --drawer-padding: 16px;
    --drawer-header-height: 48px;
  }
}

/* 移动端尺寸自动优化 */
/* 注意：组件已内置以下逺辑，无需手动设置：
 * - 水平抽屉：自动限制在 85vw 和 calc(100vw - 48px) 之间
 * - 垂直抽屉：自动限制在 80vh 和 calc(100vh - 60px) 之间
 * - 所有抽屉：绝不超出 100vw × 100vh
 */
```

### 6. 状态管理

```javascript path=null start=null
// ✅ 好的实践：集中管理抽屉状态
class DrawerManager {
  constructor() {
    this.drawers = new Map();
  }
  
  register(id, drawer) {
    this.drawers.set(id, drawer);
  }
  
  open(id, data) {
    const drawer = this.drawers.get(id);
    if (drawer) {
      drawer.data = data;
      drawer.open();
    }
  }
  
  closeAll() {
    this.drawers.forEach(drawer => drawer.close());
  }
}

const drawerManager = new DrawerManager();
drawerManager.register('user', document.getElementById('userDrawer'));
drawerManager.register('settings', document.getElementById('settingsDrawer'));
```

## 常见问题

### Q1: 如何阻止抽屉关闭？

```javascript path=null start=null
const drawer = document.getElementById('myDrawer');

drawer.addEventListener('drawerBeforeClose', (e) => {
  if (needsConfirmation()) {
    e.preventDefault(); // 阻止默认关闭行为
    
    if (confirm('确认关闭？')) {
      drawer.close(); // 手动关闭
    }
  }
});
```

### Q2: 如何实现抽屉嵌套？

```html
<ldesign-drawer id="parentDrawer" z-index="1000">
  <button onclick="document.getElementById('childDrawer').open()">打开子抽屉</button>
</ldesign-drawer>

<ldesign-drawer id="childDrawer" z-index="1010">
  子抽屉内容
</ldesign-drawer>
```

### Q3: 如何动态设置抽屉内容？

```javascript path=null start=null
const drawer = document.getElementById('myDrawer');

// 方法 1：直接修改 innerHTML
drawer.innerHTML = '<div>新内容</div>';

// 方法 2：使用 slot
const content = drawer.querySelector('[slot="default"]');
content.innerHTML = '<div>新内容</div>';

// 方法 3：动态创建元素
const newContent = document.createElement('div');
newContent.textContent = '新内容';
drawer.appendChild(newContent);
```

### Q4: 如何监听抽屉内部事件？

```javascript path=null start=null
const drawer = document.getElementById('myDrawer');

// 监听打开事件
drawer.addEventListener('drawerOpen', () => {
  // 设置内部事件监听
  const saveBtn = drawer.querySelector('#saveBtn');
  saveBtn.addEventListener('click', handleSave);
});

// 监听关闭事件，清理监听器
drawer.addEventListener('drawerClose', () => {
  const saveBtn = drawer.querySelector('#saveBtn');
  saveBtn.removeEventListener('click', handleSave);
});
```

### Q5: 如何实现多个抽屉之间的切换？

```javascript path=null start=null
// 平滑切换
async function switchDrawer(fromId, toId) {
  const from = document.getElementById(fromId);
  const to = document.getElementById(toId);
  
  // 先关闭当前抽屉
  await from.close();
  
  // 稍微延迟后打开新抽屉
  setTimeout(() => {
    to.open();
  }, 150);
}

// 使用
switchDrawer('drawer1', 'drawer2');
```

### Q6: 如何处理抽屉中的表单提交？

```javascript path=null start=null
const drawer = document.getElementById('formDrawer');
const form = drawer.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // 显示加载状态
  await drawer.showLoading('提交中...');
  
  try {
    const formData = new FormData(form);
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert('提交成功');
      form.reset();
      drawer.close();
    } else {
      throw new Error('提交失败');
    }
  } catch (error) {
    alert(error.message);
  } finally {
    await drawer.hideLoading();
  }
});
```

## 更新日志

### v1.1.0
- 新增锚点定位功能
- 优化移动端触摸手势
- 改进动画性能
- 修复初始化闪烁问题

### v1.0.0
- 初始版本发布
- 支持四个方向
- 多种尺寸选项
- 主题定制
- 移动端优化
- 无障碍支持

## 相关组件

- [Modal](./modal.md) - 模态对话框
- [Popup](./popup.md) - 弹出层
