/**
 * 验证码工具类
 */

export interface CaptchaData {
  code: string
  imageData: string
}

/**
 * 生成随机验证码
 */
export function generateCaptchaCode(length: number = 4): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 生成验证码图片
 */
export function generateCaptchaImage(code: string, width: number = 120, height: number = 40): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')!
  
  // 设置背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#f0f9ff')
  gradient.addColorStop(1, '#e0f2fe')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // 添加噪点
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2)
  }
  
  // 添加干扰线
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.stroke()
  }
  
  // 绘制验证码文字
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  const charWidth = width / code.length
  for (let i = 0; i < code.length; i++) {
    const char = code[i]
    const x = charWidth * i + charWidth / 2
    const y = height / 2 + (Math.random() - 0.5) * 8
    
    // 随机颜色
    ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 40%)`
    
    // 随机旋转
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((Math.random() - 0.5) * 0.5)
    ctx.fillText(char, 0, 0)
    ctx.restore()
  }
  
  return canvas.toDataURL('image/png')
}

/**
 * 创建验证码数据
 */
export function createCaptcha(): CaptchaData {
  const code = generateCaptchaCode()
  const imageData = generateCaptchaImage(code)
  return { code, imageData }
}

/**
 * 验证验证码
 */
export function validateCaptcha(userInput: string, correctCode: string): boolean {
  return userInput.toUpperCase() === correctCode.toUpperCase()
}
