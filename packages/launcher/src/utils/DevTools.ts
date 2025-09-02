import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'
import type { ProjectType } from '../types/index.js'
import { createLogger } from '../services/Logger.js'

const logger = createLogger('DevTools')

/**
 * 包管理器类型
 */
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun'

/**
 * 依赖信息
 */
export interface DependencyInfo {
  name: string
  version: string
  type: 'dependency' | 'devDependency' | 'peerDependency'
  description?: string
}

/**
 * 脚手架选项
 */
export interface ScaffoldOptions {
  template?: string
  packageManager?: PackageManager
  git?: boolean
  install?: boolean
  skipPrompts?: boolean
}

/**
 * 开发工具类
 * 提供自动化依赖安装、配置生成等开发辅助功能
 */
export class DevTools {
  /**
   * 检测项目中使用的包管理器
   * @param projectPath 项目路径
   * @returns 检测到的包管理器
   */
  static async detectPackageManager(projectPath: string): Promise<PackageManager> {
    try {
      const files = await fs.readdir(projectPath)
      
      // 按优先级检查锁文件
      if (files.includes('bun.lockb')) return 'bun'
      if (files.includes('pnpm-lock.yaml')) return 'pnpm'
      if (files.includes('yarn.lock')) return 'yarn'
      if (files.includes('package-lock.json')) return 'npm'
      
      // 检查全局安装的包管理器
      const availableManagers: PackageManager[] = []
      
      for (const manager of ['bun', 'pnpm', 'yarn', 'npm'] as PackageManager[]) {
        try {
          execSync(`${manager} --version`, { stdio: 'ignore' })
          availableManagers.push(manager)
        } catch {
          // 管理器不可用
        }
      }
      
      // 返回最优选择
      const preferredOrder: PackageManager[] = ['pnpm', 'yarn', 'bun', 'npm']
      for (const manager of preferredOrder) {
        if (availableManagers.includes(manager)) {
          return manager
        }
      }
      
      return 'npm' // 默认使用 npm
    } catch (error) {
      logger.warn(`检测包管理器失败: ${(error as Error).message}，使用默认 npm`)
      return 'npm'
    }
  }

  /**
   * 安装依赖
   * @param projectPath 项目路径
   * @param dependencies 依赖列表
   * @param options 安装选项
   */
  static async installDependencies(
    projectPath: string,
    dependencies: DependencyInfo[] = [],
    options: { packageManager?: PackageManager, dev?: boolean } = {}
  ): Promise<void> {
    const packageManager = options.packageManager || await this.detectPackageManager(projectPath)
    
    if (dependencies.length === 0) {
      // 安装所有依赖
      logger.info(`使用 ${packageManager} 安装项目依赖...`)
      await this.runCommand(packageManager, ['install'], projectPath)
    } else {
      // 安装指定依赖
      const devDeps = dependencies.filter(dep => dep.type === 'devDependency')
      const regularDeps = dependencies.filter(dep => dep.type === 'dependency')
      
      if (regularDeps.length > 0) {
        const deps = regularDeps.map(dep => `${dep.name}@${dep.version}`)
        logger.info(`安装生产依赖: ${deps.join(', ')}`)
        await this.runCommand(packageManager, ['add', ...deps], projectPath)
      }
      
      if (devDeps.length > 0) {
        const deps = devDeps.map(dep => `${dep.name}@${dep.version}`)
        logger.info(`安装开发依赖: ${deps.join(', ')}`)
        
        let devFlag = '--save-dev'
        if (packageManager === 'yarn') devFlag = '--dev'
        if (packageManager === 'pnpm') devFlag = '--save-dev'
        if (packageManager === 'bun') devFlag = '--dev'
        
        await this.runCommand(packageManager, ['add', devFlag, ...deps], projectPath)
      }
    }
    
    logger.success('依赖安装完成')
  }

  /**
   * 生成 TypeScript 配置文件
   * @param projectPath 项目路径
   * @param projectType 项目类型
   */
  static async generateTsConfig(projectPath: string, projectType: ProjectType): Promise<void> {
    const tsConfigPath = path.join(projectPath, 'tsconfig.json')
    
    let tsConfig: any = {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        skipLibCheck: true,
        moduleResolution: 'bundler',
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue'],
      exclude: ['node_modules']
    }

    // 根据项目类型调整配置
    switch (projectType) {
      case 'react':
        tsConfig.compilerOptions.jsx = 'react-jsx'
        break
      case 'vue2':
      case 'vue3':
        tsConfig.compilerOptions.jsx = 'preserve'
        tsConfig.compilerOptions.jsxImportSource = 'vue'
        break
      case 'lit':
        tsConfig.compilerOptions.experimentalDecorators = true
        tsConfig.compilerOptions.useDefineForClassFields = false
        break
    }
    
    await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2))
    logger.info('已生成 tsconfig.json')
  }

  /**
   * 生成 ESLint 配置文件
   * @param projectPath 项目路径
   * @param projectType 项目类型
   */
  static async generateEslintConfig(projectPath: string, projectType: ProjectType): Promise<void> {
    const eslintConfigPath = path.join(projectPath, '.eslintrc.js')
    
    let config = `module.exports = {
  env: {
    browser: true,
    es2020: true,
  },
  extends: [
    'eslint:recommended',`
    
    // 根据项目类型添加配置
    switch (projectType) {
      case 'react':
        config += `
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',`
        break
      case 'vue2':
        config += `
    'plugin:vue/essential',`
        break
      case 'vue3':
        config += `
    'plugin:vue/vue3-essential',`
        break
    }
    
    if (projectType.includes('ts') || projectType === 'lit') {
      config += `
    '@typescript-eslint/recommended',`
    }
    
    config += `
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',`
    
    if (projectType === 'react') {
      config += `
    ecmaFeatures: {
      jsx: true,
    },`
    }
    
    config += `
  },
  plugins: [`
    
    const plugins = []
    if (projectType === 'react') plugins.push("'react'")
    if (projectType.includes('vue')) plugins.push("'vue'")
    if (projectType.includes('ts') || projectType === 'lit') plugins.push("'@typescript-eslint'")
    
    config += plugins.join(', ')
    
    config += `],
  rules: {
    // 在这里添加自定义规则
  },
  settings: {`
    
    if (projectType === 'react') {
      config += `
    react: {
      version: 'detect',
    },`
    }
    
    config += `
  },
}`
    
    await fs.writeFile(eslintConfigPath, config)
    logger.info('已生成 .eslintrc.js')
  }

  /**
   * 生成 Prettier 配置文件
   * @param projectPath 项目路径
   */
  static async generatePrettierConfig(projectPath: string): Promise<void> {
    const prettierConfigPath = path.join(projectPath, '.prettierrc')
    
    const config = {
      semi: true,
      trailingComma: 'es5' as const,
      singleQuote: true,
      printWidth: 80,
      tabWidth: 2,
      useTabs: false,
    }
    
    await fs.writeFile(prettierConfigPath, JSON.stringify(config, null, 2))
    logger.info('已生成 .prettierrc')
  }

  /**
   * 初始化 Git 仓库
   * @param projectPath 项目路径
   */
  static async initGitRepository(projectPath: string): Promise<void> {
    try {
      await this.runCommand('git', ['init'], projectPath)
      
      // 生成 .gitignore
      const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS generated files
Thumbs.db

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
`
      
      await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreContent)
      await this.runCommand('git', ['add', '.'], projectPath)
      await this.runCommand('git', ['commit', '-m', 'Initial commit'], projectPath)
      
      logger.success('Git 仓库初始化完成')
    } catch (error) {
      logger.warn(`Git 初始化失败: ${(error as Error).message}`)
    }
  }

  /**
   * 升级项目依赖
   * @param projectPath 项目路径
   * @param packages 要升级的包名列表，为空则升级所有
   */
  static async upgradeDependencies(
    projectPath: string, 
    packages: string[] = []
  ): Promise<void> {
    const packageManager = await this.detectPackageManager(projectPath)
    
    logger.info('正在检查依赖更新...')
    
    try {
      if (packageManager === 'npm') {
        if (packages.length === 0) {
          await this.runCommand('npm', ['update'], projectPath)
        } else {
          await this.runCommand('npm', ['install', ...packages.map(p => `${p}@latest`)], projectPath)
        }
      } else if (packageManager === 'yarn') {
        if (packages.length === 0) {
          await this.runCommand('yarn', ['upgrade'], projectPath)
        } else {
          await this.runCommand('yarn', ['add', ...packages.map(p => `${p}@latest`)], projectPath)
        }
      } else if (packageManager === 'pnpm') {
        if (packages.length === 0) {
          await this.runCommand('pnpm', ['update'], projectPath)
        } else {
          await this.runCommand('pnpm', ['add', ...packages.map(p => `${p}@latest`)], projectPath)
        }
      } else if (packageManager === 'bun') {
        if (packages.length === 0) {
          await this.runCommand('bun', ['update'], projectPath)
        } else {
          await this.runCommand('bun', ['add', ...packages.map(p => `${p}@latest`)], projectPath)
        }
      }
      
      logger.success('依赖升级完成')
    } catch (error) {
      logger.error(`依赖升级失败: ${(error as Error).message}`)
      throw error
    }
  }

  /**
   * 生成项目脚本
   * @param projectPath 项目路径
   * @param projectType 项目类型
   */
  static async generateScripts(projectPath: string, projectType: ProjectType): Promise<void> {
    const packageJsonPath = path.join(projectPath, 'package.json')
    
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
      const packageJson = JSON.parse(packageJsonContent)
      
      // 基础脚本
      const baseScripts = {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      }
      
      // 根据项目类型添加特定脚本
      let additionalScripts: Record<string, string> = {}
      
      switch (projectType) {
        case 'vue2':
        case 'vue3':
          additionalScripts = {
            'build:analyze': 'vite build --mode analyze',
            'type-check': 'vue-tsc --noEmit'
          }
          break
        case 'react':
          additionalScripts = {
            'build:analyze': 'vite build --mode analyze',
            'type-check': 'tsc --noEmit'
          }
          break
        case 'vanilla-ts':
        case 'lit':
          additionalScripts = {
            'type-check': 'tsc --noEmit',
            'build:types': 'tsc --emitDeclarationOnly'
          }
          break
      }
      
      // 通用工具脚本
      const toolingScripts = {
        lint: 'eslint . --ext .js,.jsx,.ts,.tsx,.vue --fix',
        format: 'prettier --write "src/**/*.{js,jsx,ts,tsx,vue,css,scss,md}"',
        clean: 'rimraf dist node_modules/.vite',
      }
      
      // 合并所有脚本
      packageJson.scripts = {
        ...baseScripts,
        ...additionalScripts,
        ...toolingScripts,
        ...packageJson.scripts // 保留已存在的脚本
      }
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2))
      logger.info('已更新 package.json 脚本')
    } catch (error) {
      logger.error(`生成脚本失败: ${(error as Error).message}`)
    }
  }

  /**
   * 安装推荐的开发工具
   * @param projectPath 项目路径
   * @param projectType 项目类型
   */
  static async installDevTools(projectPath: string, projectType: ProjectType): Promise<void> {
    logger.info('安装推荐的开发工具...')
    
    const commonDevTools: DependencyInfo[] = [
      { name: 'eslint', version: '^8.0.0', type: 'devDependency' },
      { name: 'prettier', version: '^3.0.0', type: 'devDependency' },
      { name: 'rimraf', version: '^5.0.0', type: 'devDependency' },
    ]
    
    // 根据项目类型添加特定工具
    let specificTools: DependencyInfo[] = []
    
    switch (projectType) {
      case 'react':
        specificTools = [
          { name: 'eslint-plugin-react', version: '^7.0.0', type: 'devDependency' },
          { name: 'eslint-plugin-react-hooks', version: '^4.0.0', type: 'devDependency' },
          { name: '@typescript-eslint/eslint-plugin', version: '^6.0.0', type: 'devDependency' },
          { name: '@typescript-eslint/parser', version: '^6.0.0', type: 'devDependency' },
        ]
        break
      case 'vue2':
      case 'vue3':
        specificTools = [
          { name: 'eslint-plugin-vue', version: '^9.0.0', type: 'devDependency' },
          { name: 'vue-tsc', version: '^1.0.0', type: 'devDependency' },
        ]
        break
      case 'vanilla-ts':
      case 'lit':
        specificTools = [
          { name: '@typescript-eslint/eslint-plugin', version: '^6.0.0', type: 'devDependency' },
          { name: '@typescript-eslint/parser', version: '^6.0.0', type: 'devDependency' },
        ]
        break
    }
    
    const allTools = [...commonDevTools, ...specificTools]
    await this.installDependencies(projectPath, allTools)
    
    // 生成配置文件
    await this.generateEslintConfig(projectPath, projectType)
    await this.generatePrettierConfig(projectPath)
    
    if (projectType.includes('ts') || projectType === 'lit' || projectType === 'react') {
      await this.generateTsConfig(projectPath, projectType)
    }
    
    // 更新脚本
    await this.generateScripts(projectPath, projectType)
    
    logger.success('开发工具安装完成')
  }

  /**
   * 执行命令
   * @param command 命令
   * @param args 参数
   * @param cwd 工作目录
   */
  private static async runCommand(
    command: string, 
    args: string[] = [], 
    cwd: string = process.cwd()
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const fullCommand = `${command} ${args.join(' ')}`
      logger.debug(`执行命令: ${fullCommand}`)
      
      try {
        execSync(fullCommand, { 
          cwd, 
          stdio: 'inherit',
          encoding: 'utf-8'
        })
        resolve()
      } catch (error) {
        logger.error(`命令执行失败: ${fullCommand}`)
        reject(error)
      }
    })
  }

  /**
   * 检查命令是否可用
   * @param command 命令名
   * @returns 是否可用
   */
  static isCommandAvailable(command: string): boolean {
    try {
      execSync(`${command} --version`, { stdio: 'ignore' })
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取包的最新版本
   * @param packageName 包名
   * @returns 最新版本
   */
  static async getLatestVersion(packageName: string): Promise<string> {
    try {
      const result = execSync(`npm view ${packageName} version`, { 
        encoding: 'utf-8',
        stdio: 'pipe'
      })
      return result.trim()
    } catch (error) {
      logger.warn(`获取 ${packageName} 最新版本失败: ${(error as Error).message}`)
      return 'latest'
    }
  }
}
