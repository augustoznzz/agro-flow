'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '@/contexts/data-context'
import { useMemo } from 'react'

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function CashFlowChart() {
  const { transactions } = useData()

  const chartData = useMemo(() => {
    // Get current date and calculate 12 months back
    const now = new Date()
    const last12Months: { month: string; receitas: number; despesas: number; year: number; monthIndex: number }[] = []

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthIndex = date.getMonth()
      const year = date.getFullYear()
      
      last12Months.push({
        month: monthNames[monthIndex],
        receitas: 0,
        despesas: 0,
        year: year,
        monthIndex: monthIndex
      })
    }

    // Helper para parsear data corretamente (sem timezone ambiguidade)
    const parseDate = (dateStr: string): { year: number; month: number } => {
      // Se for string ISO, extrai ano e mês sem interpretar timezone
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const parts = dateStr.split('-')
        return {
          year: Number(parts[0]),
          month: Number(parts[1]) - 1 // 0-indexed
        }
      }
      // Fallback: criar Date normalmente
      const d = new Date(dateStr)
      return {
        year: d.getFullYear(),
        month: d.getMonth()
      }
    }

    // Aggregate transactions by month
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        if (transaction && transaction.date && transaction.amount !== undefined) {
          const { year: transactionYear, month: transactionMonth } = parseDate(transaction.date)
          const amount = Number(transaction.amount)

          // Find the corresponding month in our array
          const monthData = last12Months.find(
            m => m.year === transactionYear && m.monthIndex === transactionMonth
          )

          if (monthData && isFinite(amount) && amount > 0) {
            if (transaction.type === 'income') {
              monthData.receitas += amount
            } else if (transaction.type === 'expense') {
              monthData.despesas += amount
            }
          }
        }
      })
    }

    // Return only month name and values for the chart
    return last12Months.map(({ month, receitas, despesas }) => ({
      month,
      receitas,
      despesas
    }))
  }, [transactions])

  const niceMax = (value: number) => {
    if (!isFinite(value) || value <= 0) return 1
    const pow10 = Math.pow(10, Math.floor(Math.log10(value)))
    const normalized = value / pow10
    let niceNorm = 1
    if (normalized <= 1) niceNorm = 1
    else if (normalized <= 2) niceNorm = 2
    else if (normalized <= 5) niceNorm = 5
    else niceNorm = 10
    return niceNorm * pow10
  }

  const formatCurrencyCompact = (n: number) => {
    if (!isFinite(n)) return 'R$ 0'
    if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
    if (n >= 1_000) return `R$ ${(n / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
    return `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  }

  const yMaxRaw = useMemo(() => {
    return chartData.reduce((max, d) => {
      const r = Number(d.receitas) || 0
      const e = Number(d.despesas) || 0
      return Math.max(max, r, e)
    }, 0)
  }, [chartData])

  const yMax = useMemo(() => niceMax(yMaxRaw <= 0 ? 1 : yMaxRaw), [yMaxRaw])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Fluxo de Caixa - Últimos 12 Meses</CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="w-full" style={{ minHeight: 240 }}>
          <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              domain={[0, yMax]}
              tickFormatter={(v) => formatCurrencyCompact(Number(v))}
              tickCount={6}
            />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${Number(value).toLocaleString('pt-BR')}`,
                name === 'receitas' ? 'Receitas' : 'Despesas'
              ]}
              contentStyle={{ 
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="receitas" 
              stroke="#10b981" 
              strokeWidth={2}
              name="receitas"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="despesas"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
