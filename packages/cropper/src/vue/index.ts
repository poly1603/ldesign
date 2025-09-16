/**
 * @ldesign/cropper - Vue 3 集成入口
 * 
 * 导出 Vue 3 相关的所有功能
 */

import type { App } from 'vue'
import ImageCropper from './ImageCropper.vue'
import { vCropper, install as directiveInstall } from './directive'

// 导出组件
export { default as ImageCropper } from './ImageCropper.vue'

// 导出 Hook
export { useCropper } from './useCropper'
export type { UseCropperOptions, UseCropperReturn } from './useCropper'

// 导出指令
export { vCropper, getCropperInstance } from './directive'
export type { CropperDirectiveValue } from './directive'

/**
 * Vue 插件安装函数
 */
export const install = (app: App) => {
  // 注册组件
  app.component('ImageCropper', ImageCropper)
  
  // 注册指令
  directiveInstall(app)
}

/**
 * 默认导出插件对象
 */
export default {
  install,
  ImageCropper,
  vCropper
}
