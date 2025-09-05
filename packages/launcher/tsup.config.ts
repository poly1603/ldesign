import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['cjs', 'esm'],
  // 暂时关闭 DTS 生成以避免类型未使用导致的构建失败
  dts: false,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node16',
  outDir: 'dist',
  external: [
    'vite',
    '@vitejs/plugin-vue',
    '@vitejs/plugin-vue2',
    '@vitejs/plugin-react',
    '@vitejs/plugin-legacy',
    '@sveltejs/vite-plugin-svelte'
  ],
  noExternal: [
    'chalk',
    'commander',
    'fast-glob',
    'jiti',
    'picocolors'
  ],
  esbuildOptions(options) {
    options.conditions = ['node']
  }
})
