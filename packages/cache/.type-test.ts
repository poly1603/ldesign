// TypeScript 类型导入测试
// 这个文件用于验证类型定义是否正确

// 测试主模块导入
import type * as MainModule from '@ldesign/cache'

// 测试 Vue 模块导入（如果存在）
// Vue 模块不存在

// 类型测试
// eslint-disable-next-line ts/no-unused-vars
type _TestMainModule = keyof typeof MainModule
// Vue 模块类型测试跳过

export { }
