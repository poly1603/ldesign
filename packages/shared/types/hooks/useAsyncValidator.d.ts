import { Ref, ComputedRef } from 'vue';

/**
 * 异步验证器 Hook
 *
 * @description
 * 提供异步验证功能，支持远程验证、防抖、取消请求等功能。
 * 适用于用户名唯一性检查、邮箱验证等需要服务器验证的场景。
 */

/**
 * 异步验证函数类型
 */
type AsyncValidatorFunction<T = any> = (value: T, signal?: AbortSignal) => Promise<string | true>;
/**
 * 异步验证配置
 */
interface AsyncValidatorConfig<T = any> {
    /** 验证函数 */
    validator: AsyncValidatorFunction<T>;
    /** 防抖延迟（毫秒），默认 300 */
    debounce?: number;
    /** 是否立即验证 */
    immediate?: boolean;
    /** 验证前的预检查函数 */
    preCheck?: (value: T) => boolean;
    /** 成功消息 */
    successMessage?: string;
}
/**
 * 异步验证状态
 */
interface AsyncValidationState {
    /** 是否正在验证 */
    validating: boolean;
    /** 错误消息 */
    error: string;
    /** 成功消息 */
    success: string;
    /** 是否已验证 */
    validated: boolean;
    /** 是否有效 */
    valid: boolean;
    /** 最后验证的值 */
    lastValidatedValue: any;
}
/**
 * 异步验证器 Hook
 *
 * @param value - 要验证的响应式值
 * @param config - 验证配置
 * @returns 验证状态和方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const username = ref('')
 *
 *     // 用户名唯一性验证
 *     const usernameValidation = useAsyncValidator(username, {
 *       validator: async (value, signal) => {
 *         if (!value) return true
 *
 *         try {
 *           const response = await fetch(`/api/check-username?username=${value}`, {
 *             signal
 *           })
 *           const result = await response.json()
 *
 *           if (!result.available) {
 *             return '用户名已被占用'
 *           }
 *
 *           return true
 *         } catch (error) {
 *           if (error.name === 'AbortError') {
 *             throw error // 重新抛出取消错误
 *           }
 *           return '验证失败，请重试'
 *         }
 *       },
 *       debounce: 500,
 *       preCheck: (value) => value.length >= 3,
 *       successMessage: '用户名可用'
 *     })
 *
 *     const email = ref('')
 *
 *     // 邮箱验证
 *     const emailValidation = useAsyncValidator(email, {
 *       validator: async (value) => {
 *         if (!value) return true
 *
 *         const response = await fetch('/api/validate-email', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify({ email: value })
 *         })
 *
 *         const result = await response.json()
 *         return result.valid ? true : result.message
 *       },
 *       debounce: 300
 *     })
 *
 *     return {
 *       username,
 *       usernameValidation,
 *       email,
 *       emailValidation
 *     }
 *   }
 * })
 * ```
 */
declare function useAsyncValidator<T>(value: Ref<T>, config: AsyncValidatorConfig<T>): {
    state: ComputedRef<AsyncValidationState>;
    trigger: () => Promise<boolean>;
    clear: () => void;
    reset: () => void;
};
/**
 * 多字段异步验证器 Hook
 *
 * @param validators - 验证器配置对象
 * @returns 验证状态和方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const formData = reactive({
 *       username: '',
 *       email: ''
 *     })
 *
 *     const { states, triggerAll, clearAll } = useMultiAsyncValidator({
 *       username: {
 *         value: () => formData.username,
 *         validator: async (value) => {
 *           // 验证用户名
 *           return true
 *         }
 *       },
 *       email: {
 *         value: () => formData.email,
 *         validator: async (value) => {
 *           // 验证邮箱
 *           return true
 *         }
 *       }
 *     })
 *
 *     return {
 *       formData,
 *       states,
 *       triggerAll,
 *       clearAll
 *     }
 *   }
 * })
 * ```
 */
declare function useMultiAsyncValidator<T extends Record<string, any>>(validators: {
    [K in keyof T]: {
        value: () => T[K];
        validator: AsyncValidatorFunction<T[K]>;
        debounce?: number;
        immediate?: boolean;
        preCheck?: (value: T[K]) => boolean;
        successMessage?: string;
    };
}): {
    states: ComputedRef<{ [K in keyof T]: AsyncValidationState; }>;
    overallState: ComputedRef<{
        validating: boolean;
        hasErrors: boolean;
        allValid: boolean;
        allValidated: boolean;
    }>;
    triggerAll: () => Promise<boolean>;
    clearAll: () => void;
    resetAll: () => void;
    validators: { [K_1 in keyof T]: {
        state: ComputedRef<AsyncValidationState>;
        trigger: () => Promise<boolean>;
        clear: () => void;
        reset: () => void;
    }; };
};

export { useAsyncValidator, useMultiAsyncValidator };
export type { AsyncValidationState, AsyncValidatorConfig, AsyncValidatorFunction };
