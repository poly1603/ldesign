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

  // 鍚敤Vue鏀寔锛屽洜涓哄寘鍚玍ue缁勪欢
  libraryType: 'vue3',

  // 鐢熸垚绫诲瀷澹版槑鏂囦欢
  dts: true,

  // 鐢熸垚 source map
  sourcemap: true,

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 涓嶅帇缂╀唬鐮侊紙寮€鍙戦樁娈碉級
  minify: false,

  // UMD 构建配置
  umd: {
    enabled: true,
    name: 'LDesignCache',
    globals: {
      'vue': 'Vue',
      'lodash-es': '_'
    }
  },

  // 澶栭儴渚濊禆閰嶇疆
  external: [
    'vue',
    'lodash-es',
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
    'node:worker_threads'
  ],

  // 鍏ㄥ眬鍙橀噺閰嶇疆
  globals: {
    'vue': 'Vue',
    'lodash-es': '_'
  },

  // 鏃ュ織绾у埆璁剧疆涓?silent锛屽彧鏄剧ず閿欒淇℃伅
  logLevel: 'silent',

  // 鏋勫缓閫夐」
  build: {
    // 绂佺敤鏋勫缓璀﹀憡
    rollupOptions: {
      onwarn: (_warning, _warn) => {
        // 瀹屽叏闈欓粯锛屼笉杈撳嚭浠讳綍璀﹀憡
        
      }
    }
  }
})

