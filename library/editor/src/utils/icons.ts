/**
 * 图标工具函数
 * 
 * NOTE: 此文件重新导出 ui/icons 的功能
 * ui/icons/ 是新版图标系统，已按类别组织
 * 
 * 保留此文件是为了向后兼容
 */

export { icons, getIconHTML, createIcon } from '../ui/icons'
export type { IconName } from '../ui/icons'

// 向后兼容：导出 Lucide 图标函数
export { getLucideIcon } from '../ui/icons/lucide'
