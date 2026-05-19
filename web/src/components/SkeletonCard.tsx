interface SkeletonCardProps {
  rows?: number;
  className?: string;
}

export function SkeletonCard({ rows = 3, className = '' }: SkeletonCardProps) {
  return (
    <div className={`animate-pulse rounded-[28px] border border-white/80 bg-white/60 p-4 dark:border-[#4a372b] dark:bg-[#231914]/70 ${className}`}>
      <div className="h-4 w-2/3 rounded-full bg-[#ead9ca] dark:bg-[#4a372b]" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-3 rounded-full bg-[#f3e7da] dark:bg-[#33251a]" style={{ width: `${92 - index * 16}%` }} />
        ))}
      </div>
    </div>
  );
}
