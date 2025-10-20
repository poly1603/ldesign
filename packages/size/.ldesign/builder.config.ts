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

  // 鐢熸垚 source map
  sourcemap: true,

  // 娓呯悊杈撳嚭鐩綍
  clean: true,

  // 產生綠境圧縮代碼
  minify: false, // 默认不压缩，由 CI/CD 决定

  // UMD 鏋勫缓閰嶇疆
  umd: {
    enabled: true,
    entry: 'src/index.ts', // 指定UMD入口文件
    minify: true, // UMD鐗堟湰鍚敤鍘嬬缉
    fileName: 'index.js', // 鍘绘帀 .umd 鍚庣紑
  },

  // 澶栭儴渚濊禆閰嶇疆
  external: [
    'vue',
    'lucide-vue-next',
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
    },
  },
})

