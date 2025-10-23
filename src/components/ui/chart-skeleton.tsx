import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] animate-pulse">
      <div className="h-full bg-gray-200 rounded-lg" />
    </div>
  )
}

export function ChartSkeletonCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Carregando...</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="w-full h-[300px] animate-pulse">
          <div className="h-full bg-gray-200 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
