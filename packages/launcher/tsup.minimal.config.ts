import { defineConfig } from 'tsup'
import type { Options } from 'tsup'

const isDev = process.env.NODE_ENV !== 'production'
const skipDts = process.env.SKIP_DTS === 'true'

export default defineConfig({
  // 只构建核心模块
  entry: {
    'index': 'src/index.ts',
    'cli/index': 'src/cli/index.ts',
    'core/index': 'src/core/index.ts',
    // 只包含核心命令
    'cli/commands/dev': 'src/cli/commands/dev.ts',
    'cli/commands/build': 'src/cli/commands/build.ts',
    'cli/commands/preview': 'src/cli/commands/preview.ts',
    'utils/index': 'src/utils/index.ts',
    'types/index': 'src/types/index.ts',
    'constants/index': 'src/constants/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // 暂时跳过DTS生成
  tsconfig: 'tsconfig.json',
  clean: !isDev,
  splitting: true,
  sourcemap: false,
  minify: false,
  target: 'node16',
  outDir: 'dist',
  shims: true,
  external: [
    'vite',
    '@vitejs/plugin-vue',
    '@vitejs/plugin-vue2',
    '@vitejs/plugin-react',
    '@vitejs/plugin-legacy',
    '@sveltejs/vite-plugin-svelte',
    'chalk',
    'commander',
    'fs-extra',
    'glob',
    'picocolors',
  ],
  treeshake: true,
  bundle: true,
  esbuildOptions(options) {
    options.conditions = ['node']
    options.platform = 'node'
  },
  skipNodeModulesBundle: true,
  onSuccess: 'echo Build completed!'
} as Options)




