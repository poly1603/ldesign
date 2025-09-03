/**
 * 表单处理 Hooks
 *
 * @description
 * 提供完整的表单状态管理、验证和提交功能。
 * 支持字段级验证、异步验证、表单重置等功能。
 */
import { type Ref } from 'vue';
/**
 * 表单配置选项
 */
export interface FormOptions<T extends Record<string, any>> {
    /** 表单验证函数 */
    validate?: (values: T) => Record<string, string> | Promise<Record<string, string>>;
    /** 字段级验证器 */
    fieldValidators?: {
        [K in keyof T]?: (value: T[K]) => string | true;
    };
    /** 提交处理函数 */
    onSubmit?: (values: T) => Promise<void> | void;
}
/**
 * 表单返回值
 */
export interface UseFormReturn<T extends Record<string, any>> {
    /** 表单值 */
    values: Ref<T>;
    /** 表单错误 */
    errors: Ref<Record<string, string>>;
    /** 字段触摸状态 */
    touched: Ref<Record<string, boolean>>;
    /** 表单是否脏（已修改） */
    dirty: Ref<boolean>;
    /** 表单是否有效 */
    valid: Ref<boolean>;
    /** 表单是否为空 */
    isEmpty: Ref<boolean>;
    /** 是否有错误 */
    hasErrors: Ref<boolean>;
    /** 是否正在提交 */
    isSubmitting: Ref<boolean>;
    /** 设置字段值 */
    setFieldValue: (field: string, value: any) => void;
    /** 设置多个字段值 */
    setValues: (values: Partial<T>) => void;
    /** 设置字段错误 */
    setFieldError: (field: string, error: string) => void;
    /** 清除字段错误 */
    clearFieldError: (field: string) => void;
    /** 验证字段 */
    validateField: (field: string) => Promise<boolean>;
    /** 验证整个表单 */
    validate: () => Promise<boolean>;
    /** 重置表单 */
    reset: () => void;
    /** 提交表单 */
    submit: () => Promise<void>;
}
/**
 * 表单 Hook
 *
 * @param initialValues - 初始值
 * @param options - 配置选项
 * @returns 表单状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const form = useForm({
 *       name: '',
 *       email: '',
 *       age: 0,
 *     }, {
 *       validate: (values) => {
 *         const errors: Record<string, string> = {}
 *         if (!values.name) {
 *           errors.name = '姓名不能为空'
 *         }
 *         if (!values.email) {
 *           errors.email = '邮箱不能为空'
 *         }
 *         return errors
 *       },
 *       onSubmit: async (values) => {
 *         console.log('提交数据:', values)
 *       }
 *     })
 *
 *     return {
 *       form
 *     }
 *   }
 * })
 * ```
 */
export declare function useForm<T extends Record<string, any>>(initialValues: T, options?: FormOptions<T>): UseFormReturn<T>;
//# sourceMappingURL=useForm.d.ts.map