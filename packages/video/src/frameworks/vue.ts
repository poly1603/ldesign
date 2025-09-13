/**
 * Vue 3 集成支持
 * 提供 Vue 3 组件和组合式API
 */

import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import { VideoPlayer } from '../core/player'
import type { PlayerOptions, PlayerStatus, IVideoPlayer } from '../types/player'

/**
 * Vue 播放器组合式API
 */
export function useVideoPlayer(options: Ref<PlayerOptions> | PlayerOptions) {
  const playerRef = ref<IVideoPlayer | null>(null)
  const containerRef = ref<HTMLElement | null>(null)
  const status = ref<PlayerStatus>({
    state: 'uninitialized',
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    fullscreen: false,
    pip: false
  })

  const isReady = ref(false)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * 初始化播放器
   */
  const initPlayer = async () => {
    if (!containerRef.value) {
      throw new Error('Container element not found')
    }

    try {
      isLoading.value = true
      error.value = null

      const playerOptions = typeof options === 'object' && 'value' in options ? options.value : options
      
      playerRef.value = new VideoPlayer({
        ...playerOptions,
        container: containerRef.value
      })

      // 绑定事件监听器
      bindPlayerEvents()

      // 初始化播放器
      await playerRef.value.initialize()
      
      isReady.value = true
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 销毁播放器
   */
  const destroyPlayer = () => {
    if (playerRef.value) {
      playerRef.value.destroy()
      playerRef.value = null
      isReady.value = false
    }
  }

  /**
   * 绑定播放器事件
   */
  const bindPlayerEvents = () => {
    if (!playerRef.value) return

    const player = playerRef.value

    // 状态更新事件
    player.on('ready', () => {
      status.value = { ...player.status }
    })

    player.on('timeupdate', () => {
      status.value = { ...player.status }
    })

    player.on('play', () => {
      status.value = { ...player.status }
    })

    player.on('pause', () => {
      status.value = { ...player.status }
    })

    player.on('volumechange', () => {
      status.value = { ...player.status }
    })

    player.on('ratechange', () => {
      status.value = { ...player.status }
    })

    player.on('fullscreenchange', () => {
      status.value = { ...player.status }
    })

    player.on('pipchange', () => {
      status.value = { ...player.status }
    })

    player.on('error', (errorEvent) => {
      error.value = errorEvent.error
    })
  }

  /**
   * 播放器控制方法
   */
  const play = async () => {
    if (playerRef.value) {
      await playerRef.value.play()
    }
  }

  const pause = () => {
    if (playerRef.value) {
      playerRef.value.pause()
    }
  }

  const toggle = () => {
    if (playerRef.value) {
      playerRef.value.toggle()
    }
  }

  const seek = (time: number) => {
    if (playerRef.value) {
      playerRef.value.seek(time)
    }
  }

  const setVolume = (volume: number) => {
    if (playerRef.value) {
      playerRef.value.setVolume(volume)
    }
  }

  const setPlaybackRate = (rate: number) => {
    if (playerRef.value) {
      playerRef.value.setPlaybackRate(rate)
    }
  }

  const toggleFullscreen = async () => {
    if (playerRef.value) {
      await playerRef.value.toggleFullscreen()
    }
  }

  const togglePip = async () => {
    if (playerRef.value) {
      await playerRef.value.togglePip()
    }
  }

  // 监听配置变化
  if (typeof options === 'object' && 'value' in options) {
    watch(options, async (newOptions) => {
      if (playerRef.value && isReady.value) {
        // 重新初始化播放器
        destroyPlayer()
        await initPlayer()
      }
    }, { deep: true })
  }

  // 生命周期钩子
  onMounted(() => {
    if (containerRef.value) {
      initPlayer().catch(console.error)
    }
  })

  onUnmounted(() => {
    destroyPlayer()
  })

  return {
    // 引用
    containerRef,
    playerRef,
    
    // 状态
    status,
    isReady,
    isLoading,
    error,
    
    // 方法
    initPlayer,
    destroyPlayer,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setPlaybackRate,
    toggleFullscreen,
    togglePip
  }
}

/**
 * Vue 播放器组件定义
 */
export const VideoPlayerComponent = {
  name: 'VideoPlayer',
  props: {
    src: {
      type: [String, Object],
      required: true
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    muted: {
      type: Boolean,
      default: false
    },
    loop: {
      type: Boolean,
      default: false
    },
    controls: {
      type: Boolean,
      default: true
    },
    volume: {
      type: Number,
      default: 1
    },
    playbackRate: {
      type: Number,
      default: 1
    },
    theme: {
      type: [String, Object],
      default: 'default'
    },
    plugins: {
      type: Array,
      default: () => []
    },
    className: {
      type: String,
      default: ''
    }
  },
  emits: [
    'ready',
    'play',
    'pause',
    'ended',
    'timeupdate',
    'volumechange',
    'ratechange',
    'fullscreenchange',
    'pipchange',
    'error'
  ],
  setup(props, { emit, expose }) {
    const playerOptions = ref({
      src: props.src,
      autoplay: props.autoplay,
      muted: props.muted,
      loop: props.loop,
      controls: props.controls,
      volume: props.volume,
      playbackRate: props.playbackRate,
      theme: props.theme,
      plugins: props.plugins,
      className: props.className
    })

    const {
      containerRef,
      playerRef,
      status,
      isReady,
      isLoading,
      error,
      play,
      pause,
      toggle,
      seek,
      setVolume,
      setPlaybackRate,
      toggleFullscreen,
      togglePip
    } = useVideoPlayer(playerOptions)

    // 监听属性变化
    watch(() => props.src, (newSrc) => {
      playerOptions.value.src = newSrc
    })

    watch(() => props.volume, (newVolume) => {
      setVolume(newVolume)
    })

    watch(() => props.playbackRate, (newRate) => {
      setPlaybackRate(newRate)
    })

    // 绑定事件发射
    watch(isReady, (ready) => {
      if (ready) {
        emit('ready')
      }
    })

    watch(() => status.value.state, (state, oldState) => {
      if (state === 'playing' && oldState !== 'playing') {
        emit('play')
      } else if (state === 'paused' && oldState !== 'paused') {
        emit('pause')
      } else if (state === 'ended') {
        emit('ended')
      }
    })

    watch(() => status.value.currentTime, () => {
      emit('timeupdate', {
        currentTime: status.value.currentTime,
        duration: status.value.duration
      })
    })

    watch(() => [status.value.volume, status.value.muted], () => {
      emit('volumechange', {
        volume: status.value.volume,
        muted: status.value.muted
      })
    })

    watch(() => status.value.playbackRate, () => {
      emit('ratechange', {
        playbackRate: status.value.playbackRate
      })
    })

    watch(() => status.value.fullscreen, () => {
      emit('fullscreenchange', {
        fullscreen: status.value.fullscreen
      })
    })

    watch(() => status.value.pip, () => {
      emit('pipchange', {
        pip: status.value.pip
      })
    })

    watch(error, (err) => {
      if (err) {
        emit('error', err)
      }
    })

    // 暴露方法给模板引用
    expose({
      player: playerRef,
      status,
      isReady,
      isLoading,
      error,
      play,
      pause,
      toggle,
      seek,
      setVolume,
      setPlaybackRate,
      toggleFullscreen,
      togglePip
    })

    return {
      containerRef,
      isLoading,
      error
    }
  },
  template: `
    <div 
      ref="containerRef" 
      class="lv-player-container"
      :class="className"
    >
      <div v-if="isLoading" class="lv-loading">
        <div class="lv-loading-spinner"></div>
        <span>加载中...</span>
      </div>
      <div v-if="error" class="lv-error">
        <span>播放器错误: {{ error.message }}</span>
      </div>
    </div>
  `
}

/**
 * Vue 插件安装函数
 */
export function install(app: any) {
  app.component('VideoPlayer', VideoPlayerComponent)
}

/**
 * 默认导出
 */
export default {
  install,
  VideoPlayerComponent,
  useVideoPlayer
}
