/**
 * Button 按钮组件模块
 * 导出按钮组件和相关类型定义
 */

import Button from './Button.vue'
// import { VueConstructor } from 'vue'

// 注意：Vue2 环境下类型定义通过组件本身提供

// 为组件添加 install 方法，支持 Vue.use() 安装
Button.install = function (Vue) {
  Vue.component(Button.name || 'LButton', Button)
}

// 导出组件
export default Button
export { Button }

// 导出组件名称常量
export const BUTTON_COMPONENT_NAME = 'LButton'

/**
 * 按钮组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 基础按钮 -->
 *     <l-button @click="handleClick">默认按钮</l-button>
 *     
 *     <!-- 不同类型的按钮 -->
 *     <l-button type="primary">主要按钮</l-button>
 *     <l-button type="secondary">次要按钮</l-button>
 *     <l-button type="success">成功按钮</l-button>
 *     <l-button type="warning">警告按钮</l-button>
 *     <l-button type="error">错误按钮</l-button>
 *     <l-button type="text">文本按钮</l-button>
 *     
 *     <!-- 不同尺寸的按钮 -->
 *     <l-button size="small">小按钮</l-button>
 *     <l-button size="medium">中按钮</l-button>
 *     <l-button size="large">大按钮</l-button>
 *     
 *     <!-- 带图标的按钮 -->
 *     <l-button icon="🔍">搜索</l-button>
 *     <l-button icon="📁" icon-position="right">文件夹</l-button>
 *     
 *     <!-- 特殊状态的按钮 -->
 *     <l-button disabled>禁用按钮</l-button>
 *     <l-button loading>加载中</l-button>
 *     <l-button block>块级按钮</l-button>
 *     <l-button round>圆形按钮</l-button>
 *     <l-button circle icon="❤️"></l-button>
 *   </div>
 * </template>
 * 
 * <script>
 * import { Button } from '@ldesign/vue2-components-example/button'
 * 
 * export default {
 *   components: {
 *     LButton: Button
 *   },
 *   methods: {
 *     handleClick(event) {
 *        *     }
 *   }
 * }
 * </script>
 * ```
 */
