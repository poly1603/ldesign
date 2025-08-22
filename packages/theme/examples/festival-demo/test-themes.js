/**
 * 主题切换测试脚本
 * 在浏览器控制台中运行此脚本来测试主题功能
 */

console.log('🎨 LDesign Theme 完善版测试脚本 v2.0')
console.log('🚀 新增功能: 中国节日主题、简化API、主题管理器')

// 测试主题切换
function testThemeSwitch() {
  console.log('📋 开始测试主题切换...')

  const themeSelector = document.querySelector('select')
  if (!themeSelector) {
    console.error('❌ 找不到主题选择器')
    return
  }

  console.log('✅ 找到主题选择器')

  // 测试切换到春节主题
  setTimeout(() => {
    console.log('🧧 切换到春节主题...')
    themeSelector.value = 'spring-festival'
    themeSelector.dispatchEvent(new Event('change'))

    setTimeout(() => {
      const widgets = document.querySelectorAll('.ldesign-widget')
      const rootTheme = document.documentElement.getAttribute('data-theme')
      console.log(`✅ 春节主题装饰挂件数量: ${widgets.length}`)
      console.log(`✅ 根元素主题属性: ${rootTheme}`)

      // 测试切换到圣诞节主题
      setTimeout(() => {
        console.log('🎄 切换到圣诞节主题...')
        themeSelector.value = 'christmas'
        themeSelector.dispatchEvent(new Event('change'))

        setTimeout(() => {
          const widgets = document.querySelectorAll('.ldesign-widget')
          const rootTheme = document.documentElement.getAttribute('data-theme')
          console.log(`✅ 圣诞节主题装饰挂件数量: ${widgets.length}`)
          console.log(`✅ 根元素主题属性: ${rootTheme}`)

          // 测试切换回默认主题
          setTimeout(() => {
            console.log('🔄 切换回默认主题...')
            themeSelector.value = 'default'
            themeSelector.dispatchEvent(new Event('change'))

            setTimeout(() => {
              const widgets = document.querySelectorAll('.ldesign-widget')
              const rootTheme =
                document.documentElement.getAttribute('data-theme')
              console.log(`✅ 默认主题装饰挂件数量: ${widgets.length}`)
              console.log(`✅ 根元素主题属性: ${rootTheme}`)
              console.log('🎉 主题切换测试完成！')
            }, 1000)
          }, 2000)
        }, 1000)
      }, 2000)
    }, 1000)
  }, 1000)
}

// 测试装饰挂件
function testWidgets() {
  console.log('📋 开始测试装饰挂件...')

  const widgets = document.querySelectorAll('.ldesign-widget')
  console.log(`当前装饰挂件数量: ${widgets.length}`)

  widgets.forEach((widget, index) => {
    console.log(`挂件 ${index + 1}:`, {
      className: widget.className,
      position: widget.style.position,
      animation: widget.style.animation,
    })
  })
}

// 测试动画
function testAnimations() {
  console.log('📋 开始测试动画...')

  const animationStyles = document.querySelectorAll(
    'style[data-animation^="ldesign-"]'
  )
  console.log(`当前动画样式数量: ${animationStyles.length}`)

  animationStyles.forEach((style, index) => {
    console.log(`动画样式 ${index + 1}:`, style.getAttribute('data-animation'))
  })
}

// 测试明暗模式切换
function testModeToggle() {
  console.log('📋 开始测试明暗模式切换...')

  const modeButton = document.querySelector('.mode-toggle')
  if (!modeButton) {
    console.error('❌ 找不到模式切换按钮')
    return
  }

  console.log('✅ 找到模式切换按钮')

  const originalMode = document.documentElement.getAttribute('data-mode')
  console.log(`当前模式: ${originalMode}`)

  // 切换模式
  modeButton.click()

  setTimeout(() => {
    const newMode = document.documentElement.getAttribute('data-mode')
    console.log(`切换后模式: ${newMode}`)

    if (newMode !== originalMode) {
      console.log('✅ 模式切换成功')
    } else {
      console.log('❌ 模式切换失败')
    }

    // 切换回原模式
    setTimeout(() => {
      modeButton.click()
      setTimeout(() => {
        const finalMode = document.documentElement.getAttribute('data-mode')
        console.log(`恢复后模式: ${finalMode}`)
        console.log('🎉 明暗模式测试完成！')
      }, 500)
    }, 1000)
  }, 500)
}

// 测试CSS变量
function testCSSVariables() {
  console.log('📋 开始测试CSS变量...')

  const root = document.documentElement
  const computedStyle = getComputedStyle(root)

  const variables = [
    '--color-primary',
    '--color-success',
    '--color-warning',
    '--color-error',
    '--color-text-primary',
    '--color-background-primary',
    '--gradient-primary',
    '--gradient-background',
  ]

  console.log('🎨 当前CSS变量值:')
  variables.forEach(variable => {
    const value = computedStyle.getPropertyValue(variable).trim()
    console.log(`  ${variable}: ${value}`)
  })

  console.log('🎉 CSS变量测试完成！')
}

// 测试响应式设计
function testResponsive() {
  console.log('📋 开始测试响应式设计...')

  const originalWidth = window.innerWidth
  console.log(`当前窗口宽度: ${originalWidth}px`)

  // 模拟不同屏幕尺寸
  const breakpoints = [
    { name: '移动端', width: 480 },
    { name: '平板端', width: 768 },
    { name: '桌面端', width: 1200 },
  ]

  breakpoints.forEach(bp => {
    console.log(`📱 模拟${bp.name} (${bp.width}px):`)

    // 检查相关样式
    const container = document.querySelector('.app-container')
    if (container) {
      const containerStyle = getComputedStyle(container)
      console.log(`  容器最大宽度: ${containerStyle.maxWidth}`)
      console.log(`  容器内边距: ${containerStyle.padding}`)
    }
  })

  console.log('🎉 响应式设计测试完成！')
}

// 综合测试
function runAllTests() {
  console.log('🚀 开始运行所有测试...')

  testCSSVariables()

  setTimeout(() => {
    testWidgets()

    setTimeout(() => {
      testAnimations()

      setTimeout(() => {
        testModeToggle()

        setTimeout(() => {
          testResponsive()

          setTimeout(() => {
            testThemeSwitch()
          }, 2000)
        }, 3000)
      }, 2000)
    }, 2000)
  }, 2000)
}

// 测试简化API
function testSimpleAPI() {
  console.log('📋 开始测试简化API...')

  if (typeof setTheme === 'function') {
    console.log('✅ setTheme 函数可用')

    // 测试节日主题快速切换
    const festivals = [
      'spring',
      'lantern',
      'qingming',
      'dragon-boat',
      'qixi',
      'mid-autumn',
      'double-ninth',
      'national',
      'christmas',
    ]

    festivals.forEach((festival, index) => {
      setTimeout(() => {
        console.log(`🎭 切换到${festival}主题...`)
        setFestivalTheme(festival)

        setTimeout(() => {
          const widgets = document.querySelectorAll('.ldesign-widget')
          console.log(`✅ ${festival}主题装饰挂件数量: ${widgets.length}`)
        }, 500)
      }, index * 1500)
    })

    // 最后切换回默认主题
    setTimeout(() => {
      console.log('🔄 切换回默认主题...')
      setTheme('default')
      console.log('🎉 简化API测试完成！')
    }, festivals.length * 1500)
  } else {
    console.error('❌ 简化API不可用')
  }
}

// 测试主题管理器
function testThemeManager() {
  console.log('📋 开始测试主题管理器...')

  const themeManager = document.querySelector('.theme-manager')
  if (themeManager) {
    console.log('✅ 找到主题管理器组件')

    const floatToggle = themeManager.querySelector('.float-toggle')
    if (floatToggle) {
      console.log('✅ 找到浮动切换按钮')

      // 模拟点击打开面板
      floatToggle.click()

      setTimeout(() => {
        const panel = themeManager.querySelector('.theme-panel')
        const isOpen = panel && panel.classList.contains('panel-open')
        console.log(
          `${isOpen ? '✅' : '❌'} 主题面板${isOpen ? '已打开' : '未打开'}`
        )

        // 测试主题卡片
        const themeCards = themeManager.querySelectorAll('.theme-card')
        console.log(`✅ 找到${themeCards.length}个主题卡片`)

        // 关闭面板
        setTimeout(() => {
          floatToggle.click()
          console.log('🎉 主题管理器测试完成！')
        }, 2000)
      }, 500)
    } else {
      console.error('❌ 找不到浮动切换按钮')
    }
  } else {
    console.error('❌ 找不到主题管理器组件')
  }
}

// 测试简化指令
function testSimpleDirectives() {
  console.log('📋 开始测试简化指令...')

  const festivalElements = document.querySelectorAll('[v-festival]')
  console.log(`✅ 找到${festivalElements.length}个使用v-festival指令的元素`)

  const quickThemeElements = document.querySelectorAll('[v-quick-theme]')
  console.log(
    `✅ 找到${quickThemeElements.length}个使用v-quick-theme指令的元素`
  )

  // 测试快速主题切换按钮
  if (quickThemeElements.length > 0) {
    console.log('🎭 测试快速主题切换按钮...')

    quickThemeElements.forEach((btn, index) => {
      setTimeout(() => {
        const theme = btn.getAttribute('data-quick-theme')
        console.log(`点击${theme}主题按钮...`)
        btn.click()

        setTimeout(() => {
          const widgets = document.querySelectorAll('.ldesign-widget')
          console.log(`✅ ${theme}主题装饰挂件数量: ${widgets.length}`)
        }, 300)
      }, index * 1000)
    })
  }

  console.log('🎉 简化指令测试完成！')
}

// 测试中国节日主题
function testChineseFestivals() {
  console.log('📋 开始测试中国节日主题...')

  const chineseFestivals = [
    { id: 'spring-festival', name: '春节', icon: '🧧' },
    { id: 'lantern-festival', name: '元宵节', icon: '🏮' },
    { id: 'qingming', name: '清明节', icon: '🌿' },
    { id: 'dragon-boat', name: '端午节', icon: '🐉' },
    { id: 'qixi', name: '七夕节', icon: '💕' },
    { id: 'mid-autumn', name: '中秋节', icon: '🌕' },
    { id: 'double-ninth', name: '重阳节', icon: '🌼' },
    { id: 'national-day', name: '国庆节', icon: '🇨🇳' },
  ]

  chineseFestivals.forEach((festival, index) => {
    setTimeout(() => {
      console.log(`${festival.icon} 切换到${festival.name}主题...`)
      setTheme(festival.id)

      setTimeout(() => {
        const widgets = document.querySelectorAll('.ldesign-widget')
        const rootTheme = document.documentElement.getAttribute('data-theme')
        console.log(
          `✅ ${festival.name}: 挂件${widgets.length}个, 根元素主题: ${rootTheme}`
        )
      }, 500)
    }, index * 1200)
  })

  setTimeout(() => {
    console.log('🎉 中国节日主题测试完成！')
  }, chineseFestivals.length * 1200)
}

// 综合测试（更新版）
function runAllTestsV2() {
  console.log('🚀 开始运行所有测试 v2.0...')

  testCSSVariables()

  setTimeout(() => {
    testSimpleAPI()

    setTimeout(() => {
      testThemeManager()

      setTimeout(() => {
        testSimpleDirectives()

        setTimeout(() => {
          testChineseFestivals()

          setTimeout(() => {
            testModeToggle()

            setTimeout(() => {
              testResponsive()
              console.log('🎉🎉🎉 所有测试完成！')
            }, 3000)
          }, 12000)
        }, 5000)
      }, 3000)
    }, 15000)
  }, 2000)
}

// 导出测试函数
window.testThemeSwitch = testThemeSwitch
window.testWidgets = testWidgets
window.testAnimations = testAnimations
window.testModeToggle = testModeToggle
window.testCSSVariables = testCSSVariables
window.testResponsive = testResponsive
window.testSimpleAPI = testSimpleAPI
window.testThemeManager = testThemeManager
window.testSimpleDirectives = testSimpleDirectives
window.testChineseFestivals = testChineseFestivals
window.runAllTests = runAllTests
window.runAllTestsV2 = runAllTestsV2

console.log('📝 可用的测试函数:')
console.log('  🎨 基础测试:')
console.log('    - testThemeSwitch() - 测试主题切换')
console.log('    - testWidgets() - 测试装饰挂件')
console.log('    - testAnimations() - 测试动画')
console.log('    - testModeToggle() - 测试明暗模式')
console.log('    - testCSSVariables() - 测试CSS变量')
console.log('    - testResponsive() - 测试响应式设计')
console.log('')
console.log('  🚀 新增测试:')
console.log('    - testSimpleAPI() - 测试简化API')
console.log('    - testThemeManager() - 测试主题管理器')
console.log('    - testSimpleDirectives() - 测试简化指令')
console.log('    - testChineseFestivals() - 测试中国节日主题')
console.log('')
console.log('  🎯 综合测试:')
console.log('    - runAllTests() - 运行基础测试')
console.log('    - runAllTestsV2() - 运行所有测试（推荐）')
console.log('')
console.log('💡 使用方法: 在控制台中输入函数名并回车执行')
console.log('🌟 推荐: runAllTestsV2()')
