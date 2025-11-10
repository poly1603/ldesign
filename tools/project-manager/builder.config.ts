import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs', 'dts'],
    dir: 'dist',
  },
  external: ['fs-extra', 'fast-glob'],
  sourcemap: true,
  dts: {
    enabled: true,
  },
})

