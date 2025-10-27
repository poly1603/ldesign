import { defineConfig } from '@ldesign/builder'

/**
 * Standard LDesign Package Build Configuration Template
 * 
 * This is the minimal recommended configuration for @ldesign packages.
 * Only add extra configuration if your package has specific needs.
 * 
 * Special Cases:
 * - Packages with CSS files: Add css config (e.g., menu, tabs)
 * - Packages with custom externals: Override external array (e.g., shared)
 * - Packages with alternative UMD entry: Specify entry in output.umd (e.g., animation)
 */

export default defineConfig({
  input: 'src/index.ts',

  output: {
    format: ['esm', 'cjs', 'umd'],
    esm: {
      dir: 'es',
      preserveStructure: true,
    },
    cjs: {
      dir: 'lib',
      preserveStructure: true,
    },
    umd: {
      dir: 'dist',
      name: 'LDesignPackageName', // Change to match your package
    },
  },

  dts: true,
  sourcemap: true,
  minify: false,
  clean: true,

  external: [
    'vue',
    'react',
    'react-dom',
    /^@ldesign\//,
    /^lodash/,
  ],
})
