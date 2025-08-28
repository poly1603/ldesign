export interface MutationCallback {
    (mutations: MutationRecord[]): void;
}
interface Options {
    debounceTime?: number;
    config?: MutationObserverInit;
}
/**
 * useMutationObservable
 * @param targetEl 监听对象
 * @param callback 回调方法
 * @param options 配置项
 */
export declare function useMutationObservable(targetEl: HTMLElement | null, callback: MutationCallback, options?: Options): void;
export default useMutationObservable;
//# sourceMappingURL=useMutationObservable.d.ts.map