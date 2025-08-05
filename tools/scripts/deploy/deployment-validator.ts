#!/usr/bin/env tsx

/**
 * 部署验证工具
 * 验证部署后的包是否正常工作
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import chalk from 'chalk'

interface ValidationResult {
  success: boolean
  message: string
  details?: any
}

interface PackageInfo {
  name: string
  version: string
  main?: string
  module?: string
  types?: string
}

class DeploymentValidator {
  private rootDir: string
  private results: Map<string, ValidationResult[]> = new Map()

  constructor() {
    this.rootDir = resolve(process.cwd())
  }

  /**
   * 验证所有包的部署
   */
  async validateAll(): Promise<boolean> {
    console.log(chalk.blue('🔍 开始部署验证...\n'))

    const packages = this.getPackages()
    let allValid = true

    for (const pkg of packages) {
      console.log(chalk.yellow(`验证包: ${pkg.name}`))
      const isValid = await this.validatePackage(pkg)
      
      if (!isValid) {
        allValid = false
      }
      
      console.log() // 空行分隔
    }

    this.printSummary()
    return allValid
  }

  /**
   * 验证单个包
   */
  async validatePackage(pkg: PackageInfo): Promise<boolean> {
    const results: ValidationResult[] = []

    // 1. 验证构建产物
    results.push(await this.validateBuildArtifacts(pkg))

    // 2. 验证包结构
    results.push(await this.validatePackageStructure(pkg))

    // 3. 验证类型定义
    results.push(await this.validateTypeDefinitions(pkg))

    // 4. 验证包可加载性
    results.push(await this.validatePackageLoadability(pkg))

    // 5. 验证 npm 发布状态
    results.push(await this.validateNpmPublication(pkg))

    // 6. 验证 CDN 可用性
    results.push(await this.validateCdnAvailability(pkg))

    this.results.set(pkg.name, results)

    const allValid = results.every(r => r.success)
    const icon = allValid ? '✅' : '❌'
    console.log(`  ${icon} ${pkg.name} - ${allValid ? '验证通过' : '验证失败'}`)

    // 显示失败的验证项
    const failures = results.filter(r => !r.success)
    if (failures.length > 0) {
      failures.forEach(failure => {
        console.log(chalk.red(`    ❌ ${failure.message}`))
      })
    }

    return allValid
  }

  /**
   * 验证构建产物
   */
  private async validateBuildArtifacts(pkg: PackageInfo): Promise<ValidationResult> {
    const packageDir = join(this.rootDir, 'packages', pkg.name.replace('@ldesign/', ''))
    const distDir = join(packageDir, 'dist')

    if (!existsSync(distDir)) {
      return {
        success: false,
        message: '构建产物目录不存在'
      }
    }

    const requiredFiles = ['index.js']
    if (pkg.types) {
      requiredFiles.push('index.d.ts')
    }

    for (const file of requiredFiles) {
      const filePath = join(distDir, file)
      if (!existsSync(filePath)) {
        return {
          success: false,
          message: `缺少必需文件: ${file}`
        }
      }
    }

    return {
      success: true,
      message: '构建产物验证通过'
    }
  }

  /**
   * 验证包结构
   */
  private async validatePackageStructure(pkg: PackageInfo): Promise<ValidationResult> {
    const packageDir = join(this.rootDir, 'packages', pkg.name.replace('@ldesign/', ''))
    const packageJsonPath = join(packageDir, 'package.json')

    if (!existsSync(packageJsonPath)) {
      return {
        success: false,
        message: 'package.json 不存在'
      }
    }

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      
      // 检查必需字段
      const requiredFields = ['name', 'version', 'main', 'module', 'types']
      const missingFields = requiredFields.filter(field => !packageJson[field])
      
      if (missingFields.length > 0) {
        return {
          success: false,
          message: `缺少必需字段: ${missingFields.join(', ')}`
        }
      }

      // 检查文件是否存在
      const files = [packageJson.main, packageJson.module, packageJson.types]
      for (const file of files) {
        if (file && !existsSync(join(packageDir, file))) {
          return {
            success: false,
            message: `引用的文件不存在: ${file}`
          }
        }
      }

      return {
        success: true,
        message: '包结构验证通过'
      }
    } catch (error) {
      return {
        success: false,
        message: `package.json 解析失败: ${error}`
      }
    }
  }

  /**
   * 验证类型定义
   */
  private async validateTypeDefinitions(pkg: PackageInfo): Promise<ValidationResult> {
    if (!pkg.types) {
      return {
        success: true,
        message: '无类型定义文件，跳过验证'
      }
    }

    const packageDir = join(this.rootDir, 'packages', pkg.name.replace('@ldesign/', ''))
    const typesPath = join(packageDir, pkg.types)

    if (!existsSync(typesPath)) {
      return {
        success: false,
        message: '类型定义文件不存在'
      }
    }

    try {
      // 简单的类型定义语法检查
      const content = readFileSync(typesPath, 'utf-8')
      
      if (!content.includes('export') && !content.includes('declare')) {
        return {
          success: false,
          message: '类型定义文件似乎无效'
        }
      }

      return {
        success: true,
        message: '类型定义验证通过'
      }
    } catch (error) {
      return {
        success: false,
        message: `类型定义验证失败: ${error}`
      }
    }
  }

  /**
   * 验证包可加载性
   */
  private async validatePackageLoadability(pkg: PackageInfo): Promise<ValidationResult> {
    const packageDir = join(this.rootDir, 'packages', pkg.name.replace('@ldesign/', ''))
    
    try {
      // 尝试加载包
      const mainPath = join(packageDir, pkg.main || 'dist/index.js')
      
      if (!existsSync(mainPath)) {
        return {
          success: false,
          message: '主入口文件不存在'
        }
      }

      // 在子进程中测试加载
      execSync(`node -e "require('${mainPath}')"`, { 
        stdio: 'pipe',
        timeout: 10000 
      })

      return {
        success: true,
        message: '包加载验证通过'
      }
    } catch (error) {
      return {
        success: false,
        message: `包加载失败: ${error}`
      }
    }
  }

  /**
   * 验证 npm 发布状态
   */
  private async validateNpmPublication(pkg: PackageInfo): Promise<ValidationResult> {
    try {
      const result = execSync(`npm view ${pkg.name}@${pkg.version} version`, { 
        stdio: 'pipe',
        encoding: 'utf-8',
        timeout: 10000 
      })

      if (result.trim() === pkg.version) {
        return {
          success: true,
          message: 'npm 发布验证通过'
        }
      } else {
        return {
          success: false,
          message: 'npm 上的版本不匹配'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `npm 发布验证失败: ${error}`
      }
    }
  }

  /**
   * 验证 CDN 可用性
   */
  private async validateCdnAvailability(pkg: PackageInfo): Promise<ValidationResult> {
    const cdnUrls = [
      `https://cdn.jsdelivr.net/npm/${pkg.name}@${pkg.version}/dist/index.js`,
      `https://unpkg.com/${pkg.name}@${pkg.version}/dist/index.js`
    ]

    try {
      for (const url of cdnUrls) {
        const response = await fetch(url, { method: 'HEAD' })
        if (!response.ok) {
          return {
            success: false,
            message: `CDN 不可用: ${url}`
          }
        }
      }

      return {
        success: true,
        message: 'CDN 可用性验证通过'
      }
    } catch (error) {
      return {
        success: false,
        message: `CDN 验证失败: ${error}`
      }
    }
  }

  /**
   * 获取所有包信息
   */
  private getPackages(): PackageInfo[] {
    const packagesDir = join(this.rootDir, 'packages')
    const packages: PackageInfo[] = []

    try {
      const dirs = execSync('ls', { cwd: packagesDir, encoding: 'utf-8' })
        .trim()
        .split('\n')

      for (const dir of dirs) {
        const packageJsonPath = join(packagesDir, dir, 'package.json')
        
        if (existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
            packages.push({
              name: packageJson.name,
              version: packageJson.version,
              main: packageJson.main,
              module: packageJson.module,
              types: packageJson.types
            })
          } catch (error) {
            console.warn(chalk.yellow(`警告: 无法解析 ${dir}/package.json`))
          }
        }
      }
    } catch (error) {
      console.error(chalk.red('获取包列表失败:'), error)
    }

    return packages
  }

  /**
   * 打印验证摘要
   */
  private printSummary() {
    console.log(chalk.blue('\n📊 验证摘要'))
    console.log(chalk.blue('='.repeat(50)))

    let totalPackages = 0
    let validPackages = 0
    let totalChecks = 0
    let passedChecks = 0

    for (const [packageName, results] of this.results) {
      totalPackages++
      totalChecks += results.length
      
      const packageValid = results.every(r => r.success)
      if (packageValid) {
        validPackages++
      }
      
      passedChecks += results.filter(r => r.success).length

      const icon = packageValid ? '✅' : '❌'
      console.log(`${icon} ${packageName}: ${results.filter(r => r.success).length}/${results.length} 检查通过`)
    }

    console.log(chalk.blue('\n总体统计:'))
    console.log(`  包: ${validPackages}/${totalPackages} 通过`)
    console.log(`  检查: ${passedChecks}/${totalChecks} 通过`)
    console.log(`  成功率: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`)

    if (validPackages === totalPackages) {
      console.log(chalk.green('\n🎉 所有包验证通过！'))
    } else {
      console.log(chalk.red('\n❌ 部分包验证失败，请检查上述错误'))
    }
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2)
  const packageName = args[0]

  const validator = new DeploymentValidator()

  if (packageName && packageName !== 'all') {
    // 验证单个包
    const packages = validator['getPackages']()
    const pkg = packages.find(p => p.name.includes(packageName))
    
    if (!pkg) {
      console.error(chalk.red(`❌ 包不存在: ${packageName}`))
      process.exit(1)
    }

    const isValid = await validator.validatePackage(pkg)
    process.exit(isValid ? 0 : 1)
  } else {
    // 验证所有包
    const allValid = await validator.validateAll()
    process.exit(allValid ? 0 : 1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { DeploymentValidator }
