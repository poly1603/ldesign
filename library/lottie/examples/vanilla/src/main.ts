import { createLottie, lottieManager, AnimationSequence, InteractiveController } from '../../../src/index'

// Example 1: Loading Animation (colorful confetti loader)
const example1 = createLottie({
  container: '#lottie1',
  path: '/loading-spinner.json',
  loop: true,
  autoplay: true,
  name: 'loading-animation',
  events: {
    stateChange: (state) => {
      const stateEl = document.getElementById('state1')
      if (stateEl) stateEl.textContent = state
    },
    data_ready: () => {
      console.log('✅ Example 1: Animation data loaded')
    },
    data_failed: (error) => {
      console.error('❌ Example 1: Failed to load animation', error)
    }
  }
})

// Example 2: Click Interaction (success checkmark)
const example2 = createLottie({
  container: '#lottie2',
  path: '/success-checkmark.json',
  loop: false,
  autoplay: false,
  name: 'click-animation',
  events: {
    stateChange: (state) => {
      const stateEl = document.getElementById('state2')
      if (stateEl) stateEl.textContent = state
    }
  }
})

new InteractiveController({
  instance: example2,
  enableClick: true
})

// Example 3: Hover Interaction (animated heart)
const example3 = createLottie({
  container: '#lottie3',
  path: '/heart-beat.json',
  loop: true,
  autoplay: false,
  name: 'hover-animation'
})

new InteractiveController({
  instance: example3,
  enableHover: true
})

// Example 4: Rocket Animation
const example4 = createLottie({
  container: '#lottie4',
  path: '/rocket.json',
  loop: false,
  autoplay: false,
  name: 'rocket-animation'
})

// Example 5: Confetti Animation
const example5 = createLottie({
  container: '#lottie5',
  path: '/confetti.json',
  loop: false,
  autoplay: false,
  name: 'confetti-animation'
})

// Example 6: Direction Control
const example6 = createLottie({
  container: '#lottie6',
  path: '/loading-spinner.json',
  loop: true,
  autoplay: false,
  name: 'direction-control'
})

;(window as any).toggleDirection = () => {
  const currentDir = example6.animation?.playDirection || 1
  const newDir = currentDir === 1 ? -1 : 1
  example6.setDirection(newDir)
  const dirEl = document.getElementById('direction6')
  if (dirEl) dirEl.textContent = newDir.toString()
  if (example6.state !== 'playing') {
    example6.play()
  }
}

// Example 7: Frame Control
const example7 = createLottie({
  container: '#lottie7',
  path: '/heart-beat.json',
  loop: false,
  autoplay: false,
  name: 'frame-control'
})

example7.on('data_ready', () => {
  const totalFramesEl = document.getElementById('totalFrames')
  const frameSlider = document.getElementById('frameSlider') as HTMLInputElement
  
  if (example7.animation && totalFramesEl && frameSlider) {
    const total = example7.animation.totalFrames
    totalFramesEl.textContent = Math.floor(total).toString()
    frameSlider.max = Math.floor(total - 1).toString()
    
    frameSlider.addEventListener('input', (e) => {
      const frame = parseInt((e.target as HTMLInputElement).value)
      example7.goToAndStop(frame, true)
      const currentFrameEl = document.getElementById('currentFrame')
      if (currentFrameEl) currentFrameEl.textContent = frame.toString()
    })
  }
})

example7.on('enterFrame', (e: any) => {
  const currentFrameEl = document.getElementById('currentFrame')
  const frameSlider = document.getElementById('frameSlider') as HTMLInputElement
  if (currentFrameEl && example7.animation) {
    const frame = Math.floor(e.currentTime)
    currentFrameEl.textContent = frame.toString()
    if (frameSlider) frameSlider.value = frame.toString()
  }
})

// Example 8: Segment Play
const example8 = createLottie({
  container: '#lottie8',
  path: '/loading-spinner.json',
  loop: false,
  autoplay: false,
  name: 'segment-play'
})

;(window as any).playSegment1 = () => {
  if (example8.animation) {
    const total = example8.animation.totalFrames
    example8.playSegments([0, total / 3], true)
  }
}

;(window as any).playSegment2 = () => {
  if (example8.animation) {
    const total = example8.animation.totalFrames
    example8.playSegments([total / 3, (total / 3) * 2], true)
  }
}

;(window as any).playFull = () => {
  example8.stop()
  example8.play()
}

// Example 9: Renderer Switching
let example9: any = null
let currentRenderer: 'svg' | 'canvas' | 'html' = 'svg'

const createRendererExample = (renderer: 'svg' | 'canvas' | 'html') => {
  if (example9) {
    example9.destroy()
  }
  
  example9 = createLottie({
    container: '#lottie9',
    path: '/rocket.json',
    loop: true,
    autoplay: true,
    renderer,
    name: `renderer-${renderer}`
  })
  
  currentRenderer = renderer
  const rendererEl = document.getElementById('currentRenderer')
  if (rendererEl) rendererEl.textContent = renderer
}

createRendererExample('svg')

;(window as any).switchRenderer = (renderer: 'svg' | 'canvas' | 'html') => {
  createRendererExample(renderer)
}

// Example 10: Event Monitoring
const example10 = createLottie({
  container: '#lottie10',
  path: '/success-checkmark.json',
  loop: true,
  autoplay: false,
  name: 'event-monitor'
})

const logEvent = (eventName: string, data?: any) => {
  const logEl = document.getElementById('eventLog')
  if (logEl) {
    const time = new Date().toLocaleTimeString()
    const dataStr = data ? ` - ${JSON.stringify(data).substring(0, 50)}` : ''
    logEl.innerHTML = `<div>[${time}] ${eventName}${dataStr}</div>` + logEl.innerHTML
    // 只保留最近 10 条
    const entries = logEl.children
    while (entries.length > 10) {
      logEl.removeChild(entries[entries.length - 1])
    }
  }
}

example10.on('data_ready', () => logEvent('data_ready'))
example10.on('stateChange', (state) => logEvent('stateChange', state))
example10.on('complete', () => logEvent('complete'))
example10.on('loopComplete', () => logEvent('loopComplete'))
example10.on('enterFrame', (e) => {
  // 只记录每 10 帧
  if (Math.floor(e.currentTime) % 10 === 0) {
    logEvent('enterFrame', { frame: Math.floor(e.currentTime) })
  }
})

// Example 11: Loading States
let example11: any = null

const loadAnimation11 = async () => {
  const overlayEl = document.getElementById('loadingOverlay')
  const statusEl = document.getElementById('loadStatus')
  
  if (overlayEl) overlayEl.style.display = 'flex'
  if (statusEl) statusEl.textContent = 'Loading...'
  
  if (example11) {
    example11.destroy()
  }
  
  example11 = createLottie({
    container: '#lottie11',
    path: '/confetti.json',
    loop: false,
    autoplay: false,
    name: 'loading-states',
    events: {
      data_ready: () => {
        if (overlayEl) overlayEl.style.display = 'none'
        if (statusEl) statusEl.textContent = 'Ready'
      },
      data_failed: (error) => {
        if (overlayEl) {
          overlayEl.style.display = 'flex'
          overlayEl.innerHTML = '<div style="text-align: center;"><div style="color: red;">❌ Error</div><div style="font-size: 12px; margin-top: 8px;">Failed to load</div></div>'
        }
        if (statusEl) statusEl.textContent = 'Error'
        console.error('Failed to load animation:', error)
      }
    }
  })
}

loadAnimation11()

;(window as any).reloadAnimation = () => {
  loadAnimation11()
}

;(window as any).simulateError = () => {
  const overlayEl = document.getElementById('loadingOverlay')
  const statusEl = document.getElementById('loadStatus')
  
  if (example11) {
    example11.destroy()
  }
  
  // 创建一个会失败的实例
  example11 = createLottie({
    container: '#lottie11',
    path: '/non-existent-file.json',
    loop: false,
    autoplay: false,
    name: 'error-demo',
    events: {
      data_failed: () => {
        if (overlayEl) {
          overlayEl.style.display = 'flex'
          overlayEl.innerHTML = '<div style="text-align: center;"><div style="color: red; font-size: 24px;">❌</div><div style="margin-top: 8px;">Failed to load</div><button onclick="window.reloadAnimation()" style="margin-top: 12px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button></div>'
        }
        if (statusEl) statusEl.textContent = 'Error - Click Retry'
      }
    }
  })
}

// Example 12: Animation Sequence
let sequence: AnimationSequence | null = null

function createAnimationSequence() {
  sequence = new AnimationSequence()

  sequence.add({
    config: {
      container: '#seq1',
      path: '/rocket.json',
      loop: false,
      autoplay: false,
    },
    delay: 0
  })

  sequence.add({
    config: {
      container: '#seq2',
      path: '/confetti.json',
      loop: false,
      autoplay: false,
    },
    delay: 300
  })

  sequence.add({
    config: {
      container: '#seq3',
      path: '/success-checkmark.json',
      loop: false,
      autoplay: false,
    },
    delay: 300
  })
}

;(window as any).playSequence = async () => {
  if (!sequence) createAnimationSequence()
  const statusEl = document.getElementById('seqStatus')
  if (statusEl) statusEl.textContent = 'Playing...'

  await sequence!.play()

  if (statusEl) statusEl.textContent = 'Completed'
  console.log('✅ Sequence completed')
}

;(window as any).pauseSequence = () => {
  sequence?.pause()
  const statusEl = document.getElementById('seqStatus')
  if (statusEl) statusEl.textContent = 'Paused'
}

;(window as any).stopSequence = () => {
  sequence?.stop()
  const statusEl = document.getElementById('seqStatus')
  if (statusEl) statusEl.textContent = 'Stopped'
}

// Update global stats every second
setInterval(() => {
  const stats = lottieManager.getGlobalStats()
  const totalEl = document.getElementById('totalInstances')
  const activeEl = document.getElementById('activeInstances')
  const fpsEl = document.getElementById('averageFps')
  const cacheEl = document.getElementById('cacheHitRate')

  if (totalEl) totalEl.textContent = stats.totalInstances.toString()
  if (activeEl) activeEl.textContent = stats.activeInstances.toString()
  if (fpsEl) fpsEl.textContent = stats.averageFps.toString()
  if (cacheEl) cacheEl.textContent = `${Math.round(stats.cacheHitRate * 100)}%`
}, 1000)

// Expose to global for HTML button handlers
;(window as any).example1 = example1
;(window as any).example4 = example4
;(window as any).example5 = example5
;(window as any).example6 = example6
;(window as any).example7 = example7
;(window as any).example10 = example10

console.log('🎨 Lottie examples loaded!')
console.log('💡 Try clicking and hovering on the animations!')
console.log('📊 Manager config:', lottieManager.getConfig())
