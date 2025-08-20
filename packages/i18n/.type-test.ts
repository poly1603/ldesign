// TypeScript 类型导入测试
// 这个文件用于验证类型定义是否正确

// 测试主模块导入
import type * as MainModule from '@ldesign/i18n'

// 测试 Vue 模块导入（如果存在）
import type * as VueModule from '@ldesign/i18n/vue'

// 类型测试
type _TestMainModule = keyof typeof MainModule
type _TestVueModule = keyof typeof VueModule

export { }
