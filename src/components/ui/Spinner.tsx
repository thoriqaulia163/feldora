interface SpinnerProps {
  size?: string
  className?: string
}

export function Spinner({ size = 'w-6 h-6', className = '' }: SpinnerProps) {
  return (
    <div className={`${size} border-2 border-feldora-border border-t-feldora-accent rounded-full animate-spin ${className}`} />
  )
}
