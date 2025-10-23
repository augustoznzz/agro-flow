export function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] animate-pulse">
      <div className="h-full bg-gray-200 rounded-lg" />
    </div>
  )
}

export function ChartSkeletonCard() {
  return (
    <div className="w-full">
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
        <div className="w-full h-[300px] animate-pulse">
          <div className="h-full bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
