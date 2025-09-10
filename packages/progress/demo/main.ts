
import { LinearProgress, CircularProgress, SemicircleProgress } from '@ldesign/progress'

// 一个简单的缓存，方便按钮调用
const instances: Record<string, any> = {}

function byId(id: string): HTMLElement {
  const el = document.getElementById(id)
  if (!el) throw new Error(`#${id} not found`)
  return el
}

function init() {
  // 线性进度条
  instances['basic-linear'] = new LinearProgress({
    container: byId('basic-linear'),
    renderType: 'svg',
    value: 50,
    height: 20,
    rounded: true,
    text: { enabled: true, format: (value, max) => `${Math.round((value / max) * 100)}%` },
    animation: { duration: 500, easing: 'easeInOut' }
  })

  // 圆形进度条
  instances['basic-circular'] = new CircularProgress({
    container: byId('basic-circular'),
    renderType: 'svg',
    value: 60,
    radius: 60,
    strokeWidth: 8,
    text: { enabled: true }
  })

  // 状态演示
  instances['success-progress'] = new LinearProgress({
    container: byId('success-progress'), renderType: 'svg', value: 100, height: 12, status: 'success'
  })
  instances['warning-progress'] = new LinearProgress({
    container: byId('warning-progress'), renderType: 'svg', value: 60, height: 12, status: 'warning'
  })
  instances['error-progress'] = new LinearProgress({
    container: byId('error-progress'), renderType: 'svg', value: 30, height: 12, status: 'error'
  })
  instances['loading-progress'] = new LinearProgress({
    container: byId('loading-progress'), renderType: 'svg', value: 50, height: 12, status: 'loading', indeterminate: true
  })

  // 分段进度条
  instances['segment-progress'] = new LinearProgress({
    container: byId('segment-progress'),
    renderType: 'svg',
    value: 40,
    height: 30,
    rounded: true,
    segments: { enabled: true, count: 5, gap: 4 }
  })

  // 上传演示
  instances['upload-progress'] = new LinearProgress({
    container: byId('upload-progress'),
    renderType: 'svg',
    value: 0,
    height: 8,
    buffer: { showBuffer: true, buffer: 0.2 },
    text: { enabled: true, format: (value, max) => `${Math.round((value / max) * 100)}%` },
    animation: { duration: 300, easing: 'easeOut' }
  })

  // 圆形状态进度条
  instances['circular-normal'] = new CircularProgress({
    container: byId('circular-normal'),
    radius: 45,
    strokeWidth: 8,
    value: 65,
    status: 'normal',
    text: { enabled: true },
    animation: { duration: 500 }
  })

  instances['circular-success'] = new CircularProgress({
    container: byId('circular-success'),
    radius: 45,
    strokeWidth: 8,
    value: 100,
    status: 'success',
    text: { enabled: true },
    animation: { duration: 500 }
  })

  instances['circular-warning'] = new CircularProgress({
    container: byId('circular-warning'),
    radius: 45,
    strokeWidth: 8,
    value: 75,
    status: 'warning',
    text: { enabled: true },
    animation: { duration: 500 }
  })

  instances['circular-error'] = new CircularProgress({
    container: byId('circular-error'),
    radius: 45,
    strokeWidth: 8,
    value: 35,
    status: 'error',
    text: { enabled: true },
    animation: { duration: 500 }
  })

  // 圆形分段进度条
  instances['circular-segment'] = new CircularProgress({
    container: byId('circular-segment'),
    radius: 60,
    strokeWidth: 10,
    value: 70,
    progressColor: '#165DFF',
    segments: {
      enabled: true,
      count: 12,
      gap: 3
    },
    text: { enabled: true },
    animation: { duration: 600 }
  })

  // 视觉效果进度条
  // 条纹效果
  if (document.getElementById('stripe-progress')) {
    instances['stripe-progress'] = new LinearProgress({
      container: byId('stripe-progress'),
      value: 70,
      height: 16,
      progressColor: '#165DFF',
      effects: {
        stripe: {
          enabled: true,
          width: 20,
          angle: 45,
          animated: true
        }
      },
      text: { enabled: true }
    })
  }

  // 波浪效果
  if (document.getElementById('wave-progress')) {
    instances['wave-progress'] = new LinearProgress({
      container: byId('wave-progress'),
      value: 60,
      height: 16,
      progressColor: '#00b42a',
      effects: {
        wave: {
          enabled: true,
          amplitude: 3,
          frequency: 2,
          animated: true
        }
      },
      text: { enabled: true }
    })
  }

  // 发光效果
  if (document.getElementById('glow-progress')) {
    instances['glow-progress'] = new LinearProgress({
      container: byId('glow-progress'),
      value: 80,
      height: 16,
      progressColor: '#ff7d00',
      effects: {
        glow: {
          enabled: true,
          color: '#ff7d00',
          size: 8,
          animated: true
        }
      },
      text: { enabled: true }
    })
  }

  // 渐变色彩
  if (document.getElementById('gradient-progress')) {
    instances['gradient-progress'] = new LinearProgress({
      container: byId('gradient-progress'),
      value: 90,
      height: 16,
      progressColor: '#165DFF',
      effects: {
        gradient: {
          enabled: true,
          colors: ['#667eea', '#764ba2'],
          angle: 90
        }
      },
      text: { enabled: true }
    })
  }

  // 多环进度条
  if (document.getElementById('multi-ring')) {
    instances['multi-ring'] = new CircularProgress({
      container: byId('multi-ring'),
      radius: 70,
      strokeWidth: 8,
      value: 85,
      progressColor: '#165DFF',
      multiRing: {
        enabled: true,
        rings: [
          { value: 90, color: '#00b42a' },
          { value: 75, color: '#ff7d00' },
          { value: 60, color: '#f53f3f' }
        ]
      },
      text: {
        enabled: true,
        format: (value) => Math.round(value) + '%'
      },
      animation: { duration: 800 }
    })
  }

  // 仪表盘
  if (document.getElementById('dashboard')) {
    instances['dashboard'] = new CircularProgress({
      container: byId('dashboard'),
      radius: 80,
      strokeWidth: 12,
      value: 60,
      progressColor: '#165DFF',
      startAngle: -135,
      clockwise: true,
      text: {
        enabled: true,
        format: (value) => Math.round(value) + ' km/h'
      },
      animation: {
        duration: 1000,
        easing: 'ease-in-out'
      }
    })
  }

  // 步骤进度
  if (document.getElementById('steps-progress')) {
    instances['steps-progress'] = new LinearProgress({
      container: byId('steps-progress'),
      value: 25,
      height: 8,
      segments: {
        enabled: true,
        count: 4,
        gap: 10
      },
      progressColor: '#165DFF'
    })
  }

  // 颜色主题
  const colorThemes = [
    { id: 'color-purple', color: '#667eea' },
    { id: 'color-pink', color: '#f093fb' },
    { id: 'color-blue', color: '#4facfe' },
    { id: 'color-green', color: '#43e97b' }
  ]

  colorThemes.forEach(theme => {
    if (document.getElementById(theme.id)) {
      instances[theme.id] = new LinearProgress({
        container: byId(theme.id),
        value: 70,
        height: 8,
        progressColor: theme.color,
        rounded: true
      })
    }
  })

  // 半圆进度条
  if (document.getElementById('semicircle-bottom')) {
    instances['semicircle-bottom'] = new SemicircleProgress({
      container: byId('semicircle-bottom'),
      radius: 60,
      strokeWidth: 10,
      value: 65,
      direction: 'bottom',
      progressColor: '#165DFF',
      text: { enabled: true },
      animation: { duration: 600 }
    })
  }

  if (document.getElementById('semicircle-top')) {
    instances['semicircle-top'] = new SemicircleProgress({
      container: byId('semicircle-top'),
      radius: 60,
      strokeWidth: 10,
      value: 80,
      direction: 'top',
      progressColor: '#00b42a',
      text: { enabled: true },
      animation: { duration: 600 }
    })
  }

  if (document.getElementById('semicircle-left')) {
    instances['semicircle-left'] = new SemicircleProgress({
      container: byId('semicircle-left'),
      radius: 60,
      strokeWidth: 10,
      value: 45,
      direction: 'left',
      progressColor: '#ff7d00',
      text: { enabled: true },
      animation: { duration: 600 }
    })
  }

  if (document.getElementById('semicircle-right')) {
    instances['semicircle-right'] = new SemicircleProgress({
      container: byId('semicircle-right'),
      radius: 60,
      strokeWidth: 10,
      value: 90,
      direction: 'right',
      progressColor: '#f53f3f',
      text: { enabled: true },
      animation: { duration: 600 }
    })
  }
}

init()

  // 提供给页面按钮使用（挂到 window）
  ; (window as any).setProgress = (id: string, percent: number) => {
    const inst = instances[id]
    if (!inst) return
    inst.setProgress(percent / 100, true)
  }

  ; (window as any).animateProgress = (id: string) => {
    const inst = instances[id]
    if (!inst) return
    inst.setProgress(1, true)
    setTimeout(() => inst.setProgress(0, true), 2200)
  }

  // 设置圆形进度条状态
  ; (window as any).setCircularStatus = (status: 'normal' | 'success' | 'warning' | 'error') => {
    const circularIds = ['basic-circular', 'circular-normal', 'circular-success', 'circular-warning', 'circular-error']
    circularIds.forEach(id => {
      const inst = instances[id]
      if (inst && inst.setStatus) {
        inst.setStatus(status)
      }
    })
  }

  // 切换圆形进度条分段
  ; (window as any).toggleCircularSegments = () => {
    const current = instances['basic-circular']
    if (!current) return

    const currentValue = 60
    const hasSegments = !!(current as any).options?.segments?.enabled

    instances['basic-circular'] = new CircularProgress({
      container: byId('basic-circular'),
      radius: 60,
      strokeWidth: 8,
      value: currentValue,
      progressColor: '#165DFF',
      segments: {
        enabled: !hasSegments,
        count: 10,
        gap: 2
      },
      text: { enabled: true },
      animation: { duration: 500 }
    })
  }

  // 更新多环进度条
  ; (window as any).updateMultiRing = () => {
    const inst = instances['multi-ring']
    if (!inst) return

    instances['multi-ring'] = new CircularProgress({
      container: byId('multi-ring'),
      radius: 70,
      strokeWidth: 8,
      value: Math.random() * 100,
      progressColor: '#165DFF',
      multiRing: {
        enabled: true,
        rings: [
          { value: Math.random() * 100, color: '#00b42a' },
          { value: Math.random() * 100, color: '#ff7d00' },
          { value: Math.random() * 100, color: '#f53f3f' }
        ]
      },
      text: {
        enabled: true,
        format: (value: number) => Math.round(value) + '%'
      },
      animation: { duration: 800 }
    })
  }

  // 设置仪表盘
  ; (window as any).setDashboard = (value: number) => {
    const inst = instances['dashboard']
    if (inst) {
      inst.setValue(value, true)
    }
  }

  // 设置步骤
  ; (window as any).setStep = (step: number) => {
    const value = (step / 4) * 100
    const inst = instances['steps-progress']
    if (inst) {
      inst.setValue(value, true)
    }
  }

  // 设置半圆进度条
  ; (window as any).setSemicircle = (percent: number) => {
    const semicircleIds = ['semicircle-bottom', 'semicircle-top', 'semicircle-left', 'semicircle-right']
    semicircleIds.forEach(id => {
      const inst = instances[id]
      if (inst) {
        inst.setProgress(percent / 100, true)
      }
    })
  }

  // 半圆进度条动画演示
  ; (window as any).animateSemicircle = () => {
    const semicircleIds = ['semicircle-bottom', 'semicircle-top', 'semicircle-left', 'semicircle-right']
    semicircleIds.forEach(id => {
      const inst = instances[id]
      if (inst) {
        inst.setValue(0, false)
        setTimeout(() => inst.setValue(100, true), 100)
        setTimeout(() => inst.setValue(65, true), 2500)
      }
    })
  }

let uploadTimer: number | null = null
  ; (window as any).startUpload = () => {
    const inst = instances['upload-progress'] as LinearProgress
    if (!inst) return
    let v = 0
    if (uploadTimer) window.clearInterval(uploadTimer)
    uploadTimer = window.setInterval(() => {
      v = Math.min(100, v + Math.random() * 6)
      inst.setValue(v)
      inst.setBuffer(Math.min(1, (v + 10) / 100))
        ; (document.getElementById('upload-speed')!).textContent = `速度: ${Math.round(200 + Math.random() * 150)} KB/s`
        ; (document.getElementById('upload-eta')!).textContent = `剩余时间: 00:${String(Math.max(0, Math.round((100 - v) / 5))).padStart(2, '0')}`
      if (v >= 100 && uploadTimer) {
        window.clearInterval(uploadTimer)
        uploadTimer = null
      }
    }, 400) as unknown as number
  }

  ; (window as any).pauseUpload = () => {
    if (uploadTimer) {
      window.clearInterval(uploadTimer)
      uploadTimer = null
    }
  }

  ; (window as any).resetUpload = () => {
    const inst = instances['upload-progress'] as LinearProgress
    if (!inst) return
    if (uploadTimer) {
      window.clearInterval(uploadTimer)
      uploadTimer = null
    }
    inst.setValue(0, false)
    inst.setBuffer(0,)
      ; (document.getElementById('upload-speed')!).textContent = '速度: 0 KB/s'
      ; (document.getElementById('upload-eta')!).textContent = '剩余时间: --:--'
  }

