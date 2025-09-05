/**
 * TSX 组件导出
 * 用于测试 TSX 组件的打包和使用
 */

// 导入组件
import { LDesignButton } from './LDesignButton'
import { LDesignInput } from './LDesignInput'

// 导出 Button 组件
export { LDesignButton }
export { default as Button } from './LDesignButton'
export type { ButtonProps, ButtonEmits, ButtonType, ButtonSize } from './LDesignButton'

// 导出 Input 组件
export { LDesignInput }
export { default as Input } from './LDesignInput'
export type {
  InputProps,
  InputEmits,
  InputType,
  InputSize,
  InputStatus
} from './LDesignInput'

// 导出样式文件（通过 import 确保样式被包含在打包中）
import './LDesignButton.less'
import './LDesignInput.less'

// 组件列表
export const TSXComponents = {
  LDesignButton,
  LDesignInput
} as const

// 组件安装函数
export function installTSXComponents(app: any) {
  Object.entries(TSXComponents).forEach(([name, component]) => {
    app.component(name, component)
  })
}

// 默认导出
export default {
  LDesignButton,
  LDesignInput,
  install: installTSXComponents
}
