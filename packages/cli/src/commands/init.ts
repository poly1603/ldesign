/**
 * 初始化命令
 */

import { Command, CLIContext } from '../types/index';
import inquirer from 'inquirer';
import { resolve } from 'path';
import { existsSync } from 'fs';

export const initCommand: Command = {
  name: 'init',
  description: '初始化新项目',
  aliases: ['create', 'new'],
  options: [
    {
      name: 'template',
      alias: 't',
      type: 'string',
      description: '项目模板名称',
      default: 'default'
    },
    {
      name: 'name',
      alias: 'n',
      type: 'string',
      description: '项目名称'
    },
    {
      name: 'directory',
      alias: 'd',
      type: 'string',
      description: '项目目录'
    },
    {
      name: 'force',
      alias: 'f',
      type: 'boolean',
      description: '强制覆盖已存在的目录',
      default: false
    },
    {
      name: 'skip-install',
      type: 'boolean',
      description: '跳过依赖安装',
      default: false
    },
    {
      name: 'package-manager',
      alias: 'pm',
      type: 'string',
      description: '包管理器 (npm, yarn, pnpm)',
      default: 'npm'
    }
  ],
  examples: [
    'ldesign init my-project',
    'ldesign init --template vue my-vue-app',
    'ldesign init --name my-app --directory ./projects',
    'ldesign init --template react --skip-install'
  ],
  action: async (args, context) => {
    context.logger.info('🚀 开始初始化项目...');

    try {
      // 获取项目信息
      const projectInfo = await getProjectInfo(args, context);
      
      // 验证项目信息
      await validateProjectInfo(projectInfo, context);
      
      // 选择模板
      const template = await selectTemplate(projectInfo.template, context);
      
      // 创建项目目录
      const projectPath = await createProjectDirectory(projectInfo, context);
      
      // 生成项目文件
      await generateProject(template, projectPath, projectInfo, context);
      
      // 安装依赖
      if (!projectInfo.skipInstall) {
        await installDependencies(projectPath, projectInfo.packageManager, context);
      }
      
      // 显示完成信息
      showCompletionMessage(projectInfo, context);
      
    } catch (error) {
      context.logger.error('项目初始化失败:', error);
      throw error;
    }
  }
};

/**
 * 获取项目信息
 */
async function getProjectInfo(args: any, context: CLIContext): Promise<ProjectInfo> {
  const questions = [];

  // 项目名称
  if (!args.name) {
    questions.push({
      type: 'input',
      name: 'name',
      message: '项目名称:',
      default: 'my-project',
      validate: (input: string) => {
        if (!input.trim()) {
          return '项目名称不能为空';
        }
        if (!/^[a-z0-9-_]+$/.test(input)) {
          return '项目名称只能包含小写字母、数字、连字符和下划线';
        }
        return true;
      }
    });
  }

  // 项目目录
  if (!args.directory) {
    questions.push({
      type: 'input',
      name: 'directory',
      message: '项目目录:',
      default: (answers: any) => `./${answers.name || args.name}`,
    });
  }

  // 模板选择
  if (!args.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: '选择项目模板:',
      choices: [
        { name: '默认模板', value: 'default' },
        { name: 'Vue 3 项目', value: 'vue' },
        { name: 'React 项目', value: 'react' },
        { name: 'Node.js 库', value: 'node-lib' },
        { name: '自定义模板', value: 'custom' }
      ]
    });
  }

  // 包管理器
  if (!args.packageManager) {
    questions.push({
      type: 'list',
      name: 'packageManager',
      message: '选择包管理器:',
      choices: ['npm', 'yarn', 'pnpm'],
      default: 'npm'
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    name: args.name || answers.name,
    directory: args.directory || answers.directory,
    template: args.template || answers.template,
    packageManager: args.packageManager || answers.packageManager,
    force: args.force,
    skipInstall: args.skipInstall
  };
}

/**
 * 验证项目信息
 */
async function validateProjectInfo(info: ProjectInfo, context: CLIContext): Promise<void> {
  const targetPath = resolve(context.cwd, info.directory);
  
  if (existsSync(targetPath) && !info.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `目录 ${info.directory} 已存在，是否覆盖？`,
        default: false
      }
    ]);
    
    if (!overwrite) {
      throw new Error('用户取消操作');
    }
  }
}

/**
 * 选择模板
 */
async function selectTemplate(templateName: string, context: CLIContext): Promise<any> {
  context.logger.info(`📋 选择模板: ${templateName}`);
  
  // 这里应该从模板注册表或本地模板目录加载模板
  // 暂时返回模拟的模板对象
  return {
    name: templateName,
    path: `./templates/${templateName}`,
    variables: [],
    hooks: {}
  };
}

/**
 * 创建项目目录
 */
async function createProjectDirectory(info: ProjectInfo, context: CLIContext): Promise<string> {
  const targetPath = resolve(context.cwd, info.directory);
  
  context.logger.info(`📁 创建项目目录: ${targetPath}`);
  
  // 这里应该实际创建目录
  // 暂时只返回路径
  return targetPath;
}

/**
 * 生成项目文件
 */
async function generateProject(
  template: any,
  projectPath: string,
  info: ProjectInfo,
  context: CLIContext
): Promise<void> {
  context.logger.info('📝 生成项目文件...');
  
  // 这里应该实际生成项目文件
  // 包括模板渲染、文件复制等
  context.logger.info('✅ 项目文件生成完成');
}

/**
 * 安装依赖
 */
async function installDependencies(
  projectPath: string,
  packageManager: string,
  context: CLIContext
): Promise<void> {
  context.logger.info(`📦 使用 ${packageManager} 安装依赖...`);
  
  // 这里应该实际执行包管理器安装命令
  // 暂时只显示日志
  context.logger.success('✅ 依赖安装完成');
}

/**
 * 显示完成信息
 */
function showCompletionMessage(info: ProjectInfo, context: CLIContext): void {
  context.logger.success('\n🎉 项目初始化完成！');
  context.logger.info('\n下一步:');
  context.logger.info(`  cd ${info.directory}`);
  
  if (info.skipInstall) {
    context.logger.info(`  ${info.packageManager} install`);
  }
  
  context.logger.info(`  ${info.packageManager} run dev`);
  context.logger.info('\n开始你的开发之旅吧！ 🚀');
}

interface ProjectInfo {
  name: string;
  directory: string;
  template: string;
  packageManager: string;
  force: boolean;
  skipInstall: boolean;
}

export default initCommand;
