/**
 * Vue + Less 构建测试
 * 测试 Vue 文件中包含 Less 样式的构建功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { RollupBuilder } from '../src/core/rollup-builder'
import { PluginConfigurator } from '../src/core/plugin-configurator'
import { ProjectScanner } from '../src/core/project-scanner'
import type { BuildOptions } from '../src/types'

describe('Vue + Less 构建测试', () => {
  const testDir = join(__dirname, 'temp-vue-less-test')
  const srcDir = join(testDir, 'src')
  const outDir = join(testDir, 'dist')

  beforeEach(() => {
    // 创建测试目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
    mkdirSync(srcDir, { recursive: true })
  })

  afterEach(() => {
    // 清理测试目录
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('应该能够构建包含 Less 样式的 Vue 文件', async () => {
    // 创建测试文件
    const vueFileContent = `
<template>
  <div class="test-component">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Hello Vue + Less')
</script>

<style lang="less" scoped>
@primary-color: #1890ff;

.test-component {
  padding: 20px;
  
  h1 {
    color: @primary-color;
    font-size: 24px;
    
    &:hover {
      color: darken(@primary-color, 10%);
    }
  }
}
</style>
`

    const indexFileContent = `
import { createApp } from 'vue'
import TestComponent from './TestComponent.vue'

const app = createApp(TestComponent)
app.mount('#app')
`

    const packageJsonContent = `
{
  "name": "vue-less-test",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "less": "^4.1.0"
  }
}
`

    // 写入测试文件
    writeFileSync(join(srcDir, 'TestComponent.vue'), vueFileContent)
    writeFileSync(join(srcDir, 'index.ts'), indexFileContent)
    writeFileSync(join(testDir, 'package.json'), packageJsonContent)

    // 扫描项目
    const scanner = new ProjectScanner()
    const scanResult = await scanner.scan(testDir)

    // 配置插件
    const pluginConfigurator = new PluginConfigurator()
    const buildOptions: BuildOptions = {
      outDir,
      formats: ['esm'],
      mode: 'development',
      css: true, // 启用 CSS 处理
    }

    const pluginConfig = await pluginConfigurator.configure(scanResult, buildOptions)

    // 构建项目
    const builder = new RollupBuilder()
    const buildResult = await builder.build(scanResult, { plugins: pluginConfig }, buildOptions)

    // 验证构建结果
    expect(buildResult.success).toBe(true)
    expect(buildResult.errors).toHaveLength(0)
    expect(buildResult.outputFiles.length).toBeGreaterThan(0)

    // 验证输出文件存在
    const hasJsFile = buildResult.outputFiles.some(file => file.path.endsWith('.js'))
    expect(hasJsFile).toBe(true)

    console.log('构建成功，输出文件:', buildResult.outputFiles.map(f => f.path))
  }, 30000) // 增加超时时间

  it('应该能够处理禁用 CSS 的情况', async () => {
    // 创建测试文件
    const vueFileContent = `
<template>
  <div class="test-component">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Hello Vue without CSS')
</script>

<style lang="less" scoped>
@primary-color: #1890ff;

.test-component {
  padding: 20px;
  
  h1 {
    color: @primary-color;
  }
}
</style>
`

    const indexFileContent = `
import { createApp } from 'vue'
import TestComponent from './TestComponent.vue'

const app = createApp(TestComponent)
app.mount('#app')
`

    // 写入测试文件
    writeFileSync(join(srcDir, 'TestComponent.vue'), vueFileContent)
    writeFileSync(join(srcDir, 'index.ts'), indexFileContent)

    // 扫描项目
    const scanner = new ProjectScanner()
    const scanResult = await scanner.scan(testDir)

    // 配置插件（禁用 CSS）
    const pluginConfigurator = new PluginConfigurator()
    const buildOptions: BuildOptions = {
      outDir,
      formats: ['esm'],
      mode: 'development',
      css: false, // 禁用 CSS 处理
    }

    const pluginConfig = await pluginConfigurator.configure(scanResult, buildOptions)

    // 构建项目
    const builder = new RollupBuilder()
    const buildResult = await builder.build(scanResult, { plugins: pluginConfig }, buildOptions)

    // 验证构建结果
    expect(buildResult.success).toBe(true)
    expect(buildResult.errors).toHaveLength(0)

    console.log('禁用 CSS 构建成功，输出文件:', buildResult.outputFiles.map(f => f.path))
  }, 30000)
})
