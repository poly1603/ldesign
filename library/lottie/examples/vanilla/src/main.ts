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

// Example 6: Animation Sequence
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

console.log('🎨 Lottie examples loaded!')
console.log('💡 Try clicking and hovering on the animations!')
console.log('📊 Manager config:', lottieManager.getConfig())
