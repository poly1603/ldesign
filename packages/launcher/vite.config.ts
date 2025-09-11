import { createPackageViteConfig } from '@ldesign/builder'

export default createPackageViteConfig({
  enableCSS: false, // launcher包不需要CSS处理
  external: [
    'vite',
    'fs',
    'fs/promises',
    'path',
    'child_process',
    'commander',
    'chalk',
    'ora',
    'inquirer',
    'semver',
    'glob',
    'fast-glob',
    'picocolors',
    'esbuild',
    'rollup',
  ],
  globals: {
    vite: 'Vite',
  }
})
