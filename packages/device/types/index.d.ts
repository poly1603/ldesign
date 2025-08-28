export { DeviceDetector } from './core/DeviceDetector';
export { DeviceDetector as default } from './core/DeviceDetector';
export { EventEmitter } from './core/EventEmitter';
export { ModuleLoader } from './core/ModuleLoader';
export { BatteryModule } from './modules/BatteryModule';
export { GeolocationModule } from './modules/GeolocationModule';
export { NetworkModule } from './modules/NetworkModule';
export type { BatteryInfo, DeviceDetectorEvents, DeviceDetectorOptions, DeviceInfo, DeviceModule, DeviceType, EventListener, GeolocationInfo, ModuleLoader as IModuleLoader, NetworkInfo, NetworkStatus, NetworkType, Orientation, } from './types';
export { debounce, formatBytes, generateId, getDeviceTypeByWidth, getPixelRatio, getScreenOrientation, isAPISupported, isMobileDevice, isTouchDevice, parseBrowser, parseOS, safeNavigatorAccess, throttle, } from './utils';
export * from './vue';
//# sourceMappingURL=index.d.ts.map