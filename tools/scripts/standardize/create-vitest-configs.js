import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

const rootDir = resolve(process.cwd())
const packagesDir = join(rootDir, 'packages')

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

console.log('🧪 开始创建 Vitest 配置...')

const vitestConfig = `import { createVitestConfig } from '../../tools/configs/vitest.base.config.ts'

export default createVitestConfig(process.cwd())
`

packageDirs.forEach(dir => {
  const packagePath = join(packagesDir, dir)
  const vitestConfigPath = join(packagePath, 'vitest.config.ts')

  try {
    writeFileSync(vitestConfigPath, vitestConfig)
    console.log(`✅ 创建 Vitest 配置: ${dir}`)
  } catch (error) {
    console.error(`❌ 创建失败: ${dir}`, error.message)
  }
})

console.log('🎉 Vitest 配置创建完成!')
