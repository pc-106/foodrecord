export interface ImageFile {
  file: File
  previewUrl: string
  width: number
  height: number
}

export interface ImageProcessOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

const DEFAULT_OPTIONS: ImageProcessOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'jpeg',
}

export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export async function compressImage(
  file: File,
  options: ImageProcessOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const img = await loadImageFromFile(file)
  const canvas = document.createElement('canvas')

  let { width, height } = img
  if (width > (opts.maxWidth || 1920)) {
    height = height * ((opts.maxWidth || 1920) / width)
    width = opts.maxWidth || 1920
  }
  if (height > (opts.maxHeight || 1920)) {
    width = width * ((opts.maxHeight || 1920) / height)
    height = opts.maxHeight || 1920
  }

  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, width, height)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob!),
      `image/${opts.format}`,
      opts.quality
    )
  })
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return loadImageFromUrl(URL.createObjectURL(file))
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const img = await loadImageFromFile(file)
  return { width: img.width, height: img.height }
}

export function createImagePreview(
  file: File
): Promise<ImageFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const previewUrl = reader.result as string
      const img = await loadImageFromUrl(previewUrl)
      resolve({
        file,
        previewUrl,
        width: img.width,
        height: img.height,
      })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function cropImageToSquare(
  file: File
): Promise<Blob> {
  return new Promise(async (resolve) => {
    const img = await loadImageFromFile(file)
    const size = Math.min(img.width, img.height)
    const sx = (img.width - size) / 2
    const sy = (img.height - size) / 2

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, sx, sy, size, size, 0, 0, 512, 512)

    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9)
  })
}

export function removeImageBackground(
  canvas: HTMLCanvasElement
): ImageData | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const corners = [
    { x: 0, y: 0 },
    { x: canvas.width - 1, y: 0 },
    { x: 0, y: canvas.height - 1 },
    { x: canvas.width - 1, y: canvas.height - 1 },
  ]

  let avgR = 0, avgG = 0, avgB = 0
  corners.forEach(({ x, y }) => {
    const i = (y * canvas.width + x) * 4
    avgR += data[i]; avgG += data[i + 1]; avgB += data[i + 2]
  })
  avgR /= 4; avgG /= 4; avgB /= 4

  const threshold = 60
  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - avgR)
    const dg = Math.abs(data[i + 1] - avgG)
    const db = Math.abs(data[i + 2] - avgB)
    if (dr < threshold && dg < threshold && db < threshold) {
      data[i + 3] = 0
    }
  }
  return imageData
}

/**
 * Make sticker: remove background + add white stroke outline
 * Returns a PNG data URL with transparent background and white outline
 */
export async function makeSticker(
  source: HTMLImageElement | HTMLVideoElement,
  options?: { maxSize?: number; strokeWidth?: number }
): Promise<string> {
  const maxSize = options?.maxSize || 512
  const strokeWidth = options?.strokeWidth || 2

  // Scale down
  const sw = source instanceof HTMLVideoElement ? source.videoWidth : source.width
  const sh = source instanceof HTMLVideoElement ? source.videoHeight : source.height
  const scale = Math.min(maxSize / sw, maxSize / sh, 1)
  const w = Math.round(sw * scale)
  const h = Math.round(sh * scale)

  // Draw source
  const canvas = document.createElement('canvas')
  canvas.width = w; canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source as any, 0, 0, w, h)

  // Remove background
  const imageData = removeImageBackground(canvas)
  if (!imageData) return canvas.toDataURL('image/png')
  ctx.putImageData(imageData, 0, 0)

  // Create white stroke via dilation
  // Make a copy of the alpha channel, dilate it, then draw white behind original
  const strokeCanvas = document.createElement('canvas')
  strokeCanvas.width = w + strokeWidth * 4
  strokeCanvas.height = h + strokeWidth * 4
  const sctx = strokeCanvas.getContext('2d')!

  // Draw white silhouette (dilated)
  sctx.globalCompositeOperation = 'source-over'
  for (let dy = -strokeWidth; dy <= strokeWidth; dy++) {
    for (let dx = -strokeWidth; dx <= strokeWidth; dx++) {
      if (dx === 0 && dy === 0) continue
      sctx.drawImage(canvas, strokeWidth * 2 + dx, strokeWidth * 2 + dy)
    }
  }
  // Fill the white silhouette
  sctx.globalCompositeOperation = 'source-in'
  sctx.fillStyle = '#FFFFFF'
  sctx.fillRect(0, 0, strokeCanvas.width, strokeCanvas.height)

  // Draw original image on top
  sctx.globalCompositeOperation = 'source-over'
  sctx.drawImage(canvas, strokeWidth * 2, strokeWidth * 2)

  return strokeCanvas.toDataURL('image/png')
}

/**
 * Apply sticker CSS filter: white outline + slight shadow for sticker feel
 */
export const STICKER_STYLE: React.CSSProperties = {
  filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.8)) drop-shadow(0 0 1px rgba(255,255,255,0.8)) drop-shadow(1px 1px 3px rgba(0,0,0,0.15))',
  borderRadius: '6px',
}

export function resizeImage(
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> {
  return compressImage(file, { maxWidth, maxHeight, quality: 0.9 })
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/heic,image/heif'
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.heic,.heif'
