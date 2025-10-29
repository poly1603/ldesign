import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/*.spec.ts'],
  format: ['esm'],
  outDir: 'dist',
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node18',
  platform: 'node',
  keepNames: true,
  onSuccess: async () => {
    console.log('✅ @ldesign/cli-server 构建完成')
  },
})
