/**
 * 用于订阅Listener事件
 * @param updateSize
 */
declare function useListener(type: string, listener: () => void): void;
declare function useResize(listener: () => void, observer?: HTMLElement): void;

export { useListener, useResize };
