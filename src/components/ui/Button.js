'use client'

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[6px] focus:outline-none focus:ring-2 focus:ring-amber disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const variantStyles = {
    primary: 'bg-ink text-white hover:bg-opacity-95',
    secondary: 'bg-transparent border border-ink text-ink hover:bg-ink hover:text-white',
    amber: 'bg-amber text-white hover:bg-opacity-95 font-semibold',
    ghost: 'bg-transparent text-slate hover:text-ink hover:bg-paper',
    danger: 'bg-rose text-white hover:bg-opacity-95',
    'danger-ghost': 'bg-transparent border border-rose text-rose hover:bg-rose hover:text-white',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
