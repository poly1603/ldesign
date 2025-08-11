<script setup>
import BatteryInfoCard from './components/BatteryInfoCard.vue'
import DebugTest from './components/DebugTest.vue'
import DeviceInfoCard from './components/DeviceInfoCard.vue'
import EventLog from './components/EventLog.vue'
import GeolocationCard from './components/GeolocationCard.vue'
import NetworkInfoCard from './components/NetworkInfoCard.vue'
import PerformanceCard from './components/PerformanceCard.vue'
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>@ldesign/device</h1>
      <p>Vue 3 使用示例</p>
    </header>

    <main class="main">
      <div class="grid">
        <!-- 设备信息卡片 -->
        <DeviceInfoCard />

        <!-- 网络信息卡片 -->
        <NetworkInfoCard />

        <!-- 电池信息卡片 -->
        <BatteryInfoCard />

        <!-- 地理位置信息卡片 -->
        <GeolocationCard />

        <!-- 性能监控卡片 -->
        <PerformanceCard />

        <!-- 调试信息 -->
        <DebugTest />
      </div>

      <!-- 指令示例 -->
      <!-- <DirectiveExample /> -->

      <!-- 高级功能演示 -->
      <!-- <AdvancedFeatures /> -->

      <!-- 事件日志 -->
      <EventLog />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.app {
  min-height: 100vh;
  padding: 20px;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 3rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main {
  max-width: 1200px;
  margin: 0 auto;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2.5rem;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .app {
    padding: 15px;
  }
}
</style>
