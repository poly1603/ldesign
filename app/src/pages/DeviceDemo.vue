<template>
  <div class="device-demo">
    <!-- 页面头部 -->
    <div class="demo-header">
      <div class="header-content">
        <div class="header-badge">
          <span class="badge-icon">📱</span>
          <span class="badge-text">Device System</span>
        </div>
        <h1 class="header-title">设备检测演示</h1>
        <p class="header-subtitle">体验 @ldesign/device 包的强大设备检测功能</p>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.detections }}</span>
            <span class="stat-label">检测次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.avgTime }}ms</span>
            <span class="stat-label">平均耗时</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.modulesLoaded }}</span>
            <span class="stat-label">已加载模块</span>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-content">
      <!-- 设备信息检测 -->
      <section class="demo-section">
        <div class="section-header">
          <div class="section-icon">🔍</div>
          <div class="section-info">
            <h2 class="section-title">设备信息检测</h2>
            <p class="section-description">检测当前设备的基本信息，包括设备类型、操作系统、浏览器等</p>
          </div>
        </div>

        <div class="operation-card">
          <div class="card-content">
            <div class="action-buttons">
              <button @click="handleDeviceDetection" class="btn btn-primary">
                <span class="btn-icon">🔍</span>
                检测设备信息
              </button>
              <button @click="refreshDeviceInfo" class="btn btn-secondary">
                <span class="btn-icon">🔄</span>
                刷新信息
              </button>
              <button @click="clearDeviceData" class="btn btn-outline">
                <span class="btn-icon">🧹</span>
                清空
              </button>
            </div>
          </div>

          <div v-if="deviceInfo" class="result-panel">
            <div class="result-header">
              <span class="result-icon">📋</span>
              <h3 class="result-title">设备信息</h3>
            </div>
            <div class="device-info-grid">
              <div class="info-item">
                <label class="info-label">设备类型：</label>
                <span class="info-value">{{ deviceInfo.type }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">操作系统：</label>
                <span class="info-value">{{ deviceInfo.os?.name }} {{ deviceInfo.os?.version }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">浏览器：</label>
                <span class="info-value">{{ deviceInfo.browser?.name }} {{ deviceInfo.browser?.version }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">屏幕尺寸：</label>
                <span class="info-value">{{ deviceInfo.screen?.width }} × {{ deviceInfo.screen?.height }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">触摸设备：</label>
                <span class="info-value">{{ deviceInfo.isTouchDevice ? '是' : '否' }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">移动设备：</label>
                <span class="info-value">{{ deviceInfo.isMobile ? '是' : '否' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 网络状态检测 -->
      <section class="demo-section">
        <div class="section-header">
          <div class="section-icon">🌐</div>
          <div class="section-info">
            <h2 class="section-title">网络状态检测</h2>
            <p class="section-description">实时监测网络连接状态和连接类型</p>
          </div>
        </div>

        <div class="operation-card">
          <div class="card-content">
            <div class="action-buttons">
              <button @click="handleNetworkDetection" class="btn btn-primary">
                <span class="btn-icon">🌐</span>
                检测网络状态
              </button>
              <button @click="toggleNetworkMonitoring" class="btn btn-secondary">
                <span class="btn-icon">{{ isNetworkMonitoring ? '⏸️' : '▶️' }}</span>
                {{ isNetworkMonitoring ? '停止监控' : '开始监控' }}
              </button>
              <button @click="clearNetworkData" class="btn btn-outline">
                <span class="btn-icon">🧹</span>
                清空
              </button>
            </div>
          </div>

          <div v-if="networkInfo" class="result-panel">
            <div class="result-header">
              <span class="result-icon">🌐</span>
              <h3 class="result-title">网络信息</h3>
            </div>
            <div class="network-info-grid">
              <div class="info-item">
                <label class="info-label">连接状态：</label>
                <span class="info-value" :class="{ 'status-online': networkInfo.status === 'online', 'status-offline': networkInfo.status === 'offline' }">
                  {{ networkInfo.status === 'online' ? '在线' : '离线' }}
                </span>
              </div>
              <div class="info-item">
                <label class="info-label">连接类型：</label>
                <span class="info-value">{{ networkInfo.type || '未知' }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">下行速度：</label>
                <span class="info-value">{{ networkInfo.downlink || '未知' }} Mbps</span>
              </div>
              <div class="info-item">
                <label class="info-label">RTT：</label>
                <span class="info-value">{{ networkInfo.rtt || '未知' }} ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 电池状态检测 -->
      <section class="demo-section">
        <div class="section-header">
          <div class="section-icon">🔋</div>
          <div class="section-info">
            <h2 class="section-title">电池状态检测</h2>
            <p class="section-description">检测设备电池电量和充电状态（需要支持的设备）</p>
          </div>
        </div>

        <div class="operation-card">
          <div class="card-content">
            <div class="action-buttons">
              <button @click="handleBatteryDetection" class="btn btn-primary">
                <span class="btn-icon">🔋</span>
                检测电池状态
              </button>
              <button @click="toggleBatteryMonitoring" class="btn btn-secondary">
                <span class="btn-icon">{{ isBatteryMonitoring ? '⏸️' : '▶️' }}</span>
                {{ isBatteryMonitoring ? '停止监控' : '开始监控' }}
              </button>
              <button @click="clearBatteryData" class="btn btn-outline">
                <span class="btn-icon">🧹</span>
                清空
              </button>
            </div>
          </div>

          <div v-if="batteryInfo" class="result-panel">
            <div class="result-header">
              <span class="result-icon">🔋</span>
              <h3 class="result-title">电池信息</h3>
            </div>
            <div class="battery-info-grid">
              <div class="info-item">
                <label class="info-label">电池电量：</label>
                <span class="info-value">
                  <div class="battery-level">
                    <div class="battery-bar">
                      <div class="battery-fill" :style="{ width: (batteryInfo.level * 100) + '%' }"></div>
                    </div>
                    <span class="battery-percentage">{{ Math.round(batteryInfo.level * 100) }}%</span>
                  </div>
                </span>
              </div>
              <div class="info-item">
                <label class="info-label">充电状态：</label>
                <span class="info-value" :class="{ 'status-charging': batteryInfo.charging, 'status-discharging': !batteryInfo.charging }">
                  {{ batteryInfo.charging ? '充电中' : '未充电' }}
                </span>
              </div>
              <div class="info-item">
                <label class="info-label">充电时间：</label>
                <span class="info-value">{{ formatTime(batteryInfo.chargingTime) }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">放电时间：</label>
                <span class="info-value">{{ formatTime(batteryInfo.dischargingTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 地理位置检测 -->
      <section class="demo-section">
        <div class="section-header">
          <div class="section-icon">📍</div>
          <div class="section-info">
            <h2 class="section-title">地理位置检测</h2>
            <p class="section-description">获取设备的地理位置信息（需要用户授权）</p>
          </div>
        </div>

        <div class="operation-card">
          <div class="card-content">
            <div class="action-buttons">
              <button @click="handleGeolocationDetection" class="btn btn-primary">
                <span class="btn-icon">📍</span>
                获取位置信息
              </button>
              <button @click="watchPosition" class="btn btn-secondary">
                <span class="btn-icon">👁️</span>
                监控位置变化
              </button>
              <button @click="clearGeolocationData" class="btn btn-outline">
                <span class="btn-icon">🧹</span>
                清空
              </button>
            </div>
          </div>

          <div v-if="geolocationInfo" class="result-panel">
            <div class="result-header">
              <span class="result-icon">📍</span>
              <h3 class="result-title">位置信息</h3>
            </div>
            <div class="geolocation-info-grid">
              <div class="info-item">
                <label class="info-label">纬度：</label>
                <span class="info-value">{{ geolocationInfo.latitude?.toFixed(6) }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">经度：</label>
                <span class="info-value">{{ geolocationInfo.longitude?.toFixed(6) }}</span>
              </div>
              <div class="info-item">
                <label class="info-label">精度：</label>
                <span class="info-value">{{ geolocationInfo.accuracy?.toFixed(2) }} 米</span>
              </div>
              <div class="info-item">
                <label class="info-label">海拔：</label>
                <span class="info-value">{{ geolocationInfo.altitude ? geolocationInfo.altitude.toFixed(2) + ' 米' : '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="device-error">
      <h3>❌ 错误信息</h3>
      <p>{{ error }}</p>
      <button @click="clearError" class="btn btn-outline">清除错误</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useDevice, useNetwork, useBattery, useGeolocation } from '@ldesign/device/vue/index.ts'

// 使用 Device Composition API
const { deviceInfo: deviceInfoRef, isDesktop, isMobile, isTablet, isTouchDevice, refresh } = useDevice()
const { networkInfo: networkInfoRef, isOnline, isLoaded: isNetworkLoaded, loadModule: loadNetworkModule, unloadModule: unloadNetworkModule } = useNetwork()
const { batteryInfo: batteryInfoRef, isLoaded: isBatteryLoaded, loadModule: loadBatteryModule, unloadModule: unloadBatteryModule } = useBattery()
const { position, isSupported: isGeolocationSupported, getCurrentPosition, startWatching: startWatchingPosition, stopWatching: stopWatchingPosition, isLoaded: isGeolocationLoaded, loadModule: loadGeolocationModule } = useGeolocation()

// 响应式数据
const error = ref<string>('')
const deviceInfo = ref<any>(null)
const networkInfo = ref<any>(null)
const batteryInfo = ref<any>(null)
const geolocationInfo = ref<any>(null)
const isNetworkMonitoring = ref(false)
const isBatteryMonitoring = ref(false)

// 统计数据
const stats = reactive({
  detections: 0,
  avgTime: 0,
  modulesLoaded: 0,
  totalTime: 0
})

// 更新统计数据
const updateStats = (operationTime: number) => {
  stats.detections++
  stats.totalTime += operationTime
  stats.avgTime = Math.round((stats.totalTime / stats.detections) * 100) / 100
}

// 设备信息检测
const handleDeviceDetection = async () => {
  try {
    error.value = ''
    const startTime = performance.now()
    
    // 刷新设备信息
    refresh()
    
    // 获取设备信息
    deviceInfo.value = {
      type: isMobile.value ? 'mobile' : isTablet.value ? 'tablet' : 'desktop',
      os: deviceInfoRef.value?.os,
      browser: deviceInfoRef.value?.browser,
      screen: deviceInfoRef.value?.screen,
      isTouchDevice: isTouchDevice.value,
      isMobile: isMobile.value,
      isTablet: isTablet.value,
      isDesktop: isDesktop.value
    }
    
    const endTime = performance.now()
    updateStats(endTime - startTime)
    stats.modulesLoaded = Math.max(stats.modulesLoaded, 1)
    
    // 只在开发模式下输出日志
    if (import.meta.env.DEV) {
      console.info('设备检测完成:', deviceInfo.value)
    }
  } catch (err) {
    error.value = `设备检测失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 刷新设备信息
const refreshDeviceInfo = () => {
  refresh()
  handleDeviceDetection()
}

// 网络状态检测
const handleNetworkDetection = async () => {
  try {
    error.value = ''
    const startTime = performance.now()
    
    networkInfo.value = {
      status: isOnline.value ? 'online' : 'offline',
      type: networkInfoRef.value?.type,
      downlink: networkInfoRef.value?.downlink,
      rtt: networkInfoRef.value?.rtt
    }
    
    const endTime = performance.now()
    updateStats(endTime - startTime)
    stats.modulesLoaded = Math.max(stats.modulesLoaded, 2)
    
    console.log('网络检测完成:', networkInfo.value)
  } catch (err) {
    error.value = `网络检测失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 切换网络监控
const toggleNetworkMonitoring = async () => {
  if (isNetworkMonitoring.value) {
    await unloadNetworkModule()
    isNetworkMonitoring.value = false
  } else {
    await loadNetworkModule()
    isNetworkMonitoring.value = true
  }
}

// 电池状态检测
const handleBatteryDetection = async () => {
  try {
    error.value = ''

    const startTime = performance.now()

    // 先尝试加载电池模块
    if (!isBatteryLoaded.value) {
      await loadBatteryModule()
    }

    // 检查是否有电池信息
    if (!batteryInfoRef.value) {
      throw new Error('当前设备不支持电池状态检测或无法获取电池信息')
    }

    batteryInfo.value = {
      level: batteryInfoRef.value?.level || 0,
      charging: batteryInfoRef.value?.charging || false,
      chargingTime: batteryInfoRef.value?.chargingTime,
      dischargingTime: batteryInfoRef.value?.dischargingTime
    }

    const endTime = performance.now()
    updateStats(endTime - startTime)
    stats.modulesLoaded = Math.max(stats.modulesLoaded, 3)

    console.log('电池检测完成:', batteryInfo.value)
  } catch (err) {
    error.value = `电池检测失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 切换电池监控
const toggleBatteryMonitoring = async () => {
  if (isBatteryMonitoring.value) {
    await unloadBatteryModule()
    isBatteryMonitoring.value = false
  } else {
    await loadBatteryModule()
    isBatteryMonitoring.value = true
  }
}

// 地理位置检测
const handleGeolocationDetection = async () => {
  try {
    error.value = ''

    // 检查浏览器是否支持地理位置API
    if (!navigator.geolocation) {
      throw new Error('当前浏览器不支持地理位置功能')
    }

    const startTime = performance.now()

    // 使用原生地理位置API，提供更好的错误处理
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = '获取地理位置失败'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '用户拒绝了地理位置请求。请在浏览器设置中允许位置访问权限。'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = '地理位置信息不可用。请检查设备的位置服务是否开启。'
              break
            case error.TIMEOUT:
              errorMessage = '获取地理位置超时。请重试或检查网络连接。'
              break
            default:
              errorMessage = error.message || '未知错误'
          }
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      )
    })

    geolocationInfo.value = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp
    }

    const endTime = performance.now()
    updateStats(endTime - startTime)
    stats.modulesLoaded = Math.max(stats.modulesLoaded, 4)

    console.log('地理位置检测完成:', geolocationInfo.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  }
}

// 监控位置变化
const watchPosition = async () => {
  try {
    if (!isGeolocationLoaded.value) {
      await loadGeolocationModule()
    }
    await startWatchingPosition()
    console.log('开始监控位置变化')
  } catch (err) {
    error.value = `位置监控失败: ${err instanceof Error ? err.message : String(err)}`
  }
}

// 格式化时间
const formatTime = (seconds: number | undefined): string => {
  if (seconds === undefined || seconds === Infinity) return '未知'
  if (seconds < 60) return `${Math.round(seconds)}秒`
  if (seconds < 3600) return `${Math.round(seconds / 60)}分钟`
  return `${Math.round(seconds / 3600)}小时`
}

// 清空数据函数
const clearDeviceData = () => {
  deviceInfo.value = null
}

const clearNetworkData = () => {
  networkInfo.value = null
  if (isNetworkMonitoring.value) {
    toggleNetworkMonitoring()
  }
}

const clearBatteryData = () => {
  batteryInfo.value = null
  if (isBatteryMonitoring.value) {
    toggleBatteryMonitoring()
  }
}

const clearGeolocationData = () => {
  geolocationInfo.value = null
  if (stopWatchingPosition) {
    stopWatchingPosition()
  }
}

const clearError = () => {
  error.value = ''
}

// 组件挂载时自动检测设备信息
onMounted(() => {
  handleDeviceDetection()
})

// 组件卸载时清理监控
onUnmounted(() => {
  if (isNetworkMonitoring.value) {
    unloadNetworkModule()
  }
  if (isBatteryMonitoring.value) {
    unloadBatteryModule()
  }
  if (stopWatchingPosition) {
    stopWatchingPosition()
  }
})
</script>

<style lang="less" scoped>
.device-demo {
  min-height: 100vh;
  background: var(--ldesign-bg-color-page);
  color: var(--ldesign-text-color-primary);
}

/* 页面头部样式 */
.demo-header {
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-1) 0%,
    var(--ldesign-brand-color-2) 50%,
    var(--ldesign-brand-color-3) 100%);
  padding: var(--ls-spacing-xxl) var(--ls-spacing-xl);
  margin-bottom: var(--ls-spacing-xxl);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  background: var(--ldesign-brand-color);
  color: white;
  border-radius: var(--ls-border-radius-full);
  font-size: var(--ls-font-size-sm);
  font-weight: 600;
  margin-bottom: var(--ls-spacing-lg);
  box-shadow: var(--ldesign-shadow-2);
}

.badge-icon {
  font-size: 1.2em;
}

.header-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: var(--ls-spacing-lg);
  background: linear-gradient(135deg,
    var(--ldesign-brand-color-8) 0%,
    var(--ldesign-brand-color-6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-xl);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: var(--ls-spacing-xl);
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-1);
  min-width: 120px;
}

.stat-value {
  display: block;
  font-size: var(--ls-font-size-xl);
  font-weight: 700;
  color: var(--ldesign-brand-color);
  margin-bottom: var(--ls-spacing-xs);
}

.stat-label {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
}

/* 主要内容区域 */
.demo-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--ls-spacing-xl) var(--ls-spacing-xxl);
}

/* 区域样式 */
.demo-section {
  margin-bottom: var(--ls-spacing-xxl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-xl);
}

.section-icon {
  font-size: 2.5rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ldesign-brand-color-1);
  border-radius: var(--ls-border-radius-lg);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

.section-title {
  font-size: var(--ls-font-size-h3);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-xs);
}

.section-description {
  color: var(--ldesign-text-color-secondary);
  line-height: 1.6;
}

/* 操作卡片样式 */
.operation-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  overflow: hidden;
  box-shadow: var(--ldesign-shadow-1);
  transition: all 0.3s ease;
}

.operation-card:hover {
  box-shadow: var(--ldesign-shadow-2);
  border-color: var(--ldesign-brand-color-3);
}

.card-content {
  padding: var(--ls-spacing-xl);
}

/* 按钮样式 */
.action-buttons {
  display: flex;
  gap: var(--ls-spacing-sm);
  flex-wrap: wrap;
  margin-bottom: var(--ls-spacing-lg);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  border: none;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  &.btn-primary {
    background: var(--ldesign-brand-color);
    color: white;

    &:hover {
      background: var(--ldesign-brand-color-hover);
    }

    &:active {
      background: var(--ldesign-brand-color-active);
    }
  }

  &.btn-secondary {
    background: var(--ldesign-success-color);
    color: white;

    &:hover {
      background: var(--ldesign-success-color-hover);
    }

    &:active {
      background: var(--ldesign-success-color-active);
    }
  }

  &.btn-outline {
    background: transparent;
    color: var(--ldesign-text-color-primary);
    border: 1px solid var(--ldesign-border-color);

    &:hover {
      background: var(--ldesign-bg-color-container-hover);
      border-color: var(--ldesign-brand-color);
    }
  }
}

.btn-icon {
  font-size: 1.1em;
}

/* 结果面板样式 */
.result-panel {
  border-top: 1px solid var(--ldesign-border-color);
  padding: var(--ls-spacing-xl);
  background: var(--ldesign-bg-color-component);
}

.result-header {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-lg);
}

.result-icon {
  font-size: 1.2em;
}

.result-title {
  font-size: var(--ls-font-size-lg);
  font-weight: 600;
  color: var(--ldesign-brand-color);
  margin: 0;
}

/* 信息网格样式 */
.device-info-grid,
.network-info-grid,
.battery-info-grid,
.geolocation-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ldesign-brand-color-3);
    box-shadow: var(--ldesign-shadow-1);
  }
}

.info-label {
  font-size: var(--ls-font-size-sm);
  font-weight: 600;
  color: var(--ldesign-text-color-secondary);
  margin: 0;
}

.info-value {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-primary);
  font-weight: 500;

  &.status-online {
    color: var(--ldesign-success-color);
  }

  &.status-offline {
    color: var(--ldesign-error-color);
  }

  &.status-charging {
    color: var(--ldesign-success-color);
  }

  &.status-discharging {
    color: var(--ldesign-warning-color);
  }
}

/* 电池电量显示 */
.battery-level {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
}

.battery-bar {
  flex: 1;
  height: 20px;
  background: var(--ldesign-gray-color-2);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
  position: relative;
}

.battery-fill {
  height: 100%;
  background: linear-gradient(90deg,
    var(--ldesign-error-color) 0%,
    var(--ldesign-warning-color) 50%,
    var(--ldesign-success-color) 100%);
  transition: width 0.3s ease;
  border-radius: var(--ls-border-radius-base);
}

.battery-percentage {
  font-size: var(--ls-font-size-sm);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  min-width: 40px;
  text-align: right;
}

/* 错误提示样式 */
.device-error {
  max-width: 1200px;
  margin: var(--ls-spacing-xl) auto;
  padding: var(--ls-spacing-xl);
  background: var(--ldesign-error-color-1);
  border: 1px solid var(--ldesign-error-color);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-1);

  h3 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    color: var(--ldesign-error-color);
    font-size: var(--ls-font-size-lg);
  }

  p {
    margin: 0 0 var(--ls-spacing-lg) 0;
    color: var(--ldesign-text-color-primary);
    line-height: 1.6;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .demo-header {
    padding: var(--ls-spacing-xl) var(--ls-spacing-lg);
  }

  .demo-content {
    padding: 0 var(--ls-spacing-lg) var(--ls-spacing-xl);
  }

  .header-stats {
    gap: var(--ls-spacing-lg);
  }

  .stat-item {
    min-width: 100px;
    padding: var(--ls-spacing-lg) var(--ls-spacing-sm);
  }

  .section-header {
    flex-direction: column;
    text-align: center;
    gap: var(--ls-spacing-lg);
  }

  .section-icon {
    align-self: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    justify-content: center;
  }

  .device-info-grid,
  .network-info-grid,
  .battery-info-grid,
  .geolocation-info-grid {
    grid-template-columns: 1fr;
    gap: var(--ls-spacing-sm);
  }

  .battery-level {
    flex-direction: column;
    align-items: stretch;
    gap: var(--ls-spacing-xs);
  }

  .battery-percentage {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .header-title {
    font-size: 1.8rem;
  }

  .header-subtitle {
    font-size: var(--ls-font-size-base);
  }

  .section-title {
    font-size: var(--ls-font-size-lg);
  }

  .card-content {
    padding: var(--ls-spacing-lg);
  }

  .result-panel {
    padding: var(--ls-spacing-lg);
  }
}
</style>
