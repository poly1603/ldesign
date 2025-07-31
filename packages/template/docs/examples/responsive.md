# 响应式模板示例

本示例展示如何创建适配不同设备的响应式模板。

## 创建多设备模板

### 桌面端模板

```vue
<!-- src/templates/dashboard/desktop/admin/index.vue -->
<script setup lang="ts">
interface Props {
  title?: string
  menuItems?: Array<{ id: string, title: string }>
}

withDefaults(defineProps<Props>(), {
  title: '管理后台',
  menuItems: () => [
    { id: '1', title: '首页' },
    { id: '2', title: '用户管理' },
    { id: '3', title: '设置' }
  ]
})
</script>

<template>
  <div class="desktop-dashboard">
    <aside class="sidebar">
      <nav class="nav-menu">
        <div v-for="item in menuItems" :key="item.id" class="nav-item">
          {{ item.title }}
        </div>
      </nav>
    </aside>
    <main class="main-content">
      <header class="header">
        <h1>{{ title }}</h1>
      </header>
      <div class="content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.desktop-dashboard {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  background: #ecf0f1;
  border-bottom: 1px solid #bdc3c7;
}
</style>
```

### 移动端模板

```vue
<!-- src/templates/dashboard/mobile/admin/index.vue -->
<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  menuItems?: Array<{ id: string, title: string }>
}

withDefaults(defineProps<Props>(), {
  title: '管理后台',
  menuItems: () => [
    { id: '1', title: '首页' },
    { id: '2', title: '用户管理' },
    { id: '3', title: '设置' }
  ]
})

const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}
</script>

<template>
  <div class="mobile-dashboard">
    <header class="mobile-header">
      <button class="menu-toggle" @click="toggleMenu">
        ☰
      </button>
      <h1>{{ title }}</h1>
    </header>
    
    <nav v-if="showMenu" class="mobile-nav">
      <div v-for="item in menuItems" :key="item.id" class="nav-item">
        {{ item.title }}
      </div>
    </nav>
    
    <main class="mobile-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.mobile-dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.mobile-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #2c3e50;
  color: white;
}

.menu-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.mobile-nav {
  background: #34495e;
  color: white;
}

.mobile-main {
  flex: 1;
  overflow-y: auto;
}
</style>
```

## 自动设备适配

```vue
<script setup lang="ts">
const dashboardProps = {
  title: '响应式仪表板',
  menuItems: [
    { id: '1', title: '首页' },
    { id: '2', title: '数据分析' },
    { id: '3', title: '用户管理' }
  ]
}
</script>

<template>
  <div class="app">
    <!-- 自动根据设备选择模板 -->
    <LTemplateRenderer
      category="dashboard"
      template="admin"
      :template-props="dashboardProps"
    />
  </div>
</template>
```

## 手动设备切换

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { DeviceType } from '@ldesign/template'

const devices: DeviceType[] = ['desktop', 'tablet', 'mobile']
const deviceLabels = {
  desktop: '桌面端',
  tablet: '平板端',
  mobile: '移动端'
}

const currentDevice = ref<DeviceType>('desktop')

const dashboardProps = {
  title: '设备切换示例'
}

function switchDevice(device: DeviceType) {
  currentDevice.value = device
}
</script>

<template>
  <div class="app">
    <div class="device-switcher">
      <button 
        v-for="device in devices" 
        :key="device"
        :class="{ active: currentDevice === device }"
        @click="switchDevice(device)"
      >
        {{ deviceLabels[device] }}
      </button>
    </div>
    
    <LTemplateRenderer
      category="dashboard"
      :device="currentDevice"
      template="admin"
      :template-props="dashboardProps"
    />
  </div>
</template>

<style scoped>
.device-switcher {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.device-switcher button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.device-switcher button.active {
  background: #007bff;
  color: white;
}
</style>
```

## 设备检测监听

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { createDeviceWatcher } from '@ldesign/template'

const currentDevice = ref('unknown')

let deviceWatcher: (() => void) | null = null

onMounted(() => {
  // 创建设备监听器
  deviceWatcher = createDeviceWatcher((newDevice, oldDevice) => {
    currentDevice.value = newDevice
    console.log(`设备从 ${oldDevice} 切换到 ${newDevice}`)
  })
})

onUnmounted(() => {
  // 清理监听器
  deviceWatcher?.()
})

const dashboardProps = {
  title: '设备检测示例'
}
</script>

<template>
  <div class="app">
    <div class="device-info">
      当前设备: {{ currentDevice }}
    </div>
    
    <LTemplateRenderer
      category="dashboard"
      template="admin"
      :template-props="dashboardProps"
    />
  </div>
</template>
```

这个示例展示了如何创建响应式模板，实现多设备适配。
