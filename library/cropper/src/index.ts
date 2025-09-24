/**
 * @ldesign/cropper - 图片裁剪器
 * 一个强大的、框架无关的图片裁剪库，支持 Vue 3、React、Angular
 */

// 导出主要的 Cropper 类
export { default as Cropper } from './cropper';
export type { CropperOptions } from './cropper';

// 导出默认模板
export { default as DEFAULT_TEMPLATE } from './template';

// 导出所有工具函数和常量
export * from './utils';

// 导出所有元素组件
export * from './elements';

// 导出选择区域接口
export type { Selection } from './elements/cropper-selection';

// 默认导出 Cropper 类
export { default } from './cropper';
