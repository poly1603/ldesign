export default {
  input: 'src/index.ts',
  output: {
    format: ['esm','cjs','umd'],
    sourcemap: true,
    name: 'SolidComponents',
    globals: {
      'solid-js': 'solidJs',
      'solid-js/jsx-runtime': 'solidJsxRuntime'
    }
  },
  libraryType: 'solid',
  bundler: 'rollup',
  performance: { treeshaking: true, minify: true },
  external: ['solid-js','solid-js/jsx-runtime'],
  umd: {
    enabled: true,
    name: 'SolidComponents',
    fileName: 'solid-components.umd.js',
    globals: {
      'solid-js': 'solidJs',
      'solid-js/jsx-runtime': 'solidJsxRuntime'
    }
  }
}

