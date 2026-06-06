import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const UPLOAD_DIR = path.resolve('../public/uploads')

// Ensure upload directory exists
await fs.mkdir(UPLOAD_DIR, { recursive: true })

export async function processImage(filePath: string, filename: string) {
  const baseName = path.parse(filename).name
  const outputWebp = path.join(UPLOAD_DIR, `${baseName}.webp`)
  const outputThumb = path.join(UPLOAD_DIR, `${baseName}_thumb.webp`)

  // Full size: 1024px, WebP, quality 80
  await sharp(filePath)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputWebp)

  // Thumbnail: 256px, WebP, quality 65
  await sharp(filePath)
    .resize(256, 256, { fit: 'cover' })
    .webp({ quality: 65 })
    .toFile(outputThumb)

  // Add white outline (for sticker effect)
  const outputSticker = path.join(UPLOAD_DIR, `${baseName}_sticker.webp`)
  await sharp(outputWebp)
    .composite([{
      input: Buffer.from(
        `<svg width="1024" height="1024">
          <rect x="2" y="2" width="1020" height="1020" rx="16" ry="16"
            fill="none" stroke="white" stroke-width="4" opacity="0.6"/>
        </svg>`
      ),
      top: 0, left: 0,
    }])
    .toFile(outputSticker)

  // Clean up original
  await fs.unlink(filePath).catch(() => {})

  return `/uploads/${baseName}.webp`
}
