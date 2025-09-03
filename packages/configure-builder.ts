/**
 * 批量配置所有包使用 @ldesign/builder 打包
 * 为每个包创建统一的打包配置和脚本
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

// 需要配置的包列表（排除 kit、builder、launcher）
const PACKAGES_TO_CONFIGURE = [
  'api', 'cache', 'color', 'component', 'component-vue',
  'crypto', 'device', 'engine', 'form', 'git', 'http',
  'i18n', 'pdf', 'qrcode', 'router', 'shared', 'size',
  'store', 'template', 'theme', 'watermark'
]

/**
 * 为单个包创建打包配置
 */
async function configurePackage(packageName: string): Promise<void> {
  const packageDir = join(process.cwd(), packageName)
  const packageJsonPath = join(packageDir, 'package.json')
  
  console.log(`🔧 配置包: ${packageName}`)

  if (!existsSync(packageJsonPath)) {
    console.warn(`⚠️ 包 ${packageName} 的 package.json 不存在，跳过`)
    return
  }

  try {
    // 1. 读取现有的 package.json
    const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    // 2. 更新 devDependencies，确保包含 @ldesign/builder
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.devDependencies['@ldesign/builder'] = 'workspace:*'

    // 3. 更新构建脚本
    pkg.scripts = pkg.scripts || {}
    pkg.scripts.build = 'node -e "const { build } = require(\'@ldesign/builder\'); build()"'
    pkg.scripts['build:dev'] = 'node -e "const { build } = require(\'@ldesign/builder\'); build({ minify: false })"'
    
    // 如果没有测试脚本，添加 vitest
    if (!pkg.scripts.test) {
      pkg.scripts.test = 'vitest'
      pkg.scripts['test:run'] = 'vitest run'
      pkg.scripts['test:coverage'] = 'vitest run --coverage'
    }

    // 4. 标准化导出配置
    pkg.exports = {
      ".": {
        "types": "./dist/types/index.d.ts",
        "import": "./dist/esm/index.js", 
        "require": "./dist/cjs/index.cjs"
      }
    }

    // 如果包含 vue 相关内容，添加 vue 导出
    if (packageName.includes('vue') || packageName === 'component') {
      pkg.exports["./vue"] = {
        "types": "./dist/types/vue/index.d.ts",
        "import": "./dist/esm/vue/index.js",
        "require": "./dist/cjs/vue/index.cjs"
      }
    }

    pkg.main = "dist/cjs/index.cjs"
    pkg.module = "dist/esm/index.js"
    pkg.types = "dist/types/index.d.ts"

    // 5. 更新 files 字段
    pkg.files = [
      "README.md",
      "CHANGELOG.md",
      "dist"
    ]

    // 6. 写回 package.json
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\r\n')

    // 7. 创建 ldesign-builder 配置文件
    await createBuilderConfig(packageDir, packageName)

    console.log(`✅ ${packageName} 配置完成`)

  } catch (error) {
    console.error(`❌ 配置包 ${packageName} 失败:`, error)
  }
}

/**
 * 创建 ldesign-builder 配置文件
 */
async function createBuilderConfig(packageDir: string, packageName: string): Promise<void> {
  const configPath = join(packageDir, 'ldesign.config.js')
  
  // 检测项目特征
  const srcDir = join(packageDir, 'src')
  const hasVue = await hasFiles(srcDir, '**/*.vue')
  const hasReact = await hasFiles(srcDir, '**/*.{jsx,tsx}')
  const hasLess = await hasFiles(srcDir, '**/*.less')
  const hasSass = await hasFiles(srcDir, '**/*.{scss,sass}')

  let formats = ['esm', 'cjs']
  
  // 组件库通常需要 UMD 格式
  if (packageName.includes('component') || packageName.includes('vue')) {
    formats.push('umd')
  }

  const configContent = `/**
| * ${packageName} 打包配置  
| * 使用 @ldesign/builder 进行零配置打包
| */

const { SimpleBuilder } = require('@ldesign/builder')

// 定义打包配置
module.exports = {
  // 输入和输出配置
  src: 'src',
  outDir: 'dist',
  
  // 输出格式
  formats: ${JSON.stringify(formats)},
  
  // 构建选项
  sourcemap: true,
  minify: true,
  clean: true,
  
  // 外部依赖（不打包到最终产物中）
  external: [
    'vue',
    'react', 
    'react-dom',
    '@ldesign/shared',
    '@ldesign/utils'
  ],
  
  // UMD 格式的全局变量映射
  globals: {
    'vue': 'Vue',
    'react': 'React',
    'react-dom': 'ReactDOM'
  }
}
`

  writeFileSync(configPath, configContent)
  console.log(`📄 为 ${packageName} 创建了 ldesign.config.ts`)
}

/**
 * 检查目录中是否有匹配的文件
 */
async function hasFiles(dir: string, pattern: string): Promise<boolean> {
  if (!existsSync(dir)) return false
  
  try {
    const files = await glob(pattern, { cwd: dir })
    return files.length > 0
  } catch {
    return false
  }
}

/**
 * 主函数 - 配置所有包
 */
async function main(): Promise<void> {
  console.log('🚀 开始批量配置所有包使用 @ldesign/builder...')
  console.log(`📦 需要配置的包数量: ${PACKAGES_TO_CONFIGURE.length}`)
  
  let successCount = 0
  let failedCount = 0

  for (const packageName of PACKAGES_TO_CONFIGURE) {
    try {
      await configurePackage(packageName)
      successCount++
    } catch (error) {
      console.error(`❌ 配置 ${packageName} 失败:`, error)
      failedCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 配置结果汇总')
  console.log('='.repeat(50))
  console.log(`✅ 成功: ${successCount} 个包`)
  console.log(`❌ 失败: ${failedCount} 个包`)
  console.log(`📦 总计: ${PACKAGES_TO_CONFIGURE.length} 个包`)

  if (failedCount === 0) {
    console.log('\n🎉 所有包配置完成！')
    console.log('\n下一步可以运行批量打包命令测试所有包：')
    console.log('pnpm run build:all')
  }
}

// 执行配置
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { configurePackage, PACKAGES_TO_CONFIGURE }
