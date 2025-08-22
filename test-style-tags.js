// 测试样式标签重复问题的脚本
import puppeteer from 'puppeteer'

async function testStyleTags() {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  try {
    // 导航到测试页面
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle2' })

    // 等待页面加载完成
    await page.waitForTimeout(2000)

    // 检查 ldesign-color-variables 样式标签
    const styleElements = await page.$$eval(
      'style[id="ldesign-color-variables"]',
      elements => {
        return elements.map(el => ({
          id: el.id,
          hasContent: el.textContent.trim().length > 0,
          contentLength: el.textContent.trim().length,
          contentPreview: el.textContent.trim().substring(0, 200) + '...',
        }))
      }
    )

    console.log('=== 样式标签检查结果 ===')
    console.log(
      `找到 ${styleElements.length} 个 ldesign-color-variables 样式标签`
    )

    styleElements.forEach((element, index) => {
      console.log(`\n标签 ${index + 1}:`)
      console.log(`  ID: ${element.id}`)
      console.log(`  有内容: ${element.hasContent}`)
      console.log(`  内容长度: ${element.contentLength}`)
      console.log(`  内容预览: ${element.contentPreview}`)
    })

    // 检查CSS变量是否完整
    const cssVariables = await page.evaluate(() => {
      const root = document.documentElement
      const computedStyle = getComputedStyle(root)
      const variables = {}

      // 获取所有CSS变量
      for (let i = 0; i < computedStyle.length; i++) {
        const property = computedStyle[i]
        if (property.startsWith('--color-')) {
          variables[property] = computedStyle.getPropertyValue(property).trim()
        }
      }

      return variables
    })

    console.log('\n=== CSS变量检查结果 ===')
    console.log(`找到 ${Object.keys(cssVariables).length} 个颜色相关的CSS变量`)

    // 检查是否包含色阶变量
    const scaleVariables = Object.keys(cssVariables).filter(key =>
      key.match(/--color-\w+-\d+/)
    )

    // 检查是否包含语义化变量
    const semanticVariables = Object.keys(cssVariables).filter(key =>
      key.match(
        /--color-(primary|success|warning|danger|text|border|background|shadow)/
      )
    )

    // 分类检查新增的变量
    const textVariables = Object.keys(cssVariables).filter(key =>
      key.match(
        /--color-text-(primary|secondary|tertiary|quaternary|disabled|placeholder)/
      )
    )

    const borderVariables = Object.keys(cssVariables).filter(
      key =>
        key.match(/--color-border-(light|strong)/) || key === '--color-border'
    )

    const backgroundVariables = Object.keys(cssVariables).filter(key =>
      key.match(/--color-background-(primary|secondary|tertiary|quaternary)/)
    )

    const shadowVariables = Object.keys(cssVariables).filter(
      key =>
        key.match(/--color-shadow-(light|strong)/) || key === '--color-shadow'
    )

    console.log(`色阶变量数量: ${scaleVariables.length}`)
    console.log(`语义化变量数量: ${semanticVariables.length}`)
    console.log(`文本变量数量: ${textVariables.length}`)
    console.log(`边框变量数量: ${borderVariables.length}`)
    console.log(`背景变量数量: ${backgroundVariables.length}`)
    console.log(`阴影变量数量: ${shadowVariables.length}`)

    if (scaleVariables.length > 0) {
      console.log('\n色阶变量示例:')
      scaleVariables.slice(0, 5).forEach(key => {
        console.log(`  ${key}: ${cssVariables[key]}`)
      })
    }

    if (textVariables.length > 0) {
      console.log('\n文本变量:')
      textVariables.forEach(key => {
        console.log(`  ${key}: ${cssVariables[key]}`)
      })
    }

    if (borderVariables.length > 0) {
      console.log('\n边框变量:')
      borderVariables.forEach(key => {
        console.log(`  ${key}: ${cssVariables[key]}`)
      })
    }

    if (backgroundVariables.length > 0) {
      console.log('\n背景变量:')
      backgroundVariables.forEach(key => {
        console.log(`  ${key}: ${cssVariables[key]}`)
      })
    }

    if (shadowVariables.length > 0) {
      console.log('\n阴影变量:')
      shadowVariables.forEach(key => {
        console.log(`  ${key}: ${cssVariables[key]}`)
      })
    }

    // 总结
    console.log('\n=== 修复效果总结 ===')
    if (styleElements.length === 1) {
      console.log('✅ 样式标签重复问题已修复')
    } else {
      console.log(`❌ 仍存在 ${styleElements.length} 个重复的样式标签`)
    }

    if (scaleVariables.length > 0 && semanticVariables.length > 0) {
      console.log('✅ CSS变量生成完整（包含色阶变量和语义化变量）')
    } else {
      console.log('❌ CSS变量生成不完整')
    }

    // 检查新增变量的完整性
    const expectedTextVars = 6 // primary, secondary, tertiary, quaternary, disabled, placeholder
    const expectedBorderVars = 3 // light, normal, strong
    const expectedBackgroundVars = 4 // primary, secondary, tertiary, quaternary
    const expectedShadowVars = 3 // light, normal, strong

    if (textVariables.length >= expectedTextVars) {
      console.log('✅ 文本变量扩展完整')
    } else {
      console.log(
        `❌ 文本变量不完整，期望${expectedTextVars}个，实际${textVariables.length}个`
      )
    }

    if (borderVariables.length >= expectedBorderVars) {
      console.log('✅ 边框变量扩展完整')
    } else {
      console.log(
        `❌ 边框变量不完整，期望${expectedBorderVars}个，实际${borderVariables.length}个`
      )
    }

    if (backgroundVariables.length >= expectedBackgroundVars) {
      console.log('✅ 背景变量扩展完整')
    } else {
      console.log(
        `❌ 背景变量不完整，期望${expectedBackgroundVars}个，实际${backgroundVariables.length}个`
      )
    }

    if (shadowVariables.length >= expectedShadowVars) {
      console.log('✅ 阴影变量扩展完整')
    } else {
      console.log(
        `❌ 阴影变量不完整，期望${expectedShadowVars}个，实际${shadowVariables.length}个`
      )
    }
  } catch (error) {
    console.error('测试过程中出现错误:', error)
  } finally {
    await browser.close()
  }
}

// 检查是否安装了puppeteer
try {
  await testStyleTags()
} catch (error) {
  console.log('请先安装puppeteer: npm install puppeteer')
  console.log('或者手动在浏览器中检查 http://localhost:3003/ 页面的开发者工具')
  console.error('错误详情:', error.message)
}
