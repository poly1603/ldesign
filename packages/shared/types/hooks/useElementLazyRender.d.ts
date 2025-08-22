import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { Ref } from '../node_modules/.pnpm/@vue_reactivity@3.5.18/node_modules/@vue/reactivity/dist/reactivity.d.js';

declare function useElementLazyRender(labelRef: Ref<HTMLElement>, lazyLoad: Ref<boolean>): {
    showElement: Ref<boolean, boolean>;
};

export { useElementLazyRender as default, useElementLazyRender };
