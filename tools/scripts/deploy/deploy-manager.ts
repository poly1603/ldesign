#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface DeployOptions {
  target?: 'npm' | 'cdn' | 'docs' | 'all'
  environment?: 'production' | 'staging' | 'development'
  skipValidation?: boolean
  dryRun?: boolean
  force?: boolean
}

export interface DeployConfig {
  npm: {
    registry?: string
    tag?: string
    access?: 'public' | 'restricted'
  }
  cdn: {
    provider?: 'jsdelivr' | 'unpkg' | 'custom'
    endpoint?: string
    bucket?: string
    region?: string
  }
  docs: {
    provider?: 'github-pages' | 'vercel' | 'netlify'
    domain?: string
    buildDir?: string
  }
}

/**
 * 加载部署配置
 */
function loadDeployConfig(): DeployConfig {
  const configPath = path.resolve(__dirname, '../../../deploy.config.json')

  const defaultConfig: DeployConfig = {
    npm: {
      registry: 'https://registry.npmjs.org/',
      tag: 'latest',
      access: 'public',
    },
    cdn: {
      provider: 'jsdelivr',
    },
    docs: {
      provider: 'github-pages',
      buildDir: 'docs/.vitepress/dist',
    },
  }

  if (fs.existsSync(configPath)) {
    const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    return { ...defaultConfig, ...userConfig }
  }

  return defaultConfig
}

/**
 * 验证构建产物
 */
function validateBuild(): void {
  console.log('🔍 验证构建产物...')

  const packagesDir = path.resolve(__dirname, '../../packages')
  const packages = fs.readdirSync(packagesDir).filter((name) => {
    const packagePath = path.join(packagesDir, name)
    return fs.statSync(packagePath).isDirectory() && fs.existsSync(path.join(packagePath, 'package.json'))
  })

  for (const packageName of packages) {
    const packageDir = path.join(packagesDir, packageName)
    const requiredDirs = ['dist', 'es', 'lib', 'types']

    for (const dir of requiredDirs) {
      const dirPath = path.join(packageDir, dir)
      if (!fs.existsSync(dirPath)) {
        throw new Error(`❌ ${packageName}: 缺少构建产物目录 ${dir}`)
      }
    }

    // 检查主要文件
    const mainFiles = ['dist/index.js', 'es/index.js', 'lib/index.js', 'types/index.d.ts']
    for (const file of mainFiles) {
      const filePath = path.join(packageDir, file)
      if (!fs.existsSync(filePath)) {
        throw new Error(`❌ ${packageName}: 缺少构建文件 ${file}`)
      }
    }

    console.log(`  ✅ ${packageName} 构建产物验证通过`)
  }

  console.log('✅ 所有构建产物验证通过\n')
}

/**
 * 验证测试覆盖率
 */
function validateTestCoverage(): void {
  console.log('📊 验证测试覆盖率...')

  try {
    execSync('pnpm test:coverage', { stdio: 'pipe' })
    console.log('✅ 测试覆盖率验证通过\n')
  }
  catch (error) {
    throw new Error('❌ 测试覆盖率不达标')
  }
}

/**
 * 验证包大小
 */
function validatePackageSize(): void {
  console.log('📏 验证包大小...')

  try {
    execSync('pnpm size-check', { stdio: 'pipe' })
    console.log('✅ 包大小验证通过\n')
  }
  catch (error) {
    console.warn('⚠️  包大小超出限制，但继续部署\n')
  }
}

/**
 * 部署到 npm
 */
function deployToNpm(config: DeployConfig, options: DeployOptions): void {
  console.log('📤 部署到 npm...')

  const { registry, tag, access } = config.npm
  const { dryRun = false } = options

  if (dryRun) {
    console.log('🔍 干运行模式：跳过 npm 发布')
    return
  }

  try {
    // 设置 npm 配置
    if (registry) {
      execSync(`npm config set registry ${registry}`, { stdio: 'inherit' })
    }

    // 发布包
    const publishCommand = `pnpm changeset publish --tag ${tag}`
    execSync(publishCommand, { stdio: 'inherit' })

    console.log('✅ npm 部署完成\n')
  }
  catch (error) {
    throw new Error(`❌ npm 部署失败: ${(error as Error).message}`)
  }
}

/**
 * 部署到 CDN
 */
function deployCdn(config: DeployConfig, options: DeployOptions): void {
  console.log('🌐 部署到 CDN...')

  const { provider } = config.cdn
  const { dryRun = false } = options

  if (dryRun) {
    console.log('🔍 干运行模式：跳过 CDN 部署')
    return
  }

  switch (provider) {
    case 'jsdelivr':
      console.log('📦 使用 jsDelivr CDN（自动同步）')
      console.log('🔗 CDN 链接将在发布后自动可用')
      break
    case 'unpkg':
      console.log('📦 使用 unpkg CDN（自动同步）')
      console.log('🔗 CDN 链接将在发布后自动可用')
      break
    case 'custom':
      // 自定义 CDN 部署逻辑
      deployCustomCdn(config.cdn, options)
      break
    default:
      console.log('⚠️  未配置 CDN 部署')
  }

  console.log('✅ CDN 部署完成\n')
}

/**
 * 自定义 CDN 部署
 */
function deployCustomCdn(cdnConfig: DeployConfig['cdn'], options: DeployOptions): void {
  const { endpoint, bucket, region } = cdnConfig

  if (!endpoint || !bucket) {
    throw new Error('❌ 自定义 CDN 配置不完整')
  }

  // 这里可以添加自定义 CDN 部署逻辑
  // 例如：AWS S3、阿里云 OSS、腾讯云 COS 等
  console.log(`🚀 部署到自定义 CDN: ${endpoint}`)

  // 示例：使用 AWS CLI 部署到 S3
  // execSync(`aws s3 sync ./dist s3://${bucket} --region ${region}`, { stdio: 'inherit' })
}

/**
 * 部署文档站点
 */
function deployDocs(config: DeployConfig, options: DeployOptions): void {
  console.log('📚 部署文档站点...')

  const { provider, buildDir } = config.docs
  const { dryRun = false } = options

  if (dryRun) {
    console.log('🔍 干运行模式：跳过文档部署')
    return
  }

  // 构建文档
  console.log('🏗️  构建文档...')
  execSync('pnpm docs:build', { stdio: 'inherit' })

  switch (provider) {
    case 'github-pages':
      deployToGitHubPages(buildDir!)
      break
    case 'vercel':
      deployToVercel()
      break
    case 'netlify':
      deployToNetlify(buildDir!)
      break
    default:
      console.log('⚠️  未配置文档部署')
  }

  console.log('✅ 文档部署完成\n')
}

/**
 * 部署到 GitHub Pages
 */
function deployToGitHubPages(buildDir: string): void {
  console.log('🐙 部署到 GitHub Pages...')

  try {
    // 使用 gh-pages 部署
    execSync(`npx gh-pages -d ${buildDir}`, { stdio: 'inherit' })
  }
  catch (error) {
    throw new Error(`❌ GitHub Pages 部署失败: ${(error as Error).message}`)
  }
}

/**
 * 部署到 Vercel
 */
function deployToVercel(): void {
  console.log('▲ 部署到 Vercel...')

  try {
    execSync('vercel --prod', { stdio: 'inherit' })
  }
  catch (error) {
    throw new Error(`❌ Vercel 部署失败: ${(error as Error).message}`)
  }
}

/**
 * 部署到 Netlify
 */
function deployToNetlify(buildDir: string): void {
  console.log('🌐 部署到 Netlify...')

  try {
    execSync(`netlify deploy --prod --dir ${buildDir}`, { stdio: 'inherit' })
  }
  catch (error) {
    throw new Error(`❌ Netlify 部署失败: ${(error as Error).message}`)
  }
}

/**
 * 回滚部署
 */
export function rollbackDeploy(target: string, version?: string): void {
  console.log(`🔄 回滚部署: ${target}`)

  switch (target) {
    case 'npm':
      if (version) {
        execSync(`npm deprecate @ldesign/* "${version} 版本已回滚"`, { stdio: 'inherit' })
      }
      break
    case 'docs':
      // 回滚到上一个版本的文档
      execSync('git checkout HEAD~1 -- docs/', { stdio: 'inherit' })
      execSync('pnpm docs:build', { stdio: 'inherit' })
      break
    default:
      console.log('⚠️  不支持的回滚目标')
  }

  console.log('✅ 回滚完成')
}

/**
 * 主部署函数
 */
export async function deploy(options: DeployOptions = {}): Promise<void> {
  const {
    target = 'all',
    environment = 'production',
    skipValidation = false,
    dryRun = false,
    force = false,
  } = options

  console.log(`🚀 开始部署流程 (${environment})...\n`)

  try {
    const config = loadDeployConfig()

    // 验证阶段
    if (!skipValidation) {
      console.log('🔍 开始验证阶段...')
      validateBuild()
      validateTestCoverage()
      validatePackageSize()
    }

    // 部署阶段
    console.log('🚀 开始部署阶段...')

    if (target === 'npm' || target === 'all') {
      deployToNpm(config, options)
    }

    if (target === 'cdn' || target === 'all') {
      deployCdn(config, options)
    }

    if (target === 'docs' || target === 'all') {
      deployDocs(config, options)
    }

    console.log('🎉 部署流程完成！')

    // 输出部署信息
    console.log('\n📋 部署信息:')
    console.log(`  环境: ${environment}`)
    console.log(`  目标: ${target}`)
    console.log(`  干运行: ${dryRun ? '是' : '否'}`)
  }
  catch (error) {
    console.error('❌ 部署失败:', (error as Error).message)

    if (!force) {
      console.log('\n🔄 可以使用 --force 参数强制部署')
      console.log('🔄 或使用回滚命令: tsx tools/deploy/deploy-manager.ts rollback <target>')
    }

    process.exit(1)
  }
}

// CLI 处理
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === 'rollback') {
    const target = args[1]
    const version = args[2]
    rollbackDeploy(target, version)
  }
  else {
    const options: DeployOptions = {
      target: (args.find(arg => ['npm', 'cdn', 'docs', 'all'].includes(arg)) as any) || 'all',
      environment: (args.find(arg => ['production', 'staging', 'development'].includes(arg)) as any) || 'production',
      skipValidation: args.includes('--skip-validation'),
      dryRun: args.includes('--dry-run'),
      force: args.includes('--force'),
    }

    deploy(options)
  }
}
