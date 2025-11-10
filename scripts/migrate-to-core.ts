/**
 * 迁移脚本: 将所有 @ldesign/engine-core 依赖替换为 @ldesign/core
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
    
    // 移除 dependencies 中的 @ldesign/engine-core
    if (pkg.dependencies?.['@ldesign/engine-core']) {
      delete pkg.dependencies['@ldesign/engine-core']
      modified = true
      console.log(`  ✓ 移除 dependencies 中的 @ldesign/engine-core`)
    }
    
    // 移除 devDependencies 中的 @ldesign/engine-core
    if (pkg.devDependencies?.['@ldesign/engine-core']) {
      delete pkg.devDependencies['@ldesign/engine-core']
      modified = true
      console.log(`  ✓ 移除 devDependencies 中的 @ldesign/engine-core`)
    }
    
    // 移除 peerDependencies 中的 @ldesign/engine-core
    if (pkg.peerDependencies?.['@ldesign/engine-core']) {
      delete pkg.peerDependencies['@ldesign/engine-core']
      modified = true
      console.log(`  ✓ 移除 peerDependencies 中的 @ldesign/engine-core`)
    }
    
    // 确保有 @ldesign/core 依赖
    if (modified) {
      if (!pkg.dependencies) {
        pkg.dependencies = {}
      }
      if (!pkg.dependencies['@ldesign/core']) {
        pkg.dependencies['@ldesign/core'] = 'workspace:*'
        console.log(`  ✓ 添加 @ldesign/core 到 dependencies`)
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
      
      // 替换导入语句
      const newContent = content.replace(
        /@ldesign\/engine-core/g,
        '@ldesign/core'
      )
      
      if (newContent !== content) {
        await fs.writeFile(file, newContent, 'utf-8')
        count++
        console.log(`  ✓ 更新导入: ${path.relative(process.cwd(), file)}`)
      }
    } catch (error) {
      console.error(`  ❌ 更新文件失败 ${file}: ${error}`)
    }
  }
  
  return count
}

async function main() {
  console.log('🚀 开始迁移 @ldesign/engine-core -> @ldesign/core\n')
  
  // 1. 更新所有 package.json
  console.log('📦 步骤 1: 更新 package.json 文件...\n')
  
  const packageJsonFiles = await glob('**/package.json', {
    cwd: process.cwd(),
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/es/**', '**/lib/**']
  })
  
  let updatedPackages = 0
  
  for (const file of packageJsonFiles) {
    const relativePath = path.relative(process.cwd(), file)
    
    // 跳过 engine-core 自己的 package.json
    if (file.includes('packages/engine/packages/core/package.json')) {
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
  console.log('📝 步骤 2: 更新源代码导入...\n')
  
  const dirs = [
    'packages/engine/packages',
    'apps'
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
  
  // 3. 更新 packages/engine/package.json
  console.log('📦 步骤 3: 更新 packages/engine/package.json...\n')
  
  const enginePkgPath = path.join(process.cwd(), 'packages/engine/package.json')
  if (await fs.pathExists(enginePkgPath)) {
    const pkg = await fs.readJson(enginePkgPath)
    
    if (pkg.dependencies?.['@ldesign/engine-core']) {
      delete pkg.dependencies['@ldesign/engine-core']
      await fs.writeJson(enginePkgPath, pkg, { spaces: 2 })
      console.log('  ✓ 移除 @ldesign/engine-core 依赖')
    }
  }
  
  console.log('\n✨ 迁移完成!')
  console.log('\n📋 后续步骤:')
  console.log('  1. 删除 packages/engine/packages/core 目录')
  console.log('  2. 运行 pnpm install 更新依赖')
  console.log('  3. 运行 pnpm build 验证构建')
}

main().catch(console.error)

