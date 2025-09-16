/**
 * 监听命令实现
 */

import { Command } from 'commander'
import { LibraryBuilder } from '../../core/LibraryBuilder'
import { logger } from '../../utils/logger'

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
        formats: options.format.split(','),
        outDir: options.outDir,
        minify: options.minify,
        sourcemap: options.sourcemap,
        watch: true
      })

      await builder.build()

      // 保持进程运行
      process.on('SIGINT', () => {
        logger.info('停止监听...')
        process.exit(0)
      })

    } catch (error) {
      logger.error('监听失败:', error)
      process.exit(1)
    }
  })
