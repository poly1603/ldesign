<script setup>
import {
  useBattery,
  useDevice,
  useGeolocation,
  useNetwork,
} from '@ldesign/device/vue'
import { onMounted, ref } from 'vue'

const debugInfo = ref([])

function addDebugInfo(message) {
  debugInfo.value.push(`${new Date().toLocaleTimeString()}: ${message}`)
}

onMounted(async () => {
  addDebugInfo('组件已挂载')

  // 测试 useDevice
  try {
    const deviceResult = useDevice()
    addDebugInfo(`useDevice 成功: ${JSON.stringify(Object.keys(deviceResult))}`)
    addDebugInfo(`设备类型: ${deviceResult.deviceType.value}`)
    addDebugInfo(`是否移动设备: ${deviceResult.isMobile.value}`)
  }
  catch (error) {
    addDebugInfo(`useDevice 错误: ${error.message}`)
  }

  // 测试 useNetwork
  try {
    const networkResult = useNetwork()
    addDebugInfo(
      `useNetwork 成功: ${JSON.stringify(Object.keys(networkResult))}`,
    )
    addDebugInfo(`loadModule 类型: ${typeof networkResult.loadModule}`)

    if (typeof networkResult.loadModule === 'function') {
      addDebugInfo('网络模块 loadModule 是函数，尝试调用...')
      try {
        await networkResult.loadModule()
        addDebugInfo('网络模块 loadModule 调用成功')
        addDebugInfo(
          `网络信息: ${JSON.stringify(networkResult.networkInfo.value)}`,
        )
        addDebugInfo(`是否在线: ${networkResult.isOnline.value}`)
      }
      catch (error) {
        addDebugInfo(`网络模块 loadModule 调用失败: ${error.message}`)
      }
    }
    else {
      addDebugInfo('网络模块 loadModule 不是函数！')
    }
  }
  catch (error) {
    addDebugInfo(`useNetwork 错误: ${error.message}`)
  }

  // 测试 useBattery
  try {
    const batteryResult = useBattery()
    addDebugInfo(
      `useBattery 成功: ${JSON.stringify(Object.keys(batteryResult))}`,
    )
    addDebugInfo(`loadModule 类型: ${typeof batteryResult.loadModule}`)

    if (typeof batteryResult.loadModule === 'function') {
      addDebugInfo('电池模块 loadModule 是函数，尝试调用...')
      try {
        await batteryResult.loadModule()
        addDebugInfo('电池模块 loadModule 调用成功')
        addDebugInfo(
          `电池信息: ${JSON.stringify(batteryResult.batteryInfo.value)}`,
        )
        addDebugInfo(`电池电量: ${batteryResult.batteryLevel.value}`)
      }
      catch (error) {
        addDebugInfo(`电池模块 loadModule 调用失败: ${error.message}`)
      }
    }
    else {
      addDebugInfo('电池模块 loadModule 不是函数！')
    }
  }
  catch (error) {
    addDebugInfo(`useBattery 错误: ${error.message}`)
  }

  // 测试 useGeolocation
  try {
    const geoResult = useGeolocation()
    addDebugInfo(
      `useGeolocation 成功: ${JSON.stringify(Object.keys(geoResult))}`,
    )
    addDebugInfo(`loadModule 类型: ${typeof geoResult.loadModule}`)

    if (typeof geoResult.loadModule === 'function') {
      addDebugInfo('地理位置模块 loadModule 是函数，尝试调用...')
      try {
        await geoResult.loadModule()
        addDebugInfo('地理位置模块 loadModule 调用成功')
        addDebugInfo(`是否支持: ${geoResult.isSupported.value}`)
        addDebugInfo(`是否已加载: ${geoResult.isLoaded.value}`)

        // 尝试获取位置（需要用户授权）
        if (geoResult.isSupported.value) {
          try {
            await geoResult.getCurrentPosition()
            addDebugInfo(
              `位置信息: ${JSON.stringify(geoResult.position.value)}`,
            )
          }
          catch (posError) {
            addDebugInfo(`获取位置失败: ${posError.message}`)
          }
        }
      }
      catch (error) {
        addDebugInfo(`地理位置模块 loadModule 调用失败: ${error.message}`)
      }
    }
    else {
      addDebugInfo('地理位置模块 loadModule 不是函数！')
    }
  }
  catch (error) {
    addDebugInfo(`useGeolocation 错误: ${error.message}`)
  }
})
</script>

<template>
  <div class="debug-panel">
    <h3>🔍 调试信息</h3>
    <div class="debug-log">
      <div v-for="(info, index) in debugInfo" :key="index" class="debug-item">
        {{ info }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.debug-panel {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.debug-panel h3 {
  margin: 0 0 12px 0;
  color: #495057;
}

.debug-log {
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
}

.debug-item {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  padding: 2px 0;
  border-bottom: 1px solid #f8f9fa;
}

.debug-item:last-child {
  border-bottom: none;
}
</style>
