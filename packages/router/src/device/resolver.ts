/**
 * 设备组件解析器
 *
 * 根据当前设备类型解析合适的组件进行渲染
 */

import type { DeviceType } from '@ldesign/device'
import type {
  DeviceComponentResolution,
  RouteComponent,
  RouteRecordNormalized,
} from '../types'
import { h } from 'vue'

/**
 * 设备组件解析器类
 */
export class DeviceComponentResolver {
  private getCurrentDevice: () => DeviceType

  constructor(getCurrentDevice: () => DeviceType) {
    this.getCurrentDevice = getCurrentDevice
  }

  /**
   * 解析路由记录的组件
   */
  resolveComponent(
    record: RouteRecordNormalized,
    viewName: string = 'default',
  ): DeviceComponentResolution | null {
    const currentDevice = this.getCurrentDevice()

    // 1. 优先检查设备特定组件
    const deviceComponentResult
      = this.resolveDeviceSpecificComponentWithFallback(record, currentDevice)
    if (deviceComponentResult) {
      return {
        component: deviceComponentResult.component,
        deviceType: deviceComponentResult.deviceType,
        isFallback: deviceComponentResult.isFallback,
        source: 'deviceComponents',
      }
    }

    // 2. 检查常规组件
    const regularComponent = this.resolveRegularComponent(record, viewName)
    if (regularComponent) {
      return {
        component: regularComponent,
        deviceType: currentDevice,
        isFallback: false,
        source: 'component',
      }
    }

    // 3. 检查是否有模板配置
    if (record.meta.template || record.meta.templateCategory) {
      return {
        component: this.createTemplateComponent(record),
        deviceType: currentDevice,
        isFallback: false,
        source: 'template',
      }
    }

    return null
  }

  /**
   * 解析设备特定组件
   */
  // 解析设备特定组件，预留扩展接口
  private resolveDeviceSpecificComponent(
    record: RouteRecordNormalized,
    device: DeviceType,
  ): RouteComponent | null {
    // 检查路由记录是否有设备特定组件配置
    const deviceComponents = (record as any).deviceComponents
    if (!deviceComponents) {
      return null
    }

    // 优先使用当前设备的组件
    if (deviceComponents[device]) {
      return deviceComponents[device]
    }

    // 回退策略：desktop -> tablet -> mobile
    const fallbackOrder: DeviceType[] = ['desktop', 'tablet', 'mobile']
    for (const fallbackDevice of fallbackOrder) {
      if (fallbackDevice !== device && deviceComponents[fallbackDevice]) {
        return deviceComponents[fallbackDevice]
      }
    }

    return null
  }

  /**
   * 解析设备特定组件（包含回退信息）
   */
  private resolveDeviceSpecificComponentWithFallback(
    record: RouteRecordNormalized,
    device: DeviceType,
  ): {
    component: RouteComponent
    deviceType: DeviceType
    isFallback: boolean
  } | null {
    const deviceComponents = (record as any).deviceComponents
    if (!deviceComponents || typeof deviceComponents !== 'object') {
      return null
    }

    // 优先使用当前设备的组件
    if (deviceComponents[device]) {
      return {
        component: deviceComponents[device],
        deviceType: device,
        isFallback: false,
      }
    }

    // 回退策略：desktop -> tablet -> mobile
    const fallbackOrder: DeviceType[] = ['desktop', 'tablet', 'mobile']
    for (const fallbackDevice of fallbackOrder) {
      if (fallbackDevice !== device && deviceComponents[fallbackDevice]) {
        return {
          component: deviceComponents[fallbackDevice],
          deviceType: fallbackDevice,
          isFallback: true,
        }
      }
    }

    return null
  }

  /**
   * 解析常规组件
   */
  private resolveRegularComponent(
    record: RouteRecordNormalized,
    viewName: string,
  ): RouteComponent | null {
    if (!record.components) {
      return null
    }

    return record.components[viewName] || null
  }

  /**
   * 创建模板组件
   */
  private createTemplateComponent(
    record: RouteRecordNormalized,
  ): RouteComponent {
    // 返回一个异步组件，延迟加载模板
    return async () => {
      try {
        // 动态导入模板解析器
        const { TemplateRouteResolver } = await import('./template')
        const templateResolver = new TemplateRouteResolver()

        return await templateResolver.resolveTemplate(
          record.meta.templateCategory || 'default',
          record.meta.template!,
          this.getCurrentDevice(),
        )
      }
      catch (error) {
        console.error('Failed to load template component:', error)
        // 返回错误组件
        return this.createErrorComponent(error as Error)
      }
    }
  }

  /**
   * 创建错误组件
   */
  private createErrorComponent(error: Error): RouteComponent {
    return {
      name: 'DeviceComponentError',
      setup() {
        return () => {
          return h('div', { class: 'device-component-error' }, [
            h('h3', '组件加载失败'),
            h('p', error.message),
          ])
        }
      },
    }
  }

  /**
   * 检查组件是否支持当前设备
   */
  isComponentSupportedOnDevice(
    record: RouteRecordNormalized,
    device: DeviceType,
  ): boolean {
    // 如果有设备特定组件，检查是否支持当前设备
    const deviceComponents = (record as any).deviceComponents
    if (deviceComponents) {
      return (
        !!deviceComponents[device]
        || this.hasAnyDeviceComponent(deviceComponents)
      )
    }

    // 如果有常规组件或模板，认为支持所有设备
    return !!(record.components || record.meta.template)
  }

  /**
   * 检查是否有任何设备组件可用作回退
   */
  private hasAnyDeviceComponent(
    deviceComponents: Record<string, RouteComponent>,
  ): boolean {
    const devices: DeviceType[] = ['desktop', 'tablet', 'mobile']
    return devices.some(device => !!deviceComponents[device])
  }
}

/**
 * 创建设备组件解析器的便捷函数
 */
export function createDeviceComponentResolver(
  getCurrentDevice: () => DeviceType,
): DeviceComponentResolver {
  return new DeviceComponentResolver(getCurrentDevice)
}
