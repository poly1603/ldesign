import { Plugin } from 'vue';
import { DeviceDetector } from '../../core/DeviceDetector.js';
import { DevicePluginOptions } from '../../types/index.js';

/**
 * Vue3 设备检测插件
 */
declare const DevicePlugin: Plugin;
/**
 * 创建设备检测插件
 */
declare function createDevicePlugin(options?: DevicePluginOptions): Plugin;
/**
 * 在组合式 API 中获取设备检测器实例
 */
declare function useDeviceDetector(): DeviceDetector;

export { DevicePlugin, createDevicePlugin, DevicePlugin as default, useDeviceDetector };
