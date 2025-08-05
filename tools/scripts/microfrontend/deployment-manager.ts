#!/usr/bin/env tsx

/**
 * 微前端部署管理器
 * 支持包的独立部署和版本管理
 */

import { execSync, spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { packageConfigs } from '../configs/microfrontend/module-federation.config.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../../..')

interface DeploymentConfig {
  /** 部署环境 */
  environment: 'development' | 'staging' | 'production'
  /** 要部署的包 */
  packages: string[]
  /** 基础 URL */
  baseUrl: string
  /** CDN 配置 */
  cdn?: {
    provider: 'aws' | 'aliyun' | 'custom'
    bucket: string
    region?: string
    accessKey?: string
    secretKey?: string
  }
  /** 版本策略 */
  versionStrategy: 'auto' | 'manual' | 'timestamp'
  /** 是否并行部署 */
  parallel: boolean
}

interface DeploymentResult {
  package: string
  success: boolean
  version: string
  url: string
  error?: string
}

class MicrofrontendDeploymentManager {
  private config: DeploymentConfig
  private results: DeploymentResult[] = []

  constructor(config: DeploymentConfig) {
    this.config = config
  }

  /**
   * 部署所有包
   */
  async deployAll(): Promise<DeploymentResult[]> {
    console.log(chalk.blue('🚀 开始微前端部署...\n'))

    try {
      // 1. 预检查
      await this.preCheck()

      // 2. 构建包
      await this.buildPackages()

      // 3. 部署包
      if (this.config.parallel) {
        await this.deployPackagesParallel()
      } else {
        await this.deployPackagesSequential()
      }

      // 4. 更新注册表
      await this.updateRegistry()

      // 5. 验证部署
      await this.validateDeployment()

      console.log(chalk.green('\n✅ 微前端部署完成!'))
      this.printSummary()

      return this.results
    } catch (error) {
      console.error(chalk.red('❌ 部署失败:'), error)
      throw error
    }
  }

  /**
   * 部署单个包
   */
  async deployPackage(packageName: string): Promise<DeploymentResult> {
    console.log(chalk.yellow(`📦 部署包: ${packageName}`))

    try {
      // 1. 检查包配置
      if (!packageConfigs[packageName]) {
        throw new Error(`包配置不存在: ${packageName}`)
      }

      // 2. 构建包
      await this.buildSinglePackage(packageName)

      // 3. 生成版本号
      const version = this.generateVersion(packageName)

      // 4. 上传文件
      const url = await this.uploadPackage(packageName, version)

      // 5. 更新包注册表
      await this.updatePackageRegistry(packageName, version, url)

      const result: DeploymentResult = {
        package: packageName,
        success: true,
        version,
        url,
      }

      this.results.push(result)
      console.log(chalk.green(`✅ ${packageName} 部署成功: ${url}`))

      return result
    } catch (error) {
      const result: DeploymentResult = {
        package: packageName,
        success: false,
        version: '',
        url: '',
        error: error instanceof Error ? error.message : String(error),
      }

      this.results.push(result)
      console.error(chalk.red(`❌ ${packageName} 部署失败:`, error))

      return result
    }
  }

  /**
   * 预检查
   */
  private async preCheck() {
    console.log(chalk.yellow('🔍 执行预检查...'))

    // 检查包是否存在
    for (const pkg of this.config.packages) {
      const packageDir = join(rootDir, 'packages', pkg)
      if (!existsSync(packageDir)) {
        throw new Error(`包不存在: ${pkg}`)
      }
    }

    // 检查构建工具
    try {
      execSync('pnpm --version', { stdio: 'pipe' })
    } catch {
      throw new Error('pnpm 未安装')
    }

    console.log(chalk.green('✅ 预检查通过'))
  }

  /**
   * 构建所有包
   */
  private async buildPackages() {
    console.log(chalk.yellow('🏗️ 构建包...'))

    const packageList = this.config.packages.join(' ')
    execSync(`pnpm build:packages --filter "{${packageList}}"`, {
      stdio: 'inherit',
      cwd: rootDir,
    })

    console.log(chalk.green('✅ 包构建完成'))
  }

  /**
   * 构建单个包
   */
  private async buildSinglePackage(packageName: string) {
    const packageDir = join(rootDir, 'packages', packageName)
    
    execSync('pnpm build', {
      stdio: 'inherit',
      cwd: packageDir,
    })
  }

  /**
   * 并行部署包
   */
  private async deployPackagesParallel() {
    console.log(chalk.yellow('🚀 并行部署包...'))

    const promises = this.config.packages.map(pkg => this.deployPackage(pkg))
    await Promise.allSettled(promises)
  }

  /**
   * 顺序部署包
   */
  private async deployPackagesSequential() {
    console.log(chalk.yellow('🚀 顺序部署包...'))

    for (const pkg of this.config.packages) {
      await this.deployPackage(pkg)
    }
  }

  /**
   * 生成版本号
   */
  private generateVersion(packageName: string): string {
    switch (this.config.versionStrategy) {
      case 'auto': {
        const packageJsonPath = join(rootDir, 'packages', packageName, 'package.json')
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
        return packageJson.version
      }
      case 'timestamp':
        return new Date().toISOString().replace(/[:.]/g, '-')
      case 'manual':
        return process.env.DEPLOY_VERSION || '1.0.0'
      default:
        return '1.0.0'
    }
  }

  /**
   * 上传包文件
   */
  private async uploadPackage(packageName: string, version: string): Promise<string> {
    const packageDir = join(rootDir, 'packages', packageName)
    const distDir = join(packageDir, 'dist')

    if (!existsSync(distDir)) {
      throw new Error(`构建产物不存在: ${packageName}/dist`)
    }

    // 根据 CDN 配置选择上传方式
    if (this.config.cdn) {
      return this.uploadToCDN(packageName, version, distDir)
    } else {
      return this.uploadToServer(packageName, version, distDir)
    }
  }

  /**
   * 上传到 CDN
   */
  private async uploadToCDN(packageName: string, version: string, distDir: string): Promise<string> {
    const { provider, bucket, region } = this.config.cdn!

    switch (provider) {
      case 'aws':
        return this.uploadToAWS(packageName, version, distDir, bucket, region)
      case 'aliyun':
        return this.uploadToAliyun(packageName, version, distDir, bucket, region)
      case 'custom':
        return this.uploadToCustomCDN(packageName, version, distDir)
      default:
        throw new Error(`不支持的 CDN 提供商: ${provider}`)
    }
  }

  /**
   * 上传到服务器
   */
  private async uploadToServer(packageName: string, version: string, distDir: string): Promise<string> {
    // 简单的文件复制示例（实际应该使用 rsync 或其他工具）
    const targetDir = join('/var/www/microfrontend', packageName, version)
    
    execSync(`mkdir -p ${targetDir}`, { stdio: 'pipe' })
    execSync(`cp -r ${distDir}/* ${targetDir}/`, { stdio: 'pipe' })

    return `${this.config.baseUrl}/${packageName}/${version}/remoteEntry.js`
  }

  /**
   * 上传到 AWS S3
   */
  private async uploadToAWS(packageName: string, version: string, distDir: string, bucket: string, region?: string): Promise<string> {
    const s3Path = `s3://${bucket}/${packageName}/${version}/`
    
    execSync(`aws s3 sync ${distDir} ${s3Path} --region ${region || 'us-east-1'}`, {
      stdio: 'inherit',
    })

    return `https://${bucket}.s3.amazonaws.com/${packageName}/${version}/remoteEntry.js`
  }

  /**
   * 上传到阿里云 OSS
   */
  private async uploadToAliyun(packageName: string, version: string, distDir: string, bucket: string, region?: string): Promise<string> {
    const ossPath = `oss://${bucket}/${packageName}/${version}/`
    
    execSync(`ossutil cp -r ${distDir} ${ossPath}`, {
      stdio: 'inherit',
    })

    return `https://${bucket}.${region || 'oss-cn-hangzhou'}.aliyuncs.com/${packageName}/${version}/remoteEntry.js`
  }

  /**
   * 上传到自定义 CDN
   */
  private async uploadToCustomCDN(packageName: string, version: string, distDir: string): Promise<string> {
    // 自定义上传逻辑
    console.log(chalk.yellow(`上传 ${packageName} 到自定义 CDN...`))
    
    // 这里应该实现具体的上传逻辑
    return `${this.config.baseUrl}/${packageName}/${version}/remoteEntry.js`
  }

  /**
   * 更新包注册表
   */
  private async updatePackageRegistry(packageName: string, version: string, url: string) {
    const registryPath = join(rootDir, 'microfrontend-registry.json')
    
    let registry: Record<string, any> = {}
    if (existsSync(registryPath)) {
      registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
    }

    if (!registry.packages) {
      registry.packages = {}
    }

    registry.packages[packageName] = {
      name: packageName,
      version,
      url,
      deployedAt: new Date().toISOString(),
      environment: this.config.environment,
    }

    registry.lastUpdated = new Date().toISOString()

    writeFileSync(registryPath, JSON.stringify(registry, null, 2))
  }

  /**
   * 更新总注册表
   */
  private async updateRegistry() {
    console.log(chalk.yellow('📝 更新注册表...'))

    const registryPath = join(rootDir, 'microfrontend-registry.json')
    let registry: Record<string, any> = {}

    if (existsSync(registryPath)) {
      registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
    }

    registry.environment = this.config.environment
    registry.lastDeployment = new Date().toISOString()
    registry.deployedPackages = this.results.filter(r => r.success).map(r => ({
      name: r.package,
      version: r.version,
      url: r.url,
    }))

    writeFileSync(registryPath, JSON.stringify(registry, null, 2))
    console.log(chalk.green('✅ 注册表更新完成'))
  }

  /**
   * 验证部署
   */
  private async validateDeployment() {
    console.log(chalk.yellow('🔍 验证部署...'))

    for (const result of this.results) {
      if (result.success) {
        try {
          // 简单的 HTTP 检查
          const response = await fetch(result.url, { method: 'HEAD' })
          if (!response.ok) {
            console.warn(chalk.yellow(`⚠️ ${result.package} URL 不可访问: ${result.url}`))
          }
        } catch (error) {
          console.warn(chalk.yellow(`⚠️ ${result.package} 验证失败:`, error))
        }
      }
    }

    console.log(chalk.green('✅ 部署验证完成'))
  }

  /**
   * 打印部署摘要
   */
  private printSummary() {
    console.log(chalk.blue('\n📊 部署摘要'))
    console.log(chalk.blue('='.repeat(50)))

    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)

    console.log(`成功: ${successful.length}`)
    console.log(`失败: ${failed.length}`)
    console.log(`总计: ${this.results.length}`)

    if (successful.length > 0) {
      console.log(chalk.green('\n✅ 成功部署的包:'))
      successful.forEach(result => {
        console.log(`  ${result.package}@${result.version} - ${result.url}`)
      })
    }

    if (failed.length > 0) {
      console.log(chalk.red('\n❌ 部署失败的包:'))
      failed.forEach(result => {
        console.log(`  ${result.package} - ${result.error}`)
      })
    }
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2)
  const environment = (args[0] as any) || 'development'
  const packages = args[1] ? args[1].split(',') : Object.keys(packageConfigs)

  const config: DeploymentConfig = {
    environment,
    packages,
    baseUrl: environment === 'production' 
      ? 'https://cdn.ldesign.com' 
      : 'http://localhost:8080',
    versionStrategy: 'auto',
    parallel: environment !== 'production',
  }

  const manager = new MicrofrontendDeploymentManager(config)
  
  try {
    await manager.deployAll()
    process.exit(0)
  } catch (error) {
    console.error(chalk.red('部署失败:'), error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { MicrofrontendDeploymentManager }
