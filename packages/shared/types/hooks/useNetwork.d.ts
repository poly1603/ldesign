import { Ref } from 'vue';

/**
 * 网络状态检测 Hook
 *
 * @description
 * 提供网络连接状态检测功能，包括在线/离线状态、网络类型、连接速度等信息。
 * 支持实时监听网络状态变化。
 */

/**
 * 网络连接类型
 */
type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';
/**
 * 网络有效连接类型
 */
type EffectiveType = 'slow-2g' | '2g' | '3g' | '4g';
/**
 * 网络状态信息
 */
interface NetworkState {
    /** 是否在线 */
    isOnline: boolean;
    /** 网络连接类型 */
    type: NetworkType;
    /** 有效连接类型 */
    effectiveType: EffectiveType;
    /** 下行链路速度（Mbps） */
    downlink: number;
    /** 往返时间（毫秒） */
    rtt: number;
    /** 是否启用数据保护模式 */
    saveData: boolean;
    /** 上次更新时间 */
    since: Date;
}
/**
 * 网络状态检测 Hook
 *
 * @returns 网络状态信息和相关方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const {
 *       isOnline,
 *       type,
 *       effectiveType,
 *       downlink,
 *       rtt,
 *       saveData,
 *       since,
 *       refresh
 *     } = useNetwork()
 *
 *     // 监听网络状态变化
 *     watch(isOnline, (online) => {
 *       if (online) {
 *         console.log('网络已连接')
 *         // 重新加载数据
 *         loadData()
 *       } else {
 *         console.log('网络已断开')
 *         // 显示离线提示
 *         showOfflineMessage()
 *       }
 *     })
 *
 *     // 根据网络类型调整行为
 *     watch([type, effectiveType], ([networkType, effective]) => {
 *       if (effective === 'slow-2g' || effective === '2g') {
 *         // 低速网络，减少数据传输
 *         enableLowDataMode()
 *       }
 *     })
 *
 *     return {
 *       isOnline,
 *       type,
 *       effectiveType,
 *       downlink,
 *       rtt,
 *       saveData,
 *       since,
 *       refresh
 *     }
 *   }
 * })
 * ```
 */
declare function useNetwork(): {
    isOnline: Ref<boolean>;
    type: Ref<NetworkType>;
    effectiveType: Ref<EffectiveType>;
    downlink: Ref<number>;
    rtt: Ref<number>;
    saveData: Ref<boolean>;
    since: Ref<Date>;
    refresh: () => void;
};
/**
 * 简化的在线状态检测 Hook
 *
 * @returns 是否在线的响应式引用
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const isOnline = useOnline()
 *
 *     return {
 *       isOnline
 *     }
 *   }
 * })
 * ```
 */
declare function useOnline(): Ref<boolean>;
/**
 * 网络质量检测 Hook
 *
 * @returns 网络质量信息
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { quality, isSlow, isFast } = useNetworkQuality()
 *
 *     // 根据网络质量调整应用行为
 *     watch(quality, (newQuality) => {
 *       switch (newQuality) {
 *         case 'poor':
 *           enableLowDataMode()
 *           break
 *         case 'good':
 *           enableNormalMode()
 *           break
 *         case 'excellent':
 *           enableHighQualityMode()
 *           break
 *       }
 *     })
 *
 *     return {
 *       quality,
 *       isSlow,
 *       isFast
 *     }
 *   }
 * })
 * ```
 */
declare function useNetworkQuality(): {
    quality: Ref<"poor" | "good" | "excellent">;
    isSlow: Ref<boolean>;
    isFast: Ref<boolean>;
};

export { useNetwork, useNetworkQuality, useOnline };
export type { EffectiveType, NetworkState, NetworkType };
