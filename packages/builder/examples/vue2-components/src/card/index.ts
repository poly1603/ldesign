/**
 * Card 卡片组件模块
 * 导出卡片组件和相关类型定义
 */

import Card from './Card.vue'
// import { VueConstructor } from 'vue'

// 注意：Vue2 环境下类型定义通过组件本身提供

// 为组件添加 install 方法，支持 Vue.use() 安装
Card.install = function (Vue) {
  Vue.component(Card.name || 'LCard', Card)
}

// 导出组件
export default Card
export { Card }

// 导出组件名称常量
export const CARD_COMPONENT_NAME = 'LCard'

/**
 * 卡片组件使用示例
 * 
 * @example
 * ```vue
 * <template>
 *   <div>
 *     <!-- 基础卡片 -->
 *     <l-card title="基础卡片">
 *       <p>这是卡片的内容区域。</p>
 *     </l-card>
 *     
 *     <!-- 不同尺寸的卡片 -->
 *     <l-card title="小卡片" size="small">
 *       <p>小尺寸的卡片内容。</p>
 *     </l-card>
 *     
 *     <l-card title="中卡片" size="medium">
 *       <p>中尺寸的卡片内容。</p>
 *     </l-card>
 *     
 *     <l-card title="大卡片" size="large">
 *       <p>大尺寸的卡片内容。</p>
 *     </l-card>
 *     
 *     <!-- 带封面的卡片 -->
 *     <l-card title="带封面的卡片">
 *       <template #cover>
 *         <img src="https://via.placeholder.com/300x200" alt="封面图片" />
 *       </template>
 *       <p>这是带封面的卡片内容。</p>
 *     </l-card>
 *     
 *     <!-- 自定义头部的卡片 -->
 *     <l-card>
 *       <template #header>
 *         <div style="display: flex; align-items: center;">
 *           <span style="font-weight: bold;">自定义头部</span>
 *           <span style="margin-left: auto; color: #999;">2023-12-25</span>
 *         </div>
 *       </template>
 *       <p>这是自定义头部的卡片内容。</p>
 *     </l-card>
 *     
 *     <!-- 带额外内容的卡片 -->
 *     <l-card title="带操作的卡片">
 *       <template #extra>
 *         <button>编辑</button>
 *         <button>删除</button>
 *       </template>
 *       <p>这是带操作按钮的卡片内容。</p>
 *     </l-card>
 *     
 *     <!-- 带底部的卡片 -->
 *     <l-card title="带底部的卡片">
 *       <p>这是卡片的主要内容。</p>
 *       <template #footer>
 *         <div style="text-align: right;">
 *           <button>取消</button>
 *           <button>确定</button>
 *         </div>
 *       </template>
 *     </l-card>
 *     
 *     <!-- 不同阴影效果的卡片 -->
 *     <l-card title="始终显示阴影" shadow="always">
 *       <p>这个卡片始终显示阴影。</p>
 *     </l-card>
 *     
 *     <l-card title="悬停显示阴影" shadow="hover">
 *       <p>这个卡片悬停时显示阴影。</p>
 *     </l-card>
 *     
 *     <l-card title="无阴影" shadow="never">
 *       <p>这个卡片没有阴影。</p>
 *     </l-card>
 *     
 *     <!-- 可悬停的卡片 -->
 *     <l-card title="可悬停的卡片" hoverable>
 *       <p>悬停时会有上浮效果。</p>
 *     </l-card>
 *     
 *     <!-- 无边框的卡片 -->
 *     <l-card title="无边框卡片" :bordered="false">
 *       <p>这个卡片没有边框。</p>
 *     </l-card>
 *     
 *     <!-- 无内边距的卡片 -->
 *     <l-card title="无内边距卡片" :body-padding="false">
 *       <div style="background: #f5f5f5; padding: 20px;">
 *         自定义内边距的内容区域
 *       </div>
 *     </l-card>
 *     
 *     <!-- 加载状态的卡片 -->
 *     <l-card title="加载中的卡片" loading>
 *       <p>这个卡片正在加载中。</p>
 *     </l-card>
 *   </div>
 * </template>
 * 
 * <script>
 * import { Card } from '@ldesign/vue2-components-example/card'
 * 
 * export default {
 *   components: {
 *     LCard: Card
 *   }
 * }
 * </script>
 * ```
 */
