import * as vue from 'vue';
import { Ref } from 'vue';

/**
 * 模态框配置
 */
interface ModalConfig {
    /** 是否可以通过 ESC 键关闭 */
    closeOnEsc?: boolean;
    /** 是否可以通过点击遮罩关闭 */
    closeOnOverlay?: boolean;
    /** 是否锁定页面滚动 */
    lockScroll?: boolean;
    /** 是否自动聚焦 */
    autoFocus?: boolean;
    /** 是否在关闭时恢复焦点 */
    restoreFocus?: boolean;
    /** 模态框层级 */
    zIndex?: number;
    /** 动画持续时间（毫秒） */
    animationDuration?: number;
}
/**
 * 模态框状态
 */
interface ModalState {
    /** 是否可见 */
    visible: boolean;
    /** 是否正在打开 */
    opening: boolean;
    /** 是否正在关闭 */
    closing: boolean;
    /** 是否已完全打开 */
    opened: boolean;
    /** 模态框层级 */
    zIndex: number;
}
/**
 * 模态框操作方法
 */
interface ModalActions {
    /** 打开模态框 */
    open: () => Promise<void>;
    /** 关闭模态框 */
    close: () => Promise<void>;
    /** 切换模态框状态 */
    toggle: () => Promise<void>;
}
/**
 * 模态框 Hook
 *
 * @param config - 模态框配置
 * @returns 模态框状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const { state, actions } = useModal({
 *       closeOnEsc: true,
 *       closeOnOverlay: true,
 *       lockScroll: true,
 *       autoFocus: true,
 *       restoreFocus: true
 *     })
 *
 *     const handleOpenModal = () => {
 *       actions.open()
 *     }
 *
 *     const handleCloseModal = () => {
 *       actions.close()
 *     }
 *
 *     return {
 *       state,
 *       actions,
 *       handleOpenModal,
 *       handleCloseModal
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <button @click="actions.open()">打开模态框</button>
 *
 *     <Teleport to="body">
 *       <div
 *         v-if="state.visible"
 *         class="modal-overlay"
 *         :style="{ zIndex: state.zIndex }"
 *         @click="handleOverlayClick"
 *       >
 *         <div
 *           class="modal-content"
 *           :class="{
 *             'modal-opening': state.opening,
 *             'modal-closing': state.closing
 *           }"
 *           @click.stop
 *         >
 *           <h2>模态框标题</h2>
 *           <p>模态框内容</p>
 *           <button @click="actions.close()">关闭</button>
 *         </div>
 *       </div>
 *     </Teleport>
 *   </div>
 * </template>
 * ```
 */
declare function useModal(config?: ModalConfig): {
    state: Ref<ModalState>;
    actions: ModalActions;
};
/**
 * 模态框管理器 Hook
 *
 * @description
 * 用于管理多个模态框的全局状态
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const {
 *       modals,
 *       openModal,
 *       closeModal,
 *       closeAll,
 *       getTopModal
 *     } = useModalManager()
 *
 *     const openConfirmDialog = () => {
 *       openModal('confirm', {
 *         title: '确认删除',
 *         content: '确定要删除这个项目吗？'
 *       })
 *     }
 *
 *     return {
 *       modals,
 *       openConfirmDialog,
 *       closeModal,
 *       closeAll
 *     }
 *   }
 * })
 * ```
 */
declare function useModalManager(): {
    modals: Ref<Record<string, any>, Record<string, any>>;
    openModal: (id: string, props?: any) => void;
    closeModal: (id: string) => void;
    closeAll: () => void;
    getTopModal: () => any;
    hasOpenModals: vue.ComputedRef<boolean>;
};

export { useModal, useModalManager };
export type { ModalActions, ModalConfig, ModalState };
