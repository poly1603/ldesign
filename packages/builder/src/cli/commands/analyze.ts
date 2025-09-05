/**
 * 分析命令实现
 */

import { Command } from 'commander'

export const analyzeCommand = new Command('analyze')
  .description('分析构建结果')
  .action(async () => {
    console.log('分析命令暂未实现')
  })
