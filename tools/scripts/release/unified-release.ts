#!/usr/bin/env tsx

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major' | 'prerelease'
  tag?: string
  dryRun?: boolean
  skipTests?: boolean
  skipBuild?: boolean
}

class UnifiedRelease {
  private rootDir: string

  constructor() {
    this.rootDir = resolve(process.cwd())
  }

  // 执行发布流程
  async release(options: ReleaseOptions) {
    console.log(`🚀 开始 ${options.type} 版本发布...`)

    try {
      // 1. 预检查
      await this.preReleaseChecks()

      // 2. 运行测试
      if (!options.skipTests) {
        await this.runTests()
      }

      // 3. 构建
      if (!options.skipBuild) {
        await this.buildPackages()
      }

      // 4. 版本更新
      await this.updateVersions(options)

      // 5. 生成变更日志
      await this.generateChangelog()

      // 6. Git 提交和标签
      await this.commitAndTag(options)

      // 7. 发布到 npm
      if (!options.dryRun) {
        await this.publishToNpm(options)
      }

      // 8. 推送到远程
      if (!options.dryRun) {
        await this.pushToRemote()
      }

      console.log('✅ 发布完成!')
    }
    catch (error) {
      console.error('❌ 发布失败:', error)
      throw error
    }
  }

  // 预发布检查
  private async preReleaseChecks() {
    console.log('🔍 预发布检查...')

    // 检查工作区是否干净
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf-8' })
      if (status.trim()) {
        throw new Error('工作区不干净，请先提交或暂存更改')
      }
    }
    catch {
      throw new Error('Git 状态检查失败')
    }

    // 检查当前分支
    const branch = execSync('git branch --show-current', {
      encoding: 'utf-8',
    }).trim()
    if (branch !== 'main' && branch !== 'master') {
      console.warn(`⚠️ 当前分支: ${branch}，建议在 main/master 分支发布`)
    }

    // 检查远程同步
    try {
      execSync('git fetch origin', { stdio: 'inherit' })
      const behind = execSync(`git rev-list --count HEAD..origin/${branch}`, {
        encoding: 'utf-8',
      }).trim()
      if (Number.parseInt(behind) > 0) {
        throw new Error(`本地分支落后远程 ${behind} 个提交，请先拉取最新代码`)
      }
    }
    catch {
      console.warn('⚠️ 无法检查远程同步状态')
    }
  }

  // 运行测试
  private async runTests() {
    console.log('🧪 运行测试...')
    execSync('pnpm test:run', { stdio: 'inherit' })
    execSync('pnpm type-check', { stdio: 'inherit' })
    execSync('pnpm lint:check', { stdio: 'inherit' })
  }

  // 构建包
  private async buildPackages() {
    console.log('📦 构建包...')
    execSync('pnpm clean', { stdio: 'inherit' })
    execSync('pnpm build', { stdio: 'inherit' })
    execSync('pnpm size-check', { stdio: 'inherit' })
  }

  // 更新版本
  private async updateVersions(options: ReleaseOptions) {
    console.log('📝 更新版本...')

    if (options.type === 'prerelease') {
      const prereleaseId = options.tag || 'beta'
      execSync(`changeset pre enter ${prereleaseId}`, { stdio: 'inherit' })
    }

    // 创建 changeset
    if (options.dryRun) {
      console.log('🔍 预览版本更新...')
      execSync('changeset status', { stdio: 'inherit' })
    }
    else {
      execSync('changeset version', { stdio: 'inherit' })
    }
  }

  // 生成变更日志
  private async generateChangelog() {
    console.log('📋 生成变更日志...')
    // changeset 会自动生成 CHANGELOG.md
    console.log('✅ 变更日志已更新')
  }

  // 提交和标签
  private async commitAndTag(options: ReleaseOptions) {
    if (options.dryRun) {
      console.log('🔍 跳过 Git 提交 (dry-run)')
      return
    }

    console.log('📝 提交更改...')

    // 读取根 package.json 获取新版本
    const rootPackage = JSON.parse(
      readFileSync(resolve(this.rootDir, 'package.json'), 'utf-8'),
    )
    const version = rootPackage.version

    execSync('git add .', { stdio: 'inherit' })
    execSync(`git commit -m "chore: release v${version}"`, { stdio: 'inherit' })
    execSync(`git tag -a v${version} -m "v${version}"`, { stdio: 'inherit' })
  }

  // 发布到 npm
  private async publishToNpm(options: ReleaseOptions) {
    console.log('📤 发布到 npm...')

    const publishArgs = ['changeset', 'publish']

    if (options.tag) {
      publishArgs.push('--tag', options.tag)
    }

    execSync(publishArgs.join(' '), { stdio: 'inherit' })
  }

  // 推送到远程
  private async pushToRemote() {
    console.log('⬆️ 推送到远程...')
    execSync('git push origin --follow-tags', { stdio: 'inherit' })
  }

  // 回滚发布
  async rollback(version: string) {
    console.log(`🔄 回滚到版本 ${version}...`)

    try {
      // 回滚 Git 标签
      execSync(`git tag -d v${version}`, { stdio: 'inherit' })
      execSync(`git push origin :refs/tags/v${version}`, { stdio: 'inherit' })

      // 回滚 Git 提交
      execSync('git reset --hard HEAD~1', { stdio: 'inherit' })
      execSync('git push origin --force-with-lease', { stdio: 'inherit' })

      console.log('✅ 回滚完成')
    }
    catch (error) {
      console.error('❌ 回滚失败:', error)
      throw error
    }
  }
}

// CLI 接口
const args = process.argv.slice(2)
const command = args[0]

const release = new UnifiedRelease()

switch (command) {
  case 'patch':
  case 'minor':
  case 'major':
    release
      .release({
        type: command,
        dryRun: args.includes('--dry-run'),
        skipTests: args.includes('--skip-tests'),
        skipBuild: args.includes('--skip-build'),
      })
      .catch(console.error)
    break

  case 'prerelease': {
    const tagIndex = args.indexOf('--tag')
    const tag = tagIndex !== -1 ? args[tagIndex + 1] : 'beta'

    release
      .release({
        type: 'prerelease',
        tag,
        dryRun: args.includes('--dry-run'),
        skipTests: args.includes('--skip-tests'),
        skipBuild: args.includes('--skip-build'),
      })
      .catch(console.error)
    break
  }

  case 'rollback': {
    const version = args[1]
    if (!version) {
      console.error('请指定要回滚的版本号')
      process.exit(1)
    }
    release.rollback(version).catch(console.error)
    break
  }

  default:
    console.log(`
使用方法:
  tsx tools/scripts/release/unified-release.ts <command> [选项]

命令:
  patch       # 补丁版本发布 (1.0.0 -> 1.0.1)
  minor       # 次要版本发布 (1.0.0 -> 1.1.0)
  major       # 主要版本发布 (1.0.0 -> 2.0.0)
  prerelease  # 预发布版本 (1.0.0 -> 1.0.1-beta.0)
  rollback    # 回滚指定版本

选项:
  --dry-run      # 预览模式，不实际发布
  --skip-tests   # 跳过测试
  --skip-build   # 跳过构建
  --tag <tag>    # 指定 npm 标签 (用于预发布)

示例:
  tsx tools/scripts/release/unified-release.ts patch
  tsx tools/scripts/release/unified-release.ts prerelease --tag beta
  tsx tools/scripts/release/unified-release.ts major --dry-run
`)
    break
}
