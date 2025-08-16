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

console.log('🔍 开始创建 ESLint 配置...')

const eslintConfig = `export { default } from '../../tools/configs/eslint.base.config.js'
`

packageDirs.forEach(dir => {
  const packagePath = join(packagesDir, dir)
  const eslintConfigPath = join(packagePath, 'eslint.config.js')

  try {
    writeFileSync(eslintConfigPath, eslintConfig)
    console.log(`✅ 创建 ESLint 配置: ${dir}`)
  } catch (error) {
    console.error(`❌ 创建失败: ${dir}`, error.message)
  }
})

console.log('🎉 ESLint 配置创建完成!')
