/**
 * 背景图片获取工具
 * 支持从多个来源获取高质量背景图片
 */

export interface BackgroundImage {
  url: string
  title?: string
  copyright?: string
  width?: number
  height?: number
}

export interface BackgroundOptions {
  width?: number
  height?: number
  quality?: 'low' | 'medium' | 'high'
  category?: 'nature' | 'abstract' | 'minimal' | 'tech' | 'business'
  fallback?: string
}

/**
 * 从 Bing 每日壁纸 API 获取背景图片
 */
export async function getBingWallpaper(options: BackgroundOptions = {}): Promise<BackgroundImage> {
  try {
    const { width = 1920, height = 1080, quality = 'high' } = options

    // Bing 壁纸 API 端点
    const bingApi = 'https://www.bing.com/HPImageArchive.aspx'
    const params = new URLSearchParams({
      format: 'js',
      idx: '0', // 今日壁纸
      n: '1', // 获取1张
      mkt: 'zh-CN',
    })

    const response = await fetch(`${bingApi}?${params}`)
    const data = await response.json()

    if (data.images && data.images.length > 0) {
      const image = data.images[0]
      const baseUrl = 'https://www.bing.com'

      // 根据质量设置选择合适的分辨率
      let resolution = '1920x1080'
      if (quality === 'low')
        resolution = '1366x768'
      else if (quality === 'medium')
        resolution = '1600x900'
      else if (quality === 'high')
        resolution = '1920x1080'

      const imageUrl = `${baseUrl}${image.url}&w=${width}&h=${height}&rs=1&c=4`

      return {
        url: imageUrl,
        title: image.title,
        copyright: image.copyright,
        width,
        height,
      }
    }

    throw new Error('No images found from Bing API')
  }
  catch (error) {
    console.warn('Failed to fetch Bing wallpaper:', error)
    return getFallbackBackground(options)
  }
}

/**
 * 获取 Unsplash 随机图片
 */
export async function getUnsplashImage(options: BackgroundOptions = {}): Promise<BackgroundImage> {
  try {
    const { width = 1920, height = 1080, category = 'nature' } = options

    // Unsplash API (无需 API key 的公共端点)
    const unsplashApi = 'https://source.unsplash.com'
    const categoryMap = {
      nature: 'nature,landscape',
      abstract: 'abstract,pattern',
      minimal: 'minimal,clean',
      tech: 'technology,computer',
      business: 'business,office',
    }

    const query = categoryMap[category] || 'nature,landscape'
    const imageUrl = `${unsplashApi}/${width}x${height}/?${query}`

    return {
      url: imageUrl,
      width,
      height,
    }
  }
  catch (error) {
    console.warn('Failed to fetch Unsplash image:', error)
    return getFallbackBackground(options)
  }
}

/**
 * 获取本地渐变背景（作为备用方案）
 */
export function getFallbackBackground(options: BackgroundOptions = {}): BackgroundImage {
  const { category = 'nature' } = options

  const gradients = {
    nature: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    abstract: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    minimal: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    tech: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    business: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  }

  return {
    url: gradients[category] || gradients.nature,
    title: 'Gradient Background',
    width: 1920,
    height: 1080,
  }
}

/**
 * 智能背景获取器 - 按优先级尝试不同来源
 */
export async function getSmartBackground(options: BackgroundOptions = {}): Promise<BackgroundImage> {
  // 在开发环境中直接使用渐变背景，避免 CORS 问题
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log('Development mode: using fallback gradient background')
    return getFallbackBackground(options)
  }

  const sources = [
    () => getBingWallpaper(options),
    () => getUnsplashImage(options),
    () => Promise.resolve(getFallbackBackground(options)),
  ]

  for (const getBackground of sources) {
    try {
      const result = await getBackground()
      if (result.url) {
        return result
      }
    }
    catch (error) {
      console.warn('Background source failed, trying next...', error)
      continue
    }
  }

  // 最终备用方案
  return getFallbackBackground(options)
}

/**
 * 预加载背景图片
 */
export function preloadBackground(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (url.startsWith('linear-gradient')) {
      // 渐变背景无需预加载
      resolve()
      return
    }

    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load background: ${url}`))
    img.src = url
  })
}

/**
 * 缓存背景图片信息
 */
const backgroundCache = new Map<string, BackgroundImage>()

export function getCachedBackground(key: string): BackgroundImage | null {
  return backgroundCache.get(key) || null
}

export function setCachedBackground(key: string, background: BackgroundImage): void {
  backgroundCache.set(key, background)
}

/**
 * 带缓存的背景获取器
 */
export async function getCachedSmartBackground(
  cacheKey: string,
  options: BackgroundOptions = {},
): Promise<BackgroundImage> {
  // 检查缓存
  const cached = getCachedBackground(cacheKey)
  if (cached) {
    return cached
  }

  // 获取新背景
  const background = await getSmartBackground(options)

  // 缓存结果
  setCachedBackground(cacheKey, background)

  return background
}
