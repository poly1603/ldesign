/**
 * 回滚脚本: 将所有 @ldesign/core 依赖恢复为 @ldesign/engine-core
 */

import fs from 'fs-extra'
import path from 'path'
import { glob } from 'glob'

interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  [key: string]: any
}

async function updatePackageJson(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const pkg: PackageJson = JSON.parse(content)
    
    let modified = false
    
    // 跳过 packages/core 自己的 package.json
    if (pkg.name === '@ldesign/core') {
      return false
    }
    
    // 跳过 packages/engine/packages/core 的 package.json
    if (pkg.name === '@ldesign/engine-core') {
      return false
    }
    
    // 如果有 @ldesign/core 依赖,添加 @ldesign/engine-core
    if (pkg.dependencies?.['@ldesign/core']) {
      if (!pkg.dependencies['@ldesign/engine-core']) {
        pkg.dependencies['@ldesign/engine-core'] = 'workspace:*'
        modified = true
        console.log(`  ✓ 添加 @ldesign/engine-core 到 dependencies`)
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
      return true
    }
    
    return false
  } catch (error) {
    console.error(`  ❌ 更新失败: ${error}`)
    return false
  }
}

async function updateSourceFiles(dir: string): Promise<number> {
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    cwd: dir,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/es/**', '**/lib/**']
  })
  
  let count = 0
  
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8')
      
      // 只替换从 @ldesign/core 导入的,但保留 packages/core 内部的导入
      // 检查文件是否在 packages/core 目录下
      const isInCorePackage = file.includes('packages\\core\\') || file.includes('packages/core/')
      
      if (isInCorePackage) {
        // packages/core 内部文件不需要修改
        continue
      }
      
      // 替换导入语句: @ldesign/core -> @ldesign/engine-core
      const newContent = content.replace(
        /@ldesign\/core(?!\/)/g,  // 使用负向前瞻,避免替换 @ldesign/core/xxx
        '@ldesign/engine-core'
      )
      
      if (newContent !== content) {
        await fs.writeFile(file, newContent, 'utf-8')
        count++
        console.log(`  ✓ 回滚导入: ${path.relative(process.cwd(), file)}`)
      }
    } catch (error) {
      console.error(`  ❌ 更新文件失败 ${file}: ${error}`)
    }
  }
  
  return count
}

async function main() {
  console.log('🔄 开始回滚迁移: @ldesign/core -> @ldesign/engine-core\n')
  
  // 1. 更新所有 package.json
  console.log('📦 步骤 1: 回滚 package.json 文件...\n')
  
  const packageJsonFiles = await glob('**/package.json', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/es/**', '**/lib/**']
  })
  
  let updatedPackages = 0
  
  for (const file of packageJsonFiles) {
    const relativePath = path.relative(process.cwd(), file)
    
    // 跳过根 package.json 和工具包
    if (relativePath === 'package.json' || file.includes('tools\\')) {
      continue
    }
    
    console.log(`📄 ${relativePath}`)
    const updated = await updatePackageJson(file)
    if (updated) {
      updatedPackages++
    }
    console.log()
  }
  
  console.log(`✅ 更新了 ${updatedPackages} 个 package.json 文件\n`)
  
  // 2. 更新源代码中的导入
  console.log('📝 步骤 2: 回滚源代码导入...\n')
  
  const dirs = [
    'packages/engine/packages',
    'apps',
    'examples'
  ]
  
  let totalFiles = 0
  
  for (const dir of dirs) {
    const dirPath = path.join(process.cwd(), dir)
    if (await fs.pathExists(dirPath)) {
      console.log(`📁 ${dir}`)
      const count = await updateSourceFiles(dirPath)
      totalFiles += count
      console.log()
    }
  }
  
  console.log(`✅ 更新了 ${totalFiles} 个源代码文件\n`)
  
  console.log('\n✨ 回滚完成!')
  console.log('\n📋 后续步骤:')
  console.log('  1. 运行 pnpm install 更新依赖')
  console.log('  2. 验证项目结构正确')
}

main().catch(console.error)

