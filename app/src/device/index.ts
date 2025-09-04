/**
 * Device 插件集成
 * 
 * 这个目录包含了 Device 检测插件的集成配置，为应用提供完整的设备检测功能。
 */

import { createDeviceEnginePlugin } from '@ldesign/device'

/**
 * Device 插件配置
 * 
 * 配置设备检测功能，包括：
 * - 设备类型检测（桌面、平板、手机）
 * - 屏幕方向检测
 * - 网络状态监控
 * - 电池状态监控
 * - 地理位置检测
 */
const deviceConfig = {
  // 插件基础信息
  name: 'device',
  version: '1.0.0',
  description: 'LDesign Device Detection Plugin for App',
  
  // 功能开关
  enableResize: true,        // 启用窗口大小变化监听
  enableOrientation: true,   // 启用屏幕方向变化监听
  
  // 模块配置
  modules: ['network', 'battery', 'geolocation'] as const,
  
  // Vue 集成配置
  globalPropertyName: '$device',  // 全局属性名
  autoInstall: true,             // 自动安装 Vue 插件
  
  // 开发配置
  debug: false,                           // 调试模式
  enablePerformanceMonitoring: false,    // 性能监控
}

/**
 * 创建标准化的 Device 引擎插件
 * 
 * 使用 @ldesign/device 包提供的标准插件创建函数，
 * 确保与其他已集成包保持一致的插件创建模式
 */
export const devicePlugin = createDeviceEnginePlugin(deviceConfig)

/**
 * 导出 Device 插件实例
 * 
 * 使用示例：
 * ```typescript
 * import { devicePlugin } from './device'
 * 
 * // 在 engine 中使用
 * const engine = createAndMountApp(App, '#app', {
 *   plugins: [devicePlugin]
 * })
 * 
 * // 在组件中使用
 * import { useDevice } from '@ldesign/device/vue'
 * 
 * const { deviceInfo, isDesktop, isMobile } = useDevice()
 * console.log('当前设备类型:', deviceInfo.type)
 * ```
 */
export default devicePlugin
