import type { Directive } from 'vue';
import type { DeviceDirectiveValue } from '../../types';
/**
 * v-device 指令实现
 */
export declare const vDevice: Directive<HTMLElement, DeviceDirectiveValue>;
/**
 * 设备类型修饰符指令
 */
export declare const vDeviceMobile: Directive<HTMLElement>;
export declare const vDeviceTablet: Directive<HTMLElement>;
export declare const vDeviceDesktop: Directive<HTMLElement>;
/**
 * 清理全局设备检测器
 */
export declare function cleanupGlobalDetector(): void;
//# sourceMappingURL=vDevice.d.ts.map