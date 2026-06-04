import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { compressImage, isImageFile, ACCEPTED_IMAGE_TYPES, loadImageFromUrl } from '../utils/imageUtils'
import { IconX, IconCamera, IconImage, IconRefresh, IconCheck, IconChevronLeft } from '../components/common/Icons'
import styles from './Camera.module.css'

type CameraMode = 'idle' | 'camera' | 'preview' | 'cutout'
type FacingMode = 'environment' | 'user'

/* ---- 背景移除 (抠图) 核心算法 ---- */
function removeBackground(
  source: HTMLImageElement | HTMLVideoElement,
  threshold: number,
  feather: number
): string {
  const canvas = document.createElement('canvas')
  const maxDim = 1024
  const srcW = source instanceof HTMLVideoElement ? source.videoWidth : source.width
  const srcH = source instanceof HTMLVideoElement ? source.videoHeight : source.height
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH))
  const w = canvas.width = Math.round(srcW * scale)
  const h = canvas.height = Math.round(srcH * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(source, 0, 0, w, h)

  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  // ---- 1. 多区域背景采样 ----
  const sampleSize = Math.max(3, Math.floor(Math.min(w, h) * 0.02))
  const regions = [
    { x: 0, y: 0 }, { x: w - sampleSize, y: 0 },
    { x: 0, y: h - sampleSize }, { x: w - sampleSize, y: h - sampleSize },
    { x: Math.floor(w * 0.25), y: 0 }, { x: Math.floor(w * 0.75), y: 0 },
    { x: 0, y: Math.floor(h * 0.5) },
    { x: w - sampleSize, y: Math.floor(h * 0.5) },
  ]
  const bgSamples: number[] = []
  for (const region of regions) {
    for (let dy = 0; dy < sampleSize; dy++) {
      for (let dx = 0; dx < sampleSize; dx++) {
        const px = Math.min(w - 1, region.x + dx)
        const py = Math.min(h - 1, region.y + dy)
        const i = (py * w + px) * 4
        bgSamples.push(data[i], data[i + 1], data[i + 2])
      }
    }
  }
  // 去掉最亮和最暗的 10% 后取中位数
  const sorted = [...bgSamples].sort((a, b) => a - b)
  const trim = Math.floor(sorted.length * 0.1)
  const trimmed = sorted.slice(trim, sorted.length - trim)
  const bgR = trimmed.reduce((s, v, i) => i % 3 === 0 ? s + v : s, 0) / (trimmed.length / 3)
  const bgG = trimmed.reduce((s, v, i) => i % 3 === 1 ? s + v : s, 0) / (trimmed.length / 3)
  const bgB = trimmed.reduce((s, v, i) => i % 3 === 2 ? s + v : s, 0) / (trimmed.length / 3)
  const bgVariance = trimmed.reduce((s, v, i) => {
    const ref = i % 3 === 0 ? bgR : i % 3 === 1 ? bgG : bgB
    return s + (v - ref) ** 2
  }, 0) / (trimmed.length / 3)

  // ---- 2. 创建 alpha 蒙版 ----
  const alpha = new Uint8Array(w * h)
  const t2 = threshold * threshold * 3 * (1 + bgVariance / 10000)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const dr = data[i] - bgR, dg = data[i + 1] - bgG, db = data[i + 2] - bgB
      const dist = dr * dr + dg * dg + db * db
      if (dist >= t2) {
        alpha[y * w + x] = 255
      } else if (feather > 0 && dist > t2 * 0.5) {
        alpha[y * w + x] = Math.round(255 * ((dist - t2 * 0.5) / (t2 * 0.5)) * feather * 0.5)
      }
    }
  }

  // ---- 3. 边缘检测 + 白色修边描边 ----
  const outline = new Uint8Array(w * h)
  const outlineWidth = 1
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x
      if (alpha[idx] > 128) continue
      // 检查周围是否有前景像素
      for (let dy = -outlineWidth; dy <= outlineWidth; dy++) {
        for (let dx = -outlineWidth; dx <= outlineWidth; dx++) {
          if (alpha[(y + dy) * w + (x + dx)] > 128) {
            outline[idx] = 255
            break
          }
        }
        if (outline[idx]) break
      }
    }
  }

  // ---- 4. 应用 alpha + 白色描边到图像数据 ----
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const idx = y * w + x
      if (outline[idx] > 0 && alpha[idx] < 64) {
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 200
      } else {
        data[i + 3] = alpha[idx]
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL('image/png')
}

const Camera = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [mode, setMode] = useState<CameraMode>('idle')
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [flash, setFlash] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cutoutImage, setCutoutImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(50)
  const [feather, setFeather] = useState(0)

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => () => stopStream(), [])

  const startCamera = useCallback(async () => {
    setError(null)
    stopStream()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setMode('camera')
    } catch (err: any) {
      setError(err.name === 'NotAllowedError' ? '摄像头权限被拒绝' : `无法启动摄像头: ${err.message}`)
    }
  }, [facingMode, stopStream])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')!.drawImage(video, 0, 0)
    setFlash(true)
    setTimeout(() => setFlash(false), 300)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    setCutoutImage(null)
    setMode('preview')
    stopStream()
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    stopStream()
    setTimeout(() => startCamera(), 200)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !isImageFile(file)) return
    setError(null)
    const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1920, quality: 0.85 })
    const reader = new FileReader()
    reader.onload = () => {
      setCapturedImage(reader.result as string)
      setCutoutImage(null)
      setCapturedImage
      setMode('preview')
    }
    reader.readAsDataURL(compressed)
  }

  /* ---- 抠图处理 ---- */
  const processCutout = async () => {
    if (!capturedImage) return
    setMode('cutout')
    try {
      const img = await loadImageFromUrl(capturedImage)
      const result = removeBackground(img, threshold, feather)
      setCutoutImage(result)
    } catch {
      setError('抠图处理失败')
    }
  }

  const updateCutout = async () => {
    if (!capturedImage) return
    const img = await loadImageFromUrl(capturedImage)
    const result = removeBackground(img, threshold, feather)
    setCutoutImage(result)
  }

  /* ---- 上传 ---- */
  const handleUpload = async () => {
    const imageToSave = cutoutImage || capturedImage
    if (!imageToSave) return
    setIsUploading(true)
    sessionStorage.setItem('foodsnap_pending_image', imageToSave)
    navigate(-1)
    setIsUploading(false)
  }

  const retake = () => {
    setCapturedImage(null)
    setCutoutImage(null)
    startCamera()
  }

  const cancel = () => { stopStream(); navigate(-1) }

  return (
    <div className={styles.container}>
      <input ref={fileInputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} onChange={handleFileSelect} className={styles.hiddenInput} />
      <canvas ref={canvasRef} className={styles.hiddenCanvas} />

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError(null)} className={styles.errorClose}><IconX size={18} /></button>
        </div>
      )}

      {/* ========== 空闲：选择拍照/相册 ========== */}
      {mode === 'idle' && (
        <div className={styles.idleScreen}>
          <h1 className={styles.title}>拍摄食物照片</h1>
          <p className={styles.subtitle}>拍照后自动抠图，让食物更突出</p>
          <div className={styles.actionCards}>
            <div className={styles.actionCard} onClick={startCamera}>
              <div className={styles.actionIcon}><IconCamera size={40} /></div>
              <h2>拍照</h2>
              <p>使用相机拍摄食物</p>
            </div>
            <div className={styles.actionCard} onClick={() => fileInputRef.current?.click()}>
              <div className={styles.actionIcon}><IconImage size={40} /></div>
              <h2>相册</h2>
              <p>从相册选择图片</p>
            </div>
          </div>
          <button className="cam-link" onClick={cancel}>返回</button>
        </div>
      )}

      {/* ========== 相机取景 ========== */}
      {mode === 'camera' && (
        <div className={`${styles.cameraScreen} ${flash ? styles.flash : ''}`}>
          <div className={styles.cameraTop}>
            <button onClick={cancel} className={styles.cameraTopButton}><IconX size={24} /></button>
            <button onClick={switchCamera} className={styles.cameraTopButton}><IconRefresh size={24} /></button>
          </div>
          <div className={styles.viewfinder}>
            <video ref={videoRef} className={styles.video} playsInline muted autoPlay />
            <div className={styles.viewfinderOverlay}>
              <div className={styles.gridLine} style={{ top: '33%' }} />
              <div className={styles.gridLine} style={{ top: '66%' }} />
              <div className={styles.gridLine} style={{ left: '33%', transform: 'rotate(90deg)' }} />
              <div className={styles.gridLine} style={{ left: '66%', transform: 'rotate(90deg)' }} />
            </div>
          </div>
          <div className={styles.cameraBottom}>
            <button onClick={() => fileInputRef.current?.click()} className={styles.galleryButton}><IconImage size={28} /></button>
            <button onClick={capturePhoto} className={styles.captureButton}><div className={styles.captureButtonInner} /></button>
            <div className={styles.spacer} />
          </div>
        </div>
      )}

      {/* ========== 预览 ========== */}
      {mode === 'preview' && capturedImage && (
        <div className={styles.previewScreen}>
          <div className={styles.previewHeader}>
            <button onClick={retake} className={styles.previewHeaderButton}>
              <IconChevronLeft size={20} /> 重拍
            </button>
            <h2>预览</h2>
            <div className={styles.previewHeaderRight} />
          </div>
          <div className={styles.previewImageContainer}>
            <img src={capturedImage} alt="预览" className={styles.previewImage} />
          </div>
          <div className={styles.previewActions}>
            <button className="cam-outline" onClick={retake}>重拍</button>
            <button className="cam-primary" onClick={processCutout}>抠图处理</button>
          </div>
        </div>
      )}

      {/* ========== 抠图处理 ========== */}
      {mode === 'cutout' && capturedImage && (
        <div className={styles.cutoutScreen}>
          <div className={styles.previewHeader}>
            <button onClick={() => setMode('preview')} className={styles.previewHeaderButton}>
              <IconChevronLeft size={20} /> 返回
            </button>
            <h2>抠图处理</h2>
            <div className={styles.previewHeaderRight} />
          </div>

          {/* 对比预览 */}
          <div className={styles.cutoutCompare}>
            <div className={styles.cutoutPane}>
              <div className={styles.cutoutLabel}>原图</div>
              <img src={capturedImage} alt="原图" className={styles.cutoutImg} />
            </div>
            <div className={styles.cutoutPane}>
              <div className={styles.cutoutLabel}>抠图结果</div>
              <div className={styles.cutoutImgWrap}>
                {cutoutImage ? (
                  <img src={cutoutImage} alt="抠图结果" className={styles.cutoutImg} />
                ) : (
                  <div className={styles.cutoutLoading}>处理中...</div>
                )}
              </div>
            </div>
          </div>

          {/* 参数调节 */}
          <div className={styles.cutoutControls}>
            <div className={styles.controlRow}>
              <label className={styles.controlLabel}>
                识别阈值 <span className={styles.controlVal}>{threshold}</span>
              </label>
              <input
                type="range" min={20} max={100} step={5} value={threshold}
                onChange={e => { setThreshold(Number(e.target.value)); setTimeout(updateCutout, 100) }}
                className={styles.rangeSlider}
              />
              <div className={styles.controlHint}>值越小轮廓越干净利落</div>
            </div>
            <div className={styles.controlRow}>
              <label className={styles.controlLabel}>
                边缘柔化 <span className={styles.controlVal}>{feather}</span>
              </label>
              <input
                type="range" min={0} max={6} step={1} value={feather}
                onChange={e => { setFeather(Number(e.target.value)); setTimeout(updateCutout, 100) }}
                className={styles.rangeSlider}
              />
              <div className={styles.controlHint}>让抠图边缘更自然</div>
            </div>
          </div>

          <div className={styles.cutoutActions}>
            <button className="cam-outline" onClick={() => setMode('preview')}>放弃</button>
            <button className="cam-primary" onClick={handleUpload} disabled={isUploading}>
              <IconCheck size={18} /> 保存抠图
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Camera
