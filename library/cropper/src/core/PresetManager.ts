/**
 * Preset Manager for Cropper
 * Manages preset templates for common crop ratios and sizes
 */

import type { Cropper } from './Cropper'

export interface PresetTemplate {
  id: string
  name: string
  category: 'aspect' | 'size' | 'social' | 'document' | 'custom'
  aspectRatio?: number
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  icon?: string
  description?: string
}

export interface PresetOptions {
  includeDefaults?: boolean
  customPresets?: PresetTemplate[]
}

export class PresetManager {
  private cropper: Cropper
  private presets: Map<string, PresetTemplate> = new Map()
  private activePreset: string | null = null
  private options: Required<PresetOptions>

  constructor(cropper: Cropper, options: PresetOptions = {}) {
    this.cropper = cropper
    this.options = {
      includeDefaults: true,
      customPresets: [],
      ...options
    }

    this.initialize()
  }

  private initialize(): void {
    if (this.options.includeDefaults) {
      this.loadDefaultPresets()
    }

    if (this.options.customPresets.length > 0) {
      this.options.customPresets.forEach(preset => {
        this.addPreset(preset)
      })
    }
  }

  private loadDefaultPresets(): void {
    // Aspect Ratio Presets
    const aspectPresets: PresetTemplate[] = [
      {
        id: 'free',
        name: 'Free',
        category: 'aspect',
        description: 'No fixed aspect ratio'
      },
      {
        id: 'square',
        name: 'Square (1:1)',
        category: 'aspect',
        aspectRatio: 1,
        description: 'Perfect square'
      },
      {
        id: 'landscape-4-3',
        name: 'Landscape (4:3)',
        category: 'aspect',
        aspectRatio: 4 / 3,
        description: 'Classic landscape'
      },
      {
        id: 'landscape-16-9',
        name: 'Landscape (16:9)',
        category: 'aspect',
        aspectRatio: 16 / 9,
        description: 'Widescreen'
      },
      {
        id: 'landscape-21-9',
        name: 'Landscape (21:9)',
        category: 'aspect',
        aspectRatio: 21 / 9,
        description: 'Ultra-wide'
      },
      {
        id: 'portrait-3-4',
        name: 'Portrait (3:4)',
        category: 'aspect',
        aspectRatio: 3 / 4,
        description: 'Classic portrait'
      },
      {
        id: 'portrait-9-16',
        name: 'Portrait (9:16)',
        category: 'aspect',
        aspectRatio: 9 / 16,
        description: 'Phone portrait'
      }
    ]

    // Social Media Presets
    const socialPresets: PresetTemplate[] = [
      {
        id: 'facebook-post',
        name: 'Facebook Post',
        category: 'social',
        width: 1200,
        height: 630,
        aspectRatio: 1200 / 630,
        description: 'Optimal for Facebook feed'
      },
      {
        id: 'facebook-cover',
        name: 'Facebook Cover',
        category: 'social',
        width: 1640,
        height: 859,
        aspectRatio: 1640 / 859,
        description: 'Facebook cover photo'
      },
      {
        id: 'instagram-post',
        name: 'Instagram Post',
        category: 'social',
        width: 1080,
        height: 1080,
        aspectRatio: 1,
        description: 'Square Instagram post'
      },
      {
        id: 'instagram-story',
        name: 'Instagram Story',
        category: 'social',
        width: 1080,
        height: 1920,
        aspectRatio: 9 / 16,
        description: 'Instagram/Facebook story'
      },
      {
        id: 'twitter-post',
        name: 'Twitter Post',
        category: 'social',
        width: 1200,
        height: 675,
        aspectRatio: 16 / 9,
        description: 'Twitter in-stream photo'
      },
      {
        id: 'twitter-header',
        name: 'Twitter Header',
        category: 'social',
        width: 1500,
        height: 500,
        aspectRatio: 3,
        description: 'Twitter header image'
      },
      {
        id: 'youtube-thumbnail',
        name: 'YouTube Thumbnail',
        category: 'social',
        width: 1280,
        height: 720,
        aspectRatio: 16 / 9,
        description: 'YouTube video thumbnail'
      },
      {
        id: 'youtube-banner',
        name: 'YouTube Banner',
        category: 'social',
        width: 2560,
        height: 1440,
        aspectRatio: 16 / 9,
        description: 'YouTube channel banner'
      },
      {
        id: 'linkedin-post',
        name: 'LinkedIn Post',
        category: 'social',
        width: 1200,
        height: 1200,
        aspectRatio: 1,
        description: 'LinkedIn feed post'
      },
      {
        id: 'linkedin-cover',
        name: 'LinkedIn Cover',
        category: 'social',
        width: 1584,
        height: 396,
        aspectRatio: 4,
        description: 'LinkedIn background photo'
      }
    ]

    // Document Presets
    const documentPresets: PresetTemplate[] = [
      {
        id: 'a4-portrait',
        name: 'A4 Portrait',
        category: 'document',
        width: 210,
        height: 297,
        aspectRatio: 210 / 297,
        description: 'A4 paper portrait'
      },
      {
        id: 'a4-landscape',
        name: 'A4 Landscape',
        category: 'document',
        width: 297,
        height: 210,
        aspectRatio: 297 / 210,
        description: 'A4 paper landscape'
      },
      {
        id: 'letter-portrait',
        name: 'Letter Portrait',
        category: 'document',
        width: 216,
        height: 279,
        aspectRatio: 216 / 279,
        description: 'US Letter portrait'
      },
      {
        id: 'letter-landscape',
        name: 'Letter Landscape',
        category: 'document',
        width: 279,
        height: 216,
        aspectRatio: 279 / 216,
        description: 'US Letter landscape'
      }
    ]

    // Common Size Presets
    const sizePresets: PresetTemplate[] = [
      {
        id: 'passport-photo',
        name: 'Passport Photo',
        category: 'size',
        width: 35,
        height: 45,
        aspectRatio: 35 / 45,
        description: '35x45mm passport photo'
      },
      {
        id: 'thumbnail-small',
        name: 'Small Thumbnail',
        category: 'size',
        width: 150,
        height: 150,
        aspectRatio: 1,
        description: '150x150px thumbnail'
      },
      {
        id: 'thumbnail-medium',
        name: 'Medium Thumbnail',
        category: 'size',
        width: 300,
        height: 300,
        aspectRatio: 1,
        description: '300x300px thumbnail'
      },
      {
        id: 'hd-720p',
        name: 'HD 720p',
        category: 'size',
        width: 1280,
        height: 720,
        aspectRatio: 16 / 9,
        description: '1280x720 HD'
      },
      {
        id: 'fhd-1080p',
        name: 'Full HD 1080p',
        category: 'size',
        width: 1920,
        height: 1080,
        aspectRatio: 16 / 9,
        description: '1920x1080 Full HD'
      },
      {
        id: '4k-uhd',
        name: '4K UHD',
        category: 'size',
        width: 3840,
        height: 2160,
        aspectRatio: 16 / 9,
        description: '3840x2160 4K'
      }
    ]

    // Add all presets
    const allPresets = aspectPresets.concat(socialPresets, documentPresets, sizePresets)
    allPresets.forEach(preset => {
      this.addPreset(preset)
    })
  }

  public addPreset(preset: PresetTemplate): void {
    this.presets.set(preset.id, preset)
  }

  public removePreset(id: string): boolean {
    return this.presets.delete(id)
  }

  public getPreset(id: string): PresetTemplate | undefined {
    return this.presets.get(id)
  }

  public getAllPresets(): PresetTemplate[] {
    return Array.from(this.presets.values())
  }

  public getPresetsByCategory(category: string): PresetTemplate[] {
    return Array.from(this.presets.values()).filter(p => p.category === category)
  }

  public applyPreset(presetId: string): boolean {
    const preset = this.presets.get(presetId)
    if (!preset) {
      console.warn(`Preset '${presetId}' not found`)
      return false
    }

    try {
      const containerData = this.cropper.getContainerData()
      const imageData = this.cropper.getImageData()
      
      if (!containerData || !imageData) {
        console.error('Container or image data not available')
        return false
      }
      
      // Calculate the target aspect ratio
      const targetAspectRatio = preset.aspectRatio || (preset.width && preset.height ? preset.width / preset.height : NaN)
      
      // First, clear any existing aspect ratio to avoid conflicts
      this.cropper.setAspectRatio(NaN)
      
      // Calculate optimal crop box dimensions
      let cropWidth, cropHeight, cropLeft, cropTop
      
      if (!isNaN(targetAspectRatio)) {
        // We have a specific aspect ratio to maintain
        const containerAspect = containerData.width / containerData.height
        const maxWidth = Math.min(containerData.width * 0.85, imageData.width * 0.85)
        const maxHeight = Math.min(containerData.height * 0.85, imageData.height * 0.85)
        
        if (targetAspectRatio > 1) {
          // Landscape (width > height)
          if (targetAspectRatio > containerAspect) {
            // Preset is wider than container aspect
            cropWidth = maxWidth
            cropHeight = cropWidth / targetAspectRatio
          } else {
            // Preset is taller than container aspect
            cropHeight = maxHeight
            cropWidth = cropHeight * targetAspectRatio
          }
        } else if (targetAspectRatio < 1) {
          // Portrait (height > width)
          if (1 / targetAspectRatio > containerData.height / containerData.width) {
            // Preset is taller than container
            cropHeight = maxHeight
            cropWidth = cropHeight * targetAspectRatio
          } else {
            // Preset is wider than container
            cropWidth = maxWidth
            cropHeight = cropWidth / targetAspectRatio
          }
        } else {
          // Square (1:1)
          const size = Math.min(maxWidth, maxHeight)
          cropWidth = size
          cropHeight = size
        }
        
        // Final size check
        if (cropWidth > maxWidth) {
          cropWidth = maxWidth
          cropHeight = cropWidth / targetAspectRatio
        }
        if (cropHeight > maxHeight) {
          cropHeight = maxHeight
          cropWidth = cropHeight * targetAspectRatio
        }
        
        // Ensure minimum size
        const minSize = 50
        if (cropWidth < minSize || cropHeight < minSize) {
          if (targetAspectRatio > 1) {
            cropWidth = Math.max(minSize * targetAspectRatio, minSize)
            cropHeight = cropWidth / targetAspectRatio
          } else {
            cropHeight = Math.max(minSize / targetAspectRatio, minSize)
            cropWidth = cropHeight * targetAspectRatio
          }
        }
      } else {
        // No aspect ratio, use current crop box size or default
        const currentCrop = this.cropper.getCropBoxData()
        cropWidth = currentCrop?.width || containerData.width * 0.5
        cropHeight = currentCrop?.height || containerData.height * 0.5
      }
      
      // Center the crop box
      cropLeft = (containerData.width - cropWidth) / 2
      cropTop = (containerData.height - cropHeight) / 2
      
      // Ensure crop box is within bounds
      cropLeft = Math.max(0, Math.min(cropLeft, containerData.width - cropWidth))
      cropTop = Math.max(0, Math.min(cropTop, containerData.height - cropHeight))
      
      // Apply the crop box settings
      this.cropper.setCropBoxData({
        left: cropLeft,
        top: cropTop,
        width: cropWidth,
        height: cropHeight
      })
      
      // Now set the aspect ratio to lock it
      if (!isNaN(targetAspectRatio)) {
        this.cropper.setAspectRatio(targetAspectRatio)
      }
      
      console.log('Applied preset:', preset.name, {
        targetAspectRatio,
        cropBox: { 
          left: Math.round(cropLeft), 
          top: Math.round(cropTop), 
          width: Math.round(cropWidth), 
          height: Math.round(cropHeight) 
        },
        container: containerData,
        actualRatio: (cropWidth / cropHeight).toFixed(3)
      })
      

      // Apply min/max constraints
      if (preset.minWidth || preset.minHeight) {
        this.cropper.setOptions({
          minCropBoxWidth: preset.minWidth || 0,
          minCropBoxHeight: preset.minHeight || 0
        })
      }

      if (preset.maxWidth || preset.maxHeight) {
        // Note: Cropper.js doesn't have max crop box options by default
        // This would need custom implementation
      }

      this.activePreset = presetId
      
      // Dispatch preset applied event
      const event = new CustomEvent('preset:applied', {
        detail: { preset },
        bubbles: true
      })
      this.cropper.element.dispatchEvent(event)
      
      return true
    } catch (error) {
      console.error('Failed to apply preset:', error)
      return false
    }
  }

  public clearPreset(): void {
    this.cropper.setAspectRatio(NaN)
    this.activePreset = null
    
    // Dispatch preset cleared event
    const event = new CustomEvent('preset:cleared', {
      bubbles: true
    })
    this.cropper.element.dispatchEvent(event)
  }

  public getActivePreset(): PresetTemplate | null {
    if (this.activePreset) {
      return this.presets.get(this.activePreset) || null
    }
    return null
  }

  public isPresetActive(presetId: string): boolean {
    return this.activePreset === presetId
  }

  public exportCustomPresets(): string {
    const customPresets = Array.from(this.presets.values())
      .filter(p => p.category === 'custom')
    return JSON.stringify(customPresets, null, 2)
  }

  public importCustomPresets(json: string): boolean {
    try {
      const presets = JSON.parse(json)
      if (Array.isArray(presets)) {
        presets.forEach(preset => {
          if (preset.id && preset.name) {
            preset.category = 'custom'
            this.addPreset(preset)
          }
        })
        return true
      }
    } catch (error) {
      console.error('Failed to import presets:', error)
    }
    return false
  }

  public createCustomPreset(options: {
    name: string
    description?: string
    saveCurrentCrop?: boolean
  }): PresetTemplate {
    const id = `custom-${Date.now()}`
    const preset: PresetTemplate = {
      id,
      name: options.name,
      category: 'custom',
      description: options.description
    }

    // If saveCurrentCrop is true, capture current crop settings
    if (options.saveCurrentCrop) {
      const data = this.cropper.getData()
      const cropBoxData = this.cropper.getCropBoxData()
      
      if (data && cropBoxData) {
        preset.aspectRatio = cropBoxData.width / cropBoxData.height
        preset.width = Math.round(data.width)
        preset.height = Math.round(data.height)
      }
    }

    this.addPreset(preset)
    return preset
  }

  public destroy(): void {
    this.presets.clear()
    this.activePreset = null
  }
}