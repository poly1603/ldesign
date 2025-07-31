# Vue Device Detection Example

这是一个使用 `@ldesign/device` 库的 Vue 示例项目，展示了如何在 Vue 应用中集成和使用设备检测功能。

## 🚀 功能特性

### 核心功能
- **设备类型检测**: 自动识别移动设备、平板和桌面设备
- **响应式设计**: 根据设备类型自动调整界面布局
- **方向检测**: 监听设备方向变化（横屏/竖屏）
- **窗口大小监听**: 实时响应窗口大小变化

### 高级功能
- **网络状态监测**: 检测网络连接状态和类型
- **电池信息**: 获取设备电池电量和充电状态
- **地理位置**: 获取用户地理位置信息
- **模块化加载**: 按需加载功能模块

### Vue 集成特性
- **Composables**: 使用 `useDevice`、`useNetwork`、`useBattery`、`useGeolocation` 等组合式 API
- **指令系统**: 支持 `v-device`、`v-device-mobile`、`v-device-tablet`、`v-device-desktop` 指令
- **事件系统**: 完整的事件监听和处理机制
- **TypeScript 支持**: 完整的类型定义和智能提示

## 📦 快速开始

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 应用将在 http://localhost:3000 启动
```

### 构建生产版本

```bash
# 构建项目
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
vue-example/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── DeviceInfoCard.vue      # 设备信息卡片
│   │   ├── NetworkInfoCard.vue     # 网络信息卡片
│   │   ├── BatteryInfoCard.vue     # 电池信息卡片
│   │   ├── GeolocationCard.vue     # 地理位置卡片
│   │   ├── DirectiveExample.vue    # 指令示例
│   │   └── EventLog.vue            # 事件日志
│   ├── App.vue              # 主应用组件
│   └── main.js              # 应用入口
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
├── package.json             # 项目配置
└── README.md                # 项目文档
```

## 🔧 核心用法

### 1. 插件安装

```javascript
// main.js
import { createApp } from 'vue'
import { createDevicePlugin } from '@ldesign/device/vue'
import App from './App.vue'

const app = createApp(App)

// 安装设备检测插件
app.use(createDevicePlugin({
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 300
}))

app.mount('#app')
```

### 2. 使用 Composables

```vue
<template>
  <div>
    <h2>当前设备: {{ deviceType }}</h2>
    <p>屏幕尺寸: {{ deviceInfo.width }} × {{ deviceInfo.height }}</p>
    <p>设备方向: {{ orientation }}</p>
  </div>
</template>

<script setup>
import { useDevice } from '@ldesign/device/vue'

const { deviceType, deviceInfo, orientation } = useDevice()
</script>
```

### 3. 使用指令

```vue
<template>
  <!-- 基础指令 -->
  <div v-device="'mobile'">仅在移动设备显示</div>
  <div v-device="'tablet'">仅在平板设备显示</div>
  <div v-device="'desktop'">仅在桌面设备显示</div>
  
  <!-- 多设备类型 -->
  <div v-device="['mobile', 'tablet']">在移动设备和平板显示</div>
  
  <!-- 反向指令 -->
  <div v-device="{ type: 'mobile', inverse: true }">在非移动设备显示</div>
  
  <!-- 专用指令 -->
  <div v-device-mobile>移动设备专用</div>
  <div v-device-tablet>平板设备专用</div>
  <div v-device-desktop>桌面设备专用</div>
</template>
```

### 4. 网络状态监测

```vue
<template>
  <div>
    <p>网络状态: {{ networkInfo.online ? '在线' : '离线' }}</p>
    <p>连接类型: {{ networkInfo.type }}</p>
    <p>下载速度: {{ networkInfo.downlink }} Mbps</p>
  </div>
</template>

<script setup>
import { useNetwork } from '@ldesign/device/vue'

const { networkInfo, loadModule } = useNetwork()

// 加载网络模块
loadModule()
</script>
```

### 5. 电池信息

```vue
<template>
  <div>
    <p>电池电量: {{ Math.round(batteryInfo.level * 100) }}%</p>
    <p>充电状态: {{ batteryInfo.charging ? '充电中' : '未充电' }}</p>
    <p>剩余时间: {{ batteryInfo.dischargingTime }} 分钟</p>
  </div>
</template>

<script setup>
import { useBattery } from '@ldesign/device/vue'

const { batteryInfo, loadModule } = useBattery()

// 加载电池模块
loadModule()
</script>
```

### 6. 地理位置

```vue
<template>
  <div>
    <div v-if="loading">正在获取位置...</div>
    <div v-else-if="error">获取位置失败: {{ error.message }}</div>
    <div v-else-if="position">
      <p>纬度: {{ position.coords.latitude }}</p>
      <p>经度: {{ position.coords.longitude }}</p>
      <p>精度: {{ position.coords.accuracy }} 米</p>
    </div>
  </div>
</template>

<script setup>
import { useGeolocation } from '@ldesign/device/vue'

const { position, loading, error, loadModule, getCurrentPosition } = useGeolocation()

// 加载地理位置模块
loadModule()

// 获取当前位置
getCurrentPosition()
</script>
```

### 7. 事件监听

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'
import { onMounted, onUnmounted } from 'vue'

const { deviceDetector } = useDevice()

const handleDeviceChange = (deviceInfo) => {
  console.log('设备类型变化:', deviceInfo)
}

const handleOrientationChange = (orientation) => {
  console.log('方向变化:', orientation)
}

onMounted(() => {
  if (deviceDetector.value) {
    deviceDetector.value.on('deviceChange', handleDeviceChange)
    deviceDetector.value.on('orientationChange', handleOrientationChange)
  }
})

onUnmounted(() => {
  if (deviceDetector.value) {
    deviceDetector.value.off('deviceChange', handleDeviceChange)
    deviceDetector.value.off('orientationChange', handleOrientationChange)
  }
})
</script>
```

## 🌐 浏览器兼容性

- **现代浏览器**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **移动浏览器**: iOS Safari 12+, Chrome Mobile 60+
- **功能降级**: 在不支持的浏览器中自动禁用高级功能

## 📱 测试建议

### 桌面测试
1. 调整浏览器窗口大小测试响应式布局
2. 使用开发者工具模拟不同设备
3. 测试网络状态变化（离线/在线）

### 移动设备测试
1. 在真实移动设备上测试
2. 旋转设备测试方向检测
3. 测试电池 API（需要 HTTPS）
4. 测试地理位置 API（需要用户授权）

## ⚠️ 重要说明

### HTTPS 要求
某些功能需要在 HTTPS 环境下才能正常工作：
- 地理位置 API
- 电池 API（部分浏览器）
- Service Worker 相关功能

### 权限要求
某些功能需要用户授权：
- **地理位置**: 需要用户允许位置访问
- **通知**: 需要用户允许通知权限

### API 支持
不同浏览器对 Web API 的支持程度不同：
- **电池 API**: 主要在 Chrome 中支持
- **网络信息 API**: 支持有限
- **设备方向 API**: 移动设备支持较好

## 🔗 相关链接

- [设备检测库文档](../../README.md)
- [API 参考](../../docs/api.md)
- [Vue 集成指南](../../docs/vue.md)
- [原生 JavaScript 示例](../vanilla-js/README.md)

## 📄 许可证

MIT License