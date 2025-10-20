#!/usr/bin/env node
/**
 * 路由类型生成器CLI
 * @module cli
 */

import type { RouteTypeGeneratorOptions } from './RouteTypeGenerator';
import * as fs from 'node:fs'
import * as path from 'node:path'
import { program } from 'commander'
import { RouteTypeGenerator } from './RouteTypeGenerator'

/**
 * CLI配置接口
 */
interface CLIConfig extends RouteTypeGeneratorOptions {
  configFile?: string
}

/**
 * 加载配置文件
 */
async function loadConfig(configPath: string): Promise<RouteTypeGeneratorOptions | null> {
  const resolvedPath = path.resolve(configPath)
  
  if (!fs.existsSync(resolvedPath)) {
    return null
  }

  try {
    const config = await import(resolvedPath)
    return config.default || config
  } catch (error) {
    console.error(`Failed to load config file: ${error}`)
    return null
  }
}

/**
 * 合并配置
 */
function mergeConfig(
  fileConfig: RouteTypeGeneratorOptions | null,
  cliConfig: CLIConfig
): RouteTypeGeneratorOptions {
  const { configFile, ...cliOptions } = cliConfig
  
  return {
    ...fileConfig,
    ...Object.fromEntries(
      Object.entries(cliOptions).filter(([_, value]) => value !== undefined)
    )
  }
}

// 设置CLI
program
  .name('route-type-gen')
  .description('Generate TypeScript types for Vue Router routes')
  .version('1.0.0')

// generate 命令
program
  .command('generate')
  .alias('gen')
  .description('Generate route types')
  .option('-r, --routes <path>', 'Path to routes file', './src/routes.ts')
  .option('-o, --output-dir <path>', 'Output directory', './src/types')
  .option('-f, --output-file <name>', 'Output file name', 'route-types.ts')
  .option('--params', 'Generate param types', true)
  .option('--no-params', 'Do not generate param types')
  .option('--query', 'Generate query types', true)
  .option('--no-query', 'Do not generate query types')
  .option('--meta', 'Generate meta types', true)
  .option('--no-meta', 'Do not generate meta types')
  .option('--guards', 'Generate guard types', true)
  .option('--no-guards', 'Do not generate guard types')
  .option('--strict', 'Enable strict mode', false)
  .option('--watch', 'Watch for changes', false)
  .option('--enums', 'Generate enums', true)
  .option('--no-enums', 'Do not generate enums')
  .option('--unions', 'Generate union types', true)
  .option('--no-unions', 'Do not generate union types')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options: CLIConfig) => {
    try {
      // 加载配置文件
      let fileConfig: RouteTypeGeneratorOptions | null = null
      
      if (options.configFile) {
        fileConfig = await loadConfig(options.configFile)
        if (!fileConfig) {
          console.warn(`Config file not found: ${options.configFile}`)
        }
      } else {
        // 尝试加载默认配置文件
        const defaultConfigs = [
          'route-types.config.js',
          'route-types.config.ts',
          '.route-typesrc.js',
          '.route-typesrc.json'
        ]
        
        for (const configName of defaultConfigs) {
          fileConfig = await loadConfig(configName)
          if (fileConfig) {
            console.log(`Using config file: ${configName}`)
            break
          }
        }
      }

      // 合并配置
      const finalConfig = mergeConfig(fileConfig, {
        routesPath: options.routes,
        outputDir: options.outputDir,
        outputFileName: options.outputFile,
        generateParams: options.params,
        generateQuery: options.query,
        generateMeta: options.meta,
        generateGuards: options.guards,
        strictMode: options.strict,
        watch: options.watch,
        generateEnums: options.enums,
        generateUnions: options.unions
      })

      // 创建生成器
      const generator = new RouteTypeGenerator(finalConfig)
      
      // 生成类型
      await generator.generate()
      
      // 如果不是watch模式，生成声明文件
      if (!options.watch) {
        await generator.generateDeclaration()
      }
      
      console.log('✅ Type generation completed successfully!')
    } catch (error) {
      console.error('❌ Type generation failed:', error)
      process.exit(1)
    }
  })

// clean 命令
program
  .command('clean')
  .description('Clean generated files')
  .option('-o, --output-dir <path>', 'Output directory', './src/types')
  .option('-f, --output-file <name>', 'Output file name', 'route-types.ts')
  .action((options) => {
    try {
      const generator = new RouteTypeGenerator({
        outputDir: options.outputDir,
        outputFileName: options.outputFile
      })
      
      generator.clean()
      console.log('✅ Clean completed successfully!')
    } catch (error) {
      console.error('❌ Clean failed:', error)
      process.exit(1)
    }
  })

// watch 命令
program
  .command('watch')
  .description('Watch routes file and regenerate types on change')
  .option('-r, --routes <path>', 'Path to routes file', './src/routes.ts')
  .option('-o, --output-dir <path>', 'Output directory', './src/types')
  .option('-f, --output-file <name>', 'Output file name', 'route-types.ts')
  .option('-c, --config <path>', 'Path to config file')
  .action(async (options: CLIConfig) => {
    try {
      // 加载配置
      let fileConfig: RouteTypeGeneratorOptions | null = null
      if (options.configFile) {
        fileConfig = await loadConfig(options.configFile)
      }

      const finalConfig = mergeConfig(fileConfig, {
        routesPath: options.routes,
        outputDir: options.outputDir,
        outputFileName: options.outputFile,
        watch: true
      })

      // 创建生成器
      const generator = new RouteTypeGenerator(finalConfig)
      
      // 生成类型并启动监听
      await generator.generate()
      
      console.log('👀 Watching for changes... Press Ctrl+C to stop.')
      
      // 保持进程运行
      process.on('SIGINT', () => {
        generator.stopWatcher()
        console.log('\n👋 Bye!')
        process.exit(0)
      })
    } catch (error) {
      console.error('❌ Watch failed:', error)
      process.exit(1)
    }
  })

// init 命令 - 初始化配置文件
program
  .command('init')
  .description('Initialize configuration file')
  .option('-t, --type <type>', 'Config file type (js, ts, json)', 'js')
  .action((options) => {
    const configContent: Record<string, string> = {
      js: `/**
 * 路由类型生成器配置文件
 * @type {import('@ldesign/router').RouteTypeGeneratorOptions}
 */
module.exports = {
  // 路由文件路径
  routesPath: './src/routes.ts',
  
  // 输出目录
  outputDir: './src/types',
  
  // 输出文件名
  outputFileName: 'route-types.ts',
  
  // 生成选项
  generateParams: true,
  generateQuery: true,
  generateMeta: true,
  generateGuards: true,
  generateEnums: true,
  generateUnions: true,
  
  // 严格模式
  strictMode: false,
  
  // 监听文件变化
  watch: false,
  
  // 自定义转换器
  customTransformers: [],
  
  // 模板配置
  templates: {
    // header: '// Custom header',
    // footer: '// Custom footer'
  }
}
`,
      ts: `/**
 * 路由类型生成器配置文件
 */
import type { RouteTypeGeneratorOptions } from '@ldesign/router'

const config: RouteTypeGeneratorOptions = {
  // 路由文件路径
  routesPath: './src/routes.ts',
  
  // 输出目录
  outputDir: './src/types',
  
  // 输出文件名
  outputFileName: 'route-types.ts',
  
  // 生成选项
  generateParams: true,
  generateQuery: true,
  generateMeta: true,
  generateGuards: true,
  generateEnums: true,
  generateUnions: true,
  
  // 严格模式
  strictMode: false,
  
  // 监听文件变化
  watch: false,
  
  // 自定义转换器
  customTransformers: [],
  
  // 模板配置
  templates: {
    // header: '// Custom header',
    // footer: '// Custom footer'
  }
}

export default config
`,
      json: `{
  "routesPath": "./src/routes.ts",
  "outputDir": "./src/types",
  "outputFileName": "route-types.ts",
  "generateParams": true,
  "generateQuery": true,
  "generateMeta": true,
  "generateGuards": true,
  "generateEnums": true,
  "generateUnions": true,
  "strictMode": false,
  "watch": false
}
`
    }

    const fileNames: Record<string, string> = {
      js: 'route-types.config.js',
      ts: 'route-types.config.ts',
      json: '.route-typesrc.json'
    }

    const fileName = fileNames[options.type] || fileNames.js
    const content = configContent[options.type] || configContent.js

    try {
      fs.writeFileSync(fileName, content, 'utf-8')
      console.log(`✅ Config file created: ${fileName}`)
    } catch (error) {
      console.error('❌ Failed to create config file:', error)
      process.exit(1)
    }
  })

// 解析命令行参数
program.parse(process.argv)

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp()
}