import { DeviceDetector } from '@ldesign/device'

// 创建设备检测器实例
const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 300,
})

// 设置全局变量以便调试
window.detector = detector

// DOM 元素引用
const elements = {
  deviceType: document.getElementById('device-type'),
  orientation: document.getElementById('orientation'),
  screenSize: document.getElementById('screen-size'),
  pixelRatio: document.getElementById('pixel-ratio'),
  touchDevice: document.getElementById('touch-device'),
  osInfo: document.getElementById('os-info'),
  browserInfo: document.getElementById('browser-info'),
  userAgent: document.getElementById('user-agent'),
  networkStatus: document.getElementById('network-status'),
  networkType: document.getElementById('network-type'),
  networkDownlink: document.getElementById('network-downlink'),
  networkRtt: document.getElementById('network-rtt'),
  batteryLevel: document.getElementById('battery-level'),
  batteryCharging: document.getElementById('battery-charging'),
  batteryChargingTime: document.getElementById('battery-charging-time'),
  batteryDischargingTime: document.getElementById('battery-discharging-time'),
  geoLatitude: document.getElementById('geo-latitude'),
  geoLongitude: document.getElementById('geo-longitude'),
  geoAccuracy: document.getElementById('geo-accuracy'),
  geoAltitude: document.getElementById('geo-altitude'),
  geoWatching: document.getElementById('geo-watching'),
  detectionCount: document.getElementById('detection-count'),
  avgDetectionTime: document.getElementById('avg-detection-time'),
  memoryUsage: document.getElementById('memory-usage'),
  loadedModules: document.getElementById('loaded-modules'),
  eventLog: document.getElementById('event-log'),
  refreshBtn: document.getElementById('refresh-btn'),
  loadNetworkBtn: document.getElementById('load-network-btn'),
  loadBatteryBtn: document.getElementById('load-battery-btn'),
  loadGeolocationBtn: document.getElementById('load-geolocation-btn'),
  startWatchingBtn: document.getElementById('start-watching-btn'),
  stopWatchingBtn: document.getElementById('stop-watching-btn'),
  performanceTestBtn: document.getElementById('performance-test-btn'),
  simulateResizeBtn: document.getElementById('simulate-resize-btn'),
  unloadModulesBtn: document.getElementById('unload-modules-btn'),
  clearLogBtn: document.getElementById('clear-log-btn'),
}

// 性能监控变量
let detectionCount = 0
let totalDetectionTime = 0
let geolocationModule = null
let watchId = null

// 日志函数
function addLog(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString()
  const logEntry = document.createElement('div')
  logEntry.className = `log-entry ${type}`
  logEntry.textContent = `[${timestamp}] ${message}`
  elements.eventLog.appendChild(logEntry)
  elements.eventLog.scrollTop = elements.eventLog.scrollHeight
}

// 更新设备信息显示
function updateDeviceInfo() {
  const startTime = performance.now()
  const deviceInfo = detector.getDeviceInfo()
  const endTime = performance.now()

  // 更新性能统计
  detectionCount++
  totalDetectionTime += endTime - startTime

  elements.deviceType.textContent = deviceInfo.type
  elements.orientation.textContent = deviceInfo.orientation
  elements.screenSize.textContent = `${deviceInfo.width} × ${deviceInfo.height}`
  elements.pixelRatio.textContent = deviceInfo.pixelRatio
  elements.touchDevice.textContent = deviceInfo.isTouchDevice ? '是' : '否'
  elements.osInfo.textContent = `${deviceInfo.os.name} ${deviceInfo.os.version}`
  elements.browserInfo.textContent = `${deviceInfo.browser.name} ${deviceInfo.browser.version}`
  elements.userAgent.textContent = deviceInfo.userAgent

  updatePerformanceInfo()
}

// 更新网络信息显示
function updateNetworkInfo(networkInfo) {
  if (!networkInfo) {
    elements.networkStatus.textContent = '未知'
    elements.networkType.textContent = '未知'
    elements.networkDownlink.textContent = '未知'
    elements.networkRtt.textContent = '未知'
    return
  }

  elements.networkStatus.textContent = networkInfo.status
  elements.networkStatus.className = `status ${networkInfo.status}`
  elements.networkType.textContent = networkInfo.type || '未知'
  elements.networkDownlink.textContent = networkInfo.downlink
    ? `${networkInfo.downlink} Mbps`
    : '未知'
  elements.networkRtt.textContent = networkInfo.rtt
    ? `${networkInfo.rtt} ms`
    : '未知'
}

// 更新电池信息显示
function updateBatteryInfo(batteryInfo) {
  if (!batteryInfo) {
    elements.batteryLevel.textContent = '未知'
    elements.batteryCharging.textContent = '未知'
    elements.batteryChargingTime.textContent = '未知'
    elements.batteryDischargingTime.textContent = '未知'
    return
  }

  elements.batteryLevel.textContent = `${Math.round(batteryInfo.level * 100)}%`
  elements.batteryCharging.textContent = batteryInfo.charging
    ? '充电中'
    : '未充电'
  elements.batteryCharging.className = `status ${
    batteryInfo.charging ? 'charging' : 'not-charging'
  }`

  const chargingTime
    = batteryInfo.chargingTime === Infinity
      ? '未知'
      : `${Math.round(batteryInfo.chargingTime / 60)} 分钟`
  const dischargingTime
    = batteryInfo.dischargingTime === Infinity
      ? '未知'
      : `${Math.round(batteryInfo.dischargingTime / 60)} 分钟`

  elements.batteryChargingTime.textContent = chargingTime
  elements.batteryDischargingTime.textContent = dischargingTime
}

// 更新地理位置信息显示
function updateGeolocationInfo(position) {
  if (!position) {
    elements.geoLatitude.textContent = '未知'
    elements.geoLongitude.textContent = '未知'
    elements.geoAccuracy.textContent = '未知'
    elements.geoAltitude.textContent = '未知'
    return
  }

  elements.geoLatitude.textContent = position.latitude.toFixed(6)
  elements.geoLongitude.textContent = position.longitude.toFixed(6)
  elements.geoAccuracy.textContent = position.accuracy
    ? `${Math.round(position.accuracy)}m`
    : '未知'
  elements.geoAltitude.textContent = position.altitude
    ? `${Math.round(position.altitude)}m`
    : '未知'
}

// 更新性能信息显示
function updatePerformanceInfo() {
  elements.detectionCount.textContent = detectionCount
  elements.avgDetectionTime.textContent
    = detectionCount > 0
      ? `${(totalDetectionTime / detectionCount).toFixed(2)}ms`
      : '-'

  // 获取内存使用情况（如果支持）
  if (performance.memory) {
    const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
    const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
    elements.memoryUsage.textContent = `${used}MB / ${total}MB`
  }
  else {
    elements.memoryUsage.textContent = '不支持'
  }

  // 获取已加载模块
  const loadedModules = detector.getLoadedModules()
  elements.loadedModules.textContent
    = loadedModules.length > 0 ? loadedModules.join(', ') : '无'
}

// 更新位置监听状态
function updateWatchingStatus(isWatching) {
  elements.geoWatching.textContent = isWatching ? '监听中' : '未监听'
  elements.geoWatching.className = `status ${isWatching ? 'online' : 'offline'}`
  elements.startWatchingBtn.disabled = isWatching
  elements.stopWatchingBtn.disabled = !isWatching
}

// 性能测试函数
async function performanceTest() {
  addLog('开始性能测试...', 'info')
  const iterations = 100
  const startTime = performance.now()

  for (let i = 0; i < iterations; i++) {
    detector.getDeviceInfo()
  }

  const endTime = performance.now()
  const avgTime = (endTime - startTime) / iterations

  addLog(
    `性能测试完成: ${iterations}次检测，平均耗时 ${avgTime.toFixed(2)}ms`,
    'success',
  )
}

// 模拟窗口变化
function simulateResize() {
  addLog('模拟窗口大小变化...', 'info')

  // 触发 resize 事件
  const resizeEvent = new Event('resize')
  window.dispatchEvent(resizeEvent)

  setTimeout(() => {
    addLog('窗口变化模拟完成', 'success')
  }, 100)
}

// 事件监听器
detector.on('deviceChange', (deviceInfo) => {
  addLog(
    `设备信息变化: ${deviceInfo.type} (${deviceInfo.width}×${deviceInfo.height})`,
    'info',
  )
  updateDeviceInfo()
})

detector.on('orientationChange', (orientation) => {
  addLog(`屏幕方向变化: ${orientation}`, 'info')
})

detector.on('resize', ({ width, height }) => {
  addLog(`窗口大小变化: ${width}×${height}`, 'info')
})

detector.on('networkChange', (networkInfo) => {
  addLog(`网络状态变化: ${networkInfo.status} (${networkInfo.type})`, 'success')
  updateNetworkInfo(networkInfo)
})

detector.on('batteryChange', (batteryInfo) => {
  addLog(
    `电池状态变化: ${Math.round(batteryInfo.level * 100)}% (${
      batteryInfo.charging ? '充电中' : '未充电'
    })`,
    'success',
  )
  updateBatteryInfo(batteryInfo)
})

// 按钮事件处理
elements.refreshBtn.addEventListener('click', () => {
  detector.refresh()
  addLog('手动刷新设备信息', 'info')
})

elements.loadNetworkBtn.addEventListener('click', async () => {
  try {
    const networkModule = await detector.loadModule('network')
    const networkInfo = networkModule.getData()
    updateNetworkInfo(networkInfo)
    addLog('网络模块加载成功', 'success')
    elements.loadNetworkBtn.disabled = true
  }
  catch (error) {
    addLog(`网络模块加载失败: ${error.message}`, 'warning')
  }
})

elements.loadBatteryBtn.addEventListener('click', async () => {
  try {
    const batteryModule = await detector.loadModule('battery')
    const batteryInfo = batteryModule.getData()
    updateBatteryInfo(batteryInfo)
    addLog('电池模块加载成功', 'success')
    elements.loadBatteryBtn.disabled = true
  }
  catch (error) {
    addLog(`电池模块加载失败: ${error.message}`, 'warning')
  }
})

elements.loadGeolocationBtn.addEventListener('click', async () => {
  try {
    geolocationModule = await detector.loadModule('geolocation')
    const position = geolocationModule.getData()
    updateGeolocationInfo(position)
    if (position) {
      addLog(
        `地理位置: ${position.latitude.toFixed(
          6,
        )}, ${position.longitude.toFixed(6)}`,
        'success',
      )
    }
    else {
      addLog('地理位置模块加载成功，但未获取到位置信息', 'warning')
    }
    elements.loadGeolocationBtn.disabled = true
    updateWatchingStatus(false)
  }
  catch (error) {
    addLog(`地理位置模块加载失败: ${error.message}`, 'warning')
  }
})

// 开始位置监听
elements.startWatchingBtn.addEventListener('click', async () => {
  if (!geolocationModule) {
    addLog('请先加载地理位置模块', 'warning')
    return
  }

  try {
    watchId = await geolocationModule.startWatching((position) => {
      updateGeolocationInfo(position)
      addLog(
        `位置更新: ${position.latitude.toFixed(
          6,
        )}, ${position.longitude.toFixed(6)}`,
        'info',
      )
    })
    updateWatchingStatus(true)
    addLog('开始监听位置变化', 'success')
  }
  catch (error) {
    addLog(`开始位置监听失败: ${error.message}`, 'warning')
  }
})

// 停止位置监听
elements.stopWatchingBtn.addEventListener('click', () => {
  if (geolocationModule && watchId) {
    geolocationModule.stopWatching(watchId)
    watchId = null
    updateWatchingStatus(false)
    addLog('停止位置监听', 'warning')
  }
})

// 性能测试
elements.performanceTestBtn.addEventListener('click', performanceTest)

// 模拟窗口变化
elements.simulateResizeBtn.addEventListener('click', simulateResize)

// 清空日志
elements.clearLogBtn.addEventListener('click', () => {
  elements.eventLog.innerHTML = ''
  addLog('日志已清空', 'info')
})

elements.unloadModulesBtn.addEventListener('click', () => {
  // 停止位置监听
  if (watchId) {
    elements.stopWatchingBtn.click()
  }

  detector.unloadModule('network')
  detector.unloadModule('battery')
  detector.unloadModule('geolocation')

  // 重置显示
  updateNetworkInfo(null)
  updateBatteryInfo(null)
  updateGeolocationInfo(null)
  updateWatchingStatus(false)

  // 重新启用按钮
  elements.loadNetworkBtn.disabled = false
  elements.loadBatteryBtn.disabled = false
  elements.loadGeolocationBtn.disabled = false

  // 重置模块引用
  geolocationModule = null
  watchId = null

  addLog('所有模块已卸载', 'warning')
})

// 初始化
addLog('设备检测器初始化完成', 'success')
updateDeviceInfo()
updatePerformanceInfo()
updateWatchingStatus(false)

// 初始化按钮状态
elements.stopWatchingBtn.disabled = true

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  detector.destroy()
})
