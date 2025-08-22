import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { Ref } from '../node_modules/.pnpm/@vue_reactivity@3.5.18/node_modules/@vue/reactivity/dist/reactivity.d.js';
import '../node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.js';

type ChangeHandler<T, P extends any[]> = (value: T, ...args: P) => void;
declare function useVModel<T, P extends any[]>(value: Ref<T>, modelValue: Ref<T>, defaultValue: T, onChange: ChangeHandler<T, P>, propName?: string): [Ref<T>, ChangeHandler<T, P>];

export { useVModel };
export type { ChangeHandler };
