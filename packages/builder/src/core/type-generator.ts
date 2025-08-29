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
    const startTime = Date.now()
    const generatedFiles: string[] = []
    const errors: string[] = []

    try {
      // 检查是否需要生成类型文件
      if (!this.shouldGenerateTypes(scanResult, buildOptions)) {
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
        const error = '无法创建TypeScript程序'
        logger.error(error)
        errors.push(error)
        return {
          success: false,
          generatedFiles,
          errors,
          generationTime: Date.now() - startTime,
        }
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

      // 确保至少生成了主入口的类型文件
      if (generatedFiles.length === 0) {
        const forceGeneratedFile = await this.forceGenerateMainTypes(scanResult, typeOptions)
        if (forceGeneratedFile) {
          generatedFiles.push(forceGeneratedFile)
        }
      }

      // 生成package.json的types字段建议
      await this.generatePackageTypesField(scanResult, buildOptions, generatedFiles)

      const endTime = Date.now()
      const generationTime = endTime - startTime

      if (generatedFiles.length === 0) {
        logger.warn(`类型生成完成，但没有生成任何文件，耗时 ${generationTime}ms`)
      }

      return {
        success: true,
        generatedFiles,
        errors,
        generationTime,
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      errors.push(errorMessage)
      logger.error('类型生成失败:', error)
      if (errorStack) {
        logger.error('错误堆栈:', errorStack)
      }

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
      logger.info('类型生成已被用户禁用 (dts: false)')
      return false
    }

    // 检查是否有TypeScript文件
    const hasTypeScriptFiles = scanResult.files.some(file =>
      file.type === 'typescript' || file.type === 'tsx',
    )

    // 更宽松的检测：如果有.ts或.tsx文件，或者存在tsconfig.json
    const hasTsConfig = this.findTsConfig() !== null
    const hasTypeScriptExtensions = scanResult.files.some(file =>
      file.path.endsWith('.ts') || file.path.endsWith('.tsx')
    )

    const shouldGenerate = hasTypeScriptFiles || hasTsConfig || hasTypeScriptExtensions

    return shouldGenerate
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

        if (configFile.error) {
          logger.warn('读取tsconfig.json时出现错误:', ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
        }

        const parsedConfig = ts.parseJsonConfigFileContent(
          configFile.config,
          ts.sys,
          dirname(tsconfigPath),
        )

        if (parsedConfig.errors.length > 0) {
          const errors = parsedConfig.errors.map(err => ts.flattenDiagnosticMessageText(err.messageText, '\n'))
          logger.warn('解析tsconfig.json时出现错误:', errors.join('\n'))
        }

        compilerOptions = {
          ...parsedConfig.options,
          declaration: true,
          emitDeclarationOnly: true,
          noEmit: false, // 强制允许输出
          outDir: resolve(buildOptions.root || process.cwd(), 'types'),
          rootDir: resolve(buildOptions.root || process.cwd(), 'src'), // 设置根目录为 src
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
          noEmit: false, // 强制允许输出
          outDir: resolve(buildOptions.root || process.cwd(), 'types'),
          rootDir: resolve(buildOptions.root || process.cwd(), 'src'), // 设置根目录为 src
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
        }

        // 收集所有TypeScript文件 - 更宽松的检测
        rootNames = scanResult.files
          .filter(file => {
            const isTs = file.type === 'typescript' || file.type === 'tsx' ||
              file.path.endsWith('.ts') || file.path.endsWith('.tsx')
            return isTs
          })
          .map(file => file.path)

        // 如果没有找到TypeScript文件，尝试手动查找
        if (rootNames.length === 0) {
          const projectRoot = resolve(buildOptions.root || process.cwd())
          const srcDir = resolve(projectRoot, 'src')

          const possibleFiles = [
            resolve(srcDir, 'index.ts'),
            resolve(srcDir, 'index.tsx'),
            resolve(srcDir, 'main.ts'),
            resolve(srcDir, 'main.tsx'),
          ]

          for (const file of possibleFiles) {
            if (existsSync(file)) {
              rootNames.push(file)
            }
          }
        }

        logger.info(`收集到 ${rootNames.length} 个TypeScript文件`)
      }

      if (rootNames.length === 0) {
        throw new Error('没有找到任何TypeScript文件')
      }

      // 创建程序
      this.program = ts.createProgram(rootNames, compilerOptions)
      this.checker = this.program.getTypeChecker()

      // 检查预编译诊断
      const diagnostics = ts.getPreEmitDiagnostics(this.program)
      if (diagnostics.length > 0) {
        const errors = diagnostics.map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
        logger.warn('TypeScript预编译诊断:', errors.join('\n'))
      }
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
    // 类型文件输出到根目录的 types 文件夹
    const projectRoot = resolve(buildOptions.root || process.cwd())
    const typesDir = resolve(projectRoot, 'types')

    const defaultOptions: TypeGenerationOptions = {
      bundled: false, // 使用目录结构模式，保持与源码相同的层级
      outDir: typesDir,
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
    scanResult: ProjectScanResult,
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

      // 获取项目根目录和源码目录
      const projectRoot = resolve(scanResult.root)
      const srcDir = resolve(projectRoot, 'src')

      // 为每个源文件生成对应的声明文件
      const sourceFiles = this.program.getSourceFiles()
        .filter(sf => {
          const normalizedFileName = resolve(sf.fileName)
          const normalizedSrcDir = resolve(srcDir)
          return !sf.isDeclarationFile &&
            !sf.fileName.includes('node_modules') &&
            normalizedFileName.startsWith(normalizedSrcDir)
        })

      logger.info(`找到 ${sourceFiles.length} 个源文件需要生成类型声明`)

      for (const sourceFile of sourceFiles) {
        // 计算相对于 src 目录的路径
        const relativePath = relative(srcDir, sourceFile.fileName)
        const outputPath = resolve(outDir, relativePath.replace(/\.tsx?$/, '.d.ts'))

        // 确保输出目录存在
        const outputDirPath = dirname(outputPath)
        if (!existsSync(outputDirPath)) {
          mkdirSync(outputDirPath, { recursive: true })
        }

        const emitResult = this.program.emit(
          sourceFile,
          (fileName, data) => {
            if (fileName.endsWith('.d.ts')) {
              // 使用计算出的输出路径
              writeFileSync(outputPath, data)
              generatedFiles.push(outputPath)
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
          logger.warn(`文件 ${sourceFile.fileName} 编译警告: ${errors.join(', ')}`)
        }
      }

      logger.info(`生成 ${generatedFiles.length} 个分离的类型文件，保持目录结构`)
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
   * 强制生成主入口类型文件
   */
  private async forceGenerateMainTypes(
    scanResult: ProjectScanResult,
    options: TypeGenerationOptions,
  ): Promise<string | null> {
    if (!this.program) {
      logger.error('TypeScript程序未初始化，无法强制生成类型文件')
      return null
    }

    try {
      // 确保输出目录存在
      const outDir = resolve(options.outDir || 'dist/types')
      if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true })
      }

      const outputPath = join(outDir, 'index.d.ts')
      logger.info(`强制生成主入口类型文件: ${outputPath}`)

      // 获取项目根目录和源码目录
      const projectRoot = resolve(scanResult.root)
      const srcDir = resolve(projectRoot, 'src')

      // 查找主入口文件
      const possibleEntries = [
        resolve(srcDir, 'index.ts'),
        resolve(srcDir, 'index.tsx'),
        resolve(srcDir, 'main.ts'),
        resolve(srcDir, 'main.tsx'),
      ]

      let mainEntryFile = null
      for (const entry of possibleEntries) {
        if (existsSync(entry)) {
          mainEntryFile = entry
          break
        }
      }

      if (!mainEntryFile) {
        logger.warn('未找到主入口文件，无法强制生成类型文件')
        return null
      }

      logger.info(`找到主入口文件: ${mainEntryFile}`)

      // 获取主入口文件的源文件对象
      const sourceFile = this.program.getSourceFile(mainEntryFile)
      if (!sourceFile) {
        logger.warn(`无法获取源文件对象: ${mainEntryFile}`)
        return null
      }

      // 生成类型文件
      let generatedFile = null
      const emitResult = this.program.emit(
        sourceFile,
        (fileName, data) => {
          if (fileName.endsWith('.d.ts')) {
            // 计算相对于 src 目录的路径
            const relativePath = relative(srcDir, sourceFile.fileName)
            const finalOutputPath = resolve(outDir, relativePath.replace(/\.tsx?$/, '.d.ts'))

            // 确保输出目录存在
            const outputDirPath = dirname(finalOutputPath)
            if (!existsSync(outputDirPath)) {
              mkdirSync(outputDirPath, { recursive: true })
            }

            logger.info(`强制生成类型文件: ${finalOutputPath}`)
            logger.info(`文件名: ${fileName}, 数据长度: ${data.length}`)
            writeFileSync(finalOutputPath, data)
            generatedFile = finalOutputPath
            logger.info(`成功写入强制生成的类型文件: ${finalOutputPath}`)
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
        logger.warn(`强制生成类型文件时出现警告:`, errors.join('\n'))
      }

      // 如果通过emit回调生成了文件，直接返回
      if (generatedFile && existsSync(generatedFile)) {
        logger.info(`强制生成类型文件成功: ${generatedFile}`)
        return generatedFile
      }

      // 检查预期的输出路径
      if (existsSync(outputPath)) {
        logger.info(`在预期路径找到类型文件: ${outputPath}`)
        return outputPath
      }

      // 如果index.d.ts不存在，检查是否生成了其他文件
      const checkPaths = [
        resolve(outDir, 'index.d.ts'),
        resolve(outDir, 'main.d.ts'),
      ]

      for (const checkPath of checkPaths) {
        if (existsSync(checkPath)) {
          logger.info(`找到替代类型文件: ${checkPath}`)
          return checkPath
        }
      }

      logger.warn('强制生成类型文件失败，没有找到任何生成的文件')
      return null
    }
    catch (error) {
      logger.error('强制生成类型文件失败:', error)
      return null
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
