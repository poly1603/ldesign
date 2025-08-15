export { createCache, defaultCache } from '../packages/cache/types/index.d.js'
export {
  hexToHsl,
  hexToRgb,
  hslToHex,
  isValidHex,
  normalizeHex,
  rgbToHex,
} from '../packages/color/dist/index.d.js'
export {
  base64,
  decrypt,
  encrypt,
  hash,
  hex,
  hmac,
} from '../packages/crypto/dist/index.d.js'
export {
  calculateSizeScale,
  formatCSSValue,
  getNextSizeMode,
  getPreviousSizeMode,
  isValidSizeMode,
} from '../packages/size/types/utils/index.d.js'
import '../packages/size/types/vue/plugin.d.js'
import '../packages/size/types/node_modules/.pnpm/@vue_runtime-dom@3.5.18/node_modules/@vue/runtime-dom/dist/runtime-dom.d.d.js'
import '../packages/size/types/node_modules/.pnpm/@vue_runtime-core@3.5.18/node_modules/@vue/runtime-core/dist/runtime-core.d.d.js'
export {
  useAction,
  useGetter,
  useState,
  useStore,
} from '../packages/store/dist/index.d.js'

/**
 * 简化的工具函数集合
 */
/**
 * 格式化日期
 */
declare function formatDate(date: Date | string | number): string
/**
 * 生成唯一ID
 */
declare function generateId(prefix?: string): string

export { formatDate, generateId }
