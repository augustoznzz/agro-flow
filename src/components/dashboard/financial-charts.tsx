'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  notes?: string
  status?: 'pending' | 'completed' | 'cancelled'
  project?: string
  client?: string
  isRecurring?: boolean
  recurrenceType?: 'monthly' | 'yearly' | 'weekly'
  attachments?: string[]
}

interface FinancialChartsProps {
  transactions: Transaction[]
}

export function FinancialCharts({ transactions }: FinancialChartsProps) {
  // Processar dados para gráficos
  const getMonthlyData = () => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {}
    
    transactions.forEach(transaction => {
      const month = new Date(transaction.date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 }
      }
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount
      } else {
        monthlyData[month].expense += transaction.amount
      }
    })
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense
    }))
  }

  const getCategoryData = () => {
    const categoryData: { [key: string]: { income: number; expense: number } } = {}
    
    transactions.forEach(transaction => {
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = { income: 0, expense: 0 }
      }
      if (transaction.type === 'income') {
        categoryData[transaction.category].income += transaction.amount
      } else {
        categoryData[transaction.category].expense += transaction.amount
      }
    })
    
    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      income: data.income,
      expense: data.expense,
      total: data.income + data.expense
    })).sort((a, b) => b.total - a.total)
  }

  const monthlyData = getMonthlyData()
  const categoryData = getCategoryData()
  const maxAmount = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense)))

  // Cores para categorias
  const categoryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  return (
    <div className="space-y-6">
      {/* Gráfico de Evolução Temporal */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            Evolução Financeira
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96 relative bg-gradient-to-b from-gray-50 to-white rounded-lg">
            {/* Grid de fundo sutil */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className="absolute w-full border-t border-gray-200"
                  style={{ top: `${(i + 1) * 20}%` }}
                />
              ))}
            </div>
            
            {/* Área de dados */}
            <div className="absolute inset-0 flex items-end justify-between px-6 pb-8">
              {monthlyData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center group">
                  {/* Container das barras */}
                  <div className="flex flex-col items-center space-y-1 mb-2">
                    {/* Receitas - com gradiente e sombra sutil */}
                    <div 
                      className="w-12 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg shadow-sm transition-all duration-700 hover:shadow-md hover:scale-105 cursor-pointer"
                      style={{ 
                        height: `${(data.income / maxAmount) * 240}px`,
                        minHeight: data.income > 0 ? '6px' : '0px'
                      }}
                      title={`Receitas: R$ ${data.income.toLocaleString('pt-BR')}`}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-emerald-600 to-emerald-300 rounded-t-lg opacity-80"></div>
                    </div>
                    
                    {/* Despesas - com gradiente e sombra sutil */}
                    <div 
                      className="w-12 bg-gradient-to-t from-rose-500 to-rose-400 rounded-b-lg shadow-sm transition-all duration-700 hover:shadow-md hover:scale-105 cursor-pointer"
                      style={{ 
                        height: `${(data.expense / maxAmount) * 240}px`,
                        minHeight: data.expense > 0 ? '6px' : '0px'
                      }}
                      title={`Despesas: R$ ${data.expense.toLocaleString('pt-BR')}`}
                    >
                      <div className="w-full h-full bg-gradient-to-t from-rose-600 to-rose-300 rounded-b-lg opacity-80"></div>
                    </div>
                  </div>
                  
                  {/* Label do mês */}
                  <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                    {data.month}
                  </span>
                  
                  {/* Valor total do mês */}
                  <div className="mt-1 text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
                    R$ {(data.income + data.expense).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Linha de saldo com gradiente */}
            <div className="absolute inset-0 flex items-end justify-between px-6 pb-8">
              {monthlyData.map((data, index) => (
                <div key={`balance-${data.month}`} className="flex flex-col items-center">
                  <div 
                    className="w-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-full shadow-sm transition-all duration-700 hover:shadow-md hover:scale-110 cursor-pointer"
                    style={{ 
                      height: `${Math.max(0, (data.balance / maxAmount) * 240)}px`,
                      minHeight: data.balance > 0 ? '3px' : '0px'
                    }}
                    title={`Saldo: R$ ${data.balance.toLocaleString('pt-BR')}`}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Legenda elegante */}
          <div className="flex justify-center space-x-8 mt-6">
            <div className="flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-emerald-700">Receitas</span>
            </div>
            <div className="flex items-center space-x-3 bg-rose-50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-rose-700">Despesas</span>
            </div>
            <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-full">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-medium text-blue-700">Saldo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-500" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.slice(0, 6).map((data, index) => {
                const percentage = (data.total / categoryData.reduce((sum, cat) => sum + cat.total, 0)) * 100
                return (
                  <div key={data.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{data.category}</span>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: categoryColors[index % categoryColors.length]
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Receitas: R$ {data.income.toLocaleString('pt-BR')}</span>
                      <span>Despesas: R$ {data.expense.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-500" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Margem de Lucro */}
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {(() => {
                    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
                    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
                    const margin = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0
                    return `${margin.toFixed(1)}%`
                  })()}
                </div>
                <p className="text-sm text-gray-600">Margem de Lucro</p>
              </div>

              {/* Crescimento Mensal */}
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(() => {
                    if (monthlyData.length < 2) return '0%'
                    const current = monthlyData[monthlyData.length - 1]
                    const previous = monthlyData[monthlyData.length - 2]
                    const growth = previous.balance > 0 ? ((current.balance - previous.balance) / previous.balance * 100) : 0
                    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`
                  })()}
                </div>
                <p className="text-sm text-gray-600">Crescimento Mensal</p>
              </div>

              {/* Transação Média */}
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  R$ {(() => {
                    const avgIncome = transactions.filter(t => t.type === 'income').length > 0 
                      ? transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) / transactions.filter(t => t.type === 'income').length
                      : 0
                    return avgIncome.toLocaleString('pt-BR')
                  })()}
                </div>
                <p className="text-sm text-gray-600">Receita Média</p>
              </div>

              {/* Eficiência de Categorias */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Categoria Mais Rentável</p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-green-800">
                    {categoryData.length > 0 ? categoryData[0].category : 'N/A'}
                  </p>
                  <p className="text-sm text-green-600">
                    R$ {categoryData.length > 0 ? categoryData[0].total.toLocaleString('pt-BR') : '0'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Comparação de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Análise de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {monthlyData.slice(-3).map((data, index) => (
              <div key={data.month} className="text-center space-y-3">
                <div className="text-lg font-medium text-gray-700">{data.month}</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Receitas</span>
                    <span className="text-sm font-medium">R$ {data.income.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Despesas</span>
                    <span className="text-sm font-medium">R$ {data.expense.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Saldo</span>
                      <span className={`text-sm font-bold ${data.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {data.balance.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Indicador visual de performance */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      data.balance >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.abs(data.balance) / maxAmount * 100)}%`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
