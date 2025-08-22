import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { Ref } from '../node_modules/.pnpm/@vue_reactivity@3.5.18/node_modules/@vue/reactivity/dist/reactivity.d.js';

declare function useResizeObserver(container: Ref<HTMLElement>, callback: (data: ResizeObserverEntry[]) => void): void;

export { useResizeObserver };
