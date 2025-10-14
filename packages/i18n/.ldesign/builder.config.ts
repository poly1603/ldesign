import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // Output format config
  output: {
    format: ['esm', 'cjs', 'umd']
  },

  // 绂佺敤鏋勫缓鍚庨獙璇侊紙搴撻」鐩笉闇€瑕佽繍琛屾祴璇曢獙璇侊級
  postBuildValidation: {
    enabled: false,
  },

  // 鐢熸垚绫诲瀷澹版槑鏂囦欢
  dts: true,

  // 鐢熸垚 source map
  sourcemap: true,

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 涓嶅帇缂╀唬鐮侊紙寮€鍙戦樁娈碉級
  minify: false,

  // 瀹屽叏绂佺敤 CSS 澶勭悊
  extractCss: false,
  injectCss: true,

  // UMD 构建配置
  umd: {
    enabled: true,
    entry: 'src/index-lib.ts',  // 指定 UMD 入口文件
    minify: true, // UMD版本启用压缩
    fileName: 'index.js', // 去掉 .umd 后缀
    name: 'LDesignI18n',  // 全局变量名
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

  // 鏋勫缓閫夐」
  build: {
    // 绂佺敤鏋勫缓璀﹀憡
    rollupOptions: {
      onwarn: (warning, warn) => {
        // 瀹屽叏闈欓粯锛屼笉杈撳嚭浠讳綍璀﹀憡

      },
    },
  },

  // 绂佺敤 PostCSS 澶勭悊
  postcss: false,
})

