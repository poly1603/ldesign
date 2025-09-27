/**
 * @file 真实库演示主文件
 * @description 使用 src 中的真实 Cropper 类
 */

// 导入真实的裁剪器库
import { Cropper } from '@cropper/core'
import { CropShape, ImageFormat, AspectRatio, CropperEventType } from '@cropper/types'
import '@cropper/styles/cropper.css'

/**
 * 真实库演示应用
 */
class RealCropperDemo {
    constructor() {
        this.cropper = null
        this.currentImageInfo = null
        this.eventListenerCount = 0
        this.init()
    }

    /**
     * 初始化应用
     */
    init() {
        this.updateStatus('info', '📋 正在初始化裁剪器...')
        this.initCropper()
        this.bindEvents()
        this.updateTechInfo()
    }

    /**
     * 初始化裁剪器
     */
    initCropper() {
        try {
            this.cropper = new Cropper({
                container: '#cropperContainer',
                shape: CropShape.RECTANGLE,
                aspectRatio: AspectRatio.FREE,
                movable: true,
                resizable: true,
                zoomable: true,
                rotatable: true,
                guides: true,
                centerLines: false,
                responsive: true,
                touchEnabled: true,
                autoCrop: true,
                backgroundColor: '#000000',
                maskOpacity: 0.6
            })

            this.bindCropperEvents()
            this.updateStatus('success', '✅ 裁剪器初始化成功，请选择图片')
        } catch (error) {
            console.error('裁剪器初始化失败:', error)
            this.updateStatus('error', `❌ 裁剪器初始化失败: ${error.message}`)
        }
    }

    /**
     * 绑定裁剪器事件
     */
    bindCropperEvents() {
        // 裁剪器准备就绪
        this.cropper.on(CropperEventType.READY, () => {
            this.updateStatus('success', '✅ 裁剪器准备就绪')
            this.enableControls()
            this.eventListenerCount++
            this.updateTechInfo()
        })

        // 图片加载成功
        this.cropper.on(CropperEventType.IMAGE_LOADED, (event) => {
            this.currentImageInfo = event.imageInfo
            this.updateImageInfo()
            this.updateStatus('success', '✅ 图片加载成功，可以开始裁剪')
            this.eventListenerCount++
            this.updateTechInfo()
        })

        // 图片加载失败
        this.cropper.on(CropperEventType.IMAGE_ERROR, (event) => {
            this.updateStatus('error', `❌ 图片加载失败: ${event.error.message}`)
        })

        // 裁剪区域变化
        this.cropper.on(CropperEventType.CROP_CHANGE, (event) => {
            this.updateCropInfo(event.cropData)
            this.updatePreviews()
        })

        // 缩放变化
        this.cropper.on(CropperEventType.ZOOM_CHANGE, (event) => {
            this.updateZoomInfo(event.scale)
        })

        // 旋转变化
        this.cropper.on(CropperEventType.ROTATION_CHANGE, (event) => {
            this.updateRotationInfo(event.rotation)
        })

        // 翻转变化
        this.cropper.on(CropperEventType.FLIP_CHANGE, (event) => {
            this.updateFlipInfo(event.flipX, event.flipY)
        })

        // 重置事件
        this.cropper.on(CropperEventType.RESET, () => {
            this.updateStatus('info', '🔄 已重置所有变换')
            this.updateZoomInfo(1)
            this.updateRotationInfo(0)
            this.updateFlipInfo(false, false)
        })
    }

    /**
     * 绑定 UI 事件
     */
    bindEvents() {
        // 文件上传
        document.getElementById('imageInput').addEventListener('change', (e) => {
            this.handleImageUpload(e)
        })

        // 示例图片
        document.getElementById('loadSample').addEventListener('click', () => {
            this.loadSampleImage()
        })

        // 裁剪形状选择
        document.getElementById('shapeSelect').addEventListener('change', (e) => {
            const shape = e.target.value
            // 注意：这里需要实际的 API 来改变形状
            this.updateStatus('info', `🔄 切换到${e.target.options[e.target.selectedIndex].text}`)
        })

        // 宽高比选择
        document.getElementById('aspectRatioSelect').addEventListener('change', (e) => {
            const ratio = parseFloat(e.target.value)
            // 注意：这里需要实际的 API 来改变宽高比
            this.updateStatus('info', `🔄 设置宽高比: ${e.target.options[e.target.selectedIndex].text}`)
        })

        // 变换操作
        document.getElementById('rotateLeftBtn').addEventListener('click', () => {
            this.cropper.rotateLeft()
            this.updateStatus('info', '🔄 向左旋转 90°')
        })

        document.getElementById('rotateRightBtn').addEventListener('click', () => {
            this.cropper.rotateRight()
            this.updateStatus('info', '🔄 向右旋转 90°')
        })

        document.getElementById('flipHBtn').addEventListener('click', () => {
            this.cropper.flipHorizontal()
            this.updateStatus('info', '🔄 水平翻转')
        })

        document.getElementById('flipVBtn').addEventListener('click', () => {
            this.cropper.flipVertical()
            this.updateStatus('info', '🔄 垂直翻转')
        })

        // 缩放控制
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.cropper.zoomIn()
        })

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.cropper.zoomOut()
        })

        document.getElementById('zoomSlider').addEventListener('input', (e) => {
            const scale = parseFloat(e.target.value) / 100
            this.cropper.zoom(scale)
        })

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.cropper.reset()
        })

        // 导出质量滑块
        document.getElementById('exportQuality').addEventListener('input', (e) => {
            const quality = Math.round(parseFloat(e.target.value) * 100)
            document.getElementById('qualityValue').textContent = `${quality}%`
        })

        // 预览和下载
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.showPreview()
        })

        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadImage()
        })

        // 模态框事件
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hidePreview()
        })

        document.getElementById('downloadFromModal').addEventListener('click', () => {
            this.downloadImage()
            this.hidePreview()
        })

        document.getElementById('previewModal').addEventListener('click', (e) => {
            if (e.target.id === 'previewModal') {
                this.hidePreview()
            }
        })

        // 拖拽上传
        this.setupDragAndDrop()
    }

    /**
     * 设置拖拽上传
     */
    setupDragAndDrop() {
        const uploadLabel = document.querySelector('.upload-label')
        
        uploadLabel.addEventListener('dragover', (e) => {
            e.preventDefault()
            uploadLabel.style.borderColor = 'var(--primary-color)'
            uploadLabel.style.background = 'rgba(0, 123, 255, 0.1)'
        })

        uploadLabel.addEventListener('dragleave', (e) => {
            e.preventDefault()
            uploadLabel.style.borderColor = 'var(--border-color)'
            uploadLabel.style.background = 'var(--light-color)'
        })

        uploadLabel.addEventListener('drop', (e) => {
            e.preventDefault()
            uploadLabel.style.borderColor = 'var(--border-color)'
            uploadLabel.style.background = 'var(--light-color)'
            
            const files = e.dataTransfer.files
            if (files.length > 0) {
                this.handleImageFile(files[0])
            }
        })
    }

    /**
     * 处理图片上传
     */
    async handleImageUpload(event) {
        const file = event.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            this.updateStatus('error', '❌ 请选择有效的图片文件')
            return
        }

        await this.handleImageFile(file)
    }

    /**
     * 处理图片文件
     */
    async handleImageFile(file) {
        try {
            this.updateStatus('info', '📤 正在加载图片...')
            await this.cropper.setImage(file)
            
            // 更新文件信息
            this.updateFileInfo(file)
        } catch (error) {
            console.error('图片加载失败:', error)
            this.updateStatus('error', `❌ 图片加载失败: ${error.message}`)
        }
    }

    /**
     * 加载示例图片
     */
    loadSampleImage() {
        // 创建示例图片
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = 500
        canvas.height = 400
        
        // 绘制渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 500, 400)
        gradient.addColorStop(0, '#667eea')
        gradient.addColorStop(1, '#764ba2')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 500, 400)
        
        // 绘制文字
        ctx.fillStyle = 'white'
        ctx.font = 'bold 36px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('示例图片', 250, 180)
        ctx.font = '20px Arial'
        ctx.fillText('500 x 400', 250, 220)
        ctx.font = '16px Arial'
        ctx.fillText('@ldesign/cropper', 250, 250)
        
        // 转换为 blob 并加载
        canvas.toBlob(async (blob) => {
            try {
                this.updateStatus('info', '📤 正在加载示例图片...')
                await this.cropper.setImage(blob)
                
                // 模拟文件信息
                this.updateFileInfo({
                    name: '示例图片.png',
                    size: blob.size,
                    type: 'image/png'
                })
            } catch (error) {
                console.error('示例图片加载失败:', error)
                this.updateStatus('error', `❌ 示例图片加载失败: ${error.message}`)
            }
        })
    }

    /**
     * 启用控制按钮
     */
    enableControls() {
        const buttons = document.querySelectorAll('.control-btn, .zoom-btn')
        buttons.forEach(btn => {
            btn.disabled = false
        })
        
        document.getElementById('zoomSlider').disabled = false
    }

    /**
     * 更新状态提示
     */
    updateStatus(type, message) {
        const statusEl = document.getElementById('status')
        statusEl.className = `status ${type}`
        statusEl.textContent = message
        
        // 自动隐藏成功消息
        if (type === 'success') {
            setTimeout(() => {
                if (statusEl.textContent === message) {
                    statusEl.className = 'status info'
                    statusEl.textContent = '✨ 准备就绪，可以进行裁剪操作'
                }
            }, 3000)
        }
    }

    /**
     * 更新图片信息
     */
    updateImageInfo() {
        if (!this.currentImageInfo) return
        
        const { naturalWidth, naturalHeight } = this.currentImageInfo
        document.getElementById('originalSize').textContent = `${naturalWidth} x ${naturalHeight}`
        
        // 更新裁剪信息
        const cropData = this.cropper.getCropData()
        if (cropData) {
            this.updateCropInfo(cropData)
        }
    }

    /**
     * 更新文件信息
     */
    updateFileInfo(file) {
        document.getElementById('originalFormat').textContent = file.type || 'unknown'
    }

    /**
     * 更新裁剪信息
     */
    updateCropInfo(cropData) {
        document.getElementById('cropPosition').textContent = `${Math.round(cropData.x)}, ${Math.round(cropData.y)}`
        document.getElementById('cropSize').textContent = `${Math.round(cropData.width)} x ${Math.round(cropData.height)}`
    }

    /**
     * 更新缩放信息
     */
    updateZoomInfo(scale) {
        const percentage = Math.round(scale * 100)
        document.getElementById('zoomValue').textContent = `${percentage}%`
        document.getElementById('zoomSlider').value = percentage
        document.getElementById('scaleInfo').textContent = `${percentage}%`
    }

    /**
     * 更新旋转信息
     */
    updateRotationInfo(rotation) {
        document.getElementById('rotationInfo').textContent = `${rotation}°`
    }

    /**
     * 更新翻转信息
     */
    updateFlipInfo(flipX, flipY) {
        // 这里可以添加翻转状态显示
        console.log('翻转状态:', { flipX, flipY })
    }

    /**
     * 更新预览
     */
    updatePreviews() {
        const previews = [
            { id: 'smallPreview', size: 100 },
            { id: 'mediumPreview', size: 150 },
            { id: 'largePreview', size: 200 }
        ]
        
        previews.forEach(({ id, size }) => {
            const container = document.getElementById(id)
            try {
                const canvas = this.cropper.getCroppedCanvas({ 
                    size: { width: size, height: size } 
                })
                
                if (canvas) {
                    container.innerHTML = ''
                    container.appendChild(canvas)
                }
            } catch (error) {
                console.error(`更新预览失败 (${id}):`, error)
            }
        })
    }

    /**
     * 显示预览模态框
     */
    showPreview() {
        try {
            const format = document.getElementById('exportFormat').value
            const quality = parseFloat(document.getElementById('exportQuality').value)
            
            const options = {
                format: `image/${format}`,
                quality: quality
            }
            
            const canvas = this.cropper.getCroppedCanvas(options)
            if (canvas) {
                const previewCanvas = document.getElementById('previewCanvas')
                previewCanvas.width = canvas.width
                previewCanvas.height = canvas.height
                
                const ctx = previewCanvas.getContext('2d')
                ctx.drawImage(canvas, 0, 0)
                
                // 更新预览信息
                document.getElementById('previewFormat').textContent = format.toUpperCase()
                document.getElementById('previewQuality').textContent = `${Math.round(quality * 100)}%`
                document.getElementById('previewSize').textContent = `${canvas.width} x ${canvas.height}`
                
                document.getElementById('previewModal').classList.add('show')
            }
        } catch (error) {
            console.error('预览失败:', error)
            this.updateStatus('error', `❌ 预览失败: ${error.message}`)
        }
    }

    /**
     * 隐藏预览模态框
     */
    hidePreview() {
        document.getElementById('previewModal').classList.remove('show')
    }

    /**
     * 下载图片
     */
    async downloadImage() {
        try {
            const format = document.getElementById('exportFormat').value
            const quality = parseFloat(document.getElementById('exportQuality').value)
            
            const options = {
                format: `image/${format}`,
                quality: quality
            }
            
            const blob = await this.cropper.getCroppedBlob(options)
            if (blob) {
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `cropped-image.${format}`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
                
                this.updateStatus('success', `✅ 图片已下载: cropped-image.${format}`)
            }
        } catch (error) {
            console.error('下载失败:', error)
            this.updateStatus('error', `❌ 下载失败: ${error.message}`)
        }
    }

    /**
     * 更新技术信息
     */
    updateTechInfo() {
        document.getElementById('eventCount').textContent = `${this.eventListenerCount} 个监听器`
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    try {
        new RealCropperDemo()
    } catch (error) {
        console.error('应用初始化失败:', error)
        document.getElementById('status').className = 'status error'
        document.getElementById('status').textContent = `❌ 应用初始化失败: ${error.message}`
    }
})

// 导出供调试使用
export { RealCropperDemo }
