/**
 * @ldesign/device 高级使用示例
 * 
 * 展示所有新增功能的使用方法
 */

import {
  DeviceDetector,
  FeatureDetectionModule,
  PerformanceModule,
  type FeatureDetectionInfo,
  type DevicePerformanceInfo,
} from '@ldesign/device'

/**
 * 示例 1: 基础设备检测
 */
async function basicDeviceDetection() {
  console.log('=== 基础设备检测 ===')
  
  const detector = new DeviceDetector({
    enableResize: true,
    enableOrientation: true,
    debounceDelay: 100,
  })

  const deviceInfo = detector.getDeviceInfo()
  console.log('设备类型:', deviceInfo.type)
  console.log('屏幕尺寸:', `${deviceInfo.width}x${deviceInfo.height}`)
  console.log('像素比:', deviceInfo.pixelRatio)
  console.log('触摸设备:', deviceInfo.isTouchDevice)
  console.log('操作系统:', deviceInfo.os.name, deviceInfo.os.version)
  console.log('浏览器:', deviceInfo.browser.name, deviceInfo.browser.version)

  // 监听设备变化
  detector.on('deviceChange', (info) => {
    console.log('设备信息变化:', info.type)
  })

  detector.on('orientationChange', (orientation) => {
    console.log('屏幕方向变化:', orientation)
  })

  return detector
}

/**
 * 示例 2: 特性检测模块
 */
async function featureDetection(detector: DeviceDetector) {
  console.log('\n=== 特性检测 ===')
  
  const featureModule = await detector.loadModule<FeatureDetectionModule>('feature')
  const features = featureModule.getData()

  // 存储支持检测
  console.log('\n存储支持:')
  console.log('  LocalStorage:', features.storage.localStorage)
  console.log('  SessionStorage:', features.storage.sessionStorage)
  console.log('  IndexedDB:', features.storage.indexedDB)
  console.log('  Cookies:', features.storage.cookies)

  // 媒体格式支持
  console.log('\n媒体格式支持:')
  console.log('  WebP:', features.media.webp)
  console.log('  AVIF:', features.media.avif)
  console.log('  WebM:', features.media.webm)
  console.log('  MP4:', features.media.mp4)
  console.log('  HLS:', features.media.hls)

  // API 支持检测
  console.log('\nAPI 支持:')
  console.log('  Service Worker:', features.apis.serviceWorker)
  console.log('  Web Worker:', features.apis.webWorker)
  console.log('  WebRTC:', features.apis.webRTC)
  console.log('  WebGL:', features.apis.webgl)
  console.log('  WebGL2:', features.apis.webGL2)
  console.log('  WebAssembly:', features.apis.webAssembly)

  // 用户偏好
  console.log('\n用户偏好:')
  console.log('  暗黑模式:', features.preferences.darkMode)
  console.log('  减少动画:', features.preferences.reducedMotion)
  console.log('  减少透明度:', features.preferences.reducedTransparency)
  console.log('  高对比度:', features.preferences.highContrast)

  // 硬件信息
  console.log('\n硬件信息:')
  console.log('  CPU 核心数:', features.hardware.cpuCores)
  console.log('  设备内存:', features.hardware.deviceMemory, 'GB')
  console.log('  最大触摸点:', features.hardware.maxTouchPoints)

  // 监听暗黑模式变化
  featureModule.on('darkModeChange', (isDark) => {
    console.log('暗黑模式变化:', isDark ? '开启' : '关闭')
    // 应用主题切换
    applyTheme(isDark ? 'dark' : 'light')
  })

  // 监听减少动画偏好变化
  featureModule.on('reducedMotionChange', (reduced) => {
    console.log('减少动画偏好变化:', reduced ? '开启' : '关闭')
    // 调整动画设置
    adjustAnimations(!reduced)
  })

  return featureModule
}

/**
 * 示例 3: 性能评估模块
 */
async function performanceEvaluation(detector: DeviceDetector) {
  console.log('\n=== 性能评估 ===')
  
  const perfModule = await detector.loadModule<PerformanceModule>('performance')
  const perfInfo = perfModule.getData()

  console.log('\n综合性能:')
  console.log('  评分:', perfInfo.score, '/ 100')
  console.log('  等级:', perfInfo.tier)

  console.log('\n详细指标:')
  console.log('  CPU 性能:', perfInfo.metrics.cpu)
  console.log('  GPU 性能:', perfInfo.metrics.gpu)
  console.log('  内存评分:', perfInfo.metrics.memory)
  console.log('  网络评分:', perfInfo.metrics.network)

  console.log('\n优化建议:')
  perfInfo.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`)
  })

  // 根据性能等级调整应用配置
  const config = getConfigByPerformanceTier(perfInfo.tier)
  console.log('\n推荐配置:', config)

  return perfModule
}

/**
 * 示例 4: 智能图片格式选择
 */
async function smartImageFormat(features: FeatureDetectionInfo) {
  console.log('\n=== 智能图片格式选择 ===')
  
  const imagePath = 'example-image'
  let imageUrl: string

  if (features.media.avif) {
    imageUrl = `${imagePath}.avif`
    console.log('使用 AVIF 格式 (最优)')
  } else if (features.media.webp) {
    imageUrl = `${imagePath}.webp`
    console.log('使用 WebP 格式 (次优)')
  } else {
    imageUrl = `${imagePath}.jpg`
    console.log('使用 JPEG 格式 (兼容)')
  }

  return imageUrl
}

/**
 * 示例 5: 响应式应用配置
 */
function getConfigByPerformanceTier(tier: 'low' | 'medium' | 'high' | 'ultra') {
  const configs = {
    low: {
      graphicsQuality: 'low',
      fps: 30,
      enableEffects: false,
      enableShadows: false,
      textureQuality: 'low',
      particleCount: 100,
    },
    medium: {
      graphicsQuality: 'medium',
      fps: 60,
      enableEffects: true,
      enableShadows: false,
      textureQuality: 'medium',
      particleCount: 500,
    },
    high: {
      graphicsQuality: 'high',
      fps: 60,
      enableEffects: true,
      enableShadows: true,
      textureQuality: 'high',
      particleCount: 1000,
    },
    ultra: {
      graphicsQuality: 'ultra',
      fps: 120,
      enableEffects: true,
      enableShadows: true,
      textureQuality: 'ultra',
      particleCount: 2000,
    },
  }

  return configs[tier]
}

/**
 * 示例 6: 主题切换
 */
function applyTheme(theme: 'light' | 'dark') {
  console.log(`应用主题: ${theme}`)
  document.documentElement.setAttribute('data-theme', theme)
  
  // 保存用户偏好
  localStorage.setItem('theme', theme)
}

/**
 * 示例 7: 动画调整
 */
function adjustAnimations(enabled: boolean) {
  console.log(`动画: ${enabled ? '启用' : '禁用'}`)
  document.documentElement.style.setProperty(
    '--animation-duration',
    enabled ? '0.3s' : '0s'
  )
}

/**
 * 示例 8: 完整的应用初始化流程
 */
async function initializeApp() {
  console.log('=== 应用初始化 ===\n')

  try {
    // 1. 创建设备检测器
    const detector = await basicDeviceDetection()

    // 2. 加载特性检测模块
    const featureModule = await featureDetection(detector)
    const features = featureModule.getData()

    // 3. 加载性能评估模块
    const perfModule = await performanceEvaluation(detector)
    const perfInfo = perfModule.getData()

    // 4. 根据特性选择最佳图片格式
    const imageUrl = await smartImageFormat(features)

    // 5. 应用用户偏好
    if (features.preferences.darkMode) {
      applyTheme('dark')
    }

    if (features.preferences.reducedMotion) {
      adjustAnimations(false)
    }

    // 6. 根据性能配置应用
    const config = getConfigByPerformanceTier(perfInfo.tier)
    console.log('\n应用配置完成:', config)

    // 7. 监听网络状态
    const networkModule = await detector.loadModule('network')
    networkModule.on('networkChange', (info: any) => {
      console.log('网络状态变化:', info)
    })

    console.log('\n✅ 应用初始化完成')

    return {
      detector,
      featureModule,
      perfModule,
      features,
      perfInfo,
      config,
    }
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    throw error
  }
}

/**
 * 示例 9: 性能监控
 */
async function performanceMonitoring(detector: DeviceDetector) {
  console.log('\n=== 性能监控 ===')

  // 获取检测性能指标
  const metrics = detector.getDetectionMetrics()
  console.log('检测次数:', metrics.detectionCount)
  console.log('平均检测时间:', metrics.averageDetectionTime.toFixed(2), 'ms')
  console.log('最后检测时间:', metrics.lastDetectionDuration.toFixed(2), 'ms')

  // 获取事件系统性能指标
  const eventMetrics = detector.getPerformanceMetrics()
  console.log('事件触发次数:', eventMetrics.totalEmits)
  console.log('监听器调用次数:', eventMetrics.totalListenerCalls)
  console.log('平均监听器数:', eventMetrics.averageListenersPerEvent.toFixed(2))
}

// 运行示例
if (typeof window !== 'undefined') {
  // 浏览器环境
  initializeApp().then((app) => {
    console.log('\n应用实例:', app)
    
    // 定期监控性能
    setInterval(() => {
      performanceMonitoring(app.detector)
    }, 10000)
  })
} else {
  // Node.js 环境
  console.log('此示例需要在浏览器环境中运行')
}

export {
  basicDeviceDetection,
  featureDetection,
  performanceEvaluation,
  smartImageFormat,
  getConfigByPerformanceTier,
  applyTheme,
  adjustAnimations,
  initializeApp,
  performanceMonitoring,
}

