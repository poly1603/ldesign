#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import process from 'node:process'

interface TestResult {
  name: string
  passed: boolean
  message: string
}

class SetupVerifier {
  private results: TestResult[] = []

  private test(name: string, condition: boolean, message: string): void {
    this.results.push({
      name,
      passed: condition,
      message,
    })
  }

  private log(
    message: string,
    level: 'info' | 'success' | 'error' = 'info',
  ): void {
    const prefix = level === 'success' ? '✅' : level === 'error' ? '❌' : 'ℹ️'
    console.log(`${prefix} ${message}`)
  }

  verifyProjectStructure(): void {
    this.log('验证项目结构...')

    // 检查根目录文件
    const rootFiles = [
      'README.md',
      'CHANGELOG.md',
      'CONTRIBUTING.md',
      'package.json',
      'pnpm-workspace.yaml',
      'tsconfig.json',
      'Dockerfile',
      'docker-compose.yml',
      '.gitignore',
      '.dockerignore',
    ]

    rootFiles.forEach((file) => {
      this.test(
        `根目录文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`,
      )
    })

    // 检查目录结构
    const directories = [
      'packages',
      'docs',
      'tools',
      'tools/scripts',
      'tools/configs',
      'docker',
    ]

    directories.forEach((dir) => {
      this.test(
        `目录: ${dir}`,
        existsSync(dir),
        `${dir} ${existsSync(dir) ? '存在' : '不存在'}`,
      )
    })
  }

  verifyToolsStructure(): void {
    this.log('验证工具目录结构...')

    const toolsFiles = [
      'tools/README.md',
      'tools/scripts/build/build-manager.ts',
      'tools/scripts/build/version-manager.ts',
      'tools/scripts/deploy/publish-manager.ts',
      'tools/configs/publish.config.ts',
    ]

    toolsFiles.forEach((file) => {
      this.test(
        `工具文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`,
      )
    })

    // 检查旧文件是否已移动
    const oldFiles = [
      'tools/git-commit.ts',
      'tools/build',
      'tools/deploy',
      'tools/package',
      'tools/release',
    ]

    oldFiles.forEach((file) => {
      this.test(
        `旧文件已移动: ${file}`,
        !existsSync(file),
        `${file} ${existsSync(file) ? '仍然存在（应该已移动）' : '已移动'}`,
      )
    })
  }

  verifyDocsStructure(): void {
    this.log('验证文档结构...')

    const docsFiles = [
      'docs/.vitepress/config.ts',
      'docs/guide/project-structure.md',
      'docs/reports',
      'docs/guide/DEVELOPMENT.md',
      'docs/guide/DEPLOYMENT.md',
    ]

    docsFiles.forEach((file) => {
      this.test(
        `文档文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`,
      )
    })

    // 检查根目录是否已清理
    const rootDocsFiles = [
      'BUILD_REPORT.json',
      'BUILD_STATUS_REPORT.md',
      'DEPLOYMENT.md',
      'DEVELOPMENT.md',
      'README.en.md',
    ]

    rootDocsFiles.forEach((file) => {
      this.test(
        `根目录文档已移动: ${file}`,
        !existsSync(file),
        `${file} ${
          existsSync(file) ? '仍在根目录（应该已移动）' : '已移动到docs'
        }`,
      )
    })
  }

  verifyPackageJson(): void {
    this.log('验证package.json配置...')

    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

      // 检查新的脚本
      const expectedScripts = [
        'build',
        'build:packages',
        'build:docs',
        'version:list',
        'publish',
        'publish:npm',
        'publish:private',
        'docker:build',
      ]

      expectedScripts.forEach((script) => {
        this.test(
          `脚本: ${script}`,
          !!packageJson.scripts[script],
          `${script} ${packageJson.scripts[script] ? '已配置' : '未配置'}`,
        )
      })

      // 检查脚本路径是否更新
      const scriptPaths = [
        ['commit', 'tools/scripts/git-commit.ts'],
        ['tools:create-package', 'tools/scripts/package/create-package.ts'],
        ['deploy', 'tools/scripts/deploy/deploy-manager.ts'],
      ]

      scriptPaths.forEach(([script, expectedPath]) => {
        const actualScript = packageJson.scripts[script]
        this.test(
          `脚本路径: ${script}`,
          actualScript && actualScript.includes(expectedPath),
          `${script} 路径 ${
            actualScript && actualScript.includes(expectedPath)
              ? '正确'
              : '需要更新'
          }`,
        )
      })
    }
    catch (error) {
      this.test('package.json 解析', false, `无法解析 package.json: ${error}`)
    }
  }

  verifyDockerFiles(): void {
    this.log('验证Docker配置...')

    const dockerFiles = [
      'Dockerfile',
      'docker-compose.yml',
      'docker-compose.dev.yml',
      '.dockerignore',
      'docs/Dockerfile',
      'docker/nginx.conf',
      'docs/docker/nginx.conf',
    ]

    dockerFiles.forEach((file) => {
      this.test(
        `Docker文件: ${file}`,
        existsSync(file),
        `${file} ${existsSync(file) ? '存在' : '不存在'}`,
      )
    })
  }

  async runVerification(): Promise<void> {
    this.log('开始验证项目设置...', 'info')

    this.verifyProjectStructure()
    this.verifyToolsStructure()
    this.verifyDocsStructure()
    this.verifyPackageJson()
    this.verifyDockerFiles()

    // 输出结果
    this.log('\n验证结果:', 'info')

    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length

    this.results.forEach((result) => {
      this.log(
        `${result.name}: ${result.message}`,
        result.passed ? 'success' : 'error',
      )
    })

    this.log(
      `\n总计: ${passed}/${total} 项检查通过`,
      passed === total ? 'success' : 'error',
    )

    if (passed < total) {
      this.log('存在问题需要修复', 'error')
      process.exit(1)
    }
    else {
      this.log('所有检查都通过了！', 'success')
    }
  }
}

// CLI 接口
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const verifier = new SetupVerifier()
  verifier.runVerification().catch((error) => {
    console.error('验证失败:', error)
    process.exit(1)
  })
}

export { SetupVerifier }
