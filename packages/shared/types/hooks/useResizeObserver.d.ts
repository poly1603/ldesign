import { Ref } from 'vue';

declare function useResizeObserver(container: Ref<HTMLElement>, callback: (data: ResizeObserverEntry[]) => void): void;

export { useResizeObserver };
