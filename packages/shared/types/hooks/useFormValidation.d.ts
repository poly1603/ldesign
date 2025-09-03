/**
 * 表单验证 Hook
 *
 * @description
 * 提供灵活的表单验证功能，支持同步和异步验证、自定义验证规则、
 * 字段依赖验证等高级功能。
 */
import { type ComputedRef } from 'vue';
/**
 * 验证规则类型
 */
export type ValidatorFunction<T = any> = (value: T, formData?: Record<string, any>) => string | Promise<string> | true | Promise<true>;
/**
 * 内置验证规则
 */
export interface BuiltInRules {
    /** 必填 */
    required?: boolean | string;
    /** 最小长度 */
    minLength?: number | [number, string];
    /** 最大长度 */
    maxLength?: number | [number, string];
    /** 最小值 */
    min?: number | [number, string];
    /** 最大值 */
    max?: number | [number, string];
    /** 正则表达式 */
    pattern?: RegExp | [RegExp, string];
    /** 邮箱验证 */
    email?: boolean | string;
    /** URL 验证 */
    url?: boolean | string;
    /** 手机号验证 */
    phone?: boolean | string;
    /** 身份证验证 */
    idCard?: boolean | string;
}
/**
 * 验证规则配置
 */
export interface ValidationRule extends BuiltInRules {
    /** 自定义验证函数 */
    validator?: ValidatorFunction;
    /** 依赖的字段 */
    dependencies?: string[];
    /** 验证触发时机 */
    trigger?: 'change' | 'blur' | 'submit';
}
/**
 * 字段验证配置
 */
export interface FieldValidationConfig {
    /** 验证规则 */
    rules?: ValidationRule[];
    /** 是否立即验证 */
    immediate?: boolean;
    /** 防抖延迟（毫秒） */
    debounce?: number;
}
/**
 * 验证状态
 */
export interface ValidationState {
    /** 是否正在验证 */
    validating: boolean;
    /** 错误消息 */
    error: string;
    /** 是否已验证 */
    validated: boolean;
    /** 是否有效 */
    valid: boolean;
}
/**
 * 表单验证状态
 */
export interface FormValidationState {
    /** 字段验证状态 */
    fields: Record<string, ValidationState>;
    /** 是否正在验证 */
    validating: boolean;
    /** 是否有错误 */
    hasErrors: boolean;
    /** 是否全部有效 */
    isValid: boolean;
    /** 错误消息列表 */
    errors: string[];
}
/**
 * 表单验证 Hook
 *
 * @param formData - 表单数据（响应式对象）
 * @param config - 验证配置
 * @returns 验证状态和方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const formData = reactive({
 *       username: '',
 *       email: '',
 *       password: '',
 *       confirmPassword: ''
 *     })
 *
 *     const { state, validate, validateField, clearErrors } = useFormValidation(formData, {
 *       username: {
 *         rules: [
 *           { required: true },
 *           { minLength: 3, maxLength: 20 },
 *           { pattern: [/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'] }
 *         ],
 *         debounce: 300
 *       },
 *       email: {
 *         rules: [
 *           { required: true },
 *           { email: true }
 *         ]
 *       },
 *       password: {
 *         rules: [
 *           { required: true },
 *           { minLength: 6 }
 *         ]
 *       },
 *       confirmPassword: {
 *         rules: [
 *           { required: true },
 *           {
 *             validator: (value) => {
 *               if (value !== formData.password) {
 *                 return '两次密码输入不一致'
 *               }
 *               return true
 *             },
 *             dependencies: ['password']
 *           }
 *         ]
 *       }
 *     })
 *
 *     return {
 *       formData,
 *       state,
 *       validate,
 *       validateField,
 *       clearErrors
 *     }
 *   }
 * })
 * ```
 */
export declare function useFormValidation<T extends Record<string, any>>(formData: T, config: Record<keyof T, FieldValidationConfig>): {
    state: ComputedRef<FormValidationState>;
    validate: () => Promise<boolean>;
    validateField: (fieldName: keyof T) => Promise<boolean>;
    clearErrors: (fieldName?: keyof T) => void;
    setFieldError: (fieldName: keyof T, error: string) => void;
};
//# sourceMappingURL=useFormValidation.d.ts.map