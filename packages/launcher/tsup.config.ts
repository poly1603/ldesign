import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
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
  esbuildOptions(options) {
    options.alias = {
      '@': './src',
    }
  },
})
