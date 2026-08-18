'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: '#6366f1',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#f2f2f8',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#a0a0b0',
    border: '1px solid transparent',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#f2f2f8',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  },
}

const sizeStyles: Record<Size, React.CSSProperties> = {
  sm: { height: '32px', padding: '0 12px', fontSize: '12.5px', gap: '6px' },
  md: { height: '38px', padding: '0 16px', fontSize: '13.5px', gap: '8px' },
  lg: { height: '44px', padding: '0 20px', fontSize: '14.5px', gap: '8px' },
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className, style, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9px',
          fontWeight: 500,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.55 : 1,
          transition: 'all 120ms ease',
          ...variantStyles[variant],
          ...sizeStyles[size],
          ...style,
        }}
        onMouseEnter={(e) => {
          if (disabled || isLoading) return
          if (variant === 'primary') e.currentTarget.style.backgroundColor = '#4f52dd'
          if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
          if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
            e.currentTarget.style.color = '#f2f2f8'
          }
        }}
        onMouseLeave={(e) => {
          if (disabled || isLoading) return
          if (variant === 'primary') e.currentTarget.style.backgroundColor = '#6366f1'
          if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)'
          if (variant === 'ghost') {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = '#a0a0b0'
          }
        }}
        {...props}
      >
        {isLoading ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
            <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        ) : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
