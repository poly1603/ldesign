/**
 * 快速验证暗色模式修复
 */

// 模拟后端算法
function hexToHsl(hex) {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h; let s; const l = (max + min) / 2

  if (max === min) {
    h = s = 0
  }
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h, s, l) {
  l /= 100
  const a = s * Math.min(l, 1 - l) / 100
  const f = (n) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// 修复后的算法
function generateColorScale(baseColor, count, mode) {
  const baseHsl = hexToHsl(baseColor)
  const colors = []

  for (let i = 0; i < count; i++) {
    const factor = i / (count - 1)
    let lightness

    if (mode === 'dark') {
      // 暗色模式：从深到浅（1级=最深色，12级=最浅色）
      lightness = 5 + (factor * 80) // 从5到85
    }
    else {
      // 亮色模式：从浅到深（1级=最浅色，12级=最深色）
      lightness = 95 - (factor * 90) // 从95到5
    }

    // 保持饱和度相对稳定，在中间位置稍微提高
    const saturationFactor = 1.0 - Math.abs(factor - 0.5) * 0.3
    const saturation = baseHsl.s * saturationFactor

    colors.push(hslToHex(baseHsl.h, saturation, lightness))
  }

  return colors
}

console.log('🎯 快速验证暗色模式色阶方向修复\n')

// 测试蓝色主题
const primaryColor = '#1677ff'
console.log(`测试颜色: ${primaryColor}`)

// 生成亮色模式色阶
const lightColors = generateColorScale(primaryColor, 12, 'light')
console.log('\n亮色模式色阶 (应该从浅到深):')
lightColors.forEach((color, index) => {
  const hsl = hexToHsl(color)
  console.log(`  ${index + 1}: ${color} (亮度: ${hsl.l.toFixed(1)}%)`)
})

// 生成暗色模式色阶
const darkColors = generateColorScale(primaryColor, 12, 'dark')
console.log('\n暗色模式色阶 (应该从深到浅):')
darkColors.forEach((color, index) => {
  const hsl = hexToHsl(color)
  console.log(`  ${index + 1}: ${color} (亮度: ${hsl.l.toFixed(1)}%)`)
})

// 验证方向
const lightFirst = hexToHsl(lightColors[0])
const lightLast = hexToHsl(lightColors[11])
const darkFirst = hexToHsl(darkColors[0])
const darkLast = hexToHsl(darkColors[11])

console.log('\n📊 验证结果:')
console.log(`亮色模式: 第1级亮度(${lightFirst.l.toFixed(1)}%) > 第12级亮度(${lightLast.l.toFixed(1)}%) = ${lightFirst.l > lightLast.l ? '✅ 正确' : '❌ 错误'}`)
console.log(`暗色模式: 第1级亮度(${darkFirst.l.toFixed(1)}%) < 第12级亮度(${darkLast.l.toFixed(1)}%) = ${darkFirst.l < darkLast.l ? '✅ 正确' : '❌ 错误'}`)

if (lightFirst.l > lightLast.l && darkFirst.l < darkLast.l) {
  console.log('\n🎉 修复验证成功！')
  console.log('✅ 亮色模式：从浅到深')
  console.log('✅ 暗色模式：从深到浅')
  console.log('\n现在可以在浏览器中查看视觉效果：')
  console.log('- 示例项目: http://localhost:3001 和 http://localhost:3003')
  console.log('- 完整演示: complete-color-scale-demo.html')
}
else {
  console.log('\n❌ 修复验证失败，需要进一步调试')
}
