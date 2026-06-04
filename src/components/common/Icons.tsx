import React from 'react'

interface IconProps { size?: number; className?: string }

export const IconHome: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9.5L12 3l9 6.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)

export const IconChart: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/>
  </svg>
)

export const IconCompass: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>
  </svg>
)

export const IconUser: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/>
  </svg>
)

export const IconPlus: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
)

export const IconCamera: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="6" width="20" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6V4h8v2"/>
  </svg>
)

export const IconImage: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
  </svg>
)

export const IconBell: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

export const IconLock: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

export const IconTrash: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </svg>
)

export const IconChevronLeft: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 18l-6-6 6-6"/>
  </svg>
)

export const IconX: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
)

export const IconCheck: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 6L9 17l-5-5"/>
  </svg>
)

export const IconShield: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

export const IconRefresh: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
)

export const IconEye: React.FC<IconProps> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)

/* Food category placeholder illustrations — clean & minimal */
export const FoodIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 48 }) => {
  const s = size
  const svgProps = { width: s, height: s, viewBox: '0 0 64 64', fill: 'none' }
  switch (type) {
    case 'food':
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="30" fill="#FEF3E6"/>
          <ellipse cx="32" cy="28" rx="18" ry="13" fill="#FDE4C4"/>
          <ellipse cx="32" cy="36" rx="16" ry="5" fill="#FAD4A0"/>
          <ellipse cx="32" cy="28" rx="13" ry="9" fill="#FFF"/>
          <circle cx="26" cy="26" r="3" fill="#F5A623"/>
          <circle cx="36" cy="24" r="2.5" fill="#F5A623"/>
          <circle cx="32" cy="30" r="3" fill="#E8875B"/>
          <path d="M14 36 Q32 44 50 36" stroke="#E0C8A0" strokeWidth="1.5" fill="none"/>
        </svg>
      )
    case 'drink':
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="30" fill="#F0F6FF"/>
          <rect x="22" y="14" width="8" height="34" rx="4" fill="#D0E4FF"/>
          <rect x="30" y="10" width="16" height="38" rx="8" fill="#B0D4FF" opacity="0.5"/>
          <rect x="30" y="16" width="16" height="28" rx="6" fill="#E8F4FF"/>
          <rect x="34" y="20" width="8" height="18" rx="3" fill="#C8E8FF"/>
          <ellipse cx="38" cy="18" rx="4" ry="2" fill="#A0D0FF"/>
          <circle cx="36" cy="26" r="1.5" fill="#88C0EE"/>
          <circle cx="40" cy="30" r="1" fill="#88C0EE"/>
        </svg>
      )
    case 'snack':
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="30" fill="#FFF8F0"/>
          <ellipse cx="32" cy="38" rx="20" ry="16" fill="#FDE8D0"/>
          <ellipse cx="22" cy="30" rx="6" ry="8" fill="#F5C878" transform="rotate(-15 22 30)"/>
          <ellipse cx="36" cy="28" rx="7" ry="9" fill="#F5B860" transform="rotate(10 36 28)"/>
          <ellipse cx="48" cy="32" rx="6" ry="8" fill="#F5C878" transform="rotate(25 48 32)"/>
          <ellipse cx="30" cy="38" rx="5" ry="7" fill="#E8A850" transform="rotate(-5 30 38)"/>
        </svg>
      )
    case 'dessert':
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="30" fill="#FFF5F7"/>
          <path d="M10 28 Q32 12 54 28 L50 48 Q32 42 14 48Z" fill="#FDE0E8"/>
          <path d="M14 28 Q32 16 50 28 L48 42 Q32 36 16 42Z" fill="#F8C8D8"/>
          <circle cx="22" cy="26" r="2.5" fill="#E87890"/>
          <circle cx="32" cy="22" r="2.5" fill="#E87890"/>
          <circle cx="42" cy="26" r="2.5" fill="#E87890"/>
          <path d="M20 34 Q32 40 44 34" stroke="#E87890" strokeWidth="1" fill="none" strokeDasharray="3 2"/>
        </svg>
      )
    default:
      return (
        <svg {...svgProps}>
          <circle cx="32" cy="32" r="30" fill="#FDF9F0"/>
          <path d="M16 24 Q32 14 48 24 Q40 38 32 36 Q24 38 16 24Z" fill="#F0E4D0"/>
          <circle cx="26" cy="22" r="2" fill="#D4B896"/>
          <circle cx="38" cy="20" r="2" fill="#D4B896"/>
        </svg>
      )
  }
}
