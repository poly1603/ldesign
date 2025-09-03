/**
 * 交叉观察器 Hook
 *
 * @description
 * 提供 Intersection Observer API 的封装，用于检测元素与视口或其他元素的交叉状态。
 * 支持多个元素观察、自定义配置、性能优化等功能。
 */
import { type Ref } from 'vue';
/**
 * 交叉观察器配置
 */
export interface IntersectionObserverConfig {
    /** 根元素 */
    root?: Element | null;
    /** 根元素边距 */
    rootMargin?: string;
    /** 触发阈值 */
    threshold?: number | number[];
    /** 是否立即开始观察 */
    immediate?: boolean;
}
/**
 * 交叉观察器状态
 */
export interface IntersectionObserverState {
    /** 是否支持 Intersection Observer */
    isSupported: boolean;
    /** 是否正在观察 */
    isObserving: boolean;
    /** 观察的元素数量 */
    observedCount: number;
}
/**
 * 元素交叉状态
 */
export interface ElementIntersectionState {
    /** 是否可见 */
    isIntersecting: boolean;
    /** 交叉比例 */
    intersectionRatio: number;
    /** 交叉矩形 */
    intersectionRect: DOMRectReadOnly | null;
    /** 边界矩形 */
    boundingClientRect: DOMRectReadOnly | null;
    /** 根边界矩形 */
    rootBounds: DOMRectReadOnly | null;
    /** 时间戳 */
    time: number;
    /** 目标元素 */
    target: Element | null;
}
/**
 * 交叉观察器 Hook
 *
 * @param config - 配置选项
 * @returns 观察器状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const elementRef = ref<HTMLElement>()
 *
 *     const { state, observe, unobserve, disconnect } = useIntersectionObserver({
 *       threshold: [0, 0.25, 0.5, 0.75, 1],
 *       rootMargin: '10px'
 *     })
 *
 *     const elementState = ref<ElementIntersectionState | null>(null)
 *
 *     onMounted(() => {
 *       if (elementRef.value) {
 *         observe(elementRef.value, (entry) => {
 *           elementState.value = {
 *             isIntersecting: entry.isIntersecting,
 *             intersectionRatio: entry.intersectionRatio,
 *             intersectionRect: entry.intersectionRect,
 *             boundingClientRect: entry.boundingClientRect,
 *             rootBounds: entry.rootBounds,
 *             time: entry.time,
 *             target: entry.target
 *           }
 *         })
 *       }
 *     })
 *
 *     return {
 *       elementRef,
 *       state,
 *       elementState,
 *       observe,
 *       unobserve,
 *       disconnect
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <div ref="elementRef" class="observed-element">
 *       <p v-if="elementState">
 *         可见: {{ elementState.isIntersecting }}
 *         <br>
 *         交叉比例: {{ (elementState.intersectionRatio * 100).toFixed(1) }}%
 *       </p>
 *     </div>
 *
 *     <div class="status">
 *       观察器状态: {{ state.isObserving ? '运行中' : '已停止' }}
 *       <br>
 *       观察元素数: {{ state.observedCount }}
 *     </div>
 *   </div>
 * </template>
 * ```
 */
export declare function useIntersectionObserver(config?: IntersectionObserverConfig): {
    state: import("vue").ComputedRef<IntersectionObserverState>;
    observe: (element: Element, callback: (entry: IntersectionObserverEntry) => void) => void;
    unobserve: (element: Element) => void;
    disconnect: () => void;
    reconnect: () => void;
};
/**
 * 单元素交叉观察器 Hook
 *
 * @param target - 目标元素
 * @param config - 配置选项
 * @returns 元素交叉状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const elementRef = ref<HTMLElement>()
 *
 *     const { state, start, stop } = useElementIntersectionObserver(elementRef, {
 *       threshold: [0, 0.5, 1],
 *       onIntersect: (entry) => {
 *         console.log('交叉状态变化:', entry.isIntersecting)
 *       }
 *     })
 *
 *     return {
 *       elementRef,
 *       state,
 *       start,
 *       stop
 *     }
 *   }
 * })
 * ```
 */
export declare function useElementIntersectionObserver(target: Ref<Element | null>, config?: IntersectionObserverConfig & {
    onIntersect?: (entry: IntersectionObserverEntry) => void;
    onEnter?: (entry: IntersectionObserverEntry) => void;
    onLeave?: (entry: IntersectionObserverEntry) => void;
}): {
    state: import("vue").ComputedRef<ElementIntersectionState>;
    start: () => void;
    stop: () => void;
    observerState: import("vue").ComputedRef<IntersectionObserverState>;
};
/**
 * 可见性检测 Hook
 *
 * @param target - 目标元素
 * @param config - 配置选项
 * @returns 可见性状态
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const elementRef = ref<HTMLElement>()
 *
 *     const { isVisible, visibilityRatio } = useVisibility(elementRef, {
 *       threshold: 0.5 // 50% 可见时才算可见
 *     })
 *
 *     return {
 *       elementRef,
 *       isVisible,
 *       visibilityRatio
 *     }
 *   }
 * })
 * ```
 */
export declare function useVisibility(target: Ref<Element | null>, config?: IntersectionObserverConfig & {
    visibilityThreshold?: number;
}): {
    isVisible: import("vue").ComputedRef<boolean>;
    visibilityRatio: import("vue").ComputedRef<number>;
    state: import("vue").ComputedRef<ElementIntersectionState>;
};
//# sourceMappingURL=useIntersectionObserver.d.ts.map