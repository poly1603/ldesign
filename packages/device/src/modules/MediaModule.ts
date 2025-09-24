import type { DeviceModule } from '../types'
import { EventEmitter } from '../core/EventEmitter'
import { safeNavigatorAccess } from '../utils'

/**
 * 媒体设备信息接口
 */
export interface MediaDeviceInfo {
  /** 是否支持媒体设备 API */
  supported: boolean
  /** 是否有摄像头 */
  hasCamera: boolean
  /** 是否有麦克风 */
  hasMicrophone: boolean
  /** 是否有扬声器 */
  hasSpeaker: boolean
  /** 摄像头列表 */
  cameras: MediaDeviceItem[]
  /** 麦克风列表 */
  microphones: MediaDeviceItem[]
  /** 扬声器列表 */
  speakers: MediaDeviceItem[]
  /** 当前摄像头权限状态 */
  cameraPermission: PermissionState | 'unknown'
  /** 当前麦克风权限状态 */
  microphonePermission: PermissionState | 'unknown'
}

/**
 * 媒体设备项
 */
export interface MediaDeviceItem {
  /** 设备ID */
  deviceId: string
  /** 设备标签 */
  label: string
  /** 设备类型 */
  kind: MediaDeviceKind
  /** 分组ID */
  groupId?: string
}

/**
 * 媒体模块事件
 */
export interface MediaModuleEvents {
  deviceChange: MediaDeviceInfo
  permissionChange: {
    type: 'camera' | 'microphone'
    state: PermissionState
  }
}

/**
 * 媒体设备检测模块
 *
 * 提供摄像头、麦克风、扬声器等媒体设备的检测功能
 */
export class MediaModule extends EventEmitter<Record<string, unknown>> implements DeviceModule {
  name = 'media'
  private mediaInfo: MediaDeviceInfo
  private deviceChangeHandler?: () => void
  private permissionCheckers: Map<string, NodeJS.Timeout> = new Map()

  constructor() {
    super()
    this.mediaInfo = this.getDefaultMediaInfo()
  }

  /**
   * 初始化模块
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined')
      return

    try {
      // 检测媒体设备
      await this.detectMediaDevices()

      // 设置设备变化监听
      this.setupDeviceChangeListener()

      // 开始权限状态监控
      this.startPermissionMonitoring()
    }
    catch (error) {
      console.warn('Media devices detection failed:', error)
    }
  }

  /**
   * 销毁模块
   */
  async destroy(): Promise<void> {
    this.removeDeviceChangeListener()
    this.stopPermissionMonitoring()
  }

  /**
   * 获取媒体设备信息
   */
  getData(): MediaDeviceInfo {
    return { ...this.mediaInfo }
  }

  /**
   * 检查是否支持媒体设备 API
   */
  isSupported(): boolean {
    return safeNavigatorAccess(nav =>
      'mediaDevices' in nav && 'enumerateDevices' in nav.mediaDevices, false)
  }

  /**
   * 获取摄像头列表
   */
  getCameras(): MediaDeviceItem[] {
    return [...this.mediaInfo.cameras]
  }

  /**
   * 获取麦克风列表
   */
  getMicrophones(): MediaDeviceItem[] {
    return [...this.mediaInfo.microphones]
  }

  /**
   * 获取扬声器列表
   */
  getSpeakers(): MediaDeviceItem[] {
    return [...this.mediaInfo.speakers]
  }

  /**
   * 检查是否有摄像头
   */
  hasCamera(): boolean {
    return this.mediaInfo.hasCamera
  }

  /**
   * 检查是否有麦克风
   */
  hasMicrophone(): boolean {
    return this.mediaInfo.hasMicrophone
  }

  /**
   * 检查是否有扬声器
   */
  hasSpeaker(): boolean {
    return this.mediaInfo.hasSpeaker
  }

  /**
   * 请求摄像头权限
   */
  async requestCameraPermission(): Promise<boolean> {
    if (!this.isSupported())
      return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // 立即停止流以释放摄像头
      stream.getTracks().forEach(track => track.stop())

      // 更新权限状态
      this.mediaInfo.cameraPermission = 'granted'
      this.emit('permissionChange', { type: 'camera', state: 'granted' })

      // 重新检测设备（权限授予后可能有新设备可见）
      await this.detectMediaDevices()

      return true
    }
    catch {
      this.mediaInfo.cameraPermission = 'denied'
      this.emit('permissionChange', { type: 'camera', state: 'denied' })
      return false
    }
  }

  /**
   * 请求麦克风权限
   */
  async requestMicrophonePermission(): Promise<boolean> {
    if (!this.isSupported())
      return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // 立即停止流以释放麦克风
      stream.getTracks().forEach(track => track.stop())

      // 更新权限状态
      this.mediaInfo.microphonePermission = 'granted'
      this.emit('permissionChange', { type: 'microphone', state: 'granted' })

      // 重新检测设备
      await this.detectMediaDevices()

      return true
    }
    catch {
      this.mediaInfo.microphonePermission = 'denied'
      this.emit('permissionChange', { type: 'microphone', state: 'denied' })
      return false
    }
  }

  /**
   * 获取默认媒体信息
   */
  private getDefaultMediaInfo(): MediaDeviceInfo {
    return {
      supported: false,
      hasCamera: false,
      hasMicrophone: false,
      hasSpeaker: false,
      cameras: [],
      microphones: [],
      speakers: [],
      cameraPermission: 'unknown',
      microphonePermission: 'unknown',
    }
  }

  /**
   * 检测媒体设备
   */
  private async detectMediaDevices(): Promise<void> {
    if (!this.isSupported()) {
      this.mediaInfo.supported = false
      return
    }

    try {
      this.mediaInfo.supported = true

      // 获取设备列表
      const devices = await navigator.mediaDevices.enumerateDevices()

      // 分类设备
      const cameras: MediaDeviceItem[] = []
      const microphones: MediaDeviceItem[] = []
      const speakers: MediaDeviceItem[] = []

      devices.forEach((device, index) => {
        const deviceItem: MediaDeviceItem = {
          deviceId: device.deviceId || `device-${index}`,
          label: device.label || `${device.kind} ${index + 1}`,
          kind: device.kind,
          groupId: device.groupId,
        }

        switch (device.kind) {
          case 'videoinput':
            cameras.push(deviceItem)
            break
          case 'audioinput':
            microphones.push(deviceItem)
            break
          case 'audiooutput':
            speakers.push(deviceItem)
            break
        }
      })

      // 更新媒体信息
      this.mediaInfo = {
        ...this.mediaInfo,
        hasCamera: cameras.length > 0,
        hasMicrophone: microphones.length > 0,
        hasSpeaker: speakers.length > 0,
        cameras,
        microphones,
        speakers,
      }

      // 检查权限状态
      await this.checkPermissions()

      // 触发设备变化事件
      this.emit('deviceChange', this.mediaInfo)
    }
    catch (error) {
      console.warn('Failed to enumerate media devices:', error)
    }
  }

  /**
   * 检查权限状态
   */
  private async checkPermissions(): Promise<void> {
    if (!('permissions' in navigator))
      return

    try {
      // 检查摄像头权限
      const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName })
      this.mediaInfo.cameraPermission = cameraPermission.state

      // 监听权限变化
      cameraPermission.addEventListener('change', () => {
        this.mediaInfo.cameraPermission = cameraPermission.state
        this.emit('permissionChange', { type: 'camera', state: cameraPermission.state })
      })
    }
    catch {
      // 权限 API 可能不支持 camera
    }

    try {
      // 检查麦克风权限
      const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      this.mediaInfo.microphonePermission = microphonePermission.state

      // 监听权限变化
      microphonePermission.addEventListener('change', () => {
        this.mediaInfo.microphonePermission = microphonePermission.state
        this.emit('permissionChange', { type: 'microphone', state: microphonePermission.state })
      })
    }
    catch {
      // 权限 API 可能不支持 microphone
    }
  }

  /**
   * 设置设备变化监听器
   */
  private setupDeviceChangeListener(): void {
    if (!this.isSupported())
      return

    this.deviceChangeHandler = async () => {
      await this.detectMediaDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', this.deviceChangeHandler)
  }

  /**
   * 移除设备变化监听器
   */
  private removeDeviceChangeListener(): void {
    if (!this.isSupported() || !this.deviceChangeHandler)
      return

    navigator.mediaDevices.removeEventListener('devicechange', this.deviceChangeHandler)
    this.deviceChangeHandler = undefined
  }

  /**
   * 开始权限状态监控
   */
  private startPermissionMonitoring(): void {
    // 定期检查权限状态（某些浏览器不支持权限变化事件）
    const checker = setInterval(async () => {
      await this.checkPermissions()
    }, 5000) // 每5秒检查一次

    this.permissionCheckers.set('main', checker)
  }

  /**
   * 停止权限状态监控
   */
  private stopPermissionMonitoring(): void {
    this.permissionCheckers.forEach(checker => clearInterval(checker))
    this.permissionCheckers.clear()
  }

  /**
   * 测试摄像头
   */
  async testCamera(constraints?: MediaTrackConstraints): Promise<boolean> {
    if (!this.isSupported())
      return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: constraints || true,
      })

      // 检查是否成功获取视频轨道
      const videoTracks = stream.getVideoTracks()
      const success = videoTracks.length > 0

      // 停止所有轨道
      stream.getTracks().forEach(track => track.stop())

      return success
    }
    catch (error) {
      console.warn('Camera test failed:', error)
      return false
    }
  }

  /**
   * 测试麦克风
   */
  async testMicrophone(constraints?: MediaTrackConstraints): Promise<boolean> {
    if (!this.isSupported())
      return false

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: constraints || true,
      })

      // 检查是否成功获取音频轨道
      const audioTracks = stream.getAudioTracks()
      const success = audioTracks.length > 0

      // 停止所有轨道
      stream.getTracks().forEach(track => track.stop())

      return success
    }
    catch (error) {
      console.warn('Microphone test failed:', error)
      return false
    }
  }

  /**
   * 获取媒体流
   */
  async getMediaStream(constraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    if (!this.isSupported())
      return null

    try {
      return await navigator.mediaDevices.getUserMedia(constraints || {
        video: true,
        audio: true,
      })
    }
    catch (error) {
      console.warn('Failed to get media stream:', error)
      return null
    }
  }

  /**
   * 获取屏幕共享流
   */
  async getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    if (!this.isSupported())
      return null

    // 检查是否支持屏幕共享
    if (!('getDisplayMedia' in navigator.mediaDevices)) {
      console.warn('Screen capture is not supported')
      return null
    }

    try {
      return await navigator.mediaDevices.getDisplayMedia(constraints || {
        video: true,
        audio: false,
      })
    }
    catch (error) {
      console.warn('Failed to get display media:', error)
      return null
    }
  }
}
