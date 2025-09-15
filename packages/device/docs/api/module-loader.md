# ModuleLoader

扩展模块加载器，负责按需加载并管理模块生命周期。内部由 DeviceDetector 使用；通常不需要直接使用它，但理解其行为有助于排查问题。

## 说明

- `load(name): Promise<T>` — 加载模块并返回模块数据（module.getData()）。
- `loadModuleInstance(name): Promise<DeviceModule>` — 加载并返回模块实例。
- `unload(name): Promise<void>` — 卸载模块，调用模块的 destroy。
- `isLoaded(name): boolean` — 模块是否已加载。
- `getLoadedModules(): string[]` — 已加载模块名称。
- `unloadAll(): Promise<void>` — 卸载所有模块。

## 支持的模块名

- network — 网络信息模块
- battery — 电池信息模块
- geolocation — 地理位置模块

