import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // Output format config
  output: {
    format: ['esm', 'cjs', 'umd']
  },

  // Disable post-build validation
  postBuildValidation: {
    enabled: false,
  },

  // Generate type declarations
  dts: true,

  // Generate source map
  sourcemap: true,

  // Clean output directory
  clean: true,

  // Minify code
  minify: false,

  // CSS handling
  extractCss: false,
  injectCss: true,

  // UMD build config
  umd: {
    enabled: true,
    entry: 'src/index-lib.ts',
    minify: true,
    fileName: 'index.js',
    name: 'LDesignI18n',
  },

  // External dependencies
  external: [
    'vue',
    '@ldesign/shared'
  ],

  // Global variables
  globals: {
    vue: 'Vue',
    '@ldesign/shared': 'LDesignShared'
  },

  // Log level
  logLevel: 'silent',

  // Build options
  build: {
    rollupOptions: {
      onwarn: (warning, warn) => {
        // Silence warnings
      },
    },
  },

  // Disable PostCSS
  postcss: false,
})

