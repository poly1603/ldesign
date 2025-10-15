# 基础使用示例

本文档提供 @ldesign/device 库的基础使用示例，涵盖设备类型检测、屏幕方向检测和触摸支持检测等核心功能。

## 场景描述

在现代 Web 应用中，我们经常需要根据用户设备类型提供不同的用户体验：

- **设备类型检测**：识别用户使用的是手机、平板还是桌面设备
- **屏幕方向检测**：检测设备是横屏还是竖屏模式
- **触摸支持检测**：判断设备是否支持触摸操作
- **实时响应变化**：当设备状态改变时自动更新界面

## 效果预览说明

使用本示例代码后，您的应用可以：

1. 自动识别设备类型并显示相应的界面布局
2. 在用户旋转屏幕时自动调整内容展示
3. 根据触摸支持情况启用或禁用特定交互方式
4. 实时响应窗口大小变化

---

## Vue 3 实现方式

### 基础设备检测

使用 Composition API 快速获取设备信息：

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'

// 获取设备信息
const {
  deviceType,      // 设备类型: 'mobile' | 'tablet' | 'desktop'
  orientation,     // 屏幕方向: 'portrait' | 'landscape'
  deviceInfo,      // 完整的设备信息对象
  isMobile,        // 是否为移动设备
  isTablet,        // 是否为平板设备
  isDesktop,       // 是否为桌面设备
  isTouchDevice,   // 是否支持触摸
  refresh          // 手动刷新设备信息
} = useDevice({
  enableResize: true,        // 启用窗口大小变化监听
  enableOrientation: true,   // 启用屏幕方向变化监听
  debounceDelay: 300,        // 防抖延迟（毫秒）
})

// 根据设备类型执行不同逻辑
const handleAction = () => {
  if (isMobile.value) {
    console.log('执行移动端逻辑')
  } else if (isTablet.value) {
    console.log('执行平板逻辑')
  } else {
    console.log('执行桌面端逻辑')
  }
}
</script>

<template>
  <div class="device-detector">
    <!-- 设备信息展示 -->
    <div class="info-panel">
      <h2>设备信息</h2>

      <!-- 设备类型 -->
      <div class="info-item">
        <label>设备类型：</label>
        <span class="badge" :class="`badge-${deviceType}`">
          {{ deviceType }}
        </span>
      </div>

      <!-- 屏幕方向 -->
      <div class="info-item">
        <label>屏幕方向：</label>
        <span class="badge">
          {{ orientation === 'portrait' ? '竖屏' : '横屏' }}
        </span>
      </div>

      <!-- 触摸支持 -->
      <div class="info-item">
        <label>触摸支持：</label>
        <span :class="isTouchDevice ? 'text-success' : 'text-muted'">
          {{ isTouchDevice ? '是' : '否' }}
        </span>
      </div>

      <!-- 屏幕尺寸 -->
      <div class="info-item">
        <label>屏幕尺寸：</label>
        <span>{{ deviceInfo.width }} × {{ deviceInfo.height }}</span>
      </div>

      <!-- 设备像素比 -->
      <div class="info-item">
        <label>像素比：</label>
        <span>{{ deviceInfo.pixelRatio }}</span>
      </div>

      <!-- 操作系统 -->
      <div class="info-item">
        <label>操作系统：</label>
        <span>{{ deviceInfo.os.name }} {{ deviceInfo.os.version }}</span>
      </div>

      <!-- 浏览器 -->
      <div class="info-item">
        <label>浏览器：</label>
        <span>{{ deviceInfo.browser.name }} {{ deviceInfo.browser.version }}</span>
      </div>

      <!-- 刷新按钮 -->
      <button @click="refresh" class="btn-refresh">
        刷新设备信息
      </button>
    </div>

    <!-- 根据设备类型显示不同内容 -->
    <div class="content-panel">
      <!-- 移动设备内容 -->
      <div v-if="isMobile" class="mobile-content">
        <h3>移动端专属内容</h3>
        <p>这是为移动设备优化的界面</p>
        <ul>
          <li>简化的导航菜单</li>
          <li>大号触摸按钮</li>
          <li>垂直滚动布局</li>
        </ul>
      </div>

      <!-- 平板设备内容 -->
      <div v-else-if="isTablet" class="tablet-content">
        <h3>平板端专属内容</h3>
        <p>这是为平板设备优化的界面</p>
        <ul>
          <li>双栏布局</li>
          <li>侧边栏导航</li>
          <li>中等大小的交互元素</li>
        </ul>
      </div>

      <!-- 桌面设备内容 -->
      <div v-else class="desktop-content">
        <h3>桌面端完整内容</h3>
        <p>这是为桌面设备提供的完整功能界面</p>
        <ul>
          <li>多栏复杂布局</li>
          <li>悬停效果和提示</li>
          <li>键盘快捷键支持</li>
          <li>更多高级功能</li>
        </ul>
      </div>

      <!-- 屏幕方向提示 -->
      <div v-if="isMobile && orientation === 'landscape'" class="orientation-tip">
        <p>建议竖屏使用以获得最佳体验</p>
      </div>
    </div>

    <!-- 交互提示 -->
    <div class="interaction-tip">
      <p v-if="isTouchDevice">
        您可以使用触摸手势进行操作
      </p>
      <p v-else>
        您可以使用鼠标悬停查看更多信息
      </p>
    </div>
  </div>
</template>

<style scoped>
.device-detector {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.info-panel {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.info-panel h2 {
  margin-top: 0;
  color: #333;
  font-size: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  min-width: 120px;
  color: #666;
}

.info-item span {
  color: #333;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
}

.badge-mobile {
  background: #e3f2fd;
  color: #1976d2;
}

.badge-tablet {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge-desktop {
  background: #e8f5e9;
  color: #388e3c;
}

.text-success {
  color: #4caf50;
  font-weight: 600;
}

.text-muted {
  color: #999;
}

.btn-refresh {
  margin-top: 16px;
  padding: 10px 20px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-refresh:hover {
  background: #1976d2;
}

.content-panel {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
}

.content-panel h3 {
  margin-top: 0;
  color: #333;
}

.content-panel ul {
  line-height: 1.8;
  color: #666;
}

.mobile-content {
  border-left: 4px solid #1976d2;
  padding-left: 16px;
}

.tablet-content {
  border-left: 4px solid #7b1fa2;
  padding-left: 16px;
}

.desktop-content {
  border-left: 4px solid #388e3c;
  padding-left: 16px;
}

.orientation-tip {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 12px;
  margin-top: 16px;
  color: #856404;
}

.interaction-tip {
  background: #e3f2fd;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  color: #1976d2;
}

/* 移动端样式优化 */
@media (max-width: 768px) {
  .device-detector {
    padding: 12px;
  }

  .info-panel,
  .content-panel {
    padding: 16px;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-item label {
    margin-bottom: 4px;
  }
}
</style>
```

### 使用指令进行条件渲染

@ldesign/device 提供了 Vue 指令，可以更声明式地根据设备类型控制元素显示：

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'

const { deviceType } = useDevice()
</script>

<template>
  <div class="app">
    <!-- 仅在移动设备显示 -->
    <nav v-device="'mobile'" class="mobile-nav">
      <div class="hamburger-menu">☰</div>
      <h1>移动端导航</h1>
    </nav>

    <!-- 仅在平板设备显示 -->
    <nav v-device="'tablet'" class="tablet-nav">
      <h1>平板端导航</h1>
      <ul class="nav-menu">
        <li>首页</li>
        <li>产品</li>
        <li>关于</li>
      </ul>
    </nav>

    <!-- 仅在桌面设备显示 -->
    <nav v-device="'desktop'" class="desktop-nav">
      <h1>桌面端导航</h1>
      <ul class="nav-menu-full">
        <li>首页</li>
        <li>产品</li>
        <li>服务</li>
        <li>案例</li>
        <li>关于</li>
        <li>联系</li>
      </ul>
    </nav>

    <!-- 在移动或平板设备显示（多设备匹配） -->
    <aside v-device="['mobile', 'tablet']" class="mobile-sidebar">
      <p>移动端侧边栏</p>
    </aside>

    <!-- 反向匹配：非移动设备显示 -->
    <aside v-device="{ type: 'mobile', inverse: true }" class="desktop-sidebar">
      <h3>桌面端侧边栏</h3>
      <ul>
        <li>高级功能 1</li>
        <li>高级功能 2</li>
        <li>高级功能 3</li>
      </ul>
    </aside>

    <!-- 主要内容区域 -->
    <main>
      <h2>当前设备类型：{{ deviceType }}</h2>
    </main>
  </div>
</template>
```

---

## 原生 JavaScript 实现方式

如果您不使用 Vue，也可以直接使用核心 API：

### 基础使用

```typescript
import { DeviceDetector } from '@ldesign/device'

// 创建设备检测器实例
const detector = new DeviceDetector({
  enableResize: true,        // 启用窗口大小变化监听
  enableOrientation: true,   // 启用屏幕方向变化监听
  debounceDelay: 300,        // 防抖延迟（毫秒）
  breakpoints: {             // 自定义断点
    mobile: 768,             // 小于 768px 为移动设备
    tablet: 1024,            // 768px - 1024px 为平板设备
  },
})

// 获取设备信息
const deviceInfo = detector.getDeviceInfo()

console.log('设备类型:', deviceInfo.type)              // 'mobile' | 'tablet' | 'desktop'
console.log('屏幕方向:', deviceInfo.orientation)        // 'portrait' | 'landscape'
console.log('屏幕尺寸:', deviceInfo.width, deviceInfo.height)
console.log('设备像素比:', deviceInfo.pixelRatio)
console.log('触摸设备:', deviceInfo.isTouchDevice)
console.log('操作系统:', deviceInfo.os.name)
console.log('浏览器:', deviceInfo.browser.name)

// 使用便捷方法
if (detector.isMobile()) {
  console.log('当前是移动设备')
  // 执行移动端特定逻辑
  initMobileLayout()
} else if (detector.isTablet()) {
  console.log('当前是平板设备')
  // 执行平板端特定逻辑
  initTabletLayout()
} else if (detector.isDesktop()) {
  console.log('当前是桌面设备')
  // 执行桌面端特定逻辑
  initDesktopLayout()
}

// 检测触摸设备
if (detector.isTouchDevice()) {
  console.log('支持触摸操作')
  enableTouchGestures()
} else {
  console.log('不支持触摸操作')
  enableMouseInteractions()
}
```

### 监听设备变化

```typescript
import { DeviceDetector } from '@ldesign/device'

const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true,
})

// 监听设备变化事件
detector.on('deviceChange', (deviceInfo) => {
  console.log('设备信息变化:', deviceInfo)

  // 根据新的设备类型更新界面
  updateLayout(deviceInfo.type)

  // 显示通知
  showNotification(`设备切换为: ${deviceInfo.type}`)
})

// 监听屏幕方向变化
detector.on('orientationChange', (orientation) => {
  console.log('屏幕方向变化:', orientation)

  if (orientation === 'landscape') {
    console.log('切换到横屏模式')
    enableLandscapeMode()
  } else {
    console.log('切换到竖屏模式')
    enablePortraitMode()
  }
})

// 监听窗口大小变化
detector.on('resize', ({ width, height }) => {
  console.log('窗口大小变化:', width, height)

  // 根据新的尺寸调整布局
  adjustLayoutForSize(width, height)
})

// 辅助函数示例
function updateLayout(deviceType) {
  const body = document.body

  // 移除所有设备类型相关的 class
  body.classList.remove('mobile-layout', 'tablet-layout', 'desktop-layout')

  // 添加当前设备类型的 class
  body.classList.add(`${deviceType}-layout`)
}

function enableLandscapeMode() {
  document.body.classList.add('landscape-mode')
  document.body.classList.remove('portrait-mode')
}

function enablePortraitMode() {
  document.body.classList.add('portrait-mode')
  document.body.classList.remove('landscape-mode')
}

function adjustLayoutForSize(width, height) {
  const container = document.querySelector('.container')
  if (container) {
    container.style.maxWidth = `${width}px`
  }
}
```

### 完整的 HTML 示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>设备检测示例</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
      margin-bottom: 24px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-card {
      background: #f9f9f9;
      border-radius: 8px;
      padding: 16px;
      border-left: 4px solid #2196f3;
    }

    .info-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .device-type-mobile .info-card { border-left-color: #f44336; }
    .device-type-tablet .info-card { border-left-color: #ff9800; }
    .device-type-desktop .info-card { border-left-color: #4caf50; }

    .alert {
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      display: none;
    }

    .alert-info {
      background: #e3f2fd;
      color: #1976d2;
      border: 1px solid #90caf9;
    }

    .alert-success {
      background: #e8f5e9;
      color: #388e3c;
      border: 1px solid #81c784;
    }

    /* 移动端样式 */
    @media (max-width: 768px) {
      body {
        padding: 12px;
      }

      .container {
        padding: 16px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>设备检测示例</h1>

    <div id="alert-container"></div>

    <div class="info-grid" id="info-grid">
      <!-- 信息卡片将通过 JavaScript 动态插入 -->
    </div>
  </div>

  <script type="module">
    import { DeviceDetector } from '@ldesign/device'

    // 创建检测器实例
    const detector = new DeviceDetector({
      enableResize: true,
      enableOrientation: true,
      debounceDelay: 300,
    })

    // 更新界面的函数
    function updateUI() {
      const deviceInfo = detector.getDeviceInfo()
      const container = document.querySelector('.container')
      const infoGrid = document.getElementById('info-grid')

      // 更新容器类名
      container.className = `container device-type-${deviceInfo.type}`

      // 创建信息卡片
      infoGrid.innerHTML = `
        <div class="info-card">
          <div class="info-label">设备类型</div>
          <div class="info-value">${deviceInfo.type}</div>
        </div>
        <div class="info-card">
          <div class="info-label">屏幕方向</div>
          <div class="info-value">${deviceInfo.orientation === 'portrait' ? '竖屏' : '横屏'}</div>
        </div>
        <div class="info-card">
          <div class="info-label">屏幕尺寸</div>
          <div class="info-value">${deviceInfo.width} × ${deviceInfo.height}</div>
        </div>
        <div class="info-card">
          <div class="info-label">触摸支持</div>
          <div class="info-value">${deviceInfo.isTouchDevice ? '是' : '否'}</div>
        </div>
        <div class="info-card">
          <div class="info-label">设备像素比</div>
          <div class="info-value">${deviceInfo.pixelRatio}</div>
        </div>
        <div class="info-card">
          <div class="info-label">操作系统</div>
          <div class="info-value">${deviceInfo.os.name}</div>
        </div>
        <div class="info-card">
          <div class="info-label">浏览器</div>
          <div class="info-value">${deviceInfo.browser.name}</div>
        </div>
      `
    }

    // 显示提示消息
    function showAlert(message, type = 'info') {
      const alertContainer = document.getElementById('alert-container')
      const alert = document.createElement('div')
      alert.className = `alert alert-${type}`
      alert.textContent = message
      alert.style.display = 'block'

      alertContainer.appendChild(alert)

      // 3秒后自动隐藏
      setTimeout(() => {
        alert.style.display = 'none'
        alert.remove()
      }, 3000)
    }

    // 初始化界面
    updateUI()

    // 监听设备变化
    detector.on('deviceChange', (deviceInfo) => {
      updateUI()
      showAlert(`设备类型切换为: ${deviceInfo.type}`, 'info')
    })

    // 监听屏幕方向变化
    detector.on('orientationChange', (orientation) => {
      updateUI()
      showAlert(`屏幕方向变为: ${orientation === 'portrait' ? '竖屏' : '横屏'}`, 'success')
    })

    // 监听窗口大小变化
    detector.on('resize', ({ width, height }) => {
      updateUI()
    })

    // 清理：页面卸载时销毁检测器
    window.addEventListener('beforeunload', () => {
      detector.destroy()
    })
  </script>
</body>
</html>
```

---

## 代码解释

### Vue 3 版本关键点

1. **useDevice Composable**：这是 Vue 3 Composition API 风格的钩子，返回响应式的设备信息
2. **自动响应**：所有返回值都是响应式的，当设备状态改变时，组件会自动重新渲染
3. **生命周期管理**：composable 内部自动处理初始化和清理工作
4. **指令支持**：`v-device` 指令提供声明式的条件渲染方式

### 原生 JavaScript 版本关键点

1. **DeviceDetector 类**：核心检测器，提供所有检测功能
2. **事件系统**：使用 `.on()` 方法监听各种设备变化事件
3. **手动管理**：需要手动调用 `.destroy()` 清理资源
4. **灵活性**：可以在任何 JavaScript 环境中使用

---

## 扩展建议

1. **性能优化**
   - 合理设置 `debounceDelay` 避免频繁触发
   - 只启用需要的监听器（resize、orientation）
   - 在不需要时及时销毁检测器实例

2. **用户体验优化**
   - 在设备类型切换时添加平滑过渡动画
   - 提供横屏竖屏切换的友好提示
   - 为触摸设备增大可点击区域

3. **功能扩展**
   - 结合网络状态检测实现自适应加载
   - 结合电池状态实现省电模式
   - 根据设备性能调整动画和特效

4. **调试技巧**
   - 使用浏览器开发者工具的设备模拟功能测试
   - 在真实设备上验证检测结果
   - 添加日志记录设备变化历史

---

## 相关链接

- [响应式设计示例](./responsive.md) - 学习如何构建响应式布局
- [网络状态监听示例](./network.md) - 了解网络状态检测
- [电池监控示例](./battery.md) - 实现电池状态监控
- [地理位置示例](./geolocation.md) - 获取用户地理位置
- [API 参考文档](../api/) - 查看完整 API 文档
- [最佳实践指南](../guide/best-practices.md) - 了解使用建议
