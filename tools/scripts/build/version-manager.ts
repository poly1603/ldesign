#!/usr/bin/env node

import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface PackageInfo {
  name: string
  version: string
  path: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

type VersionType = 'patch' | 'minor' | 'major' | 'prerelease'

class VersionManager {
  private packagesDir: string
  private packages: PackageInfo[] = []

  constructor() {
    this.packagesDir = join(process.cwd(), 'packages')
    this.loadPackages()
  }

  private loadPackages(): void {
    const packageDirs = readdirSync(this.packagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    this.packages = packageDirs
      .map((dir) => {
        const packagePath = join(this.packagesDir, dir)
        const packageJsonPath = join(packagePath, 'package.json')

        try {
          const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
          return {
            name: packageJson.name,
            version: packageJson.version,
            path: packagePath,
            dependencies: packageJson.dependencies,
            devDependencies: packageJson.devDependencies,
          }
        }
        catch (error) {
          console.warn(`无法读取包配置: ${packageJsonPath}`)
          return null
        }
      })
      .filter(Boolean) as PackageInfo[]

    console.log(`发现 ${this.packages.length} 个包:`)
    this.packages.forEach((pkg) => {
      console.log(`  - ${pkg.name}@${pkg.version}`)
    })
  }

  private incrementVersion(version: string, type: VersionType): string {
    const parts = version.split('.').map(Number)
    const [major, minor, patch] = parts

    switch (type) {
      case 'major':
        return `${major + 1}.0.0`
      case 'minor':
        return `${major}.${minor + 1}.0`
      case 'patch':
        return `${major}.${minor}.${patch + 1}`
      case 'prerelease':
        // 简单的预发布版本处理
        const prereleaseMatch = version.match(/(\d+\.\d+\.\d+)-(.+)\.(\d+)/)
        if (prereleaseMatch) {
          const [, baseVersion, tag, num] = prereleaseMatch
          return `${baseVersion}-${tag}.${Number(num) + 1}`
        }
        else {
          return `${major}.${minor}.${patch + 1}-beta.0`
        }
      default:
        throw new Error(`不支持的版本类型: ${type}`)
    }
  }

  private updatePackageJson(
    packageInfo: PackageInfo,
    newVersion: string,
  ): void {
    const packageJsonPath = join(packageInfo.path, 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

    packageJson.version = newVersion

    writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`)
    console.log(
      `更新 ${packageInfo.name}: ${packageInfo.version} -> ${newVersion}`,
    )
  }

  private updateInternalDependencies(newVersions: Map<string, string>): void {
    this.packages.forEach((pkg) => {
      const packageJsonPath = join(pkg.path, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
      let updated = false

      // 更新 dependencies
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach((depName) => {
          if (newVersions.has(depName)) {
            packageJson.dependencies[depName] = `^${newVersions.get(depName)}`
            updated = true
          }
        })
      }

      // 更新 devDependencies
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach((depName) => {
          if (newVersions.has(depName)) {
            packageJson.devDependencies[depName] = `^${newVersions.get(
              depName,
            )}`
            updated = true
          }
        })
      }

      if (updated) {
        writeFileSync(
          packageJsonPath,
          `${JSON.stringify(packageJson, null, 2)}\n`,
        )
        console.log(`更新 ${pkg.name} 的内部依赖`)
      }
    })
  }

  private commitChanges(version: string, type: VersionType): void {
    try {
      execSync('git add .', { stdio: 'inherit' })
      execSync(`git commit -m "chore: bump version to ${version} (${type})"`, {
        stdio: 'inherit',
      })
      execSync(`git tag v${version}`, { stdio: 'inherit' })
      console.log(`已提交版本更新并创建标签 v${version}`)
    }
    catch (error) {
      console.warn('Git 操作失败，请手动提交更改')
    }
  }

  async bumpVersion(
    type: VersionType,
    packageName?: string,
    commit: boolean = true,
  ): Promise<void> {
    console.log(`开始更新版本 (${type})...`)

    if (packageName) {
      // 更新单个包
      const pkg = this.packages.find(p => p.name === packageName)
      if (!pkg) {
        throw new Error(`找不到包: ${packageName}`)
      }

      const newVersion = this.incrementVersion(pkg.version, type)
      this.updatePackageJson(pkg, newVersion)

      if (commit) {
        this.commitChanges(newVersion, type)
      }
    }
    else {
      // 更新所有包
      const newVersions = new Map<string, string>()

      // 计算新版本号
      this.packages.forEach((pkg) => {
        const newVersion = this.incrementVersion(pkg.version, type)
        newVersions.set(pkg.name, newVersion)
      })

      // 更新所有包的版本号
      this.packages.forEach((pkg) => {
        const newVersion = newVersions.get(pkg.name)!
        this.updatePackageJson(pkg, newVersion)
      })

      // 更新内部依赖
      this.updateInternalDependencies(newVersions)

      if (commit) {
        const firstPackage = this.packages[0]
        const newVersion = newVersions.get(firstPackage.name)!
        this.commitChanges(newVersion, type)
      }
    }

    console.log('版本更新完成!')
  }

  listPackages(): void {
    console.log('\n当前包版本:')
    this.packages.forEach((pkg) => {
      console.log(`  ${pkg.name}: ${pkg.version}`)
    })
  }

  async syncVersions(): Promise<void> {
    console.log('同步包版本...')

    // 找到最高版本
    const versions = this.packages.map(pkg => pkg.version)
    const highestVersion = versions.reduce((highest, current) => {
      return this.compareVersions(current, highest) > 0 ? current : highest
    })

    console.log(`同步到版本: ${highestVersion}`)

    // 更新所有包到最高版本
    this.packages.forEach((pkg) => {
      if (pkg.version !== highestVersion) {
        this.updatePackageJson(pkg, highestVersion)
      }
    })

    console.log('版本同步完成!')
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0

      if (aPart > bPart)
        return 1
      if (aPart < bPart)
        return -1
    }

    return 0
  }
}

// CLI 接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)
  const versionManager = new VersionManager()

  const command = args[0]

  switch (command) {
    case 'bump':
      const type = (args[1] || 'patch') as VersionType
      const packageName = args.includes('--package')
        ? args[args.indexOf('--package') + 1]
        : undefined
      const noCommit = args.includes('--no-commit')

      versionManager.bumpVersion(type, packageName, !noCommit).catch((error) => {
        console.error('版本更新失败:', error.message)
        process.exit(1)
      })
      break

    case 'list':
      versionManager.listPackages()
      break

    case 'sync':
      versionManager.syncVersions().catch((error) => {
        console.error('版本同步失败:', error.message)
        process.exit(1)
      })
      break

    default:
      console.log(`
用法:
  tsx version-manager.ts bump [patch|minor|major|prerelease] [--package <name>] [--no-commit]
  tsx version-manager.ts list
  tsx version-manager.ts sync

示例:
  tsx version-manager.ts bump patch              # 更新所有包的补丁版本
  tsx version-manager.ts bump minor --package @ldesign/engine  # 更新特定包的次版本
  tsx version-manager.ts list                   # 列出所有包的当前版本
  tsx version-manager.ts sync                   # 同步所有包到最高版本
      `)
      break
  }
}

export { VersionManager, VersionType }
