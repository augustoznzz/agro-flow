'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

const transactions = [
  { id: 1, description: 'Venda de Soja - Safra 2024', amount: 15000, type: 'income', date: '2024-01-15' },
  { id: 2, description: 'Compra de Fertilizantes', amount: 3200, type: 'expense', date: '2024-01-14' },
  { id: 3, description: 'Venda de Milho', amount: 8500, type: 'income', date: '2024-01-13' },
  { id: 4, description: 'Mão de obra - Plantio', amount: 1800, type: 'expense', date: '2024-01-12' },
  { id: 5, description: 'Subsídio Governamental', amount: 5000, type: 'income', date: '2024-01-10' },
]

export function RecentTransactions() {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
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
                <div>
                  <p className="text-sm font-medium">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className={`text-sm font-medium ${
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
