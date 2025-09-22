/**
 * LDesign Web Components 鏋勫缓閰嶇疆
 */

import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 鍏ュ彛鏂囦欢
  input: 'src/index.ts',

  // 杈撳嚭閰嶇疆
  output: {
    format: ['esm', 'cjs'],
    sourcemap: true
  },

  // 鐢熸垚绫诲瀷澹版槑鏂囦欢
  dts: true,

  // 澶栭儴渚濊禆
  external: ['lit'],

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 鍘嬬缉浠ｇ爜
  minify: false,

  // UMD 构建配置
  umd: {
    enabled: true,
    minify: true, // UMD版本启用压缩
    fileName: 'index.js' // 去掉 .umd 后缀
  }
})

