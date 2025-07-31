import type { DeviceModule, ModuleLoader as IModuleLoader } from '../types'

/**
 * 模块加载器实现
 */
export class ModuleLoader implements IModuleLoader {
  private modules: Map<string, DeviceModule> = new Map()
  private loadingPromises: Map<string, Promise<any>> = new Map()

  /**
   * 加载模块
   */
  async load<T = any>(name: string): Promise<T> {
    // 如果模块已经加载，直接返回
    if (this.modules.has(name)) {
      return this.modules.get(name)!.getData()
    }

    // 如果正在加载，返回加载中的 Promise
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name)!
    }

    // 开始加载模块
    const loadingPromise = this.loadModule(name)
    this.loadingPromises.set(name, loadingPromise)

    try {
      const module = await loadingPromise
      this.modules.set(name, module)
      this.loadingPromises.delete(name)
      return module.getData()
    }
    catch (error) {
      this.loadingPromises.delete(name)
      throw error
    }
  }

  /**
   * 卸载模块
   */
  async unload(name: string): Promise<void> {
    const module = this.modules.get(name)
    if (!module)
      return

    try {
      await module.destroy()
    }
    catch (error) {
      console.error(`Error destroying module "${name}":`, error)
    }
    finally {
      this.modules.delete(name)
    }
  }

  /**
   * 检查模块是否已加载
   */
  isLoaded(name: string): boolean {
    return this.modules.has(name)
  }

  /**
   * 获取已加载的模块
   */
  getModule(name: string): DeviceModule | undefined {
    return this.modules.get(name)
  }

  /**
   * 获取所有已加载的模块名称
   */
  getLoadedModules(): string[] {
    return Array.from(this.modules.keys())
  }

  /**
   * 卸载所有模块
   */
  async unloadAll(): Promise<void> {
    const unloadPromises = Array.from(this.modules.keys()).map(name => this.unload(name))
    await Promise.all(unloadPromises)
  }

  /**
   * 实际加载模块的方法
   */
  private async loadModule(name: string): Promise<DeviceModule> {
    switch (name) {
      case 'network':
        return this.loadNetworkModule()
      case 'battery':
        return this.loadBatteryModule()
      case 'geolocation':
        return this.loadGeolocationModule()
      default:
        throw new Error(`Unknown module: ${name}`)
    }
  }

  /**
   * 加载网络信息模块
   */
  private async loadNetworkModule(): Promise<DeviceModule> {
    const { NetworkModule } = await import('../modules/NetworkModule')
    const module = new NetworkModule()
    await module.init()
    return module
  }

  /**
   * 加载电池信息模块
   */
  private async loadBatteryModule(): Promise<DeviceModule> {
    const { BatteryModule } = await import('../modules/BatteryModule')
    const module = new BatteryModule()
    await module.init()
    return module
  }

  /**
   * 加载地理位置模块
   */
  private async loadGeolocationModule(): Promise<DeviceModule> {
    const { GeolocationModule } = await import('../modules/GeolocationModule')
    const module = new GeolocationModule()
    await module.init()
    return module
  }
}
