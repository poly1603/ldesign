/**
 * Cropper Types
 */

// Toolbar types
export interface ToolbarButton {
  id: string
  title: string
  icon: string
  group: string
  action: () => void
  disabled?: boolean
}

export interface ToolbarOptions {
  visible?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right' | 'floating'
  groups?: string[]
  buttons?: string[]
  customButtons?: ToolbarButton[]
  showAdvanced?: boolean
  compact?: boolean
  theme?: 'light' | 'dark' | 'auto'
}

// View modes
export type ViewMode = 0 | 1 | 2 | 3

// Drag modes
export type DragMode = 'crop' | 'move' | 'none'

// Crop box styles
export type CropBoxStyle = 'default' | 'rounded' | 'circle' | 'minimal' | 'dotted' | 'solid' | 'gradient'

// Image formats
export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

// Canvas data
export interface CanvasData {
  left: number
  top: number
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
}

// Crop box data
export interface CropBoxData {
  left: number
  top: number
  width: number
  height: number
}

// Container data
export interface ContainerData {
  width: number
  height: number
}

// Image data
export interface ImageData {
  left: number
  top: number
  width: number
  height: number
  rotate: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  translateX: number
  translateY: number
  naturalWidth: number
  naturalHeight: number
  aspectRatio: number
}

// Crop data (event detail)
export interface CropData {
  x: number
  y: number
  width: number
  height: number
  rotate: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  translateX: number
  translateY: number
}

// Cropper options
export interface CropperOptions {
  // View mode
  viewMode?: ViewMode

  // Drag mode
  dragMode?: DragMode

  // Initial aspect ratio
  initialAspectRatio?: number

  // Aspect ratio
  aspectRatio?: number

  // Data (for restore)
  data?: Partial<CropData>

  // Preview elements
  preview?: string | Element | Element[]

  // Responsive
  responsive?: boolean

  // Restore
  restore?: boolean

  // Check cross origin
  checkCrossOrigin?: boolean

  // Check orientation
  checkOrientation?: boolean

  // Modal
  modal?: boolean

  // Guides
  guides?: boolean

  // Center
  center?: boolean

  // Highlight
  highlight?: boolean
  
  // Highlight opacity (0-1, default: 0.05)
  highlightOpacity?: number

  // Background
  background?: boolean
  
  // Modal opacity (0-1, default: 0.5)
  modalOpacity?: number

  // Auto crop
  autoCrop?: boolean

  // Auto crop area
  autoCropArea?: number
  
  // Initial crop box size ratio (relative to the smaller dimension)
  initialCropBoxSize?: number

  // Movable
  movable?: boolean

  // Rotatable
  rotatable?: boolean

  // Scalable
  scalable?: boolean

  // Skewable
  skewable?: boolean

  // Translatable
  translatable?: boolean

  // Zoomable
  zoomable?: boolean

  // Scale step for zoom
  scaleStep?: number

  // Theme color
  themeColor?: string

  // Crop box style
  cropBoxStyle?: CropBoxStyle

  // Toolbar options
  toolbar?: boolean | ToolbarOptions

  // History options
  history?: boolean | {
    maxSize?: number
    autoSave?: boolean
    saveInterval?: number
  }

  // Preset options
  presets?: boolean | {
    includeDefaults?: boolean
    customPresets?: any[]
  }

  // Zoom on touch
  zoomOnTouch?: boolean

  // Zoom on wheel
  zoomOnWheel?: boolean

  // Wheel zoom ratio
  wheelZoomRatio?: number

  // Crop box movable
  cropBoxMovable?: boolean

  // Crop box resizable
  cropBoxResizable?: boolean

  // Toggle drag mode on dblclick
  toggleDragModeOnDblclick?: boolean

  // Min container width
  minContainerWidth?: number

  // Min container height
  minContainerHeight?: number

  // Min canvas width
  minCanvasWidth?: number

  // Min canvas height
  minCanvasHeight?: number

  // Min crop box width
  minCropBoxWidth?: number

  // Min crop box height
  minCropBoxHeight?: number

  // Max crop box width
  maxCropBoxWidth?: number

  // Max crop box height
  maxCropBoxHeight?: number

  // Image source
  src?: string

  // Alt text
  alt?: string

  // Crossorigin attribute
  crossorigin?: string

  // Placeholder options
  placeholder?: {
    // Main text shown when no image
    text?: string
    // Subtitle or instruction text
    subtext?: string
    // Icon or image to show
    icon?: string
    // Enable click to upload
    clickToUpload?: boolean
    // Enable drag and drop
    dragAndDrop?: boolean
    // Accepted file types
    acceptedFiles?: string
    // Max file size in MB
    maxFileSize?: number
    // Custom class for styling
    className?: string
  }

  // Events
  ready?: (event: CustomEvent) => void
  cropstart?: (event: CustomEvent) => void
  cropmove?: (event: CustomEvent) => void
  cropend?: (event: CustomEvent) => void
  crop?: (event: CustomEvent) => void
  zoom?: (event: CustomEvent) => void
  upload?: (event: CustomEvent) => void
  uploadError?: (event: CustomEvent) => void
  onToolbarCrop?: (canvas: HTMLCanvasElement) => void
}

// Get cropped canvas options
export interface GetCroppedCanvasOptions {
  width?: number
  height?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  fillColor?: string
  fillBackground?: boolean
  cropShape?: string
  imageSmoothingEnabled?: boolean
  imageSmoothingQuality?: ImageSmoothingQuality
}

// Point
export interface Point {
  x: number
  y: number
}

// Rectangle
export interface Rectangle {
  left: number
  top: number
  width: number
  height: number
}

// Action types
export type Action =
  | 'all'
  | 'crop'
  | 'move'
  | 'zoom'
  | 'e'
  | 'w'
  | 's'
  | 'n'
  | 'se'
  | 'sw'
  | 'ne'
  | 'nw'

// Internal data structure
export interface InternalData {
  // Container
  container: HTMLElement

  // Canvas (image wrapper)
  canvas: HTMLCanvasElement | null

  // Crop box
  cropBox: HTMLDivElement | null

  // Image
  image: HTMLImageElement | null

  // Options
  options: CropperOptions

  // Canvas data
  canvasData: CanvasData | null

  // Crop box data
  cropBoxData: CropBoxData | null

  // Container data
  containerData: ContainerData | null

  // Image data
  imageData: ImageData | null

  // Initial canvas data
  initialCanvasData: CanvasData | null

  // Initial crop box data
  initialCropBoxData: CropBoxData | null

  // Initial image data
  initialImageData: ImageData | null

  // Is ready
  ready: boolean

  // Is cropping
  cropping: boolean

  // Current action
  action: Action

  // Is disabled
  disabled: boolean

  // Is limited
  limited: boolean

  // Pointer data
  pointer: Point

  // Wheel zoom timeout
  wheelZoomTimeout?: number
}

// Event types
export interface CropperEvent extends CustomEvent {
  detail: CropData
}

// Plugin interface
export interface CropperPlugin {
  name: string
  install: (cropper: any) => void
  [key: string]: any
}
