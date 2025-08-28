import type { Ref } from 'vue';
export type ChangeHandler<T, P extends any[]> = (value: T, ...args: P) => void;
export declare function useVModel<T, P extends any[]>(value: Ref<T>, modelValue: Ref<T>, defaultValue: T, onChange: ChangeHandler<T, P>, propName?: string): [Ref<T>, ChangeHandler<T, P>];
//# sourceMappingURL=useVModel.d.ts.map