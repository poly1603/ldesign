#!/usr/bin/env node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface PackageDeployOptions {
  packageName: string
  version?: string
  tag?: string
  dryRun?: boolean
  skipValidation?: boolean
}

/**
 * 验证单个包的构建产物
 */
function validatePackageBuild(packageName: string): void {
  console.log(`🔍 验证 ${packageName} 构建产物...`)

  const packageDir = path.resolve(__dirname, '../../../packages', packageName)

  if (!fs.existsSync(packageDir)) {
    throw new Error(`❌ 包 ${packageName} 不存在`)
  }

  const requiredDirs = ['dist', 'es', 'lib', 'types']
  const requiredFiles = [
    'dist/index.js',
    'es/index.js',
    'lib/index.js',
    'types/index.d.ts',
    'package.json',
    'README.md',
  ]

  // 检查目录
  for (const dir of requiredDirs) {
    const dirPath = path.join(packageDir, dir)
    if (!fs.existsSync(dirPath)) {
      throw new Error(`❌ ${packageName}: 缺少构建产物目录 ${dir}`)
    }
  }

  // 检查文件
  for (const file of requiredFiles) {
    const filePath = path.join(packageDir, file)
    if (!fs.existsSync(filePath)) {
      throw new Error(`❌ ${packageName}: 缺少构建文件 ${file}`)
    }
  }

  // 检查 package.json 配置
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8')
  )

  if (!packageJson.name || !packageJson.version) {
    throw new Error(`❌ ${packageName}: package.json 缺少必要字段`)
  }

  if (
    !packageJson.exports ||
    !packageJson.main ||
    !packageJson.module ||
    !packageJson.types
  ) {
    throw new Error(`❌ ${packageName}: package.json 缺少导出配置`)
  }

  console.log(`  ✅ ${packageName} 构建产物验证通过`)
}

/**
 * 验证包的测试覆盖率
 */
function validatePackageTests(packageName: string): void {
  console.log(`🧪 验证 ${packageName} 测试覆盖率...`)

  const packageDir = path.resolve(__dirname, '../../../packages', packageName)

  try {
    execSync('pnpm test:coverage', {
      cwd: packageDir,
      stdio: 'pipe',
    })
    console.log(`  ✅ ${packageName} 测试覆盖率验证通过`)
  } catch (error) {
    throw new Error(`❌ ${packageName}: 测试覆盖率不达标`)
  }
}

/**
 * 验证包大小
 */
function validatePackageSize(packageName: string): void {
  console.log(`📏 验证 ${packageName} 包大小...`)

  const packageDir = path.resolve(__dirname, '../../../packages', packageName)

  try {
    execSync('pnpm size-check', {
      cwd: packageDir,
      stdio: 'pipe',
    })
    console.log(`  ✅ ${packageName} 包大小验证通过`)
  } catch (error) {
    console.warn(`  ⚠️  ${packageName} 包大小超出限制，但继续部署`)
  }
}

/**
 * 生成包的 CDN 链接
 */
function generateCdnLinks(packageName: string, version: string): void {
  console.log(`🔗 生成 ${packageName} CDN 链接...`)

  const links = {
    jsdelivr: {
      latest: `https://cdn.jsdelivr.net/npm/@ldesign/${packageName}@latest/dist/index.js`,
      version: `https://cdn.jsdelivr.net/npm/@ldesign/${packageName}@${version}/dist/index.js`,
      minified: `https://cdn.jsdelivr.net/npm/@ldesign/${packageName}@${version}/dist/index.min.js`,
    },
    unpkg: {
      latest: `https://unpkg.com/@ldesign/${packageName}@latest/dist/index.js`,
      version: `https://unpkg.com/@ldesign/${packageName}@${version}/dist/index.js`,
      minified: `https://unpkg.com/@ldesign/${packageName}@${version}/dist/index.min.js`,
    },
  }

  console.log('\n📦 CDN 链接:')
  console.log('jsDelivr:')
  console.log(`  最新版本: ${links.jsdelivr.latest}`)
  console.log(`  指定版本: ${links.jsdelivr.version}`)
  console.log(`  压缩版本: ${links.jsdelivr.minified}`)
  console.log('\nunpkg:')
  console.log(`  最新版本: ${links.unpkg.latest}`)
  console.log(`  指定版本: ${links.unpkg.version}`)
  console.log(`  压缩版本: ${links.unpkg.minified}`)

  // 保存链接到文件
  const packageDir = path.resolve(__dirname, '../../../packages', packageName)
  const linksFile = path.join(packageDir, 'CDN_LINKS.md')

  const content = `# CDN 链接

## jsDelivr

- 最新版本: ${links.jsdelivr.latest}
- 指定版本: ${links.jsdelivr.version}
- 压缩版本: ${links.jsdelivr.minified}

## unpkg

- 最新版本: ${links.unpkg.latest}
- 指定版本: ${links.unpkg.version}
- 压缩版本: ${links.unpkg.minified}

## 使用示例

\`\`\`html
<!-- 使用 jsDelivr -->
<script src="${links.jsdelivr.latest}"></script>

<!-- 使用 unpkg -->
<script src="${links.unpkg.latest}"></script>
\`\`\`

\`\`\`javascript
// ES 模块
import { ${toCamelCase(
    packageName
  )} } from 'https://cdn.jsdelivr.net/npm/@ldesign/${packageName}@latest/es/index.js'
\`\`\`
`

  fs.writeFileSync(linksFile, content)
  console.log(`  ✅ CDN 链接已保存到 ${linksFile}`)
}

/**
 * 部署单个包
 */
export async function deployPackage(
  options: PackageDeployOptions
): Promise<void> {
  const {
    packageName,
    version,
    tag = 'latest',
    dryRun = false,
    skipValidation = false,
  } = options

  console.log(`🚀 开始部署包: ${packageName}\n`)

  try {
    const packageDir = path.resolve(__dirname, '../../../packages', packageName)

    // 验证阶段
    if (!skipValidation) {
      console.log('🔍 开始验证阶段...')
      validatePackageBuild(packageName)
      validatePackageTests(packageName)
      validatePackageSize(packageName)
      console.log('✅ 验证阶段完成\n')
    }

    // 获取包版本
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8')
    )
    const packageVersion = version || packageJson.version

    if (dryRun) {
      console.log('🔍 干运行模式：跳过实际发布')
      console.log(`  包名: ${packageJson.name}`)
      console.log(`  版本: ${packageVersion}`)
      console.log(`  标签: ${tag}`)
      return
    }

    // 发布到 npm
    console.log('📤 发布到 npm...')
    const publishCommand =
      tag === 'latest'
        ? 'npm publish --access public'
        : `npm publish --access public --tag ${tag}`

    execSync(publishCommand, {
      cwd: packageDir,
      stdio: 'inherit',
    })

    console.log('✅ npm 发布完成')

    // 生成 CDN 链接
    generateCdnLinks(packageName, packageVersion)

    console.log(`\n🎉 包 ${packageName} 部署完成！`)
  } catch (error) {
    console.error(`❌ 包 ${packageName} 部署失败:`, (error as Error).message)
    process.exit(1)
  }
}

/**
 * 部署所有包
 */
export async function deployAllPackages(
  options: Omit<PackageDeployOptions, 'packageName'> = {}
): Promise<void> {
  console.log('🚀 开始部署所有包...\n')

  const packagesDir = path.resolve(__dirname, '../../../packages')
  const packages = fs.readdirSync(packagesDir).filter(name => {
    const packagePath = path.join(packagesDir, name)
    return (
      fs.statSync(packagePath).isDirectory() &&
      fs.existsSync(path.join(packagePath, 'package.json'))
    )
  })

  for (const packageName of packages) {
    try {
      await deployPackage({ ...options, packageName })
      console.log('')
    } catch (error) {
      console.error(`❌ 包 ${packageName} 部署失败，继续下一个包`)
    }
  }

  console.log('🎉 所有包部署完成！')
}

// 工具函数
function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase())
}

// CLI 处理
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('用法:')
    console.log(
      '  tsx tools/deploy/package-deployer.ts <package-name> [options]'
    )
    console.log('  tsx tools/deploy/package-deployer.ts all [options]')
    console.log('')
    console.log('选项:')
    console.log('  --tag <tag>           发布标签 (默认: latest)')
    console.log('  --version <version>   指定版本')
    console.log('  --dry-run            干运行模式')
    console.log('  --skip-validation    跳过验证')
    process.exit(1)
  }

  const packageName = args[0]
  const options: PackageDeployOptions = {
    packageName,
    tag: args.includes('--tag') ? args[args.indexOf('--tag') + 1] : 'latest',
    version: args.includes('--version')
      ? args[args.indexOf('--version') + 1]
      : undefined,
    dryRun: args.includes('--dry-run'),
    skipValidation: args.includes('--skip-validation'),
  }

  if (packageName === 'all') {
    deployAllPackages(options)
  } else {
    deployPackage(options)
  }
}
