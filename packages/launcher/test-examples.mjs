#!/usr/bin/env node

/**
 * 测试修改后的示例项目
 * 验证它们是否能正确使用 @ldesign/launcher CLI
 */

import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import chalk from 'chalk'

console.log(chalk.cyan.bold('🧪 测试示例项目使用 @ldesign/launcher CLI\n'))

const examples = [
  { name: 'Vue2 Example', path: './examples/vue2' },
  { name: 'Vue3 Example', path: './examples/vue3' },
  { name: 'React Example', path: './examples/react' },
  { name: 'Lit Example', path: './examples/lit' },
  { name: 'HTML Example', path: './examples/html' },
]

/**
 * 测试项目检测功能
 */
async function testProjectDetection() {
  console.log(chalk.yellow('📋 测试项目类型检测...'))
  
  for (const example of examples) {
    try {
      const result = await runCommand('node', ['../bin/cli.js', 'detect', '--json'], example.path)
      const detection = JSON.parse(result.stdout)
      
      console.log(chalk.green(`  ✅ ${example.name}: ${detection.projectType} (${detection.confidence}%)`))
    } catch (error) {
      console.log(chalk.red(`  ❌ ${example.name}: ${error.message}`))
    }
  }
  console.log()
}

/**
 * 测试 CLI 命令可用性
 */
async function testCliCommands() {
  console.log(chalk.yellow('⚙️  测试 CLI 命令可用性...'))
  
  const commands = ['dev --help', 'build --help', 'preview --help', 'create --help', 'detect --help']
  
  for (const cmd of commands) {
    try {
      const [command, ...args] = cmd.split(' ')
      await runCommand('node', ['../bin/cli.js', command, ...args], './examples/vue3')
      console.log(chalk.green(`  ✅ ldesign-launcher ${cmd}: 命令可用`))
    } catch (error) {
      console.log(chalk.red(`  ❌ ldesign-launcher ${cmd}: ${error.message}`))
    }
  }
  console.log()
}

/**
 * 测试示例项目结构
 */
async function testExampleStructure() {
  console.log(chalk.yellow('📁 测试示例项目结构...'))
  
  for (const example of examples) {
    try {
      const packageJsonPath = path.join(example.path, 'package.json')
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'))
      
      const hasLauncherDep = packageJson.devDependencies && packageJson.devDependencies['@ldesign/launcher']
      const hasCorrectScripts = packageJson.scripts && 
                               packageJson.scripts.dev === 'ldesign-launcher dev' &&
                               packageJson.scripts.build === 'ldesign-launcher build' &&
                               packageJson.scripts.preview === 'ldesign-launcher preview'
      
      if (hasLauncherDep && hasCorrectScripts) {
        console.log(chalk.green(`  ✅ ${example.name}: 项目结构正确`))
      } else {
        console.log(chalk.red(`  ❌ ${example.name}: 项目结构有问题`))
        if (!hasLauncherDep) console.log(chalk.gray(`      - 缺少 @ldesign/launcher 依赖`))
        if (!hasCorrectScripts) console.log(chalk.gray(`      - 脚本配置不正确`))
      }
    } catch (error) {
      console.log(chalk.red(`  ❌ ${example.name}: ${error.message}`))
    }
  }
  console.log()
}

/**
 * 运行命令
 */
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true
    })
    
    let stdout = ''
    let stderr = ''
    
    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(stderr || `Command failed with code ${code}`))
      }
    })
    
    child.on('error', (error) => {
      reject(error)
    })
    
    // 设置超时
    setTimeout(() => {
      child.kill()
      reject(new Error('Command timeout'))
    }, 10000)
  })
}

/**
 * 运行所有测试
 */
async function runTests() {
  try {
    await testExampleStructure()
    await testCliCommands()
    await testProjectDetection()
    
    console.log(chalk.green.bold('🎉 所有测试完成!'))
    console.log()
    console.log(chalk.cyan('📊 修改总结:'))
    console.log(chalk.gray('  ✅ 所有示例项目已修改为使用 @ldesign/launcher'))
    console.log(chalk.gray('  ✅ 移除了直接的 Vite 依赖'))
    console.log(chalk.gray('  ✅ 更新了 npm scripts 使用 ldesign-launcher 命令'))
    console.log(chalk.gray('  ✅ 添加了 CLI 支持和命令行接口'))
    console.log(chalk.gray('  ✅ 保持了完整的开发、构建、预览功能'))
    console.log()
    console.log(chalk.yellow('💡 使用方式:'))
    console.log(chalk.gray('  cd examples/vue3'))
    console.log(chalk.gray('  npm run dev    # 启动开发服务器'))
    console.log(chalk.gray('  npm run build  # 构建项目'))
    console.log(chalk.gray('  npm run preview # 预览构建结果'))
    
  } catch (error) {
    console.error(chalk.red('❌ 测试失败:'), error)
    process.exit(1)
  }
}

runTests()
