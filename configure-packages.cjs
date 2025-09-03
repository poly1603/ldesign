/**
 * 批量配置所有包使用 @ldesign/builder 打包
 * 为每个包创建统一的打包配置和脚本
 */

const fs = require('fs')
const path = require('path')

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
async function configurePackage(packageName) {
  const packageDir = path.join('packages', packageName)
  const packageJsonPath = path.join(packageDir, 'package.json')
  
  console.log(`🔧 配置包: ${packageName}`)

  if (!fs.existsSync(packageJsonPath)) {
    console.warn(`⚠️ 包 ${packageName} 的 package.json 不存在，跳过`)
    return
  }

  try {
    // 1. 读取现有的 package.json
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

    // 2. 更新 devDependencies，确保包含 @ldesign/builder
    pkg.devDependencies = pkg.devDependencies || {}
    pkg.devDependencies['@ldesign/builder'] = 'workspace:*'

    // 3. 更新构建脚本
    pkg.scripts = pkg.scripts || {}
    pkg.scripts.build = 'node scripts/build.js'
    pkg.scripts['build:dev'] = 'node scripts/build.js --dev'
    
    // 如果没有测试脚本，添加 vitest
    if (!pkg.scripts.test) {
      pkg.scripts.test = 'vitest'
      pkg.scripts['test:run'] = 'vitest run'
      pkg.scripts['test:coverage'] = 'vitest run --coverage'
    }

    // 4. 标准化导出配置
    pkg.exports = {
      ".": {
        "types": "./dist/index.d.ts",
        "import": "./dist/index.js", 
        "require": "./dist/index.cjs"
      }
    }

    // 如果包含 vue 相关内容，添加 vue 导出
    if (packageName.includes('vue') || packageName === 'component') {
      pkg.exports["./vue"] = {
        "types": "./dist/vue.d.ts",
        "import": "./dist/vue.js",
        "require": "./dist/vue.cjs"
      }
    }

    pkg.main = "dist/index.cjs"
    pkg.module = "dist/index.js"
    pkg.types = "dist/index.d.ts"

    // 5. 更新 files 字段
    pkg.files = [
      "README.md",
      "CHANGELOG.md",
      "dist"
    ]

    // 6. 写回 package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')

    // 7. 创建构建脚本
    await createBuildScript(packageDir, packageName)

    console.log(`✅ ${packageName} 配置完成`)

  } catch (error) {
    console.error(`❌ 配置包 ${packageName} 失败:`, error)
  }
}

/**
 * 创建构建脚本
 */
async function createBuildScript(packageDir, packageName) {
  const scriptsDir = path.join(packageDir, 'scripts')
  const scriptPath = path.join(scriptsDir, 'build.js')
  
  // 确保 scripts 目录存在
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true })
  }

  // 检测项目特征
  const srcDir = path.join(packageDir, 'src')
  const hasVue = fs.existsSync(srcDir) && fs.readdirSync(srcDir, { recursive: true }).some(f => f.endsWith('.vue'))
  const hasReact = fs.existsSync(srcDir) && fs.readdirSync(srcDir, { recursive: true }).some(f => f.endsWith('.jsx') || f.endsWith('.tsx'))
  
  let formats = ['esm', 'cjs']
  
  // 组件库通常需要 UMD 格式
  if (packageName.includes('component') || packageName.includes('vue')) {
    formats.push('umd')
  }

  const buildScriptContent = `/**
 * ${packageName} 构建脚本
 * 使用 @ldesign/builder 进行零配置打包
 */

const { SimpleBuilder } = require('@ldesign/builder')

async function build() {
  const isDev = process.argv.includes('--dev')
  
  const builder = new SimpleBuilder({
    root: process.cwd(),
    src: 'src',
    outDir: 'dist',
    formats: ${JSON.stringify(formats)},
    sourcemap: true,
    minify: !isDev,
    clean: true,
    external: [
      'vue',
      'react', 
      'react-dom',
      '@ldesign/shared',
      '@ldesign/utils'
    ],
    globals: {
      'vue': 'Vue',
      'react': 'React',
      'react-dom': 'ReactDOM'
    }
  })

  try {
    const result = await builder.build()
    if (result.success) {
      console.log(\`✅ \${process.cwd().split(path.sep).pop()} 构建成功！\`)
    } else {
      console.error(\`❌ 构建失败: \${result.errors?.join(', ')}\`)
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ 构建过程中发生错误:', error)
    process.exit(1)
  }
}

build().catch(console.error)
`

  fs.writeFileSync(scriptPath, buildScriptContent)
  console.log(`📄 为 ${packageName} 创建了 scripts/build.js`)
}

/**
 * 主函数 - 配置所有包
 */
async function main() {
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
main().catch(console.error)
