/**
 * 设备路由插件
 *
 * 将所有设备适配功能整合到一个易用的插件中
 */

import type { DeviceDetector, DeviceType } from '@ldesign/device'
import type { DeviceRouterPluginOptions, Router } from '../types'
import type { TemplateRouteResolver } from './template'
import { createDeviceDetector } from '@ldesign/device'
import { DeviceRouteGuard } from './guard'
import { DeviceComponentResolver } from './resolver'

/**
 * 设备路由插件类
 */
export class DeviceRouterPlugin {
  private router: Router
  private options: Required<DeviceRouterPluginOptions>
  private deviceDetector: DeviceDetector
  private deviceGuard: DeviceRouteGuard
  private componentResolver: DeviceComponentResolver
  private templateResolver: TemplateRouteResolver | null = null
  private guardRemover: (() => void) | null = null

  constructor(router: Router, options: DeviceRouterPluginOptions = {}) {
    this.router = router
    this.options = this.normalizeOptions(options)

    // 初始化设备检测器
    this.deviceDetector = createDeviceDetector()

    // 初始化组件解析器
    this.componentResolver = new DeviceComponentResolver(() =>
      this.deviceDetector.detectDeviceType(),
    )

    // 初始化设备守卫
    this.deviceGuard = new DeviceRouteGuard(
      () => this.deviceDetector.detectDeviceType(),
      this.options.guardOptions,
    )

    // 模板路由功能待实现
    // if (this.options.enableTemplateRoutes) {
    //   this.templateResolver = new TemplateRouteResolver(
    //     this.options.templateConfig,
    //   )
    // }
  }

  /**
   * 安装插件
   */
  install(): void {
    // 安装设备访问控制守卫
    if (this.options.enableDeviceGuard) {
      this.guardRemover = this.router.beforeEach(this.deviceGuard.createGuard())
    }

    // 扩展路由器功能
    this.extendRouter()

    console.warn('DeviceRouterPlugin installed successfully')
  }

  /**
   * 卸载插件
   */
  uninstall(): void {
    // 移除守卫
    if (this.guardRemover) {
      this.guardRemover()
      this.guardRemover = null
    }

    // 设备检测器无需销毁（没有 destroy 方法）

    // 销毁模板解析器
    if (this.templateResolver) {
      this.templateResolver.destroy()
    }

    console.warn('DeviceRouterPlugin uninstalled successfully')
  }

  /**
   * 扩展路由器功能
   */
  private extendRouter(): void {
    const originalResolve = this.router.resolve.bind(this.router)

    // 扩展 resolve 方法以支持设备组件解析
    this.router.resolve = (to, currentLocation) => {
      const resolved = originalResolve(to, currentLocation)

      // 为每个匹配的路由记录解析设备组件
      if (this.options.enableDeviceDetection) {
        resolved.matched = resolved.matched.map((record) => {
          const resolution = this.componentResolver.resolveComponent(record)
          if (resolution) {
            // 更新组件配置
            const updatedRecord = { ...record }
            if (updatedRecord.components) {
              updatedRecord.components.default = resolution.component
            }
            return updatedRecord
          }
          return record
        })
      }

      return resolved
    }
  }

  /**
   * 获取当前设备类型
   */
  getCurrentDevice(): DeviceType {
    return this.deviceDetector.detectDeviceType()
  }

  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    return this.deviceDetector.getDeviceInfo()
  }

  /**
   * 检查路由是否支持当前设备
   */
  isRouteSupported(routePath: string): boolean {
    try {
      const resolved = this.router.resolve(routePath)
      const currentDevice = this.getCurrentDevice()

      const supportedDevices = resolved.meta.supportedDevices
      if (!supportedDevices || supportedDevices.length === 0) {
        return true
      }

      return supportedDevices.includes(currentDevice)
    }
    catch {
      return false
    }
  }

  /**
   * 监听设备变化
   */
  onDeviceChange(callback: (deviceType: DeviceType) => void): () => void {
    const unsubscribe = this.deviceDetector.onChange((info) => {
      callback(info.type)
    })
    return unsubscribe
  }

  /**
   * 标准化选项
   */
  private normalizeOptions(
    options: DeviceRouterPluginOptions,
  ): Required<DeviceRouterPluginOptions> {
    return {
      defaultSupportedDevices: ['mobile', 'tablet', 'desktop'],
      defaultUnsupportedMessage: '当前系统不支持在此设备上查看',
      defaultUnsupportedRedirect: '/device-unsupported',
      enableDeviceDetection: true,
      enableDeviceGuard: true,
      guardOptions: {},
      ...options,
    }
  }
}

/**
 * 创建设备路由插件的便捷函数
 */
export function createDeviceRouterPlugin(options?: DeviceRouterPluginOptions) {
  return {
    install(router: Router) {
      const plugin = new DeviceRouterPlugin(router, options)
      plugin.install()

      // 将插件实例添加到路由器上，方便访问
      ; (router as any).devicePlugin = plugin

      return plugin
    },
  }
}
