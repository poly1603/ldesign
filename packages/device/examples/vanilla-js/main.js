import { DeviceDetector } from '@ldesign/device'

// 创建设备检测器实例
const detector = new DeviceDetector({
  enableResize: true,
  enableOrientation: true,
  debounceDelay: 300,
})

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
  eventLog: document.getElementById('event-log'),
  refreshBtn: document.getElementById('refresh-btn'),
  loadNetworkBtn: document.getElementById('load-network-btn'),
  loadBatteryBtn: document.getElementById('load-battery-btn'),
  loadGeolocationBtn: document.getElementById('load-geolocation-btn'),
  unloadModulesBtn: document.getElementById('unload-modules-btn'),
}

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
  const deviceInfo = detector.getDeviceInfo()

  elements.deviceType.textContent = deviceInfo.type
  elements.orientation.textContent = deviceInfo.orientation
  elements.screenSize.textContent = `${deviceInfo.width} × ${deviceInfo.height}`
  elements.pixelRatio.textContent = deviceInfo.pixelRatio
  elements.touchDevice.textContent = deviceInfo.isTouchDevice ? '是' : '否'
  elements.osInfo.textContent = `${deviceInfo.os.name} ${deviceInfo.os.version}`
  elements.browserInfo.textContent = `${deviceInfo.browser.name} ${deviceInfo.browser.version}`
  elements.userAgent.textContent = deviceInfo.userAgent
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
  elements.networkDownlink.textContent = networkInfo.downlink ? `${networkInfo.downlink} Mbps` : '未知'
  elements.networkRtt.textContent = networkInfo.rtt ? `${networkInfo.rtt} ms` : '未知'
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
  elements.batteryCharging.textContent = batteryInfo.charging ? '充电中' : '未充电'
  elements.batteryCharging.className = `status ${batteryInfo.charging ? 'charging' : 'not-charging'}`

  const chargingTime = batteryInfo.chargingTime === Infinity ? '未知' : `${Math.round(batteryInfo.chargingTime / 60)} 分钟`
  const dischargingTime = batteryInfo.dischargingTime === Infinity ? '未知' : `${Math.round(batteryInfo.dischargingTime / 60)} 分钟`

  elements.batteryChargingTime.textContent = chargingTime
  elements.batteryDischargingTime.textContent = dischargingTime
}

// 事件监听器
detector.on('deviceChange', (deviceInfo) => {
  addLog(`设备信息变化: ${deviceInfo.type} (${deviceInfo.width}×${deviceInfo.height})`, 'info')
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
  addLog(`电池状态变化: ${Math.round(batteryInfo.level * 100)}% (${batteryInfo.charging ? '充电中' : '未充电'})`, 'success')
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
    const geolocationModule = await detector.loadModule('geolocation')
    const position = geolocationModule.getData()
    if (position) {
      addLog(`地理位置: ${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`, 'success')
    }
    elements.loadGeolocationBtn.disabled = true
  }
  catch (error) {
    addLog(`地理位置模块加载失败: ${error.message}`, 'warning')
  }
})

elements.unloadModulesBtn.addEventListener('click', () => {
  detector.unloadModule('network')
  detector.unloadModule('battery')
  detector.unloadModule('geolocation')

  // 重置显示
  updateNetworkInfo(null)
  updateBatteryInfo(null)

  // 重新启用按钮
  elements.loadNetworkBtn.disabled = false
  elements.loadBatteryBtn.disabled = false
  elements.loadGeolocationBtn.disabled = false

  addLog('所有模块已卸载', 'warning')
})

// 初始化
addLog('设备检测器初始化完成', 'success')
updateDeviceInfo()

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  detector.destroy()
})
