export default {
  input: 'src/index.ts',
  output: {
    format: ['esm','cjs','umd'],
    sourcemap: true,
    name: 'LitComponents',
    globals: { lit: 'Lit' }
  },
  libraryType: 'lit',
  bundler: 'rollup',
  performance: { treeshaking: true, minify: true },
  external: ['lit'],
  umd: {
    enabled: true,
    name: 'LitComponents',
    fileName: 'lit-components.umd.js',
    globals: {
      lit: 'Lit'
    }
  }
}

