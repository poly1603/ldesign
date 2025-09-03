/**
 * 全屏模式控制 Hook
 *
 * @description
 * 提供全屏模式的进入、退出、切换功能，支持指定元素全屏，
 * 兼容各种浏览器的全屏 API。
 */
import { type Ref } from 'vue';
/**
 * 全屏状态
 */
export interface FullscreenState {
    /** 是否支持全屏 */
    isSupported: boolean;
    /** 是否处于全屏状态 */
    isFullscreen: boolean;
    /** 当前全屏元素 */
    element: Element | null;
    /** 是否正在切换 */
    isToggling: boolean;
}
/**
 * 全屏配置
 */
export interface FullscreenConfig {
    /** 进入全屏时的回调 */
    onEnter?: (element: Element) => void;
    /** 退出全屏时的回调 */
    onExit?: () => void;
    /** 全屏状态改变时的回调 */
    onChange?: (isFullscreen: boolean, element: Element | null) => void;
    /** 全屏错误时的回调 */
    onError?: (error: Error) => void;
}
/**
 * 全屏模式 Hook
 *
 * @param target - 目标元素（可选，默认为 document.documentElement）
 * @param config - 配置选项
 * @returns 全屏状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const videoRef = ref<HTMLVideoElement>()
 *
 *     const { state, enter, exit, toggle } = useFullscreen(videoRef, {
 *       onEnter: (element) => {
 *         console.log('进入全屏:', element)
 *       },
 *       onExit: () => {
 *         console.log('退出全屏')
 *       }
 *     })
 *
 *     const handleToggleFullscreen = () => {
 *       toggle()
 *     }
 *
 *     return {
 *       videoRef,
 *       state,
 *       handleToggleFullscreen
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <video ref="videoRef" src="video.mp4" controls></video>
 *     <button
 *       @click="toggle()"
 *       :disabled="!state.isSupported || state.isToggling"
 *     >
 *       {{ state.isFullscreen ? '退出全屏' : '进入全屏' }}
 *     </button>
 *
 *     <div ref="containerRef" class="fullscreen-container">
 *       <p>这个容器可以全屏</p>
 *       <button @click="enterContainer">容器全屏</button>
 *     </div>
 *   </div>
 * </template>
 *
 * <script setup>
 * const videoRef = ref()
 * const containerRef = ref()
 *
 * const { state, toggle } = useFullscreen(videoRef)
 * const { enter: enterContainer } = useFullscreen(containerRef)
 * </script>
 * ```
 */
export declare function useFullscreen(target?: Ref<Element | null> | Element | null, config?: FullscreenConfig): {
    state: import("vue").ComputedRef<FullscreenState>;
    enter: (element?: Element) => Promise<boolean>;
    exit: () => Promise<boolean>;
    toggle: (element?: Element) => Promise<boolean>;
    isElementFullscreen: (element: Element) => boolean;
};
/**
 * 简化的全屏函数
 *
 * @param element - 要全屏的元素（可选）
 * @returns 是否成功进入全屏
 *
 * @example
 * ```typescript
 * // 整个页面全屏
 * const success = await enterFullscreen()
 *
 * // 指定元素全屏
 * const videoElement = document.querySelector('video')
 * const success = await enterFullscreen(videoElement)
 * ```
 */
export declare const enterFullscreen: (element?: Element) => Promise<boolean>;
/**
 * 退出全屏
 *
 * @returns 是否成功退出全屏
 *
 * @example
 * ```typescript
 * const success = await exitFullscreen()
 * ```
 */
export declare const exitFullscreen: () => Promise<boolean>;
/**
 * 切换全屏状态
 *
 * @param element - 要全屏的元素（可选）
 * @returns 是否操作成功
 *
 * @example
 * ```typescript
 * const success = await toggleFullscreen()
 * ```
 */
export declare const toggleFullscreen: (element?: Element) => Promise<boolean>;
/**
 * 检查全屏支持性
 *
 * @returns 是否支持全屏
 *
 * @example
 * ```typescript
 * if (isFullscreenSupported()) {
 *   // 显示全屏按钮
 * }
 * ```
 */
export declare const isFullscreenSupported: () => boolean;
/**
 * 获取当前全屏元素
 *
 * @returns 当前全屏元素或 null
 *
 * @example
 * ```typescript
 * const fullscreenElement = getCurrentFullscreenElement()
 * if (fullscreenElement) {
 *   console.log('当前全屏元素:', fullscreenElement)
 * }
 * ```
 */
export declare const getCurrentFullscreenElement: () => Element | null;
/**
 * 检查是否处于全屏状态
 *
 * @returns 是否处于全屏状态
 *
 * @example
 * ```typescript
 * if (isCurrentlyFullscreen()) {
 *   console.log('当前处于全屏状态')
 * }
 * ```
 */
export declare const isCurrentlyFullscreen: () => boolean;
//# sourceMappingURL=useFullscreen.d.ts.map