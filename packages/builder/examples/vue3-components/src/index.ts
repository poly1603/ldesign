/**
 * @ldesign/vue3-components-example
 * 
 * Vue3 组件库示例
 * 展示如何使用 @ldesign/builder 打包 Vue3 组件库
 * 使用 Composition API 和现代 Vue3 特性
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { App } from 'vue'

// 导入组件
import Button from './button'
import Input from './input'
import Modal from './modal'

// 导入样式
import './styles/variables.less'

// 组件列表
const components = [
  Button,
  Input,
  Modal
]

/**
 * 组件库版本信息
 */
export const VERSION = '1.0.0'

/**
 * 组件库信息
 */
export const LIBRARY_INFO = {
  name: '@ldesign/vue3-components-example',
  version: VERSION,
  description: 'Vue3 组件库示例 - 展示如何使用 @ldesign/builder 打包 Vue3 组件库',
  author: 'LDesign Team',
  license: 'MIT',
  repository: 'https://github.com/ldesign/ldesign',
  homepage: 'https://ldesign.dev'
} as const

/**
 * 安装函数 - 支持 app.use() 全局安装
 * @param app Vue 应用实例
 * @param options 安装选项
 */
function install(app: App, options: any = {}) {
  // 避免重复安装
  if ((install as any).installed) {
    return
  }
  (install as any).installed = true

  // 注册所有组件
  components.forEach(component => {
    if (component.install) {
      component.install(app)
    } else if (component.name) {
      app.component(component.name, component)
    }
  })

  // 在全局属性上添加库信息（可选）
  if (options.addLibraryInfo !== false) {
    app.config.globalProperties.$LDESIGN_VUE3_COMPONENTS = LIBRARY_INFO
  }
}

// 导出单个组件
export {
  Button,
  Input,
  Modal
}

// 导出组件名称常量
export { BUTTON_COMPONENT_NAME } from './button'
export { INPUT_COMPONENT_NAME } from './input'
export { MODAL_COMPONENT_NAME } from './modal'

// 导出类型定义
export type {
  ButtonProps,
  ButtonEmits
} from './button'

export type {
  InputProps,
  InputEmits,
  InputInstance
} from './input'

export type {
  ModalProps,
  ModalEmits
} from './modal'

/**
 * 获取库信息
 * @returns 库信息对象
 * @example
 * ```typescript
 * import { getLibraryInfo } from '@ldesign/vue3-components-example'
 * 
 * const info = getLibraryInfo()
 *  // '@ldesign/vue3-components-example'
 * ```
 */
export function getLibraryInfo() {
  return LIBRARY_INFO
}

/**
 * 打印库信息到控制台
 * @example
 * ```typescript
 * import { printLibraryInfo } from '@ldesign/vue3-components-example'
 * 
 * printLibraryInfo()
 * // 输出库的详细信息
 * ```
 */
export function printLibraryInfo(): void {
  } │
│ Version:     ${LIBRARY_INFO.version.padEnd(43)} │
│ Description: ${LIBRARY_INFO.description.slice(0, 43).padEnd(43)} │
│ Author:      ${LIBRARY_INFO.author.padEnd(43)} │
│ License:     ${LIBRARY_INFO.license.padEnd(43)} │
╰─────────────────────────────────────────────────────────────╯
  `)
}

// 默认导出：包含 install 方法的对象
export default {
  install,
  VERSION,
  LIBRARY_INFO,
  getLibraryInfo,
  printLibraryInfo,

  // 组件
  Button,
  Input,
  Modal
}

/**
 * 组件库使用示例
 * 
 * @example
 * ```typescript
 * // 方式1：全局安装
 * import { createApp } from 'vue'
 * import Vue3Components from '@ldesign/vue3-components-example'
 * 
 * const app = createApp(App)
 * app.use(Vue3Components)
 * 
 * // 方式2：按需引入
 * import { Button, Input, Modal } from '@ldesign/vue3-components-example'
 * 
 * export default {
 *   components: {
 *     LButton: Button,
 *     LInput: Input,
 *     LModal: Modal
 *   }
 * }
 * 
 * // 方式3：单个组件安装
 * import { Button } from '@ldesign/vue3-components-example'
 * 
 * app.use(Button)
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 触发模态框的按钮 -->
 *     <l-button @click="showModal">打开登录框</l-button>
 *     
 *     <!-- 登录模态框 -->
 *     <l-modal
 *       v-model:visible="visible"
 *       title="用户登录"
 *       width="400px"
 *       centered
 *     >
 *       <l-input
 *         v-model="username"
 *         label="用户名"
 *         placeholder="请输入用户名"
 *         prefix-icon="👤"
 *       />
 *       <l-input
 *         v-model="password"
 *         type="password"
 *         label="密码"
 *         placeholder="请输入密码"
 *         prefix-icon="🔒"
 *         style="margin-top: 16px;"
 *       />
 *       
 *       <template #footer>
 *         <l-button @click="visible = false">取消</l-button>
 *         <l-button type="primary" :loading="loading" @click="handleLogin">
 *           登录
 *         </l-button>
 *       </template>
 *     </l-modal>
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * 
 * const visible = ref(false)
 * const loading = ref(false)
 * const username = ref('')
 * const password = ref('')
 * 
 * const showModal = () => {
 *   visible.value = true
 * }
 * 
 * const handleLogin = async () => {
 *   loading.value = true
 *   try {
 *     // 模拟登录请求
 *     await new Promise(resolve => setTimeout(resolve, 2000))
 *      *     visible.value = false
 *   } finally {
 *     loading.value = false
 *   }
 * }
 * </script>
 * ```
 */
