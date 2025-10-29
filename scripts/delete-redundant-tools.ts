/**
 * 删除冗余的工具包 submodule 和远程 GitHub 仓库
 * 
 * 将删除：
 * - tools/tester (已合并到 tools/testing)
 * - tools/analyzer (已合并到 tools/performance)
 */

import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// 简单的颜色输出函数
const colors = {
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  gray: (text: string) => `\x1b[90m${text}\x1b[0m`,
  white: (text: string) => `\x1b[37m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
}

// GitHub 配置
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_USERNAME = 'poly1603'

// 要删除的包
const PACKAGES_TO_REMOVE = [
  {
    name: 'tester',
    path: 'tools/tester',
    repo: 'ldesign-tester',
    mergedTo: 'tools/testing',
    reason: '功能100%重复，testing更现代化'
  },
  {
    name: 'analyzer',
    path: 'tools/analyzer',
    repo: 'ldesign-analyzer',
    mergedTo: 'tools/performance',
    reason: '代码分析功能已整合到performance'
  }
]

/**
 * 执行命令
 */
function exec(command: string, silent = false): string {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    })
    return output.trim()
  } catch (error: any) {
    if (!silent) {
      console.error(colors.red(`命令执行失败: ${command}`))
      console.error(colors.red(error.message))
    }
    throw error
  }
}

/**
 * 删除本地 submodule
 */
async function removeSubmodule(submodulePath: string): Promise<void> {
  console.log(colors.cyan(`\n正在删除 submodule: ${submodulePath}`))

  try {
    // 1. Deinit submodule
    console.log(colors.gray('  1. 运行 git submodule deinit...'))
    exec(`git submodule deinit -f ${submodulePath}`, true)
    console.log(colors.green('  ✓ submodule deinit 完成'))

    // 2. 移除 git 索引
    console.log(colors.gray('  2. 运行 git rm...'))
    exec(`git rm -f ${submodulePath}`, true)
    console.log(colors.green('  ✓ git rm 完成'))

    // 3. 删除 .git/modules 目录
    const modulesPath = path.join('.git', 'modules', submodulePath)
    if (fs.existsSync(modulesPath)) {
      console.log(colors.gray('  3. 删除 .git/modules 目录...'))
      fs.rmSync(modulesPath, { recursive: true, force: true })
      console.log(colors.green('  ✓ .git/modules 目录已删除'))
    }

    console.log(colors.green(`✅ Submodule ${submodulePath} 删除成功\n`))
  } catch (error: any) {
    console.error(colors.red(`❌ 删除 submodule 失败: ${error.message}\n`))
    throw error
  }
}

/**
 * 从 .gitmodules 删除配置
 */
function updateGitmodules(submodulePath: string): void {
  const gitmodulesPath = '.gitmodules'

  if (!fs.existsSync(gitmodulesPath)) {
    console.log(colors.yellow('⚠️  .gitmodules 文件不存在'))
    return
  }

  console.log(colors.cyan(`\n更新 .gitmodules，删除 ${submodulePath} 的配置...`))

  let content = fs.readFileSync(gitmodulesPath, 'utf-8')

  // 删除对应的 submodule 配置块
  const pattern = new RegExp(
    `\\[submodule\\s+"${submodulePath.replace(/\//g, '\\/')}"\\][\\s\\S]*?(?=\\n\\[|$)`,
    'gm'
  )

  content = content.replace(pattern, '')

  // 清理多余的空行
  content = content.replace(/\n{3,}/g, '\n\n').trim() + '\n'

  fs.writeFileSync(gitmodulesPath, content, 'utf-8')
  console.log(colors.green('✅ .gitmodules 已更新\n'))
}

/**
 * 删除远程 GitHub 仓库
 */
async function deleteGitHubRepo(repoName: string): Promise<void> {
  console.log(colors.cyan(`\n正在删除 GitHub 仓库: ${repoName}`))

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'ldesign-tools'
      }
    })

    if (response.status === 204) {
      console.log(colors.green(`✅ 仓库 ${repoName} 删除成功\n`))
    } else if (response.status === 404) {
      console.log(colors.yellow(`⚠️  仓库 ${repoName} 不存在或已被删除\n`))
    } else {
      const errorText = await response.text()
      console.error(colors.red(`❌ 删除仓库失败 (${response.status}): ${errorText}\n`))
      throw new Error(`删除仓库失败: ${response.status}`)
    }
  } catch (error: any) {
    console.error(colors.red(`❌ 删除仓库失败: ${error.message}\n`))
    throw error
  }
}

/**
 * 主函数
 */
async function main() {
  console.log(colors.bold(colors.cyan('\n🗑️  开始删除冗余工具包\n')))
  console.log(colors.yellow('⚠️  警告：此操作不可逆！\n'))

  // 显示将要删除的包
  console.log(colors.bold('将要删除的包：'))
  PACKAGES_TO_REMOVE.forEach(pkg => {
    console.log(colors.white(`\n  📦 ${pkg.name}`))
    console.log(colors.gray(`     路径: ${pkg.path}`))
    console.log(colors.gray(`     仓库: ${pkg.repo}`))
    console.log(colors.gray(`     原因: ${pkg.reason}`))
    console.log(colors.gray(`     已合并到: ${pkg.mergedTo}`))
  })

  console.log(colors.yellow('\n按 Ctrl+C 取消，或等待 5 秒后自动继续...\n'))

  // 等待 5 秒
  await new Promise(resolve => setTimeout(resolve, 5000))

  const results: Array<{ package: string; submodule: boolean; repo: boolean; error?: string }> = []

  // 处理每个包
  for (const pkg of PACKAGES_TO_REMOVE) {
    console.log(colors.bold(colors.cyan(`\n${'='.repeat(60)}`)))
    console.log(colors.bold(colors.cyan(`处理: ${pkg.name}`)))
    console.log(colors.bold(colors.cyan('='.repeat(60))))

    const result = {
      package: pkg.name,
      submodule: false,
      repo: false,
      error: undefined as string | undefined
    }

    try {
      // 1. 删除 submodule
      await removeSubmodule(pkg.path)
      result.submodule = true

      // 2. 更新 .gitmodules
      updateGitmodules(pkg.path)

      // 3. 删除远程仓库
      await deleteGitHubRepo(pkg.repo)
      result.repo = true

    } catch (error: any) {
      result.error = error.message
      console.error(colors.red(`\n❌ 处理 ${pkg.name} 时出错: ${error.message}`))
    }

    results.push(result)
  }

  // 显示汇总结果
  console.log(colors.bold(colors.cyan(`\n${'='.repeat(60)}`)))
  console.log(colors.bold(colors.cyan('删除结果汇总')))
  console.log(colors.bold(colors.cyan('='.repeat(60) + '\n')))

  results.forEach(result => {
    console.log(colors.white(`📦 ${result.package}:`))
    console.log(`   Submodule: ${result.submodule ? colors.green('✅ 已删除') : colors.red('❌ 失败')}`)
    console.log(`   远程仓库: ${result.repo ? colors.green('✅ 已删除') : colors.red('❌ 失败')}`)
    if (result.error) {
      console.log(colors.red(`   错误: ${result.error}`))
    }
    console.log()
  })

  // 提示下一步
  console.log(colors.bold(colors.yellow('\n⚠️  下一步操作：')))
  console.log(colors.white('1. 检查并提交更改:'))
  console.log(colors.gray('   git status'))
  console.log(colors.gray('   git add .'))
  console.log(colors.gray('   git commit -m "refactor(tools): 合并 tester→testing, analyzer→performance, 删除冗余包"'))
  console.log(colors.white('\n2. 安装更新后的依赖:'))
  console.log(colors.gray('   pnpm install'))
  console.log(colors.white('\n3. 验证构建:'))
  console.log(colors.gray('   pnpm --filter @ldesign/testing build'))
  console.log(colors.gray('   pnpm --filter @ldesign/performance build'))

  console.log(colors.green('\n✨ 完成！\n'))
}

// 运行主函数
main().catch(error => {
  console.error(colors.red('\n💥 执行失败:'), error)
  process.exit(1)
})

