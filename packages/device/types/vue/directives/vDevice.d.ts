import { Directive } from 'vue';
import { DeviceDirectiveValue } from '../../types/index.js';

/**
 * v-device 指令实现
 */
declare const vDevice: Directive<HTMLElement, DeviceDirectiveValue>;
/**
 * 设备类型修饰符指令
 */
declare const vDeviceMobile: Directive<HTMLElement>;
declare const vDeviceTablet: Directive<HTMLElement>;
declare const vDeviceDesktop: Directive<HTMLElement>;
/**
 * 清理全局设备检测器
 */
declare function cleanupGlobalDetector(): void;

export { cleanupGlobalDetector, vDevice, vDeviceDesktop, vDeviceMobile, vDeviceTablet };
