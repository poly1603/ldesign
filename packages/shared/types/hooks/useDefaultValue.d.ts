import { Ref } from 'vue';
import { ChangeHandler } from './useVModel.js';

declare function useDefaultValue<T, P extends any[]>(value: Ref<T>, defaultValue: T, onChange: ChangeHandler<T, P>, propsName: string): [Ref<T>, ChangeHandler<T, P>];

export { useDefaultValue };
