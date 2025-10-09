/**
 * Vue 3 适配器入口文件
 *
 * 这个文件提供了专门为 Vue 3 优化的加解密功能
 * 包括 Composition API hooks 和 Vue 插件
 *
 * @example
 * ```typescript
 * // 导入 Vue 插件
 * import { CryptoPlugin } from '@ldesign/crypto/vue'
 * app.use(CryptoPlugin)
 *
 * // 使用 Composition API
 * import { useCrypto, useHash } from '@ldesign/crypto/vue'
 * const { encryptAES, decryptAES } = useCrypto()
 * ```
 */

// 重新导出 Vue 适配器的所有功能
export * from './adapt/vue'

// 默认导出 Vue 插件
export { default } from './adapt/vue/plugin'
