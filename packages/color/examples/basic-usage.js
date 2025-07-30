/**
 * 基础使用示例
 */

import {
  createThemeManagerWithPresets,
  generateColorConfig,
  presetThemes,
} from '../dist/index.js'

async function basicExample() {
  console.log('🎨 @ldesign/color 基础使用示例\n')

  // 1. 创建主题管理器
  console.log('1. 创建主题管理器...')
  const themeManager = await createThemeManagerWithPresets({
    defaultTheme: 'default',
    autoDetect: true,
    idleProcessing: true,
  })

  console.log(`✅ 主题管理器创建成功`)
  console.log(`   当前主题: ${themeManager.getCurrentTheme()}`)
  console.log(`   当前模式: ${themeManager.getCurrentMode()}`)
  console.log(`   可用主题: ${themeManager.getThemeNames().join(', ')}\n`)

  // 2. 颜色生成示例
  console.log('2. 颜色生成示例...')
  const primaryColor = '#1890ff'
  const colorConfig = generateColorConfig(primaryColor)

  console.log(`✅ 从主色调 ${primaryColor} 生成的颜色配置:`)
  console.log(`   主色调: ${colorConfig.primary}`)
  console.log(`   成功色: ${colorConfig.success}`)
  console.log(`   警告色: ${colorConfig.warning}`)
  console.log(`   危险色: ${colorConfig.danger}`)
  console.log(`   灰色: ${colorConfig.gray}\n`)

  // 3. 主题切换示例
  console.log('3. 主题切换示例...')

  // 切换到绿色主题
  await themeManager.setTheme('green')
  console.log(`✅ 切换到绿色主题: ${themeManager.getCurrentTheme()}`)

  // 切换到深色模式
  await themeManager.setMode('dark')
  console.log(`✅ 切换到深色模式: ${themeManager.getCurrentMode()}`)

  // 切换到紫色主题的亮色模式
  await themeManager.setTheme('purple', 'light')
  console.log(`✅ 切换到紫色主题亮色模式: ${themeManager.getCurrentTheme()} - ${themeManager.getCurrentMode()}\n`)

  // 4. 预设主题信息
  console.log('4. 预设主题信息...')
  console.log(`✅ 共有 ${presetThemes.length} 个预设主题:`)
  presetThemes.forEach((theme) => {
    console.log(`   - ${theme.name}: ${theme.displayName} (${theme.description})`)
  })
  console.log()

  // 5. 自定义主题注册
  console.log('5. 自定义主题注册...')
  const customTheme = {
    name: 'custom-blue',
    displayName: '自定义蓝色',
    description: '我的自定义蓝色主题',
    light: {
      primary: '#0066cc',
    },
    dark: {
      primary: '#4d94ff',
    },
  }

  themeManager.registerTheme(customTheme)
  console.log(`✅ 注册自定义主题: ${customTheme.name}`)
  console.log(`   更新后的主题列表: ${themeManager.getThemeNames().join(', ')}\n`)

  // 6. 预生成主题（性能优化）
  console.log('6. 预生成主题（性能优化）...')
  await themeManager.preGenerateAllThemes()
  console.log(`✅ 所有主题预生成完成\n`)

  // 7. 获取生成的主题数据
  console.log('7. 获取生成的主题数据...')
  const generatedTheme = themeManager.getGeneratedTheme('default')
  if (generatedTheme) {
    console.log(`✅ 默认主题生成数据:`)
    console.log(`   主题名称: ${generatedTheme.name}`)
    console.log(`   生成时间: ${new Date(generatedTheme.timestamp).toLocaleString()}`)
    console.log(`   亮色模式 CSS 变量数量: ${Object.keys(generatedTheme.light.cssVariables).length}`)
    console.log(`   暗色模式 CSS 变量数量: ${Object.keys(generatedTheme.dark.cssVariables).length}`)

    // 显示一些 CSS 变量示例
    const lightVars = Object.entries(generatedTheme.light.cssVariables).slice(0, 5)
    console.log(`   亮色模式 CSS 变量示例:`)
    lightVars.forEach(([key, value]) => {
      console.log(`     ${key}: ${value}`)
    })
  }
  console.log()

  console.log('🎉 示例运行完成！')

  // 清理
  themeManager.destroy()
}

// 运行示例
if (typeof window === 'undefined') {
  // Node.js 环境
  basicExample().catch(console.error)
}
else {
  // 浏览器环境
  window.addEventListener('DOMContentLoaded', () => {
    basicExample().catch(console.error)
  })
}
