import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import process from 'node:process'

const rootDir = resolve(process.cwd())
const packagesDir = join(rootDir, 'packages')

// 包大小限制配置
const sizeLimits = {
  engine: '50 KB',
  color: '30 KB',
  crypto: '100 KB',
  device: '40 KB',
  http: '60 KB',
  i18n: '35 KB',
  router: '45 KB',
  store: '40 KB',
  template: '55 KB',
  form: '45 KB',
  watermark: '25 KB',
}

// 获取所有包目录
const packageDirs = readdirSync(packagesDir).filter((dir) => {
  try {
    const packageJsonPath = join(packagesDir, dir, 'package.json')
    readFileSync(packageJsonPath, 'utf-8')
    return true
  }
  catch {
    return false
  }
})

console.log('📏 开始添加 size-limit 配置...')

packageDirs.forEach((dir) => {
  const packagePath = join(packagesDir, dir)
  const packageJsonPath = join(packagePath, 'package.json')

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    const packageName = packageJson.name.replace('@ldesign/', '')

    // 添加 size-limit 配置
    packageJson['size-limit'] = [
      {
        path: 'dist/index.js',
        limit: sizeLimits[packageName] || '50 KB',
      },
    ]

    // 确保有 size-limit 依赖
    if (!packageJson.devDependencies['size-limit']) {
      packageJson.devDependencies['size-limit'] = '^11.0.0'
    }

    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
    console.log(`✅ 添加 size-limit: ${packageJson.name} (${sizeLimits[packageName] || '50 KB'})`)
  }
  catch (error) {
    console.error(`❌ 添加失败: ${dir}`, error.message)
  }
})

console.log('🎉 size-limit 配置添加完成!')
