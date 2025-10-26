'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useData } from '@/contexts/data-context'
import { useMemo } from 'react'

export function RecentTransactions() {
  const { transactions } = useData()
  const recent = useMemo(() => {
    // Helper para parsear data corretamente (suporta DD-MM-AAAA e YYYY-MM-DD)
    const parseDate = (dateStr: string): number => {
      // Formato DD-MM-AAAA (novo formato brasileiro)
      if (typeof dateStr === 'string' && /^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
        const parts = dateStr.split('-')
        const day = Number(parts[0])
        const month = Number(parts[1]) - 1
        const year = Number(parts[2])
        return new Date(year, month, day).getTime()
      }
      
      // Formato YYYY-MM-DD (compatibilidade)
      if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        const parts = dateStr.split('-')
        const year = Number(parts[0])
        const month = Number(parts[1]) - 1
        const day = Number(parts[2])
        return new Date(year, month, day).getTime()
      }
      
      // Fallback: parse normal
      return new Date(dateStr).getTime()
    }

    return [...transactions]
      .sort((a, b) => parseDate(b.date) - parseDate(a.date))
      .slice(0, 5)
  }, [transactions])
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  transaction.type === 'income' 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-red-100 text-red-600'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
