import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 指定库类型

  // 生成类型声明文件
  dts: true,

  // 打包与调试
  minify: false,
  sourcemap: true,
  clean: true,

  // 外部依赖（不打包进最终产物）
  external: ['vue', '@arco-design/color', 'chroma-js', 'lucide-vue-next'],

  // 输出配置：使用布尔开关；true 使用默认配置，false/缺省跳过
  output: {
    esm: true,
    cjs: true,
    umd: {
      name: 'LDesignColor',
      globals: {
        'vue': 'Vue',
        '@arco-design/color': 'ArcoColor',
        'chroma-js': 'chroma',
        'lucide-vue-next': 'LucideVueNext',
      },
    },
  },
})
