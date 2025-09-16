export default {
  input: 'src/public-api.ts',
  output: {
    format: ['esm','cjs','umd'],
    sourcemap: true,
    name: 'AngularLib',
    globals: {
      '@angular/core': 'ngCore',
      '@angular/common': 'ngCommon'
    }
  },
  libraryType: 'angular',
  bundler: 'rollup',
  performance: { treeshaking: true, minify: false },
  external: ['@angular/core','@angular/common'],
  umd: {
    enabled: true,
    entry: 'src/public-api.ts',
    name: 'AngularLib',
    fileName: 'angular-lib.umd.js',
    globals: {
      '@angular/core': 'ngCore',
      '@angular/common': 'ngCommon'
    }
  }
}

