import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

// Create multiple build configurations
const configs = []

// Main Vue build
configs.push(createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignForm',
  formats: ['es', 'cjs', 'umd'],
  external: ['vue'],
  globals: {
    vue: 'Vue',
  },
  vue: true,
  entries: {
    index: 'src/index.ts'
  }
}))

// Vanilla JavaScript build (without Vue dependency)
configs.push(createRollupConfig({
  packageDir: process.cwd(),
  packageName: 'LDesignFormVanilla',
  formats: ['es', 'cjs', 'umd'],
  external: [],
  globals: {},
  vue: false,
  entries: {
    vanilla: 'src/vanilla.ts'
  }
}))

export default configs
