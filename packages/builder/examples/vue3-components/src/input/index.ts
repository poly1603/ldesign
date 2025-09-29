/**
 * Input 输入框组件模块 - Vue3 版本
 * 导出输入框组件和相关类型定义
 */

import Input from './Input.vue'
import type { App } from 'vue'

// 导出组件的 Props 和 Emits 类型
export type { InputProps, InputEmits } from './Input.vue'

// 组件插槽定义
export interface InputSlots {
  /** 前缀插槽 */
  prefix?: () => any
  /** 后缀插槽 */
  suffix?: () => any
}

// 组件实例方法定义
export interface InputInstance {
  /** 聚焦到输入框 */
  focus: () => void
  /** 失去焦点 */
  blur: () => void
  /** 选中输入框内容 */
  select: () => void
}

// 为组件添加 install 方法，支持 app.use() 安装
Input.install = function(app: App) {
  app.component(Input.name || 'LInput', Input)
}

// 导出组件
export default Input
export { Input }

// 导出组件名称常量
export const INPUT_COMPONENT_NAME = 'LInput'

/**
 * 输入框组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 基础输入框 -->
 *     <l-input v-model="value" placeholder="请输入内容" />
 *     
 *     <!-- 带标签的输入框 -->
 *     <l-input
 *       v-model="username"
 *       label="用户名"
 *       placeholder="请输入用户名"
 *       required
 *     />
 *     
 *     <!-- 不同尺寸的输入框 -->
 *     <l-input v-model="value" size="small" placeholder="小尺寸" />
 *     <l-input v-model="value" size="medium" placeholder="中尺寸" />
 *     <l-input v-model="value" size="large" placeholder="大尺寸" />
 *     
 *     <!-- 带图标的输入框 -->
 *     <l-input
 *       v-model="search"
 *       prefix-icon="🔍"
 *       placeholder="搜索"
 *       clearable
 *     />
 *     
 *     <!-- 密码输入框 -->
 *     <l-input
 *       v-model="password"
 *       type="password"
 *       label="密码"
 *       placeholder="请输入密码"
 *       show-word-count
 *       :maxlength="20"
 *     />
 *     
 *     <!-- 数字输入框 -->
 *     <l-input
 *       v-model="number"
 *       type="number"
 *       label="数量"
 *       :min="1"
 *       :max="100"
 *       :step="1"
 *     />
 *     
 *     <!-- 带验证的输入框 -->
 *     <l-input
 *       v-model="email"
 *       type="email"
 *       label="邮箱"
 *       placeholder="请输入邮箱地址"
 *       :error-message="emailError"
 *       help-text="请输入有效的邮箱地址"
 *     />
 *     
 *     <!-- 禁用和只读状态 -->
 *     <l-input v-model="value" disabled placeholder="禁用状态" />
 *     <l-input v-model="value" readonly placeholder="只读状态" />
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * import { ref, watch } from 'vue'
 * import { Input } from '@ldesign/vue3-components-example/input'
 * 
 * const value = ref('')
 * const username = ref('')
 * const search = ref('')
 * const password = ref('')
 * const number = ref(1)
 * const email = ref('')
 * const emailError = ref('')
 * 
 * // 邮箱验证
 * watch(email, (newValue) => {
 *   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *   emailError.value = newValue && !emailRegex.test(newValue) ? '请输入有效的邮箱地址' : ''
 * })
 * </script>
 * ```
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 使用 ref 获取组件实例 -->
 *     <l-input
 *       ref="inputRef"
 *       v-model="value"
 *       placeholder="点击按钮聚焦"
 *     />
 *     <l-button @click="focusInput">聚焦输入框</l-button>
 *   </div>
 * </template>
 * 
 * <script setup lang="ts">
 * import { ref } from 'vue'
 * import { Input, type InputInstance } from '@ldesign/vue3-components-example/input'
 * import { Button } from '@ldesign/vue3-components-example/button'
 * 
 * const value = ref('')
 * const inputRef = ref<InputInstance>()
 * 
 * const focusInput = () => {
 *   inputRef.value?.focus()
 * }
 * </script>
 * ```
 */
