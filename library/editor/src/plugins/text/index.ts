/**
 * Text-related plugins export
 */

export * from './blockquote'
export * from './heading'
export * from './list'
export * from './link'

// 确保插件被正确导出
import { HeadingPlugin } from './heading'
import { BlockquotePlugin } from './blockquote'
import { BulletListPlugin, OrderedListPlugin, TaskListPlugin } from './list'
import { LinkPlugin } from './link'

// Export all text plugins as array
export const textPlugins = [
  HeadingPlugin,
  BlockquotePlugin, 
  BulletListPlugin,
  OrderedListPlugin,
  TaskListPlugin,
  LinkPlugin
]
