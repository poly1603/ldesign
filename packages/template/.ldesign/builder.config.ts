import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // Output format config - 构建ESM, CJS和UMD
  output: {
    format: ['esm', 'cjs', 'umd'],
  },

  // 禁用构建后验证
  postBuildValidation: {
    enabled: false,
  },

  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码
  minify: false,

  // 启用dist目录的构建用于UMD
  build: {
    // 构建UMD
    umd: true,
    // 生成dist目录
    dist: true,
  },

  // 外部依赖配置
  external: [
    'vue',
    '@vueuse/core',
    'lucide-vue-next',
    '@ldesign/cache',
    '@ldesign/device',
    '@ldesign/engine',
    '@ldesign/shared',
    '@ldesign/webcomponent',
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
      onwarn: (_warning, _warn) => {
        // 瀹屽叏闈欓粯锛屼笉杈撳嚭浠讳綍璀﹀憡
      },
    },
  },
})
