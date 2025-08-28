import type { Ref } from 'vue';
import type { ChangeHandler } from './useVModel';
export declare function useDefaultValue<T, P extends any[]>(value: Ref<T>, defaultValue: T, onChange: ChangeHandler<T, P>, propsName: string): [Ref<T>, ChangeHandler<T, P>];
//# sourceMappingURL=useDefaultValue.d.ts.map