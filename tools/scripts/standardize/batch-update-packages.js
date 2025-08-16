import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

const rootDir = resolve(process.cwd())
const packagesDir = join(rootDir, 'packages')

// 标准化的开发依赖
const standardDevDependencies = {
  '@rollup/plugin-commonjs': '^25.0.7',
  '@rollup/plugin-node-resolve': '^15.2.3',
  '@rollup/plugin-typescript': '^11.1.6',
  '@types/node': '^22.0.0',
  '@vitejs/plugin-vue': '^5.0.3',
  '@vitest/ui': '^2.0.0',
  '@vue/test-utils': '^2.4.4',
  eslint: '^9.0.0',
  jsdom: '^24.0.0',
  rollup: '^4.9.6',
  'rollup-plugin-dts': '^6.1.0',
  typescript: '^5.6.0',
  vite: '^5.0.12',
  vitest: '^2.0.0',
  vue: '^3.4.15',
  'vue-tsc': '^1.8.27',
}

// 标准化的脚本
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
  clean: 'rimraf dist es lib types coverage .nyc_output',
  'size-check': 'size-limit',
  prepublishOnly: 'pnpm run clean && pnpm run build && pnpm run test:run',
}

// 获取所有包目录
const packageDirs = readdirSync(packagesDir).filter(dir => {
  try {
    const packageJsonPath = join(packagesDir, dir, 'package.json')
    readFileSync(packageJsonPath, 'utf-8')
    return true
  } catch {
    return false
  }
})

console.log('🚀 开始批量更新包配置...')

packageDirs.forEach(dir => {
  const packagePath = join(packagesDir, dir)
  const packageJsonPath = join(packagePath, 'package.json')

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    // 标准化基本信息
    packageJson.type = 'module'
    packageJson.author = 'ldesign'
    packageJson.license = 'MIT'

    // 标准化导出配置
    packageJson.exports = {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs',
      },
    }
    packageJson.main = 'dist/index.cjs'
    packageJson.module = 'dist/index.js'
    packageJson.types = 'dist/index.d.ts'
    packageJson.files = ['dist']

    // 标准化脚本
    packageJson.scripts = {
      ...standardScripts,
      // 保留一些特殊脚本
      ...(packageJson.scripts?.['docs:dev'] && {
        'docs:dev': packageJson.scripts['docs:dev'],
      }),
      ...(packageJson.scripts?.['docs:build'] && {
        'docs:build': packageJson.scripts['docs:build'],
      }),
      ...(packageJson.scripts?.['docs:preview'] && {
        'docs:preview': packageJson.scripts['docs:preview'],
      }),
    }

    // 标准化开发依赖
    packageJson.devDependencies = {
      ...standardDevDependencies,
      // 保留包特有的依赖
      ...(packageJson.dependencies?.['@types/chroma-js'] && {
        '@types/chroma-js': '^3.1.1',
      }),
      ...(packageJson.dependencies?.['@types/crypto-js'] && {
        '@types/crypto-js': '^4.2.2',
      }),
      ...(packageJson.dependencies?.['@types/node-forge'] && {
        '@types/node-forge': '^1.3.11',
      }),
      ...(packageJson.devDependencies?.['@playwright/test'] && {
        '@playwright/test': '^1.40.1',
      }),
    }

    // 标准化peer依赖
    if (!packageJson.peerDependencies) {
      packageJson.peerDependencies = {}
    }
    packageJson.peerDependencies.vue = '^3.3.0'

    // 添加可选的peer依赖元数据
    if (!packageJson.peerDependenciesMeta) {
      packageJson.peerDependenciesMeta = {}
    }
    packageJson.peerDependenciesMeta.vue = { optional: true }

    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
    console.log(`✅ 更新完成: ${packageJson.name}`)
  } catch (error) {
    console.error(`❌ 更新失败: ${dir}`, error.message)
  }
})

console.log('🎉 批量更新完成!')
