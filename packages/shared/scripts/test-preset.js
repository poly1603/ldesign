#!/usr/bin/env node

/**
 * 测试预设系统是否正常工作
 */

import { TsLibPreset } from '@ldesign/builder'

console.log('🧪 Testing LibraryBuilder Presets')
console.log('=================================\n')

try {
  // 模拟项目分析结果
  const mockAnalysis = {
    projectType: 'ts-lib',
    hasTypeScript: true,
    hasVue: false,
    hasLess: true,
    hasTsx: false,
    hasJsx: false,
    packageName: '@ldesign/shared',
    dependencies: ['lodash-es', 'raf'],
    devDependencies: [],
    fileStats: {
      typescript: ['src/index-basic.ts'],
      javascript: [],
      vue: [],
      tsx: [],
      jsx: [],
      less: ['src/components/button/button.less'],
      css: [],
      scss: []
    }
  }
  
  const presetConfig = {
    entry: 'src/index-basic.ts',
    outputDir: {
      cjs: 'cjs',
      es: 'es', 
      umd: 'dist'
    },
    external: ['vue', 'lodash-es', 'raf'],
    globals: {
      vue: 'Vue',
      'lodash-es': 'lodash', 
      raf: 'raf'
    },
    name: 'LDesignShared',
    minify: false,
    sourcemap: false,
    dts: true,
    extractCss: true
  }
  
  console.log('📦 Creating TypeScript library preset...')
  const preset = new TsLibPreset(mockAnalysis, presetConfig)
  
  console.log('⚙️  Generating Rollup configurations...')
  const configs = preset.getRollupConfig()
  
  console.log(`✅ Successfully generated ${configs.length} configurations`)
  
  configs.forEach((config, i) => {
    console.log(`\n  📋 Configuration ${i + 1}:`)
    console.log(`    Input: ${config.input}`)
    console.log(`    Plugins: ${config.plugins?.length || 0} plugins`)
    
    if (Array.isArray(config.output)) {
      config.output.forEach((out, j) => {
        console.log(`    Output ${j + 1}: ${out.format} -> ${out.dir || out.file}`)
      })
    } else if (config.output) {
      console.log(`    Output: ${config.output.format} -> ${config.output.dir || config.output.file}`)
    }
  })
  
  console.log('\n✨ Preset test completed successfully!')
  
} catch (error) {
  console.error('❌ Preset test failed:', error.message)
  if (error.stack) {
    console.error(error.stack)
  }
  process.exit(1)
}
