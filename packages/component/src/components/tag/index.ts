/**
 * Tag 组件入口文件
 */

import type { App } from 'vue'
import Tag from './Tag.vue'
import type { TagProps, TagInstance } from './types'

// 为组件添加 install 方法，支持 Vue.use() 安装
const TagComponent = Tag as any
TagComponent.install = (app: App): void => {
  app.component(Tag.name || 'LTag', Tag)
}

// 导出组件
export default TagComponent

// 导出类型
export type { TagProps, TagInstance }
export * from './types'