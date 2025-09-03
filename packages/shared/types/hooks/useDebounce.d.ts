/**
 * 防抖和节流 Hooks
 *
 * @description
 * 提供防抖和节流功能的 Vue 3 Hooks，用于优化性能和用户体验。
 * 支持响应式值的防抖处理和函数的防抖/节流包装。
 */
import { type Ref } from 'vue';
/**
 * 防抖值 Hook
 *
 * @param value - 要防抖的响应式值
 * @param delay - 防抖延迟时间（毫秒）
 * @returns 防抖后的响应式值
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const searchQuery = ref('')
 *     const debouncedQuery = useDebounceValue(searchQuery, 300)
 *
 *     // 监听防抖后的值
 *     watch(debouncedQuery, (newQuery) => {
 *       if (newQuery) {
 *         performSearch(newQuery)
 *       }
 *     })
 *
 *     return {
 *       searchQuery,
 *       debouncedQuery
 *     }
 *   }
 * })
 * ```
 */
export declare function useDebounceValue<T>(value: Ref<T>, delay: number): Ref<T>;
/**
 * 防抖函数 Hook
 *
 * @param fn - 要防抖的函数
 * @param delay - 防抖延迟时间（毫秒）
 * @param immediate - 是否立即执行（默认为 false）
 * @returns 防抖后的函数和取消函数
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const [debouncedSave, cancelSave] = useDebounceFunction(
 *       (data: any) => {
 *         console.log('Saving data:', data)
 *         // 执行保存逻辑
 *       },
 *       1000
 *     )
 *
 *     const handleInputChange = (value: string) => {
 *       debouncedSave({ content: value })
 *     }
 *
 *     return {
 *       handleInputChange,
 *       cancelSave
 *     }
 *   }
 * })
 * ```
 */
export declare function useDebounceFunction<T extends (...args: any[]) => any>(fn: T, delay: number, immediate?: boolean): [T, () => void];
/**
 * 节流值 Hook
 *
 * @param value - 要节流的响应式值
 * @param delay - 节流延迟时间（毫秒）
 * @returns 节流后的响应式值
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const scrollPosition = ref(0)
 *     const throttledPosition = useThrottleValue(scrollPosition, 100)
 *
 *     // 监听节流后的滚动位置
 *     watch(throttledPosition, (position) => {
 *       updateScrollIndicator(position)
 *     })
 *
 *     return {
 *       scrollPosition,
 *       throttledPosition
 *     }
 *   }
 * })
 * ```
 */
export declare function useThrottleValue<T>(value: Ref<T>, delay: number): Ref<T>;
/**
 * 节流函数 Hook
 *
 * @param fn - 要节流的函数
 * @param delay - 节流延迟时间（毫秒）
 * @returns 节流后的函数
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const throttledScroll = useThrottleFunction(
 *       (event: Event) => {
 *         console.log('Scroll event:', event)
 *         // 处理滚动事件
 *       },
 *       100
 *     )
 *
 *     onMounted(() => {
 *       window.addEventListener('scroll', throttledScroll)
 *     })
 *
 *     onUnmounted(() => {
 *       window.removeEventListener('scroll', throttledScroll)
 *     })
 *
 *     return {
 *       throttledScroll
 *     }
 *   }
 * })
 * ```
 */
export declare function useThrottleFunction<T extends (...args: any[]) => any>(fn: T, delay: number): T;
/**
 * 组合防抖和节流 Hook
 *
 * @param value - 要处理的响应式值
 * @param debounceDelay - 防抖延迟时间
 * @param throttleDelay - 节流延迟时间
 * @returns 处理后的响应式值
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const inputValue = ref('')
 *
 *     // 先节流再防抖，适用于搜索输入框
 *     const processedValue = useDebounceThrottle(inputValue, 300, 100)
 *
 *     watch(processedValue, (value) => {
 *       performSearch(value)
 *     })
 *
 *     return {
 *       inputValue,
 *       processedValue
 *     }
 *   }
 * })
 * ```
 */
export declare function useDebounceThrottle<T>(value: Ref<T>, debounceDelay: number, throttleDelay: number): Ref<T>;
//# sourceMappingURL=useDebounce.d.ts.map