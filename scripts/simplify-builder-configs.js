import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * 简化的 builder.config.ts 模板
 */
const SIMPLIFIED_CONFIG = `import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  // 生成类型声明文件
  dts: true,

  // 生成 source map
  sourcemap: true,

  // 清理输出目录
  clean: true,

  // 不压缩代码（开发阶段）
  minify: false

  // external、globals、libraryType、formats、plugins 等配置将由 @ldesign/builder 自动检测和生成
})
`

/**
 * 简化包的 builder 配置
 */
function simplifyPackageConfig(packageDir) {
  const configPath = path.join(packageDir, '.ldesign', 'builder.config.ts')
  
  if (!fs.existsSync(configPath)) {
    return { status: 'skip', reason: '配置文件不存在' }
  }

  try {
    // 备份原配置
    const backupPath = configPath + '.backup'
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(configPath, backupPath)
    }

    // 写入简化配置
    fs.writeFileSync(configPath, SIMPLIFIED_CONFIG, 'utf-8')
    
    return { status: 'success', reason: '配置已简化' }
  } catch (error) {
    return { status: 'error', reason: error.message }
  }
}

/**
 * 主函数
 */
function main() {
  const packagesDir = path.resolve(__dirname, '../packages')
  
  if (!fs.existsSync(packagesDir)) {
    console.error('❌ packages 目录不存在')
    process.exit(1)
  }

  console.log('🚀 开始简化所有包的 builder.config.ts 配置...\n')

  const packages = fs.readdirSync(packagesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

  const results = {
    success: [],
    skip: [],
    error: []
  }

  packages.forEach(packageName => {
    const packageDir = path.join(packagesDir, packageName)
    const result = simplifyPackageConfig(packageDir)
    
    results[result.status].push({
      name: packageName,
      reason: result.reason
    })

    const statusIcon = {
      success: '✅',
      skip: '⏭️',
      error: '❌'
    }[result.status]

    console.log(`${statusIcon} ${packageName}: ${result.reason}`)
  })

  console.log('\n📊 处理结果汇总:')
  console.log(`✅ 成功简化: ${results.success.length} 个包`)
  console.log(`⏭️ 跳过: ${results.skip.length} 个包`)
  console.log(`❌ 失败: ${results.error.length} 个包`)

  if (results.success.length > 0) {
    console.log('\n✅ 成功简化的包:')
    results.success.forEach(pkg => console.log(`  - ${pkg.name}`))
  }

  if (results.skip.length > 0) {
    console.log('\n⏭️ 跳过的包:')
    results.skip.forEach(pkg => console.log(`  - ${pkg.name}: ${pkg.reason}`))
  }

  if (results.error.length > 0) {
    console.log('\n❌ 失败的包:')
    results.error.forEach(pkg => console.log(`  - ${pkg.name}: ${pkg.reason}`))
  }

  console.log('\n🎉 配置简化完成！')
  console.log('💡 提示: 原配置文件已备份为 .backup 文件')
}

// 如果直接运行此脚本
main()

export { simplifyPackageConfig, SIMPLIFIED_CONFIG }
