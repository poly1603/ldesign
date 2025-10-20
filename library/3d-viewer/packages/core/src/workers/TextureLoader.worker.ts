/**
 * WebWorker for loading textures in background thread
 * Prevents blocking main thread during image loading
 */

interface LoadTextureMessage {
  type: 'load';
  url: string;
  id: string;
}

interface TextureLoadedMessage {
  type: 'loaded';
  id: string;
  imageData: ImageBitmap;
  width: number;
  height: number;
}

interface TextureErrorMessage {
  type: 'error';
  id: string;
  error: string;
}

self.onmessage = async (e: MessageEvent<LoadTextureMessage>) => {
  const { type, url, id } = e.data;

  if (type === 'load') {
    try {
      // Fetch image
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create ImageBitmap (GPU-accelerated)
      const imageBitmap = await createImageBitmap(blob, {
        premultiplyAlpha: 'none',
        colorSpaceConversion: 'none',
      });

      // Send back to main thread
      const message: TextureLoadedMessage = {
        type: 'loaded',
        id,
        imageData: imageBitmap,
        width: imageBitmap.width,
        height: imageBitmap.height,
      };

      self.postMessage(message, [imageBitmap] as any);
    } catch (error) {
      const errorMessage: TextureErrorMessage = {
        type: 'error',
        id,
        error: error instanceof Error ? error.message : String(error),
      };
      self.postMessage(errorMessage);
    }
  }
};

export {};

