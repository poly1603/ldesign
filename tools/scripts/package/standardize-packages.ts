#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface PackageConfig {
  external: string[]
  globalName: string
  globals: Record<string, string>
  vue: boolean
  environment: 'node' | 'jsdom' | 'happy-dom'
  setupFiles: string[]
  webServer: { command: string; port: number }
  testDir: string
}

// 包配置映射
const packageConfigs: Record<string, PackageConfig> = {
  engine: {
    external: ['vue'],
    globalName: 'LDesignEngine',
    globals: { vue: 'Vue' },
    vue: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    webServer: { command: 'cd example && pnpm dev', port: 5173 },
    testDir: 'tests',
  },
  color: {
    external: ['vue', '@arco-design/color', 'chroma-js'],
    globalName: 'LDesignColor',
    globals: {
      vue: 'Vue',
      '@arco-design/color': 'ArcoColor',
      'chroma-js': 'chroma',
    },
    vue: true,
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 },
    testDir: '__tests__',
  },
  crypto: {
    external: ['vue', 'crypto-js', 'node-forge'],
    globalName: 'LDesignCrypto',
    globals: { vue: 'Vue', 'crypto-js': 'CryptoJS', 'node-forge': 'forge' },
    vue: true,
    environment: 'node',
    setupFiles: ['test/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 },
    testDir: 'test',
  },
  device: {
    external: ['vue'],
    globalName: 'LDesignDevice',
    globals: { vue: 'Vue' },
    vue: true,
    environment: 'happy-dom',
    setupFiles: ['__tests__/setup.ts'],
    webServer: { command: 'pnpm dev', port: 5173 },
    testDir: '__tests__',
  },
  http: {
    external: ['vue', 'axios', 'alova'],
    globalName: 'LDesignHttp',
    globals: { vue: 'Vue', axios: 'axios', alova: 'alova' },
    vue: true,
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 },
    testDir: 'tests',
  },
  i18n: {
    external: ['vue'],
    globalName: 'LDesignI18n',
    globals: { vue: 'Vue' },
    vue: true,
    environment: 'jsdom',
    setupFiles: ['__tests__/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 },
    testDir: '__tests__',
  },
  router: {
    external: ['vue'],
    globalName: 'LDesignRouter',
    globals: { vue: 'Vue' },
    vue: true,
    environment: 'happy-dom',
    setupFiles: ['test/setup.ts'],
    webServer: { command: 'cd examples/basic && pnpm dev', port: 5173 },
    testDir: 'test',
  },
  store: {
    external: ['vue', 'pinia'],
    globalName: 'LDesignStore',
    globals: { vue: 'Vue', pinia: 'Pinia' },
    vue: true,
    environment: 'jsdom',
    setupFiles: ['test/setup.ts'],
    webServer: { command: 'cd examples/basic && pnpm dev', port: 5173 },
    testDir: 'test',
  },
  template: {
    external: ['vue'],
    globalName: 'LDesignTemplate',
    globals: { vue: 'Vue' },
    vue: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    webServer: { command: 'cd examples/basic && pnpm dev', port: 3003 },
    testDir: 'tests',
  },
}

// 标准目录结构
const standardDirectories = [
  'src',
  'src/types',
  'src/utils',
  '__tests__',
  'e2e',
  'docs',
  'examples',
]

// 标准脚本
const standardScripts = {
  build: 'rollup -c',
  'build:watch': 'rollup -c -w',
  dev: 'rollup -c -w',
  'type-check': 'vue-tsc --noEmit',
  lint: 'eslint . --fix',
  'lint:check': 'eslint .',
  test: 'vitest',
  'test:ui': 'vitest --ui',
  'test:run': 'vitest run',
  'test:coverage': 'vitest run --coverage',
  'test:e2e': 'playwright test',
  'test:e2e:ui': 'playwright test --ui',
  'docs:dev': 'vitepress dev docs',
  'docs:build': 'vitepress build docs',
  'docs:preview': 'vitepress preview docs',
  clean: 'rimraf dist es lib types coverage .nyc_output',
  'size-check': 'size-limit',
  prepublishOnly: 'pnpm run clean && pnpm run build && pnpm run test:run',
}

/**
 * 确保目录结构标准化
 */
function ensureDirectoryStructure(packageDir: string): void {
  console.log('📁 检查目录结构...')

  for (const dir of standardDirectories) {
    const dirPath = path.join(packageDir, dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`  ✅ 创建目录: ${dir}`)
    }
  }
}

/**
 * 更新 tsconfig.json
 */
function updateTsConfig(packageDir: string): void {
  const tsconfigPath = path.join(packageDir, 'tsconfig.json')

  const tsconfig = {
    extends: '../../tools/build/tsconfig.base.json',
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
      },
    },
    include: [
      'src/**/*',
      'examples/**/*',
      '__tests__/**/*',
      'tests/**/*',
      'test/**/*',
      'e2e/**/*',
    ],
  }

  fs.writeFileSync(tsconfigPath, `${JSON.stringify(tsconfig, null, 2)}\n`)
  console.log('  ✅ 更新 tsconfig.json')
}

/**
 * 更新 Rollup 配置
 */
function updateRollupConfig(packageDir: string, config: PackageConfig): void {
  const rollupConfigPath = path.join(packageDir, 'rollup.config.js')

  const content = `import { createRollupConfig } from '../../tools/build/rollup.config.base.js'

export default createRollupConfig({
  external: ${JSON.stringify(config.external)},
  globalName: '${config.globalName}',
  globals: ${JSON.stringify(config.globals, null, 2)},
  vue: ${config.vue}
})
`

  fs.writeFileSync(rollupConfigPath, content)
  console.log('  ✅ 更新 rollup.config.js')
}

/**
 * 更新 Vitest 配置
 */
function updateVitestConfig(packageDir: string, config: PackageConfig): void {
  const vitestConfigPath = path.join(packageDir, 'vitest.config.ts')

  const options = []
  if (config.vue) options.push(`vue: true`)
  if (config.environment) options.push(`environment: '${config.environment}'`)
  if (config.setupFiles.length > 0)
    options.push(`setupFiles: ${JSON.stringify(config.setupFiles)}`)

  const content = `import { createVitestConfig } from '../../tools/test/vitest.config.base'

export default createVitestConfig({
  ${options.join(',\n  ')}
})
`

  fs.writeFileSync(vitestConfigPath, content)
  console.log('  ✅ 更新 vitest.config.ts')
}

/**
 * 更新 Playwright 配置
 */
function updatePlaywrightConfig(
  packageDir: string,
  config: PackageConfig
): void {
  const playwrightConfigPath = path.join(packageDir, 'playwright.config.ts')

  let content = `import { createPlaywrightConfig } from '../../tools/test/playwright.config.base'

export default createPlaywrightConfig({
  testDir: './e2e'`

  if (config.webServer) {
    content += `,
  webServer: {
    command: '${config.webServer.command}',
    port: ${config.webServer.port}
  }`
  }

  content += `
})
`

  fs.writeFileSync(playwrightConfigPath, content)
  console.log('  ✅ 更新 playwright.config.ts')
}

/**
 * 更新 ESLint 配置
 */
function updateEslintConfig(packageDir: string, config: PackageConfig): void {
  const eslintConfigPath = path.join(packageDir, 'eslint.config.js')

  const content = `import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  vue: ${config.vue},
  ignores: [
    'dist',
    'es',
    'lib',
    'types',
    'node_modules',
    'coverage',
    '*.d.ts'
  ]
})
`

  fs.writeFileSync(eslintConfigPath, content)
  console.log('  ✅ 更新 eslint.config.js')
}

/**
 * 更新 package.json scripts
 */
function updatePackageScripts(packageDir: string): void {
  const packageJsonPath = path.join(packageDir, 'package.json')

  if (!fs.existsSync(packageJsonPath)) {
    console.log('  ⚠️  package.json 不存在，跳过')
    return
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

  // 合并现有脚本和标准脚本
  packageJson.scripts = {
    ...packageJson.scripts,
    ...standardScripts,
  }

  fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
  console.log('  ✅ 更新 package.json scripts')
}

/**
 * 标准化单个包
 */
export function standardizePackage(packageName: string): void {
  const packageDir = path.resolve(__dirname, '../../../packages', packageName)
  const config = packageConfigs[packageName]

  if (!config) {
    console.warn(`⚠️  未找到 ${packageName} 的配置`)
    return
  }

  console.log(`🔧 标准化 ${packageName} 包配置...`)

  // 1. 确保目录结构
  ensureDirectoryStructure(packageDir)

  // 2. 更新配置文件
  updateTsConfig(packageDir)
  updateRollupConfig(packageDir, config)
  updateVitestConfig(packageDir, config)
  updatePlaywrightConfig(packageDir, config)
  updateEslintConfig(packageDir, config)
  updatePackageScripts(packageDir)

  console.log(`✅ ${packageName} 配置标准化完成\n`)
}

/**
 * 标准化所有包
 */
export function standardizeAllPackages(): void {
  console.log('🚀 开始标准化所有包配置...\n')

  const packagesDir = path.resolve(__dirname, '../../../packages')
  const packages = fs.readdirSync(packagesDir).filter(name => {
    const packagePath = path.join(packagesDir, name)
    return (
      fs.statSync(packagePath).isDirectory() &&
      fs.existsSync(path.join(packagePath, 'package.json'))
    )
  })

  for (const packageName of packages) {
    try {
      standardizePackage(packageName)
    } catch (error) {
      console.error(`❌ 标准化 ${packageName} 失败:`, (error as Error).message)
    }
  }

  console.log('🎉 所有包配置标准化完成!')
}

// CLI 处理
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    standardizeAllPackages()
  } else {
    const packageName = args[0]
    if (packageConfigs[packageName]) {
      standardizePackage(packageName)
    } else {
      console.error(`❌ 未知的包名: ${packageName}`)
      console.log('可用的包:', Object.keys(packageConfigs).join(', '))
      process.exit(1)
    }
  }
}
