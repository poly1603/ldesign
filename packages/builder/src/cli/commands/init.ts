/**
 * 初始化命令实现
 */

import { Command } from 'commander'

export const initCommand = new Command('init')
  .description('初始化项目配置')
  .action(async () => {
    console.log('初始化命令暂未实现')
  })
