'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, MapPin } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string
  change?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricsCard({ title, value, change, icon, trend }: MetricsCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${getTrendColor()}`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardMetrics() {
  const metrics = [
    {
      title: "Saldo Total",
      value: "R$ 45.231,89",
      change: "+20.1% do último mês",
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      trend: 'up' as const
    },
    {
      title: "Receita Mensal",
      value: "R$ 12.234,00",
      change: "+15.3% do último mês",
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      trend: 'up' as const
    },
    {
      title: "Despesas Mensais",
      value: "R$ 8.234,00",
      change: "+2.1% do último mês",
      icon: <TrendingDown className="h-4 w-4 text-muted-foreground" />,
      trend: 'down' as const
    },
    {
      title: "Propriedades",
      value: "3",
      change: "2 ativas",
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      trend: 'neutral' as const
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricsCard key={index} {...metric} />
      ))}
    </div>
  )
}
