import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/cli/index.ts'],
  format: ['cjs', 'esm'],
  // 生成 DTS（index 与 cli），使用包内 tsconfig.json
  dts: {
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli/index.ts'
    }
  },
  tsconfig: 'tsconfig.json',
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  target: 'node16',
  outDir: 'dist',
  shims: true, // 提供 __dirname 等在 ESM 下的垫片
  // 将运行时依赖全部 external，减小产物体积
  external: [
    'vite',
    '@vitejs/plugin-vue',
    '@vitejs/plugin-vue2',
    '@vitejs/plugin-react',
    '@vitejs/plugin-legacy',
    '@sveltejs/vite-plugin-svelte',
    'chalk',
    'commander',
    'fast-glob',
    'fs-extra',
    'jiti',
    'ora',
    'picocolors'
  ],
  treeshake: true,
  esbuildOptions(options) {
    options.conditions = ['node']
  }
})
