export default {
  input: 'src/index.ts',
  output: {
    format: ['esm','cjs','umd'],
    sourcemap: true,
    name: 'PreactComponents',
    globals: {
      preact: 'Preact',
      'preact/jsx-runtime': 'jsxRuntime'
    }
  },
  libraryType: 'preact',
  bundler: 'rollup',
  performance: { treeshaking: true, minify: true },
  external: ['preact','preact/jsx-runtime'],
  umd: {
    enabled: true,
    name: 'PreactComponents',
    fileName: 'preact-components.umd.js',
    globals: {
      preact: 'Preact',
      'preact/jsx-runtime': 'jsxRuntime'
    }
  }
}

