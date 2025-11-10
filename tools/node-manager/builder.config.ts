import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  entry: 'src/index.ts',
  output: {
    formats: ['esm', 'cjs', 'dts'],
    dir: 'dist',
  },
  external: ['execa', 'fs-extra', 'node-fetch', 'tar', 'extract-zip'],
  sourcemap: true,
  dts: {
    enabled: true,
  },
})


