import { Ref } from 'vue';

declare function useElementLazyRender(labelRef: Ref<HTMLElement>, lazyLoad: Ref<boolean>): {
    showElement: Ref<boolean, boolean>;
};

export { useElementLazyRender as default, useElementLazyRender };
