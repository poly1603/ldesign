import * as vue from 'vue';

/**
 * 剪贴板操作 Hook
 *
 * @description
 * 提供剪贴板读写功能，支持文本、图片等多种格式，
 * 兼容现代浏览器的 Clipboard API 和传统的 execCommand 方法。
 */
/**
 * 剪贴板状态
 */
interface ClipboardState {
    /** 是否支持剪贴板 API */
    isSupported: boolean;
    /** 剪贴板内容 */
    text: string;
    /** 是否正在复制 */
    copying: boolean;
    /** 是否正在读取 */
    reading: boolean;
    /** 最后一次操作是否成功 */
    lastSuccess: boolean;
    /** 最后一次错误信息 */
    lastError: string;
}
/**
 * 剪贴板配置
 */
interface ClipboardConfig {
    /** 是否在复制成功后显示提示 */
    showSuccessMessage?: boolean;
    /** 成功提示消息 */
    successMessage?: string;
    /** 是否在复制失败后显示错误 */
    showErrorMessage?: boolean;
    /** 错误提示消息 */
    errorMessage?: string;
    /** 复制成功后的回调 */
    onSuccess?: (text: string) => void;
    /** 复制失败后的回调 */
    onError?: (error: Error) => void;
}
/**
 * 剪贴板 Hook
 *
 * @param config - 配置选项
 * @returns 剪贴板状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, copy, read, copyToClipboard } = useClipboard({
 *       showSuccessMessage: true,
 *       successMessage: '复制成功！',
 *       onSuccess: (text) => {
 *         console.log('复制的内容:', text)
 *       }
 *     })
 *
 *     const textToCopy = ref('Hello, World!')
 *
 *     const handleCopy = async () => {
 *       await copy(textToCopy.value)
 *     }
 *
 *     const handleRead = async () => {
 *       const text = await read()
 *       console.log('剪贴板内容:', text)
 *     }
 *
 *     return {
 *       state,
 *       textToCopy,
 *       handleCopy,
 *       handleRead,
 *       copyToClipboard
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <input v-model="textToCopy" placeholder="输入要复制的文本" />
 *     <button
 *       @click="copy(textToCopy)"
 *       :disabled="state.copying"
 *     >
 *       {{ state.copying ? '复制中...' : '复制' }}
 *     </button>
 *
 *     <button
 *       @click="read()"
 *       :disabled="state.reading || !state.isSupported"
 *     >
 *       {{ state.reading ? '读取中...' : '读取剪贴板' }}
 *     </button>
 *
 *     <p v-if="state.text">剪贴板内容: {{ state.text }}</p>
 *     <p v-if="state.lastError" class="error">{{ state.lastError }}</p>
 *   </div>
 * </template>
 * ```
 */
declare function useClipboard(config?: ClipboardConfig): {
    state: vue.ComputedRef<ClipboardState>;
    copy: (textToCopy: string) => Promise<boolean>;
    read: () => Promise<string>;
    copyElementText: (element: HTMLElement) => Promise<boolean>;
    copyInputValue: (input: HTMLInputElement | HTMLTextAreaElement) => Promise<boolean>;
    copySelection: () => Promise<boolean>;
};
/**
 * 简化的复制函数
 *
 * @param text - 要复制的文本
 * @param config - 配置选项
 * @returns 是否复制成功
 *
 * @example
 * ```typescript
 * // 简单复制
 * const success = await copyToClipboard('Hello, World!')
 *
 * // 带配置的复制
 * const success = await copyToClipboard('Hello, World!', {
 *   onSuccess: () => console.log('复制成功'),
 *   onError: (error) => console.error('复制失败', error)
 * })
 * ```
 */
declare const copyToClipboard: (text: string, config?: ClipboardConfig) => Promise<boolean>;
/**
 * 读取剪贴板内容
 *
 * @returns 剪贴板文本内容
 *
 * @example
 * ```typescript
 * const clipboardText = await readFromClipboard()
 * console.log('剪贴板内容:', clipboardText)
 * ```
 */
declare const readFromClipboard: () => Promise<string>;
/**
 * 检查剪贴板支持性
 *
 * @returns 支持性信息
 *
 * @example
 * ```typescript
 * const support = checkClipboardSupport()
 * console.log('是否支持复制:', support.copy)
 * console.log('是否支持读取:', support.read)
 * ```
 */
declare const checkClipboardSupport: () => {
    copy: boolean;
    read: boolean;
    legacy: boolean;
};
/**
 * 创建复制按钮指令
 *
 * @description
 * 用于 Vue 指令，可以直接在模板中使用
 *
 * @example
 * ```vue
 * <template>
 *   <button v-copy="'要复制的文本'">复制</button>
 *   <button v-copy="{ text: '文本', success: '复制成功!' }">复制</button>
 * </template>
 * ```
 */
declare const vCopy: {
    mounted(el: HTMLElement, binding: any): void;
    updated(el: HTMLElement, binding: any): void;
    unmounted(el: HTMLElement): void;
};
declare global {
    interface HTMLElement {
        _copyHandler?: () => void;
    }
}

export { checkClipboardSupport, copyToClipboard, readFromClipboard, useClipboard, vCopy };
export type { ClipboardConfig, ClipboardState };
