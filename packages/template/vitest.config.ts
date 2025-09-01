import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  vue: true,
  environment: 'jsdom',
  setupFiles: ['tests/setup.ts'],
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
