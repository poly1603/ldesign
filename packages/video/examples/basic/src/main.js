/**
 * LDesign Video Player 完整功能演示
 * 展示播放器的所有功能和使用方法，包括专业的控制栏系统
 * 注意：这里只有配置代码，没有功能实现代码
 */

import { Player } from '../../../src/core/Player.ts';
import { ControlBar, ControlPosition } from '../../../src/plugins/ControlBar.ts';
import { SimplePlayButton } from '../../../src/plugins/SimplePlayButton.ts';
import { SimpleProgressBar } from '../../../src/plugins/SimpleProgressBar.ts';
import { SimpleTimeDisplay, TimeFormat } from '../../../src/plugins/SimpleTimeDisplay.ts';
import { SimpleVolumeControl } from '../../../src/plugins/SimpleVolumeControl.ts';
import { SimplePlaybackRate } from '../../../src/plugins/SimplePlaybackRate.ts';
import { SimpleFullscreenButton } from '../../../src/plugins/SimpleFullscreenButton.ts';

// ==================== 高级功能插件 ====================
class ThemeManager {
  constructor(player) {
    this.player = player;
    this.currentTheme = 'dark';
    this.themes = {
      dark: {
        name: '暗黑主题',
        colors: {
          primary: '#722ED1',
          background: 'rgba(0, 0, 0, 0.8)',
          text: '#ffffff',
          accent: '#9254DE'
        }
      },
      light: {
        name: '明亮主题',
        colors: {
          primary: '#1890ff',
          background: 'rgba(255, 255, 255, 0.9)',
          text: '#333333',
          accent: '#40a9ff'
        }
      },
      purple: {
        name: '紫色主题',
        colors: {
          primary: '#722ED1',
          background: 'rgba(114, 46, 209, 0.1)',
          text: '#722ED1',
          accent: '#9254DE'
        }
      }
    };
  }

  switchTheme(themeName) {
    if (this.themes[themeName]) {
      this.currentTheme = themeName;
      this.applyTheme(this.themes[themeName]);
      console.log(`切换到${this.themes[themeName].name}`);
    }
  }

  applyTheme(theme) {
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--theme-${key}`, value);
    });
  }
}

class DanmakuPlugin {
  constructor(player) {
    this.player = player;
    this.danmakus = [];
    this.container = null;
    this.enabled = true;
  }

  init() {
    this.createContainer();
    this.setupEvents();
    // 添加一些示例弹幕
    setTimeout(() => this.addDanmaku('欢迎使用 LDesign Video Player！', 'right'), 2000);
    setTimeout(() => this.addDanmaku('支持弹幕功能啦 🎉', 'top'), 4000);
    setTimeout(() => this.addDanmaku('这个播放器真不错！', 'right'), 6000);
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.className = 'danmaku-container';
    this.container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 50;
      overflow: hidden;
    `;
    this.player.element.parentElement.appendChild(this.container);
  }

  addDanmaku(text, type = 'right') {
    if (!this.enabled) return;

    const danmaku = document.createElement('div');
    danmaku.className = 'danmaku-item';
    danmaku.textContent = text;

    const baseStyle = `
      position: absolute;
      color: white;
      font-size: 16px;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      white-space: nowrap;
      pointer-events: none;
    `;

    if (type === 'right') {
      danmaku.style.cssText = baseStyle + `
        right: -100%;
        top: ${Math.random() * 60 + 10}%;
        animation: danmaku-right 8s linear;
      `;
    } else if (type === 'top') {
      danmaku.style.cssText = baseStyle + `
        left: 50%;
        top: ${Math.random() * 30 + 10}%;
        transform: translateX(-50%);
        animation: danmaku-fade 3s ease-in-out;
      `;
    }

    this.container.appendChild(danmaku);

    // 清理动画结束的弹幕
    setTimeout(() => {
      if (danmaku.parentNode) {
        danmaku.parentNode.removeChild(danmaku);
      }
    }, 8000);
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.container.innerHTML = '';
    }
    console.log(`弹幕${this.enabled ? '开启' : '关闭'}`);
  }

  setupEvents() {
    // 定期添加随机弹幕
    setInterval(() => {
      if (this.enabled && !this.player.element.paused) {
        const messages = [
          '这个视频不错！',
          '画质很清晰',
          '音质也很好',
          '支持一下！',
          '前排围观',
          '弹幕测试',
          'LDesign 牛逼！'
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        this.addDanmaku(randomMessage, Math.random() > 0.7 ? 'top' : 'right');
      }
    }, 3000);
  }
}

class ScreenshotPlugin {
  constructor(player) {
    this.player = player;
  }

  takeScreenshot() {
    const video = this.player.element;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 转换为图片并下载
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `screenshot-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      console.log('截图已保存');
    });
  }
}

class PictureInPicturePlugin {
  constructor(player) {
    this.player = player;
    this.isInPiP = false;
  }

  async toggle() {
    const video = this.player.element;

    if (!document.pictureInPictureEnabled) {
      console.log('浏览器不支持画中画功能');
      return;
    }

    try {
      if (this.isInPiP) {
        await document.exitPictureInPicture();
        this.isInPiP = false;
        console.log('退出画中画模式');
      } else {
        await video.requestPictureInPicture();
        this.isInPiP = true;
        console.log('进入画中画模式');
      }
    } catch (error) {
      console.error('画中画操作失败:', error);
    }
  }
}

// ==================== 播放器基础配置 ====================
const playerConfig = {
  // 容器配置
  container: '#player',

  // 视频源配置
  src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  poster: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',

  // 基础配置
  width: '100%',
  height: '100%',
  autoplay: false,
  muted: false,
  loop: false,
  preload: 'metadata',

  // 禁用默认控制栏，使用自定义控制栏
  controls: false,

  // 跨域配置
  crossorigin: 'anonymous',

  // 移动端配置
  playsinline: true
};

// ==================== 插件配置（演示用） ====================
// 注意：这些配置仅用于演示，实际插件功能需要完整的插件系统支持
const pluginConfig = {
  keyboardShortcuts: {
    enableDefaultShortcuts: true,
    showHelp: true
  },
  gestureControl: {
    enableDefaultGestures: true,
    showFeedback: true
  },
  miniPlayer: {
    mode: 'floating',
    autoEnter: false
  }
};

// ==================== 全局变量 ====================
let player = null;
let controlBar = null;
let themeManager = null;
let danmakuPlugin = null;
let screenshotPlugin = null;
let pipPlugin = null;

// ==================== 播放器初始化 ====================
async function initPlayer() {
  try {
    // 创建播放器实例
    player = new Player(playerConfig);

    // 创建控制栏
    await setupControlBar();

    // 绑定事件监听器
    bindEvents();

    // 初始化高级功能
    await setupAdvancedFeatures();

    console.log('播放器初始化成功');

  } catch (error) {
    console.error('播放器初始化失败:', error);
    logEvent('player:error', { error: error.message });
  }
}

// ==================== 控制栏设置 ====================
async function setupControlBar() {
  if (!player) return;

  try {
    // 创建控制栏
    controlBar = new ControlBar(player, {
      autoHide: true,
      autoHideDelay: 3000,
      showOnPause: true,
      showOnLoading: false,
      height: 48,
      gradient: true
    });

    // 初始化控制栏
    await controlBar.init();
    await controlBar.mount(player.container);

    // 创建播放按钮
    const playButton = new SimplePlayButton(player, {
      showLabel: false
    });
    await playButton.init();
    controlBar.registerPlugin(playButton, ControlPosition.LEFT);

    // 创建时间显示
    const timeDisplay = new SimpleTimeDisplay(player, {
      format: TimeFormat.BOTH,
      clickToToggle: true,
      showMilliseconds: false
    });
    await timeDisplay.init();
    controlBar.registerPlugin(timeDisplay, ControlPosition.LEFT);

    // 创建进度条
    const progressBar = new SimpleProgressBar(player, {
      showBuffer: true,
      showTooltip: true,
      seekOnClick: true,
      seekOnDrag: true
    });
    await progressBar.init();
    controlBar.registerPlugin(progressBar, ControlPosition.CENTER);

    // 创建音量控制
    const volumeControl = new SimpleVolumeControl(player, {
      showSlider: true,
      orientation: 'horizontal',
      showValue: false
    });
    await volumeControl.init();
    controlBar.registerPlugin(volumeControl, ControlPosition.RIGHT);

    // 创建播放速度控制
    const playbackRate = new SimplePlaybackRate(player, {
      rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      defaultRate: 1,
      showLabel: true
    });
    await playbackRate.init();
    controlBar.registerPlugin(playbackRate, ControlPosition.RIGHT);

    // 创建全屏按钮
    const fullscreenButton = new SimpleFullscreenButton(player, {
      showLabel: false
    });
    await fullscreenButton.init();
    controlBar.registerPlugin(fullscreenButton, ControlPosition.RIGHT);

    // 手动绑定播放按钮事件（临时修复）
    setTimeout(() => {
      const playButtonElement = document.querySelector('.ldesign-play-button');
      const videoElement = player.element;

      if (playButtonElement && videoElement) {
        playButtonElement.addEventListener('click', async () => {
          try {
            if (videoElement.paused) {
              await videoElement.play();
            } else {
              videoElement.pause();
            }
          } catch (error) {
            console.error('播放/暂停失败:', error);
          }
        });
        console.log('播放按钮事件绑定成功');
      }
    }, 100);

    console.log('控制栏设置完成');

  } catch (error) {
    console.error('控制栏设置失败:', error);
  }
}

// ==================== 高级功能设置 ====================
async function setupAdvancedFeatures() {
  if (!player) return;

  try {
    // 初始化主题管理器
    themeManager = new ThemeManager(player);
    themeManager.applyTheme(themeManager.themes[themeManager.currentTheme]);

    // 初始化弹幕插件
    danmakuPlugin = new DanmakuPlugin(player);
    danmakuPlugin.init();

    // 初始化截图插件
    screenshotPlugin = new ScreenshotPlugin(player);

    // 初始化画中画插件
    pipPlugin = new PictureInPicturePlugin(player);

    // 添加键盘快捷键
    setupKeyboardShortcuts();

    console.log('高级功能初始化完成');
  } catch (error) {
    console.error('高级功能初始化失败:', error);
  }
}

// 键盘快捷键设置
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // 忽略在输入框中的按键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key.toLowerCase()) {
      case ' ': // 空格键 - 播放/暂停
        e.preventDefault();
        if (player.element.paused) {
          player.element.play();
        } else {
          player.element.pause();
        }
        break;

      case 'm': // M键 - 静音/取消静音
        e.preventDefault();
        player.element.muted = !player.element.muted;
        break;

      case 'f': // F键 - 全屏
        e.preventDefault();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          player.element.parentElement.requestFullscreen();
        }
        break;

      case 's': // S键 - 截图
        e.preventDefault();
        screenshotPlugin.takeScreenshot();
        break;

      case 'p': // P键 - 画中画
        e.preventDefault();
        pipPlugin.toggle();
        break;

      case 'd': // D键 - 弹幕开关
        e.preventDefault();
        danmakuPlugin.toggle();
        break;

      case '1': // 数字键 - 主题切换
        e.preventDefault();
        themeManager.switchTheme('dark');
        break;

      case '2':
        e.preventDefault();
        themeManager.switchTheme('light');
        break;

      case '3':
        e.preventDefault();
        themeManager.switchTheme('purple');
        break;

      case 'arrowleft': // 左箭头 - 后退10秒
        e.preventDefault();
        player.element.currentTime = Math.max(0, player.element.currentTime - 10);
        break;

      case 'arrowright': // 右箭头 - 前进10秒
        e.preventDefault();
        player.element.currentTime = Math.min(player.element.duration, player.element.currentTime + 10);
        break;

      case 'arrowup': // 上箭头 - 音量+
        e.preventDefault();
        player.element.volume = Math.min(1, player.element.volume + 0.1);
        break;

      case 'arrowdown': // 下箭头 - 音量-
        e.preventDefault();
        player.element.volume = Math.max(0, player.element.volume - 0.1);
        break;
    }
  });
}

// ==================== 事件监听 ====================
function bindEvents() {
  if (!player) return;

  // 播放器基础事件
  // 基础事件监听（用于验证功能）
  player.on('media:play', () => {
    console.log('视频开始播放');
  });

  player.on('media:pause', () => {
    console.log('视频暂停');
  });

  player.on('media:loadedmetadata', (data) => {
    console.log('视频元数据加载完成:', data);
  });
}

// ==================== 弹幕发送测试功能 ====================
function setupDanmakuTestModule() {
  const danmakuInput = document.getElementById('danmaku-input');
  const danmakuType = document.getElementById('danmaku-type');
  const sendButton = document.getElementById('send-danmaku');
  const toggleButton = document.getElementById('toggle-danmaku');
  const presetButtons = document.querySelectorAll('.preset-danmaku');

  if (!danmakuInput || !danmakuType || !sendButton || !toggleButton) {
    console.error('弹幕测试模块元素未找到');
    return;
  }

  // 发送弹幕功能
  function sendDanmaku(text, type = 'right') {
    if (!text.trim()) {
      alert('请输入弹幕内容');
      return;
    }

    if (danmakuPlugin) {
      danmakuPlugin.addDanmaku(text.trim(), type);
      console.log(`发送弹幕: ${text} (${type})`);
    } else {
      console.error('弹幕插件未初始化');
    }
  }

  // 发送按钮点击事件
  sendButton.addEventListener('click', () => {
    const text = danmakuInput.value;
    const type = danmakuType.value;
    sendDanmaku(text, type);
    danmakuInput.value = ''; // 清空输入框
  });

  // 输入框回车发送
  danmakuInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = danmakuInput.value;
      const type = danmakuType.value;
      sendDanmaku(text, type);
      danmakuInput.value = '';
    }
  });

  // 弹幕开关按钮
  toggleButton.addEventListener('click', () => {
    if (danmakuPlugin) {
      danmakuPlugin.toggle();
      toggleButton.classList.toggle('active');
      toggleButton.textContent = danmakuPlugin.enabled ? '关闭弹幕' : '开启弹幕';
    }
  });

  // 预设弹幕按钮
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const text = button.getAttribute('data-text');
      const type = button.getAttribute('data-type') || 'right';
      sendDanmaku(text, type);
    });
  });

  // 初始化开关按钮状态
  if (danmakuPlugin) {
    toggleButton.classList.toggle('active', danmakuPlugin.enabled);
    toggleButton.textContent = danmakuPlugin.enabled ? '关闭弹幕' : '开启弹幕';
  }

  console.log('弹幕测试模块初始化完成');
}

// ==================== 页面加载完成后初始化 ====================
document.addEventListener('DOMContentLoaded', async () => {
  await initPlayer();

  // 等待播放器初始化完成后再设置弹幕测试模块
  setTimeout(() => {
    setupDanmakuTestModule();
  }, 500);
});
