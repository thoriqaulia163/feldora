interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-feldora-surface-light rounded ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="card-polygon">
      <Skeleton className="h-52 rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}

export function SkeletonArticle() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-3/4" />
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

export function SkeletonCardGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
