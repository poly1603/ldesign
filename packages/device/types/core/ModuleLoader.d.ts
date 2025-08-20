import { ModuleLoader as ModuleLoader$1, DeviceModule } from '../types/index.js';

/**
 * 模块加载器实现
 */
declare class ModuleLoader implements ModuleLoader$1 {
    private modules;
    private loadingPromises;
    /**
     * 加载模块并返回数据
     */
    load<T = unknown>(name: string): Promise<T>;
    /**
     * 加载模块并返回模块实例
     */
    loadModuleInstance<T extends DeviceModule = DeviceModule>(name: string): Promise<T>;
    /**
     * 卸载模块
     */
    unload(name: string): Promise<void>;
    /**
     * 检查模块是否已加载
     */
    isLoaded(name: string): boolean;
    /**
     * 获取已加载的模块
     */
    getModule(name: string): DeviceModule | undefined;
    /**
     * 获取所有已加载的模块名称
     */
    getLoadedModules(): string[];
    /**
     * 卸载所有模块
     */
    unloadAll(): Promise<void>;
    /**
     * 实际加载模块的方法
     */
    private loadModule;
    /**
     * 加载网络信息模块
     */
    private loadNetworkModule;
    /**
     * 加载电池信息模块
     */
    private loadBatteryModule;
    /**
     * 加载地理位置模块
     */
    private loadGeolocationModule;
}

export { ModuleLoader };
