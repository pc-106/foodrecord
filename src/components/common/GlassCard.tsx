import React, { useRef, useState, useCallback } from 'react'
import styles from './GlassCard.module.css'

interface GlassCardProps {
  children: React.ReactNode
  variant?: 'light' | 'dark'
  className?: string
  onClick?: () => void
  padding?: 'none' | 'small' | 'medium' | 'large'
}

const GlassCard: React.FC<GlassCardProps> = ({
  children, variant = 'dark', className, onClick, padding = 'medium',
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [glare, setGlare] = useState({ x: 50, y: 50, o: 0 })

  const handleMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    setGlare({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
      o: 0.15,
    })
  }, [])

  const handleLeave = useCallback(() => setGlare({ x: 50, y: 50, o: 0 }), [])

  return (
    <div
      ref={ref}
      className={[styles.card, styles[variant], styles[`pad-${padding}`], className].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        ['--glare-x' as string]: `${glare.x}%`,
        ['--glare-y' as string]: `${glare.y}%`,
        ['--glare-o' as string]: `${glare.o}`,
      }}
    >
      <div className={styles.glare} />
      {children}
    </div>
  )
}

export default GlassCard
