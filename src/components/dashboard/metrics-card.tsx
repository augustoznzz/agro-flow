'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, MapPin } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useMemo } from 'react'

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
        return 'text-primary'
      case 'down':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
        <div className="flex-shrink-0">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${getTrendColor()} mt-1`}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardMetrics() {
  const { transactions, properties } = useData()

  const { totalBalance, monthlyIncome, monthlyExpenses, propertiesCount } = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    let incomeSum = 0
    let expenseSum = 0
    let monthIncome = 0
    let monthExpenses = 0

    for (const t of transactions) {
      if (t.type === 'income') {
        incomeSum += t.amount
      } else {
        expenseSum += t.amount
      }
      const d = new Date(t.date)
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
        if (t.type === 'income') monthIncome += t.amount
        else monthExpenses += t.amount
      }
    }

    return {
      totalBalance: incomeSum - expenseSum,
      monthlyIncome: monthIncome,
      monthlyExpenses: monthExpenses,
      propertiesCount: properties.length
    }
  }, [transactions, properties])

  const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const metrics = [
    {
      title: "Saldo Total",
      value: formatBRL(totalBalance),
      change: undefined,
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
      trend: totalBalance >= 0 ? 'up' as const : 'down' as const
    },
    {
      title: "Receita Mensal",
      value: formatBRL(monthlyIncome),
      change: undefined,
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
      trend: 'up' as const
    },
    {
      title: "Despesas Mensais",
      value: formatBRL(monthlyExpenses),
      change: undefined,
      icon: <TrendingDown className="h-4 w-4 text-muted-foreground" />,
      trend: 'down' as const
    },
    {
      title: "Propriedades",
      value: String(propertiesCount),
      change: undefined,
      icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
      trend: 'neutral' as const
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <MetricsCard key={index} {...metric} />
      ))}
    </div>
  )
}
