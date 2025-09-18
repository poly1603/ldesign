import './style.css'
import { LVideoPlayer } from '@ldesign/video'
// import '@ldesign/video/style.css'

// 公开视频源配置
const videoSources = [
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Big Buck Bunny - 基础播放器演示',
    quality: '720p',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
  },
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    title: 'Elephants Dream - 响应式播放器演示',
    quality: '1080p',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg'
  },
  {
    src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    title: 'For Bigger Blazes - 主题播放器演示',
    quality: '720p',
    poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg'
  }
]

// 基础播放器示例
function createBasicPlayer() {
  const container = document.querySelector('#player-container')
  
  const player = new LVideoPlayer({
    container: container,
    src: videoSources[0].src,
    poster: videoSources[0].poster,
    width: '100%',
    height: '400px',
    controls: {
      enabled: true,
      autoHide: true,
      autoHideDelay: 3000
    },
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    theme: 'default'
  })

  // 监听播放器事件
  player.on('ready', () => {
    console.log('基础播放器已准备就绪')
    console.log('视频信息:', {
      src: videoSources[0].src,
      title: videoSources[0].title,
      quality: videoSources[0].quality
    })
  })

  player.on('play', () => {
    console.log('开始播放')
  })

  player.on('pause', () => {
    console.log('暂停播放')
  })

  return player
}

// 响应式播放器示例
function createResponsivePlayer() {
  const container = document.querySelector('#responsive-player-container')
  
  const player = new LVideoPlayer({
    container: container,
    src: videoSources[1].src,
    poster: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWTjeW6lOW8j+aSreaUvuWZqDwvdGV4dD48L3N2Zz4=',
    width: '100%',
    height: 'auto',
    aspectRatio: '16:9',
    controls: true,
    responsive: true,
    fluid: true,
    autoplay: false,
    muted: false // 改为不静音，让用户可以听到声音
  })

  // 监听响应式事件
  player.on('resize', (data) => {
    console.log('播放器尺寸变化:', data)
  })

  player.on('orientationchange', (data) => {
    console.log('屏幕方向变化:', data)
  })

  player.on('ready', () => {
    console.log('响应式播放器已准备就绪')
    console.log('视频信息:', {
      src: videoSources[1].src,
      title: videoSources[1].title,
      quality: videoSources[1].quality
    })
  })

  return player
}

// 自定义主题播放器示例
function createThemedPlayer() {
  const container = document.querySelector('#themed-player-container')
  
  const player = new LVideoPlayer({
    container: container,
    src: videoSources[2].src,
    poster: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuaaguiJsuS4u+mimOaSreaUvuWZqDwvdGV4dD48L3N2Zz4=',
    width: '100%',
    height: '350px',
    controls: true,
    theme: 'dark',
    hotkeys: true,
    contextMenu: true,
    autoplay: false,
    muted: false
  })

  // 监听主题播放器事件
  player.on('themechange', (theme) => {
    console.log('主题变化:', theme)
  })

  player.on('hotkey', (key) => {
    console.log('快捷键触发:', key)
  })

  // 自定义控制按钮
  player.on('ready', () => {
    console.log('主题播放器已准备就绪')
    console.log('视频信息:', {
      src: videoSources[2].src,
      title: videoSources[2].title,
      quality: videoSources[2].quality
    })
    
    // 添加自定义按钮示例
    const customButton = document.createElement('button')
    customButton.textContent = '自定义'
    customButton.className = 'lv-control-button'
    customButton.onclick = () => {
      alert('自定义按钮被点击！')
    }
    
    // 可以通过播放器API添加自定义控件
    // player.addControl(customButton)
  })

  return player
}

// 初始化所有播放器
document.addEventListener('DOMContentLoaded', () => {
  try {
    const basicPlayer = createBasicPlayer()
    const responsivePlayer = createResponsivePlayer()
    const themedPlayer = createThemedPlayer()

    // 全局播放器实例，便于调试
    window.players = {
      basic: basicPlayer,
      responsive: responsivePlayer,
      themed: themedPlayer
    }

    console.log('所有播放器初始化完成')
  } catch (error) {
    console.error('播放器初始化失败:', error)
  }
})
