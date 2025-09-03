/**
 * 虚拟列表 Hook
 *
 * @description
 * 提供虚拟列表功能，用于渲染大量数据时的性能优化。
 * 只渲染可视区域内的元素，大幅提升渲染性能。
 */
import { type Ref } from 'vue';
/**
 * 虚拟列表配置
 */
export interface VirtualListConfig {
    /** 每个项目的高度（固定高度模式） */
    itemHeight?: number;
    /** 容器高度 */
    containerHeight: number;
    /** 预渲染的项目数量（上下各多渲染几个） */
    overscan?: number;
    /** 是否启用动态高度 */
    dynamic?: boolean;
    /** 获取项目高度的函数（动态高度模式） */
    getItemHeight?: (index: number) => number;
    /** 滚动防抖延迟（毫秒） */
    scrollDebounce?: number;
}
/**
 * 虚拟列表项目
 */
export interface VirtualListItem<T = any> {
    /** 项目数据 */
    data: T;
    /** 项目索引 */
    index: number;
    /** 项目高度 */
    height: number;
    /** 项目顶部偏移 */
    top: number;
    /** 项目底部偏移 */
    bottom: number;
}
/**
 * 虚拟列表状态
 */
export interface VirtualListState<T = any> {
    /** 可见的项目列表 */
    visibleItems: VirtualListItem<T>[];
    /** 开始索引 */
    startIndex: number;
    /** 结束索引 */
    endIndex: number;
    /** 总高度 */
    totalHeight: number;
    /** 偏移高度 */
    offsetY: number;
    /** 滚动位置 */
    scrollTop: number;
}
/**
 * 虚拟列表操作方法
 */
export interface VirtualListActions {
    /** 滚动到指定索引 */
    scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
    /** 滚动到指定位置 */
    scrollToOffset: (offset: number) => void;
    /** 更新项目高度（动态高度模式） */
    updateItemHeight: (index: number, height: number) => void;
    /** 刷新计算 */
    refresh: () => void;
}
/**
 * 虚拟列表 Hook
 *
 * @param data - 数据列表
 * @param config - 配置选项
 * @returns 虚拟列表状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const containerRef = ref<HTMLElement>()
 *     const data = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `Item ${i}` })))
 *
 *     const { state, actions, containerProps, wrapperProps } = useVirtualList(data, {
 *       containerHeight: 400,
 *       itemHeight: 50,
 *       overscan: 5
 *     })
 *
 *     const scrollToItem = (index: number) => {
 *       actions.scrollToIndex(index, 'center')
 *     }
 *
 *     return {
 *       containerRef,
 *       state,
 *       actions,
 *       containerProps,
 *       wrapperProps,
 *       scrollToItem
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="scrollToItem(5000)">滚动到第5000项</button>
 *
 *     <div
 *       ref="containerRef"
 *       v-bind="containerProps"
 *       class="virtual-list-container"
 *     >
 *       <div v-bind="wrapperProps" class="virtual-list-wrapper">
 *         <div
 *           v-for="item in state.visibleItems"
 *           :key="item.index"
 *           :style="{
 *             position: 'absolute',
 *             top: item.top + 'px',
 *             height: item.height + 'px',
 *             width: '100%'
 *           }"
 *           class="virtual-list-item"
 *         >
 *           {{ item.data.name }}
 *         </div>
 *       </div>
 *     </div>
 *   </div>
 * </template>
 *
 * <style>
 * .virtual-list-container {
 *   overflow: auto;
 * }
 *
 * .virtual-list-wrapper {
 *   position: relative;
 * }
 *
 * .virtual-list-item {
 *   display: flex;
 *   align-items: center;
 *   padding: 0 16px;
 *   border-bottom: 1px solid #eee;
 * }
 * </style>
 * ```
 */
export declare function useVirtualList<T = any>(data: Ref<T[]>, config: VirtualListConfig): {
    state: Ref<VirtualListState<T>>;
    actions: VirtualListActions;
    containerProps: import("vue").ComputedRef<{
        ref: Ref<HTMLElement | null, HTMLElement | null>;
        style: {
            height: string;
            overflow: string;
        };
        onScroll: (event: Event) => void;
    }>;
    wrapperProps: import("vue").ComputedRef<{
        style: {
            height: string;
            position: "relative";
        };
    }>;
};
//# sourceMappingURL=useVirtualList.d.ts.map