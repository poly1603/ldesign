// TypeScript Library Config
export default {
  library: {
    name: 'MyLibrary',
    version: '1.0.0',
    description: 'A TypeScript library example'
  },
  build: {
    formats: ['esm', 'commonjs', 'umd'],
    treeshaking: true,
    declaration: true
  },
  testing: {
    framework: 'vitest',
    coverage: true
  },
  documentation: {
    generate: true,
    format: 'markdown'
  },
  publish: {
    registry: 'https://registry.npmjs.org',
    access: 'public'
  }
}
