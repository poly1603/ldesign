#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packagesDir = join(__dirname, '..', 'packages')

console.log('开始批量修复 UMD 构建配置...\n')

const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)

let updatedCount = 0

for (const pkgName of packages) {
  const configPath = join(packagesDir, pkgName, 'ldesign.config.ts')
  const packageJsonPath = join(packagesDir, pkgName, 'package.json')
  
  if (!existsSync(configPath)) {
    console.log(`⊘ 跳过 ${pkgName} - 没有 ldesign.config.ts`)
    continue
  }
  
  console.log(`处理 ${pkgName}...`)
  let hasUpdates = false
  
  // 修改 ldesign.config.ts
  try {
    let config = readFileSync(configPath, 'utf-8')
    
    // 检查是否包含 umd 格式
    if (config.includes("'umd'") || config.includes('"umd"')) {
      // 从 format 数组中移除 umd
      config = config.replace(/format:\s*\[(.*?)\]/s, (match, formats) => {
        const newFormats = formats
          .replace(/'umd',?\s*/g, '')
          .replace(/"umd",?\s*/g, '')
          .replace(/,\s*,/g, ',')
          .replace(/\[\s*,/g, '[')
          .replace(/,\s*\]/g, ']')
        return `format: [${newFormats}]`
      })
      
      // 添加 umd.enabled = false
      if (config.includes('umd:')) {
        // 如果已有 umd 配置，添加 enabled: false
        if (!config.includes('enabled: false')) {
          config = config.replace(
            /umd:\s*\{/,
            'umd: {\n      enabled: false,'
          )
        }
      } else {
        // 在 output 配置末尾添加 umd 配置
        config = config.replace(
          /(output:\s*\{[^}]*)(,?\s*\})/s,
          '$1,\n    umd: {\n      enabled: false,\n    }$2'
        )
      }
      
      writeFileSync(configPath, config, 'utf-8')
      console.log(`  ✓ 更新了 ldesign.config.ts`)
      hasUpdates = true
    }
  } catch (err) {
    console.log(`  ✗ 更新 ldesign.config.ts 失败: ${err.message}`)
  }
  
  // 修改 package.json
  if (existsSync(packageJsonPath)) {
    try {
      const pkgJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      if (pkgJson.scripts && pkgJson.scripts.build) {
        const buildScript = pkgJson.scripts.build
        
        // 检查 build 脚本中是否包含 umd
        if (buildScript.includes('umd')) {
          pkgJson.scripts.build = buildScript
            .replace(/,?umd,?/g, ',')
            .replace(/,,/g, ',')
            .replace(/-f\s+,/g, '-f ')
            .replace(/,\s*-f/g, ' -f')
            .replace(/-f\s+-f/g, '-f')
          
          writeFileSync(packageJsonPath, JSON.stringify(pkgJson, null, 2) + '\n', 'utf-8')
          console.log(`  ✓ 更新了 package.json`)
          hasUpdates = true
        }
      }
    } catch (err) {
      console.log(`  ✗ 更新 package.json 失败: ${err.message}`)
    }
  }
  
  if (hasUpdates) {
    updatedCount++
    console.log(`  ✓ ${pkgName} 更新完成\n`)
  } else {
    console.log(`  - ${pkgName} 无需更新\n`)
  }
}

console.log(`\n完成！共更新了 ${updatedCount} 个包的 UMD 构建配置。`)
