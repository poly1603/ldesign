/**
 * 混合类型库示例
 * 
 * 展示如何使用 @ldesign/builder 构建包含多种文件类型的库
 * 包含 TypeScript 工具函数、组件类和样式文件
 */

// 导入工具函数
import {
  stringUtils,
  numberUtils,
  dateUtils,
  validationUtils,
  storageUtils
} from './utils'

// 导入组件
import {
  BaseComponent,
  Toast,
  Modal,
  Loading
} from './components'

// 重新导出工具函数
export {
  stringUtils,
  numberUtils,
  dateUtils,
  validationUtils,
  storageUtils
}

// 导出工具函数类型
export type {
  FormatOptions,
  ValidationRule,
  ValidationResult
} from './utils'

// 重新导出组件
export {
  BaseComponent,
  Toast,
  Modal,
  Loading
}

// 导出组件类型
export type {
  ComponentOptions,
  ToastOptions,
  ModalOptions
} from './components'

// 版本信息
export const version = '1.0.0'

// 库信息
export const libraryInfo = {
  name: '@example/mixed-library',
  version,
  description: '混合类型库示例',
  features: [
    'TypeScript 工具函数',
    'DOM 组件类',
    'Less 样式文件',
    'TypeScript 类型定义'
  ]
}

// 初始化函数
export function init(): void {
  console.log(`${libraryInfo.name} v${libraryInfo.version} 已初始化`)
}

// 默认导出
export default {
  version,
  libraryInfo,
  init,
  // 工具函数
  utils: {
    string: stringUtils,
    number: numberUtils,
    date: dateUtils,
    validation: validationUtils,
    storage: storageUtils
  },
  // 组件
  components: {
    BaseComponent,
    Toast,
    Modal,
    Loading
  }
}
