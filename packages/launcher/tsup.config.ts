import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: ['vite', 'vue', 'react'],
  outDir: 'dist',
  target: 'node16',
  platform: 'node',
  // 修复混合导出警告
  bundle: true,
  // 忽略空 chunk 警告（类型文件）
  onSuccess: async () => {
    console.log('构建完成！')
  },
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
    // 忽略空文件警告
    options.ignoreAnnotations = true
  },
})
