/**
 * 监听命令实现
 */

import { Command } from 'commander'

export const watchCommand = new Command('watch')
  .description('监听文件变化并自动构建')
  .action(async () => {
    console.log('监听命令暂未实现')
  })
