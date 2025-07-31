import type { Plugin } from 'vue';
import { DeviceDetector } from '../../core/DeviceDetector';
import type { DevicePluginOptions } from '../../types';
/**
 * Vue3 设备检测插件
 */
export declare const DevicePlugin: Plugin;
/**
 * 创建设备检测插件
 */
export declare function createDevicePlugin(options?: DevicePluginOptions): Plugin;
/**
 * 在组合式 API 中获取设备检测器实例
 */
export declare function useDeviceDetector(): DeviceDetector;
export default DevicePlugin;
//# sourceMappingURL=index.d.ts.map