import { useEffect, useRef } from 'react'
import styles from './LiquidGlassBackground.module.css'

/**
 * Apple 液态玻璃 — Iridescent 动态背景
 *
 * 多个大型渐变光球缓慢漂移，
 * 创造鲜艳多彩的 iridescent 背景，
 * 透过磨砂玻璃产生 vibrancy 效果。
 */
const LiquidGlassBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    let raf = 0

    // Dark tech orbs — neon cyan/green/purple
    const orbs = [
      { x: w * 0.2, y: h * 0.3, r: w * 0.55, dx: 0.08, dy: 0.05, color: [0, 180, 255],  alpha: 0.18 },
      { x: w * 0.7, y: h * 0.2, r: w * 0.50, dx: 0.05, dy: 0.07, color: [0, 255, 136],  alpha: 0.14 },
      { x: w * 0.5, y: h * 0.6, r: w * 0.60, dx: 0.06, dy: -0.04, color: [0, 212, 255],  alpha: 0.16 },
      { x: w * 0.1, y: h * 0.7, r: w * 0.45, dx: 0.09, dy: 0.03, color: [100, 60, 255],  alpha: 0.12 },
      { x: w * 0.8, y: h * 0.8, r: w * 0.55, dx: 0.04, dy: -0.06, color: [0, 212, 255],  alpha: 0.13 },
      { x: w * 0.4, y: h * 0.1, r: w * 0.40, dx: 0.07, dy: 0.08, color: [0, 255, 136],  alpha: 0.11 },
    ]

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0A0E14'
      ctx.fillRect(0, 0, w, h)

      for (const orb of orbs) {
        // 缓慢移动
        orb.x += orb.dx
        orb.y += orb.dy

        // 边界反弹
        const margin = orb.r * 0.6
        if (orb.x < -margin || orb.x > w + margin) orb.dx *= -1
        if (orb.y < -margin || orb.y > h + margin) orb.dy *= -1
        orb.x = Math.max(-margin * 2, Math.min(w + margin * 2, orb.x))
        orb.y = Math.max(-margin * 2, Math.min(h + margin * 2, orb.y))

        // 绘制 iridescent 光球 — 多层径向渐变
        const [rr, gg, bb] = orb.color

        // 外层：柔和扩散
        const outerGrad = ctx.createRadialGradient(orb.x, orb.y, orb.r * 0.2, orb.x, orb.y, orb.r)
        outerGrad.addColorStop(0, `rgba(${rr}, ${gg}, ${bb}, ${orb.alpha})`)
        outerGrad.addColorStop(0.3, `rgba(${rr}, ${gg}, ${bb}, ${orb.alpha * 0.7})`)
        outerGrad.addColorStop(0.6, `rgba(${rr}, ${gg}, ${bb}, ${orb.alpha * 0.3})`)
        outerGrad.addColorStop(1, 'rgba(245, 245, 247, 0)')
        ctx.fillStyle = outerGrad
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      for (const orb of orbs) {
        orb.x = Math.min(orb.x, w)
        orb.y = Math.min(orb.y, h)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}

export default LiquidGlassBackground
