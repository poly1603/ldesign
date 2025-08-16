#!/usr/bin/env node

import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface VerificationOptions {
  packageName?: string
  version?: string
  timeout?: number
}

/**
 * 发送 HTTP 请求
 */
function httpGet(
  url: string,
  timeout = 10000
): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout }, res => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => resolve({ status: res.statusCode || 0, data }))
    })

    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

/**
 * 验证 npm 包是否可用
 */
async function verifyNpmPackage(
  packageName: string,
  version?: string
): Promise<boolean> {
  console.log(`📦 验证 npm 包: @ldesign/${packageName}`)

  try {
    const url = version
      ? `https://registry.npmjs.org/@ldesign/${packageName}/${version}`
      : `https://registry.npmjs.org/@ldesign/${packageName}/latest`

    const { status } = await httpGet(url)

    if (status === 200) {
      console.log(`  ✅ npm 包可用`)
      return true
    } else {
      console.log(`  ❌ npm 包不可用 (状态码: ${status})`)
      return false
    }
  } catch (error) {
    console.log(`  ❌ npm 包验证失败: ${(error as Error).message}`)
    return false
  }
}

/**
 * 验证 CDN 链接是否可用
 */
async function verifyCdnLinks(
  packageName: string,
  version?: string
): Promise<boolean> {
  console.log(`🌐 验证 CDN 链接: @ldesign/${packageName}`)

  const versionStr = version || 'latest'
  const links = [
    `https://cdn.jsdelivr.net/npm/@ldesign/${packageName}@${versionStr}/dist/index.js`,
    `https://unpkg.com/@ldesign/${packageName}@${versionStr}/dist/index.js`,
  ]

  let allValid = true

  for (const link of links) {
    try {
      const { status } = await httpGet(link)

      if (status === 200) {
        console.log(`  ✅ ${link}`)
      } else {
        console.log(`  ❌ ${link} (状态码: ${status})`)
        allValid = false
      }
    } catch (error) {
      console.log(`  ❌ ${link} (错误: ${(error as Error).message})`)
      allValid = false
    }
  }

  return allValid
}

/**
 * 验证文档站点是否可用
 */
async function verifyDocsWebsite(): Promise<boolean> {
  console.log(`📚 验证文档站点`)

  const urls = [
    'https://ldesign.github.io',
    'https://ldesign.github.io/guide/',
    'https://ldesign.github.io/api/',
  ]

  let allValid = true

  for (const url of urls) {
    try {
      const { status } = await httpGet(url)

      if (status === 200) {
        console.log(`  ✅ ${url}`)
      } else {
        console.log(`  ❌ ${url} (状态码: ${status})`)
        allValid = false
      }
    } catch (error) {
      console.log(`  ❌ ${url} (错误: ${(error as Error).message})`)
      allValid = false
    }
  }

  return allValid
}

/**
 * 验证包的完整性
 */
async function verifyPackageIntegrity(
  packageName: string,
  version?: string
): Promise<boolean> {
  console.log(`🔍 验证包完整性: @ldesign/${packageName}`)

  try {
    // 验证包的主要导出
    const versionStr = version || 'latest'
    const mainUrl = `https://cdn.jsdelivr.net/npm/@ldesign/${packageName}@${versionStr}/dist/index.js`

    const { status, data } = await httpGet(mainUrl)

    if (status !== 200) {
      console.log(`  ❌ 无法获取包内容`)
      return false
    }

    // 检查是否包含基本的导出
    const hasExports =
      data.includes('export') || data.includes('module.exports')
    const hasUMD = data.includes('(function') || data.includes('!function')

    if (hasExports || hasUMD) {
      console.log(`  ✅ 包内容完整`)
      return true
    } else {
      console.log(`  ❌ 包内容不完整`)
      return false
    }
  } catch (error) {
    console.log(`  ❌ 包完整性验证失败: ${(error as Error).message}`)
    return false
  }
}

/**
 * 验证单个包的部署
 */
export async function verifyPackageDeployment(
  packageName: string,
  options: VerificationOptions = {}
): Promise<boolean> {
  const { version, timeout = 30000 } = options

  console.log(`\n🔍 验证包部署: @ldesign/${packageName}`)
  console.log('=' * 50)

  const results = await Promise.all([
    verifyNpmPackage(packageName, version),
    verifyCdnLinks(packageName, version),
    verifyPackageIntegrity(packageName, version),
  ])

  const allValid = results.every(result => result)

  if (allValid) {
    console.log(`\n✅ 包 @ldesign/${packageName} 部署验证通过`)
  } else {
    console.log(`\n❌ 包 @ldesign/${packageName} 部署验证失败`)
  }

  return allValid
}

/**
 * 验证所有包的部署
 */
export async function verifyAllDeployments(
  options: VerificationOptions = {}
): Promise<boolean> {
  console.log('🚀 开始验证所有包的部署状态...\n')

  const packagesDir = path.resolve(__dirname, '../../packages')
  const packages = fs.readdirSync(packagesDir).filter(name => {
    const packagePath = path.join(packagesDir, name)
    return (
      fs.statSync(packagePath).isDirectory() &&
      fs.existsSync(path.join(packagePath, 'package.json'))
    )
  })

  const results: Record<string, boolean> = {}

  // 验证每个包
  for (const packageName of packages) {
    try {
      results[packageName] = await verifyPackageDeployment(packageName, options)
    } catch (error) {
      console.error(`❌ 验证 ${packageName} 失败:`, (error as Error).message)
      results[packageName] = false
    }
  }

  // 验证文档站点
  console.log('\n🔍 验证文档站点')
  console.log('=' * 50)
  const docsValid = await verifyDocsWebsite()

  // 输出总结
  console.log('\n📊 验证结果总结')
  console.log('=' * 50)

  let allValid = true

  for (const [packageName, isValid] of Object.entries(results)) {
    const status = isValid ? '✅ 通过' : '❌ 失败'
    console.log(`${packageName.padEnd(12)} ${status}`)
    if (!isValid) allValid = false
  }

  const docsStatus = docsValid ? '✅ 通过' : '❌ 失败'
  console.log(`${'docs'.padEnd(12)} ${docsStatus}`)
  if (!docsValid) allValid = false

  console.log('=' * 50)

  if (allValid) {
    console.log('🎉 所有部署验证通过!')
  } else {
    console.log('⚠️  部分部署验证失败')
  }

  return allValid
}

/**
 * 生成部署报告
 */
export function generateDeploymentReport(
  results: Record<string, boolean>
): void {
  const reportPath = path.resolve(__dirname, '../../deployment-report.md')

  const timestamp = new Date().toISOString()
  const totalPackages = Object.keys(results).length
  const successfulPackages = Object.values(results).filter(Boolean).length
  const failedPackages = totalPackages - successfulPackages

  const content = `# 部署验证报告

**生成时间**: ${timestamp}

## 📊 总览

- **总包数**: ${totalPackages}
- **成功**: ${successfulPackages}
- **失败**: ${failedPackages}
- **成功率**: ${((successfulPackages / totalPackages) * 100).toFixed(1)}%

## 📦 包状态

| 包名 | 状态 | npm | CDN | 完整性 |
|------|------|-----|-----|--------|
${Object.entries(results)
  .map(
    ([name, status]) =>
      `| @ldesign/${name} | ${status ? '✅' : '❌'} | ${
        status ? '✅' : '❌'
      } | ${status ? '✅' : '❌'} | ${status ? '✅' : '❌'} |`
  )
  .join('\n')}

## 🔗 链接

### npm 包
${Object.keys(results)
  .map(
    name =>
      `- [@ldesign/${name}](https://www.npmjs.com/package/@ldesign/${name})`
  )
  .join('\n')}

### CDN 链接
${Object.keys(results)
  .map(
    name =>
      `- [jsDelivr](https://cdn.jsdelivr.net/npm/@ldesign/${name}@latest/dist/index.js) | [unpkg](https://unpkg.com/@ldesign/${name}@latest/dist/index.js)`
  )
  .join('\n')}

### 文档
- [主站](https://ldesign.github.io)
- [API 文档](https://ldesign.github.io/api/)
- [使用指南](https://ldesign.github.io/guide/)

---

*此报告由 LDesign 部署验证工具自动生成*
`

  fs.writeFileSync(reportPath, content)
  console.log(`\n📄 部署报告已生成: ${reportPath}`)
}

// CLI 处理
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const args = process.argv.slice(2)

  const options: VerificationOptions = {
    version: args.includes('--version')
      ? args[args.indexOf('--version') + 1]
      : undefined,
    timeout: args.includes('--timeout')
      ? Number.parseInt(args[args.indexOf('--timeout') + 1])
      : 30000,
  }

  if (args.length === 0 || args[0] === 'all') {
    verifyAllDeployments(options).then(success => {
      process.exit(success ? 0 : 1)
    })
  } else {
    const packageName = args[0]
    verifyPackageDeployment(packageName, options).then(success => {
      process.exit(success ? 0 : 1)
    })
  }
}
