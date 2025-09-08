export default {
  input: 'src/index.ts',
  output: { format: ['esm','cjs','umd'], sourcemap: true, name: 'SvelteComponents' },
  libraryType: 'svelte',
  bundler: 'rollup',
  performance: { treeshaking: true, minify: true },
  external: [],
  umd: {
    enabled: true,
    name: 'SvelteComponents',
    fileName: 'svelte-components.umd.js'
  }
}

