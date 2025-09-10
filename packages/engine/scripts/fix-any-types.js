#!/usr/bin/env node

/**
 * 批量修复 any 类型的脚本
 */

import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'
import { join } from 'path'

const srcDir = join(process.cwd(), 'src')

// 常见的 any 类型替换规则
const replacements = [
  // 函数参数中的 any[]
  { from: /\.\.\.args: any\[\]/g, to: '...args: unknown[]' },
  
  // 泛型默认值
  { from: /<T = any>/g, to: '<T = unknown>' },
  
  // 对象类型
  { from: /Record<string, any>/g, to: 'Record<string, unknown>' },
  
  // 函数参数
  { from: /\(([^)]*): any\)/g, to: '($1: unknown)' },
  
  // 变量声明
  { from: /: any\[\]/g, to: ': unknown[]' },
  { from: /: any;/g, to: ': unknown;' },
  { from: /: any,/g, to: ': unknown,' },
  { from: /: any\)/g, to: ': unknown)' },
  { from: /: any\s*=/g, to: ': unknown =' },
  
  // 返回类型
  { from: /\): any/g, to: '): unknown' },
  
  // 类型断言
  { from: / as any/g, to: ' as unknown' },
]

// 需要特殊处理的文件模式
const specialCases = {
  // 事件相关文件可能需要更具体的类型
  'event': [
    { from: /data\?: any/g, to: 'data?: unknown' },
    { from: /EventHandler<any>/g, to: 'EventHandler<unknown>' },
  ],
  
  // 配置相关文件
  'config': [
    { from: /ConfigValue = any/g, to: 'ConfigValue = unknown' },
  ],
  
  // 插件相关文件
  'plugin': [
    { from: /PluginOptions = any/g, to: 'PluginOptions = Record<string, unknown>' },
  ]
}

async function fixAnyTypes() {
  try {
    // 获取所有 TypeScript 文件
    const files = await glob('**/*.ts', { cwd: srcDir })
    
    console.log(`Found ${files.length} TypeScript files`)
    
    let totalReplacements = 0
    
    for (const file of files) {
      const filePath = join(srcDir, file)
      let content = readFileSync(filePath, 'utf-8')
      let fileReplacements = 0
      
      // 应用通用替换规则
      for (const rule of replacements) {
        const matches = content.match(rule.from)
        if (matches) {
          content = content.replace(rule.from, rule.to)
          fileReplacements += matches.length
        }
      }
      
      // 应用特殊规则
      for (const [pattern, rules] of Object.entries(specialCases)) {
        if (file.includes(pattern)) {
          for (const rule of rules) {
            const matches = content.match(rule.from)
            if (matches) {
              content = content.replace(rule.from, rule.to)
              fileReplacements += matches.length
            }
          }
        }
      }
      
      if (fileReplacements > 0) {
        writeFileSync(filePath, content, 'utf-8')
        console.log(`Fixed ${fileReplacements} any types in ${file}`)
        totalReplacements += fileReplacements
      }
    }
    
    console.log(`\nTotal replacements: ${totalReplacements}`)
    console.log('Any type fixing completed!')
    
  } catch (error) {
    console.error('Error fixing any types:', error)
    process.exit(1)
  }
}

fixAnyTypes()
