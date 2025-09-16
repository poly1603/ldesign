/**
 * 监听命令实现
 */

import { Command } from 'commander'
import { LibraryBuilder } from '../../core/LibraryBuilder'
import { logger } from '../../utils/logger'
import type { BuilderConfig } from '../../types/config'

export const watchCommand = new Command('watch')
  .description('监听文件变化并自动构建')
  .option('-f, --format <formats>', '指定输出格式 (esm,cjs,umd)', 'esm,cjs')
  .option('-o, --outDir <dir>', '指定输出目录', 'dist')
  .option('--minify', '压缩输出')
  .option('--sourcemap', '生成 source map', true)
  .action(async (options) => {
    try {
      logger.info('启动监听模式...')

      const builder = new LibraryBuilder({
        logger,
        autoDetect: true
      })

      await builder.initialize()

      const config: BuilderConfig = {
        output: {
          dir: options.outDir,
          format: options.format.split(','),
          sourcemap: options.sourcemap
        },
        minify: options.minify
      }

      const watcher = await builder.buildWatch(config)

      // 监听构建事件
      watcher.on('change', (file) => {
        logger.info(`文件变化: ${file}`)
      })

      watcher.on('build', (_result) => {
        logger.success('构建完成')
      })

      // 保持进程运行
      process.on('SIGINT', async () => {
        logger.info('停止监听...')
        await watcher.close()
        await builder.dispose()
        process.exit(0)
      })

      logger.success('监听模式已启动，按 Ctrl+C 停止')

    } catch (error) {
      logger.error('监听失败:', error)
      process.exit(1)
    }
  })
