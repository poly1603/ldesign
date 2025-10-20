import { defineConfig } from '@ldesign/builder'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  // Output format config
  output: {
    format: ['esm', 'cjs', 'umd']
  },

  // 绂佺敤鏋勫缓鍚庨獙璇侊紙搴撻」鐩笉闇€瑕佽繍琛屾祴璇曢獙璇侊級
  postBuildValidation: {
    enabled: false,
  },

  // 鐢熸垚绫诲瀷澹版槑鏂囦欢锛堟殏鏃剁鐢ㄩ伩鍏嶇被鍨嬮敊璇級
  dts: false,

  // TypeScript 閰嶇疆
  typescript: {
    declaration: false,
    declarationMap: false,
  },

  // 鐢熸垚 source map
  sourcemap: true,

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 涓嶅帇缂╀唬鐮侊紙寮€鍙戦樁娈碉級
  minify: false,

  // UMD 鏋勫缓閰嶇疆
  umd: {
    enabled: true,
    minify: true, // UMD鐗堟湰鍚敤鍘嬬缉
    fileName: 'index.js', // 鍘绘帀 .umd 鍚庣紑
  },

  // 澶栭儴渚濊禆閰嶇疆
  external: [
    'vue',
    'lucide-vue-next',
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
    'vue': 'Vue',
    'lucide-vue-next': 'LucideVueNext',
  },

  // 鏃ュ織绾у埆璁剧疆涓?silent锛屽彧鏄剧ず閿欒淇℃伅
  logLevel: 'silent',

  // 鏋勫缓閫夐」
  build: {
    // 绂佺敤鏋勫缓璀﹀憡
    rollupOptions: {
      onwarn: (_warning, _warn) => {
        // 瀹屽叏闈欓粯锛屼笉杈撳嚭浠讳綍璀﹀憡
      },
      // 娣诲姞涓€浜涜嚜瀹氫箟閰嶇疆
      external: (id: string) => {
        // Vue SFC 鏍峰紡鏂囦欢涓嶅簲璇ヨ澶栭儴鍖?
        if (id.includes('?vue&type=style')) {
          return false
        }
        return false
      },
    },
  },

  // Rollup resolve 閰嶇疆
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.vue'],
  },

  // Vue 缁勪欢閰嶇疆 - 绂佺敤 CSS 鎻愬彇閬垮厤鏋勫缓閿欒
  vue: {
    // 涓嶆彁鍙?CSS锛屽唴鑱斿埌 JS 涓?    extractCss: false,
    // 绂佺敤 CSS 妯″潡
    cssModules: false,
  },

  // 鑷畾涔夋彃浠?- 浣跨敤 Vite 鐨?Vue 鎻掍欢鏉ュ鐞?Vue 鏂囦欢
  plugins: [
    vue(),
  ],
})

