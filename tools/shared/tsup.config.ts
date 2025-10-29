import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: false, // 禁用类型生成
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  platform: 'node',
  keepNames: true,
  onSuccess: async () => {
    console.log('✅ @ldesign/cli-shared 构建完成')
  },
})
