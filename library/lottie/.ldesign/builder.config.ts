import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  input: {
    index: 'src/index.ts',
    'adapters/vue': 'src/adapters/vue.ts',
    'adapters/react': 'src/adapters/react.ts',
  },
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
  },
  external: ['lottie-web', 'vue', 'react', 'react-dom'],
  dts: true,
  sourcemap: true,
  minify: false,
})
