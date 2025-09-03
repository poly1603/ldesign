import * as vue from 'vue';
import { Ref } from 'vue';

/**
 * 懒加载配置
 */
interface LazyLoadConfig {
    /** 根元素边距，用于提前触发加载 */
    rootMargin?: string;
    /** 触发阈值 */
    threshold?: number | number[];
    /** 根元素 */
    root?: Element | null;
    /** 是否只触发一次 */
    once?: boolean;
    /** 是否立即检查 */
    immediate?: boolean;
    /** 进入可视区域回调 */
    onEnter?: (entry: IntersectionObserverEntry) => void;
    /** 离开可视区域回调 */
    onLeave?: (entry: IntersectionObserverEntry) => void;
    /** 可见性变化回调 */
    onChange?: (isVisible: boolean, entry: IntersectionObserverEntry) => void;
}
/**
 * 懒加载状态
 */
interface LazyLoadState {
    /** 是否可见 */
    isVisible: boolean;
    /** 是否已进入过 */
    hasEntered: boolean;
    /** 是否支持 Intersection Observer */
    isSupported: boolean;
    /** 最后一次 IntersectionObserverEntry */
    entry: IntersectionObserverEntry | null;
}
/**
 * 懒加载 Hook
 *
 * @param target - 目标元素
 * @param config - 配置选项
 * @returns 懒加载状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const imageRef = ref<HTMLImageElement>()
 *     const imageSrc = ref('')
 *
 *     const { state } = useLazyLoad(imageRef, {
 *       rootMargin: '50px',
 *       once: true,
 *       onEnter: () => {
 *         imageSrc.value = 'https://example.com/image.jpg'
 *       }
 *     })
 *
 *     return {
 *       imageRef,
 *       imageSrc,
 *       state
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 图片懒加载 -->
 *     <img
 *       ref="imageRef"
 *       :src="state.hasEntered ? imageSrc : placeholderSrc"
 *       alt="Lazy loaded image"
 *     />
 *
 *     <!-- 组件懒加载 -->
 *     <div ref="componentRef">
 *       <ExpensiveComponent v-if="componentState.isVisible" />
 *       <div v-else class="placeholder">Loading...</div>
 *     </div>
 *   </div>
 * </template>
 * ```
 */
declare function useLazyLoad(target: Ref<Element | null>, config?: LazyLoadConfig): {
    state: vue.ComputedRef<LazyLoadState>;
    restart: () => void;
    startObserving: () => void;
    stopObserving: () => void;
};
/**
 * 图片懒加载 Hook
 *
 * @param config - 配置选项
 * @returns 图片懒加载状态和方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { imageRef, state, setSrc } = useImageLazyLoad({
 *       placeholder: '/placeholder.jpg',
 *       onLoad: () => console.log('图片加载完成'),
 *       onError: () => console.log('图片加载失败')
 *     })
 *
 *     onMounted(() => {
 *       setSrc('https://example.com/image.jpg')
 *     })
 *
 *     return {
 *       imageRef,
 *       state
 *     }
 *   }
 * })
 * ```
 */
declare function useImageLazyLoad(config?: {
    placeholder?: string;
    rootMargin?: string;
    threshold?: number;
    onLoad?: () => void;
    onError?: () => void;
}): {
    imageRef: Ref<HTMLImageElement | null, HTMLImageElement | null>;
    state: vue.ComputedRef<{
        src: string;
        loading: boolean;
        loaded: boolean;
        error: boolean;
        /** 是否可见 */
        isVisible: boolean;
        /** 是否已进入过 */
        hasEntered: boolean;
        /** 是否支持 Intersection Observer */
        isSupported: boolean;
        /** 最后一次 IntersectionObserverEntry */
        entry: IntersectionObserverEntry | null;
    }>;
    setSrc: (newSrc: string) => void;
    reload: () => void;
};
/**
 * 批量懒加载 Hook
 *
 * @param items - 要懒加载的项目列表
 * @param config - 配置选项
 * @returns 批量懒加载状态和方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const items = ref([
 *       { id: 1, src: 'image1.jpg' },
 *       { id: 2, src: 'image2.jpg' },
 *       { id: 3, src: 'image3.jpg' },
 *     ])
 *
 *     const { states, getRef } = useBatchLazyLoad(items, {
 *       rootMargin: '100px',
 *       onItemEnter: (item, index) => {
 *         console.log(`Item ${index} entered:`, item)
 *       }
 *     })
 *
 *     return {
 *       items,
 *       states,
 *       getRef
 *     }
 *   }
 * })
 * ```
 */
declare function useBatchLazyLoad<T>(items: Ref<T[]>, config?: LazyLoadConfig & {
    onItemEnter?: (item: T, index: number) => void;
    onItemLeave?: (item: T, index: number) => void;
}): {
    states: vue.ComputedRef<{
        isVisible: boolean;
        hasEntered: boolean;
        isSupported: boolean;
        entry: {
            readonly boundingClientRect: {
                readonly bottom: number;
                readonly height: number;
                readonly left: number;
                readonly right: number;
                readonly top: number;
                readonly width: number;
                readonly x: number;
                readonly y: number;
                toJSON: () => any;
            };
            readonly intersectionRatio: number;
            readonly intersectionRect: {
                readonly bottom: number;
                readonly height: number;
                readonly left: number;
                readonly right: number;
                readonly top: number;
                readonly width: number;
                readonly x: number;
                readonly y: number;
                toJSON: () => any;
            };
            readonly isIntersecting: boolean;
            readonly rootBounds: {
                readonly bottom: number;
                readonly height: number;
                readonly left: number;
                readonly right: number;
                readonly top: number;
                readonly width: number;
                readonly x: number;
                readonly y: number;
                toJSON: () => any;
            } | null;
            readonly target: Element;
            readonly time: DOMHighResTimeStamp;
        } | null;
    }[]>;
    getRef: (index: number) => (el: Element | null) => void;
};

export { useBatchLazyLoad, useImageLazyLoad, useLazyLoad };
export type { LazyLoadConfig, LazyLoadState };
