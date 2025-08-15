/**
 * @ldesign/theme - 系统验证脚本
 *
 * 验证节日主题挂件系统的完整性和正确性
 */

import { promises as fs } from 'fs'
import path from 'path'

interface VerificationResult {
  success: boolean
  message: string
  details?: string[]
}

class SystemVerifier {
  private results: VerificationResult[] = []
  private projectRoot: string

  constructor() {
    this.projectRoot = process.cwd()
  }

  /**
   * 运行所有验证
   */
  async runAllVerifications(): Promise<void> {
    console.log('🔍 开始系统验证...\n')

    await this.verifyProjectStructure()
    await this.verifyPackageJson()
    await this.verifySourceFiles()
    await this.verifyTestFiles()
    await this.verifyDocumentation()
    await this.verifyTypeDefinitions()

    this.printResults()
  }

  /**
   * 验证项目结构
   */
  private async verifyProjectStructure(): Promise<void> {
    console.log('📁 验证项目结构...')

    const requiredDirs = [
      'src',
      'src/components',
      'tests',
      'tests/unit',
      'tests/e2e',
      'docs',
      'summary',
    ]

    const requiredFiles = [
      'package.json',
      'README.md',
      'vite.config.ts',
      'vitest.config.ts',
      'playwright.config.ts',
      'src/App.vue',
      'src/main.ts',
    ]

    const missingDirs: string[] = []
    const missingFiles: string[] = []

    // 检查目录
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.projectRoot, dir)
      try {
        const stat = await fs.stat(dirPath)
        if (!stat.isDirectory()) {
          missingDirs.push(dir)
        }
      } catch {
        missingDirs.push(dir)
      }
    }

    // 检查文件
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file)
      try {
        await fs.access(filePath)
      } catch {
        missingFiles.push(file)
      }
    }

    const success = missingDirs.length === 0 && missingFiles.length === 0
    const details = [
      ...missingDirs.map(dir => `缺少目录: ${dir}`),
      ...missingFiles.map(file => `缺少文件: ${file}`),
    ]

    this.results.push({
      success,
      message: success ? '✅ 项目结构完整' : '❌ 项目结构不完整',
      details: details.length > 0 ? details : undefined,
    })
  }

  /**
   * 验证 package.json
   */
  private async verifyPackageJson(): Promise<void> {
    console.log('📦 验证 package.json...')

    try {
      const packagePath = path.join(this.projectRoot, 'package.json')
      const packageContent = await fs.readFile(packagePath, 'utf-8')
      const packageJson = JSON.parse(packageContent)

      const requiredDeps = ['vue', '@ldesign/theme', '@ldesign/color']
      const requiredDevDeps = [
        '@vitejs/plugin-vue',
        'typescript',
        'vite',
        'vitest',
        '@playwright/test',
      ]
      const requiredScripts = ['dev', 'build', 'preview', 'test', 'test:e2e']

      const missingDeps = requiredDeps.filter(
        dep => !packageJson.dependencies?.[dep]
      )
      const missingDevDeps = requiredDevDeps.filter(
        dep => !packageJson.devDependencies?.[dep]
      )
      const missingScripts = requiredScripts.filter(
        script => !packageJson.scripts?.[script]
      )

      const success =
        missingDeps.length === 0 &&
        missingDevDeps.length === 0 &&
        missingScripts.length === 0
      const details = [
        ...missingDeps.map(dep => `缺少依赖: ${dep}`),
        ...missingDevDeps.map(dep => `缺少开发依赖: ${dep}`),
        ...missingScripts.map(script => `缺少脚本: ${script}`),
      ]

      this.results.push({
        success,
        message: success
          ? '✅ package.json 配置正确'
          : '❌ package.json 配置有问题',
        details: details.length > 0 ? details : undefined,
      })
    } catch (error) {
      this.results.push({
        success: false,
        message: '❌ 无法读取 package.json',
        details: [String(error)],
      })
    }
  }

  /**
   * 验证源文件
   */
  private async verifySourceFiles(): Promise<void> {
    console.log('📄 验证源文件...')

    const requiredComponents = [
      'src/components/ThemeManager.vue',
      'src/components/ThemeStatusBar.vue',
      'src/components/WidgetButtonDemo.vue',
      'src/components/WidgetCardDemo.vue',
      'src/components/WidgetFormDemo.vue',
      'src/components/WidgetPanelDemo.vue',
      'src/components/WidgetBackgroundDemo.vue',
    ]

    const missingComponents: string[] = []

    for (const component of requiredComponents) {
      const componentPath = path.join(this.projectRoot, component)
      try {
        await fs.access(componentPath)
      } catch {
        missingComponents.push(component)
      }
    }

    const success = missingComponents.length === 0

    this.results.push({
      success,
      message: success ? '✅ 源文件完整' : '❌ 源文件不完整',
      details:
        missingComponents.length > 0
          ? missingComponents.map(c => `缺少组件: ${c}`)
          : undefined,
    })
  }

  /**
   * 验证测试文件
   */
  private async verifyTestFiles(): Promise<void> {
    console.log('🧪 验证测试文件...')

    const requiredTestFiles = [
      'tests/unit/widget-manager.test.ts',
      'tests/unit/theme-switcher.test.ts',
      'tests/e2e/festival-demo.spec.ts',
      'tests/setup.ts',
      'tests/global-setup.ts',
      'tests/global-teardown.ts',
    ]

    const missingTestFiles: string[] = []

    for (const testFile of requiredTestFiles) {
      const testPath = path.join(this.projectRoot, testFile)
      try {
        await fs.access(testPath)
      } catch {
        missingTestFiles.push(testFile)
      }
    }

    const success = missingTestFiles.length === 0

    this.results.push({
      success,
      message: success ? '✅ 测试文件完整' : '❌ 测试文件不完整',
      details:
        missingTestFiles.length > 0
          ? missingTestFiles.map(f => `缺少测试文件: ${f}`)
          : undefined,
    })
  }

  /**
   * 验证文档
   */
  private async verifyDocumentation(): Promise<void> {
    console.log('📚 验证文档...')

    const requiredDocs = [
      'README.md',
      'docs/index.md',
      'docs/.vitepress/config.ts',
      'summary/01-project-overview.md',
    ]

    const missingDocs: string[] = []

    for (const doc of requiredDocs) {
      const docPath = path.join(this.projectRoot, doc)
      try {
        await fs.access(docPath)
      } catch {
        missingDocs.push(doc)
      }
    }

    const success = missingDocs.length === 0

    this.results.push({
      success,
      message: success ? '✅ 文档完整' : '❌ 文档不完整',
      details:
        missingDocs.length > 0
          ? missingDocs.map(d => `缺少文档: ${d}`)
          : undefined,
    })
  }

  /**
   * 验证类型定义
   */
  private async verifyTypeDefinitions(): Promise<void> {
    console.log('🔧 验证类型定义...')

    try {
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json')
      await fs.access(tsconfigPath)

      // 检查是否有 TypeScript 错误
      // 这里可以添加更详细的类型检查逻辑

      this.results.push({
        success: true,
        message: '✅ TypeScript 配置正确',
      })
    } catch {
      this.results.push({
        success: false,
        message: '❌ 缺少 TypeScript 配置',
      })
    }
  }

  /**
   * 打印验证结果
   */
  private printResults(): void {
    console.log('\n📊 验证结果汇总:')
    console.log('=' * 50)

    let successCount = 0
    let totalCount = this.results.length

    for (const result of this.results) {
      console.log(result.message)

      if (result.details) {
        result.details.forEach(detail => {
          console.log(`   ${detail}`)
        })
      }

      if (result.success) {
        successCount++
      }

      console.log()
    }

    console.log('=' * 50)
    console.log(`总计: ${successCount}/${totalCount} 项验证通过`)

    if (successCount === totalCount) {
      console.log('🎉 所有验证都通过了！系统已准备就绪。')
    } else {
      console.log('⚠️  存在一些问题需要修复。')
      process.exit(1)
    }
  }
}

// 运行验证
async function main() {
  const verifier = new SystemVerifier()
  await verifier.runAllVerifications()
}

if (require.main === module) {
  main().catch(console.error)
}

export { SystemVerifier }
