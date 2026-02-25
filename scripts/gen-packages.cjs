const fs = require('fs')
const path = require('path')
const base = path.join(__dirname, '..', 'packages')

function w(f, c) {
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, c, 'utf8')
}

const pkgs = [
  { name: 'validate', desc: '校验系统', umd: 'LDesignValidate', keywords: ['validate', 'validation', 'form', 'rules'] },
  { name: 'event', desc: '事件系统', umd: 'LDesignEvent', keywords: ['event', 'eventbus', 'emitter', 'pubsub'] },
  { name: 'storage', desc: '存储管理', umd: 'LDesignStorage', keywords: ['storage', 'localStorage', 'sessionStorage', 'indexeddb'] },
  { name: 'websocket', desc: 'WebSocket 客户端', umd: 'LDesignWebSocket', keywords: ['websocket', 'realtime', 'ws', 'reconnect'] },
  { name: 'config', desc: '配置中心', umd: 'LDesignConfig', keywords: ['config', 'configuration', 'settings', 'env'] },
  { name: 'theme', desc: '主题管理', umd: 'LDesignTheme', keywords: ['theme', 'dark-mode', 'css-variables', 'design-tokens'] },
]

const gitignore = `# Build outputs
es
esm
lib
dist

# Dependencies
node_modules

# IDE
.vscode
.idea

# Logs
*.log

# Cache
.rollup.cache
*.tsbuildinfo
`

const eslintConfig = `import antfu from '@antfu/eslint-config'
export default antfu({ typescript: true })
`

const coreTsconfig = {
  compilerOptions: {
    target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'bundler',
    baseUrl: '.', rootDir: 'src', outDir: 'dist', strict: true, noUnusedLocals: true, noUnusedParameters: true,
    noFallthroughCasesInSwitch: true, noImplicitReturns: true, noImplicitOverride: true,
    declaration: true, declarationMap: true, sourceMap: true, skipLibCheck: true, esModuleInterop: true,
    allowSyntheticDefaultImports: true, forceConsistentCasingInFileNames: true, isolatedModules: true,
    resolveJsonModule: true, paths: { '@/*': ['src/*'] }
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
}

const vueTsconfig = {
  ...coreTsconfig,
  compilerOptions: { ...coreTsconfig.compilerOptions, jsx: 'preserve', jsxImportSource: 'vue' },
  include: ['src/**/*', 'src/**/*.vue'],
  exclude: ['node_modules', 'dist']
}

const rootTsconfig = {
  compilerOptions: {
    target: 'ES2020', module: 'ESNext', moduleResolution: 'bundler',
    lib: ['ES2020', 'DOM', 'DOM.Iterable'], strict: true, declaration: true,
    declarationMap: true, skipLibCheck: true, esModuleInterop: true,
    resolveJsonModule: true, jsx: 'preserve'
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist', 'es', 'lib', 'examples']
}

for (const pkg of pkgs) {
  const d = path.join(base, pkg.name)
  const N = pkg.name

  // Root files
  w(path.join(d, '.gitignore'), gitignore)
  w(path.join(d, 'eslint.config.js'), eslintConfig)
  w(path.join(d, 'tsconfig.json'), JSON.stringify(rootTsconfig, null, 2))

  // Root package.json
  w(path.join(d, 'package.json'), JSON.stringify({
    name: `@ldesign/${N}`, version: '0.1.0',
    description: `LDesign ${pkg.desc} - 统一导出 core 和 vue 子包`,
    keywords: ['ldesign', ...pkg.keywords, 'vue', 'typescript'],
    author: 'LDesign Team', license: 'MIT', type: 'module', sideEffects: false,
    exports: { '.': { types: './es/index.d.ts', import: './es/index.js', require: './lib/index.cjs', default: './es/index.js' }, './package.json': './package.json' },
    main: './lib/index.cjs', module: './es/index.js', types: './es/index.d.ts',
    files: ['README.md', 'LICENSE', 'CHANGELOG.md', 'es', 'lib', 'dist'],
    scripts: { build: 'ldesign-builder build', 'build:packages': "pnpm --filter './packages/*' build", dev: 'ldesign-builder build --mode development --watch', clean: 'rimraf es lib dist' },
    dependencies: { [`@ldesign/${N}-core`]: 'workspace:*', [`@ldesign/${N}-vue`]: 'workspace:*' },
    devDependencies: { '@ldesign/builder': 'workspace:*', rimraf: '^5.0.5', typescript: '^5.7.3' },
    engines: { node: '>=16.0.0' }, typings: './es/index.d.ts', browser: './dist/index.js'
  }, null, 2))

  // Root src/index.ts
  w(path.join(d, 'src/index.ts'), `/**\n * @ldesign/${N} - LDesign ${pkg.desc}\n * @module @ldesign/${N}\n */\n\n// 导出核心功能\nexport * from '@ldesign/${N}-core'\n\n// 导出 Vue 功能\nexport * from '@ldesign/${N}-vue'\n`)

  // Core package.json
  w(path.join(d, 'packages/core/package.json'), JSON.stringify({
    name: `@ldesign/${N}-core`, version: '0.1.0',
    description: `LDesign ${pkg.desc} - 框架无关的核心模块`,
    keywords: ['ldesign', ...pkg.keywords, 'typescript'],
    author: 'LDesign Team', license: 'MIT', type: 'module', sideEffects: false,
    exports: { '.': { types: './es/index.d.ts', import: './es/index.js', require: './lib/index.cjs', default: './es/index.js' }, './package.json': './package.json' },
    main: './lib/index.cjs', module: './es/index.js', types: './es/index.d.ts',
    files: ['README.md', 'LICENSE', 'CHANGELOG.md', 'es', 'lib'],
    scripts: { build: 'ldesign-builder build', dev: 'ldesign-builder build --watch', clean: 'rimraf dist es lib', lint: 'eslint . --fix', test: 'vitest', 'test:run': 'vitest run' },
    devDependencies: { '@antfu/eslint-config': '^6.0.0', '@ldesign/builder': 'workspace:*', eslint: '^9.18.0', rimraf: '^5.0.0', typescript: '^5.7.3', vitest: '^2.0.0' },
    typings: './es/index.d.ts', browser: './dist/index.js'
  }, null, 2))

  w(path.join(d, 'packages/core/tsconfig.json'), JSON.stringify(coreTsconfig, null, 2))
  w(path.join(d, 'packages/core/.gitignore'), gitignore)
  w(path.join(d, 'packages/core/builder.config.ts'), `import { defineConfig } from '@ldesign/builder'\n\nexport default defineConfig({\n  input: 'src/index.ts',\n  output: [\n    { format: 'esm', dir: 'es', preserveModules: true, preserveModulesRoot: 'src' },\n    { format: 'cjs', dir: 'lib', preserveModules: true, preserveModulesRoot: 'src' },\n    { format: 'umd', dir: 'dist', name: '${pkg.umd}Core' },\n  ],\n  external: [],\n  dts: true,\n  clean: true,\n})\n`)

  // Vue package.json
  w(path.join(d, 'packages/vue/package.json'), JSON.stringify({
    name: `@ldesign/${N}-vue`, version: '0.1.0',
    description: `LDesign ${pkg.desc} - Vue 3 适配器`,
    keywords: ['ldesign', ...pkg.keywords, 'vue', 'vue3', 'composable', 'typescript'],
    author: 'LDesign Team', license: 'MIT', type: 'module', sideEffects: false,
    exports: { '.': { types: './es/index.d.ts', import: './es/index.js', require: './lib/index.cjs', default: './es/index.js' }, './package.json': './package.json' },
    main: './lib/index.cjs', module: './es/index.js', types: './es/index.d.ts',
    files: ['README.md', 'LICENSE', 'CHANGELOG.md', 'es', 'lib'],
    scripts: { build: 'ldesign-builder build', dev: 'ldesign-builder build --watch', clean: 'rimraf dist es lib', lint: 'eslint . --fix' },
    dependencies: { [`@ldesign/${N}-core`]: 'workspace:*' },
    peerDependencies: { vue: '^3.3.0' },
    devDependencies: { '@antfu/eslint-config': '^6.0.0', '@ldesign/builder': 'workspace:*', '@vitejs/plugin-vue': '^5.0.0', eslint: '^9.18.0', rimraf: '^5.0.0', typescript: '^5.7.3', vue: '^3.3.0' },
    typings: './es/index.d.ts', browser: './dist/index.js'
  }, null, 2))

  w(path.join(d, 'packages/vue/tsconfig.json'), JSON.stringify(vueTsconfig, null, 2))
  w(path.join(d, 'packages/vue/.gitignore'), gitignore)
  w(path.join(d, 'packages/vue/builder.config.ts'), `import { defineConfig } from '@ldesign/builder'\n\nexport default defineConfig({\n  input: 'src/index.ts',\n  output: [\n    { format: 'esm', dir: 'es', preserveModules: true, preserveModulesRoot: 'src' },\n    { format: 'cjs', dir: 'lib', preserveModules: true, preserveModulesRoot: 'src' },\n    { format: 'umd', dir: 'dist', name: '${pkg.umd}Vue' },\n  ],\n  external: ['vue', '@ldesign/${N}-core'],\n  dts: true,\n  clean: true,\n})\n`)

  // Playground
  w(path.join(d, 'playground/package.json'), JSON.stringify({
    name: `@ldesign/${N}-playground`, version: '0.0.1', private: true, type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' },
    dependencies: { [`@ldesign/${N}-core`]: 'workspace:*', [`@ldesign/${N}-vue`]: 'workspace:*', vue: '^3.4.0' },
    devDependencies: { '@vitejs/plugin-vue': '^5.0.0', typescript: '^5.7.3', vite: '^5.0.0', 'vue-tsc': '^2.0.0' }
  }, null, 2))

  w(path.join(d, 'playground/vite.config.ts'), `import { defineConfig } from 'vite'\nimport vue from '@vitejs/plugin-vue'\n\nexport default defineConfig({\n  plugins: [vue()],\n  server: { port: 3000 },\n})\n`)

  w(path.join(d, 'playground/tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2020', useDefineForClassFields: true, module: 'ESNext',
      lib: ['ES2020', 'DOM', 'DOM.Iterable'], skipLibCheck: true, moduleResolution: 'bundler',
      allowImportingTsExtensions: true, isolatedModules: true, moduleDetection: 'force', noEmit: true,
      strict: true, noUnusedLocals: true, noUnusedParameters: true, noFallthroughCasesInSwitch: true,
      jsx: 'preserve', jsxImportSource: 'vue',
      paths: { [`@ldesign/${N}-core`]: ['../packages/core/src'], [`@ldesign/${N}-vue`]: ['../packages/vue/src'] }
    },
    include: ['src/**/*.ts', 'src/**/*.vue']
  }, null, 2))

  w(path.join(d, 'playground/index.html'), `<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>@ldesign/${N} Playground</title>\n</head>\n<body>\n  <div id="app"></div>\n  <script type="module" src="/src/main.ts"></script>\n</body>\n</html>\n`)

  w(path.join(d, 'playground/src/main.ts'), `import { createApp } from 'vue'\nimport App from './App.vue'\n\nconst app = createApp(App)\napp.mount('#app')\n`)

  w(path.join(d, 'playground/src/env.d.ts'), `/// <reference types="vite/client" />\n\ndeclare module '*.vue' {\n  import type { DefineComponent } from 'vue'\n  const component: DefineComponent<{}, {}, any>\n  export default component\n}\n`)

  console.log(`Created scaffold for: ${N}`)
}

console.log('Done!')
