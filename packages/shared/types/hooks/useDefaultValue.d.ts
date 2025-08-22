import '../node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.js';
import { ChangeHandler } from './useVModel.js';
import { Ref } from '../node_modules/.pnpm/@vue_reactivity@3.5.18/node_modules/@vue/reactivity/dist/reactivity.d.js';

declare function useDefaultValue<T, P extends any[]>(value: Ref<T>, defaultValue: T, onChange: ChangeHandler<T, P>, propsName: string): [Ref<T>, ChangeHandler<T, P>];

export { useDefaultValue };
