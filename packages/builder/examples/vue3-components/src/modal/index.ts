/**
 * Modal 模态框组件模块 - Vue3 版本
 * 导出模态框组件和相关类型定义
 */

import Modal from './Modal.vue'
import type { App } from 'vue'

// 导出组件的 Props 和 Emits 类型
export type { ModalProps, ModalEmits } from './Modal.vue'

// 组件插槽定义
export interface ModalSlots {
  /** 默认插槽 - 模态框内容 */
  default?: () => any
  /** 头部插槽 */
  header?: () => any
  /** 底部插槽 */
  footer?: () => any
}

// 为组件添加 install 方法，支持 app.use() 安装
Modal.install = function(app: App) {
  app.component(Modal.name || 'LModal', Modal)
}

// 导出组件
export default Modal
export { Modal }

// 导出组件名称常量
export const MODAL_COMPONENT_NAME = 'LModal'

/**
 * 模态框组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 触发按钮 -->
 *     <l-button @click="showModal">打开模态框</l-button>
 *     
 *     <!-- 基础模态框 -->
 *     <l-modal
 *       v-model:visible="visible"
 *       title="基础模态框"
 *       @close="handleClose"
 *     >
 *       <p>这是模态框的内容。</p>
 *       <template #footer>
 *         <l-button @click="visible = false">取消</l-button>
 *         <l-button type="primary" @click="handleConfirm">确定</l-button>
 *       </template>
 *     </l-modal>
 *     
 *     <!-- 不同尺寸的模态框 -->
 *     <l-modal v-model:visible="smallVisible" title="小模态框" size="small">
 *       <p>小尺寸的模态框内容。</p>
 *     </l-modal>
 *     
 *     <l-modal v-model:visible="largeVisible" title="大模态框" size="large">
 *       <p>大尺寸的模态框内容。</p>
 *     </l-modal>
 *     
 *     <!-- 自定义宽度的模态框 -->
 *     <l-modal v-model:visible="customVisible" title="自定义宽度" width="800px">
 *       <p>自定义宽度的模态框内容。</p>
 *     </l-modal>
 *     
 *     <!-- 居中显示的模态框 -->
 *     <l-modal v-model:visible="centeredVisible" title="居中模态框" centered>
 *       <p>居中显示的模态框内容。</p>
 *     </l-modal>
 *     
 *     <!-- 全屏模态框 -->
 *     <l-modal v-model:visible="fullscreenVisible" title="全屏模态框" fullscreen>
 *       <p>全屏显示的模态框内容。</p>
 *     </l-modal>
 *     
 *     <!-- 自定义头部的模态框 -->
 *     <l-modal v-model:visible="customHeaderVisible">
 *       <template #header>
 *         <div style="display: flex; align-items: center;">
 *           <span style="font-weight: bold;">自定义头部</span>
 *           <span style="margin-left: auto; color: #999;">2023-12-25</span>
 *         </div>
 *       </template>
 *       <p>自定义头部的模态框内容。</p>
 *     </l-modal>
 *     
 *     <!-- 无内边距的模态框 -->
 *     <l-modal
 *       v-model:visible="noPaddingVisible"
 *       title="无内边距模态框"
 *       :body-padding="false"
 *     >
 *       <div style="background: #f5f5f5; padding: 20px;">
 *         自定义内边距的内容区域
 *       </div>
 *     </l-modal>
 *     
 *     <!-- 不可通过遮罩关闭的模态框 -->
 *     <l-modal
 *       v-model:visible="noMaskCloseVisible"
 *       title="不可遮罩关闭"
 *       :mask-closable="false"
 *     >
 *       <p>点击遮罩层无法关闭此模态框。</p>
 *       <template #footer>
 *         <l-button type="primary" @click="noMaskCloseVisible = false">
 *           确定
 *         </l-button>
 *       </template>
 *     </l-modal>
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { Modal } from '@ldesign/vue3-components-example/modal'
 * import { Button } from '@ldesign/vue3-components-example/button'
 * 
 * const visible = ref(false)
 * const smallVisible = ref(false)
 * const largeVisible = ref(false)
 * const customVisible = ref(false)
 * const centeredVisible = ref(false)
 * const fullscreenVisible = ref(false)
 * const customHeaderVisible = ref(false)
 * const noPaddingVisible = ref(false)
 * const noMaskCloseVisible = ref(false)
 * 
 * const showModal = () => {
 *   visible.value = true
 * }
 * 
 * const handleClose = () => {
 *    * }
 * 
 * const handleConfirm = () => {
 *    *   visible.value = false
 * }
 * </script>
 * ```
 * 
 * @example
 * ```typescript
 * // 在 Composition API 中使用
 * import { ref } from 'vue'
 * import { Modal } from '@ldesign/vue3-components-example/modal'
 * 
 * export default {
 *   components: {
 *     LModal: Modal
 *   },
 *   setup() {
 *     const visible = ref(false)
 *     const loading = ref(false)
 *     
 *     const handleAsyncAction = async () => {
 *       loading.value = true
 *       try {
 *         // 执行异步操作
 *         await someAsyncOperation()
 *         visible.value = false
 *       } finally {
 *         loading.value = false
 *       }
 *     }
 *     
 *     return {
 *       visible,
 *       loading,
 *       handleAsyncAction
 *     }
 *   }
 * }
 * ```
 */
