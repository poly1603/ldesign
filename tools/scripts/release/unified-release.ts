#!/usr/bin/env tsx

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { logger } from '../../utils/dev-logger'

interface ReleaseOptions {
  type: 'patch' | 'minor' | 'major' | 'prerelease'
  tag?: string
  dryRun?: boolean
  skipTests?: boolean
  skipBuild?: boolean
}

class UnifiedRelease {
  private rootDir: string
  private run(command: string, inherit: boolean = true): { stdout: string } {
    try {
      const stdout = execSync(command, { stdio: inherit ? 'inherit' : 'pipe', encoding: 'utf-8' })
      return { stdout: stdout || '' }
    }
    catch (error: any) {
      const msg = error?.message || '命令执行失败'
      const stderr: string = error?.stderr?.toString?.() || ''
      const stdout: string = error?.stdout?.toString?.() || ''
      logger.error(`${command} 执行失败`, undefined, { prefix: 'RELEASE' })
      if (!inherit) logger.warn([msg, stderr, stdout].filter(Boolean).join('\n'), { prefix: 'RELEASE' })
      throw error
    }
  }

  constructor() {
    this.rootDir = resolve(process.cwd())
  }

  // 执行发布流程
  async release(options: ReleaseOptions) {
    logger.banner('LDesign Release')
    logger.info(`开始 ${options.type} 版本发布...`, { prefix: 'RELEASE' })

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

      logger.success('发布完成!', { prefix: 'RELEASE' })
    }
    catch (error) {
      logger.error('发布失败', error as Error, { prefix: 'RELEASE' })
      throw error
    }
  }

  // 预发布检查
  private async preReleaseChecks() {
    logger.info('预发布检查...', { prefix: 'RELEASE' })

    // 检查工作区是否干净
    try {
      const status = this.run('git status --porcelain', false).stdout
      if (status.trim()) {
        throw new Error('工作区不干净，请先提交或暂存更改')
      }
    }
    catch {
      throw new Error('Git 状态检查失败')
    }

    // 检查当前分支
    const branch = this.run('git branch --show-current', false).stdout.trim()
    if (branch !== 'main' && branch !== 'master') {
      logger.warn(`当前分支: ${branch}，建议在 main/master 分支发布`, { prefix: 'RELEASE' })
    }

    // 检查远程同步
    try {
      this.run('git fetch origin', true)
      const behind = this.run(`git rev-list --count HEAD..origin/${branch}`, false).stdout.trim()
      if (Number.parseInt(behind) > 0) {
        throw new Error(`本地分支落后远程 ${behind} 个提交，请先拉取最新代码`)
      }
    }
    catch {
      logger.warn('无法检查远程同步状态', { prefix: 'RELEASE' })
    }
  }

  // 运行测试
  private async runTests() {
    logger.info('运行测试...', { prefix: 'RELEASE' })
    this.run('pnpm test:run')
    this.run('pnpm type-check')
    this.run('pnpm lint:check')
  }

  // 构建包
  private async buildPackages() {
    logger.info('构建包...', { prefix: 'RELEASE' })
    this.run('pnpm clean')
    this.run('pnpm build')
    this.run('pnpm size-check')
  }

  // 更新版本
  private async updateVersions(options: ReleaseOptions) {
    logger.info('更新版本...', { prefix: 'RELEASE' })

    if (options.type === 'prerelease') {
      const prereleaseId = options.tag || 'beta'
      this.run(`changeset pre enter ${prereleaseId}`)
    }

    // 创建 changeset
    if (options.dryRun) {
      logger.info('预览版本更新...', { prefix: 'RELEASE' })
      this.run('changeset status')
    }
    else {
      this.run('changeset version')
    }
  }

  // 生成变更日志
  private async generateChangelog() {
    logger.info('生成变更日志...', { prefix: 'RELEASE' })
    // changeset 会自动生成 CHANGELOG.md
    logger.success('变更日志已更新', { prefix: 'RELEASE' })
  }

  // 提交和标签
  private async commitAndTag(options: ReleaseOptions) {
    if (options.dryRun) {
      logger.info('跳过 Git 提交 (dry-run)', { prefix: 'RELEASE' })
      return
    }

    logger.info('提交更改...', { prefix: 'RELEASE' })

    // 读取根 package.json 获取新版本
    const rootPackage = JSON.parse(
      readFileSync(resolve(this.rootDir, 'package.json'), 'utf-8'),
    )
    const version = rootPackage.version

    this.run('git add .')
    this.run(`git commit -m "chore: release v${version}"`)
    this.run(`git tag -a v${version} -m "v${version}"`)
  }

  // 发布到 npm
  private async publishToNpm(options: ReleaseOptions) {
    logger.info('发布到 npm...', { prefix: 'RELEASE' })

    const publishArgs = ['changeset', 'publish']

    if (options.tag) {
      publishArgs.push('--tag', options.tag)
    }

    this.run(publishArgs.join(' '))
  }

  // 推送到远程
  private async pushToRemote() {
    logger.info('推送到远程...', { prefix: 'RELEASE' })
    this.run('git push origin --follow-tags')
  }

  // 回滚发布
  async rollback(version: string) {
    logger.info(`回滚到版本 ${version}...`, { prefix: 'RELEASE' })

    try {
      // 回滚 Git 标签
      this.run(`git tag -d v${version}`)
      this.run(`git push origin :refs/tags/v${version}`)

      // 回滚 Git 提交
      this.run('git reset --hard HEAD~1')
      this.run('git push origin --force-with-lease')

      logger.success('回滚完成', { prefix: 'RELEASE' })
    }
    catch (error) {
      logger.error('回滚失败', error as Error, { prefix: 'RELEASE' })
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
