/**
 * 登录模板入口
 * 根据设备类型动态导入对应的登录模板
 */

import type { DeviceType } from '@ldesign/device'

export default async function createLoginTemplate(deviceType: DeviceType) {
  switch (deviceType) {
    case 'mobile':
      return (await import('./mobile')).default
    case 'tablet':
      return (await import('./tablet')).default
    case 'desktop':
      return (await import('./desktop')).default
    default:
      // 默认使用桌面端模板
      return (await import('./desktop')).default
  }
}
