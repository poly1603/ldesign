import * as vue from 'vue';
import { Ref } from 'vue';

/**
 * 消息类型
 */
type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
/**
 * 消息位置
 */
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'center';
/**
 * 消息配置
 */
interface ToastConfig {
    /** 消息类型 */
    type?: ToastType;
    /** 消息标题 */
    title?: string;
    /** 消息内容 */
    message: string;
    /** 持续时间（毫秒），0 表示不自动关闭 */
    duration?: number;
    /** 是否可关闭 */
    closable?: boolean;
    /** 是否显示图标 */
    showIcon?: boolean;
    /** 自定义图标 */
    icon?: string;
    /** 位置 */
    position?: ToastPosition;
    /** 自定义类名 */
    className?: string;
    /** 点击回调 */
    onClick?: () => void;
    /** 关闭回调 */
    onClose?: () => void;
}
/**
 * 消息项
 */
interface ToastItem extends Required<Omit<ToastConfig, 'onClick' | 'onClose'>> {
    /** 唯一 ID */
    id: string;
    /** 创建时间 */
    createdAt: number;
    /** 是否可见 */
    visible: boolean;
    /** 是否正在关闭 */
    closing: boolean;
    /** 点击回调 */
    onClick?: () => void;
    /** 关闭回调 */
    onClose?: () => void;
}
/**
 * 全局配置
 */
interface ToastGlobalConfig {
    /** 默认持续时间 */
    defaultDuration?: number;
    /** 默认位置 */
    defaultPosition?: ToastPosition;
    /** 最大显示数量 */
    maxCount?: number;
    /** 是否显示图标 */
    showIcon?: boolean;
    /** 动画持续时间 */
    animationDuration?: number;
}
/**
 * 消息提示 Hook
 *
 * @returns 消息状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const {
 *       toasts,
 *       show,
 *       success,
 *       error,
 *       warning,
 *       info,
 *       loading,
 *       close,
 *       clear,
 *       config
 *     } = useToast()
 *
 *     const handleSuccess = () => {
 *       success('操作成功！')
 *     }
 *
 *     const handleError = () => {
 *       error('操作失败，请重试')
 *     }
 *
 *     const handleCustom = () => {
 *       show({
 *         type: 'info',
 *         title: '自定义消息',
 *         message: '这是一个自定义消息',
 *         duration: 5000,
 *         position: 'bottom-center'
 *       })
 *     }
 *
 *     return {
 *       toasts,
 *       handleSuccess,
 *       handleError,
 *       handleCustom
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="success('成功消息')">成功</button>
 *     <button @click="error('错误消息')">错误</button>
 *     <button @click="warning('警告消息')">警告</button>
 *
 *     <!-- 消息容器 -->
 *     <Teleport to="body">
 *       <div
 *         v-for="position in positions"
 *         :key="position"
 *         :class="`toast-container toast-${position}`"
 *       >
 *         <TransitionGroup name="toast" tag="div">
 *           <div
 *             v-for="toast in getToastsByPosition(position)"
 *             :key="toast.id"
 *             :class="[
 *               'toast-item',
 *               `toast-${toast.type}`,
 *               toast.className
 *             ]"
 *             @click="toast.onClick?.()"
 *           >
 *             <div v-if="toast.showIcon" class="toast-icon">
 *               {{ toast.icon }}
 *             </div>
 *             <div class="toast-content">
 *               <div v-if="toast.title" class="toast-title">
 *                 {{ toast.title }}
 *               </div>
 *               <div class="toast-message">
 *                 {{ toast.message }}
 *               </div>
 *             </div>
 *             <button
 *               v-if="toast.closable"
 *               class="toast-close"
 *               @click.stop="close(toast.id)"
 *             >
 *               ×
 *             </button>
 *           </div>
 *         </TransitionGroup>
 *       </div>
 *     </Teleport>
 *   </div>
 * </template>
 * ```
 */
declare function useToast(): {
    toasts: Ref<ToastItem[]>;
    positions: vue.ComputedRef<ToastPosition[]>;
    show: (config: ToastConfig) => string;
    success: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    error: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    warning: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    info: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    loading: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    close: (id: string) => void;
    clear: () => void;
    config: (newConfig: Partial<ToastGlobalConfig>) => void;
    getToastsByPosition: (position: ToastPosition) => {
        id: string;
        createdAt: number;
        visible: boolean;
        closing: boolean;
        onClick?: (() => void) | undefined;
        onClose?: (() => void) | undefined;
        type: ToastType;
        title: string;
        message: string;
        duration: number;
        closable: boolean;
        showIcon: boolean;
        icon: string;
        position: ToastPosition;
        className: string;
    }[];
    hasType: (type: ToastType) => boolean;
    getCountByType: (type: ToastType) => number;
};
/**
 * 简化的消息提示函数
 *
 * @description
 * 提供全局的消息提示函数，可以在任何地方调用
 */
declare const toast: {
    show: (config: ToastConfig) => string;
    success: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    error: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    warning: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    info: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    loading: (message: string, config?: Omit<ToastConfig, "message" | "type">) => string;
    close: (id: string) => void;
    clear: () => void;
};

export { toast, useToast };
export type { ToastConfig, ToastGlobalConfig, ToastItem, ToastPosition, ToastType };
