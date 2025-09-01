# 组合式 API

@ldesign/device 提供了一系列强大的组合式 API，让你能够在 Vue 3 组件中轻松使用设备检测功能。

## 🎯 useDevice

基础设备检测组合式函数，提供设备类型、屏幕方向、触摸支持等信息。

### 基础用法

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType,
  orientation,
  deviceInfo,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  refresh
} = useDevice()
</script>

<template>
  <div>
    <h3>设备信息</h3>
    <p>设备类型: {{ deviceType }}</p>
    <p>屏幕方向: {{ orientation }}</p>
    <p>是否移动设备: {{ isMobile }}</p>
    <p>是否支持触摸: {{ isTouchDevice }}</p>
    
    <button @click="refresh">刷新设备信息</button>
    
    <details>
      <summary>详细信息</summary>
      <pre>{{ JSON.stringify(deviceInfo, null, 2) }}</pre>
    </details>
  </div>
</template>
```

### 自定义配置

```vue
<script setup>
import { useDevice } from '@ldesign/device/vue'

const {
  deviceType,
  orientation,
  isMobile
} = useDevice({
  enableResize: true,
  enableOrientation: true,
  breakpoints: {
    mobile: 640,
    tablet: 768,
    desktop: 1024
  },
  debounceTime: 200
})

// 监听设备类型变化
watch(deviceType, (newType) => {
  console.log('设备类型变化:', newType)
  
  // 根据设备类型执行不同逻辑
  if (newType === 'mobile') {
    // 移动端逻辑
  } else if (newType === 'tablet') {
    // 平板逻辑
  } else {
    // 桌面逻辑
  }
})
</script>
```

### 返回值

```typescript
interface UseDeviceReturn {
  /** 当前设备类型 */
  deviceType: Readonly<Ref<DeviceType>>
  
  /** 当前屏幕方向 */
  orientation: Readonly<Ref<Orientation>>
  
  /** 完整设备信息 */
  deviceInfo: Readonly<Ref<DeviceInfo>>
  
  /** 是否为移动设备 */
  isMobile: Readonly<ComputedRef<boolean>>
  
  /** 是否为平板设备 */
  isTablet: Readonly<ComputedRef<boolean>>
  
  /** 是否为桌面设备 */
  isDesktop: Readonly<ComputedRef<boolean>>
  
  /** 是否支持触摸 */
  isTouchDevice: Readonly<ComputedRef<boolean>>
  
  /** 刷新设备信息 */
  refresh: () => void
}
```

## 🌐 useNetwork

网络状态检测组合式函数，提供网络连接状态、连接类型、网络速度等信息。

### 基础用法

```vue
<script setup>
import { useNetwork } from '@ldesign/device/vue'

const {
  networkInfo,
  isOnline,
  connectionType,
  isLoaded,
  loadModule,
  unloadModule
} = useNetwork()

// 加载网络模块
onMounted(async () => {
  try {
    await loadModule()
    console.log('网络模块加载成功')
  } catch (error) {
    console.warn('网络模块加载失败:', error)
  }
})
</script>

<template>
  <div>
    <h3>网络状态</h3>
    
    <div v-if="!isLoaded">
      <p>正在加载网络模块...</p>
    </div>
    
    <div v-else-if="networkInfo">
      <p>连接状态: 
        <span :class="{ online: isOnline, offline: !isOnline }">
          {{ isOnline ? '在线' : '离线' }}
        </span>
      </p>
      <p>连接类型: {{ connectionType }}</p>
      <p v-if="networkInfo.downlink">下载速度: {{ networkInfo.downlink.toFixed(1) }} Mbps</p>
      <p v-if="networkInfo.rtt">网络延迟: {{ networkInfo.rtt }} ms</p>
      <p v-if="networkInfo.saveData !== undefined">
        省流模式: {{ networkInfo.saveData ? '开启' : '关闭' }}
      </p>
    </div>
    
    <div v-else>
      <p>网络信息不可用</p>
    </div>
  </div>
</template>

<style scoped>
.online { color: #28a745; }
.offline { color: #dc3545; }
</style>
```

### 网络状态监听

```vue
<script setup>
import { useNetwork } from '@ldesign/device/vue'

const { networkInfo, isOnline, loadModule } = useNetwork()

// 监听网络状态变化
watch(isOnline, (online) => {
  if (online) {
    console.log('网络已连接')
    // 恢复网络相关功能
  } else {
    console.log('网络已断开')
    // 启用离线模式
  }
})

// 监听网络信息变化
watch(networkInfo, (info) => {
  if (info) {
    console.log('网络信息更新:', info)
    
    // 根据网络速度调整功能
    if (info.downlink && info.downlink < 1) {
      console.log('网络较慢，启用省流模式')
    }
  }
}, { deep: true })

onMounted(() => {
  loadModule()
})
</script>
```

## 🔋 useBattery

电池状态检测组合式函数，提供电池电量、充电状态、电池健康等信息。

### 基础用法

```vue
<script setup>
import { useBattery } from '@ldesign/device/vue'

const {
  batteryInfo,
  batteryLevel,
  isCharging,
  batteryStatus,
  isLoaded,
  error,
  batteryPercentage,
  isLowBattery,
  isCriticalBattery,
  loadModule,
  refresh
} = useBattery()

// 加载电池模块
onMounted(async () => {
  try {
    await loadModule()
  } catch (err) {
    console.warn('设备不支持电池 API:', err)
  }
})
</script>

<template>
  <div>
    <h3>电池状态</h3>
    
    <div v-if="error">
      <p class="error">{{ error }}</p>
    </div>
    
    <div v-else-if="!isLoaded">
      <p>正在加载电池模块...</p>
    </div>
    
    <div v-else-if="batteryInfo">
      <!-- 电池图标 -->
      <div class="battery-indicator">
        <div 
          class="battery-level" 
          :class="{
            charging: isCharging,
            low: isLowBattery,
            critical: isCriticalBattery
          }"
          :style="{ width: `${batteryPercentage}%` }"
        ></div>
      </div>
      
      <p>电量: {{ batteryPercentage }}%</p>
      <p>状态: {{ isCharging ? '充电中' : '未充电' }}</p>
      <p>电池状态: {{ batteryStatus }}</p>
      
      <div v-if="isLowBattery" class="warning">
        ⚠️ 电量不足，请及时充电
      </div>
      
      <div v-if="isCriticalBattery" class="critical">
        🚨 电量严重不足！
      </div>
      
      <button @click="refresh">刷新电池信息</button>
    </div>
    
    <div v-else>
      <p>电池信息不可用</p>
    </div>
  </div>
</template>

<style scoped>
.battery-indicator {
  width: 100px;
  height: 20px;
  border: 2px solid #ccc;
  border-radius: 4px;
  position: relative;
  margin: 10px 0;
}

.battery-level {
  height: 100%;
  background: #28a745;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.battery-level.charging {
  background: linear-gradient(90deg, #28a745, #20c997);
  animation: charging 2s infinite;
}

.battery-level.low {
  background: #ffc107;
}

.battery-level.critical {
  background: #dc3545;
}

@keyframes charging {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.warning { color: #ffc107; }
.critical { color: #dc3545; }
.error { color: #dc3545; }
</style>
```

## 📍 useGeolocation

地理位置检测组合式函数，提供位置获取、位置监听、精度控制等功能。

### 基础用法

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'

const {
  position,
  latitude,
  longitude,
  accuracy,
  error,
  isSupported,
  isWatching,
  isLoaded,
  isLoading,
  hasPosition,
  coordinates,
  loadModule,
  getCurrentPosition,
  startWatching,
  stopWatching
} = useGeolocation()

// 加载地理位置模块
onMounted(async () => {
  try {
    await loadModule()
    if (isSupported.value) {
      await getCurrentPosition()
    }
  } catch (err) {
    console.warn('无法获取地理位置:', err)
  }
})
</script>

<template>
  <div>
    <h3>地理位置</h3>
    
    <div v-if="!isSupported">
      <p>设备不支持地理位置 API</p>
    </div>
    
    <div v-else-if="error">
      <p class="error">获取位置失败: {{ error }}</p>
      <button @click="getCurrentPosition">重试</button>
    </div>
    
    <div v-else-if="isLoading">
      <p>正在获取位置信息...</p>
    </div>
    
    <div v-else-if="hasPosition">
      <h4>当前位置</h4>
      <p>纬度: {{ latitude?.toFixed(6) }}</p>
      <p>经度: {{ longitude?.toFixed(6) }}</p>
      <p>精度: {{ accuracy }}米</p>
      <p v-if="altitude">海拔: {{ altitude }}米</p>
      <p v-if="heading">方向: {{ heading }}°</p>
      <p v-if="speed">速度: {{ speed }}m/s</p>
      
      <div class="actions">
        <button @click="getCurrentPosition">更新位置</button>
        <button v-if="!isWatching" @click="startWatching">
          开始监听位置变化
        </button>
        <button v-else @click="stopWatching">
          停止监听位置变化
        </button>
      </div>
      
      <!-- 地图链接 -->
      <div v-if="coordinates" class="map-links">
        <a 
          :href="`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`"
          target="_blank"
        >
          在 Google 地图中查看
        </a>
      </div>
    </div>
    
    <div v-else>
      <p>暂无位置信息</p>
      <button @click="getCurrentPosition">获取位置</button>
    </div>
  </div>
</template>

<style scoped>
.actions {
  margin: 10px 0;
  display: flex;
  gap: 10px;
}

.map-links {
  margin-top: 10px;
}

.map-links a {
  color: #007bff;
  text-decoration: none;
}

.error {
  color: #dc3545;
}
</style>
```

### 高精度定位

```vue
<script setup>
import { useGeolocation } from '@ldesign/device/vue'

const { getCurrentPosition, startWatching } = useGeolocation()

// 高精度定位选项
const highAccuracyOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000
}

async function getHighAccuracyPosition() {
  try {
    await getCurrentPosition(highAccuracyOptions)
  } catch (error) {
    console.error('高精度定位失败:', error)
  }
}

function startHighAccuracyWatching() {
  startWatching(highAccuracyOptions)
}
</script>
```

## 🔄 useOrientation

屏幕方向检测组合式函数，提供方向检测、方向锁定等功能。

### 基础用法

```vue
<script setup>
import { useOrientation } from '@ldesign/device/vue'

const {
  orientation,
  angle,
  isLocked,
  isPortrait,
  isLandscape,
  isOrientationLockSupported,
  lockOrientation,
  unlockOrientation,
  refresh
} = useOrientation()

// 监听方向变化
watch(orientation, (newOrientation) => {
  console.log('屏幕方向变化:', newOrientation)
})
</script>

<template>
  <div>
    <h3>屏幕方向</h3>
    
    <p>当前方向: {{ orientation }}</p>
    <p>旋转角度: {{ angle }}°</p>
    <p>是否竖屏: {{ isPortrait }}</p>
    <p>是否横屏: {{ isLandscape }}</p>
    <p>是否已锁定: {{ isLocked ? '是' : '否' }}</p>
    
    <div v-if="isOrientationLockSupported" class="orientation-controls">
      <h4>方向控制</h4>
      <button @click="lockOrientation('portrait')">锁定竖屏</button>
      <button @click="lockOrientation('landscape')">锁定横屏</button>
      <button @click="unlockOrientation" :disabled="!isLocked">解锁方向</button>
    </div>
    
    <div v-else>
      <p>设备不支持方向锁定</p>
    </div>
  </div>
</template>

<style scoped>
.orientation-controls {
  margin-top: 20px;
}

.orientation-controls button {
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
```

## 📏 useBreakpoints

响应式断点管理组合式函数，提供基于屏幕宽度的断点检测。

### 基础用法

```vue
<script setup>
import { useBreakpoints } from '@ldesign/device/vue'

const {
  current,
  width,
  height,
  isMobile,
  isTablet,
  isDesktop,
  isSmallScreen,
  isMediumScreen,
  isLargeScreen,
  aspectRatio,
  greaterThan,
  lessThan,
  between,
  breakpoints
} = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  xl: 1400
})

// 监听断点变化
watch(current, (newBreakpoint) => {
  console.log('断点变化:', newBreakpoint)
})
</script>

<template>
  <div>
    <h3>响应式断点</h3>
    
    <p>当前断点: {{ current }}</p>
    <p>屏幕尺寸: {{ width }}×{{ height }}</p>
    <p>屏幕比例: {{ aspectRatio.toFixed(2) }}</p>
    
    <div class="breakpoint-status">
      <p>是否移动端: {{ isMobile }}</p>
      <p>是否平板: {{ isTablet }}</p>
      <p>是否桌面: {{ isDesktop }}</p>
    </div>
    
    <div class="size-categories">
      <p>小屏幕: {{ isSmallScreen }}</p>
      <p>中等屏幕: {{ isMediumScreen }}</p>
      <p>大屏幕: {{ isLargeScreen }}</p>
    </div>
    
    <div class="breakpoint-comparisons">
      <p>大于平板: {{ greaterThan('tablet') }}</p>
      <p>小于桌面: {{ lessThan('desktop') }}</p>
      <p>平板到桌面之间: {{ between('tablet', 'desktop') }}</p>
    </div>
    
    <div class="responsive-content">
      <div v-if="isMobile" class="mobile-content">
        📱 移动端布局
      </div>
      <div v-else-if="isTablet" class="tablet-content">
        📱 平板布局
      </div>
      <div v-else class="desktop-content">
        💻 桌面布局
      </div>
    </div>
  </div>
</template>

<style scoped>
.breakpoint-status,
.size-categories,
.breakpoint-comparisons {
  margin: 15px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.responsive-content {
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  border-radius: 8px;
}

.mobile-content {
  background: #e3f2fd;
  color: #1976d2;
}

.tablet-content {
  background: #f3e5f5;
  color: #7b1fa2;
}

.desktop-content {
  background: #e8f5e8;
  color: #388e3c;
}
</style>
```

## 🔗 相关链接

- [Vue 插件](./plugin.md) - 插件安装和配置
- [自定义指令](./directives.md) - 使用自定义指令
- [Vue 组件](./components.md) - 使用预制组件
- [API 参考](../api/reference.md) - 完整的 API 文档
