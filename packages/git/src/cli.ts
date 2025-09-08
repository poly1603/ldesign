/**
 * 统一命令入口：支持增强模式（默认）与经典模式（--classic / classic 子命令 / LGIT_MODE=classic）
 */
import { EnhancedCLI } from './cli/enhanced-cli.js'
import { GitCLI } from './cli/git-cli.js'

async function runUnifiedCLI(): Promise<void> {
  const argv = process.argv
  const args = argv.slice(2)

  // 模式选择：优先命令行，再读环境变量
  const explicitClassic = args.includes('--classic') || args[0] === 'classic'
  const envClassic = (process.env.LGIT_MODE || '').toLowerCase() === 'classic'
  const mode: 'classic' | 'enhanced' = (explicitClassic || envClassic) ? 'classic' : 'enhanced'

  if (mode === 'classic') {
    // 过滤掉切换标记，传给经典 CLI
    const filteredArgs = args.filter(a => a !== '--classic' && a !== 'classic')
    const classicArgv = argv.slice(0, 2).concat(filteredArgs)

    const cli = new GitCLI()
    cli.run(classicArgv)
    return
  }

  // 增强模式（默认）
  const cli = new EnhancedCLI()
  await cli.run()
}

runUnifiedCLI().catch(err => {
  console.error('CLI error:', err)
  process.exit(1)
})
