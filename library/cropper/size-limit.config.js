module.exports = [
  {
    name: 'Core (ESM)',
    path: 'dist/index.esm.js',
    limit: '50 KB',
    gzip: true,
  },
  {
    name: 'Core (UMD)',
    path: 'dist/index.umd.js',
    limit: '60 KB',
    gzip: true,
  },
  {
    name: 'Core (CJS)',
    path: 'dist/index.cjs.js',
    limit: '55 KB',
    gzip: true,
  },
  {
    name: 'CSS Styles',
    path: 'dist/style.css',
    limit: '10 KB',
    gzip: true,
  },
  {
    name: 'React Integration',
    path: 'dist/react.esm.js',
    limit: '15 KB',
    gzip: true,
  },
  {
    name: 'Vue Integration',
    path: 'dist/vue.esm.js',
    limit: '15 KB',
    gzip: true,
  },
  {
    name: 'Angular Integration',
    path: 'dist/angular.esm.js',
    limit: '15 KB',
    gzip: true,
  },
];