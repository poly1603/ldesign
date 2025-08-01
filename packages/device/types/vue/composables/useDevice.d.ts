import { DeviceDetectorOptions, UseDeviceReturn } from '../../types/index.js';

/**
 * Vue3 设备检测 Composition API
 */
declare function useDevice(options?: DeviceDetectorOptions): UseDeviceReturn;
/**
 * 使用网络信息
 */
declare function useNetwork(): {
    networkInfo: any;
    isOnline: any;
    connectionType: any;
};
/**
 * 使用电池信息
 */
declare function useBattery(): {
    batteryInfo: any;
    batteryLevel: any;
    isCharging: any;
    batteryStatus: any;
};
/**
 * 使用地理位置信息
 */
declare function useGeolocation(): {
    position: any;
    latitude: any;
    longitude: any;
    accuracy: any;
    error: any;
    isSupported: any;
};

export { useBattery, useDevice, useGeolocation, useNetwork };
