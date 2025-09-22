/**
 * Vue 3 适配器
 * 提供 Vue 3 组件和组合式 API
 */

import { 
  defineComponent, 
  ref, 
  onMounted, 
  onUnmounted, 
  watch, 
  computed,
  PropType,
  h,
  VNode
} from 'vue';

import { Player, createPlayer } from '../core/Player';
import { setupBasicPlayer, PluginFactoryConfig } from '../plugins';
import type { PlayerConfig } from '../types';

/**
 * Vue 播放器属性
 */
export interface VuePlayerProps {
  src?: string | string[];
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  responsive?: boolean;
  plugins?: PluginFactoryConfig;
  theme?: string;
}

/**
 * Vue 播放器组件
 */
export const VideoPlayer = defineComponent({
  name: 'VideoPlayer',
  props: {
    src: {
      type: [String, Array] as PropType<string | string[]>,
      default: ''
    },
    poster: {
      type: String,
      default: ''
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
    width: {
      type: [String, Number] as PropType<string | number>,
      default: '100%'
    },
    height: {
      type: [String, Number] as PropType<string | number>,
      default: 'auto'
    },
    responsive: {
      type: Boolean,
      default: true
    },
    plugins: {
      type: Object as PropType<PluginFactoryConfig>,
      default: () => ({})
    },
    theme: {
      type: String,
      default: 'default'
    }
  },
  emits: [
    'ready',
    'play',
    'pause',
    'ended',
    'timeupdate',
    'loadstart',
    'loadedmetadata',
    'canplay',
    'waiting',
    'seeking',
    'seeked',
    'error',
    'fullscreen:enter',
    'fullscreen:exit',
    'volume:change',
    'rate:change'
  ],
  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement>();
    const player = ref<Player>();
    const isReady = ref(false);

    // 创建播放器
    const createPlayerInstance = async () => {
      if (!containerRef.value) return;

      const config: PlayerConfig = {
        container: containerRef.value,
        src: props.src,
        poster: props.poster,
        autoplay: props.autoplay,
        muted: props.muted,
        loop: props.loop,
        controls: false, // 使用自定义控制栏
        width: props.width,
        height: props.height,
        responsive: props.responsive
      };

      try {
        player.value = createPlayer(config);
        
        // 设置基础插件
        await setupBasicPlayer(player.value, props.plugins);
        
        // 绑定事件
        bindEvents();
        
        isReady.value = true;
        emit('ready', player.value);
        
      } catch (error) {
        console.error('Failed to create player:', error);
        emit('error', error);
      }
    };

    // 绑定播放器事件
    const bindEvents = () => {
      if (!player.value) return;

      player.value.on('media:play', (data) => emit('play', data));
      player.value.on('media:pause', (data) => emit('pause', data));
      player.value.on('media:ended', (data) => emit('ended', data));
      player.value.on('media:timeupdate', (data) => emit('timeupdate', data));
      player.value.on('media:loadstart', (data) => emit('loadstart', data));
      player.value.on('media:loadedmetadata', (data) => emit('loadedmetadata', data));
      player.value.on('media:canplay', (data) => emit('canplay', data));
      player.value.on('media:waiting', (data) => emit('waiting', data));
      player.value.on('media:seeking', (data) => emit('seeking', data));
      player.value.on('media:seeked', (data) => emit('seeked', data));
      player.value.on('error:media', (data) => emit('error', data));
      player.value.on('fullscreen:enter', (data) => emit('fullscreen:enter', data));
      player.value.on('fullscreen:exit', (data) => emit('fullscreen:exit', data));
      player.value.on('media:volumechange', (data) => emit('volume:change', data));
      player.value.on('media:ratechange', (data) => emit('rate:change', data));
    };

    // 监听属性变化
    watch(() => props.src, (newSrc) => {
      if (player.value && newSrc) {
        // 更新视频源
        player.value.element.src = Array.isArray(newSrc) ? newSrc[0] : newSrc;
      }
    });

    watch(() => props.muted, (newMuted) => {
      if (player.value) {
        player.value.muted = newMuted;
      }
    });

    watch(() => props.autoplay, (newAutoplay) => {
      if (player.value) {
        player.value.element.autoplay = newAutoplay;
      }
    });

    // 生命周期
    onMounted(() => {
      createPlayerInstance();
    });

    onUnmounted(() => {
      if (player.value) {
        player.value.destroy();
      }
    });

    // 暴露播放器实例和方法
    expose({
      player: computed(() => player.value),
      play: () => player.value?.play(),
      pause: () => player.value?.pause(),
      seek: (time: number) => player.value?.seek(time),
      setVolume: (volume: number) => {
        if (player.value) player.value.volume = volume;
      },
      setMuted: (muted: boolean) => {
        if (player.value) player.value.muted = muted;
      },
      setPlaybackRate: (rate: number) => {
        if (player.value) player.value.playbackRate = rate;
      },
      enterFullscreen: () => player.value?.enterFullscreen(),
      exitFullscreen: () => player.value?.exitFullscreen(),
      getCurrentTime: () => player.value?.currentTime || 0,
      getDuration: () => player.value?.duration || 0,
      getVolume: () => player.value?.volume || 0,
      isMuted: () => player.value?.muted || false,
      isPaused: () => player.value?.paused || true,
      isEnded: () => player.value?.ended || false
    });

    return () => h('div', {
      ref: containerRef,
      class: 'ldesign-vue-player'
    });
  }
});

/**
 * Vue 组合式 API Hook
 */
export function useVideoPlayer(containerRef: Ref<HTMLElement | undefined>, config: PlayerConfig) {
  const player = ref<Player>();
  const isReady = ref(false);
  const currentTime = ref(0);
  const duration = ref(0);
  const volume = ref(1);
  const muted = ref(false);
  const paused = ref(true);
  const ended = ref(false);
  const buffered = ref(0);

  // 创建播放器
  const createPlayer = async () => {
    if (!containerRef.value) return;

    try {
      player.value = new Player({
        container: containerRef.value,
        ...config
      });

      // 绑定响应式数据
      player.value.on('media:timeupdate', (data) => {
        currentTime.value = data.currentTime;
        duration.value = data.duration;
      });

      player.value.on('media:volumechange', () => {
        volume.value = player.value!.volume;
        muted.value = player.value!.muted;
      });

      player.value.on('media:play', () => {
        paused.value = false;
      });

      player.value.on('media:pause', () => {
        paused.value = true;
      });

      player.value.on('media:ended', () => {
        ended.value = true;
        paused.value = true;
      });

      player.value.on('media:loadedmetadata', (data) => {
        duration.value = data.duration;
      });

      isReady.value = true;

    } catch (error) {
      console.error('Failed to create player:', error);
      throw error;
    }
  };

  // 播放器方法
  const play = () => player.value?.play();
  const pause = () => player.value?.pause();
  const seek = (time: number) => player.value?.seek(time);
  const setVolume = (vol: number) => {
    if (player.value) player.value.volume = vol;
  };
  const setMuted = (mut: boolean) => {
    if (player.value) player.value.muted = mut;
  };
  const setPlaybackRate = (rate: number) => {
    if (player.value) player.value.playbackRate = rate;
  };
  const enterFullscreen = () => player.value?.enterFullscreen();
  const exitFullscreen = () => player.value?.exitFullscreen();

  // 销毁播放器
  const destroy = () => {
    if (player.value) {
      player.value.destroy();
      player.value = undefined;
      isReady.value = false;
    }
  };

  return {
    // 播放器实例
    player: readonly(player),
    
    // 状态
    isReady: readonly(isReady),
    currentTime: readonly(currentTime),
    duration: readonly(duration),
    volume: readonly(volume),
    muted: readonly(muted),
    paused: readonly(paused),
    ended: readonly(ended),
    buffered: readonly(buffered),
    
    // 方法
    createPlayer,
    play,
    pause,
    seek,
    setVolume,
    setMuted,
    setPlaybackRate,
    enterFullscreen,
    exitFullscreen,
    destroy
  };
}

/**
 * Vue 插件安装函数
 */
export function install(app: any) {
  app.component('VideoPlayer', VideoPlayer);
}

export default {
  install,
  VideoPlayer,
  useVideoPlayer
};
