'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity, PieChart } from 'lucide-react'

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
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) return [] as Array<{ month: string; income: number; expense: number; balance: number; year: number; monthIndex: number }>

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

    const monthMap = new Map<string, { income: number; expense: number; year: number; monthIndex: number }>()

    let minYear = Infinity
    let minMonthIndex = 0
    let maxYear = -Infinity
    let maxMonthIndex = 0

    for (const t of transactions) {
      if (!t || !t.date || t.amount === undefined) continue
      
      const { year, month: monthIndex } = parseDate(t.date)
      const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}`

      if (!monthMap.has(key)) {
        monthMap.set(key, { income: 0, expense: 0, year, monthIndex })
      }
      const acc = monthMap.get(key)!
      const amt = Number(t.amount)
      if (isFinite(amt) && amt > 0) {
        if (t.type === 'income') acc.income += amt
        else if (t.type === 'expense') acc.expense += amt
      }

      if (year < minYear || (year === minYear && monthIndex < minMonthIndex)) {
        minYear = year
        minMonthIndex = monthIndex
      }
      if (year > maxYear || (year === maxYear && monthIndex > maxMonthIndex)) {
        maxYear = year
        maxMonthIndex = monthIndex
      }
    }

    const result: Array<{ month: string; income: number; expense: number; balance: number; year: number; monthIndex: number }> = []
    if (maxYear === -Infinity) return result

    let y = minYear
    let m = minMonthIndex
    while (y < maxYear || (y === maxYear && m <= maxMonthIndex)) {
      const key = `${y}-${String(m + 1).padStart(2, '0')}`
      const entry = monthMap.get(key) || { income: 0, expense: 0, year: y, monthIndex: m }
      const label = new Date(y, m, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
      result.push({
        month: label,
        income: entry.income,
        expense: entry.expense,
        balance: entry.income - entry.expense,
        year: y,
        monthIndex: m
      })
      m++
      if (m >= 12) { m = 0; y++ }
    }

    return result
  }

  const getNiceMax = (value: number) => {
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

  const getCategoryData = () => {
    const categoryData: { [key: string]: { income: number; expense: number } } = {}
    
    if (transactions && Array.isArray(transactions)) {
      transactions.forEach(transaction => {
        if (!transaction || !transaction.category || transaction.amount === undefined) return
        
        const amt = Number(transaction.amount)
        if (!isFinite(amt) || amt <= 0) return
        
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = { income: 0, expense: 0 }
        }
        if (transaction.type === 'income') {
          categoryData[transaction.category].income += amt
        } else if (transaction.type === 'expense') {
          categoryData[transaction.category].expense += amt
        }
      })
    }
    
    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      income: data.income,
      expense: data.expense,
      total: data.income + data.expense
    })).sort((a, b) => b.total - a.total)
  }

  const monthlyData = getMonthlyData()
  const categoryData = getCategoryData()
  const rawMax = monthlyData.length ? Math.max(...monthlyData.map(d => Math.max(Number(d.income) || 0, Number(d.expense) || 0))) : 0
  const yMax = getNiceMax(rawMax <= 0 ? 1 : rawMax)

  // Cores para categorias
  const categoryColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]

  return (
    <div className="space-y-6">
      {/* Gráfico de Barras Interativo */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 via-blue-50 to-indigo-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Análise Financeira Mensal</h3>
              <p className="text-sm text-slate-600 font-normal">Receitas, Despesas e Saldo por Período</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="relative">
            {/* Eixo Y com valores */}
            <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-slate-500">
              {[...Array(6)].map((_, i) => {
                const val = (yMax / 5) * (5 - i)
                return (
                  <div key={i} className="text-right pr-2">
                    {formatCurrencyCompact(val)}
                  </div>
                )
              })}
            </div>
            
            {/* Área do gráfico */}
            <div className="ml-16 h-80 relative mb-20">
              {/* Grid horizontal */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute w-full border-t border-slate-200"
                    style={{ top: `${i * 20}%` }}
                  />
                ))}
              </div>
              
              {/* Barras do gráfico */}
              <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                {monthlyData.map((data, index) => {
                  const incomeHeight = (data.income / yMax) * 100
                  const expenseHeight = (data.expense / yMax) * 100
                  const balanceHeight = Math.abs(data.balance / yMax) * 100
                  
                  return (
                    <div key={data.month} className="flex flex-col items-center group relative h-full">
                      {/* Container das barras */}
                      <div className="flex items-end space-x-1 h-full">
                        {/* Barra de Receitas */}
                        <div className="flex flex-col items-center group/income">
                          <div 
                            className="w-8 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-110 cursor-pointer relative overflow-visible"
                            style={{ 
                              height: `${incomeHeight}%`,
                              minHeight: data.income > 0 ? '8px' : '0px'
                            }}
                          >
                            {/* Efeito de brilho */}
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
                            
                            {/* Tooltip de Receitas */}
                            {data.income > 0 && (
                              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/income:opacity-100 transition-all duration-300 ease-out z-50">
                                <div className="bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-emerald-500 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Receitas
                                  </div>
                                  <div className="text-center font-bold text-sm">
                                    R$ {data.income.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                                {/* Seta do tooltip */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-emerald-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Barra de Despesas */}
                        <div className="flex flex-col items-center group/expense">
                          <div 
                            className="w-8 bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 rounded-t-lg shadow-lg transition-all duration-500 hover:shadow-xl hover:scale-110 cursor-pointer relative overflow-visible"
                            style={{ 
                              height: `${expenseHeight}%`,
                              minHeight: data.expense > 0 ? '8px' : '0px'
                            }}
                          >
                            {/* Efeito de brilho */}
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent"></div>
                            
                            {/* Tooltip de Despesas */}
                            {data.expense > 0 && (
                              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/expense:opacity-100 transition-all duration-300 ease-out z-50">
                                <div className="bg-rose-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border border-rose-500 whitespace-nowrap">
                                  <div className="flex items-center gap-1">
                                    <TrendingDown className="h-3 w-3" />
                                    Despesas
                                  </div>
                                  <div className="text-center font-bold text-sm">
                                    R$ {data.expense.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                  </div>
                                </div>
                                {/* Seta do tooltip */}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-rose-600"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Barra de Saldo (linha vertical) */}
                      <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 group/balance h-full flex items-end">
                        <div 
                          className={`w-1 rounded-full shadow-md transition-all duration-500 hover:shadow-lg hover:scale-125 cursor-pointer relative overflow-visible ${
                            data.balance >= 0 
                              ? 'bg-gradient-to-t from-blue-600 to-blue-400' 
                              : 'bg-gradient-to-t from-orange-600 to-orange-400'
                          }`}
                          style={{ 
                            height: `${Math.min(balanceHeight, 100)}%`,
                            minHeight: Math.abs(data.balance) > 0 ? '4px' : '0px'
                          }}
                        >
                          {/* Indicador de saldo */}
                          <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                            data.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}></div>
                        </div>
                        
                        {/* Tooltip de Saldo */}
                        {Math.abs(data.balance) > 0 && (
                          <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/balance:opacity-100 transition-all duration-300 ease-out z-50">
                            <div className={`text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg border whitespace-nowrap ${
                              data.balance >= 0 
                                ? 'bg-blue-600 border-blue-500' 
                                : 'bg-orange-600 border-orange-500'
                            }`}>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Saldo
                              </div>
                              <div className="text-center font-bold text-sm">
                                R$ {data.balance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                              </div>
                            </div>
                            {/* Seta do tooltip */}
                            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                              data.balance >= 0 ? 'border-t-blue-600' : 'border-t-orange-600'
                            }`}></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Label do mês */}
                      <div className="absolute -bottom-16 text-center w-20">
                        <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                          {data.month}
                        </div>
                        <div className="text-xs text-slate-500 group-hover:text-slate-600 transition-colors">
                          Total: R$ {(data.income + data.expense).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* Legenda interativa */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-semibold text-emerald-700">Receitas</span>
              <div className="text-xs text-emerald-600 bg-emerald-200 px-2 py-1 rounded-full">
                {transactions.filter(t => t.type === 'income').length} transações
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-rose-50 to-rose-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-semibold text-rose-700">Despesas</span>
              <div className="text-xs text-rose-600 bg-rose-200 px-2 py-1 rounded-full">
                {transactions.filter(t => t.type === 'expense').length} transações
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-semibold text-blue-700">Saldo Positivo</span>
            </div>
            <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-50 to-orange-100 px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-sm"></div>
              <span className="text-sm font-semibold text-orange-700">Saldo Negativo</span>
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
              <Activity className="h-5 w-5 text-orange-500" />
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
                      width: `${Math.min(100, Math.abs(data.balance) / yMax * 100)}%`
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
