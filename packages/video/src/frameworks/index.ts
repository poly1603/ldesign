/**
 * 跨框架支持入口文件
 * 导出所有框架集成
 */

// Vue 3 支持
export * from './vue'

// React 支持
export * from './react'

// Angular 支持
export * from './angular'

/**
 * 框架检测工具
 */
export class FrameworkDetector {
  /**
   * 检测当前运行环境中的框架
   */
  static detect(): string[] {
    const frameworks: string[] = []

    // 检测 Vue
    if (typeof window !== 'undefined') {
      if ((window as any).Vue || (window as any).__VUE__) {
        frameworks.push('vue')
      }
    }

    // 检测 React
    if (typeof window !== 'undefined') {
      if ((window as any).React || (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        frameworks.push('react')
      }
    }

    // 检测 Angular
    if (typeof window !== 'undefined') {
      if ((window as any).ng || (window as any).getAllAngularRootElements) {
        frameworks.push('angular')
      }
    }

    return frameworks
  }

  /**
   * 检测是否为 Vue 环境
   */
  static isVue(): boolean {
    return this.detect().includes('vue')
  }

  /**
   * 检测是否为 React 环境
   */
  static isReact(): boolean {
    return this.detect().includes('react')
  }

  /**
   * 检测是否为 Angular 环境
   */
  static isAngular(): boolean {
    return this.detect().includes('angular')
  }
}

/**
 * 自动框架适配器
 * 根据当前环境自动选择合适的框架集成
 */
export class AutoFrameworkAdapter {
  /**
   * 自动创建适合当前框架的播放器组件
   */
  static createComponent(options: any = {}) {
    const frameworks = FrameworkDetector.detect()

    if (frameworks.includes('vue')) {
      // 动态导入 Vue 组件
      return import('./vue').then(module => module.VideoPlayerComponent)
    }

    if (frameworks.includes('react')) {
      // 动态导入 React 组件
      return import('./react').then(module => module.default)
    }

    if (frameworks.includes('angular')) {
      // 动态导入 Angular 组件
      return import('./angular').then(module => module.VideoPlayerComponent)
    }

    // 如果没有检测到框架，返回原生实现
    return import('../core/player').then(module => module.VideoPlayer)
  }

  /**
   * 获取框架特定的使用指南
   */
  static getUsageGuide(): string {
    const frameworks = FrameworkDetector.detect()

    if (frameworks.includes('vue')) {
      return `
Vue 3 使用方式:

1. 组合式 API:
import { useVideoPlayer } from '@ldesign/video/vue'

const { containerRef, play, pause } = useVideoPlayer({
  src: 'video.mp4'
})

2. 组件方式:
<template>
  <VideoPlayer 
    src="video.mp4" 
    @ready="onReady"
    @play="onPlay"
  />
</template>

<script setup>
import { VideoPlayerComponent as VideoPlayer } from '@ldesign/video/vue'
</script>
      `
    }

    if (frameworks.includes('react')) {
      return `
React 使用方式:

1. Hook 方式:
import { useVideoPlayer } from '@ldesign/video/react'

const { containerRef, play, pause } = useVideoPlayer({
  src: 'video.mp4'
})

2. 组件方式:
import VideoPlayer from '@ldesign/video/react'

<VideoPlayer 
  src="video.mp4"
  onReady={() => console.log('ready')}
  onPlay={() => console.log('play')}
/>
      `
    }

    if (frameworks.includes('angular')) {
      return `
Angular 使用方式:

1. 模块导入:
import { VideoPlayerModule } from '@ldesign/video/angular'

@NgModule({
  imports: [VideoPlayerModule]
})

2. 组件使用:
<lv-video-player 
  src="video.mp4"
  (ready)="onReady()"
  (play)="onPlay()"
></lv-video-player>
      `
    }

    return `
原生 JavaScript 使用方式:

import { VideoPlayer } from '@ldesign/video'

const player = new VideoPlayer({
  container: document.getElementById('player'),
  src: 'video.mp4'
})

await player.initialize()
    `
  }
}

/**
 * 默认导出
 */
export default {
  FrameworkDetector,
  AutoFrameworkAdapter
}
