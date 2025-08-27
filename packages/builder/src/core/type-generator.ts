/**
 * 类型生成器
 * 生成TypeScript声明文件
 */

import type {
  BuildOptions,
  ProjectScanResult,
  TypeGenerationOptions,
  TypeGenerationResult,
} from '../types'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import * as ts from 'typescript'
import { Logger } from '../utils/logger'

const logger = new Logger('TypeGenerator')

export class TypeGenerator {
  private program: ts.Program | null = null
  private checker: ts.TypeChecker | null = null

  /**
   * 生成类型声明文件
   */
  async generate(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): Promise<TypeGenerationResult> {
    logger.info('开始生成TypeScript声明文件...')

    const startTime = Date.now()
    const generatedFiles: string[] = []
    const errors: string[] = []

    try {
      // 检查是否需要生成类型文件
      if (!this.shouldGenerateTypes(scanResult, buildOptions)) {
        logger.info('跳过类型生成（项目不包含TypeScript文件）')
        return {
          success: true,
          generatedFiles: [],
          errors: [],
          generationTime: 0,
        }
      }

      // 创建TypeScript程序
      await this.createProgram(scanResult, buildOptions)

      if (!this.program || !this.checker) {
        throw new Error('无法创建TypeScript程序')
      }

      // 生成声明文件
      const typeOptions = this.getTypeGenerationOptions(buildOptions)

      if (typeOptions.bundled) {
        // 生成单个bundled声明文件
        const bundledFile = await this.generateBundledTypes(scanResult, typeOptions)
        if (bundledFile) {
          generatedFiles.push(bundledFile)
        }
      }
      else {
        // 生成分离的声明文件
        const separateFiles = await this.generateSeparateTypes(scanResult, typeOptions)
        generatedFiles.push(...separateFiles)
      }

      // 生成package.json的types字段建议
      await this.generatePackageTypesField(scanResult, buildOptions, generatedFiles)

      const endTime = Date.now()
      const generationTime = endTime - startTime

      logger.info(`类型生成完成，耗时 ${generationTime}ms，生成 ${generatedFiles.length} 个文件`)

      return {
        success: true,
        generatedFiles,
        errors,
        generationTime,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push(errorMessage)
      logger.error('类型生成失败:', error)

      return {
        success: false,
        generatedFiles,
        errors,
        generationTime: Date.now() - startTime,
      }
    }
  }

  /**
   * 检查是否需要生成类型文件
   */
  private shouldGenerateTypes(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): boolean {
    // 用户明确禁用
    if (buildOptions.dts === false) {
      return false
    }

    // 检查是否有TypeScript文件
    const hasTypeScriptFiles = scanResult.files.some(file =>
      file.type === 'typescript' || file.type === 'tsx',
    )

    return hasTypeScriptFiles
  }

  /**
   * 创建TypeScript程序
   */
  private async createProgram(
    scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
  ): Promise<void> {
    try {
      // 查找tsconfig.json
      const tsconfigPath = this.findTsConfig()

      let compilerOptions: ts.CompilerOptions
      let rootNames: string[]

      if (tsconfigPath && existsSync(tsconfigPath)) {
        // 使用现有的tsconfig.json
        const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          dirname(tsconfigPath),
        )

        compilerOptions = {
          ...parsedConfig.options,
          declaration: true,
          emitDeclarationOnly: true,
          outDir: buildOptions.outDir || 'dist',
        }

        rootNames = parsedConfig.fileNames
      }
      else {
        // 使用默认配置
        compilerOptions = {
          target: ts.ScriptTarget.ES2015,
          module: ts.ModuleKind.ESNext,
          moduleResolution: ts.ModuleResolutionKind.NodeJs,
          declaration: true,
          emitDeclarationOnly: true,
          outDir: buildOptions.outDir || 'dist',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        }

        // 收集所有TypeScript文件
        rootNames = scanResult.files
          .filter(file => file.type === 'typescript' || file.type === 'tsx')
          .map(file => file.path)
      }

      // 创建程序
      this.program = ts.createProgram(rootNames, compilerOptions)
      this.checker = this.program.getTypeChecker()
    }
    catch (error) {
      logger.error('创建TypeScript程序失败:', error)
      throw error
    }
  }

  /**
   * 查找tsconfig.json
   */
  private findTsConfig(): string | null {
    const possiblePaths = [
      'tsconfig.json',
      'tsconfig.build.json',
      'src/tsconfig.json',
    ]

    for (const path of possiblePaths) {
      const fullPath = resolve(path)
      if (existsSync(fullPath)) {
        return fullPath
      }
    }

    return null
  }

  /**
   * 获取类型生成选项
   */
  private getTypeGenerationOptions(buildOptions: BuildOptions): TypeGenerationOptions {
    const defaultOptions: TypeGenerationOptions = {
      bundled: true,
      outDir: buildOptions.outDir || 'dist',
      fileName: 'index.d.ts',
      includePrivate: false,
      followSymlinks: true,
    }

    if (typeof buildOptions.dts === 'object') {
      return { ...defaultOptions, ...buildOptions.dts }
    }

    return defaultOptions
  }

  /**
   * 生成bundled类型文件
   */
  private async generateBundledTypes(
    _scanResult: ProjectScanResult,
    options: TypeGenerationOptions,
  ): Promise<string | null> {
    if (!this.program) {
      throw new Error('TypeScript程序未初始化')
    }

    try {
      // 确保输出目录存在
      const outDir = resolve(options.outDir || 'dist/types')
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true })
      }

      const outputPath = join(outDir, options.fileName || 'index.d.ts')

      // 使用TypeScript编译器API生成声明文件
      const emitResult = this.program.emit(
        undefined, // 所有文件
        (fileName, data) => {
          if (fileName.endsWith('.d.ts')) {
            writeFileSync(outputPath, data)
          }
        },
        undefined, // 取消令牌
        true, // 只生成声明文件
        undefined, // 自定义转换器
      )

      // 检查编译错误
      const diagnostics = ts.getPreEmitDiagnostics(this.program).concat(emitResult.diagnostics)

      if (diagnostics.length > 0) {
        const errors = diagnostics.map((diagnostic) => {
          if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
            return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
          }
          else {
            return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
          }
        })

        logger.warn('TypeScript编译警告:', errors.join('\n'))
      }

      if (existsSync(outputPath)) {
        logger.info(`生成bundled类型文件: ${outputPath}`)
        return outputPath
      }

      return null
    }
    catch (error) {
      logger.error('生成bundled类型文件失败:', error)
      throw error
    }
  }

  /**
   * 生成分离的类型文件
   */
  private async generateSeparateTypes(
    _scanResult: ProjectScanResult,
    options: TypeGenerationOptions,
  ): Promise<string[]> {
    if (!this.program) {
      throw new Error('TypeScript程序未初始化')
    }

    const generatedFiles: string[] = []

    try {
      // 确保输出目录存在
      const outDir = resolve(options.outDir || 'dist/types')
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true })
      }

      // 为每个源文件生成对应的声明文件
      const sourceFiles = this.program.getSourceFiles()
        .filter(sf => !sf.isDeclarationFile && !sf.fileName.includes('node_modules'))

      for (const sourceFile of sourceFiles) {
        const emitResult = this.program.emit(
          sourceFile,
          (fileName, data) => {
            if (fileName.endsWith('.d.ts')) {
              writeFileSync(fileName, data)
              generatedFiles.push(fileName)
            }
          },
          undefined,
          true,
        )

        // 处理编译错误
        if (emitResult.diagnostics.length > 0) {
          const errors = emitResult.diagnostics.map(diagnostic =>
            ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
          )
          logger.warn(`文件 ${sourceFile.fileName} 编译警告:`, errors.join('\n'))
        }
      }

      logger.info(`生成 ${generatedFiles.length} 个分离的类型文件`)
      return generatedFiles
    }
    catch (error) {
      logger.error('生成分离类型文件失败:', error)
      throw error
    }
  }

  /**
   * 生成package.json的types字段建议
   */
  private async generatePackageTypesField(
    _scanResult: ProjectScanResult,
    buildOptions: BuildOptions,
    generatedFiles: string[],
  ): Promise<void> {
    if (generatedFiles.length === 0) {
      return
    }

    try {
      const packageJsonPath = resolve('package.json')
      if (!existsSync(packageJsonPath)) {
        return
      }

      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

      // 找到主要的类型文件
      const mainTypeFile = generatedFiles.find(file =>
        basename(file) === 'index.d.ts',
      ) || generatedFiles[0]

      if (mainTypeFile) {
        const relativePath = relative(process.cwd(), mainTypeFile)

        // 检查是否需要更新package.json
        if (!packageJson.types && !packageJson.typings) {
          logger.info(`建议在package.json中添加: "types": "${relativePath}"`)

          // 可以选择自动更新package.json
          if (buildOptions.updatePackageJson) {
            packageJson.types = relativePath
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
            logger.info('已自动更新package.json的types字段')
          }
        }
      }
    }
    catch (error) {
      logger.warn('处理package.json types字段失败:', error)
    }
  }

  /**
   * 验证生成的类型文件
   */
  async validateGeneratedTypes(filePaths: string[]): Promise<boolean> {
    try {
      for (const filePath of filePaths) {
        if (!existsSync(filePath)) {
          logger.error(`类型文件不存在: ${filePath}`)
          return false
        }

        // 尝试解析类型文件
        const content = readFileSync(filePath, 'utf-8')
        const sourceFile = ts.createSourceFile(
          filePath,
          content,
          ts.ScriptTarget.Latest,
          true,
        )

        // 检查语法错误
        const diagnostics = ts.getPreEmitDiagnostics(this.program!, sourceFile)
        if (diagnostics.length > 0) {
          const errors = diagnostics.map((d: ts.Diagnostic) =>
            ts.flattenDiagnosticMessageText(d.messageText, '\n'),
          )
          logger.error(`类型文件 ${filePath} 存在语法错误:`, errors.join('\n'))
          return false
        }
      }

      logger.info('所有生成的类型文件验证通过')
      return true
    }
    catch (error) {
      logger.error('验证类型文件失败:', error)
      return false
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.program = null
    this.checker = null
  }

  /**
   * 获取类型信息
   */
  getTypeInfo(filePath: string): any {
    if (!this.program || !this.checker) {
      return null
    }

    const sourceFile = this.program.getSourceFile(filePath)
    if (!sourceFile) {
      return null
    }

    // 这里可以提取更详细的类型信息
    // 比如导出的接口、类型别名等
    const exports: string[] = []

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isExportDeclaration(node)
        || (ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((m: ts.Modifier) => m.kind === ts.SyntaxKind.ExportKeyword))) {
        // 提取导出信息
        if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
          exports.push(node.name.text)
        }
      }
    })

    return {
      fileName: sourceFile.fileName,
      exports,
    }
  }
}
