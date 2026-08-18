import { cn } from '@/lib/utils/cn'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftElement, rightElement, className, id, style, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: 'rgb(160 160 176)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftElement && (
            <div style={{
              position: 'absolute',
              left: '12px',
              color: 'rgb(100 100 115)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}>
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn('personal-os-input', className)}
            style={{
              width: '100%',
              height: '40px',
              borderRadius: '10px',
              paddingLeft: leftElement ? '36px' : '12px',
              paddingRight: rightElement ? '36px' : '12px',
              fontSize: '14px',
              background: 'rgb(24 24 32)',
              border: `1px solid ${error ? 'rgb(239 68 68 / 0.5)' : 'rgb(255 255 255 / 0.08)'}`,
              color: 'rgb(242 242 248)',
              outline: 'none',
              transition: 'border-color 150ms',
              ...style,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgb(99 102 241 / 0.6)'
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? 'rgb(239 68 68 / 0.5)' : 'rgb(255 255 255 / 0.08)'
              props.onBlur?.(e)
            }}
            {...props}
          />
          {rightElement && (
            <div style={{
              position: 'absolute',
              right: '12px',
              color: 'rgb(100 100 115)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}>
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p style={{ fontSize: '12px', color: 'rgb(248 113 113)' }}>{error}</p>
        )}
        {hint && !error && (
          <p style={{ fontSize: '12px', color: 'rgb(100 100 115)' }}>{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
