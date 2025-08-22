// 调试CSS变量生成问题
import { createThemeManager } from './packages/color/dist/index.js'

async function debugCSSVariables() {
  try {
    console.log('开始调试CSS变量生成...')

    // 创建主题管理器
    const themeManager = createThemeManager()

    console.log('主题管理器创建成功')

    // 注册一个简单的主题
    const testTheme = {
      name: 'test-theme',
      displayName: '测试主题',
      light: {
        primary: '#1890ff',
      },
    }

    console.log('注册测试主题...')
    themeManager.registerTheme(testTheme)

    console.log('设置主题...')
    await themeManager.setTheme('test-theme')

    console.log('主题设置完成')

    // 检查生成的主题数据
    const generatedTheme = themeManager.getGeneratedTheme('test-theme')
    console.log('生成的主题数据:', generatedTheme)

    if (generatedTheme) {
      console.log(
        'Light模式CSS变量数量:',
        Object.keys(generatedTheme.light.cssVariables).length
      )
      console.log(
        'Light模式CSS变量示例:',
        Object.entries(generatedTheme.light.cssVariables).slice(0, 10)
      )
    }
  } catch (error) {
    console.error('调试过程中出现错误:', error)
    console.error('错误堆栈:', error.stack)
  }
}

debugCSSVariables()
