import type { Ref } from 'vue';
import type { DeviceDetectorOptions, UseDeviceReturn } from '../../types';
/**
 * Vue3 设备检测 Composition API
 */
export declare function useDevice(options?: DeviceDetectorOptions): UseDeviceReturn;
/**
 * 使用网络信息
 */
export declare function useNetwork(): {
    networkInfo: Readonly<Ref<any, any>>;
    isOnline: Readonly<Ref<boolean, boolean>>;
    connectionType: Readonly<Ref<string, string>>;
};
/**
 * 使用电池信息
 */
export declare function useBattery(): {
    batteryInfo: Readonly<Ref<any, any>>;
    batteryLevel: Readonly<Ref<number, number>>;
    isCharging: Readonly<Ref<boolean, boolean>>;
    batteryStatus: Readonly<Ref<string, string>>;
};
/**
 * 使用地理位置信息
 */
export declare function useGeolocation(): {
    position: Readonly<Ref<any, any>>;
    latitude: Readonly<Ref<number | null, number | null>>;
    longitude: Readonly<Ref<number | null, number | null>>;
    accuracy: Readonly<Ref<number | null, number | null>>;
    error: Readonly<Ref<string | null, string | null>>;
    isSupported: Readonly<Ref<boolean, boolean>>;
};
//# sourceMappingURL=useDevice.d.ts.map