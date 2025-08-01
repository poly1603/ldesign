#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 包配置映射
const packageConfigs = {
  'engine': {
    external: ['vue'],
    globalName: 'LDesignEngine',
    globals: { 'vue': 'Vue' },
    vue: true,
    setupFiles: ['tests/setup.ts'],
    webServer: { command: 'cd example && pnpm dev', port: 5173 }
  },
  'color': {
    external: ['vue', '@arco-design/color', 'chroma-js'],
    globalName: 'LDesignColor',
    globals: { 'vue': 'Vue', '@arco-design/color': 'ArcoColor', 'chroma-js': 'chroma' },
    vue: true,
    setupFiles: ['__tests__/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 }
  },
  'crypto': {
    external: ['vue', 'crypto-js', 'node-forge'],
    globalName: 'LDesignCrypto',
    globals: { 'vue': 'Vue', 'crypto-js': 'CryptoJS', 'node-forge': 'forge' },
    vue: true,
    setupFiles: ['test/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 }
  },
  'device': {
    external: ['vue'],
    globalName: 'LDesignDevice',
    globals: { 'vue': 'Vue' },
    vue: true,
    environment: 'happy-dom',
    webServer: { command: 'pnpm dev', port: 5173 }
  },
  'http': {
    external: ['vue', 'axios', 'alova'],
    globalName: 'LDesignHttp',
    globals: { 'vue': 'Vue', 'axios': 'axios', 'alova': 'alova' },
    vue: true,
    setupFiles: ['./tests/setup.ts'],
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 }
  },
  'i18n': {
    external: ['vue'],
    globalName: 'LDesignI18n',
    globals: { 'vue': 'Vue' },
    vue: true,
    webServer: { command: 'cd examples/vanilla && pnpm dev', port: 5173 }
  },
  'router': {
    external: ['vue'],
    globalName: 'LDesignRouter',
    globals: { 'vue': 'Vue' },
    vue: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    webServer: { command: 'cd examples/basic && pnpm dev', port: 5173 }
  },
  'store': {
    external: ['vue', 'pinia'],
    globalName: 'LDesignStore',
    globals: { 'vue': 'Vue', 'pinia': 'Pinia' },
    vue: true,
    setupFiles: ['./test/setup.ts'],
    webServer: { command: 'cd examples/basic && pnpm dev', port: 5173 }
  },
  'template': {
    external: ['vue'],
    globalName: 'LDesignTemplate',
    globals: { 'vue': 'Vue' },
    vue: true,
    setupFiles: ['./tests/setup.ts'],
    webServer: { command: 'cd examples/basic && pnpm dev', port: 3003 }
  }
}

/**
 * 标准化单个包的配置
 */
function standardizePackage(packageName) {
  const packageDir = path.resolve(__dirname, '../packages', packageName)
  const config = packageConfigs[packageName]
  
  if (!config) {
    console.warn(`⚠️  未找到 ${packageName} 的配置`)
    return
  }
  
  console.log(`🔧 标准化 ${packageName} 包配置...`)
  
  // 1. 更新 rollup.config.js
  updateRollupConfig(packageDir, config)
  
  // 2. 更新 vitest.config.ts
  updateVitestConfig(packageDir, config)
  
  // 3. 创建/更新 playwright.config.ts
  updatePlaywrightConfig(packageDir, config)
  
  // 4. 更新 package.json scripts
  updatePackageScripts(packageDir)
  
  console.log(`✅ ${packageName} 配置标准化完成`)
}

/**
 * 更新 Rollup 配置
 */
function updateRollupConfig(packageDir, config) {
  const rollupConfigPath = path.join(packageDir, 'rollup.config.js')
  
  const content = `import { createRollupConfig } from '../../tools/rollup.config.base.js'

export default createRollupConfig({
  external: ${JSON.stringify(config.external)},
  globalName: '${config.globalName}',
  globals: ${JSON.stringify(config.globals, null, 2)},
  vue: ${config.vue}
})
`
  
  fs.writeFileSync(rollupConfigPath, content)
}

/**
 * 更新 Vitest 配置
 */
function updateVitestConfig(packageDir, config) {
  const vitestConfigPath = path.join(packageDir, 'vitest.config.ts')
  
  const options = []
  if (config.vue) options.push(`vue: true`)
  if (config.environment) options.push(`environment: '${config.environment}'`)
  if (config.setupFiles) options.push(`setupFiles: ${JSON.stringify(config.setupFiles)}`)
  
  const content = `import { createVitestConfig } from '../../tools/vitest.config.base'

export default createVitestConfig({
  ${options.join(',\n  ')}
})
`
  
  fs.writeFileSync(vitestConfigPath, content)
}

/**
 * 更新 Playwright 配置
 */
function updatePlaywrightConfig(packageDir, config) {
  const playwrightConfigPath = path.join(packageDir, 'playwright.config.ts')
  
  let content = `import { createPlaywrightConfig } from '../../tools/playwright.config.base'

export default createPlaywrightConfig({`

  if (config.webServer) {
    content += `
  webServer: {
    command: '${config.webServer.command}',
    port: ${config.webServer.port}
  }`
  }

  content += `
})
`
  
  fs.writeFileSync(playwrightConfigPath, content)
}

/**
 * 更新 package.json scripts
 */
function updatePackageScripts(packageDir) {
  const packageJsonPath = path.join(packageDir, 'package.json')
  
  if (!fs.existsSync(packageJsonPath)) {
    return
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  
  // 标准化 scripts
  const standardScripts = {
    "build": "rollup -c",
    "build:watch": "rollup -c -w",
    "dev": "rollup -c -w",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "docs:dev": "vitepress dev docs",
    "docs:build": "vitepress build docs",
    "docs:preview": "vitepress preview docs",
    "clean": "rimraf dist es lib types coverage .nyc_output",
    "size-check": "size-limit",
    "prepublishOnly": "pnpm run clean && pnpm run build && pnpm run test:run"
  }
  
  // 合并现有脚本和标准脚本
  packageJson.scripts = {
    ...packageJson.scripts,
    ...standardScripts
  }
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
}

/**
 * 标准化所有包
 */
function standardizeAllPackages() {
  console.log('🚀 开始标准化所有包配置...\n')
  
  const packagesDir = path.resolve(__dirname, '../packages')
  const packages = fs.readdirSync(packagesDir).filter(name => {
    const packagePath = path.join(packagesDir, name)
    return fs.statSync(packagePath).isDirectory() && fs.existsSync(path.join(packagePath, 'package.json'))
  })
  
  for (const packageName of packages) {
    try {
      standardizePackage(packageName)
    } catch (error) {
      console.error(`❌ 标准化 ${packageName} 失败:`, error.message)
    }
  }
  
  console.log('\n🎉 所有包配置标准化完成!')
}

// CLI 处理
if (import.meta.url === `file://${process.argv[1]}`) {
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

export { standardizePackage, standardizeAllPackages }
