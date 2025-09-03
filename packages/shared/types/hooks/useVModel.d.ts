import { Ref } from 'vue';

type ChangeHandler<T, P extends any[]> = (value: T, ...args: P) => void;
declare function useVModel<T, P extends any[]>(value: Ref<T>, modelValue: Ref<T>, defaultValue: T, onChange: ChangeHandler<T, P>, propName?: string): [Ref<T>, ChangeHandler<T, P>];

export { useVModel };
export type { ChangeHandler };
