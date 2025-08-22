interface MutationCallback {
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
declare function useMutationObservable(targetEl: HTMLElement | null, callback: MutationCallback, options?: Options): void;

export { useMutationObservable as default, useMutationObservable };
export type { MutationCallback };
