import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // Output format config
  output: {
    format: ['esm', 'cjs', 'umd']
  },

  // 绂佺敤鏋勫缓鍚庨獙璇侊紙搴撻」鐩笉闇€瑕佽繍琛屾祴璇曢獙璇侊級
  postBuildValidation: {
    enabled: false
  },

  // 鐢熸垚绫诲瀷澹版槑鏂囦欢
  dts: true,

  // 鐢熸垚 source map锛堢敓浜х幆澧冨彲鑰冭檻鍏抽棴浠ュ噺灏戜綋绉級
  sourcemap: true,

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 鍚敤浠ｇ爜鍘嬬缉浠ュ噺灏戝寘浣撶Н
  minify: true,

  // TypeScript 閰嶇疆
  typescript: {
    tsconfig: './tsconfig.build.json',
  },

  // UMD 鏋勫缓閰嶇疆
  umd: {
    enabled: true,
    minify: true, // UMD鐗堟湰鍚敤鍘嬬缉
    fileName: 'index.js', // 鍘绘帀 .umd 鍚庣紑
  },

  // 澶栭儴渚濊禆閰嶇疆
  external: [
    'vue',
    'node:fs',
    'node:path',
    'node:os',
    'node:util',
    'node:events',
    'node:stream',
    'node:crypto',
    'node:http',
    'node:https',
    'node:url',
    'node:buffer',
    'node:child_process',
    'node:worker_threads',
  ],

  // 鍏ㄥ眬鍙橀噺閰嶇疆
  globals: {
    vue: 'Vue',
  },

  // 鏃ュ織绾у埆璁剧疆涓?silent锛屽彧鏄剧ず閿欒淇℃伅
  logLevel: 'silent',

  // 杈撳嚭鐩綍锛堝彲閫夛紝榛樿浣跨敤 package.json 涓殑璁剧疆锛?
  // ESM 杈撳嚭鍒?es/锛孋ommonJS 杈撳嚭鍒?lib/锛孶MD 杈撳嚭鍒?dist/
  // 杩欎簺榛樿鍊肩敱 builder 鑷姩鎺ㄦ柇锛屾牴鎹?package.json 涓殑閰嶇疆
})

